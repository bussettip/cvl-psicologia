import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
    }

    const [rows] = await db.query(
      'SELECT id, nombre, apellido, email, rol FROM usuarios WHERE email = ? AND password_hash = ? AND activo = TRUE',
      [email, password]
    );

    const users = rows as any[];
    if (users.length === 0) {
      return NextResponse.json({ valid: false, error: 'Credenciales incorrectas' }, { status: 401 });
    }

    const u = users[0];
    return NextResponse.json({
      valid: true,
      usuario: { id: u.id, nombre: u.nombre, apellido: u.apellido, email: u.email, rol: u.rol }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
