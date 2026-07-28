import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET: Listar calificaciones de una psicóloga o de una asignación
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const psicologa_id = searchParams.get('psicologa_id');
    const asignacion_id = searchParams.get('asignacion_id');
    const paciente_id = searchParams.get('paciente_id');
    
    let query = `
      SELECT c.*, u.nombre as supervisor_nombre, u.apellido as supervisor_apellido
      FROM calificaciones_psicologa c
      JOIN usuarios u ON c.supervisor_id = u.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];
    
    if (psicologa_id) { conditions.push('c.psicologa_id = ?'); params.push(psicologa_id); }
    if (asignacion_id) { conditions.push('c.asignacion_id = ?'); params.push(asignacion_id); }
    if (paciente_id) { conditions.push('c.paciente_id = ?'); params.push(paciente_id); }
    
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY c.created_at DESC';
    
    const [rows] = await db.query(query, params);
    return NextResponse.json({ calificaciones: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST: Crear calificación
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { psicologa_id, supervisor_id, asignacion_id, paciente_id, categoria, calificacion, observaciones, enviar } = body;
    
    if (!psicologa_id || !supervisor_id || !categoria || !calificacion) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const categoriaLabels: Record<string, string> = {
      desempeno: 'Desempeño',
      tecnica: 'Técnica',
      comunicacion: 'Comunicación',
      seguimiento: 'Seguimiento',
      general: 'General'
    };
    
    // 1. Siempre guardar en historial de calificaciones
    await db.query(
      `INSERT INTO calificaciones_psicologa (psicologa_id, supervisor_id, asignacion_id, paciente_id, categoria, calificacion, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [psicologa_id, supervisor_id, asignacion_id || null, paciente_id || null, categoria, calificacion, observaciones || null]
    );

    // 2. Si enviar es true, también crear nota visible para la psicóloga
    if (enviar) {
      let contenido = `Calificación de supervisión: ${categoriaLabels[categoria] || categoria} — ${calificacion}/10`;
      if (observaciones) contenido += `\nObservaciones: ${observaciones}`;

      await db.query(
        `INSERT INTO notas_paciente (paciente_id, asignacion_id, autor_id, autor_rol, tipo, contenido, calificacion)
         VALUES (?, ?, ?, 'supervisora', 'nota_psicologa', ?, ?)`,
        [paciente_id || null, asignacion_id || null, supervisor_id, contenido, calificacion]
      );
    }
    
    return NextResponse.json({ message: enviar ? 'Calificación guardada y enviada' : 'Calificación guardada en historial' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
