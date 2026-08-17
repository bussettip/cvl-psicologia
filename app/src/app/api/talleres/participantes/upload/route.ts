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
    const data = XLSX.utils.sheet_to_json(sheet);

    const participantes = [];
    for (const row of data) {
      const r = row as any;
      const nombreAdolescente = r['Nombre completo del adolescente:'] || r['Nombre completo del adolescente'] || '';
      const nombrePadre = r['Nombre completo de papá/mamá/tutor (abajo de la imagen por favor):'] || r['Nombre completo de papá/mamá/tutor'] || '';
      const fechaNac = r['Fecha de nacimiento del adolescente:'] || r['Fecha de nacimiento del adolescente'] || null;
      const cantidad = r['Cantidad pagada:'] || r['Cantidad pagada'] || 0;
      const fechaPago = r['Fecha del pago:'] || r['Fecha del pago'] || null;
      const correo = r['Correo electrónico:'] || r['Correo electrónico'] || '';
      const whatsapp = r['Número para mensajes WhatsApp:'] || r['Número para mensajes WhatsApp'] || '';
      const comentarios = r['Comentarios adicionales sobre el pago (si los hubiera):'] || r['Comentarios adicionales sobre el pago'] || '';

      if (nombreAdolescente && String(nombreAdolescente).trim()) {
        participantes.push({
          nombre_adolescente: String(nombreAdolescente).trim(),
          nombre_padre: nombrePadre ? String(nombrePadre).trim() : null,
          fecha_nacimiento: fechaNac || null,
          cantidad_pagada: cantidad ? Number(cantidad) : 0,
          fecha_pago: fechaPago || null,
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
