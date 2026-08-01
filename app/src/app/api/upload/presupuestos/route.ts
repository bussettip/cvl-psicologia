import { NextResponse } from 'next/server';
import { writeFile, mkdir, readdir, unlink, stat } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'presupuestos');

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 });
    }

    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xlsx', '.xls'];
    const ext = path.extname(file.name).toLowerCase();
    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido. Use: PDF, JPG, PNG, DOC, DOCX, XLSX, XLS' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await mkdir(UPLOAD_DIR, { recursive: true });

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${timestamp}_${safeName}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/presupuestos/${fileName}`;

    return NextResponse.json({
      url: fileUrl,
      nombre: file.name,
      message: 'Archivo subido correctamente'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
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

export async function DELETE(req: Request) {
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
