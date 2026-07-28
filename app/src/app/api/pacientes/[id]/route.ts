import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const [pacientes] = await pool.query('SELECT * FROM pacientes WHERE id = ?', [id]);
    const paciente = (pacientes as any[])[0];
    
    if (!paciente) {
      return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
    }
    
    const [asignaciones] = await pool.query(`
      SELECT a.*,
        u.nombre as psicologa_nombre, u.apellido as psicologa_apellido,
        s.nombre as supervisor_nombre, s.apellido as supervisor_apellido,
        pr.nombre as programa_nombre, pr.total_sesiones,
        (SELECT COUNT(*) FROM sesiones se WHERE se.asignacion_id = a.id AND se.estado = 'completada') as sesiones_completadas,
        (SELECT COUNT(*) FROM alertas_desviacion al WHERE al.asignacion_id = a.id AND al.resuelta = FALSE) as alertas_pendientes
      FROM asignaciones a
      JOIN usuarios u ON a.psicologa_id = u.id
      LEFT JOIN usuarios s ON a.supervisor_id = s.id
      JOIN programas_terapeuticos pr ON a.programa_id = pr.id
      WHERE a.paciente_id = ?
      ORDER BY a.created_at DESC
    `, [id]);

    const [sesiones] = await pool.query(`
      SELECT s.*, u.nombre as psicologa_nombre, u.apellido as psicologa_apellido
      FROM sesiones s
      JOIN asignaciones a ON s.asignacion_id = a.id
      JOIN usuarios u ON a.psicologa_id = u.id
      WHERE a.paciente_id = ?
      ORDER BY s.fecha_programada DESC
    `, [id]);

    const [notas] = await pool.query(`
      SELECT n.*, u.nombre as autor_nombre, u.apellido as autor_apellido
      FROM notas_paciente n
      JOIN usuarios u ON n.autor_id = u.id
      WHERE n.paciente_id = ?
      ORDER BY n.created_at DESC
    `, [id]);
    
    return NextResponse.json({ paciente, asignaciones, sesiones, notas });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener paciente' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nombre, apellido, fecha_nac, telefono, email, direccion, motivo_consulta, diagnostico_inicial, observaciones_generales, estado } = body;
    
    await pool.query(
      `UPDATE pacientes SET 
        nombre = COALESCE(?, nombre),
        apellido = COALESCE(?, apellido),
        fecha_nac = COALESCE(?, fecha_nac),
        telefono = COALESCE(?, telefono),
        email = COALESCE(?, email),
        direccion = COALESCE(?, direccion),
        motivo_consulta = COALESCE(?, motivo_consulta),
        diagnostico_inicial = COALESCE(?, diagnostico_inicial),
        observaciones_generales = COALESCE(?, observaciones_generales),
        estado = COALESCE(?, estado)
       WHERE id = ?`,
      [nombre, apellido, fecha_nac, telefono, email, direccion, motivo_consulta, diagnostico_inicial, observaciones_generales, estado, id]
    );
    
    return NextResponse.json({ message: 'Paciente actualizado' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar paciente' }, { status: 500 });
  }
}
