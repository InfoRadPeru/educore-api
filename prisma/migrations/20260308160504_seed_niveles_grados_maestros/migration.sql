-- This is an empty migration.
INSERT INTO niveles_maestros (id, nombre, orden, activo, created_at, updated_at) VALUES
  ('nivel_inicial',    'Inicial',    1, true, NOW(), NOW()),
  ('nivel_primaria',   'Primaria',   2, true, NOW(), NOW()),
  ('nivel_secundaria', 'Secundaria', 3, true, NOW(), NOW());

INSERT INTO grados_maestros (id, nivel_maestro_id, nombre, orden, activo, created_at, updated_at) VALUES
  ('grado_ini_3', 'nivel_inicial',    '3 años',        1, true, NOW(), NOW()),
  ('grado_ini_4', 'nivel_inicial',    '4 años',        2, true, NOW(), NOW()),
  ('grado_ini_5', 'nivel_inicial',    '5 años',        3, true, NOW(), NOW()),
  ('grado_pri_1', 'nivel_primaria',   '1° Primaria',   1, true, NOW(), NOW()),
  ('grado_pri_2', 'nivel_primaria',   '2° Primaria',   2, true, NOW(), NOW()),
  ('grado_pri_3', 'nivel_primaria',   '3° Primaria',   3, true, NOW(), NOW()),
  ('grado_pri_4', 'nivel_primaria',   '4° Primaria',   4, true, NOW(), NOW()),
  ('grado_pri_5', 'nivel_primaria',   '5° Primaria',   5, true, NOW(), NOW()),
  ('grado_pri_6', 'nivel_primaria',   '6° Primaria',   6, true, NOW(), NOW()),
  ('grado_sec_1', 'nivel_secundaria', '1° Secundaria', 1, true, NOW(), NOW()),
  ('grado_sec_2', 'nivel_secundaria', '2° Secundaria', 2, true, NOW(), NOW()),
  ('grado_sec_3', 'nivel_secundaria', '3° Secundaria', 3, true, NOW(), NOW()),
  ('grado_sec_4', 'nivel_secundaria', '4° Secundaria', 4, true, NOW(), NOW()),
  ('grado_sec_5', 'nivel_secundaria', '5° Secundaria', 5, true, NOW(), NOW());