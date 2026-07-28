import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fecha = searchParams.get('fecha');
    const fecha_inicio = searchParams.get('fecha_inicio');
    const fecha_fin = searchParams.get('fecha_fin');
    const taller_id = searchParams.get('taller_id');
    const paciente_id = searchParams.get('paciente_id');
    const mes = searchParams.get('mes');
    const anio = searchParams.get('anio');
    
    let query = `
      SELECT c.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido, p.telefono as paciente_telefono,
        u.nombre as autor_nombre, u.apellido as autor_apellido,
        t.titulo as taller_nombre
      FROM cobros c
      LEFT JOIN pacientes p ON c.paciente_id = p.id
      LEFT JOIN usuarios u ON c.created_by = u.id
      LEFT JOIN talleres t ON c.taller_id = t.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];
    
    if (fecha) { conditions.push('DATE(c.fecha) = DATE(?)'); params.push(fecha); }
    if (fecha_inicio && fecha_fin) { conditions.push('DATE(c.fecha) BETWEEN DATE(?) AND DATE(?)'); params.push(fecha_inicio, fecha_fin); }
    if (taller_id) { conditions.push('c.taller_id = ?'); params.push(Number(taller_id)); }
    if (paciente_id) { conditions.push('c.paciente_id = ?'); params.push(paciente_id); }
    if (mes && anio) { conditions.push('MONTH(c.fecha) = ? AND YEAR(c.fecha) = ?'); params.push(Number(mes), Number(anio)); }
    
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY c.fecha DESC, c.hora DESC';
    
    const [rows] = await db.query(query, params);
    const cobros = (rows as any[]).map(c => ({
      ...c,
      fecha: c.fecha ? new Date(c.fecha).toISOString().split('T')[0] : c.fecha,
      hora: c.hora || null,
      confirmado_psicologa: c.confirmado_psicologa ? true : false,
      confirmado_psicologa_id: c.confirmado_psicologa_id || null,
      confirmado_psicologa_fecha: c.confirmado_psicologa_fecha || null
    }));
    return NextResponse.json({ cobros });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paciente_id, tipo, concepto, sesion_id, taller_id, monto, metodo_pago, fecha, hora, estado, observaciones, created_by } = body;
    
    if (!paciente_id || !fecha || !monto) {
      return NextResponse.json({ error: 'Faltan campos obligatorios (paciente, fecha, monto)' }, { status: 400 });
    }
    
    const [result] = await db.query(
      `INSERT INTO cobros (paciente_id, tipo, concepto, sesion_id, taller_id, monto, metodo_pago, fecha, hora, estado, observaciones, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [paciente_id, tipo || 'sesion', concepto || null, sesion_id || null, taller_id || null, monto, metodo_pago || 'efectivo', fecha, hora || null, estado || 'pagado', observaciones || null, created_by || null]
    ) as any[];
    
    return NextResponse.json({ id: result.insertId, message: 'Cobro registrado' }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, estado, metodo_pago, observaciones } = body;
    
    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });
    
    await db.query(
      `UPDATE cobros SET estado=COALESCE(?,estado), metodo_pago=COALESCE(?,metodo_pago), observaciones=COALESCE(?,observaciones) WHERE id=?`,
      [estado, metodo_pago, observaciones, id]
    );
    
    return NextResponse.json({ message: 'Cobro actualizado' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });
    await db.query('DELETE FROM cobros WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Cobro eliminado' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
