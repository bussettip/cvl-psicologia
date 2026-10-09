import { NextRequest, NextResponse } from 'next/server';
import { enviarCorreoAclaracion } from '@/lib/verificacion';

// POST /api/verificaciones/aclaracion
//   { comprobante_id }  → envía aclaración de un comprobante a administración
//   {}                  → envía aclaración de TODAS las diferencias pendientes
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const comprobanteId = Number(body?.comprobante_id);
    const ids = comprobanteId ? [comprobanteId] : undefined;
    const correo = await enviarCorreoAclaracion(ids);
    return NextResponse.json({ ok: correo.enviado, correo });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
