import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT a.*,
        p.nombre as paciente_nombre, p.apellido as paciente_apellido, p.motivo_consulta,
        u.nombre as psicologa_nombre, u.apellido as psicologa_apellido,
        s.nombre as supervisor_nombre, s.apellido as supervisor_apellido,
        pr.nombre as programa_nombre, pr.total_sesiones,
        (SELECT COUNT(*) FROM sesiones se WHERE se.asignacion_id = a.id AND se.estado = 'completada') as sesiones_completadas,
        (SELECT COUNT(*) FROM alertas_desviacion al WHERE al.asignacion_id = a.id AND al.resuelta = FALSE) as alertas_pendientes
      FROM asignaciones a
      JOIN pacientes p ON a.paciente_id = p.id
      JOIN usuarios u ON a.psicologa_id = u.id
      LEFT JOIN usuarios s ON a.supervisor_id = s.id
      JOIN programas_terapeuticos pr ON a.programa_id = pr.id
      ORDER BY a.created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener asignaciones' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paciente_id, psicologa_id, supervisor_id, programa_id, fecha_inicio, fecha_fin_estimada } = body;
    
    const [result] = await pool.query(
      `INSERT INTO asignaciones (paciente_id, psicologa_id, supervisor_id, programa_id, fecha_inicio, fecha_fin_estimada) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [paciente_id, psicologa_id, supervisor_id, programa_id, fecha_inicio, fecha_fin_estimada]
    );
    
    return NextResponse.json({ id: (result as any).insertId, message: 'Asignación creada' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear asignación' }, { status: 500 });
  }
}
