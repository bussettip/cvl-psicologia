import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const anio = Number(searchParams.get('anio')) || new Date().getFullYear();

    const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

    const [presupuestosRaw] = await db.query(
      `SELECT p.*, u.nombre as autor_nombre, u.apellido as autor_apellido
       FROM presupuestos p
       LEFT JOIN usuarios u ON p.created_by = u.id
       WHERE YEAR(p.fecha) = ?
       ORDER BY p.fecha ASC, p.created_at DESC`,
      [anio]
    ) as any[];

    const [ingresosRaw] = await db.query(
      `SELECT MONTH(fecha) as mes, COALESCE(SUM(monto),0) as total, COUNT(*) as num
       FROM cobros WHERE YEAR(fecha) = ? AND estado = 'pagado'
       GROUP BY MONTH(fecha) ORDER BY mes`,
      [anio]
    ) as any[];

    const [gastosRaw] = await db.query(
      `SELECT MONTH(fecha) as mes, COALESCE(SUM(monto),0) as total, COUNT(*) as num
       FROM gastos_caja_chica WHERE YEAR(fecha) = ? AND estado IN ('aprobado','pagado')
       GROUP BY MONTH(fecha) ORDER BY mes`,
      [anio]
    ) as any[];

    const [entregasRaw] = await db.query(
      `SELECT MONTH(fecha) as mes, COALESCE(SUM(monto),0) as total, COUNT(*) as num
       FROM entregas_dinero WHERE YEAR(fecha) = ? AND estado = 'confirmada'
       GROUP BY MONTH(fecha) ORDER BY mes`,
      [anio]
    ) as any[];

    const [cobrosMes] = await db.query(
      `SELECT MONTH(fecha) as mes, tipo, metodo_pago, COALESCE(SUM(monto),0) as total, COUNT(*) as num
       FROM cobros WHERE YEAR(fecha) = ? AND estado = 'pagado'
       GROUP BY MONTH(fecha), tipo, metodo_pago`,
      [anio]
    ) as any[];

    const [resumen] = await db.query(
      `SELECT
        (SELECT COALESCE(SUM(monto),0) FROM cobros WHERE YEAR(fecha) = ? AND estado = 'pagado') as ingreso_anual,
        (SELECT COALESCE(SUM(monto),0) FROM cobros WHERE YEAR(fecha) = ? AND estado = 'pendiente') as pendiente_anual,
        (SELECT COALESCE(SUM(monto),0) FROM gastos_caja_chica WHERE YEAR(fecha) = ? AND estado IN ('aprobado','pagado')) as gasto_anual,
        (SELECT COALESCE(SUM(monto),0) FROM presupuestos WHERE YEAR(fecha) = ?) as presupuesto_anual,
        (SELECT COUNT(*) FROM cobros WHERE YEAR(fecha) = ?) as num_cobros_anual,
        (SELECT COUNT(*) FROM sesiones WHERE YEAR(fecha_programada) = ? AND estado = 'completada') as sesiones_anual,
        (SELECT COUNT(*) FROM pacientes) as total_pacientes,
        (SELECT COUNT(*) FROM usuarios WHERE rol = 'psicologa' AND activo = TRUE) as total_psicologas`,
      [anio, anio, anio, anio, anio, anio]
    ) as any[];

    const r = (resumen as any)[0];

    const porMes = MESES.map((nombre, i) => {
      const mes = i + 1;
      const ing = (ingresosRaw as any[]).find(x => Number(x.mes) === mes);
      const gas = (gastosRaw as any[]).find(x => Number(x.mes) === mes);
      const ent = (entregasRaw as any[]).find(x => Number(x.mes) === mes);
      const pres = (presupuestosRaw as any[]).filter(x => x.fecha && Number(new Date(x.fecha + 'T00:00:00').getMonth()) + 1 === mes)
        .reduce((s, x) => s + Number(x.monto || 0), 0);
      return {
        mes,
        nombre,
        ingreso: Number(ing?.total || 0),
        num_ingresos: Number(ing?.num || 0),
        gasto: Number(gas?.total || 0),
        num_gastos: Number(gas?.num || 0),
        entrega: Number(ent?.total || 0),
        num_entregas: Number(ent?.num || 0),
        presupuesto: pres
      };
    });

    const porTipoMes: Record<string, { mes: number; tipo: string; metodo_pago: string; total: number; num: number }[]> = {};
    (cobrosMes as any[]).forEach(c => {
      const key = `${c.mes}-${c.tipo}`;
      if (!porTipoMes[key]) porTipoMes[key] = [];
      porTipoMes[key].push({ mes: Number(c.mes), tipo: c.tipo, metodo_pago: c.metodo_pago, total: Number(c.total), num: Number(c.num) });
    });

    const beneficio = Number(r.ingreso_anual) - Number(r.gasto_anual);
    const totalPresupuesto = Number(r.presupuesto_anual);

    return NextResponse.json({
      anio,
      resumen: {
        ingreso_anual: Number(r.ingreso_anual),
        pendiente_anual: Number(r.pendiente_anual),
        gasto_anual: Number(r.gasto_anual),
        presupuesto_anual: totalPresupuesto,
        beneficio_anual: beneficio,
        margen: totalPresupuesto > 0 ? (beneficio / totalPresupuesto) * 100 : 0,
        ejecucion_presupuesto: totalPresupuesto > 0 ? (Number(r.ingreso_anual) / totalPresupuesto) * 100 : 0,
        num_cobros_anual: Number(r.num_cobros_anual),
        sesiones_anual: Number(r.sesiones_anual),
        total_pacientes: Number(r.total_pacientes),
        total_psicologas: Number(r.total_psicologas),
        ingreso_promedio_mes: Number(r.ingreso_anual) / 12
      },
      porMes,
      presupuestos: (presupuestosRaw as any[]).map(p => ({
        ...p,
        fecha: p.fecha ? new Date(p.fecha).toISOString().split('T')[0] : p.fecha
      })),
      porTipoMes
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
