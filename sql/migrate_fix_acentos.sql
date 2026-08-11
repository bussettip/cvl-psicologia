-- Corrección de acentos corruptos en la tabla `libros`
-- Origen: datos almacenados con mojibake (Ý→í, ¾→ó, Ú→é, ß→á)
-- Fecha: 2026-08-11
SET NAMES utf8mb4;
UPDATE `libros` SET `titulo` = 'Guía de Autoayuda para la Depresión', `descripcion` = 'Estrategias basadas en activación conductual', `autor` = 'Dr. Roberto Sánchez' WHERE `id` = 5;
UPDATE `libros` SET `descripcion` = 'Guía completa de TCC para profesionales', `autor` = 'Dr. Juan Pérez' WHERE `id` = 1;
UPDATE `libros` SET `descripcion` = 'Ejercicios prácticos para pacientes con ansiedad', `autor` = 'Lic. María García' WHERE `id` = 2;
UPDATE `libros` SET `descripcion` = 'Técnicas de mindfulness aplicadas', `autor` = 'Dra. Laura Martínez' WHERE `id` = 3;
