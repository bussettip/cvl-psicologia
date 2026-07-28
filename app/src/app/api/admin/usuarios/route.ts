import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET: Listar todos los usuarios o filtrar por rol
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rol = searchParams.get('rol');
    
    let query = 'SELECT id, nombre, apellido, email, telefono, rol, activo, created_at, avatar_url FROM usuarios';
    const params: any[] = [];
    
    if (rol) {
      query += ' WHERE rol = ?';
      params.push(rol);
    }
    
    query += ' ORDER BY nombre ASC';
    const [rows] = await db.query(query, params);
    return NextResponse.json({ usuarios: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST: Crear nuevo usuario
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, apellido, email, password_hash, rol, telefono, direccion, avatar_url } = body;
    
    if (!nombre || !apellido || !email || !password_hash || !rol) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }
    
    // Verificar que el email no exista
    const [exist] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]) as any[];
    if (exist.length > 0) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 });
    }
    
    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, apellido, email, password_hash, rol, telefono, direccion, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellido, email, password_hash, rol, telefono || null, direccion || null, avatar_url || null]
    ) as any[];
    
    return NextResponse.json({ id: result.insertId, message: 'Usuario creado exitosamente' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT: Actualizar usuario
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, nombre, apellido, email, password_hash, rol, telefono, activo, direccion, avatar_url } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Falta el ID del usuario' }, { status: 400 });
    }
    
    let query = 'UPDATE usuarios SET nombre=?, apellido=?, email=?, rol=?, telefono=?, activo=?, direccion=?, avatar_url=?';
    const params: any[] = [nombre, apellido, email, rol, telefono || null, activo !== undefined ? activo : 1, direccion || null, avatar_url || null];
    
    if (password_hash && password_hash.trim() !== '') {
      query += ', password_hash=?';
      params.push(password_hash);
    }
    
    query += ' WHERE id=?';
    params.push(id);
    
    await db.query(query, params);
    return NextResponse.json({ message: 'Usuario actualizado' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE: Desactivar o eliminar usuario
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const hard = searchParams.get('hard');
    
    if (!id) {
      return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });
    }
    
    if (hard === 'true') {
      await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
      return NextResponse.json({ message: 'Usuario eliminado permanentemente' });
    }
    
    await db.query('UPDATE usuarios SET activo = 0 WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Usuario desactivado' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
