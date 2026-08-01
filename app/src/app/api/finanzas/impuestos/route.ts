import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT i.*, u.nombre as autor_nombre, u.apellido as autor_apellido
      FROM impuestos i
      LEFT JOIN usuarios u ON i.created_by = u.id
      ORDER BY i.vencimiento IS NULL, i.vencimiento ASC, i.fecha DESC
    `) as any[];
    const impuestos = (rows as any[]).map(i => ({
      ...i,
      fecha: i.fecha ? new Date(i.fecha).toISOString().split('T')[0] : i.fecha,
      vencimiento: i.vencimiento ? new Date(i.vencimiento).toISOString().split('T')[0] : null
    }));
    return NextResponse.json({ impuestos });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { concepto, tipo, monto, fecha, vencimiento, estado, observaciones, created_by } = body;
    if (!concepto || !monto || !fecha) {
      return NextResponse.json({ error: 'Faltan campos obligatorios (concepto, monto, fecha)' }, { status: 400 });
    }
    const [result] = await db.query(
      'INSERT INTO impuestos (concepto, tipo, monto, fecha, vencimiento, estado, observaciones, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [concepto, tipo || 'IVA', monto, fecha, vencimiento || null, estado || 'pendiente', observaciones || null, created_by || null]
    ) as any[];
    return NextResponse.json({ id: (result as any).insertId, message: 'Impuesto registrado' }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, concepto, tipo, monto, fecha, vencimiento, estado, observaciones } = body;
    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });
    await db.query(
      `UPDATE impuestos SET
        concepto=COALESCE(?,concepto), tipo=COALESCE(?,tipo), monto=COALESCE(?,monto),
        fecha=COALESCE(?,fecha), vencimiento=COALESCE(?,vencimiento), estado=COALESCE(?,estado),
        observaciones=COALESCE(?,observaciones)
        WHERE id=?`,
      [concepto, tipo, monto, fecha, vencimiento, estado, observaciones, id]
    );
    return NextResponse.json({ message: 'Impuesto actualizado' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });
    await db.query('DELETE FROM impuestos WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Impuesto eliminado' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
