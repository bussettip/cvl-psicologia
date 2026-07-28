import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accion = searchParams.get('accion');

    if (accion === 'historial') {
      const [rows] = await pool.query(
        `SELECT er.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido,
                u.nombre as psicologa_nombre, u.apellido as psicologa_apellido
         FROM email_recordatorios er
         JOIN pacientes p ON er.paciente_id = p.id
         JOIN usuarios u ON er.psicologa_id = u.id
         ORDER BY er.created_at DESC LIMIT 100`
      );
      return NextResponse.json({ historial: rows });
    }

    const [rows] = await pool.query(
      `SELECT er.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido,
              u.nombre as psicologa_nombre, u.apellido as psicologa_apellido
       FROM email_recordatorios er
       JOIN pacientes p ON er.paciente_id = p.id
       JOIN usuarios u ON er.psicologa_id = u.id
       WHERE er.enviado = FALSE
       ORDER BY er.fecha_sesion ASC`
    );
    return NextResponse.json({ pendientes: rows, total: (rows as any[]).length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accion } = body;

    if (accion === 'enviar_pendientes') {
      const [pendientes] = await pool.query(
        `SELECT er.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido,
                p.email as paciente_email, u.nombre as psicologa_nombre, u.apellido as psicologa_apellido
         FROM email_recordatorios er
         JOIN pacientes p ON er.paciente_id = p.id
         JOIN usuarios u ON er.psicologa_id = u.id
         WHERE er.enviado = FALSE`
      ) as any[];

      let enviados = 0;
      let errores = 0;

      for (const r of pendientes) {
        try {
          await pool.query(
            `UPDATE email_recordatorios SET enviado = TRUE, enviado_en = NOW() WHERE id = ?`,
            [r.id]
          );
          enviados++;
        } catch (err: any) {
          await pool.query(
            `UPDATE email_recordatorios SET error = ? WHERE id = ?`,
            [err.message, r.id]
          );
          errores++;
        }
      }

      return NextResponse.json({ enviados, errores, total: pendientes.length });
    }

    const [sesiones] = await pool.query(
      `SELECT s.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido,
              p.email as paciente_email, p.telefono as paciente_telefono,
              a.psicologa_id, u.nombre as psicologa_nombre, u.apellido as psicologa_apellido
       FROM sesiones s
       JOIN asignaciones a ON s.asignacion_id = a.id
       JOIN pacientes p ON a.paciente_id = p.id
       JOIN usuarios u ON a.psicologa_id = u.id
       WHERE s.estado = 'programada'
         AND s.fecha_programada = DATE_ADD(CURDATE(), INTERVAL 1 DAY)`
    ) as any[];

    let creados = 0;
    let omitidos = 0;

    for (const s of sesiones) {
      const [existe] = await pool.query(
        `SELECT id FROM email_recordatorios WHERE sesion_id = ?`,
        [s.id]
      ) as any[];

      if (existe.length > 0) {
        omitidos++;
        continue;
      }

      const fechaFormato = new Date(s.fecha_programada).toLocaleDateString('es-MX', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });

      const asunto = `Recordatorio de sesión - ${fechaFormato}`;
      const contenido = `Estimado/a ${s.paciente_nombre} ${s.paciente_apellido},

Le recordamos que tiene programada una sesión de terapia:

📅 Fecha: ${fechaFormato}
👩‍⚕️ Psicóloga: ${s.psicologa_nombre} ${s.psicologa_apellido}
💰 Costo de la sesión: $750 MXN

Por favor realice el pago correspondiente antes de su sesión.

Si necesita reprogramar, contáctenos con anticipación.

¡Lo esperamos!

Clínica de Terapia Psicológica`;

      await pool.query(
        `INSERT INTO email_recordatorios (sesion_id, paciente_id, psicologa_id, email_paciente, asunto, contenido, fecha_sesion)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [s.id, s.paciente_id, s.psicologa_id, s.paciente_email, asunto, contenido, s.fecha_programada]
      );
      creados++;
    }

    return NextResponse.json({
      message: `Revisión completada: ${creados} recordatorios creados, ${omitidos} ya existían`,
      sesiones_manana: sesiones.length,
      creados,
      omitidos
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
