import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
    }
    const [rows] = await db.query(
      'SELECT id, nombre, apellido, email, rol, telefono FROM usuarios WHERE email = ? AND password_hash = ? AND activo = TRUE',
      [email, password]
    ) as any[];
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }
    const user = rows[0];
    if (user.rol !== 'psicologa') {
      return NextResponse.json({ error: 'Este acceso es solo para psicólogas' }, { status: 403 });
    }
    const response = NextResponse.json({ user });
    response.cookies.set('psicologa_user', Buffer.from(JSON.stringify(user)).toString('base64'), { httpOnly: false, secure: false, sameSite: 'lax', path: '/', maxAge: 86400 });
    return response;
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
