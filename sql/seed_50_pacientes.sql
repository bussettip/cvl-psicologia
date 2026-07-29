USE cvl_psicologia;

-- ============================================================
-- 30 PACIENTES ADICIONALES (ids 21-50)
-- ============================================================
INSERT INTO pacientes (nombre, apellido, fecha_nac, telefono, email, motivo_consulta, diagnostico_inicial, estado) VALUES
('Adriana', 'Molina', '1993-06-12', '555-1021', 'adriana.m@email.com', 'Estrés laboral crónico', 'Trastorno de Adaptación (F43.2)', 'activo'),
('Brenda', 'Rivas', '1987-09-25', '555-1022', 'brenda.r@email.com', 'Ansiedad social severa', 'Fobia Social (F40.1)', 'activo'),
('César', 'Navarro', '1991-03-18', '555-1023', 'cesar.n@email.com', 'Problemas de ira', 'Trastorno Explosivo Intermitente (F63.81)', 'activo'),
('Diana', 'Paredes', '1985-11-30', '555-1024', 'diana.p@email.com', 'Depresión post-divorcio', 'Episodio Depresivo Mayor (F32.2)', 'activo'),
('Eduardo', 'Salinas', '1994-07-08', '555-1025', 'eduardo.s@email.com', 'Adicción al juego', 'Juego Patológico (F63.0)', 'activo'),
('Fernanda', 'Orozco', '1989-02-14', '555-1026', 'fernanda.o@email.com', 'Trastorno alimenticio', 'Bulimia Nerviosa (F50.2)', 'activo'),
('Gustavo', 'Méndez', '1983-08-22', '555-1027', 'gustavo.m@email.com', 'Crisis de pánico recurrentes', 'Trastorno de Pánico (F41.0)', 'activo'),
('Helena', 'Cordero', '1996-04-05', '555-1028', 'helena.c@email.com', 'Baja autoestima', 'Trastorno Dismórfico Corporal (F45.22)', 'activo'),
('Ignacio', 'Villegas', '1988-12-15', '555-1029', 'ignacio.v@email.com', 'Estrés postraumático', 'TEPT (F43.10)', 'activo'),
('Julia', 'Bautista', '1992-01-20', '555-1030', 'julia.b@email.com', 'Trastorno obsesivo-compulsivo', 'TOC (F42)', 'activo'),
('Kevin', 'Zambrano', '1990-09-10', '555-1031', 'kevin.z@email.com', 'Problemas de pareja', 'Problema de Relación (Z63.0)', 'activo'),
('Liliana', 'Trujillo', '1986-05-28', '555-1032', 'liliana.t@email.com', 'Duelo no resuelto', 'Duelo Complicado (F43.2)', 'activo'),
('Mauricio', 'Pineda', '1995-10-03', '555-1033', 'mauricio.p@email.com', 'Ansiedad generalizada', 'TAG (F41.1)', 'activo'),
('Nadia', 'Solís', '1984-07-19', '555-1034', 'nadia.s@email.com', 'Depresión crónica', 'Distimia (F34.1)', 'activo'),
('Omar', 'Gallegos', '1993-11-25', '555-1035', 'omar.g@email.com', 'Estrés académico', 'Trastorno de Adaptación (F43.2)', 'activo'),
('Paola', 'Nieto', '1987-04-12', '555-1036', 'paola.n@email.com', 'Trastorno de ansiedad', 'TAG (F41.1)', 'activo'),
('Ramiro', 'Del Valle', '1991-08-30', '555-1037', 'ramiro.d@email.com', 'Adicción al alcohol', 'Dependencia de Alcohol (F10.20)', 'activo'),
('Sara', 'Espinoza', '1989-12-07', '555-1038', 'sara.e@email.com', 'Insomnio severo', 'Insomnio Primario (F51.0)', 'activo'),
('Tomás', 'Quintero', '1994-03-22', '555-1039', 'tomas.q@email.com', 'Estrés financiero', 'Trastorno de Adaptación (F43.2)', 'activo'),
('Úrsula', 'Valencia', '1986-06-15', '555-1040', 'ursula.v@email.com', 'Depresión postparto', 'Depresión Postparto (F53.0)', 'activo'),
('Víctor', 'Aguirre', '1992-02-28', '555-1041', 'victor.a@email.com', 'Fobia a volar', 'Fobia Específica (F40.2)', 'activo'),
('Wendy', 'Bravo', '1995-09-18', '555-1042', 'wendy.b@email.com', 'Problemas de comunicación', 'Trastorno de Personalidad Dependiente (F60.7)', 'activo'),
('Ximena', 'Rangel', '1988-11-05', '555-1043', 'ximena.r@email.com', 'Ansiedad por separación', 'Trastorno de Ansiedad por Separación (F93.0)', 'activo'),
('Yahir', 'Montero', '1990-07-14', '555-1044', 'yahir.m@email.com', 'Estrés laboral', 'Burnout (Z73.0)', 'activo'),
('Zulema', 'Castañeda', '1985-01-09', '555-1045', 'zulema.c@email.com', 'Trastorno de pánico', 'Trastorno de Pánico (F41.0)', 'activo'),
('Alan', 'Becerra', '1993-05-27', '555-1046', 'alan.b@email.com', 'Adicción al celular', 'Trastorno por Uso de Tecnología (F63.8)', 'activo'),
('Bárbara', 'Luján', '1987-10-11', '555-1047', 'barbara.l@email.com', 'Problemas alimenticios', 'Anorexia Nerviosa (F50.01)', 'activo'),
('Cristian', 'Ontiveros', '1991-12-31', '555-1048', 'cristian.o@email.com', 'Depresión existencial', 'Trastorno Depresivo Recurrente (F33.1)', 'activo'),
('Daniela', 'Miranda', '1994-08-16', '555-1049', 'daniela.m@email.com', 'Estrés postraumático', 'TEPT (F43.10)', 'activo'),
('Emilio', 'Rentería', '1989-04-23', '555-1050', 'emilio.r@email.com', 'Crisis existencial', 'Trastorno de Adaptación (F43.2)', 'activo');

-- ============================================================
-- ASIGNACIONES (50 pacientes a 5 psicólogas)
-- Psicólogas: Ana(id:4), María(id:5), Laura(id:6), José(id:7), Sofía(id:8)
-- 10 pacientes cada una
-- Programas: Ansiedad(1), Depresión(2), TOC(3), Duelo(4)
-- ============================================================

-- Ana García (4) - Pacientes 1-10, 21-24 (pacientes 1-10 ya asignados en seed original)
INSERT INTO asignaciones (id, paciente_id, psicologa_id, supervisor_id, programa_id, fecha_inicio, fecha_fin_estimada, sesion_actual, estado) VALUES
-- Nuevos pacientes para Ana
(13, 21, 4, 2, 1, '2026-04-01', '2026-07-01', 7, 'en_curso'),
(14, 22, 4, 3, 2, '2026-04-05', '2026-08-05', 6, 'en_curso'),
(15, 23, 4, 2, 1, '2026-04-10', '2026-07-10', 5, 'en_curso'),
(16, 24, 4, 3, 4, '2026-04-12', '2026-07-12', 4, 'en_curso');

-- María López (5) - Pacientes 2,5,8 + 25-30
INSERT INTO asignaciones (id, paciente_id, psicologa_id, supervisor_id, programa_id, fecha_inicio, fecha_fin_estimada, sesion_actual, estado) VALUES
(17, 25, 5, 2, 2, '2026-04-03', '2026-08-03', 8, 'en_curso'),
(18, 26, 5, 3, 3, '2026-04-07', '2026-08-07', 5, 'en_curso'),
(19, 27, 5, 2, 1, '2026-04-11', '2026-07-11', 6, 'en_curso'),
(20, 28, 5, 3, 4, '2026-04-15', '2026-07-15', 3, 'en_curso'),
(21, 29, 5, 2, 2, '2026-04-18', '2026-08-18', 4, 'en_curso'),
(22, 30, 5, 3, 1, '2026-04-20', '2026-07-20', 2, 'en_curso');

-- Laura Pérez (6) - Pacientes 3,6,9 + 31-36
INSERT INTO asignaciones (id, paciente_id, psicologa_id, supervisor_id, programa_id, fecha_inicio, fecha_fin_estimada, sesion_actual, estado) VALUES
(23, 31, 6, 2, 1, '2026-04-02', '2026-07-02', 7, 'en_curso'),
(24, 32, 6, 3, 2, '2026-04-06', '2026-08-06', 6, 'en_curso'),
(25, 33, 6, 2, 3, '2026-04-09', '2026-08-09', 4, 'en_curso'),
(26, 34, 6, 3, 1, '2026-04-14', '2026-07-14', 5, 'en_curso'),
(27, 35, 6, 2, 4, '2026-04-17', '2026-07-17', 3, 'en_curso'),
(28, 36, 6, 3, 2, '2026-04-21', '2026-08-21', 2, 'en_curso');

-- José Hernández (7) - Pacientes 10,11,13 + 37-42
INSERT INTO asignaciones (id, paciente_id, psicologa_id, supervisor_id, programa_id, fecha_inicio, fecha_fin_estimada, sesion_actual, estado) VALUES
(29, 37, 7, 2, 1, '2026-04-04', '2026-07-04', 6, 'en_curso'),
(30, 38, 7, 3, 2, '2026-04-08', '2026-08-08', 5, 'en_curso'),
(31, 39, 7, 2, 3, '2026-04-13', '2026-08-13', 4, 'en_curso'),
(32, 40, 7, 3, 1, '2026-04-16', '2026-07-16', 3, 'en_curso'),
(33, 41, 7, 2, 2, '2026-04-19', '2026-08-19', 2, 'en_curso'),
(34, 42, 7, 3, 4, '2026-04-22', '2026-07-22', 1, 'en_curso');

-- Sofía Morales (8) - Pacientes 14,15,16 + 43-50
INSERT INTO asignaciones (id, paciente_id, psicologa_id, supervisor_id, programa_id, fecha_inicio, fecha_fin_estimada, sesion_actual, estado) VALUES
(35, 43, 8, 2, 1, '2026-04-04', '2026-07-04', 5, 'en_curso'),
(36, 44, 8, 3, 2, '2026-04-09', '2026-08-09', 4, 'en_curso'),
(37, 45, 8, 2, 3, '2026-04-13', '2026-08-13', 6, 'en_curso'),
(38, 46, 8, 3, 1, '2026-04-17', '2026-07-17', 3, 'en_curso'),
(39, 47, 8, 2, 4, '2026-04-20', '2026-07-20', 2, 'en_curso'),
(40, 48, 8, 3, 2, '2026-04-23', '2026-08-23', 1, 'en_curso'),
(41, 49, 4, 2, 1, '2026-04-25', '2026-07-25', 0, 'en_curso'),
(42, 50, 5, 3, 2, '2026-04-26', '2026-08-26', 0, 'en_curso');

-- ============================================================
-- SESIONES para nuevos pacientes
-- Cada paciente tiene sesiones completadas según su sesion_actual
-- ============================================================

-- Ana García - Paciente 21 (Adriana Molina) - Asignación 13 - Prog Ansiedad - 7 sesiones
INSERT INTO sesiones (asignacion_id, numero_sesion, fecha_programada, fecha_real, meta_id, estado, duracion_minutos, temas_trabajados, observaciones_psicologa, desviacion, tipo_desviacion) VALUES
(13, 1, '2026-04-01', '2026-04-01', 1, 'completada', 50, 'Evaluación inicial, GAD-7=14', 'Paciente colaboradora', FALSE, 'ninguna'),
(13, 2, '2026-04-08', '2026-04-08', 2, 'completada', 45, 'Psicoeducación ansiedad', 'Buena comprensión del modelo', FALSE, 'ninguna'),
(13, 3, '2026-04-15', '2026-04-15', 3, 'completada', 50, 'Respiración diafragmática', 'Aprendió técnica rápidamente', FALSE, 'ninguna'),
(13, 4, '2026-04-22', '2026-04-22', 4, 'completada', 45, 'Mindfulness básico', 'Dificultad para concentrarse', TRUE, 'repeticion'),
(13, 5, '2026-04-29', '2026-04-29', 4, 'completada', 50, 'Refuerzo mindfulness', 'Mejoría significativa', FALSE, 'ninguna'),
(13, 6, '2026-05-06', '2026-05-06', 5, 'completada', 55, 'Pensamientos automáticos', 'Identifica distorsiones', FALSE, 'ninguna'),
(13, 7, '2026-05-13', '2026-05-13', 6, 'completada', 50, 'Reestructuración cognitiva', 'Progreso adecuado', FALSE, 'ninguna');

-- Ana García - Paciente 22 (Brenda Rivas) - Asignación 14 - Prog Depresión - 6 sesiones
INSERT INTO sesiones (asignacion_id, numero_sesion, fecha_programada, fecha_real, meta_id, estado, duracion_minutos, temas_trabajados, observaciones_psicologa, desviacion, tipo_desviacion) VALUES
(14, 1, '2026-04-05', '2026-04-05', 15, 'completada', 55, 'Evaluación PHQ-9=16', 'Paciente motivada', FALSE, 'ninguna'),
(14, 2, '2026-04-12', '2026-04-12', 16, 'completada', 50, 'Psicoeducación depresiva', 'Buena respuesta', FALSE, 'ninguna'),
(14, 3, '2026-04-19', '2026-04-26', 17, 'completada', 45, 'Activación conductual I', 'Reprogramada por enfermedad', FALSE, 'ninguna'),
(14, 4, '2026-04-26', '2026-04-26', 18, 'completada', 50, 'Activación conductual II', 'Completó tareas parcialmente', TRUE, 'retraso'),
(14, 5, '2026-05-03', '2026-05-03', 19, 'completada', 55, 'Rutina autocuidado', 'Mejor adherencia', FALSE, 'ninguna'),
(14, 6, '2026-05-10', '2026-05-10', 20, 'completada', 45, 'Pensamientos automáticos', 'Buen insight', FALSE, 'ninguna');

-- Ana García - Paciente 23 (César Navarro) - Asignación 15 - Prog Ansiedad - 5 sesiones
INSERT INTO sesiones (asignacion_id, numero_sesion, fecha_programada, fecha_real, meta_id, estado, duracion_minutos, temas_trabajados, observaciones_psicologa, desviacion, tipo_desviacion) VALUES
(15, 1, '2026-04-10', '2026-04-10', 1, 'completada', 50, 'Evaluación GAD-7=18', 'Paciente con mucha ansiedad', FALSE, 'ninguna'),
(15, 2, '2026-04-17', '2026-04-17', 2, 'completada', 45, 'Modelo de ansiedad', 'Comprende el ciclo', FALSE, 'ninguna'),
(15, 3, '2026-04-24', '2026-04-24', 3, 'completada', 50, 'Relajación muscular', 'Difícil para él', TRUE, 'repeticion'),
(15, 4, '2026-05-01', '2026-05-01', 3, 'completada', 50, 'Refuerzo relajación', 'Logró dominarlo', FALSE, 'ninguna'),
(15, 5, '2026-05-08', '2026-05-08', 4, 'completada', 55, 'Mindfulness', 'Buena práctica', FALSE, 'ninguna');

-- Ana García - Paciente 24 (Diana Paredes) - Asignación 16 - Prog Duelo - 4 sesiones
INSERT INTO sesiones (asignacion_id, numero_sesion, fecha_programada, fecha_real, meta_id, estado, duracion_minutos, temas_trabajados, observaciones_psicologa, desviacion, tipo_desviacion) VALUES
(16, 1, '2026-04-12', '2026-04-12', 43, 'completada', 60, 'Evaluación duelo por padre', 'Duelo reciente 2 meses', FALSE, 'ninguna'),
(16, 2, '2026-04-19', '2026-04-19', 44, 'completada', 50, 'Psicoeducación duelo', 'Catarsis emocional', FALSE, 'ninguna'),
(16, 3, '2026-04-26', '2026-04-26', 45, 'completada', 55, 'Narrativa de pérdida', 'Recuerdos significativos', FALSE, 'ninguna'),
(16, 4, '2026-05-03', '2026-05-03', 46, 'completada', 50, 'Expresión emocional', 'Procesando rabia', FALSE, 'ninguna');

-- María López - Paciente 25 (Eduardo Salinas) - Asignación 17 - Prog Depresión - 8 sesiones
INSERT INTO sesiones (asignacion_id, numero_sesion, fecha_programada, fecha_real, meta_id, estado, duracion_minutos, temas_trabajados, observaciones_psicologa, desviacion, tipo_desviacion) VALUES
(17, 1, '2026-04-03', '2026-04-03', 15, 'completada', 55, 'PHQ-9=20 severo', 'Paciente reservado', FALSE, 'ninguna'),
(17, 2, '2026-04-10', '2026-04-10', 16, 'completada', 50, 'Psicoeducación', 'Poco participativo', FALSE, 'ninguna'),
(17, 3, '2026-04-17', '2026-04-24', 17, 'completada', 45, 'Activación conductual', 'Reprogramó, resistente', TRUE, 'retraso'),
(17, 4, '2026-04-24', '2026-04-24', 17, 'completada', 50, 'Activación reforzada', 'Mejor disposición', FALSE, 'ninguna'),
(17, 5, '2026-05-01', '2026-05-01', 18, 'completada', 55, 'Rutinas', 'Progreso lento pero constante', FALSE, 'ninguna'),
(17, 6, '2026-05-08', '2026-05-08', 19, 'completada', 50, 'Autocuidado', 'Cambios positivos', FALSE, 'ninguna'),
(17, 7, '2026-05-15', '2026-05-15', 20, 'completada', 45, 'Pensamientos automáticos', 'Buen progreso', FALSE, 'ninguna'),
(17, 8, '2026-05-22', '2026-05-22', 21, 'completada', 50, 'Reestructuración cognitiva', 'Avance significativo', FALSE, 'ninguna');

-- María López - Paciente 26 (Fernanda Orozco) - Asignación 18 - Prog TOC - 5 sesiones
INSERT INTO sesiones (asignacion_id, numero_sesion, fecha_programada, fecha_real, meta_id, estado, duracion_minutos, temas_trabajados, observaciones_psicologa, desviacion, tipo_desviacion) VALUES
(18, 1, '2026-04-07', '2026-04-07', 29, 'completada', 55, 'Evaluación Y-BOCS=24', 'Rituales de limpieza', FALSE, 'ninguna'),
(18, 2, '2026-04-14', '2026-04-14', 30, 'completada', 50, 'Psicoeducación TOC', 'Buena comprensión', FALSE, 'ninguna'),
(18, 3, '2026-04-21', '2026-04-21', 31, 'completada', 55, 'Jerarquía de rituales', 'Identificó 8 rituales', FALSE, 'ninguna'),
(18, 4, '2026-04-28', '2026-04-28', 32, 'completada', 60, 'Exposición nivel bajo', 'Ansiedad alta pero controlable', FALSE, 'ninguna'),
(18, 5, '2026-05-05', '2026-05-05', 33, 'completada', 55, 'Exposición nivel medio', 'Progreso gradual', FALSE, 'ninguna');

-- Laura Pérez - Paciente 31 (Kevin Zambrano) - Asignación 23 - Prog Ansiedad - 7 sesiones
INSERT INTO sesiones (asignacion_id, numero_sesion, fecha_programada, fecha_real, meta_id, estado, duracion_minutos, temas_trabajados, observaciones_psicologa, desviacion, tipo_desviacion) VALUES
(23, 1, '2026-04-02', '2026-04-02', 1, 'completada', 50, 'Evaluación GAD-7=15', 'Ansiedad por trabajo', FALSE, 'ninguna'),
(23, 2, '2026-04-09', '2026-04-09', 2, 'completada', 45, 'Modelo ansiedad', 'Comprende bien', FALSE, 'ninguna'),
(23, 3, '2026-04-16', '2026-04-16', 3, 'completada', 50, 'Respiración diafragmática', 'Excelente progreso', FALSE, 'ninguna'),
(23, 4, '2026-04-23', '2026-04-23', 4, 'completada', 55, 'Relajación muscular', 'Muy receptivo', FALSE, 'ninguna'),
(23, 5, '2026-04-30', '2026-04-30', 5, 'completada', 50, 'Pensamientos automáticos', 'Identifica distorsiones', FALSE, 'ninguna'),
(23, 6, '2026-05-07', '2026-05-07', 6, 'completada', 55, 'Reestructuración cognitiva', 'Progreso notable', FALSE, 'ninguna'),
(23, 7, '2026-05-14', '2026-05-14', 7, 'completada', 50, 'Exposición gradual', 'Primera exposición exitosa', FALSE, 'ninguna');

-- ============================================================
-- ALERTAS DE DESVIACIÓN adicionales
-- ============================================================
INSERT INTO alertas_desviacion (asignacion_id, sesion_id, tipo, descripcion, detectada_por, gravedad, resuelta) VALUES
(13, 27, 'repeticion', 'Paciente con dificultad en mindfulness, requirió sesión extra de refuerzo', 4, 'baja', TRUE),
(14, 30, 'retraso', 'Reprogramación por enfermedad del paciente, retraso de 1 semana', 5, 'media', TRUE),
(15, 33, 'repeticion', 'Dificultad con relajación muscular, necesitó repetición', 4, 'baja', TRUE),
(17, 37, 'retraso', 'Paciente reprogramó, resistencia a activación conductual', 5, 'media', TRUE);

-- ============================================================
-- OBSERVACIONES DE SUPERVISIÓN
-- ============================================================
INSERT INTO observaciones_supervision (sesion_id, supervisor_id, observacion, tipo) VALUES
(27, 2, 'Buena decisión repetir mindfulness. Paciente ansioso necesita más práctica.', 'tecnica'),
(30, 3, 'Reprogramación válida. Evaluar adherencia del paciente en siguientes sesiones.', 'general'),
(33, 2, 'Paciente masculino con dificultad para técnicas de relajación. Considerar adaptaciones.', 'tecnica');

-- Reset auto_increment
ALTER TABLE asignaciones AUTO_INCREMENT = 43;
ALTER TABLE sesiones AUTO_INCREMENT = 58;
