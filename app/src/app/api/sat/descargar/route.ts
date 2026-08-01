import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import {
  Fiel,
  HttpsWebClient,
  FielRequestBuilder,
  Service,
  QueryParameters,
  DateTimePeriod,
  DownloadType,
  RequestType,
  DocumentStatus,
  CfdiPackageReader,
} from '@nodecfdi/sat-ws-descarga-masiva';
import { parseCfdiXml } from '@/lib/cfdiParser';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'facturas');
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

function getUserId(req: NextRequest): number | null {
  const cookie = req.cookies.get('crm_session')?.value;
  if (!cookie) return null;
  try {
    const user = JSON.parse(atob(cookie));
    return user.id || null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const errors: string[] = [];
  try {
    const formData = await req.formData();
    const cerFile = formData.get('cer') as File | null;
    const keyFile = formData.get('key') as File | null;
    const password = String(formData.get('password') || '');
    const anio = Number(formData.get('anio'));
    const mes = Number(formData.get('mes'));
    const tipo = String(formData.get('tipo') || 'recibidas');

    if (!cerFile || !keyFile) return NextResponse.json({ error: 'Sube los archivos .cer y .key de tu FIEL' }, { status: 400 });
    if (!password) return NextResponse.json({ error: 'Escribe la contraseña de tu FIEL (.key)' }, { status: 400 });
    if (!anio || !mes || mes < 1 || mes > 12) return NextResponse.json({ error: 'Selecciona mes y año válidos' }, { status: 400 });

    const createdBy = getUserId(req);

    const cer = Buffer.from(await cerFile.arrayBuffer()).toString('latin1');
    const key = Buffer.from(await keyFile.arrayBuffer()).toString('latin1');

    const fiel = Fiel.create(cer, key, password);
    if (!fiel.isValid()) {
      return NextResponse.json({ error: 'La FIEL no es válida: revisa que el certificado (.cer) no esté vencido y que la contraseña sea correcta' }, { status: 400 });
    }

    const webClient = new HttpsWebClient();
    const requestBuilder = new FielRequestBuilder(fiel);
    const service = new Service(requestBuilder, webClient);

    const lastDay = new Date(anio, mes, 0).getDate();
    const start = `${anio}-${String(mes).padStart(2, '0')}-01 00:00:00`;
    const end = `${anio}-${String(mes).padStart(2, '0')}-${lastDay} 23:59:59`;

    const parameters = QueryParameters.create(
      DateTimePeriod.createFromValues(start, end),
      new DownloadType(tipo === 'emitidas' ? 'issued' : 'received'),
      new RequestType('xml'),
    ).withDocumentStatus(new DocumentStatus('active'));

    const query = await service.query(parameters);
    if (!query.getStatus().isAccepted()) {
      return NextResponse.json({ error: `El SAT rechazó la solicitud: ${query.getStatus().getMessage()}` }, { status: 400 });
    }
    const requestId = query.getRequestId();

    let verify: any = null;
    for (let i = 0; i < 24; i++) {
      verify = await service.verify(requestId);
      if (!verify.getStatus().isAccepted()) {
        return NextResponse.json({ error: `Error al verificar la solicitud: ${verify.getStatus().getMessage()}` }, { status: 400 });
      }
      const sr = verify.getStatusRequest();
      if (sr.isTypeOf('Finished')) break;
      if (sr.isTypeOf('Failure') || sr.isTypeOf('Rejected') || sr.isTypeOf('Expired')) {
        return NextResponse.json({ error: `La solicitud no se pudo completar: ${sr.getMessage()}` }, { status: 400 });
      }
      await sleep(5000);
    }

    if (!verify || !verify.getStatusRequest().isTypeOf('Finished')) {
      return NextResponse.json({ error: 'El SAT aún está generando los paquetes, inténtalo de nuevo en unos minutos' }, { status: 202 });
    }

    const packageIds: string[] = verify.getPackageIds();
    const totalCfdis = Number(verify.getNumberCfdis()) || 0;
    let guardadas = 0;
    const duplicadas: string[] = [];

    if (packageIds.length === 0) {
      return NextResponse.json({ total: totalCfdis, guardadas: 0, duplicadas: 0, message: 'No se encontraron facturas en el periodo' });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    for (const packageId of packageIds) {
      let download: any;
      try {
        download = await service.download(packageId);
      } catch (e: any) {
        errors.push(`Paquete ${packageId}: ${e.message}`);
        continue;
      }
      if (!download.getStatus().isAccepted()) {
        errors.push(`Paquete ${packageId}: ${download.getStatus().getMessage()}`);
        continue;
      }

      let reader: any;
      try {
        reader = await CfdiPackageReader.createFromContents(download.getPackageContent());
      } catch (e: any) {
        errors.push(`Paquete ${packageId} no se pudo leer: ${e.message}`);
        continue;
      }

      for await (const map of reader.cfdis()) {
        for (const [name, xml] of map) {
          try {
            const data = parseCfdiXml(xml);
            const uuid = data.uuid || name;
            const fileName = `${uuid}.xml`;
            await writeFile(path.join(UPLOAD_DIR, fileName), xml, 'utf8');

            const [result] = await db.query(
              `INSERT INTO facturas (uuid, rfc_emisor, emisor, rfc_receptor, receptor, fecha, tipo, subtotal, iva, total, estado, archivo_xml, anio, mes, created_by)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'vigente', ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE archivo_xml = VALUES(archivo_xml)`,
              [
                uuid, data.rfc_emisor || null, data.emisor || null,
                data.rfc_receptor || null, data.receptor || null,
                data.fecha || null, data.tipo || 'I',
                data.subtotal, data.iva, data.total,
                `/uploads/facturas/${fileName}`,
                anio, mes, createdBy
              ]
            ) as any[];
            if ((result as any).affectedRows === 2) duplicadas.push(uuid);
            else guardadas++;
          } catch (e: any) {
            errors.push(`${name}: ${e.message}`);
          }
        }
      }
    }

    return NextResponse.json({
      total: totalCfdis,
      guardadas,
      duplicadas: duplicadas.length,
      errores: errors.slice(0, 20),
      message: errors.length === 0 ? 'Descarga completada' : 'Descarga completada con errores'
    });
  } catch (e: any) {
    return NextResponse.json({ error: `Error en la descarga: ${e.message}` }, { status: 500 });
  }
}
