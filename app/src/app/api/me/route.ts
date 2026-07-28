import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('crm_session')?.value;
  if (!cookie) {
    return NextResponse.json({ user: { id: 0, nombre: 'Admin', email: 'admin@clinica.com', rol: 'lider' } });
  }
  try {
    const user = JSON.parse(atob(cookie));
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: { id: 0, nombre: 'Admin', email: 'admin@clinica.com', rol: 'lider' } });
  }
}
