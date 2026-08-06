import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { obtenerSiguienteFolio, timbrarSolicitud } from '@/lib/facturaService';

function getUsuario(req: NextRequest): { id: number; rol: string; nombre: string; apellido: string } | null {
  const cookie = req.cookies.get('crm_session')?.value;
  if (!cookie) return null;
  try {
    return JSON.parse(atob(cookie));
  } catch {
    return null;
  }
}

const ROLES_SUPERVISOR = ['supervisora', 'supervisor', 'lider'];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const estado = searchParams.get('estado');
    const anio = searchParams.get('anio');
    const mes = searchParams.get('mes');

    let query = `
      SELECT s.*,
        u.nombre as solicitante_nombre, u.apellido as solicitante_apellido,
        v.nombre as validador_nombre, v.apellido as validador_apellido
      FROM solicitudes_factura s
      LEFT JOIN usuarios u ON s.solicitado_por = u.id
      LEFT JOIN usuarios v ON s.validada_por = v.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (estado) { conditions.push('s.estado = ?'); params.push(estado); }
    if (mes && anio) {
      conditions.push('MONTH(s.created_at) = ? AND YEAR(s.created_at) = ?');
      params.push(Number(mes), Number(anio));
    }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY s.created_at DESC LIMIT 500';

    const [rows] = await db.query(query, params);
    const solicitudes = (rows as any[]).map(s => ({
      ...s,
      subtotal: Number(s.subtotal),
      iva: Number(s.iva),
      total: Number(s.total),
    }));
    return NextResponse.json({ solicitudes });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const usuario = getUsuario(req);

    const {
      paciente_id, concepto, cantidad, unidad, clave_prod_serv, clave_unidad,
      subtotal, iva, total, rfc_receptor, razon_social_receptor,
      regimen_fiscal_receptor, uso_cfdi, forma_pago, metodo_pago,
    } = body;

    if (!concepto) return NextResponse.json({ error: 'El concepto es obligatorio' }, { status: 400 });
    if (!subtotal || Number(subtotal) <= 0) return NextResponse.json({ error: 'El subtotal debe ser mayor a 0' }, { status: 400 });
    if (!rfc_receptor) return NextResponse.json({ error: 'El RFC del receptor es obligatorio' }, { status: 400 });
    if (!razon_social_receptor) return NextResponse.json({ error: 'La razón social del receptor es obligatoria' }, { status: 400 });

    const sub = Number(subtotal);
    const ivaVal = Number(iva || 0);
    const totalVal = Number(total) || sub + ivaVal;

    const [cfgRows] = await db.query('SELECT serie_facturas FROM config_sat WHERE id = 1') as any[];
    const serie = cfgRows[0]?.serie_facturas || 'F';
    const folio = await obtenerSiguienteFolio(serie);

    const [result] = await db.query(
      `INSERT INTO solicitudes_factura
        (paciente_id, solicitado_por, concepto, cantidad, unidad, clave_prod_serv, clave_unidad,
         subtotal, iva, total, rfc_receptor, razon_social_receptor, regimen_fiscal_receptor,
         uso_cfdi, forma_pago, metodo_pago, serie, folio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        paciente_id || null,
        usuario?.id || null,
        concepto,
        Number(cantidad || 1),
        unidad || 'SERVICIO',
        clave_prod_serv || '85121706',
        clave_unidad || 'E48',
        sub,
        ivaVal,
        totalVal,
        rfc_receptor,
        razon_social_receptor,
        regimen_fiscal_receptor || '616',
        uso_cfdi || 'S01',
        forma_pago || '01',
        metodo_pago || 'PUE',
        serie,
        folio,
      ]
    ) as any[];

    return NextResponse.json({ id: result.insertId, folio, serie, message: 'Solicitud de factura creada' }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const usuario = getUsuario(req);
    const { id, accion, comentario_supervisora } = body;

    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });
    if (!usuario || !ROLES_SUPERVISOR.includes(usuario.rol)) {
      return NextResponse.json({ error: 'Solo la supervisora puede validar facturas' }, { status: 403 });
    }

    const [rows] = await db.query('SELECT * FROM solicitudes_factura WHERE id = ?', [id]) as any[];
    const solicitud = rows[0];
    if (!solicitud) return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });

    if (accion === 'aprobar') {
      if (solicitud.estado !== 'pendiente' && solicitud.estado !== 'error') {
        return NextResponse.json({ error: `No se puede aprobar una solicitud en estado ${solicitud.estado}` }, { status: 400 });
      }
      await db.query(
        `UPDATE solicitudes_factura SET estado = 'aprobada', validada_por = ?, validada_en = NOW(), comentario_supervisora = ? WHERE id = ?`,
        [usuario.id, comentario_supervisora || null, id]
      );
      try {
        await timbrarSolicitud(id);
      } catch (e: any) {
        return NextResponse.json({
          message: 'Solicitud aprobada pero el timbrado falló',
          error: e.message,
          estado: 'error',
        });
      }
      return NextResponse.json({ message: 'Factura aprobada y timbrada' });
    }

    if (accion === 'rechazar') {
      await db.query(
        `UPDATE solicitudes_factura SET estado = 'rechazada', validada_por = ?, validada_en = NOW(), comentario_supervisora = ? WHERE id = ?`,
        [usuario.id, comentario_supervisora || null, id]
      );
      return NextResponse.json({ message: 'Solicitud rechazada' });
    }

    if (accion === 'retimbrar') {
      if (solicitud.estado !== 'error') {
        return NextResponse.json({ error: 'Solo se pueden retimbrar solicitudes en error' }, { status: 400 });
      }
      await db.query(
        `UPDATE solicitudes_factura SET estado = 'aprobada', validada_por = ?, validada_en = NOW(), error_timbrado = NULL WHERE id = ?`,
        [usuario.id, id]
      );
      try {
        await timbrarSolicitud(id);
        return NextResponse.json({ message: 'Factura retimbrada correctamente' });
      } catch (e: any) {
        return NextResponse.json({ message: 'El retimbrado falló', error: e.message, estado: 'error' });
      }
    }

    return NextResponse.json({ error: 'Acción no válida (aprobar, rechazar, retimbrar)' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
