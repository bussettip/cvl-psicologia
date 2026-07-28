import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paciente_id, psicologa_id, programa_id, respuestas, puntuacion_phq4, nivel_riesgo, completado } = body;

    if (!paciente_id || !psicologa_id) {
      return NextResponse.json({ error: 'Faltan paciente_id o psicologa_id' }, { status: 400 });
    }

    const [result] = await db.query(
      `INSERT INTO cuestionario_respuestas (paciente_id, psicologa_id, programa_id, respuestas, puntuacion_phq4, nivel_riesgo, completado)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [paciente_id, psicologa_id, programa_id || null, JSON.stringify(respuestas), puntuacion_phq4 || 0, nivel_riesgo || 'bajo', completado || false]
    ) as any[];

    return NextResponse.json({ id: result.insertId, message: 'Cuestionario guardado exitosamente' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paciente_id = searchParams.get('paciente_id');
    
    let query = `
      SELECT c.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido, u.nombre as psicologa_nombre
      FROM cuestionario_respuestas c
      JOIN pacientes p ON c.paciente_id = p.id
      JOIN usuarios u ON c.psicologa_id = u.id
    `;
    const params: any[] = [];
    
    if (paciente_id) {
      query += ' WHERE c.paciente_id = ?';
      params.push(paciente_id);
    }
    
    query += ' ORDER BY c.created_at DESC';
    
    const [rows] = await db.query(query, params);
    return NextResponse.json({ cuestionarios: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
