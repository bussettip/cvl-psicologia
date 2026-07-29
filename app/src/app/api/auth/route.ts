import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    const users = rows as any[];
    if (users.length === 0) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }
    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }
    const response = NextResponse.json({ user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
    response.cookies.set('crm_session', Buffer.from(JSON.stringify({ id: user.id, email: user.email, nombre: user.nombre, rol: user.rol })).toString('base64'), { httpOnly: false, secure: false, sameSite: 'lax', path: '/', maxAge: 86400 });
    return response;
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
