import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'comprobantes');

interface ComprobanteRow extends RowDataPacket {
  id: number;
  banco: string;
  archivo_pdf: string;
  nombre_original: string | null;
  fecha: string | null;
  monto: number | null;
  concepto: string | null;
}

export async function GET() {
  try {
    const [rows] = await db.query<ComprobanteRow[]>(`
      SELECT c.*, u.nombre as autor_nombre, u.apellido as autor_apellido
      FROM comprobantes_bancarios c
      LEFT JOIN usuarios u ON c.created_by = u.id
      ORDER BY c.fecha DESC, c.created_at DESC
    `);
    return NextResponse.json({ comprobantes: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const banco = (formData.get('banco') as string) || '';
    const fecha = (formData.get('fecha') as string) || null;
    const monto = formData.get('monto') as string;
    const concepto = (formData.get('concepto') as string) || null;
    const created_by = formData.get('created_by') as string;
    const file = formData.get('file') as File | null;

    if (!banco) {
      return NextResponse.json({ error: 'El banco es obligatorio' }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: 'El archivo PDF es obligatorio' }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (ext !== '.pdf') {
      return NextResponse.json({ error: 'Solo se permiten archivos PDF' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await mkdir(UPLOAD_DIR, { recursive: true });

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${timestamp}_${safeName}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/comprobantes/${fileName}`;

    const [result] = await db.query<ResultSetHeader>(
      'INSERT INTO comprobantes_bancarios (banco, archivo_pdf, nombre_original, fecha, monto, concepto, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [banco, fileUrl, file.name, fecha, monto ? Number(monto) : null, concepto, created_by ? Number(created_by) : null]
    );

    return NextResponse.json({ id: result.insertId, message: 'Comprobante guardado' }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });

    const [rows] = await db.query<ComprobanteRow[]>('SELECT * FROM comprobantes_bancarios WHERE id = ?', [id]);
    if (rows.length === 0) return NextResponse.json({ error: 'Comprobante no encontrado' }, { status: 404 });

    const comp = rows[0];
    if (comp.archivo_pdf) {
      const filePath = path.join(UPLOAD_DIR, path.basename(comp.archivo_pdf));
      try { await unlink(filePath); } catch { /* archivo ya no existe */ }
    }

    await db.query('DELETE FROM comprobantes_bancarios WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Comprobante eliminado' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
