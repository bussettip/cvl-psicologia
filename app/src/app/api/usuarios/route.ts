import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT id, email, nombre, apellido, telefono, rol, activo, created_at FROM usuarios ORDER BY nombre');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password_hash, nombre, apellido, telefono, rol } = body;
    
    const [result] = await pool.query(
      'INSERT INTO usuarios (email, password_hash, nombre, apellido, telefono, rol) VALUES (?, ?, ?, ?, ?, ?)',
      [email, password_hash, nombre, apellido, telefono, rol]
    );
    
    return NextResponse.json({ id: (result as any).insertId, message: 'Usuario creado' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
  }
}
