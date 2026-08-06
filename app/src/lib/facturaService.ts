import { ConfigCfdi, FacturaCfdi } from 'cfdi-sat-nodejs';
import { createClientAsync } from 'soap';
import { DOMParser } from '@xmldom/xmldom';
import { Comprobante40 } from '@nodecfdi/cfdi-expresiones';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import db from '@/lib/db';
import { decryptSecret } from '@/lib/satCrypto';
import { mkdtemp, writeFile, rm, mkdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { tmpdir } from 'os';
import path from 'path';

export interface SolicitudFactura {
  id: number;
  paciente_id: number | null;
  paciente_nombre: string | null;
  solicitado_por: number | null;
  concepto: string;
  cantidad: number;
  unidad: string;
  clave_prod_serv: string;
  clave_unidad: string;
  subtotal: number;
  iva: number;
  total: number;
  rfc_receptor: string;
  razon_social_receptor: string;
  regimen_fiscal_receptor: string;
  uso_cfdi: string;
  forma_pago: string;
  metodo_pago: string;
  estado: string;
  serie: string | null;
  folio: number | null;
}

interface SatConfig {
  rfc: string;
  razon_social: string;
  regimen_fiscal: string;
  codigo_postal: string;
  cer: string | null;
  key_enc: string | null;
  password_enc: string | null;
  finkok_username: string | null;
  finkok_password_enc: string | null;
  serie_facturas: string | null;
  logo: string | null;
  pac_produccion: number;
}

const STAMP_WSDL = path.join(process.cwd(), 'src', 'lib', 'finkok.stamp.wsdl');

export function getSatConfig(row: any): SatConfig {
  return {
    rfc: row?.rfc || '',
    razon_social: row?.razon_social || '',
    regimen_fiscal: row?.regimen_fiscal || '',
    codigo_postal: row?.codigo_postal || '',
    cer: row?.cer || null,
    key_enc: row?.key_enc || null,
    password_enc: row?.password_enc || null,
    finkok_username: row?.finkok_username || null,
    finkok_password_enc: row?.finkok_password_enc || null,
    serie_facturas: row?.serie_facturas || 'F',
    logo: row?.logo || null,
    pac_produccion: Number(row?.pac_produccion || 0),
  };
}

export function fechaLocalISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function base64ToDer(b64: string): Buffer {
  return Buffer.from(b64, 'base64');
}

export async function generarXmlSellado(solicitud: SolicitudFactura, config: SatConfig): Promise<string> {
  if (!config.cer || !config.key_enc || !config.password_enc) {
    throw new Error('No hay CSD configurado. Guarda certificado (.cer), llave (.key) y contraseña en Configuración SAT.');
  }
  if (!config.rfc || !config.razon_social || !config.regimen_fiscal || !config.codigo_postal) {
    throw new Error('Faltan datos del emisor en Configuración SAT.');
  }

  const dir = await mkdtemp(path.join(tmpdir(), 'cfdi-'));
  const certPath = path.join(dir, 'cert.der');
  const keyPath = path.join(dir, 'key.der');
  try {
    await writeFile(certPath, base64ToDer(config.cer));
    await writeFile(keyPath, Buffer.from(decryptSecret(config.key_enc), 'latin1'));
    const password = decryptSecret(config.password_enc);

    const cfg = new ConfigCfdi({ cert_path: certPath, key_path: keyPath, password });
    const factura = new FacturaCfdi(cfg);

    const subtotal = Number(solicitud.subtotal).toFixed(2);
    const total = Number(solicitud.total).toFixed(2);
    const iva = Number(solicitud.iva).toFixed(2);

    factura.createNodeComprobante({
      serie: solicitud.serie || config.serie_facturas || 'F',
      folio: String(solicitud.folio || ''),
      fecha: fechaLocalISO(),
      subtotal,
      formaPago: solicitud.forma_pago,
      total,
      metodoPago: (solicitud.metodo_pago as 'PUE' | 'PPD') || 'PUE',
      lugarExpedicion: config.codigo_postal,
      tipoDeComprobante: 'I',
      moneda: 'MXN',
    });

    factura.createNodeEmisor({
      rfc: config.rfc,
      nombre: config.razon_social,
      regimenFiscal: config.regimen_fiscal,
    });

    factura.createNodeReceptor({
      rfc: solicitud.rfc_receptor,
      nombre: solicitud.razon_social_receptor,
      domicilioFiscal: config.codigo_postal,
      regimenFiscal: solicitud.regimen_fiscal_receptor,
      usoCfdi: solicitud.uso_cfdi,
    });

    factura.createNodeConcepto({
      concepto: {
        claveProdServ: solicitud.clave_prod_serv,
        cantidad: String(solicitud.cantidad),
        claveUnidad: solicitud.clave_unidad,
        descripcion: solicitud.concepto,
        valorUnitario: subtotal,
        importe: subtotal,
        unidad: solicitud.unidad,
        objetoImp: '02',
      },
      impuestos: {
        traslados: Number(iva) > 0
          ? [{ base: subtotal, impuesto: '002', tipoFactor: 'Tasa', tasaOCuota: '0.160000', importe: iva }]
          : undefined,
      },
    });

    return await factura.createXmlSellado();
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

interface AcuseTimbrado {
  xml: string;
  uuid: string;
  fechaTimbrado: string;
  satSeal: string;
  incidencias?: string;
}

export async function timbrarFinkok(xmlSellado: string, config: SatConfig): Promise<AcuseTimbrado> {
  if (!config.finkok_username || !config.finkok_password_enc) {
    throw new Error('Faltan credenciales de Finkok. Configúralas en Administración > Configuración SAT.');
  }
  const username = config.finkok_username;
  const password = decryptSecret(config.finkok_password_enc);

  const prodUrl = 'https://facturacion.finkok.com/servicios/soap/stamp';
  const demoUrl = 'https://demo-facturacion.finkok.com/servicios/soap/stamp';

  const client = await createClientAsync(STAMP_WSDL, {});
  client.setEndpoint(config.pac_produccion ? prodUrl : demoUrl);

  const xmlBase64 = Buffer.from(xmlSellado, 'utf8').toString('base64');
  const args = { xml: xmlBase64, username, password };

  let result: any;
  if (typeof client.stamp === 'function') {
    result = await client.stamp(args);
  } else {
    const ns = client.StampSOAP || client;
    const port = ns.Application || ns;
    if (typeof port.stamp === 'function') result = await port.stamp(args);
    else throw new Error('No se encontró el método stamp en el cliente Finkok');
  }

  const acuse: any = result?.stampResult || result?.return || result;
  if (!acuse) throw new Error('Respuesta vacía de Finkok');

  const incidencias = (acuse.Incidencias?.Incidencia || [])
    .map((i: any) => (typeof i === 'string' ? i : `${i.CodigoError || ''} ${i.MensajeIncidencia || ''}`).trim())
    .filter(Boolean);

  if (acuse.faultstring || incidencias.length > 0 || !acuse.UUID) {
    throw new Error(`Finkok rechazó el CFDI: ${acuse.faultstring || incidencias.join(' | ') || 'sin UUID'}`);
  }

  return {
    xml: acuse.xml,
    uuid: acuse.UUID,
    fechaTimbrado: acuse.Fecha,
    satSeal: acuse.SatSeal || '',
    incidencias: incidencias.join(' | ') || undefined,
  };
}

function uuidDelXml(xml: string): string | null {
  const m = xml.match(/UUID="([0-9a-fA-F-]{36})"/);
  return m ? m[1].toUpperCase() : null;
}

export function expresionQr(xmlTimbrado: string): string {
  const doc = new DOMParser().parseFromString(xmlTimbrado, 'text/xml') as any;
  const expr = new Comprobante40();
  return expr.extract(doc);
}

function formatearFecha(fecha: string): string {
  if (!fecha) return '';
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return fecha;
  return d.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
}

export async function generarPdf(
  xmlTimbrado: string,
  solicitud: SolicitudFactura,
  config: SatConfig,
  uuid: string,
  pdfPathAbs: string
): Promise<void> {
  await mkdir(path.dirname(pdfPathAbs), { recursive: true });
  const doc = new PDFDocument({ size: 'LETTER', margin: 40 });
  doc.pipe(createWriteStream(pdfPathAbs));

  const expresion = expresionQr(xmlTimbrado);
  const qrBuffer = await QRCode.toBuffer(expresion, { errorCorrectionLevel: 'M', width: 240, margin: 1 });
  const qrDataUrl = `data:image/png;base64,${qrBuffer.toString('base64')}`;

  doc.rect(0, 0, doc.page.width, 90).fill('#4f46e5');
  doc.fill('#ffffff').fontSize(18).font('Helvetica-Bold').text(config.razon_social || 'RAZON SOCIAL', 40, 22, { width: 380 });
  doc.fontSize(10).font('Helvetica').text(`RFC: ${config.rfc}`, 40, 48);
  doc.text(`Régimen Fiscal: ${config.regimen_fiscal}`, 40, 64);
  doc.text(`Lugar de expedición: ${config.codigo_postal}`, 40, 80);

  if (config.logo) {
    try {
      const m = config.logo.match(/^data:(.*?),(.*)$/);
      const buf = Buffer.from(m ? m[2] : config.logo, 'base64');
      doc.image(buf, doc.page.width - 130, 22, { width: 90 });
    } catch { /* logo inválido: se omite */ }
  }

  doc.fill('#111827').fontSize(16).font('Helvetica-Bold').text('FACTURA', 450, 48, { align: 'right' });
  doc.fontSize(10).font('Helvetica').text(`Serie: ${solicitud.serie || ''}  Folio: ${solicitud.folio || ''}`, 450, 70, { align: 'right' });

  let y = 120;
  doc.fontSize(11).font('Helvetica-Bold').text('Datos del receptor:', 40, y);
  y += 16;
  doc.font('Helvetica').fontSize(10);
  doc.text(`RFC: ${solicitud.rfc_receptor}`, 40, y);
  doc.text(`Razón social: ${solicitud.razon_social_receptor}`, 40, y + 14);
  doc.text(`Uso CFDI: ${solicitud.uso_cfdi}`, 40, y + 28);
  doc.text(`Régimen fiscal: ${solicitud.regimen_fiscal_receptor}`, 40, y + 42);

  y += 66;
  doc.font('Helvetica-Bold').text('Concepto', 40, y);
  doc.text('Cant.', 300, y);
  doc.text('P. Unitario', 350, y);
  doc.text('Subtotal', 460, y, { align: 'right' });
  y += 16;
  doc.font('Helvetica').fontSize(10);
  doc.text(solicitud.concepto, 40, y, { width: 250 });
  doc.text(String(solicitud.cantidad), 300, y);
  doc.text(`$${Number(solicitud.subtotal).toFixed(2)}`, 350, y);
  doc.text(`$${Number(solicitud.subtotal).toFixed(2)}`, 460, y, { align: 'right' });

  y += 30;
  doc.font('Helvetica').fontSize(10);
  doc.text('Subtotal:', 380, y, { width: 180, align: 'right' });
  doc.text(`$${Number(solicitud.subtotal).toFixed(2)}`, 500, y, { width: 60, align: 'right' });
  y += 14;
  doc.text('IVA 16%:', 380, y, { width: 180, align: 'right' });
  doc.text(`$${Number(solicitud.iva).toFixed(2)}`, 500, y, { width: 60, align: 'right' });
  y += 14;
  doc.font('Helvetica-Bold').text('Total:', 380, y, { width: 180, align: 'right' });
  doc.text(`$${Number(solicitud.total).toFixed(2)}`, 500, y, { width: 60, align: 'right' });
  doc.text(`Forma de pago: ${solicitud.forma_pago}  Método: ${solicitud.metodo_pago}`, 40, y);

  y += 50;
  doc.image(qrDataUrl, 40, y, { width: 110, height: 110 });

  doc.fontSize(7.5).font('Helvetica');
  doc.text(`UUID: ${uuid}`, 170, y);
  doc.text(`Fecha de timbrado: ${formatearFecha(uuidDelXml(xmlTimbrado) ? fechaTimbradoDelXml(xmlTimbrado) : '')}`, 170, y + 10);

  const selloSat = selloSatDelXml(xmlTimbrado);
  if (selloSat) doc.text(`Sello digital del SAT:`, 170, y + 22);
  if (selloSat) doc.text(selloSat, 170, y + 34, { width: 350, lineBreak: true });
  const selloCfdi = selloCfdiDelXml(xmlTimbrado);
  if (selloCfdi) doc.text(`Sello digital del CFDI:`, 170, y + 60);
  if (selloCfdi) doc.text(selloCfdi, 170, y + 72, { width: 350, lineBreak: true });

  doc.fontSize(6.5).font('Helvetica');
  doc.text(`Cadena original del complemento de timbre:`, 40, doc.page.height - 90, { width: 520 });
  const cadena = cadenaOriginalTfd(xmlTimbrado);
  if (cadena) doc.text(cadena, 40, doc.page.height - 78, { width: 520 });

  doc.end();
}

function fechaTimbradoDelXml(xml: string): string {
  const m = xml.match(/FechaTimbrado="([^"]+)"/);
  return m ? m[1] : '';
}

function selloSatDelXml(xml: string): string {
  const m = xml.match(/SelloSAT="([^"]+)"/);
  return m ? m[1] : '';
}

function selloCfdiDelXml(xml: string): string {
  const m = xml.match(/Sello="([^"]+)"/);
  return m ? m[1] : '';
}

function cadenaOriginalTfd(xml: string): string {
  const m = xml.match(/<tfd:TimbreFiscalDigital[^>]*\/>/);
  if (!m) return '';
  const attrs: Record<string, string> = {};
  m[0].replace(/([A-Za-z0-9]+)="([^"]*)"/g, (_: string, k: string, v: string) => { attrs[k] = v; return ''; });
  const parts = ['1.0'];
  const order = ['UUID', 'FechaTimbrado', 'RfcProvCertif', 'SelloCFD', 'NoCertificadoSAT', 'SelloSAT'];
  order.forEach(k => { if (attrs[k] !== undefined) parts.push(`|${attrs[k]}`); });
  return parts.join('|');
}

export async function timbrarSolicitud(solicitudId: number): Promise<{ uuid: string; xmlPath: string; pdfPath: string }> {
  const [rows] = await db.query('SELECT * FROM solicitudes_factura WHERE id = ?', [solicitudId]) as any[];
  const solicitudRow = rows[0];
  if (!solicitudRow) throw new Error('Solicitud no encontrada');
  if (solicitudRow.estado === 'timbrada' && solicitudRow.uuid) {
    return { uuid: solicitudRow.uuid, xmlPath: solicitudRow.xml_path || '', pdfPath: solicitudRow.pdf_path || '' };
  }
  if (solicitudRow.estado !== 'aprobada') {
    throw new Error(`La solicitud debe estar aprobada para timbrarse (estado actual: ${solicitudRow.estado})`);
  }

  const [cfgRows] = await db.query('SELECT * FROM config_sat WHERE id = 1') as any[];
  const config = getSatConfig(cfgRows[0]);
  const solicitud: SolicitudFactura = {
    id: solicitudRow.id,
    paciente_id: solicitudRow.paciente_id,
    paciente_nombre: solicitudRow.paciente_nombre,
    solicitado_por: solicitudRow.solicitado_por,
    concepto: solicitudRow.concepto,
    cantidad: Number(solicitudRow.cantidad || 1),
    unidad: solicitudRow.unidad || 'SERVICIO',
    clave_prod_serv: solicitudRow.clave_prod_serv || '85121706',
    clave_unidad: solicitudRow.clave_unidad || 'E48',
    subtotal: Number(solicitudRow.subtotal),
    iva: Number(solicitudRow.iva || 0),
    total: Number(solicitudRow.total),
    rfc_receptor: solicitudRow.rfc_receptor,
    razon_social_receptor: solicitudRow.razon_social_receptor,
    regimen_fiscal_receptor: solicitudRow.regimen_fiscal_receptor || '616',
    uso_cfdi: solicitudRow.uso_cfdi || 'S01',
    forma_pago: solicitudRow.forma_pago || '01',
    metodo_pago: solicitudRow.metodo_pago || 'PUE',
    estado: solicitudRow.estado,
    serie: solicitudRow.serie || config.serie_facturas || 'F',
    folio: solicitudRow.folio,
  };

  try {
    const xmlSellado = await generarXmlSellado(solicitud, config);
    const acuse = await timbrarFinkok(xmlSellado, config);
    const uuid = (acuse.uuid || uuidDelXml(acuse.xml) || '').toUpperCase();
    if (!uuid) throw new Error('Finkok no devolvió UUID');

    const xmlTimbrado = acuse.xml || xmlSellado;
    const dir = path.join(process.cwd(), 'public', 'uploads', 'cfdi');
    await mkdir(dir, { recursive: true });
    const xmlPath = path.join('uploads', 'cfdi', `${uuid}.xml`);
    const pdfPath = path.join('uploads', 'cfdi', `${uuid}.pdf`);
    await writeFile(path.join(process.cwd(), 'public', xmlPath), xmlTimbrado, 'utf8');

    const pdfAbs = path.join(process.cwd(), 'public', pdfPath);
    await generarPdf(xmlTimbrado, solicitud, config, uuid, pdfAbs);

    await db.query(
      `UPDATE solicitudes_factura SET estado = 'timbrada', uuid = ?, serie = ?, folio = ?, fecha_timbrado = NOW(),
        xml_path = ?, pdf_path = ?, error_timbrado = NULL WHERE id = ?`,
      [uuid, solicitud.serie, solicitud.folio, xmlPath, pdfPath, solicitudId]
    );

    return { uuid, xmlPath, pdfPath };
  } catch (e: any) {
    await db.query(
      `UPDATE solicitudes_factura SET estado = 'error', error_timbrado = ? WHERE id = ?`,
      [e.message || String(e), solicitudId]
    );
    throw e;
  }
}

export async function obtenerSiguienteFolio(serie: string): Promise<number> {
  const [rows] = await db.query(
    'SELECT MAX(folio) AS max_folio FROM solicitudes_factura WHERE serie = ? AND folio IS NOT NULL',
    [serie]
  ) as any[];
  return Number(rows[0]?.max_folio || 0) + 1;
}
