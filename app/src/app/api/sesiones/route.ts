import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const asignacionId = searchParams.get('asignacion_id');
    
    let query = `
      SELECT s.*,
        m.titulo as meta_titulo, m.descripcion as meta_descripcion, m.categoria as meta_categoria,
        a.paciente_id, a.psicologa_id,
        p.nombre as paciente_nombre, p.apellido as paciente_apellido,
        u.nombre as psicologa_nombre, u.apellido as psicologa_apellido,
        pr.nombre as programa_nombre
      FROM sesiones s
      JOIN asignaciones a ON s.asignacion_id = a.id
      JOIN pacientes p ON a.paciente_id = p.id
      JOIN usuarios u ON a.psicologa_id = u.id
      JOIN programas_terapeuticos pr ON a.programa_id = pr.id
      LEFT JOIN metas_programa m ON s.meta_id = m.id
    `;
    
    const params: any[] = [];
    
    if (asignacionId) {
      query += ' WHERE s.asignacion_id = ?';
      params.push(asignacionId);
    }
    
    query += ' ORDER BY s.fecha_programada DESC, s.numero_sesion DESC';
    
    const [rows] = await pool.query(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener sesiones' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { asignacion_id, fecha_programada, meta_id, nota_psicologa, paso_tratamiento, autor_id, autor_rol, paciente_id } = body;

    // Determine position based on fecha_programada order
    const [beforeRows] = await pool.query(
      'SELECT COUNT(*) as cnt FROM sesiones WHERE asignacion_id = ? AND fecha_programada <= ?',
      [asignacion_id, fecha_programada]
    ) as any[];
    const beforeCount = beforeRows[0]?.cnt || 0;

    // Shift existing sessions that have >= this position
    await pool.query(
      'UPDATE sesiones SET numero_sesion = numero_sesion + 1 WHERE asignacion_id = ? AND numero_sesion > ? ORDER BY numero_sesion DESC',
      [asignacion_id, beforeCount]
    );

    const numSesion = beforeCount + 1;
    const [result] = await pool.query(
      `INSERT INTO sesiones (asignacion_id, numero_sesion, fecha_programada, meta_id, estado) 
       VALUES (?, ?, ?, ?, 'programada')`,
      [asignacion_id, numSesion, fecha_programada, meta_id || null]
    );

    // Renumber all sessions for this assignment to be sequential by fecha_programada
    const [allSes] = await pool.query(
      'SELECT id FROM sesiones WHERE asignacion_id = ? ORDER BY fecha_programada, id',
      [asignacion_id]
    ) as any[];
    for (let i = 0; i < allSes.length; i++) {
      await pool.query('UPDATE sesiones SET numero_sesion = ? WHERE id = ?', [i + 1, allSes[i].id]);
    }

    // Update sesion_actual in the assignment (highest number)
    const [maxRow] = await pool.query(
      'SELECT COALESCE(MAX(numero_sesion), 0) as max_num FROM sesiones WHERE asignacion_id = ?',
      [asignacion_id]
    ) as any[];
    const maxNum = maxRow[0]?.max_num || 0;
    await pool.query(
      'UPDATE asignaciones SET sesion_actual = ? WHERE id = ?',
      [maxNum, asignacion_id]
    );

    // If note is provided, save to patient history
    if (nota_psicologa && autor_id && paciente_id) {
      const contenido = `Sesión #${numSesion} programada para ${fecha_programada}${nota_psicologa ? '\n' + nota_psicologa : ''}`;
      await pool.query(
        `INSERT INTO notas_paciente (paciente_id, asignacion_id, autor_id, autor_rol, tipo, contenido, paso_tratamiento)
         VALUES (?, ?, ?, ?, 'nota_psicologa', ?, ?)`,
        [paciente_id, asignacion_id, autor_id, autor_rol || 'psicologa', contenido, paso_tratamiento || null]
      );
    }
    
    return NextResponse.json({ id: (result as any).insertId, numero_sesion: numSesion, message: 'Sesión creada' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al crear sesión' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, fecha_real, estado, duracion_minutos, temas_trabajados, observaciones_psicologa, desviacion, motivo_desviacion, tipo_desviacion, archivo_url, archivo_nombre, autor_id, autor_rol, paciente_id, asignacion_id, paso_tratamiento } = body;
    
    await pool.query(
      `UPDATE sesiones SET 
        fecha_real = COALESCE(?, fecha_real),
        estado = COALESCE(?, estado),
        duracion_minutos = COALESCE(?, duracion_minutos),
        temas_trabajados = COALESCE(?, temas_trabajados),
        observaciones_psicologa = COALESCE(?, observaciones_psicologa),
        desviacion = COALESCE(?, desviacion),
        motivo_desviacion = COALESCE(?, motivo_desviacion),
        tipo_desviacion = COALESCE(?, tipo_desviacion),
        archivo_url = COALESCE(?, archivo_url),
        archivo_nombre = COALESCE(?, archivo_nombre)
       WHERE id = ?`,
      [fecha_real, estado, duracion_minutos, temas_trabajados, observaciones_psicologa, desviacion, motivo_desviacion, tipo_desviacion, archivo_url, archivo_nombre, id]
    );

    // Save note to patient history when session is completed or has observations
    if (paciente_id && autor_id && (observaciones_psicologa || temas_trabajados || desviacion)) {
      let contenido = '';
      if (temas_trabajados) contenido += `Temas trabajados: ${temas_trabajados}`;
      if (observaciones_psicologa) contenido += `${contenido ? '\n' : ''}Observaciones: ${observaciones_psicologa}`;
      if (desviacion) contenido += `${contenido ? '\n' : ''}⚠️ Sesión con desviación: ${motivo_desviacion || 'Sin motivo especificado'}`;
      
      if (contenido) {
        await pool.query(
          `INSERT INTO notas_paciente (paciente_id, asignacion_id, autor_id, autor_rol, tipo, contenido, paso_tratamiento)
           VALUES (?, ?, ?, ?, 'nota_psicologa', ?, ?)`,
          [paciente_id, asignacion_id || null, autor_id, autor_rol || 'psicologa', contenido, paso_tratamiento || null]
        );
      }
    }
    
    return NextResponse.json({ message: 'Sesión actualizada' });
  } catch (error) {
    return NextResponse.json({ error: (error as any)?.message || 'Error al actualizar sesión' }, { status: 500 });
  }
}
