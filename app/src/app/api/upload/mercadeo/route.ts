import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { writeFile, readdir, unlink, stat, mkdir } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'mercadeo');

export async function GET() {
  try {
    const files = await readdir(UPLOAD_DIR);
    const fileDetails = await Promise.all(
      files.filter(f => !f.startsWith('.')).map(async (name) => {
        const s = await stat(path.join(UPLOAD_DIR, name));
        return { name, size: s.size, created: s.birthtime.toISOString() };
      })
    );
    fileDetails.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    return NextResponse.json({ files: fileDetails });
  } catch {
    return NextResponse.json({ files: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No se envió archivo' }, { status: 400 });

    const allowed = ['.xlsx', '.xls', '.csv', '.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.name).toLowerCase();
    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: `Tipo de archivo no permitido: ${ext}` }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const finalName = `${timestamp}_${safeName}`;

    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, finalName), buffer);

    return NextResponse.json({ name: finalName, originalName: file.name, size: file.size, message: 'Archivo subido' }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    if (!name) return NextResponse.json({ error: 'Falta nombre' }, { status: 400 });

    const filePath = path.join(UPLOAD_DIR, name);
    await unlink(filePath);
    return NextResponse.json({ message: 'Eliminado' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
