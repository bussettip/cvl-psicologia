import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { credentialId } = body;

    if (!credentialId) {
      return NextResponse.json({ error: 'Credencial faltante' }, { status: 400 });
    }

    const [rows] = await db.query(
      `SELECT fc.*, u.id as uid, u.nombre, u.apellido, u.email, u.rol, u.activo, u.avatar_url
       FROM fingerprint_credentials fc
       JOIN usuarios u ON fc.user_id = u.id
       WHERE fc.credential_id = ? AND u.activo = 1`,
      [credentialId]
    ) as any[];

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Huella no registrada o usuario inactivo' }, { status: 401 });
    }

    const user = rows[0];

    return NextResponse.json({
      user: {
        id: user.uid,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
        avatar_url: user.avatar_url
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
