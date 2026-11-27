# Respaldo y recuperación a un punto en el tiempo (PITR) - PostgreSQL

> Ejecutar estos pasos en tu equipo y capturar resultados reales como evidencia (no inventar).

## Concepto
- **Respaldo base:** copia completa del clúster (`pg_basebackup`).
- **Archivado WAL:** PostgreSQL escribe cambios en WAL; al archivarlos se puede reproducir hasta un punto en el tiempo.
- **PITR:** restaurar respaldo base + aplicar WAL hasta una marca de tiempo/LSN deseada.

## Pasos de referencia (adaptar a Docker)
1. Configurar archivado en el contenedor (postgresql.conf / comandos):
   - `wal_level = replica`
   - `archive_mode = on`
   - `archive_command = 'cp %p /var/lib/postgresql/wal_archive/%f'` (crear carpeta y permisos)
   - Reiniciar contenedor.
2. Tomar respaldo base en el contenedor usado en la evidencia:
   - `docker exec pitr_src mkdir -p /var/lib/postgresql/wal_archive`
   - `docker exec pitr_src pg_basebackup -h 127.0.0.1 -U ferreteria -D /backup/base -Xs -P`
3. Generar cambios (insertar datos) y anotar la hora objetivo.
4. Simular fallo y restaurar en `pitr_restore`:
   - Reemplazar los datos por `/backup/base`, configurar `restore_command`, `recovery_target_time` y `recovery_target_action = 'promote'`.
   - Crear `recovery.signal` antes del primer arranque de `pitr_restore`.
   - Iniciar y verificar que los datos quedan en el punto solicitado.
5. Capturar comandos y resultados (hora objetivo, datos antes/después).

## Nota
En entornos Docker la ruta de datos y permisos varían según imagen; documenta exactamente lo que ejecutes. Esto cumple la evidencia de “sistemas de recuperación (respaldo y restauración/PITR)”.
