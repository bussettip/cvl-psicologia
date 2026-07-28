import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET: Listar notas de un paciente
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paciente_id = searchParams.get('paciente_id');
    
    if (!paciente_id) {
      return NextResponse.json({ error: 'Falta paciente_id' }, { status: 400 });
    }
    
    const [rows] = await db.query(
      `SELECT n.*, u.nombre as autor_nombre, u.apellido as autor_apellido
       FROM notas_paciente n
       JOIN usuarios u ON n.autor_id = u.id
       WHERE n.paciente_id = ?
       ORDER BY n.created_at DESC`,
      [paciente_id]
    );
    
    return NextResponse.json({ notas: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST: Crear nota
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paciente_id, asignacion_id, autor_id, autor_rol, tipo, contenido, calificacion, paso_tratamiento } = body;
    
    if (!paciente_id || !autor_id || !tipo || !contenido) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }
    
    const [result] = await db.query(
      `INSERT INTO notas_paciente (paciente_id, asignacion_id, autor_id, autor_rol, tipo, contenido, calificacion, paso_tratamiento)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [paciente_id, asignacion_id || null, autor_id, autor_rol, tipo, contenido, calificacion || null, paso_tratamiento || null]
    ) as any[];
    
    return NextResponse.json({ id: result.insertId, message: 'Nota guardada' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
