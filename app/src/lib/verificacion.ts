import db from '@/lib/db';
import nodemailer from 'nodemailer';
import type { RowDataPacket } from 'mysql2';
import { montoOcrComprobante } from '@/lib/ocr';

export const TOLERANCIA = 0.50;
export const CORREO_ACLARACION = process.env.CORREO_ACLARACION || 'bussettip@gmail.com';
const MONEDA = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export type EstadoVerif = 'coincide' | 'diferencia' | 'no_detectado' | 'sin_comprobante';

export interface ResultadoVerif {
  comprobante_id: number;
  cobro_id: number | null;
  paciente: string | null;
  monto_plataforma: number | null;
  monto_comprobante: number | null;
  diferencia: number | null;
  estado: EstadoVerif;
  motivo: string | null;
  fragmento: string | null;
}

async function upsert(r: ResultadoVerif, texto: string | null) {
  await db.query(
    `INSERT INTO verificacion_comprobante
       (comprobante_id, cobro_id, monto_plataforma, monto_comprobante, diferencia, estado, motivo, texto_ocr, verificado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       cobro_id = VALUES(cobro_id),
       monto_plataforma = VALUES(monto_plataforma),
       monto_comprobante = VALUES(monto_comprobante),
       diferencia = VALUES(diferencia),
       estado = VALUES(estado),
       motivo = VALUES(motivo),
       texto_ocr = VALUES(texto_ocr),
       verificado_en = NOW()`,
    [r.comprobante_id, r.cobro_id, r.monto_plataforma, r.monto_comprobante, r.diferencia, r.estado, r.motivo, texto]
  );
}

// Lee un comprobante, extrae el monto por OCR/PDF y lo compara contra el monto
// declarado en el cobro. Guarda el resultado (idempotente) en verificacion_comprobante.
export async function verificarComprobante(comprobanteId: number): Promise<ResultadoVerif> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT cb.id AS comprobante_id, cb.cobro_id, c.monto AS monto_plataforma,
            CONCAT_WS(' ', p.nombre, p.apellido) AS paciente
     FROM comprobantes_bancarios cb
     LEFT JOIN cobros c ON c.id = cb.cobro_id
     LEFT JOIN pacientes p ON p.id = c.paciente_id
     WHERE cb.id = ? LIMIT 1`,
    [comprobanteId]
  );
  if (!Array.isArray(rows) || rows.length === 0) {
    const r: ResultadoVerif = { comprobante_id: comprobanteId, cobro_id: null, paciente: null, monto_plataforma: null, monto_comprobante: null, diferencia: null, estado: 'sin_comprobante', motivo: 'Comprobante no encontrado', fragmento: null };
    return r;
  }
  const row = rows[0];
  const montoPlataforma = row.monto_plataforma != null ? Number(row.monto_plataforma) : null;
  const base: ResultadoVerif = {
    comprobante_id: comprobanteId,
    cobro_id: row.cobro_id != null ? Number(row.cobro_id) : null,
    paciente: row.paciente || null,
    monto_plataforma: montoPlataforma,
    monto_comprobante: null,
    diferencia: null,
    estado: 'no_detectado',
    motivo: null,
    fragmento: null,
  };

  const ocr = await montoOcrComprobante(comprobanteId);
  let texto: string | null = null;
  if (!ocr.ok) {
    base.motivo = ocr.error || 'No se pudo leer el comprobante';
  } else {
    texto = String(ocr.texto || '').slice(0, 8000);
    base.fragmento = ocr.fragmento || null;
    if (ocr.monto_ocr == null) {
      base.motivo = 'No se pudo extraer el monto del comprobante';
    } else {
      base.monto_comprobante = ocr.monto_ocr;
      if (montoPlataforma == null) {
        base.motivo = 'El cobro no tiene monto registrado';
      } else {
        const dif = Math.round((ocr.monto_ocr - montoPlataforma) * 100) / 100;
        base.diferencia = dif;
        base.estado = Math.abs(dif) > TOLERANCIA ? 'diferencia' : 'coincide';
      }
    }
  }

  await upsert(base, texto);
  return base;
}

export async function verificarTodos(): Promise<{
  total: number; coincide: number; diferencia: number; no_detectado: number; resultados: ResultadoVerif[];
}> {
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT id FROM comprobantes_bancarios WHERE cobro_id IS NOT NULL ORDER BY id ASC'
  );
  const resultados: ResultadoVerif[] = [];
  for (const r of (rows as any[])) {
    try {
      resultados.push(await verificarComprobante(Number(r.id)));
    } catch (e: any) {
      resultados.push({ comprobante_id: Number(r.id), cobro_id: null, paciente: null, monto_plataforma: null, monto_comprobante: null, diferencia: null, estado: 'no_detectado', motivo: e?.message || 'Error', fragmento: null });
    }
  }
  return {
    total: resultados.length,
    coincide: resultados.filter(r => r.estado === 'coincide').length,
    diferencia: resultados.filter(r => r.estado === 'diferencia').length,
    no_detectado: resultados.filter(r => r.estado === 'no_detectado').length,
    resultados,
  };
}

function smtpTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

// Envía el correo de aclaración a administración. Si no se pasan ids, envía
// todas las diferencias que aún no tienen correo (correo_aclaracion = 0).
export async function enviarCorreoAclaracion(ids?: number[]): Promise<{ enviado: boolean; to: string; count: number; error?: string }> {
  let sql = `
    SELECT cb.id AS comprobante_id, cb.cobro_id, cb.nombre_original,
           c.monto AS monto_plataforma, c.concepto, c.tipo, c.fecha,
           p.nombre, p.apellido, p.telefono, p.email,
           v.monto_comprobante, v.diferencia, v.estado
    FROM comprobantes_bancarios cb
    JOIN cobros c ON c.id = cb.cobro_id
    LEFT JOIN pacientes p ON p.id = c.paciente_id
    LEFT JOIN verificacion_comprobante v ON v.comprobante_id = cb.id
    WHERE cb.cobro_id IS NOT NULL`;
  const params: any[] = [];
  if (ids && ids.length > 0) {
    sql += ` AND cb.id IN (${ids.map(() => '?').join(',')})`;
    params.push(...ids);
  } else {
    sql += ` AND v.estado = 'diferencia' AND (v.correo_aclaracion = 0 OR v.correo_aclaracion IS NULL)`;
  }
  sql += ' ORDER BY cb.id DESC';

  const [rows] = await db.query<RowDataPacket[]>(sql, params);
  const lista = (rows as any[]);
  if (lista.length === 0) {
    return { enviado: false, to: CORREO_ACLARACION, count: 0, error: 'No hay comprobantes para enviar' };
  }

  const filas = lista.map(r => {
    const nombre = [r.nombre, r.apellido].filter(Boolean).join(' ') || '—';
    const dif = r.diferencia != null ? Number(r.diferencia) : (r.monto_comprobante != null && r.monto_plataforma != null ? Number(r.monto_comprobante) - Number(r.monto_plataforma) : null);
    return `
      <tr>
        <td>${r.cobro_id ?? '—'}</td>
        <td>${nombre}</td>
        <td>${r.concepto || r.tipo || '—'}</td>
        <td style="text-align:right">${r.monto_plataforma != null ? MONEDA.format(Number(r.monto_plataforma)) : '—'}</td>
        <td style="text-align:right">${r.monto_comprobante != null ? MONEDA.format(Number(r.monto_comprobante)) : '—'}</td>
        <td style="text-align:right;font-weight:bold;color:${dif != null && Math.abs(dif) > TOLERANCIA ? '#b91c1c' : '#166534'}">${dif != null ? MONEDA.format(dif) : '—'}</td>
        <td>${r.telefono || '—'}</td>
        <td>${r.email || '—'}</td>
        <td>${r.nombre_original || ('Comprobante ' + r.comprobante_id)}</td>
      </tr>`;
  }).join('');

  const totalDif = lista.reduce((s, r) => {
    const d = r.diferencia != null ? Number(r.diferencia) : (r.monto_comprobante != null && r.monto_plataforma != null ? Number(r.monto_comprobante) - Number(r.monto_plataforma) : 0);
    return s + d;
  }, 0);

  try {
    const smtp = smtpTransport();
    const info = await smtp.sendMail({
      from: `"Centro VivirLibre · Pagos" <${process.env.SMTP_USER || 'no-reply@vivirlibre.org'}>`,
      to: CORREO_ACLARACION,
      subject: `🧾 Aclaración de comprobantes (${lista.length}) — diferencia total ${MONEDA.format(totalDif)}`,
      html: `
        <h3>Aclaración de comprobantes de pago</h3>
        <p>Se detectaron diferencias entre el monto registrado en la plataforma y el monto del comprobante (tolerancia ${MONEDA.format(TOLERANCIA)}).</p>
        <table border="1" cellpadding="6" style="border-collapse:collapse;font-family:Arial;font-size:13px">
          <thead style="background:#f3f4f6">
            <tr>
              <th>Cobro</th><th>Paciente</th><th>Concepto</th>
              <th>Plataforma</th><th>Comprobante</th><th>Diferencia</th>
              <th>Teléfono</th><th>Email</th><th>Archivo</th>
            </tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>
        <p><b>Diferencia total:</b> ${MONEDA.format(totalDif)}</p>
        <p style="color:#6b7280;font-size:12px">Centro VivirLibre · Sistema de pagos verificado</p>
      `,
    });

    const idsOk = lista.map(r => Number(r.comprobante_id));
    if (idsOk.length > 0) {
      await db.query(
        `UPDATE verificacion_comprobante SET correo_aclaracion = 1, correo_enviado_en = NOW()
         WHERE comprobante_id IN (${idsOk.map(() => '?').join(',')})`,
        idsOk
      );
    }
    return { enviado: true, to: CORREO_ACLARACION, count: lista.length, error: undefined };
  } catch (e: any) {
    return { enviado: false, to: CORREO_ACLARACION, count: lista.length, error: `SMTP: ${e.message}` };
  }
}

export interface FilaVerificacion {
  comprobante_id: number;
  cobro_id: number | null;
  nombre_original: string | null;
  fecha: string | null;
  tipo: string | null;
  concepto: string | null;
  cobro_estado: string | null;
  monto_plataforma: number | null;
  paciente_id: number | null;
  paciente: string | null;
  telefono: string | null;
  email: string | null;
  monto_comprobante: number | null;
  diferencia: number | null;
  estado: EstadoVerif | null;
  correo_aclaracion: number;
  verificado_en: string | null;
}

// Lista todos los comprobantes de pago (con cobro) junto con su verificación.
export async function listarVerificaciones(): Promise<FilaVerificacion[]> {
  const [rows] = await db.query<RowDataPacket[]>(`
    SELECT cb.id AS comprobante_id, cb.cobro_id, cb.nombre_original,
           c.fecha, c.tipo, c.concepto, c.estado AS cobro_estado,
           c.monto AS monto_plataforma,
           p.id AS paciente_id, CONCAT_WS(' ', p.nombre, p.apellido) AS paciente,
           p.telefono, p.email,
           v.monto_comprobante, v.diferencia, v.estado, COALESCE(v.correo_aclaracion, 0) AS correo_aclaracion,
           v.verificado_en
    FROM comprobantes_bancarios cb
    JOIN cobros c ON c.id = cb.cobro_id
    LEFT JOIN pacientes p ON p.id = c.paciente_id
    LEFT JOIN verificacion_comprobante v ON v.comprobante_id = cb.id
    ORDER BY cb.id DESC
  `);
  return (rows as any[]).map(r => ({
    comprobante_id: Number(r.comprobante_id),
    cobro_id: r.cobro_id != null ? Number(r.cobro_id) : null,
    nombre_original: r.nombre_original || null,
    fecha: r.fecha ? new Date(r.fecha).toISOString().split('T')[0] : null,
    tipo: r.tipo || null,
    concepto: r.concepto || null,
    cobro_estado: r.cobro_estado || null,
    monto_plataforma: r.monto_plataforma != null ? Number(r.monto_plataforma) : null,
    paciente_id: r.paciente_id != null ? Number(r.paciente_id) : null,
    paciente: r.paciente || null,
    telefono: r.telefono || null,
    email: r.email || null,
    monto_comprobante: r.monto_comprobante != null ? Number(r.monto_comprobante) : null,
    diferencia: r.diferencia != null ? Number(r.diferencia) : null,
    estado: r.estado || null,
    correo_aclaracion: Number(r.correo_aclaracion) || 0,
    verificado_en: r.verificado_en ? new Date(r.verificado_en).toISOString() : null,
  }));
}
