import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import pool from '@/lib/db';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { asunto, contenido, destinatarios, usar_bd, taller_url, taller_nombre } = body;

    if (!asunto || !contenido) {
      return NextResponse.json({ error: 'Asunto y contenido son obligatorios' }, { status: 400 });
    }

    let emails: { email: string; nombre: string }[] = [];

    if (usar_bd) {
      const [rows] = await pool.query(
        `SELECT email, CONCAT(nombre, ' ', apellido) as nombre FROM pacientes WHERE email IS NOT NULL AND email != ''`
      ) as any[];
      emails = rows.map((r: any) => ({ email: r.email, nombre: r.nombre }));
    } else if (Array.isArray(destinatarios) && destinatarios.length > 0) {
      emails = destinatarios;
    } else {
      return NextResponse.json({ error: 'No hay destinatarios' }, { status: 400 });
    }

    let enviados = 0;
    let errores = 0;
    const erroresLista: string[] = [];

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: #4f46e5; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">Centro VivirLibre.org</h1>
          <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">Inteligencia Emocional</p>
        </div>
        <div style="background: white; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
          ${contenido.replace(/\n/g, '<br>')}
          ${taller_url ? `
          <div style="text-align: center; margin-top: 25px;">
            <a href="${taller_url}" style="background: #4f46e5; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
              ${taller_nombre ? 'Conocer más: ' + taller_nombre : 'Ver más información'}
            </a>
          </div>` : ''}
        </div>
        <div style="text-align: center; padding: 15px; font-size: 11px; color: #9ca3af;">
          <p>Centro VivirLibre.org • Cerro del Cubilete #145, Col. Campestre Churubusco, Coyoacán, CP 04200, CDMX</p>
          <p>Tel: 55-5418-0137 • www.vivirlibre.org</p>
        </div>
      </div>
    `;

    for (const dest of emails) {
      try {
        await transporter.sendMail({
          from: `"Centro VivirLibre" <${process.env.SMTP_USER}>`,
          to: dest.email,
          subject: asunto,
          html: htmlBody.replace(/\{\{nombre\}\}/g, dest.nombre || ''),
        });
        enviados++;
      } catch (err: any) {
        errores++;
        erroresLista.push(`${dest.email}: ${err.message}`);
      }
    }

    return NextResponse.json({
      enviados,
      errores,
      total: emails.length,
      errores_detalle: erroresLista.length > 0 ? erroresLista : undefined,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
