import { NextRequest, NextResponse } from 'next/server';
import { verificarComprobante, verificarTodos } from '@/lib/verificacion';

// POST /api/verificaciones/verificar
//   { comprobante_id }  → verifica un comprobante
//   {}                  → verifica TODOS los comprobantes de pago (OCR)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const comprobanteId = Number(body?.comprobante_id);
    if (comprobanteId) {
      const resultado = await verificarComprobante(comprobanteId);
      return NextResponse.json({ ok: true, resultado });
    }
    const resumen = await verificarTodos();
    return NextResponse.json({ ok: true, ...resumen });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
