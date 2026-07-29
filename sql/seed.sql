-- ============================================================
-- CVL Psicologías - Datos de Ejemplo (Seed)
-- Ejecutar DESPUÉS de schema.sql
-- ============================================================
USE cvl_psicologia;

-- ============================================================
-- USUARIOS (1 líder + 2 supervisores + 10 psicólogas)
-- Password para todos: "password123"
-- Hash generado con bcrypt
-- ============================================================
INSERT INTO usuarios (email, password_hash, nombre, apellido, telefono, rol) VALUES
-- Líder
('carmen.ruiz@clinica.com', '$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy', 'Carmen', 'Ruiz', '555-0100', 'lider'),
-- Supervisores
('roberto.martin@clinica.com', '$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy', 'Roberto', 'Martín', '555-0101', 'supervisor'),
('elena.vargas@clinica.com', '$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy', 'Elena', 'Vargas', '555-0102', 'supervisor'),
-- Psicólogas
('ana.garcia@clinica.com', '$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy', 'Ana', 'García', '555-0201', 'psicologa'),
('maria.lopez@clinica.com', '$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy', 'María', 'López', '555-0202', 'psicologa'),
('laura.perez@clinica.com', '$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy', 'Laura', 'Pérez', '555-0203', 'psicologa'),
('jose.hernandez@clinica.com', '$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy', 'José', 'Hernández', '555-0204', 'psicologa'),
('sofia.morales@clinica.com', '$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy', 'Sofía', 'Morales', '555-0205', 'psicologa'),
('diego.ramirez@clinica.com', '$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy', 'Diego', 'Ramírez', '555-0206', 'psicologa'),
('valeria.torres@clinica.com', '$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy', 'Valeria', 'Torres', '555-0207', 'psicologa'),
('fernando.diaz@clinica.com', '$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy', 'Fernando', 'Díaz', '555-0208', 'psicologa'),
('camila.rios@clinica.com', '$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy', 'Camila', 'Ríos', '555-0209', 'psicologa'),
('pablo.silva@clinica.com', '$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy', 'Pablo', 'Silva', '555-0210', 'psicologa');

-- ============================================================
-- PACIENTES (20 pacientes de ejemplo)
-- ============================================================
INSERT INTO pacientes (nombre, apellido, fecha_nac, telefono, email, motivo_consulta, diagnostico_inicial, estado) VALUES
('Laura', 'Fernández', '1990-05-15', '555-1001', 'laura.f@email.com', 'Ansiedad generalizada y ataques de pánico', 'Trastorno de Ansiedad Generalizada (F41.1)', 'activo'),
('Carlos', 'Mendoza', '1985-08-22', '555-1002', 'carlos.m@email.com', 'Depresión post-parto', 'Episodio Depresivo Mayor (F32.1)', 'activo'),
('Sofía', 'Gutiérrez', '1992-11-03', '555-1003', NULL, 'Duelo por pérdida familiar', 'Reacción ante duelo patológico (F43.2)', 'activo'),
('Miguel', 'Torres', '1988-02-14', '555-1004', 'miguel.t@email.com', 'Fobias sociales y evitación', 'Fobia Social (F40.1)', 'activo'),
('Isabella', 'Ramírez', '1995-07-30', '555-1005', NULL, 'Trastorno obsesivo-compulsivo', 'TOC (F42)', 'activo'),
('Andrés', 'Castillo', '1982-12-18', '555-1006', 'andres.c@email.com', 'Burnout laboral y estrés crónico', 'Burnout (Z73.0)', 'activo'),
('Valentina', 'Reyes', '1993-04-25', '555-1007', NULL, 'Problemas de autoestima y asertividad', 'Trastorno de personalidad dependiente (F60.7)', 'activo'),
('Roberto', 'Vargas', '1979-09-10', '555-1008', 'roberto.v@email.com', 'Adicción a sustancias', 'Trastorno por uso de sustancias (F10.20)', 'activo'),
('Luciana', 'Medina', '1991-01-28', '555-1009', NULL, 'Insomnio y dificultades de sueño', 'Insomnio primario (F51.0)', 'activo'),
('Gabriel', 'Flores', '1987-06-12', '555-1010', 'gabriel.f@email.com', 'Trauma postraumático', 'TEPT (F43.10)', 'activo'),
('Daniela', 'Aguilar', '1994-03-08', '555-1011', NULL, 'Trastorno alimenticio', 'Anorexia nerviosa (F50.01)', 'activo'),
('Martín', 'Herrera', '1986-10-20', '555-1012', 'martin.h@email.com', 'Dificultades en relaciones de pareja', 'Problemas de relación conyugal (Z63.0)', 'activo'),
('Natalia', 'Cruz', '1990-08-05', '555-1013', NULL, 'Crisis de ansiedad recurrente', 'Trastorno de pánico (F41.0)', 'activo'),
('Felipe', 'Ortega', '1983-04-17', '555-1014', 'felipe.o@email.com', 'Depresión crónica', 'Distimia (F34.1)', 'activo'),
('Camila', 'Santos', '1996-12-01', '555-1015', NULL, 'Problemas de conducta en adolescentes', 'Trastorno desafiador (F91.3)', 'activo'),
('Alejandro', 'Peña', '1989-07-22', '555-1016', 'alejandro.p@email.com', 'Estrés post-traumático laboral', 'TEPT (F43.10)', 'pausado'),
('Patricia', 'Luna', '1984-11-14', '555-1017', NULL, 'Trastorno bipolar', 'Trastorno Bipolar I (F31.1)', 'activo'),
('Sebastián', 'Cortés', '1997-02-28', '555-1018', 'sebas.c@email.com', 'Ansiedad por separación', 'Trastorno de ansiedad por separación (F93.0)', 'activo'),
('Mariana', 'Delgado', '1991-05-09', '555-1019', NULL, 'Depresión y baja motivación', 'Episodio Depresivo Mayor recurrente (F33.1)', 'activo'),
('Ricardo', 'Soto', '1980-09-30', '555-1020', 'ricardo.s@email.com', 'Duelo no resuelto', 'Reacción ante duelo (F43.2)', 'finalizado');

-- ============================================================
-- PROGRAMAS TERAPÉUTICOS (4 plantillas)
-- ============================================================
INSERT INTO programas_terapeuticos (nombre, descripcion, total_sesiones, created_by) VALUES
('Programa Ansiedad Generalizada', 'Tratamiento integral para TAG con técnicas cognitivo-conductuales, relajación y exposición gradual', 14, 1),
('Programa Depresión', 'Programa de activación conductual, reestructuración cognitiva y prevención de recaídas para episodios depresivos', 16, 1),
('Programa TOC', 'Exposición y prevención de respuesta (E/PR), psicoeducación y gestión de rituales', 16, 1),
('Programa Duelo', 'Fases del duelo, procesamiento emocional, reconstrucción del significado y adaptación', 12, 1);

-- ============================================================
-- METAS PROGRAMA — Ansiedad Generalizada (14 sesiones)
-- ============================================================
INSERT INTO metas_programa (programa_id, sesion_numero, titulo, descripcion, categoria, orden) VALUES
(1, 1, 'Evaluación inicial y rapport', 'Historia clínica completa, escala de ansiedad (GAD-7), establecer alianza terapéutica', 'evaluacion', 1),
(1, 2, 'Psicoeducación sobre ansiedad', 'Explicar modelo de ansiedad, ciclo de ansiedad, normalizar experiencia', 'intervencion', 2),
(1, 3, 'Técnicas de relajación I', 'Respiración diafragmática, relajación muscular progresiva de Jacobson', 'intervencion', 3),
(1, 4, 'Técnicas de relajación II', 'Consolidación de relajación, mindfulness básico, práctica en sesión', 'intervencion', 4),
(1, 5, 'Reestructuración cognitiva I', 'Identificación de pensamientos automáticos, distorsiones cognitivas comunes', 'intervencion', 5),
(1, 6, 'Reestructuración cognitiva II', 'Cuestionamiento socrático, creación de pensamientos alternativos balanceados', 'intervencion', 6),
(1, 7, 'Exposición gradual I', 'Diseño de jerarquía de exposición, primera exposición con jerarquía baja', 'intervencion', 7),
(1, 8, 'Exposición gradual II', 'Progresión en jerarquía, manejo de ansiedad anticipatoria', 'intervencion', 8),
(1, 9, 'Exposición gradual III', 'Exposición a situaciones de jerarquía alta, consolidación', 'intervencion', 9),
(1, 10, 'Prevención de recaídas I', 'Identificación de factores de riesgo, plan de acción temprana', 'seguimiento', 10),
(1, 11, 'Prevención de recaídas II', 'Ensayo conductual de situaciones de riesgo, refuerzo de habilidades', 'seguimiento', 11),
(1, 12, 'Consolidación de habilidades', 'Repaso de todas las técnicas, aplicar a situaciones reales del paciente', 'seguimiento', 12),
(1, 13, 'Evaluación de progreso', 'Aplicar GAD-7 final, comparar con línea base, discutir avances', 'seguimiento', 13),
(1, 14, 'Cierre y plan de mantenimiento', 'Plan de auto-cuidado, señales de alarma, criteria de reconsulta', 'cierre', 14);

-- ============================================================
-- METAS PROGRAMA — Depresión (16 sesiones)
-- ============================================================
INSERT INTO metas_programa (programa_id, sesion_numero, titulo, descripcion, categoria, orden) VALUES
(2, 1, 'Evaluación inicial PHQ-9', 'Aplicar PHQ-9, historia de depresión, evaluar ideación suicida, rapport', 'evaluacion', 1),
(2, 2, 'Psicoeducación depresiva', 'Modelo cognitivo de depresión, ciclo depresivo, mitos y realidades', 'intervencion', 2),
(2, 3, 'Activación conductual I', 'Monitoreo de actividad, agenda de placer y maestría, activación gradual', 'intervencion', 3),
(2, 4, 'Activación conductual II', 'Meta de actividad, romper patrones de evitación, ritmo actividad-descanso', 'intervencion', 4),
(2, 5, 'Rutina de autocuidado', 'Higiene de sueño, alimentación, ejercicio, estructura diaria', 'intervencion', 5),
(2, 6, 'Pensamientos automáticos', 'Identificación de pensamientos depresivos, registro de pensamientos', 'intervencion', 6),
(2, 7, 'Reestructuración cognitiva', 'Distorsiones cognitivas en depresión, pensamiento alternativo', 'intervencion', 7),
(2, 8, 'Creencias centrales', 'Identificar creencias nucleares sobre uno mismo, el mundo, el futuro', 'intervencion', 8),
(2, 9, 'Resolución de problemas', 'Técnica de resolución de problemas, afrontamiento activo vs pasivo', 'intervencion', 9),
(2, 10, 'Asertividad básica', 'Comunicación asertiva, decir no, expresar necesidades', 'intervencion', 10),
(2, 11, 'Relaciones sociales', 'Red de apoyo, aislamiento social, reconexión gradual', 'seguimiento', 11),
(2, 12, 'Manejo del estrés', 'Técnicas de relajación, mindfulness, autocuidado avanzado', 'seguimiento', 12),
(2, 13, 'Prevención de recaídas I', 'Factores de vulnerabilidad, plan de acción temprana', 'seguimiento', 13),
(2, 14, 'Prevención de recaídas II', 'Ensayo de afrontamiento, simular situaciones de riesgo', 'seguimiento', 14),
(2, 15, 'Evaluación PHQ-9 final', 'Comparar con línea base, discutir progreso, fortalezas identificadas', 'seguimiento', 15),
(2, 16, 'Cierre y plan mantención', 'Plan de bienestar, señales de alarma, recursos de apoyo', 'cierre', 16);

-- ============================================================
-- METAS PROGRAMA — TOC (16 sesiones)
-- ============================================================
INSERT INTO metas_programa (programa_id, sesion_numero, titulo, descripcion, categoria, orden) VALUES
(3, 1, 'Evaluación y rapport TOC', 'Aplicar Y-BOCS, historia del TOC, identificar obsesiones y rituales', 'evaluacion', 1),
(3, 2, 'Psicoeducación TOC', 'Modelo obsesivo-compulsivo, ciclo del TOC, importancia de E/PR', 'intervencion', 2),
(3, 3, 'Jerarquización de rituales', 'Crear lista de rituales, clasificar por intensidad, establecer jerarquía', 'intervencion', 3),
(3, 4, 'Exposición I - Nivel bajo', 'Primera exposición con prevención de respuesta, nivel bajo de la jerarquía', 'intervencion', 4),
(3, 5, 'Exposición II - Nivel bajo-medio', 'Consolidar exposición, manejar ansiedad, registrar SUDS', 'intervencion', 5),
(3, 6, 'Exposición III - Nivel medio', 'Progresión en jerarquía, tolerancia a la incertidumbre', 'intervencion', 6),
(3, 7, 'Exposición IV - Nivel medio-alto', 'Exposición a pensamientos obsesivos más desafiantes', 'intervencion', 7),
(3, 8, 'Exposición V - Nivel alto', 'Situaciones de mayor ansiedad, consolidar técnicas', 'intervencion', 8),
(3, 9, 'Exposición VI - Nivel máximo', 'Nivel más alto de la jerarquía, manejo de crisis', 'intervencion', 9),
(3, 10, 'Reestructuración de creencias', 'Creencias disfuncionales sobre responsabilidad, sobreestimación de amenaza', 'intervencion', 10),
(3, 11, 'Tolerancia a la incertidumbre', 'Ejercicios de tolerancia, manejo de dudas y certeza', 'intervencion', 11),
(3, 12, 'Mindfulness para TOC', 'Defusión cognitiva, observar pensamientos sin reaccionar', 'seguimiento', 12),
(3, 13, 'Prevención de recaídas TOC', 'Identificar gatillos, plan de acción temprana, mantenimiento E/PR', 'seguimiento', 13),
(3, 14, 'Consolidación y práctica', 'Aplicar en situaciones cotidianas, refuerzo de logros', 'seguimiento', 14),
(3, 15, 'Evaluación Y-BOCS final', 'Comparar con línea base, evaluar mejoría clínica significativa', 'seguimiento', 15),
(3, 16, 'Cierre y mantenimiento', 'Plan de exposición autónoma, recursos, criteria de reconsulta', 'cierre', 16);

-- ============================================================
-- METAS PROGRAMA — Duelo (12 sesiones)
-- ============================================================
INSERT INTO metas_programa (programa_id, sesion_numero, titulo, descripcion, categoria, orden) VALUES
(4, 1, 'Evaluación del duelo', 'Historia de la pérdida, inventario de duelo, evaluar duelo complicado', 'evaluacion', 1),
(4, 2, 'Psicoeducación sobre duelo', 'Fases del duelo, normalizar reacciones, mitos del duelo', 'intervencion', 2),
(4, 3, 'Procesamiento de la pérdida', 'Narrativa de la relación, significado de la persona fallecida', 'intervencion', 3),
(4, 4, 'Expresión emocional', 'Permitir y facilitar la expresión de emociones (tristeza, rabia, culpa)', 'intervencion', 4),
(4, 5, 'Manejo de la culpa', 'Diferenciar culpa racional e irracional, auto-perdón', 'intervencion', 5),
(4, 6, 'Cambios en la identidad', 'Re-definición del rol, nuevas identidades, adaptación', 'intervencion', 6),
(4, 7, 'Red de apoyo social', 'Identificar apoyo disponible, fortalecer conexiones', 'intervencion', 7),
(4, 8, 'Rituales y conmemoración', 'Rituales saludables, fechas significativas, memoria constructiva', 'seguimiento', 8),
(4, 9, 'Reconstrucción del significado', 'Buscar sentido, crecimiento post-traumático, nuevas metas', 'seguimiento', 9),
(4, 10, 'Integración de la pérdida', 'Incorporar la pérdida en la vida, relación continua saludable', 'seguimiento', 10),
(4, 11, 'Plan de futuro', 'Nuevos proyectos, reconexión con la vida, esperanza', 'seguimiento', 11),
(4, 12, 'Cierre y seguimiento', 'Evaluación final, plan de autocuidado, recursos de apoyo', 'cierre', 12);

-- ============================================================
-- ASIGNACIONES (12 casos activos de ejemplo)
-- ============================================================
INSERT INTO asignaciones (paciente_id, psicologa_id, supervisor_id, programa_id, fecha_inicio, fecha_fin_estimada, sesion_actual, estado) VALUES
-- Ana García (4) - 3 casos
(1, 4, 2, 1, '2026-01-15', '2026-04-15', 5, 'en_curso'),      -- Laura → Ansiedad Gen.
(4, 4, 2, 1, '2026-02-01', '2026-05-01', 3, 'en_curso'),      -- Miguel → Ansiedad Gen.
(7, 4, 2, 2, '2026-01-20', '2026-05-20', 8, 'en_curso'),      -- Valentina → Depresión
-- María López (5) - 3 casos
(2, 5, 2, 2, '2026-01-10', '2026-05-10', 7, 'desviado'),      -- Carlos → Depresión
(5, 5, 3, 3, '2026-02-15', '2026-06-15', 4, 'en_curso'),      -- Isabella → TOC
(8, 5, 2, 2, '2026-03-01', '2026-07-01', 2, 'en_curso'),      -- Gabriel → Depresión
-- Laura Pérez (6) - 3 casos
(3, 6, 2, 4, '2026-01-05', '2026-04-05', 10, 'en_curso'),     -- Sofía → Duelo
(6, 6, 3, 1, '2026-02-10', '2026-05-10', 6, 'en_curso'),      -- Andrés → Ansiedad Gen.
(9, 6, 2, 1, '2026-03-10', '2026-06-10', 2, 'en_curso'),      -- Luciana → Ansiedad Gen.
-- José Hernández (7) - 3 casos
(10, 7, 3, 2, '2026-01-25', '2026-05-25', 9, 'en_curso'),     -- Gabriel F. → Depresión
(11, 7, 2, 3, '2026-02-20', '2026-06-20', 5, 'en_curso'),     -- Daniela → TOC
(13, 7, 2, 1, '2026-03-15', '2026-06-15', 1, 'en_curso');     -- Natalia → Ansiedad Gen.

-- ============================================================
-- SESIONES — Caso de Laura Fernández (completo hasta sesión 5)
-- ============================================================
INSERT INTO sesiones (asignacion_id, numero_sesion, fecha_programada, fecha_real, meta_id, estado, duracion_minutos, temas_trabajados, observaciones_psicologa, desviacion, motivo_desviacion, tipo_desviacion) VALUES
(1, 1, '2026-01-15', '2026-01-15', 1, 'completada', 50, 'Historia clínica, GAD-7 = 16 (severo), rapport', 'Paciente colaboradora, buena alianza', FALSE, NULL, 'ninguna'),
(1, 2, '2026-01-22', '2026-01-22', 2, 'completada', 45, 'Modelo de ansiedad, ciclo ansioso', 'Comprende bien el modelo, muestra interés', FALSE, NULL, 'ninguna'),
(1, 3, '2026-01-29', '2026-02-05', 3, 'completada', 50, 'Respiración diafragmática', 'Paciente enferma, reprogramada 1 semana', FALSE, NULL, 'ninguna'),
(1, 4, '2026-02-05', '2026-02-05', 4, 'completada', 55, 'Relajación muscular, mindfulness', 'No logró relajación muscular, dificultad con body scan', TRUE, 'Paciente presenta dificultad significativa con relajación muscular. Considerar repetir o adaptar técnica.', 'repeticion'),
(1, 5, '2026-02-12', NULL, 5, 'programada', NULL, 'Reestructuración cognitiva I', NULL, FALSE, NULL, 'ninguna');

-- ============================================================
-- SESIONES — Caso de Carlos Mendoza (desviado)
-- ============================================================
INSERT INTO sesiones (asignacion_id, numero_sesion, fecha_programada, fecha_real, meta_id, estado, duracion_minutos, temas_trabajados, observaciones_psicologa, desviacion, motivo_desviacion, tipo_desviacion) VALUES
(4, 1, '2026-01-10', '2026-01-10', 15, 'completada', 55, 'Evaluación PHQ-9 = 18 (moderado-severo), rapport', 'Paciente masculino con dificultad para expresar emociones', FALSE, NULL, 'ninguna'),
(4, 2, '2026-01-17', '2026-01-17', 16, 'completada', 50, 'Psicoeducación depresiva', 'Esposa presente en las últimas 10 min, interés en participar', FALSE, NULL, 'ninguna'),
(4, 3, '2026-01-24', '2026-01-24', 17, 'completada', 45, 'Activación conductual', 'Paciente resistente a activación, prefiere solo hablar', TRUE, 'Paciente evita tareas asignadas. Resistencia a la activación conductual. Considerar intervención sobre resistencia.', 'repeticion'),
(4, 4, '2026-01-31', '2026-01-31', 18, 'completada', 50, 'Activación conductual II', 'Mejor disposición, completó parcialmente la tarea', TRUE, 'Tarea completada solo al 40%. Necesita más tiempo en activación conductual.', 'repeticion'),
(4, 5, '2026-02-07', '2026-02-14', 19, 'completada', 55, 'Rutina de autocuidado', 'Paciente una semana atrasado, agenda saturada por trabajo', TRUE, 'Retraso de 1 semana. Agenda laboral complicada. Considerar reestructurar horario.', 'retraso'),
(4, 6, '2026-02-14', '2026-02-14', 20, 'completada', 45, 'Pensamientos automáticos', 'Avanzó rápido en identificación, buen insight', FALSE, NULL, 'ninguna'),
(4, 7, '2026-02-21', NULL, 21, 'programada', NULL, 'Reestructuración cognitiva', NULL, FALSE, NULL, 'ninguna');

-- ============================================================
-- SESIONES — Caso de Sofía Gutiérrez (avanzado, sesión 10)
-- ============================================================
INSERT INTO sesiones (asignacion_id, numero_sesion, fecha_programada, fecha_real, meta_id, estado, duracion_minutos, temas_trabajados, observaciones_psicologa, desviacion, motivo_desviacion, tipo_desviacion) VALUES
(7, 1, '2026-01-05', '2026-01-05', 43, 'completada', 60, 'Evaluación, inventario de duelo, rapport profundo', 'Paciente con duelo por madre, 3 meses de pérdida', FALSE, NULL, 'ninguna'),
(7, 2, '2026-01-12', '2026-01-12', 44, 'completada', 50, 'Fases del duelo, normalización', 'Lloró mucho, catharsis importante', FALSE, NULL, 'ninguna'),
(7, 3, '2026-01-19', '2026-01-19', 45, 'completada', 55, 'Narrativa de relación con madre', 'Recuerdos positivos, vínculo fuerte', FALSE, NULL, 'ninguna'),
(7, 4, '2026-01-26', '2026-01-26', 46, 'completada', 50, 'Expresión emocional, rabia', 'Descubrió rabia hacia padre por ausencia', FALSE, NULL, 'ninguna'),
(7, 5, '2026-02-02', '2026-02-02', 47, 'completada', 45, 'Manejo de culpa', 'Culpa por no estar en el momento del deceso', FALSE, NULL, 'ninguna'),
(7, 6, '2026-02-09', '2026-02-09', 48, 'completada', 50, 'Cambio de rol, identidad', 'Se siente perdida sin su madre como referente', FALSE, NULL, 'ninguna'),
(7, 7, '2026-02-16', '2026-02-16', 49, 'completada', 50, 'Red de apoyo, reconexión', 'Reconectó con hermana, apoyo mutuo', FALSE, NULL, 'ninguna'),
(7, 8, '2026-02-23', '2026-02-23', 50, 'completada', 45, 'Rituales, conmemoración saludable', 'Creó ritual propio de visita al cementerio', FALSE, NULL, 'ninguna'),
(7, 9, '2026-03-02', '2026-03-02', 51, 'completada', 55, 'Significado, crecimiento', 'Habla de "herencia emocional" de su madre', FALSE, NULL, 'ninguna'),
(7, 10, '2026-03-09', NULL, 52, 'programada', NULL, 'Integración de la pérdida', NULL, FALSE, NULL, 'ninguna');

-- ============================================================
-- ALERTAS DE DESVIACIÓN
-- ============================================================
INSERT INTO alertas_desviacion (asignacion_id, sesion_id, tipo, descripcion, detectada_por, gravedad, resuelta, resuelta_por, notas_resolucion, fecha_resolucion) VALUES
-- Alerta de Laura (repetición en sesión 4)
(1, 4, 'repeticion', 'Paciente no logró dominar técnica de relajación muscular. Necesita repetición o adaptación.', 4, 'media', FALSE, NULL, NULL, NULL),
-- Alertas de Carlos (múltiples desviaciones)
(4, 9, 'repeticion', 'Resistencia a la activación conductual en sesiones 3 y 4. Patrón de evitación.', 5, 'alta', TRUE, 2, 'Acordado con Dra. Ruiz: modificar enfoque a activación graduada más lenta, agregar sesión extra de activación.', '2026-02-15'),
(4, 11, 'retraso', 'Retraso de 1 semana en sesión 5 por agenda laboral. Posible factor de deserción.', 5, 'media', TRUE, 2, 'Reprogramar sesiones a viernes en lugar de jueves.', '2026-02-08');

-- ============================================================
-- OBSERVACIONES DE SUPERVISIÓN
-- ============================================================
INSERT INTO observaciones_supervision (sesion_id, supervisor_id, observacion, tipo) VALUES
(4, 2, 'Buen manejo del rapport. Para la sesión de relajación, considerar alternativas: yoga suave, visualización guiada, o técnicas de aterrizaje. No insistir en relajación muscular si no le funciona.', 'tecnica'),
(9, 2, 'La resistencia de Carlos es esperable en hombres con depresión. Considerar enfoque más brief y orientado a acción. Involucrar a la esposa puede ser un recurso. Agenda para revisar caso en supervisión.', 'tecnica'),
(11, 2, 'El retraso puede indicar falta de compromiso o factores externos. Explorar con paciente el significado del abandono de tareas. No asumir resistencia.', 'general'),
(16, 3, 'Excelente progreso de Sofía. El duelo se está procesando de forma saludable. La sesión de culpa fue particularmente productiva.', 'apoyo');

-- ============================================================
-- HISTORIAL DE CAMBIOS (audit trail de ejemplo)
-- ============================================================
INSERT INTO historial_cambios (tabla_afectada, registro_id, accion, datos_anteriores, datos_nuevos, usuario_id) VALUES
('asignaciones', 4, 'editar', '{"estado": "en_curso"}', '{"estado": "desviado"}', 5),
('sesiones', 11, 'editar', '{"fecha_programada": "2026-02-07"}', '{"fecha_programada": "2026-02-14", "estado": "reprogramada"}', 5),
('alertas_desviacion', 2, 'editar', '{"resuelta": false}', '{"resuelta": true, "notas_resolucion": "Acordado: activación graduada más lenta"}', 2);
