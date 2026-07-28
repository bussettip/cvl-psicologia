import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const psicologaId = searchParams.get('psicologa_id');
    if (!psicologaId) {
      return NextResponse.json({ error: 'psicologa_id requerido' }, { status: 400 });
    }

    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const formatoFecha = (d: Date) => d.toISOString().split('T')[0];

    const [ingresosHoy] = await db.query(
      `SELECT COALESCE(SUM(monto), 0) as total, COUNT(*) as sesiones
       FROM cobros c
       JOIN sesiones s ON c.sesion_id = s.id
       JOIN asignaciones a ON s.asignacion_id = a.id
       WHERE a.psicologa_id = ? AND DATE(c.fecha) = DATE(?) AND c.estado != 'cancelado'`,
      [psicologaId, formatoFecha(hoy)]
    ) as any[];

    const [ingresosSemana] = await db.query(
      `SELECT COALESCE(SUM(monto), 0) as total, COUNT(*) as sesiones
       FROM cobros c
       JOIN sesiones s ON c.sesion_id = s.id
       JOIN asignaciones a ON s.asignacion_id = a.id
       WHERE a.psicologa_id = ? AND DATE(c.fecha) BETWEEN DATE(?) AND DATE(?) AND c.estado != 'cancelado'`,
      [psicologaId, formatoFecha(inicioSemana), formatoFecha(hoy)]
    ) as any[];

    const [ingresosMes] = await db.query(
      `SELECT COALESCE(SUM(monto), 0) as total, COUNT(*) as sesiones
       FROM cobros c
       JOIN sesiones s ON c.sesion_id = s.id
       JOIN asignaciones a ON s.asignacion_id = a.id
       WHERE a.psicologa_id = ? AND DATE(c.fecha) BETWEEN DATE(?) AND DATE(?) AND c.estado != 'cancelado'`,
      [psicologaId, formatoFecha(inicioMes), formatoFecha(hoy)]
    ) as any[];

    const [sesionesPendientes] = await db.query(
      `SELECT COUNT(*) as total
       FROM sesiones s
       JOIN asignaciones a ON s.asignacion_id = a.id
       WHERE a.psicologa_id = ? AND s.estado = 'programada' AND s.fecha_programada >= DATE(?)`,
      [psicologaId, formatoFecha(hoy)]
    ) as any[];

    const [historial] = await db.query(
      `SELECT DATE(c.fecha) as fecha, COALESCE(SUM(c.monto), 0) as total, COUNT(*) as sesiones
       FROM cobros c
       JOIN sesiones s ON c.sesion_id = s.id
       JOIN asignaciones a ON s.asignacion_id = a.id
       WHERE a.psicologa_id = ? AND c.estado != 'cancelado'
       GROUP BY DATE(c.fecha)
       ORDER BY fecha DESC
       LIMIT 30`,
      [psicologaId]
    ) as any[];

    return NextResponse.json({
      hoy: { total: Number(ingresosHoy[0]?.total || 0), sesiones: Number(ingresosHoy[0]?.sesiones || 0) },
      semana: { total: Number(ingresosSemana[0]?.total || 0), sesiones: Number(ingresosSemana[0]?.sesiones || 0) },
      mes: { total: Number(ingresosMes[0]?.total || 0), sesiones: Number(ingresosMes[0]?.sesiones || 0) },
      pendientes: Number(sesionesPendientes[0]?.total || 0),
      historial
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
