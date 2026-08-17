import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const [rows] = await db.execute('SELECT * FROM talleres ORDER BY fecha DESC');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener talleres' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { titulo, descripcion, tema, fecha, hora_inicio, hora_fin, lugar, instructor, capacidad, publico_objetivo, diploma_template } = body;

    const [result] = await db.execute(
      `INSERT INTO talleres (titulo, descripcion, tema, fecha, hora_inicio, hora_fin, lugar, instructor, capacidad, publico_objetivo, diploma_template, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')`,
      [titulo, descripcion || null, tema || null, fecha, hora_inicio || null, hora_fin || null, lugar || null, instructor || null, capacidad || 0, publico_objetivo || null, diploma_template || null]
    );

    return NextResponse.json({ ok: true, id: (result as any).insertId });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear taller' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...fields } = body;

    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

    const sets = Object.keys(fields).map(k => `${k} = ?`).join(', ');
    const values = Object.values(fields);

    await db.execute(`UPDATE talleres SET ${sets} WHERE id = ?`, [...values, id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar taller' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });
    await db.execute('DELETE FROM talleres WHERE id = ?', [id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar taller' }, { status: 500 });
  }
}
