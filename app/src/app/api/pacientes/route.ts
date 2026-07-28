import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, 
        (SELECT COUNT(*) FROM asignaciones a WHERE a.paciente_id = p.id AND a.estado = 'en_curso') as asignaciones_activas
      FROM pacientes p 
      ORDER BY p.apellido, p.nombre
    `);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener pacientes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, apellido, fecha_nac, telefono, email, direccion, motivo_consulta, diagnostico_inicial, observaciones_generales } = body;
    
    const [result] = await pool.query(
      `INSERT INTO pacientes (nombre, apellido, fecha_nac, telefono, email, direccion, motivo_consulta, diagnostico_inicial, observaciones_generales) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, fecha_nac, telefono, email, direccion, motivo_consulta, diagnostico_inicial, observaciones_generales]
    );
    
    return NextResponse.json({ id: (result as any).insertId, message: 'Paciente creado' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear paciente' }, { status: 500 });
  }
}
