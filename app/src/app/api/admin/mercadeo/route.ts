import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const estado = searchParams.get('estado');
    const tipo = searchParams.get('tipo');
    
    let query = `
      SELECT m.*, u.nombre as autor_nombre, u.apellido as autor_apellido
      FROM mercadeo m
      LEFT JOIN usuarios u ON m.created_by = u.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];
    
    if (estado) { conditions.push('m.estado = ?'); params.push(estado); }
    if (tipo) { conditions.push('m.tipo = ?'); params.push(tipo); }
    
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY m.created_at DESC';
    
    const [rows] = await db.query(query, params);
    return NextResponse.json({ mercadeo: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { titulo, descripcion, tipo, plataforma, fecha_inicio, fecha_fin, estado, contenido, created_by } = body;
    
    if (!titulo || !tipo) {
      return NextResponse.json({ error: 'Faltan campos obligatorios (titulo, tipo)' }, { status: 400 });
    }
    
    const [result] = await db.query(
      `INSERT INTO mercadeo (titulo, descripcion, tipo, plataforma, fecha_inicio, fecha_fin, estado, contenido, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [titulo, descripcion || null, tipo, plataforma || null, fecha_inicio || null, fecha_fin || null, estado || 'borrador', contenido || null, created_by || null]
    ) as any[];
    
    return NextResponse.json({ id: result.insertId, message: 'Publicación creada' }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, titulo, descripcion, tipo, plataforma, fecha_inicio, fecha_fin, estado, contenido, resultado } = body;
    
    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });
    
    await db.query(
      `UPDATE mercadeo SET titulo=COALESCE(?,titulo), descripcion=COALESCE(?,descripcion), tipo=COALESCE(?,tipo),
       plataforma=COALESCE(?,plataforma), fecha_inicio=COALESCE(?,fecha_inicio), fecha_fin=COALESCE(?,fecha_fin),
       estado=COALESCE(?,estado), contenido=COALESCE(?,contenido), resultado=COALESCE(?,resultado) WHERE id=?`,
      [titulo, descripcion, tipo, plataforma, fecha_inicio, fecha_fin, estado, contenido, resultado, id]
    );
    
    return NextResponse.json({ message: 'Publicación actualizada' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });
    await db.query('DELETE FROM mercadeo WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Eliminado' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
