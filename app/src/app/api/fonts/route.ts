import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir } from 'fs/promises';
import path from 'path';

const FONTS_DIR = path.join(process.cwd(), 'public', 'uploads', 'fonts');

export async function GET() {
  try {
    await mkdir(FONTS_DIR, { recursive: true });
    const files = await readdir(FONTS_DIR);
    const fonts = files
      .filter(f => /\.(ttf|woff|woff2|otf)$/i.test(f))
      .map(f => ({
        name: f.replace(/\.(ttf|woff|woff2|otf)$/i, '').replace(/[-_]/g, ' '),
        file: f,
        url: `/uploads/fonts/${f}`,
      }));
    return NextResponse.json({ fonts });
  } catch (error: any) {
    return NextResponse.json({ fonts: [], error: error.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!['.ttf', '.woff', '.woff2', '.otf'].includes(ext)) {
      return NextResponse.json({ error: 'Formato no soportado. Usa .ttf, .woff, .woff2 o .otf' }, { status: 400 });
    }

    await mkdir(FONTS_DIR, { recursive: true });
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = path.join(FONTS_DIR, safeName);

    const arrayBuffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(arrayBuffer));

    return NextResponse.json({
      ok: true,
      font: {
        name: safeName.replace(/\.(ttf|woff|woff2|otf)$/i, '').replace(/[-_]/g, ' '),
        file: safeName,
        url: `/uploads/fonts/${safeName}`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al subir: ' + (error.message || '') }, { status: 500 });
  }
}
