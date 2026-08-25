import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const tallerId = req.nextUrl.searchParams.get('taller_id');
    if (!tallerId) {
      return NextResponse.json({ error: 'taller_id requerido' }, { status: 400 });
    }
    const [rows] = await db.execute(
      'SELECT diploma_template, diploma_config FROM talleres WHERE id = ?',
      [tallerId]
    ) as any[];
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 });
    }
    const r = rows[0];
    return NextResponse.json({
      template: r.diploma_template,
      config: r.diploma_config ? (typeof r.diploma_config === 'string' ? JSON.parse(r.diploma_config) : r.diploma_config) : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taller_id, config } = body;
    if (!taller_id) {
      return NextResponse.json({ error: 'taller_id requerido' }, { status: 400 });
    }
    await db.execute(
      'UPDATE talleres SET diploma_config = ? WHERE id = ?',
      [JSON.stringify(config), taller_id]
    );
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
