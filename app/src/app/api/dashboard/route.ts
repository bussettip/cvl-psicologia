import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Estadísticas generales
    const [totalPacientes] = await pool.query('SELECT COUNT(*) as total FROM pacientes WHERE estado = "activo"');
    const [totalPsicologas] = await pool.query('SELECT COUNT(*) as total FROM usuarios WHERE rol = "psicologa" AND activo = TRUE');
    const [asignacionesActivas] = await pool.query('SELECT COUNT(*) as total FROM asignaciones WHERE estado = "en_curso"');
    const [alertasPendientes] = await pool.query('SELECT COUNT(*) as total FROM alertas_desviacion WHERE resuelta = FALSE');
    const [sesionesCompletadas] = await pool.query('SELECT COUNT(*) as total FROM sesiones WHERE estado = "completada"');
    const [programasActivos] = await pool.query('SELECT COUNT(*) as total FROM programas_terapeuticos WHERE activo = TRUE');

    // Rendimiento por psicóloga
    const [rendimiento] = await pool.query(`
      SELECT 
        u.id,
        u.nombre,
        u.apellido,
        COUNT(DISTINCT a.id) as total_casos,
        COUNT(DISTINCT CASE WHEN a.estado = 'en_curso' THEN a.id END) as casos_activos,
        COUNT(DISTINCT CASE WHEN a.estado = 'completado' THEN a.id END) as casos_completados,
        COUNT(DISTINCT CASE WHEN a.estado = 'desviado' THEN a.id END) as casos_desviados,
        (SELECT COUNT(*) FROM sesiones s 
         JOIN asignaciones a2 ON s.asignacion_id = a2.id 
         WHERE a2.psicologa_id = u.id AND s.estado = 'completada') as sesiones_completadas,
        (SELECT COUNT(*) FROM alertas_desviacion ad 
         JOIN asignaciones a3 ON ad.asignacion_id = a3.id 
         WHERE a3.psicologa_id = u.id AND ad.resuelta = FALSE) as alertas_pendientes
      FROM usuarios u
      LEFT JOIN asignaciones a ON u.id = a.psicologa_id
      WHERE u.rol = 'psicologa' AND u.activo = TRUE
      GROUP BY u.id, u.nombre, u.apellido
      ORDER BY u.nombre
    `);

    // Alertas recientes
    const [alertasRecientes] = await pool.query(`
      SELECT ad.*, 
        p.nombre as paciente_nombre, p.apellido as paciente_apellido,
        u.nombre as psicologa_nombre, u.apellido as psicologa_apellido,
        s.numero_sesion
      FROM alertas_desviacion ad
      JOIN asignaciones a ON ad.asignacion_id = a.id
      JOIN pacientes p ON a.paciente_id = p.id
      JOIN usuarios u ON a.psicologa_id = u.id
      LEFT JOIN sesiones s ON ad.sesion_id = s.id
      WHERE ad.resuelta = FALSE
      ORDER BY ad.created_at DESC
      LIMIT 5
    `);

    // Últimas sesiones
    const [ultimasSesiones] = await pool.query(`
      SELECT s.*,
        p.nombre as paciente_nombre, p.apellido as paciente_apellido,
        u.nombre as psicologa_nombre, u.apellido as psicologa_apellido
      FROM sesiones s
      JOIN asignaciones a ON s.asignacion_id = a.id
      JOIN pacientes p ON a.paciente_id = p.id
      JOIN usuarios u ON a.psicologa_id = u.id
      ORDER BY s.fecha_programada DESC
      LIMIT 10
    `);

    // --- INGRESOS ---
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [ingresoHoy] = await pool.query(
      `SELECT COALESCE(SUM(monto),0) as total, COUNT(*) as num_cobros FROM cobros WHERE DATE(fecha) = DATE(?) AND estado = 'pagado'`,
      [today]
    );
    const [ingresoMes] = await pool.query(
      `SELECT COALESCE(SUM(monto),0) as total, COUNT(*) as num_cobros FROM cobros WHERE MONTH(fecha) = ? AND YEAR(fecha) = ? AND estado = 'pagado'`,
      [currentMonth, currentYear]
    );
    const [pendienteHoy] = await pool.query(
      `SELECT COALESCE(SUM(monto),0) as total, COUNT(*) as num_cobros FROM cobros WHERE DATE(fecha) = DATE(?) AND estado = 'pendiente'`,
      [today]
    );
    const [pendienteMes] = await pool.query(
      `SELECT COALESCE(SUM(monto),0) as total, COUNT(*) as num_cobros FROM cobros WHERE MONTH(fecha) = ? AND YEAR(fecha) = ? AND estado = 'pendiente'`,
      [currentMonth, currentYear]
    );
    const [porMetodo] = await pool.query(
      `SELECT metodo_pago, COALESCE(SUM(monto),0) as total, COUNT(*) as num_cobros 
       FROM cobros WHERE MONTH(fecha) = ? AND YEAR(fecha) = ? AND estado = 'pagado'
       GROUP BY metodo_pago ORDER BY total DESC`,
      [currentMonth, currentYear]
    );
    const [porTipo] = await pool.query(
      `SELECT tipo, COALESCE(SUM(monto),0) as total, COUNT(*) as num_cobros 
       FROM cobros WHERE MONTH(fecha) = ? AND YEAR(fecha) = ? AND estado = 'pagado'
       GROUP BY tipo ORDER BY total DESC`,
      [currentMonth, currentYear]
    );

    return NextResponse.json({
      estadisticas: {
        totalPacientes: (totalPacientes as any)[0].total,
        totalPsicologas: (totalPsicologas as any)[0].total,
        asignacionesActivas: (asignacionesActivas as any)[0].total,
        alertasPendientes: (alertasPendientes as any)[0].total,
        sesionesCompletadas: (sesionesCompletadas as any)[0].total,
        programasActivos: (programasActivos as any)[0].total
      },
      ingresos: {
        hoy: { total: (ingresoHoy as any)[0].total, num_cobros: (ingresoHoy as any)[0].num_cobros },
        mes: { total: (ingresoMes as any)[0].total, num_cobros: (ingresoMes as any)[0].num_cobros },
        pendiente_hoy: { total: (pendienteHoy as any)[0].total, num_cobros: (pendienteHoy as any)[0].num_cobros },
        pendiente_mes: { total: (pendienteMes as any)[0].total, num_cobros: (pendienteMes as any)[0].num_cobros },
        por_metodo: porMetodo,
        por_tipo: porTipo,
        gastos_fijos: 180000,
        beneficio_neto: (ingresoMes as any)[0].total - 180000
      },
      rendimiento,
      alertasRecientes,
      ultimasSesiones
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 });
  }
}
