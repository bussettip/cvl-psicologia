import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const psicologaId = searchParams.get('psicologa_id');
    if (!psicologaId) {
      return NextResponse.json({ error: 'psicologa_id requerido' }, { status: 400 });
    }
    const [pacientes] = await db.query(
      `SELECT DISTINCT p.*,
        (SELECT COUNT(*) FROM asignaciones a WHERE a.paciente_id = p.id AND a.psicologa_id = ? AND a.estado = 'en_curso') as tratamientos_activos,
        (SELECT a2.sesion_actual FROM asignaciones a2 WHERE a2.paciente_id = p.id AND a2.psicologa_id = ? AND a2.estado = 'en_curso' ORDER BY a2.id DESC LIMIT 1) as sesion_actual,
        (SELECT pt.total_sesiones FROM asignaciones a2 JOIN programas_terapeuticos pt ON a2.programa_id = pt.id WHERE a2.paciente_id = p.id AND a2.psicologa_id = ? AND a2.estado = 'en_curso' ORDER BY a2.id DESC LIMIT 1) as total_sesiones,
        (SELECT ROUND(a2.sesion_actual * 100.0 / pt.total_sesiones, 0) FROM asignaciones a2 JOIN programas_terapeuticos pt ON a2.programa_id = pt.id WHERE a2.paciente_id = p.id AND a2.psicologa_id = ? AND a2.estado = 'en_curso' ORDER BY a2.id DESC LIMIT 1) as porcentaje_avance,
        (SELECT pt.nombre FROM asignaciones a2 JOIN programas_terapeuticos pt ON a2.programa_id = pt.id WHERE a2.paciente_id = p.id AND a2.psicologa_id = ? AND a2.estado = 'en_curso' ORDER BY a2.id DESC LIMIT 1) as programa_nombre
       FROM pacientes p
       INNER JOIN asignaciones a ON a.paciente_id = p.id AND a.psicologa_id = ?
       WHERE p.estado = 'activo'
       ORDER BY p.apellido, p.nombre`,
      [psicologaId, psicologaId, psicologaId, psicologaId, psicologaId, psicologaId]
    );

    const [sesiones] = await db.query(
      `SELECT s.*, a.paciente_id, a.psicologa_id, p.nombre as paciente_nombre, p.apellido as paciente_apellido
       FROM sesiones s
       JOIN asignaciones a ON s.asignacion_id = a.id
       JOIN pacientes p ON a.paciente_id = p.id
       WHERE a.psicologa_id = ?
       ORDER BY s.fecha_programada DESC`,
      [psicologaId]
    );

    const [notas] = await db.query(
      `SELECT n.*, u.nombre as autor_nombre, u.apellido as autor_apellido
       FROM notas_paciente n
       JOIN usuarios u ON n.autor_id = u.id
       JOIN asignaciones a ON n.asignacion_id = a.id
       WHERE a.psicologa_id = ?
       ORDER BY n.created_at DESC LIMIT 20`,
      [psicologaId]
    );

    const [calificaciones] = await db.query(
      `SELECT c.*, u.nombre as autor_nombre, u.apellido as autor_apellido
       FROM calificaciones_psicologa c
       JOIN usuarios u ON c.supervisor_id = u.id
       WHERE c.psicologa_id = ?
       ORDER BY c.created_at DESC`,
      [psicologaId]
    );

    return NextResponse.json({ pacientes, sesiones, notas, calificaciones });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
