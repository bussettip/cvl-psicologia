import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const [programas] = await pool.query(`
      SELECT p.*,
        u.nombre as creador_nombre, u.apellido as creador_apellido
      FROM programas_terapeuticos p
      LEFT JOIN usuarios u ON p.created_by = u.id
      WHERE p.id = ?
    `, [id]);
    
    const programa = (programas as any[])[0];
    if (!programa) {
      return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 });
    }
    
    const [metas] = await pool.query(
      'SELECT * FROM metas_programa WHERE programa_id = ? ORDER BY sesion_numero ASC',
      [id]
    );
    
    const [asignaciones] = await pool.query(`
      SELECT a.*,
        p.nombre as paciente_nombre, p.apellido as paciente_apellido,
        u.nombre as psicologa_nombre, u.apellido as psicologa_apellido,
        (SELECT COUNT(*) FROM sesiones se WHERE se.asignacion_id = a.id AND se.estado = 'completada') as sesiones_completadas,
        DATEDIFF(COALESCE(a.fecha_fin_real, CURDATE()), a.fecha_inicio) as dias_transcurridos,
        DATEDIFF(a.fecha_fin_estimada, a.fecha_inicio) as dias_totales
      FROM asignaciones a
      JOIN pacientes p ON a.paciente_id = p.id
      JOIN usuarios u ON a.psicologa_id = u.id
      WHERE a.programa_id = ?
      ORDER BY a.created_at DESC
    `, [id]);
    
    return NextResponse.json({ ...programa, metas, asignaciones });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener programa' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nombre, descripcion, total_sesiones } = body;
    
    await pool.query(
      'UPDATE programas_terapeuticos SET nombre = COALESCE(?, nombre), descripcion = COALESCE(?, descripcion), total_sesiones = COALESCE(?, total_sesiones) WHERE id = ?',
      [nombre, descripcion, total_sesiones, id]
    );
    
    return NextResponse.json({ message: 'Programa actualizado' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar programa' }, { status: 500 });
  }
}
