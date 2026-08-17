import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const tallerId = req.nextUrl.searchParams.get('taller_id');
    let query = 'SELECT * FROM participantes_taller';
    const params: any[] = [];

    if (tallerId) {
      query += ' WHERE taller_id = ?';
      params.push(tallerId);
    }
    query += ' ORDER BY nombre_adolescente ASC';

    const [rows] = await db.execute(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener participantes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taller_id, participantes } = body;

    if (!taller_id || !participantes || !Array.isArray(participantes)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const results = [];
    for (const p of participantes) {
      const [result] = await db.execute(
        `INSERT INTO participantes_taller (taller_id, nombre_adolescente, nombre_padre, fecha_nacimiento, cantidad_pagada, fecha_pago, correo, whatsapp, comentarios)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          taller_id,
          p.nombre_adolescente || '',
          p.nombre_padre || null,
          p.fecha_nacimiento || null,
          p.cantidad_pagada || 0,
          p.fecha_pago || null,
          p.correo || null,
          p.whatsapp || null,
          p.comentarios || null,
        ]
      );
      results.push({ id: (result as any).insertId, nombre: p.nombre_adolescente });
    }

    // Actualizar inscritos en el taller
    await db.execute(
      'UPDATE talleres SET inscritos = (SELECT COUNT(*) FROM participantes_taller WHERE taller_id = ?) WHERE id = ?',
      [taller_id, taller_id]
    );

    return NextResponse.json({ ok: true, inserted: results.length, participantes: results });
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar participantes' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    const tallerId = req.nextUrl.searchParams.get('taller_id');

    if (id) {
      await db.execute('DELETE FROM participantes_taller WHERE id = ?', [id]);
    } else if (tallerId) {
      await db.execute('DELETE FROM participantes_taller WHERE taller_id = ?', [tallerId]);
      await db.execute('UPDATE talleres SET inscritos = 0 WHERE id = ?', [tallerId]);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar participante' }, { status: 500 });
  }
}
