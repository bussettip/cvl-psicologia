import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const tallerId = formData.get('taller_id') as string;

    if (!file || !tallerId) {
      return NextResponse.json({ error: 'Archivo y taller_id requeridos' }, { status: 400 });
    }

    // Crear directorio si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'diplomas');
    await mkdir(uploadDir, { recursive: true });

    // Guardar archivo
    const ext = path.extname(file.name) || '.png';
    const fileName = `diploma_${tallerId}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(arrayBuffer));

    // Actualizar taller con la ruta de la plantilla
    const relativePath = `/uploads/diplomas/${fileName}`;
    await db.execute('UPDATE talleres SET diploma_template = ? WHERE id = ?', [relativePath, tallerId]);

    return NextResponse.json({ ok: true, path: relativePath });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al subir archivo: ' + (error.message || '') }, { status: 500 });
  }
}
