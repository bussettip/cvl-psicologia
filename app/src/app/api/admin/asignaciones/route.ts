import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET: Listar asignaciones con detalles
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supervisor_id = searchParams.get('supervisor_id');
    const estado = searchParams.get('estado');
    
    let query = `
      SELECT a.*, 
        p.nombre as paciente_nombre, p.apellido as paciente_apellido,
        u.nombre as psicologa_nombre, u.apellido as psicologa_apellido,
        pr.nombre as programa_nombre, pr.total_sesiones,
        s.nombre as supervisor_nombre, s.apellido as supervisor_apellido
      FROM asignaciones a
      JOIN pacientes p ON a.paciente_id = p.id
      JOIN usuarios u ON a.psicologa_id = u.id
      JOIN programas_terapeuticos pr ON a.programa_id = pr.id
      LEFT JOIN usuarios s ON a.supervisor_id = s.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];
    
    if (supervisor_id) {
      conditions.push('a.supervisor_id = ?');
      params.push(supervisor_id);
    }
    if (estado) {
      conditions.push('a.estado = ?');
      params.push(estado);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY a.created_at DESC';
    
    const [rows] = await db.query(query, params);
    return NextResponse.json({ asignaciones: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST: Crear asignación
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paciente_id, psicologa_id, supervisor_id, programa_id, fecha_inicio, fecha_fin_estimada } = body;
    
    if (!paciente_id || !psicologa_id || !programa_id) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }
    
    // Verificar que no haya asignación activa para el mismo paciente y programa
    const [exist] = await db.query(
      'SELECT id FROM asignaciones WHERE paciente_id = ? AND programa_id = ? AND estado = "en_curso"',
      [paciente_id, programa_id]
    ) as any[];
    
    if (exist.length > 0) {
      return NextResponse.json({ error: 'Este paciente ya tiene una asignación activa para este programa' }, { status: 400 });
    }
    
    const [result] = await db.query(
      `INSERT INTO asignaciones (paciente_id, psicologa_id, supervisor_id, programa_id, fecha_inicio, fecha_fin_estimada, sesion_actual, estado)
       VALUES (?, ?, ?, ?, ?, ?, 0, 'en_curso')`,
      [paciente_id, psicologa_id, supervisor_id || null, programa_id, fecha_inicio || new Date().toISOString().split('T')[0], fecha_fin_estimada || null]
    ) as any[];
    
    return NextResponse.json({ id: result.insertId, message: 'Tratamiento asignado exitosamente' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT: Actualizar asignación
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, estado, motivo_estado, fecha_fin_real } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });
    }
    
    let query = 'UPDATE asignaciones SET estado=?';
    const params: any[] = [estado];
    
    if (motivo_estado) {
      query += ', motivo_estado=?';
      params.push(motivo_estado);
    }
    if (fecha_fin_real) {
      query += ', fecha_fin_real=?';
      params.push(fecha_fin_real);
    }
    
    query += ' WHERE id=?';
    params.push(id);
    
    await db.query(query, params);
    return NextResponse.json({ message: 'Asignación actualizada' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
