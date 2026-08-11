-- Corrección de pacientes: se quitan los acentos (los caracteres acentuados estaban corruptos como "??")
-- Fecha: 2026-08-11
UPDATE `pacientes` SET `nombre`='Laura', `apellido`='Fernandez', `motivo_consulta`='Ansiedad generalizada y ataques de panico' WHERE `id`=1;
UPDATE `pacientes` SET `motivo_consulta`='Depresion post-parto' WHERE `id`=2;
UPDATE `pacientes` SET `nombre`='Sofia', `apellido`='Gutierrez', `motivo_consulta`='Duelo por perdida familiar', `diagnostico_inicial`='Reaccion ante duelo patologico (F43.2)' WHERE `id`=3;
UPDATE `pacientes` SET `motivo_consulta`='Fobias sociales y evitacion' WHERE `id`=4;
UPDATE `pacientes` SET `apellido`='Ramirez' WHERE `id`=5;
UPDATE `pacientes` SET `nombre`='Andres', `motivo_consulta`='Burnout laboral y estres cronico' WHERE `id`=6;
UPDATE `pacientes` SET `motivo_consulta`='Adiccion a sustancias' WHERE `id`=8;
UPDATE `pacientes` SET `motivo_consulta`='Insomnio y dificultades de sueno' WHERE `id`=9;
UPDATE `pacientes` SET `motivo_consulta`='Trauma postraumatico' WHERE `id`=10;
UPDATE `pacientes` SET `nombre`='Martin', `diagnostico_inicial`='Problemas de relacion conyugal (Z63.0)' WHERE `id`=12;
UPDATE `pacientes` SET `diagnostico_inicial`='Trastorno de panico (F41.0)' WHERE `id`=13;
UPDATE `pacientes` SET `motivo_consulta`='Depresion cronica' WHERE `id`=14;
UPDATE `pacientes` SET `apellido`='Pena', `motivo_consulta`='Estres post-traumatico laboral' WHERE `id`=16;
UPDATE `pacientes` SET `nombre`='Sebastian', `apellido`='Cortes', `motivo_consulta`='Ansiedad por separacion', `diagnostico_inicial`='Trastorno de ansiedad por separacion (F93.0)' WHERE `id`=18;
UPDATE `pacientes` SET `motivo_consulta`='Depresion y baja motivacion' WHERE `id`=19;
UPDATE `pacientes` SET `diagnostico_inicial`='Reaccion ante duelo (F43.2)' WHERE `id`=20;
