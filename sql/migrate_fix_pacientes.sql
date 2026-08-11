-- Corrección de pacientes: se restauran las letras/tildes correctas (los caracteres estaban corruptos como "??")
-- Fecha: 2026-08-11
SET NAMES utf8mb4;
UPDATE `pacientes` SET `nombre`='Laura', `apellido`='Fernández', `motivo_consulta`='Ansiedad generalizada y ataques de pánico' WHERE `id`=1;
UPDATE `pacientes` SET `motivo_consulta`='Depresión post-parto' WHERE `id`=2;
UPDATE `pacientes` SET `nombre`='Sofía', `apellido`='Gutiérrez', `motivo_consulta`='Duelo por pérdida familiar', `diagnostico_inicial`='Reacción ante duelo patológico (F43.2)' WHERE `id`=3;
UPDATE `pacientes` SET `motivo_consulta`='Fobias sociales y evitación' WHERE `id`=4;
UPDATE `pacientes` SET `apellido`='Ramírez' WHERE `id`=5;
UPDATE `pacientes` SET `nombre`='Andrés', `motivo_consulta`='Burnout laboral y estrés crónico' WHERE `id`=6;
UPDATE `pacientes` SET `motivo_consulta`='Adicción a sustancias' WHERE `id`=8;
UPDATE `pacientes` SET `motivo_consulta`='Insomnio y dificultades de sueño' WHERE `id`=9;
UPDATE `pacientes` SET `motivo_consulta`='Trauma postraumático' WHERE `id`=10;
UPDATE `pacientes` SET `nombre`='Martín', `diagnostico_inicial`='Problemas de relación conyugal (Z63.0)' WHERE `id`=12;
UPDATE `pacientes` SET `diagnostico_inicial`='Trastorno de pánico (F41.0)' WHERE `id`=13;
UPDATE `pacientes` SET `motivo_consulta`='Depresión crónica' WHERE `id`=14;
UPDATE `pacientes` SET `apellido`='Peña', `motivo_consulta`='Estrés post-traumático laboral' WHERE `id`=16;
UPDATE `pacientes` SET `nombre`='Sebastián', `apellido`='Cortés', `motivo_consulta`='Ansiedad por separación', `diagnostico_inicial`='Trastorno de ansiedad por separación (F93.0)' WHERE `id`=18;
UPDATE `pacientes` SET `motivo_consulta`='Depresión y baja motivación' WHERE `id`=19;
UPDATE `pacientes` SET `diagnostico_inicial`='Reacción ante duelo (F43.2)' WHERE `id`=20;
