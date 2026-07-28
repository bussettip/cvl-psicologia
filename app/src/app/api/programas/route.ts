import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT p.*,
        u.nombre as creador_nombre, u.apellido as creador_apellido,
        (SELECT COUNT(*) FROM metas_programa m WHERE m.programa_id = p.id) as total_metas,
        (SELECT COUNT(*) FROM asignaciones a WHERE a.programa_id = p.id AND a.estado = 'en_curso') as asignaciones_activas
      FROM programas_terapeuticos p
      LEFT JOIN usuarios u ON p.created_by = u.id
      WHERE p.activo = TRUE
      ORDER BY p.nombre
    `);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener programas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, descripcion, total_sesiones, created_by } = body;
    
    const [result] = await pool.query(
      'INSERT INTO programas_terapeuticos (nombre, descripcion, total_sesiones, created_by) VALUES (?, ?, ?, ?)',
      [nombre, descripcion, total_sesiones, created_by]
    );
    
    return NextResponse.json({ id: (result as any).insertId, message: 'Programa creado' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear programa' }, { status: 500 });
  }
}
