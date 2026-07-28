import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const estado = searchParams.get('estado');
    
    let query = `
      SELECT t.*, u.nombre as autor_nombre, u.apellido as autor_apellido
      FROM talleres t
      LEFT JOIN usuarios u ON t.created_by = u.id
    `;
    const params: any[] = [];
    
    if (estado) {
      query += ' WHERE t.estado = ?';
      params.push(estado);
    }
    
    query += ' ORDER BY t.fecha DESC, t.hora_inicio DESC';
    
    const [rows] = await db.query(query, params);
    return NextResponse.json({ talleres: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { titulo, descripcion, tema, fecha, hora_inicio, hora_fin, lugar, instructor, capacidad, publico_objetivo, materiales, created_by } = body;
    
    if (!titulo || !fecha) {
      return NextResponse.json({ error: 'Faltan campos obligatorios (titulo, fecha)' }, { status: 400 });
    }
    
    const [result] = await db.query(
      `INSERT INTO talleres (titulo, descripcion, tema, fecha, hora_inicio, hora_fin, lugar, instructor, capacidad, publico_objetivo, materiales, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [titulo, descripcion || null, tema || null, fecha, hora_inicio || null, hora_fin || null, lugar || null, instructor || null, capacidad || 0, publico_objetivo || null, materiales || null, created_by || null]
    ) as any[];
    
    return NextResponse.json({ id: result.insertId, message: 'Taller creado' }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, titulo, descripcion, tema, fecha, hora_inicio, hora_fin, lugar, instructor, capacidad, inscritos, estado, publico_objetivo, materiales, resultado } = body;
    
    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });
    
    await db.query(
      `UPDATE talleres SET titulo=COALESCE(?,titulo), descripcion=COALESCE(?,descripcion), tema=COALESCE(?,tema),
       fecha=COALESCE(?,fecha), hora_inicio=COALESCE(?,hora_inicio), hora_fin=COALESCE(?,hora_fin),
       lugar=COALESCE(?,lugar), instructor=COALESCE(?,instructor), capacidad=COALESCE(?,capacidad),
       inscritos=COALESCE(?,inscritos), estado=COALESCE(?,estado), publico_objetivo=COALESCE(?,publico_objetivo),
       materiales=COALESCE(?,materiales), resultado=COALESCE(?,resultado) WHERE id=?`,
      [titulo, descripcion, tema, fecha, hora_inicio, hora_fin, lugar, instructor, capacidad, inscritos, estado, publico_objetivo, materiales, resultado, id]
    );
    
    return NextResponse.json({ message: 'Taller actualizado' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });
    await db.query('DELETE FROM talleres WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Eliminado' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
