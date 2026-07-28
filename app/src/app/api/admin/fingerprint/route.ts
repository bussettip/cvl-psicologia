import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');

    let query = 'SELECT id, user_id, credential_id, created_at FROM fingerprint_credentials';
    const params: any[] = [];

    if (userId) {
      query += ' WHERE user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY created_at DESC';
    const [rows] = await db.query(query, params);
    return NextResponse.json({ credentials: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { credentialId, userId, userName } = body;

    if (!credentialId || !userId) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const [exist] = await db.query(
      'SELECT id FROM fingerprint_credentials WHERE credential_id = ?',
      [credentialId]
    ) as any[];

    if (exist.length > 0) {
      return NextResponse.json({ message: 'La huella ya está registrada' });
    }

    const [result] = await db.query(
      'INSERT INTO fingerprint_credentials (user_id, credential_id, user_name) VALUES (?, ?, ?)',
      [userId, credentialId, userName || '']
    ) as any[];

    return NextResponse.json({ id: result.insertId, message: 'Huella registrada exitosamente' }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('user_id');

    if (id) {
      await db.query('DELETE FROM fingerprint_credentials WHERE id = ?', [id]);
    } else if (userId) {
      await db.query('DELETE FROM fingerprint_credentials WHERE user_id = ?', [userId]);
    } else {
      return NextResponse.json({ error: 'Falta ID' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Eliminado' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
