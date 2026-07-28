import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { sesion_id, psicologa_id, monto } = await req.json();
    if (!sesion_id || !psicologa_id) {
      return NextResponse.json({ error: 'Faltan sesion_id y psicologa_id' }, { status: 400 });
    }
    // Get session + assignment + patient info
    const [rows] = await db.query(
      `SELECT s.*, a.paciente_id, a.psicologa_id as asig_psicologa_id, p.nombre as pac_nombre, p.apellido as pac_apellido
       FROM sesiones s
       JOIN asignaciones a ON s.asignacion_id = a.id
       JOIN pacientes p ON a.paciente_id = p.id
       WHERE s.id = ?`, [sesion_id]
    ) as any[];
    if (rows.length === 0) return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
    const sesion = rows[0];
    if (String(sesion.asig_psicologa_id) !== String(psicologa_id)) {
      return NextResponse.json({ error: 'Esta sesión no pertenece a esta psicóloga' }, { status: 403 });
    }
    // Mark session as confirmed
    await db.query(
      'UPDATE sesiones SET confirmada_psicologa = 1, confirmada_fecha = NOW(), estado = "completada" WHERE id = ?',
      [sesion_id]
    );
    // Check if cobro already exists for this session
    const [existingCobro] = await db.query('SELECT id FROM cobros WHERE sesion_id = ?', [sesion_id]) as any[];
    let cobroId;
    if (existingCobro.length > 0) {
      // Update existing cobro with psychologist confirmation
      await db.query(
        'UPDATE cobros SET confirmado_psicologa = 1, confirmado_psicologa_id = ?, confirmado_psicologa_fecha = NOW() WHERE id = ?',
        [psicologa_id, existingCobro[0].id]
      );
      cobroId = existingCobro[0].id;
    } else {
      // Create new cobro with psychologist confirmation
      const hoy = new Date().toISOString().split('T')[0];
      const [result] = await db.query(
        `INSERT INTO cobros (paciente_id, tipo, concepto, sesion_id, monto, metodo_pago, fecha, estado, created_by, confirmado_psicologa, confirmado_psicologa_id, confirmado_psicologa_fecha)
         VALUES (?, 'sesion', ?, ?, ?, 'efectivo', ?, 'pendiente', ?, 1, ?, NOW())`,
        [sesion.paciente_id, `Sesión #${sesion.numero_sesion} - ${sesion.pac_nombre} ${sesion.pac_apellido}`, sesion_id, monto || 750, hoy, psicologa_id, psicologa_id]
      ) as any[];
      cobroId = result.insertId;
    }
    return NextResponse.json({ message: 'Sesión confirmada y cobro registrado/actualizado', cobro_id: cobroId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
