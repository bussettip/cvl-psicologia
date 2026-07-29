USE cvl_psicologia;

-- Vista: Progreso de cada paciente por psicóloga
CREATE OR REPLACE VIEW v_progreso_pacientes AS
SELECT 
    p.id AS paciente_id,
    CONCAT(p.nombre, ' ', p.apellido) AS paciente,
    p.motivo_consulta,
    p.diagnostico_inicial,
    CONCAT(u.nombre, ' ', u.apellido) AS psicologa,
    pr.nombre AS programa,
    a.fecha_inicio,
    a.sesion_actual,
    pr.total_sesiones,
    ROUND((a.sesion_actual / pr.total_sesiones) * 100, 1) AS porcentaje_avance,
    a.estado,
    DATEDIFF(CURDATE(), a.fecha_inicio) AS dias_en_tratamiento
FROM asignaciones a
JOIN pacientes p ON a.paciente_id = p.id
JOIN usuarios u ON a.psicologa_id = u.id
JOIN programas_terapeuticos pr ON a.programa_id = pr.id
WHERE p.estado = 'activo'
ORDER BY u.nombre, a.fecha_inicio;

-- Vista: Resumen de sesiones completadas por psicóloga
CREATE OR REPLACE VIEW v_resumen_psicologas AS
SELECT 
    u.id AS psicologa_id,
    CONCAT(u.nombre, ' ', u.apellido) AS psicologa,
    COUNT(DISTINCT a.id) AS total_pacientes,
    COUNT(DISTINCT CASE WHEN a.estado = 'en_curso' THEN a.id END) AS casos_activos,
    COUNT(DISTINCT CASE WHEN a.estado = 'completado' THEN a.id END) AS casos_completados,
    COUNT(DISTINCT CASE WHEN a.estado = 'desviado' THEN a.id END) AS casos_desviados,
    COUNT(s.id) AS total_sesiones_realizadas,
    COUNT(DISTINCT CASE WHEN s.estado = 'completada' THEN s.id END) AS sesiones_completadas,
    COUNT(DISTINCT CASE WHEN s.desviacion = TRUE THEN s.id END) AS sesiones_desviadas,
    ROUND(AVG(CASE WHEN s.estado = 'completada' THEN s.duracion_minutos END), 0) AS duracion_promedio_min
FROM usuarios u
LEFT JOIN asignaciones a ON u.id = a.psicologa_id
LEFT JOIN sesiones s ON a.id = s.asignacion_id
WHERE u.rol = 'psicologa' AND u.activo = TRUE
GROUP BY u.id, u.nombre, u.apellido
ORDER BY total_pacientes DESC;

-- Vista: Últimas sesiones por paciente (evolución)
CREATE OR REPLACE VIEW v_evolucion_sesiones AS
SELECT 
    CONCAT(p.nombre, ' ', p.apellido) AS paciente,
    CONCAT(u.nombre, ' ', u.apellido) AS psicologa,
    s.numero_sesion,
    s.fecha_programada,
    s.fecha_real,
    s.estado,
    s.duracion_minutos,
    s.temas_trabajados,
    s.observaciones_psicologa,
    CASE WHEN s.desviacion = TRUE THEN CONCAT('⚠ ', s.tipo_desviacion, ': ', s.motivo_desviacion) ELSE '✅ Normal' END AS estado_sesion,
    DATEDIFF(COALESCE(s.fecha_real, s.fecha_programada), a.fecha_inicio) AS dias_desde_inicio
FROM sesiones s
JOIN asignaciones a ON s.asignacion_id = a.id
JOIN pacientes p ON a.paciente_id = p.id
JOIN usuarios u ON a.psicologa_id = u.id
ORDER BY s.fecha_programada DESC;

-- Vista: Alertas activas con detalle
CREATE OR REPLACE VIEW v_alertas_activas AS
SELECT 
    ad.id,
    CONCAT(p.nombre, ' ', p.apellido) AS paciente,
    CONCAT(u.nombre, ' ', u.apellido) AS psicologa,
    ad.tipo,
    ad.descripcion,
    ad.gravedad,
    s.numero_sesion,
    ad.created_at,
    DATEDIFF(CURDATE(), ad.created_at) AS dias_activa
FROM alertas_desviacion ad
JOIN asignaciones a ON ad.asignacion_id = a.id
JOIN pacientes p ON a.paciente_id = p.id
JOIN usuarios u ON a.psicologa_id = u.id
LEFT JOIN sesiones s ON ad.sesion_id = s.id
WHERE ad.resuelta = FALSE
ORDER BY ad.gravedad DESC, ad.created_at ASC;

-- Vista: Dashboard ejecutivo
CREATE OR REPLACE VIEW v_dashboard_ejecutivo AS
SELECT 
    (SELECT COUNT(*) FROM pacientes WHERE estado = 'activo') AS total_pacientes_activos,
    (SELECT COUNT(*) FROM usuarios WHERE rol = 'psicologa' AND activo = TRUE) AS total_psicologas,
    (SELECT COUNT(*) FROM asignaciones WHERE estado = 'en_curso') AS casos_en_curso,
    (SELECT COUNT(*) FROM sesiones WHERE estado = 'completada') AS sesiones_completadas,
    (SELECT COUNT(*) FROM alertas_desviacion WHERE resuelta = FALSE) AS alertas_pendientes,
    (SELECT ROUND(AVG(sesion_actual), 1) FROM asignaciones WHERE estado = 'en_curso') AS promedio_sesiones_por_caso,
    (SELECT COUNT(*) FROM sesiones WHERE fecha_programada = CURDATE()) AS sesiones_programadas_hoy;
