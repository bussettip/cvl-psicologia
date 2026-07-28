import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT ad.*,
        a.paciente_id, a.psicologa_id,
        p.nombre as paciente_nombre, p.apellido as paciente_apellido,
        u.nombre as psicologa_nombre, u.apellido as psicologa_apellido,
        s.numero_sesion,
        dr.nombre as detectada_por_nombre, dr.apellido as detectada_por_apellido,
        rr.nombre as resuelta_por_nombre, rr.apellido as resuelta_por_apellido
      FROM alertas_desviacion ad
      JOIN asignaciones a ON ad.asignacion_id = a.id
      JOIN pacientes p ON a.paciente_id = p.id
      JOIN usuarios u ON a.psicologa_id = u.id
      LEFT JOIN sesiones s ON ad.sesion_id = s.id
      LEFT JOIN usuarios dr ON ad.detectada_por = dr.id
      LEFT JOIN usuarios rr ON ad.resuelta_por = rr.id
      ORDER BY ad.created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener alertas' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, resuelta, resuelta_por, notas_resolucion } = body;
    
    await pool.query(
      `UPDATE alertas_desviacion SET 
        resuelta = ?,
        resuelta_por = ?,
        notas_resolucion = ?,
        fecha_resolucion = NOW()
       WHERE id = ?`,
      [resuelta, resuelta_por, notas_resolucion, id]
    );
    
    return NextResponse.json({ message: 'Alerta actualizada' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar alerta' }, { status: 500 });
  }
}
