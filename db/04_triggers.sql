-- 04_triggers.sql
-- Triggers de bitácora automática para operaciones sobre inventario y ventas.
-- (El descuento de stock se realiza en las funciones transaccionales de 03_funciones.sql;
--  aquí se auditan cambios relevantes mediante triggers.)

-- =========================================================
-- Función trigger: registra cambios de stock en inventario
-- =========================================================
CREATE OR REPLACE FUNCTION trg_bitacora_inventario() -- crea o reemplaza la función del trigger
RETURNS TRIGGER AS $$ -- el trigger devuelve un registro
BEGIN -- inicio del bloque ejecutable
    -- Si es actualización, registra stock anterior y nuevo
    IF TG_OP = 'UPDATE' THEN -- cuando la operación es UPDATE
        INSERT INTO bitacora (tabla_afectada, operacion, id_registro, detalle) -- inserta evento en bitácora
        VALUES ('inventario', 'UPDATE', NEW.id_inventario, -- tabla, operación y registro afectado
                jsonb_build_object('id_producto', NEW.id_producto, 'id_sucursal', NEW.id_sucursal, -- datos clave
                                   'stock_anterior', OLD.stock, 'stock_nuevo', NEW.stock)); -- cambio de stock
    END IF; -- fin del caso UPDATE
    -- Si es inserción, registra el nuevo registro de inventario
    IF TG_OP = 'INSERT' THEN -- cuando la operación es INSERT
        INSERT INTO bitacora (tabla_afectada, operacion, id_registro, detalle) -- inserta evento en bitácora
        VALUES ('inventario', 'INSERT', NEW.id_inventario, -- tabla, operación y registro afectado
                jsonb_build_object('id_producto', NEW.id_producto, 'id_sucursal', NEW.id_sucursal, 'stock', NEW.stock)); -- datos insertados
    END IF; -- fin del caso INSERT
    RETURN NEW; -- devuelve el registro nuevo para continuar la operación
END; -- fin del bloque ejecutable
$$ LANGUAGE plpgsql; -- indica lenguaje PL/pgSQL

-- Trigger que se ejecuta después de insertar o actualizar inventario
CREATE TRIGGER trg_inventario_bitacora -- nombre del trigger
AFTER INSERT OR UPDATE ON inventario -- se dispara tras insertar o actualizar en inventario
FOR EACH ROW EXECUTE FUNCTION trg_bitacora_inventario(); -- ejecuta la función por cada fila afectada

-- =========================================================
-- Función trigger: registra inserción de encabezados de venta
-- =========================================================
CREATE OR REPLACE FUNCTION trg_bitacora_venta() -- crea o reemplaza la función del trigger de ventas
RETURNS TRIGGER AS $$ -- el trigger devuelve un registro
BEGIN -- inicio del bloque ejecutable
    INSERT INTO bitacora (tabla_afectada, operacion, id_registro, detalle, id_usuario) -- inserta evento en bitácora
    VALUES ('venta', TG_OP, NEW.id_venta, -- tabla, operación y venta afectada
            jsonb_build_object('folio', NEW.folio, 'total', NEW.total, 'id_sucursal', NEW.id_sucursal), -- detalle de la venta
            NEW.id_usuario); -- usuario que realizó la venta
    RETURN NEW; -- devuelve el registro nuevo
END; -- fin del bloque ejecutable
$$ LANGUAGE plpgsql; -- indica lenguaje PL/pgSQL

-- Trigger que se ejecuta después de insertar una venta
CREATE TRIGGER trg_venta_bitacora -- nombre del trigger
AFTER INSERT ON venta -- se dispara tras insertar en venta
FOR EACH ROW EXECUTE FUNCTION trg_bitacora_venta(); -- ejecuta la función por cada fila afectada
