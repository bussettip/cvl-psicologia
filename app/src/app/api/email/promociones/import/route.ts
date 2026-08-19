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
      if (data.length > 0) {
        const headers = Object.keys(data[0] as object);
        const findCol = (keywords: string[]) => {
          for (const h of headers) {
            const hl = h.toLowerCase();
            if (keywords.some(k => hl.includes(k))) return h;
          }
          return null;
        };
        const emailCol = findCol(['correo', 'email', 'e-mail']);
        const nombreCol = findCol(['nombre completo del adolescente', 'nombre completo', 'nombre del paciente']);
        const tutorCol = findCol(['nombre completo de pap', 'tutor', 'padre', 'madre', 'representante']);
        const telCol = findCol(['whatsapp', 'whats', 'mensaje', 'telefono', 'teléfono', 'celular', 'phone']);
        const email2Col = findCol(['correo electrónico:']);
        for (const row of data) {
          const r = row as Record<string, any>;
          const email = (emailCol ? r[emailCol] : '') || (email2Col ? r[email2Col] : '') || '';
          const nombreCompleto = (nombreCol ? r[nombreCol] : '') || '';
          const tutor = (tutorCol ? r[tutorCol] : '') || '';
          const telefono = (telCol ? r[telCol] : '') || '';
          let nombre = '';
          let apellido = '';
          const nombreUsar = nombreCompleto || tutor || '';
          if (nombreUsar) {
            const parts = nombreUsar.trim().split(/\s+/);
            nombre = parts[0] || '';
            apellido = parts.slice(1).join(' ') || '';
          }
          const emailStr = String(email || '').trim();
          if (emailStr.includes('@')) {
            rows.push({ email: emailStr, nombre, apellido, telefono: String(telefono || '').trim() });
          }
        }
      }
    }

    if (rows.length === 0) {
      const workbook2 = XLSX.read(buffer, { type: 'buffer' });
      const sheet2 = workbook2.Sheets[workbook2.SheetNames[0]];
      const debugData = XLSX.utils.sheet_to_json(sheet2);
      const debugHeaders = debugData.length > 0 ? Object.keys(debugData[0] as object) : [];
      const debugRow = debugData.length > 0 ? debugData[0] : null;
      return NextResponse.json({ error: 'No se encontraron contactos válidos en el archivo', debug: { headers: debugHeaders, firstRow: debugRow, rowCount: debugData.length, sheets: workbook2.SheetNames } }, { status: 400 });
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
          'INSERT INTO pacientes (nombre, apellido, email, telefono, whatsapp, estado) VALUES (?, ?, ?, ?, ?, ?)',
          [row.nombre || 'Sin nombre', row.apellido || '', row.email, row.telefono || null, row.telefono || null, 'activo']
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
