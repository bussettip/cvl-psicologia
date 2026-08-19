import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['txt', 'csv', 'xlsx', 'xls'].includes(ext || '')) {
      return NextResponse.json({ error: 'Formato no soportado. Use .txt, .csv, .xlsx o .xls' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let rows: any[] = [];

    if (ext === 'txt' || ext === 'csv') {
      const text = buffer.toString('utf-8');
      const lines = text.split('\n').filter(l => l.trim());
      for (const line of lines) {
        const parts = line.split(/[,;\t]/).map(s => s.trim());
        if (parts.length >= 2) {
          rows.push({ email: parts[0], nombre: parts[1], apellido: parts[2] || '', telefono: parts[3] || '' });
        } else if (parts.length === 1 && parts[0].includes('@')) {
          rows.push({ email: parts[0], nombre: '', apellido: '', telefono: '' });
        }
      }
    } else {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      for (const row of data) {
        const r = row as Record<string, any>;
        const email = r.email || r.correo || r.Email || r.Correo || '';
        const nombre = r.nombre || r.Nombre || r.firstname || r.first_name || '';
        const apellido = r.apellido || r.Apellido || r.lastname || r.last_name || '';
        const telefono = r.telefono || r.Telefono || r.phone || r.Phone || '';
        if (email && email.includes('@')) {
          rows.push({ email, nombre, apellido, telefono });
        }
      }
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No se encontraron contactos válidos en el archivo' }, { status: 400 });
    }

    let insertados = 0;
    let duplicados = 0;
    let errores = 0;
    const erroresLista: string[] = [];

    for (const row of rows) {
      try {
        const [existing] = await pool.query(
          'SELECT id FROM pacientes WHERE email = ?',
          [row.email]
        ) as any[];
        if (existing.length > 0) {
          duplicados++;
          continue;
        }
        await pool.query(
          'INSERT INTO pacientes (nombre, apellido, email, telefono, estado) VALUES (?, ?, ?, ?, ?)',
          [row.nombre || 'Sin nombre', row.apellido || '', row.email, row.telefono || null, 'activo']
        );
        insertados++;
      } catch (err: any) {
        errores++;
        erroresLista.push(`${row.email}: ${err.message}`);
      }
    }

    return NextResponse.json({
      total_filas: rows.length,
      insertados,
      duplicados,
      errores,
      errores_detalle: erroresLista.length > 0 ? erroresLista : undefined,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
