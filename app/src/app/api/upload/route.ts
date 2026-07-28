import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sesionId = formData.get('sesion_id') as string;
    
    if (!file || !sesionId) {
      return NextResponse.json({ error: 'Archivo y sesion_id requeridos' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'evaluaciones');
    await mkdir(uploadDir, { recursive: true });
    
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${sesionId}_${timestamp}_${safeName}`;
    const filePath = path.join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);
    
    const fileUrl = `/uploads/evaluaciones/${fileName}`;
    
    return NextResponse.json({ 
      url: fileUrl, 
      nombre: file.name,
      message: 'Archivo subido correctamente' 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 });
  }
}
