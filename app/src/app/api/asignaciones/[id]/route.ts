import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const [asignaciones] = await pool.query(`
      SELECT a.*,
        p.nombre as paciente_nombre, p.apellido as paciente_apellido,
        p.motivo_consulta, p.diagnostico_inicial,
        u.nombre as psicologa_nombre, u.apellido as psicologa_apellido,
        s.nombre as supervisor_nombre, s.apellido as supervisor_apellido,
        pr.nombre as programa_nombre, pr.total_sesiones
      FROM asignaciones a
      JOIN pacientes p ON a.paciente_id = p.id
      JOIN usuarios u ON a.psicologa_id = u.id
      LEFT JOIN usuarios s ON a.supervisor_id = s.id
      JOIN programas_terapeuticos pr ON a.programa_id = pr.id
      WHERE a.id = ?
    `, [id]);
    
    const asignacion = (asignaciones as any[])[0];
    if (!asignacion) {
      return NextResponse.json({ error: 'Asignación no encontrada' }, { status: 404 });
    }
    
    const [sesiones] = await pool.query(`
      SELECT s.*,
        m.titulo as meta_titulo, m.descripcion as meta_descripcion, m.categoria as meta_categoria
      FROM sesiones s
      LEFT JOIN metas_programa m ON s.meta_id = m.id
      WHERE s.asignacion_id = ?
      ORDER BY s.numero_sesion ASC
    `, [id]);
    
    return NextResponse.json({ ...asignacion, sesiones });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener asignación' }, { status: 500 });
  }
}
