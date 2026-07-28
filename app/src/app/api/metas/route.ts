import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const programaId = searchParams.get('programa_id');
    
    if (!programaId) {
      return NextResponse.json({ error: 'programa_id requerido' }, { status: 400 });
    }
    
    const [rows] = await pool.query(
      'SELECT * FROM metas_programa WHERE programa_id = ? ORDER BY sesion_numero ASC',
      [programaId]
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener metas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { programa_id, sesion_numero, titulo, descripcion, categoria } = body;
    
    const [result] = await pool.query(
      'INSERT INTO metas_programa (programa_id, sesion_numero, titulo, descripcion, categoria, orden) VALUES (?, ?, ?, ?, ?, ?)',
      [programa_id, sesion_numero, titulo, descripcion, categoria, sesion_numero]
    );
    
    return NextResponse.json({ id: (result as any).insertId, message: 'Meta creada' }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Ya existe una meta para esta sesión' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Error al crear meta' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, titulo, descripcion, categoria, sesion_numero } = body;
    
    await pool.query(
      'UPDATE metas_programa SET titulo = COALESCE(?, titulo), descripcion = COALESCE(?, descripcion), categoria = COALESCE(?, categoria), sesion_numero = COALESCE(?, sesion_numero), orden = COALESCE(?, sesion_numero) WHERE id = ?',
      [titulo, descripcion, categoria, sesion_numero, sesion_numero, id]
    );
    
    return NextResponse.json({ message: 'Meta actualizada' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar meta' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'id requerido' }, { status: 400 });
    }
    
    await pool.query('DELETE FROM metas_programa WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Meta eliminada' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar meta' }, { status: 500 });
  }
}
