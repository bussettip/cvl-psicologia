import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fecha = searchParams.get('fecha');
    const mes = searchParams.get('mes');
    const anio = searchParams.get('anio');

    let query = `
      SELECT e.*, 
        sol.nombre as solicitante_nombre, sol.apellido as solicitante_apellido,
        rec.nombre as receptor_nombre, rec.apellido as receptor_apellido
      FROM entregas_dinero e
      JOIN usuarios sol ON e.psicologa_id = sol.id
      JOIN usuarios rec ON e.receptor_id = rec.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (fecha) { conditions.push('DATE(e.fecha) = DATE(?)'); params.push(fecha); }
    if (mes && anio) { conditions.push('MONTH(e.fecha) = ? AND YEAR(e.fecha) = ?'); params.push(Number(mes), Number(anio)); }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY e.created_at DESC';

    const [rows] = await db.query(query, params);
    const entregas = (rows as any[]).map(e => ({
      ...e,
      fecha: e.fecha ? new Date(e.fecha).toISOString().split('T')[0] : e.fecha,
      firma_fecha: e.firma_fecha ? new Date(e.firma_fecha).toISOString() : null
    }));
    return NextResponse.json({ entregas });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { psicologa_id, receptor_id, monto, fecha, hora, concepto, observaciones } = body;

    if (!psicologa_id || !receptor_id || !monto || !fecha) {
      return NextResponse.json({ error: 'Faltan campos obligatorios (solicitante, receptor, monto, fecha)' }, { status: 400 });
    }
    if (psicologa_id === receptor_id) {
      return NextResponse.json({ error: 'El solicitante y el receptor no pueden ser la misma persona' }, { status: 400 });
    }

    const [result] = await db.query(
      `INSERT INTO entregas_dinero (psicologa_id, receptor_id, monto, fecha, hora, concepto, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [psicologa_id, receptor_id, monto, fecha, hora || null, concepto || null, observaciones || null]
    ) as any[];

    return NextResponse.json({ id: result.insertId, message: 'Entrega registrada' }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, estado, observaciones, firma_digital, firma_metodo } = body;

    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });

    const updates: string[] = [];
    const params: any[] = [];

    if (estado) { updates.push('estado = ?'); params.push(estado); }
    if (observaciones !== undefined) { updates.push('observaciones = ?'); params.push(observaciones); }
    if (firma_digital) {
      updates.push('firma_digital = ?'); params.push(firma_digital);
      updates.push('firma_fecha = NOW()');
      updates.push('firma_metodo = ?'); params.push(firma_metodo || 'password');
    }

    if (updates.length === 0) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });

    params.push(id);
    await db.query(`UPDATE entregas_dinero SET ${updates.join(', ')} WHERE id = ?`, params);

    return NextResponse.json({ message: 'Entrega actualizada' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
