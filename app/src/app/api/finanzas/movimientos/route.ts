import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const banco_id = searchParams.get('banco_id');
    let query = `
      SELECT m.*, b.nombre as banco_nombre,
        u.nombre as autor_nombre, u.apellido as autor_apellido
      FROM movimientos_banco m
      JOIN bancos b ON m.banco_id = b.id
      LEFT JOIN usuarios u ON m.created_by = u.id
    `;
    const params: any[] = [];
    if (banco_id) { query += ' WHERE m.banco_id = ?'; params.push(Number(banco_id)); }
    query += ' ORDER BY m.fecha DESC, m.created_at DESC LIMIT 200';
    const [rows] = await db.query(query, params) as any[];
    const movimientos = (rows as any[]).map(m => ({
      ...m,
      fecha: m.fecha ? new Date(m.fecha).toISOString().split('T')[0] : m.fecha
    }));
    return NextResponse.json({ movimientos });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { banco_id, tipo, concepto, monto, fecha, metodo_pago, observaciones, created_by } = body;
    if (!banco_id || !monto || !fecha) {
      return NextResponse.json({ error: 'Faltan campos obligatorios (banco, monto, fecha)' }, { status: 400 });
    }
    const [result] = await db.query(
      'INSERT INTO movimientos_banco (banco_id, tipo, concepto, monto, fecha, metodo_pago, observaciones, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [banco_id, tipo || 'ingreso', concepto || null, monto, fecha, metodo_pago || 'efectivo', observaciones || null, created_by || null]
    ) as any[];
    return NextResponse.json({ id: (result as any).insertId, message: 'Movimiento registrado' }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });
    await db.query('DELETE FROM movimientos_banco WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Movimiento eliminado' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
