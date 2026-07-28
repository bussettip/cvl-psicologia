import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET: Listar pacientes con datos de asignaciones
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const psicologaId = searchParams.get('psicologa_id');
    
    let query = `
      SELECT DISTINCT p.*,
        (SELECT GROUP_CONCAT(DISTINCT CONCAT(u.nombre, ' ', u.apellido) SEPARATOR ', ')
         FROM asignaciones a2 JOIN usuarios u ON a2.psicologa_id = u.id
         WHERE a2.paciente_id = p.id) as psicologa_nombre,
        (SELECT a3.psicologa_id FROM asignaciones a3 WHERE a3.paciente_id = p.id ORDER BY a3.id DESC LIMIT 1) as psicologa_id_asign,
        (SELECT COUNT(*) FROM asignaciones a4 WHERE a4.paciente_id = p.id AND a4.estado = 'en_curso') as tratamientos_activos,
        (SELECT a5.sesion_actual FROM asignaciones a5 WHERE a5.paciente_id = p.id AND a5.estado = 'en_curso' ORDER BY a5.id DESC LIMIT 1) as sesion_actual,
        (SELECT pt.total_sesiones FROM asignaciones a5 JOIN programas_terapeuticos pt ON a5.programa_id = pt.id WHERE a5.paciente_id = p.id AND a5.estado = 'en_curso' ORDER BY a5.id DESC LIMIT 1) as total_sesiones,
        (SELECT ROUND(a5.sesion_actual * 100.0 / pt.total_sesiones, 0) FROM asignaciones a5 JOIN programas_terapeuticos pt ON a5.programa_id = pt.id WHERE a5.paciente_id = p.id AND a5.estado = 'en_curso' ORDER BY a5.id DESC LIMIT 1) as porcentaje_avance,
        (SELECT pt.nombre FROM asignaciones a5 JOIN programas_terapeuticos pt ON a5.programa_id = pt.id WHERE a5.paciente_id = p.id AND a5.estado = 'en_curso' ORDER BY a5.id DESC LIMIT 1) as programa_nombre
      FROM pacientes p
    `;
    const params: any[] = [];
    const conditions: string[] = [];
    
    if (search) {
      conditions.push('(p.nombre LIKE ? OR p.apellido LIKE ? OR p.email LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    
    if (psicologaId) {
      conditions.push('EXISTS (SELECT 1 FROM asignaciones a6 WHERE a6.paciente_id = p.id AND a6.psicologa_id = ?)');
      params.push(psicologaId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY p.apellido ASC, p.nombre ASC';
    const [rows] = await db.query(query, params);
    return NextResponse.json({ pacientes: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST: Crear paciente
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, apellido, fecha_nac, sexo, telefono, email, direccion, contacto_emergencia, motivo_consulta, diagnostico_inicial, psicologa_id } = body;
    
    if (!nombre || !apellido) {
      return NextResponse.json({ error: 'Faltan nombre y apellido' }, { status: 400 });
    }
    
    const [result] = await db.query(
      `INSERT INTO pacientes (nombre, apellido, fecha_nac, telefono, email, direccion, motivo_consulta, diagnostico_inicial, psicologa_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, fecha_nac || null, telefono || null, email || null, direccion || null, motivo_consulta || null, diagnostico_inicial || null, psicologa_id || null]
    ) as any[];
    
    return NextResponse.json({ id: result.insertId, message: 'Paciente creado exitosamente' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT: Actualizar paciente
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, nombre, apellido, fecha_nac, sexo, telefono, email, direccion, contacto_emergencia, motivo_consulta, diagnostico_inicial, psicologa_id } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Falta el ID del paciente' }, { status: 400 });
    }
    
    await db.query(
      `UPDATE pacientes SET nombre=?, apellido=?, fecha_nac=?, telefono=?, email=?, direccion=?, motivo_consulta=?, diagnostico_inicial=?, psicologa_id=? WHERE id=?`,
      [nombre, apellido, fecha_nac || null, telefono || null, email || null, direccion || null, motivo_consulta || null, diagnostico_inicial || null, psicologa_id || null, id]
    );
    
    return NextResponse.json({ message: 'Paciente actualizado' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
