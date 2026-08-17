import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const tallerId = req.nextUrl.searchParams.get('taller_id');
    let query = `
      SELECT d.*, t.titulo as taller_titulo, t.fecha as taller_fecha
      FROM diplomas d
      JOIN talleres t ON d.taller_id = t.id
    `;
    const params: any[] = [];

    if (tallerId) {
      query += ' WHERE d.taller_id = ?';
      params.push(tallerId);
    }
    query += ' ORDER BY d.nombre_adolescente ASC';

    const [rows] = await db.execute(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener diplomas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taller_id } = body;

    if (!taller_id) {
      return NextResponse.json({ error: 'taller_id requerido' }, { status: 400 });
    }

    // Obtener todos los participantes del taller
    const [participantes] = await db.execute(
      'SELECT * FROM participantes_taller WHERE taller_id = ?',
      [taller_id]
    ) as any[];

    if (participantes.length === 0) {
      return NextResponse.json({ error: 'No hay participantes registrados' }, { status: 400 });
    }

    // Eliminar diplomas existentes del taller para regenerar
    await db.execute('DELETE FROM diplomas WHERE taller_id = ?', [taller_id]);

    // Crear un diploma por cada participante
    const results = [];
    for (const p of participantes) {
      const [result] = await db.execute(
        `INSERT INTO diplomas (taller_id, participante_id, nombre_adolescente, nombre_padre)
         VALUES (?, ?, ?, ?)`,
        [taller_id, p.id, p.nombre_adolescente, p.nombre_padre]
      );
      results.push({ id: (result as any).insertId, nombre: p.nombre_adolescente });
    }

    return NextResponse.json({ ok: true, generated: results.length, diplomas: results });
  } catch (error) {
    return NextResponse.json({ error: 'Error al generar diplomas' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, impreso } = body;

    if (!id) {
      return NextResponse.json({ error: 'id requerido' }, { status: 400 });
    }

    await db.execute(
      'UPDATE diplomas SET impreso = ?, fecha_impresion = IF(? = 1, NOW(), NULL) WHERE id = ?',
      [impreso ? 1 : 0, impreso ? 1 : 0, id]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar diploma' }, { status: 500 });
  }
}
