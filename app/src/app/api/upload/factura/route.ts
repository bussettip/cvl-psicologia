import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const gastoId = formData.get('gasto_id') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 });
    }

    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
    const ext = path.extname(file.name).toLowerCase();
    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido. Use: PDF, JPG, PNG, DOC, DOCX' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'facturas');
    await mkdir(uploadDir, { recursive: true });
    
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${gastoId || 'temp'}_${timestamp}_${safeName}`;
    const filePath = path.join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);
    
    const fileUrl = `/uploads/facturas/${fileName}`;
    
    return NextResponse.json({ 
      url: fileUrl, 
      nombre: file.name,
      message: 'Factura subida correctamente' 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al subir factura' }, { status: 500 });
  }
}
