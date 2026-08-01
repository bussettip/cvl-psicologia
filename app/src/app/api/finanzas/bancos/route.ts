import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [bancos] = await db.query(`
      SELECT b.*,
        (SELECT COALESCE(SUM(CASE WHEN m.tipo = 'ingreso' THEN m.monto ELSE -m.monto END),0)
         FROM movimientos_banco m WHERE m.banco_id = b.id) as movimientos,
        (SELECT COUNT(*) FROM movimientos_banco m WHERE m.banco_id = b.id) as num_movimientos
      FROM bancos b
      ORDER BY b.nombre
    `) as any[];

    const cuentas = (bancos as any[]).map(b => ({
      ...b,
      saldo: Number(b.saldo_inicial || 0) + Number(b.movimientos || 0)
    }));

    const [movimientos] = await db.query(`
      SELECT m.*, b.nombre as banco_nombre,
        u.nombre as autor_nombre, u.apellido as autor_apellido
      FROM movimientos_banco m
      JOIN bancos b ON m.banco_id = b.id
      LEFT JOIN usuarios u ON m.created_by = u.id
      ORDER BY m.fecha DESC, m.created_at DESC
      LIMIT 100
    `) as any[];

    return NextResponse.json({ bancos: cuentas, movimientos });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, banco, numero_cuenta, tipo, saldo_inicial, created_by } = body;
    if (!nombre) {
      return NextResponse.json({ error: 'El nombre de la cuenta es obligatorio' }, { status: 400 });
    }
    const [result] = await db.query(
      'INSERT INTO bancos (nombre, banco, numero_cuenta, tipo, saldo_inicial, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, banco || null, numero_cuenta || null, tipo || 'cuenta', saldo_inicial || 0, created_by || null]
    ) as any[];
    return NextResponse.json({ id: (result as any).insertId, message: 'Banco agregado' }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, nombre, banco, numero_cuenta, tipo, saldo_inicial } = body;
    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });
    await db.query(
      'UPDATE bancos SET nombre=COALESCE(?,nombre), banco=COALESCE(?,banco), numero_cuenta=COALESCE(?,numero_cuenta), tipo=COALESCE(?,tipo), saldo_inicial=COALESCE(?,saldo_inicial) WHERE id=?',
      [nombre, banco, numero_cuenta, tipo, saldo_inicial, id]
    );
    return NextResponse.json({ message: 'Banco actualizado' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });
    await db.query('DELETE FROM bancos WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Banco eliminado' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
