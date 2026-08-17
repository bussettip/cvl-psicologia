import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import db from '@/lib/db';

const TARIFA_ISR = [
  { li: 0.01, ls: 746.04, cf: 0.00, t: 0.0192 },
  { li: 746.05, ls: 6332.05, cf: 14.32, t: 0.0640 },
  { li: 6332.06, ls: 11128.01, cf: 371.83, t: 0.1088 },
  { li: 11128.02, ls: 12935.82, cf: 893.63, t: 0.1600 },
  { li: 12935.83, ls: 15487.71, cf: 1182.88, t: 0.1792 },
  { li: 15487.72, ls: 31236.49, cf: 1640.18, t: 0.2136 },
  { li: 31236.50, ls: 49233.00, cf: 5004.12, t: 0.2352 },
  { li: 49233.01, ls: 93993.90, cf: 9236.89, t: 0.3000 },
  { li: 93993.91, ls: 125325.20, cf: 22665.17, t: 0.3200 },
  { li: 125325.21, ls: 375975.61, cf: 32691.18, t: 0.3400 },
  { li: 375975.62, ls: Infinity, cf: 117912.32, t: 0.3500 }
];

function calcISR(base: number): number {
  if (base <= 0) return 0;
  for (const r of TARIFA_ISR) {
    if (base >= r.li && base <= r.ls) return r.cf + (base - r.li) * r.t;
  }
  return base * 0.35;
}

function calcImpuestosMes(ingresos: number, egresosFactura: number, egresosPsicologas: number) {
  const baseIva = Math.max(0, ingresos - egresosFactura);
  const iva = baseIva * 0.16;
  const baseIsr = Math.max(0, ingresos - egresosFactura - egresosPsicologas);
  const isr = calcISR(baseIsr);
  return { ingresos, egresos_factura: egresosFactura, egresos_psicologas: egresosPsicologas, base_iva: baseIva, iva, base_isr: baseIsr, isr };
}

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
        (SELECT COALESCE(SUM(monto),0)*12 FROM presupuestos WHERE YEAR(fecha) = ? AND (estado IS NULL OR estado = 'activo')) as presupuesto_anual,
        (SELECT COUNT(*) FROM cobros WHERE YEAR(fecha) = ?) as num_cobros_anual,
        (SELECT COUNT(*) FROM sesiones WHERE YEAR(fecha_programada) = ? AND estado = 'completada') as sesiones_anual,
        (SELECT COUNT(*) FROM pacientes) as total_pacientes,
        (SELECT COUNT(*) FROM usuarios WHERE rol = 'psicologa' AND activo = TRUE) as total_psicologas`,
      [anio, anio, anio, anio, anio, anio]
    ) as any[];

    const r = (resumen as any)[0];

    const presupuestosActivos = (presupuestosRaw as any[]).filter((p: any) => (p.estado ?? 'activo') === 'activo');
    const presupuestoMensual = presupuestosActivos.reduce((s: number, p: any) => s + Number(p.monto || 0), 0);

    const porMes = MESES.map((nombre, i) => {
      const mes = i + 1;
      const ing = (ingresosRaw as any[]).find(x => Number(x.mes) === mes);
      const gas = (gastosRaw as any[]).find(x => Number(x.mes) === mes);
      const ent = (entregasRaw as any[]).find(x => Number(x.mes) === mes);
      const pres = presupuestoMensual;
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
    const totalPresupuesto = presupuestoMensual * 12;

    const calculoImpuestosPorMes = porMes.map(m => calcImpuestosMes(m.ingreso, m.gasto, m.entrega));
    const calculoImpuestosAnual = calculoImpuestosPorMes.reduce((acc, m) => {
      acc.ingresos += m.ingresos;
      acc.egresos_factura += m.egresos_factura;
      acc.egresos_psicologas += m.egresos_psicologas;
      acc.base_iva += m.base_iva;
      acc.iva += m.iva;
      acc.base_isr += m.base_isr;
      acc.isr += m.isr;
      return acc;
    }, { ingresos: 0, egresos_factura: 0, egresos_psicologas: 0, base_iva: 0, iva: 0, base_isr: 0, isr: 0 });

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
      porTipoMes,
      calculoImpuestos: {
        porMes: calculoImpuestosPorMes.map((m, i) => ({ mes: i + 1, nombre: MESES[i], ...m })),
        anual: calculoImpuestosAnual
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
