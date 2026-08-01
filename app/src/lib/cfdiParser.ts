import { XMLParser } from 'fast-xml-parser';

export interface CfdiData {
  uuid: string;
  rfc_emisor: string;
  emisor: string;
  rfc_receptor: string;
  receptor: string;
  fecha: string;
  tipo: string;
  subtotal: number;
  iva: number;
  total: number;
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

export function parseCfdiXml(xml: string): CfdiData {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true,
    trimValues: true,
    processEntities: true,
  });

  const doc = parser.parse(xml);
  const comp = doc.Comprobante || {};
  const attr = comp['@_'] || {};

  const emisor = comp.Emisor?.['@_'] || {};
  const receptor = comp.Receptor?.['@_'] || {};
  const complemento = comp.Complemento || {};
  const tfd = Array.isArray(complemento) ? complemento.find(x => x.TimbreFiscalDigital) : complemento.TimbreFiscalDigital;
  const timbre = (Array.isArray(tfd) ? tfd[0] : tfd)?.['@_'] || {};

  const impuestosNode = comp.Impuestos || {};
  const traslados = asArray<any>(impuestosNode.Traslados?.Traslado);
  let iva = 0;
  for (const t of traslados) {
    const ta = t['@_'] || {};
    if (String(ta.Impuesto) === '002' && ta.Importe) {
      iva += parseFloat(String(ta.Importe));
    }
  }

  const subtotal = parseFloat(String(attr.Subtotal || '0')) || 0;
  const total = parseFloat(String(attr.Total || '0')) || 0;

  let fecha = String(attr.Fecha || '');
  if (fecha) {
    fecha = fecha.replace('T', ' ').slice(0, 19);
  }

  return {
    uuid: String(timbre.UUID || ''),
    rfc_emisor: String(emisor.Rfc || ''),
    emisor: String(emisor.Nombre || ''),
    rfc_receptor: String(receptor.Rfc || ''),
    receptor: String(receptor.Nombre || ''),
    fecha,
    tipo: String(attr.TipoDeComprobante || 'I'),
    subtotal,
    iva: Math.round(iva * 100) / 100,
    total,
  };
}
