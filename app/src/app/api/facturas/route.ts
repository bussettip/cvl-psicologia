import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const anio = searchParams.get('anio');
    const mes = searchParams.get('mes');

    let query = 'SELECT * FROM facturas';
    const params: any[] = [];
    const conditions: string[] = [];

    if (anio) { conditions.push('anio = ?'); params.push(Number(anio)); }
    if (mes) { conditions.push('mes = ?'); params.push(Number(mes)); }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY fecha DESC, created_at DESC LIMIT 1000';

    const [rows] = await db.query(query, params) as any[];
    return NextResponse.json({ facturas: rows as any[] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });

    const [rows] = await db.query('SELECT * FROM facturas WHERE id = ?', [id]) as any[];
    if ((rows as any[]).length === 0) return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });

    const factura = (rows as any[])[0];
    if (factura.archivo_xml) {
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'facturas', path.basename(factura.archivo_xml));
      try { await unlink(filePath); } catch { /* archivo ya no existe */ }
    }

    await db.query('DELETE FROM facturas WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Factura eliminada' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
