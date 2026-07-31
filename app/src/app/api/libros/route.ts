import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.query('SELECT * FROM libros WHERE activo = 1 ORDER BY titulo');
    return NextResponse.json({ libros: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { titulo, autor, precio, stock, descripcion } = body;
    if (!titulo || !precio) {
      return NextResponse.json({ error: 'Faltan campos obligatorios (titulo, precio)' }, { status: 400 });
    }
    const [result] = await db.query(
      `INSERT INTO libros (titulo, autor, precio, stock, descripcion) VALUES (?, ?, ?, ?, ?)`,
      [titulo, autor || null, precio, stock || 0, descripcion || null]
    ) as any[];
    return NextResponse.json({ id: result.insertId, message: 'Libro creado' }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, titulo, autor, precio, stock, descripcion, activo } = body;
    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });
    await db.query(
      `UPDATE libros SET titulo=COALESCE(?,titulo), autor=COALESCE(?,autor), precio=COALESCE(?,precio), stock=COALESCE(?,stock), descripcion=COALESCE(?,descripcion), activo=COALESCE(?,activo) WHERE id=?`,
      [titulo, autor, precio, stock, descripcion, activo, id]
    );
    return NextResponse.json({ message: 'Libro actualizado' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });
    await db.query('UPDATE libros SET activo = 0 WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Libro desactivado' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
