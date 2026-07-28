import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fecha = searchParams.get('fecha');
    const mes = searchParams.get('mes');
    const anio = searchParams.get('anio');
    const id = searchParams.get('id');

    let query = `
      SELECT g.*,
        sp.nombre as solicitante_nombre, sp.apellido as solicitante_apellido,
        au.nombre as autorizador_nombre, au.apellido as autorizador_apellido
      FROM gastos_caja_chica g
      JOIN usuarios sp ON g.solicitado_por = sp.id
      LEFT JOIN usuarios au ON g.autorizado_por = au.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (id) { conditions.push('g.id = ?'); params.push(Number(id)); }
    if (fecha) { conditions.push('DATE(g.fecha) = DATE(?)'); params.push(fecha); }
    if (mes && anio) { conditions.push('MONTH(g.fecha) = ? AND YEAR(g.fecha) = ?'); params.push(Number(mes), Number(anio)); }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY g.created_at DESC';

    const [rows] = await db.query(query, params);
    const gastos = (rows as any[]).map(g => ({
      ...g,
      fecha: g.fecha ? new Date(g.fecha).toISOString().split('T')[0] : g.fecha,
      firma_fecha: g.firma_fecha ? new Date(g.firma_fecha).toISOString() : null
    }));
    return NextResponse.json(id ? (gastos[0] || null) : { gastos });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { solicitado_por, autorizado_por, proveedor, concepto, monto, metodo_pago, fecha, comprobante_url, observaciones } = body;

    if (!solicitado_por || !concepto || !monto || !fecha) {
      return NextResponse.json({ error: 'Faltan campos obligatorios (solicitante, concepto, monto, fecha)' }, { status: 400 });
    }

    const [result] = await db.query(
      `INSERT INTO gastos_caja_chica (solicitado_por, autorizado_por, proveedor, concepto, monto, metodo_pago, fecha, comprobante_url, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [solicitado_por, autorizado_por || null, proveedor || null, concepto, monto, metodo_pago || 'efectivo', fecha, comprobante_url || null, observaciones || null]
    ) as any[];

    return NextResponse.json({ id: result.insertId, message: 'Gasto registrado' }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, estado, autorizado_por, observaciones, firma_digital, firma_metodo } = body;

    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });

    const updates: string[] = [];
    const params: any[] = [];

    if (estado) { updates.push('estado = ?'); params.push(estado); }
    if (autorizado_por) { updates.push('autorizado_por = ?'); params.push(autorizado_por); }
    if (observaciones !== undefined) { updates.push('observaciones = ?'); params.push(observaciones); }
    if (firma_digital) {
      updates.push('firma_digital = ?'); params.push(firma_digital);
      updates.push('firma_fecha = NOW()'); 
      updates.push('firma_metodo = ?'); params.push(firma_metodo || 'password');
    }

    if (updates.length === 0) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });

    params.push(id);
    await db.query(`UPDATE gastos_caja_chica SET ${updates.join(', ')} WHERE id = ?`, params);

    return NextResponse.json({ message: 'Gasto actualizado' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });
    await db.query('DELETE FROM gastos_caja_chica WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Gasto eliminado' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
