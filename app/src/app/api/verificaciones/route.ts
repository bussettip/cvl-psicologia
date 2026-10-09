import { NextResponse } from 'next/server';
import { listarVerificaciones, TOLERANCIA } from '@/lib/verificacion';

// GET /api/verificaciones → lista todos los comprobantes de pago con su verificación.
export async function GET() {
  try {
    const verificaciones = await listarVerificaciones();
    return NextResponse.json({ verificaciones, tolerancia: TOLERANCIA });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
