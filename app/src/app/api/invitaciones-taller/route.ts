import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET: Listar invitaciones con detalles
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const psicologa_id = searchParams.get('psicologa_id');
    const taller_id = searchParams.get('taller_id');
    const paciente_id = searchParams.get('paciente_id');
    
    let query = `
      SELECT ti.*, 
        t.titulo as taller_titulo, t.fecha as taller_fecha, t.hora_inicio as taller_hora, t.lugar as taller_lugar, t.estado as taller_estado, t.tema as taller_tema,
        p.nombre as paciente_nombre, p.apellido as paciente_apellido, p.telefono as paciente_telefono, p.email as paciente_email,
        u.nombre as psicologa_nombre, u.apellido as psicologa_apellido
      FROM taller_invitaciones ti
      JOIN talleres t ON ti.taller_id = t.id
      JOIN pacientes p ON ti.paciente_id = p.id
      JOIN usuarios u ON ti.psicologa_id = u.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];
    
    if (psicologa_id) { conditions.push('ti.psicologa_id = ?'); params.push(psicologa_id); }
    if (taller_id) { conditions.push('ti.taller_id = ?'); params.push(taller_id); }
    if (paciente_id) { conditions.push('ti.paciente_id = ?'); params.push(paciente_id); }
    
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY ti.created_at DESC';
    
    const [rows] = await db.query(query, params);
    return NextResponse.json({ invitaciones: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST: Crear invitación
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taller_id, paciente_id, psicologa_id, fecha_sesion, notas } = body;
    
    if (!taller_id || !paciente_id || !psicologa_id) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }
    
    // Check if already invited
    const [exist] = await db.query(
      'SELECT id FROM taller_invitaciones WHERE taller_id = ? AND paciente_id = ? AND estado != "cancelada"',
      [taller_id, paciente_id]
    ) as any[];
    
    if (exist.length > 0) {
      return NextResponse.json({ error: 'Este paciente ya está invitado a este taller' }, { status: 400 });
    }
    
    // Check capacity
    const [taller] = await db.query('SELECT capacidad, inscritos FROM talleres WHERE id = ?', [taller_id]) as any[];
    if (taller.length > 0 && taller[0].capacidad > 0 && taller[0].inscritos >= taller[0].capacidad) {
      return NextResponse.json({ error: 'El taller ha alcanzado su capacidad máxima' }, { status: 400 });
    }
    
    const [result] = await db.query(
      `INSERT INTO taller_invitaciones (taller_id, paciente_id, psicologa_id, fecha_sesion, notas)
       VALUES (?, ?, ?, ?, ?)`,
      [taller_id, paciente_id, psicologa_id, fecha_sesion || null, notas || null]
    ) as any[];
    
    // Increment inscritos
    await db.query('UPDATE talleres SET inscritos = inscritos + 1 WHERE id = ?', [taller_id]);
    
    return NextResponse.json({ id: result.insertId, message: 'Invitación creada' }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT: Actualizar estado de invitación
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, estado, notas, fecha_sesion } = body;
    
    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });
    
    await db.query(
      `UPDATE taller_invitaciones SET estado=COALESCE(?,estado), notas=COALESCE(?,notas), fecha_sesion=COALESCE(?,fecha_sesion) WHERE id=?`,
      [estado, notas, fecha_sesion, id]
    );
    
    // If cancelled, decrement inscritos
    if (estado === 'cancelada') {
      const [inv] = await db.query('SELECT taller_id FROM taller_invitaciones WHERE id = ?', [id]) as any[];
      if (inv.length > 0) {
        await db.query('UPDATE talleres SET inscritos = GREATEST(inscritos - 1, 0) WHERE id = ?', [inv[0].taller_id]);
      }
    }
    
    return NextResponse.json({ message: 'Invitación actualizada' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE: Eliminar invitación
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });
    
    const [inv] = await db.query('SELECT taller_id FROM taller_invitaciones WHERE id = ?', [id]) as any[];
    await db.query('DELETE FROM taller_invitaciones WHERE id = ?', [id]);
    if (inv.length > 0) {
      await db.query('UPDATE talleres SET inscritos = GREATEST(inscritos - 1, 0) WHERE id = ?', [inv[0].taller_id]);
    }
    
    return NextResponse.json({ message: 'Invitación eliminada' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
