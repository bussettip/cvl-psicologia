import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fecha = searchParams.get('fecha');
    const fecha_inicio = searchParams.get('fecha_inicio');
    const fecha_fin = searchParams.get('fecha_fin');
    const psicologa_id = searchParams.get('psicologa_id');
    const paciente_id = searchParams.get('paciente_id');
    const estado = searchParams.get('estado');

    let query = `
      SELECT c.*,
        p.nombre as paciente_nombre, p.apellido as paciente_apellido, p.telefono as paciente_telefono,
        u.nombre as psicologa_nombre, u.apellido as psicologa_apellido
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      JOIN usuarios u ON c.psicologa_id = u.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (fecha) { conditions.push('DATE(c.fecha) = DATE(?)'); params.push(fecha); }
    if (fecha_inicio && fecha_fin) { conditions.push('DATE(c.fecha) BETWEEN DATE(?) AND DATE(?)'); params.push(fecha_inicio, fecha_fin); }
    if (psicologa_id) { conditions.push('c.psicologa_id = ?'); params.push(Number(psicologa_id)); }
    if (paciente_id) { conditions.push('c.paciente_id = ?'); params.push(Number(paciente_id)); }
    if (estado) { conditions.push('c.estado = ?'); params.push(estado); }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY c.fecha ASC, c.hora_inicio ASC';

    const [rows] = await db.query(query, params);
    const citas = (rows as any[]).map(c => ({
      ...c,
      fecha: c.fecha ? new Date(c.fecha).toISOString().split('T')[0] : c.fecha
    }));
    return NextResponse.json({ citas });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paciente_id, psicologa_id, fecha, hora_inicio, hora_fin, tipo, motivo, notas, created_by } = body;

    if (!paciente_id || !psicologa_id || !fecha || !hora_inicio) {
      return NextResponse.json({ error: 'Faltan campos obligatorios (paciente, psicóloga, fecha, hora)' }, { status: 400 });
    }

    const [result] = await db.query(
      `INSERT INTO citas (paciente_id, psicologa_id, fecha, hora_inicio, hora_fin, tipo, motivo, notas, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [paciente_id, psicologa_id, fecha, hora_inicio, hora_fin || null, tipo || 'sesion', motivo || null, notas || null, created_by || null]
    ) as any[];

    return NextResponse.json({ id: result.insertId, message: 'Cita programada' }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, estado, notas, hora_fin } = body;

    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });

    const updates: string[] = [];
    const params: any[] = [];

    if (estado) { updates.push('estado = ?'); params.push(estado); }
    if (notas !== undefined) { updates.push('notas = ?'); params.push(notas); }
    if (hora_fin) { updates.push('hora_fin = ?'); params.push(hora_fin); }

    if (updates.length === 0) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });

    params.push(id);
    await db.query(`UPDATE citas SET ${updates.join(', ')} WHERE id = ?`, params);

    return NextResponse.json({ message: 'Cita actualizada' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });
    await db.query('DELETE FROM citas WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Cita eliminada' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
