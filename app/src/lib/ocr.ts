import { readFile } from 'fs/promises';
import path from 'path';
import { createWorker } from 'tesseract.js';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.js';
import type { RowDataPacket } from 'mysql2';
import db from '@/lib/db';

const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads', 'comprobantes');
const IMAGE_EXT = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'];

// Busca un monto con formato $1,234.56 o 1234.56 o 1234 (MXN). Da prioridad
// a etiquetas tipo importe/total/cantidad/pago. En caso de múltiples cifras,
// toma la más recurrente; si solo ve una, esa es.
export function extraerMontoDeTexto(texto: string): { monto: number | null; fragmento: string | null } {
  if (!texto) return { monto: null, fragmento: null };
  const norm = texto.replace(/\u00A0/g, ' ');

  // Líneas con etiquetas que suelen acompañar el monto realmente pagado.
  const etiqueta = /(monto\s+transferido|importe\s+transferido|monto\s+enviado|importe|monto|cantidad|total|enviaste|env[ií]a?o?|recibimos|se\s+recibe|abono|pago|pagaste|transferiste|dep[oó]sito)/i;

  type C = { valor: number; dec: boolean; esEtiq: boolean; frag: string };
  const cands: C[] = [];

  for (const linea of norm.split(/\r?\n/)) {
    const esEtiq = etiqueta.test(linea);
    // Con símbolo $ (acepta decimales) | número con separador de miles y decimales.
    const re = /\$\s*([0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)|([0-9]{1,3}(?:,[0-9]{3})+\.[0-9]{2})/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(linea)) !== null) {
      const raw = String(m[1] || m[2]);
      const valor = parseFloat(raw.replace(/,/g, ''));
      if (!(valor >= 1 && valor <= 500000)) continue;
      const dec = /[.,][0-9]/.test(raw);
      cands.push({ valor, dec, esEtiq, frag: linea.trim().slice(0, 130) });
    }
  }

  if (cands.length === 0) return { monto: null, fragmento: null };

  // Se prioriza: etiqueta+decimal > decimal > etiqueta > cualquiera; dentro de
  // cada grupo se toma el mayor (los subtotales/IVA son menores que el pago).
  const pick = (arr: C[]) => arr.reduce((a, b) => (b.valor > a.valor ? b : a));
  const grupos: C[][] = [
    cands.filter(c => c.esEtiq && c.dec),
    cands.filter(c => c.dec),
    cands.filter(c => c.esEtiq),
    cands,
  ];
  for (const g of grupos) {
    if (g.length) { const w = pick(g); return { monto: w.valor, fragmento: w.frag }; }
  }
  return { monto: null, fragmento: null };
}

async function ocrImagen(bytes: Buffer, ext: string): Promise<string> {
  const worker = await createWorker('spa+eng', 1, {
    // workerPath/核心Path se resuelven desde node_modules; en standalone quedan
    // incluidos por outputFileTracingIncludes.
  });
  try {
    const { data } = await worker.recognize(bytes);
    return data ? data.text || '' : '';
  } finally {
    await worker.terminate();
  }
}

async function extraerTextoPdf(bytes: Buffer): Promise<string> {
  try {
    const doc = await getDocument({
      data: new Uint8Array(bytes),
      disableWorker: true,
      isEvalSupported: false,
    }).promise;
    let texto = '';
    for (let i = 1; i <= doc.numPages; i++) {
      try {
        const page = await doc.getPage(i);
        const tc = await page.getTextContent();
        texto += (tc.items || []).map((it: any) => it.str || '').join(' ') + '\n';
      } catch {}
    }
    return texto;
  } catch (e) {
    return '';
  }
}

// Función principal: dado el id del comprobante en BD, lee el archivo en disco,
// extrae el monto pagado (imagen → OCR; PDF → pdf-parse) y lo devuelve.
export async function montoOcrComprobante(comprobanteId: number): Promise<{
  ok: boolean;
  monto_ocr: number | null;
  texto: string;
  fragmento: string | null;
  error?: string;
}> {
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT id, archivo_pdf FROM comprobantes_bancarios WHERE id = ? LIMIT 1',
    [comprobanteId]
  );
  if (!Array.isArray(rows) || rows.length === 0) {
    return { ok: false, monto_ocr: null, texto: '', fragmento: null, error: 'Comprobante no encontrado' };
  }
  const nombre = String(rows[0].archivo_pdf || '');
  const safe = path.basename(nombre);
  const ext = path.extname(safe).replace('.', '').toLowerCase();

  let bytes: Buffer;
  try {
    bytes = await readFile(path.join(UPLOAD_DIR, safe));
  } catch (e: any) {
    return { ok: false, monto_ocr: null, texto: '', fragmento: null, error: `No se pudo leer el archivo: ${e.message}` };
  }

  let texto = '';
  if (ext === 'pdf') {
    texto = await extraerTextoPdf(bytes);
  } else if (IMAGE_EXT.includes(ext)) {
    texto = await ocrImagen(bytes, ext);
  } else {
    return { ok: false, monto_ocr: null, texto: '', fragmento: null, error: 'Formato no soportado para OCR' };
  }

  const { monto, fragmento } = extraerMontoDeTexto(texto);
  return { ok: true, monto_ocr: monto, texto, fragmento };
}