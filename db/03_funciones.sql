-- 03_funciones.sql
-- Funciones PL/pgSQL para registrar ventas y traspasos con control transaccional.

-- =========================================================
-- Función: registrar_venta
-- Registra una venta completa: valida stock, descuenta inventario (con bloqueo)
-- e inserta encabezado, detalle y bitácora. Se ejecuta dentro de una transacción.
-- Parámetros:
--   p_folio, p_id_sucursal, p_id_usuario, p_items (jsonb arreglo de {id_producto,cantidad,precio_unitario})
-- Retorna: id_venta generado.
-- =========================================================
CREATE OR REPLACE FUNCTION registrar_venta( -- crea o reemplaza la función registrar_venta
    p_folio       VARCHAR, -- folio único de la venta
    p_id_sucursal INT, -- sucursal donde se realiza la venta
    p_id_usuario  INT, -- usuario/cajero que registra la venta
    p_items       JSONB -- arreglo JSON con los renglones de la venta
) RETURNS INT AS $$ -- devuelve el id de la venta creada
DECLARE -- sección de declaración de variables locales
    v_id_venta    INT; -- almacenará el id de la venta insertada
    v_item        JSONB; -- variable para iterar cada elemento del arreglo
    v_id_producto INT; -- id del producto del renglón actual
    v_cantidad    INT; -- cantidad solicitada del renglón actual
    v_precio      NUMERIC(12,2); -- precio unitario del renglón actual
    v_stock       INT; -- stock actual leído con bloqueo
    v_subtotal    NUMERIC(12,2) := 0; -- acumulador del subtotal de la venta
    v_importe     NUMERIC(12,2); -- importe del renglón actual
BEGIN -- inicio del bloque ejecutable
    -- Inserta el encabezado de la venta con totales en cero (se actualizan al final)
    INSERT INTO venta (folio, id_sucursal, id_usuario, subtotal, total, estado) -- inserta en tabla venta
    VALUES (p_folio, p_id_sucursal, p_id_usuario, 0, 0, 'completada') -- valores iniciales de la venta
    RETURNING id_venta INTO v_id_venta; -- obtiene el id generado de la venta

    -- Recorre cada renglón recibido en el arreglo JSON
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP -- itera los elementos del JSON
        v_id_producto := (v_item->>'id_producto')::INT; -- extrae el id del producto
        v_cantidad    := (v_item->>'cantidad')::INT; -- extrae la cantidad solicitada
        v_precio      := (v_item->>'precio_unitario')::NUMERIC(12,2); -- extrae el precio unitario

        -- Bloquea la fila de inventario para evitar venta concurrente del mismo producto
        SELECT stock INTO v_stock -- lee el stock actual
        FROM inventario -- desde la tabla inventario
        WHERE id_sucursal = p_id_sucursal AND id_producto = v_id_producto -- para la sucursal y producto indicados
        FOR UPDATE; -- bloquea la fila hasta terminar la transacción (control de concurrencia)

        -- Valida que exista registro de inventario
        IF v_stock IS NULL THEN -- si no se encontró inventario
            RAISE EXCEPTION 'No existe inventario del producto % en la sucursal %', v_id_producto, p_id_sucursal; -- aborta con error
        END IF; -- fin de validación de existencia

        -- Valida que haya stock suficiente para la cantidad solicitada
        IF v_stock < v_cantidad THEN -- si el stock es menor a lo solicitado
            RAISE EXCEPTION 'Stock insuficiente para producto %: disponible %, solicitado %', v_id_producto, v_stock, v_cantidad; -- aborta con error
        END IF; -- fin de validación de stock

        -- Descuenta la cantidad vendida del inventario de la sucursal
        UPDATE inventario -- actualiza la tabla inventario
        SET stock = stock - v_cantidad, actualizado_en = NOW() -- resta stock y marca fecha de actualización
        WHERE id_sucursal = p_id_sucursal AND id_producto = v_id_producto; -- para el registro bloqueado

        v_importe  := v_cantidad * v_precio; -- calcula el importe del renglón
        v_subtotal := v_subtotal + v_importe; -- acumula el importe al subtotal

        -- Inserta el renglón de detalle de la venta
        INSERT INTO venta_detalle (id_venta, id_producto, cantidad, precio_unitario, importe) -- inserta detalle
        VALUES (v_id_venta, v_id_producto, v_cantidad, v_precio, v_importe); -- valores del renglón
    END LOOP; -- fin del recorrido de renglones

    -- Actualiza los totales del encabezado de la venta
    UPDATE venta SET subtotal = v_subtotal, total = v_subtotal -- asigna subtotal y total (sin impuestos adicionales en este modelo simple)
    WHERE id_venta = v_id_venta; -- para la venta recién creada

    -- Registra la operación en la bitácora
    INSERT INTO bitacora (tabla_afectada, operacion, id_registro, detalle, id_usuario) -- inserta en bitácora
    VALUES ('venta', 'VENTA', v_id_venta, jsonb_build_object('folio', p_folio, 'total', v_subtotal), p_id_usuario); -- detalle de la venta

    RETURN v_id_venta; -- devuelve el identificador de la venta registrada
END; -- fin del bloque ejecutable
$$ LANGUAGE plpgsql; -- indica que la función está escrita en PL/pgSQL

-- =========================================================
-- Función: registrar_traspaso
-- Registra un traspaso atómico: descuenta en origen y suma en destino.
-- Usa bloqueos FOR UPDATE en ambas filas de inventario para consistencia.
-- Parámetros:
--   p_folio, p_origen, p_destino, p_id_usuario, p_items (jsonb arreglo de {id_producto,cantidad})
-- Retorna: id_traspaso generado.
-- =========================================================
CREATE OR REPLACE FUNCTION registrar_traspaso( -- crea o reemplaza la función registrar_traspaso
    p_folio       VARCHAR, -- folio único del traspaso
    p_origen      INT, -- sucursal origen
    p_destino     INT, -- sucursal destino
    p_id_usuario  INT, -- usuario que registra el traspaso
    p_items       JSONB -- arreglo JSON con los productos a traspasar
) RETURNS INT AS $$ -- devuelve el id del traspaso creado
DECLARE -- sección de declaración de variables locales
    v_id_traspaso INT; -- almacenará el id del traspaso insertado
    v_item        JSONB; -- variable para iterar cada elemento del arreglo
    v_id_producto INT; -- id del producto del renglón actual
    v_cantidad    INT; -- cantidad a traspasar del renglón actual
    v_stock_origen INT; -- stock actual en origen leído con bloqueo
    v_existe_dest  INT; -- indicador de existencia de inventario en destino
BEGIN -- inicio del bloque ejecutable
    -- Valida que origen y destino sean distintos
    IF p_origen = p_destino THEN -- si las sucursales son iguales
        RAISE EXCEPTION 'La sucursal origen y destino no pueden ser la misma'; -- aborta con error
    END IF; -- fin de validación

    -- Inserta el encabezado del traspaso
    INSERT INTO traspaso (folio, sucursal_origen, sucursal_destino, id_usuario, estado) -- inserta en tabla traspaso
    VALUES (p_folio, p_origen, p_destino, p_id_usuario, 'completado') -- valores del traspaso
    RETURNING id_traspaso INTO v_id_traspaso; -- obtiene el id generado del traspaso

    -- Recorre cada producto a traspasar
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP -- itera los elementos del JSON
        v_id_producto := (v_item->>'id_producto')::INT; -- extrae el id del producto
        v_cantidad    := (v_item->>'cantidad')::INT; -- extrae la cantidad a traspasar

        -- Bloquea y lee el stock en la sucursal origen
        SELECT stock INTO v_stock_origen -- lee el stock de origen
        FROM inventario -- desde la tabla inventario
        WHERE id_sucursal = p_origen AND id_producto = v_id_producto -- para origen y producto
        FOR UPDATE; -- bloquea la fila de origen

        -- Valida existencia de inventario en origen
        IF v_stock_origen IS NULL THEN -- si no hay registro en origen
            RAISE EXCEPTION 'No existe inventario del producto % en origen %', v_id_producto, p_origen; -- aborta
        END IF; -- fin de validación

        -- Valida stock suficiente en origen
        IF v_stock_origen < v_cantidad THEN -- si no alcanza el stock
            RAISE EXCEPTION 'Stock insuficiente en origen para producto %: disponible %, solicitado %', v_id_producto, v_stock_origen, v_cantidad; -- aborta
        END IF; -- fin de validación

        -- Verifica si existe registro de inventario en destino y lo bloquea si existe
        SELECT stock INTO v_existe_dest -- intenta leer stock en destino
        FROM inventario -- desde la tabla inventario
        WHERE id_sucursal = p_destino AND id_producto = v_id_producto -- para destino y producto
        FOR UPDATE; -- bloquea la fila de destino si existe

        -- Descuenta la cantidad en la sucursal origen
        UPDATE inventario SET stock = stock - v_cantidad, actualizado_en = NOW() -- resta en origen
        WHERE id_sucursal = p_origen AND id_producto = v_id_producto; -- registro de origen

        -- Suma la cantidad en destino: crea el registro si no existía
        IF v_existe_dest IS NULL THEN -- si no había inventario en destino
            INSERT INTO inventario (id_sucursal, id_producto, stock) -- crea registro en destino
            VALUES (p_destino, v_id_producto, v_cantidad); -- con la cantidad recibida
        ELSE -- si ya existía inventario en destino
            UPDATE inventario SET stock = stock + v_cantidad, actualizado_en = NOW() -- suma en destino
            WHERE id_sucursal = p_destino AND id_producto = v_id_producto; -- registro de destino
        END IF; -- fin de actualización en destino

        -- Inserta el renglón de detalle del traspaso
        INSERT INTO traspaso_detalle (id_traspaso, id_producto, cantidad) -- inserta detalle
        VALUES (v_id_traspaso, v_id_producto, v_cantidad); -- valores del renglón
    END LOOP; -- fin del recorrido de renglones

    -- Registra la operación en la bitácora
    INSERT INTO bitacora (tabla_afectada, operacion, id_registro, detalle, id_usuario) -- inserta en bitácora
    VALUES ('traspaso', 'TRASPASO', v_id_traspaso, jsonb_build_object('folio', p_folio, 'origen', p_origen, 'destino', p_destino), p_id_usuario); -- detalle

    RETURN v_id_traspaso; -- devuelve el identificador del traspaso registrado
END; -- fin del bloque ejecutable
$$ LANGUAGE plpgsql; -- indica que la función está escrita en PL/pgSQL
