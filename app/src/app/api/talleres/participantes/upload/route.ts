import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import * as XLSX from 'xlsx';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const tallerId = formData.get('taller_id') as string;

    if (!file || !tallerId) {
      return NextResponse.json({ error: 'Archivo y taller_id requeridos' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false, dateNF: 'yyyy-mm-dd' });

    // Busca la primera clave cuyo texto normalizado contenga todos los fragmentos dados
    const norm = (s: string) =>
      String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
    const findKey = (row: Record<string, unknown>, ...frags: string[]) => {
      for (const k of Object.keys(row)) {
        const nk = norm(k);
        if (frags.every(f => nk.includes(norm(f)))) return k;
      }
      return null;
    };
    const pick = (row: Record<string, unknown>, ...frags: string[]) => {
      const k = findKey(row, ...frags);
      return k ? String(row[k] ?? '').trim() : '';
    };

    // Convertir fechas de Excel (números seriales) a formato YYYY-MM-DD
    const excelDateToISO = (val: any): string | null => {
      if (!val) return null;
      const s = String(val).trim();
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);
      const n = Number(val);
      if (n > 30000 && n < 50000) {
        const d = new Date((n - 25569) * 86400000);
        return d.toISOString().substring(0, 10);
      }
      return s || null;
    };

    const participantes = [];
    for (const row of data) {
      const r = row as any;
      const keys = Object.keys(r);
      // Columna del adolescente: preferir "nombre ... adolescente"; si no,
      // cualquier columna de nombre que no sea la del tutor/papá
      const adolKey =
        findKey(r, 'nombre', 'adolescente') ||
        findKey(r, 'adolescente') ||
        keys.find(k => {
          const nk = norm(k);
          return nk.includes('nombre') && !nk.includes('tutor') && !nk.includes('papa');
        }) ||
        '';
      const nombreAdolescente = adolKey ? String(r[adolKey] ?? '').trim() : '';
      const nombrePadre = pick(r, 'tutor') || pick(r, 'papa') || '';
      const fechaNac = pick(r, 'nacimiento') || null;
      const cantidad = pick(r, 'cantidad pagada') || pick(r, 'cantidad') || 0;
      const fechaPago = pick(r, 'fecha del pago') || null;
      const correo = pick(r, 'correo electronico:') || pick(r, 'correo electronico') || '';
      const whatsapp = pick(r, 'whatsapp') || '';
      const comentarios = pick(r, 'comentarios') || '';

      if (nombreAdolescente && String(nombreAdolescente).trim()) {
        participantes.push({
          nombre_adolescente: String(nombreAdolescente).trim(),
          nombre_padre: nombrePadre ? String(nombrePadre).trim() : null,
          fecha_nacimiento: excelDateToISO(fechaNac),
          cantidad_pagada: cantidad ? Number(cantidad) : 0,
          fecha_pago: excelDateToISO(fechaPago),
          correo: correo ? String(correo).trim() : null,
          whatsapp: whatsapp ? String(whatsapp).trim() : null,
          comentarios: comentarios ? String(comentarios).trim() : null,
        });
      }
    }

    if (participantes.length === 0) {
      return NextResponse.json({ error: 'No se encontraron participantes en el archivo' }, { status: 400 });
    }

    // Eliminar participantes existentes del taller para reemplazar
    await db.execute('DELETE FROM participantes_taller WHERE taller_id = ?', [tallerId]);

    const results = [];
    for (const p of participantes) {
      const [result] = await db.execute(
        `INSERT INTO participantes_taller (taller_id, nombre_adolescente, nombre_padre, fecha_nacimiento, cantidad_pagada, fecha_pago, correo, whatsapp, comentarios)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [tallerId, p.nombre_adolescente, p.nombre_padre, p.fecha_nacimiento, p.cantidad_pagada, p.fecha_pago, p.correo, p.whatsapp, p.comentarios]
      );
      results.push({ id: (result as any).insertId, nombre: p.nombre_adolescente });
    }

    await db.execute(
      'UPDATE talleres SET inscritos = (SELECT COUNT(*) FROM participantes_taller WHERE taller_id = ?) WHERE id = ?',
      [tallerId, tallerId]
    );

    return NextResponse.json({ ok: true, imported: results.length, participantes: results });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al procesar archivo: ' + (error.message || '') }, { status: 500 });
  }
}
