import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.nombre as autor_nombre, u.apellido as autor_apellido
      FROM presupuestos p
      LEFT JOIN usuarios u ON p.created_by = u.id
      ORDER BY p.fecha DESC, p.created_at DESC
    `);
    return NextResponse.json({ presupuestos: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { titulo, descripcion, fecha, monto, archivo_url, archivo_nombre, created_by } = body;

    if (!titulo || !fecha) {
      return NextResponse.json({ error: 'Título y fecha son obligatorios' }, { status: 400 });
    }

    const [result] = await db.query(
      'INSERT INTO presupuestos (titulo, descripcion, fecha, monto, archivo_url, archivo_nombre, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [titulo, descripcion || null, fecha, monto || null, archivo_url || null, archivo_nombre || null, created_by || null]
    );

    return NextResponse.json({ id: (result as any).insertId, message: 'Presupuesto creado' }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Falta ID' }, { status: 400 });
    }

    await db.query('DELETE FROM presupuestos WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Presupuesto eliminado' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
