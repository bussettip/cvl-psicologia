import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.nombre as actualizado_nombre, u.apellido as actualizado_apellido
       FROM reglas_clinica r
       LEFT JOIN usuarios u ON r.actualizado_por = u.id
       ORDER BY r.id ASC`
    );
    return NextResponse.json({ reglas: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, items, actualizado_por } = body;

    if (!id || !items) {
      return NextResponse.json({ error: 'Faltan id o items' }, { status: 400 });
    }

    await pool.query(
      `UPDATE reglas_clinica SET items = ?, actualizado_por = ? WHERE id = ?`,
      [JSON.stringify(items), actualizado_por || null, id]
    );

    return NextResponse.json({ message: 'Regla actualizada' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { seccion, titulo, items, actualizado_por } = body;

    if (!seccion || !titulo || !items) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const [result] = await pool.query(
      `INSERT INTO reglas_clinica (seccion, titulo, items, actualizado_por) VALUES (?, ?, ?, ?)`,
      [seccion, titulo, JSON.stringify(items), actualizado_por || null]
    ) as any[];

    return NextResponse.json({ id: result.insertId, message: 'Regla creada' }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 });

    await pool.query('DELETE FROM reglas_clinica WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Regla eliminada' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
