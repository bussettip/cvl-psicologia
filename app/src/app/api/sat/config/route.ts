import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { encryptSecret } from '@/lib/satCrypto';
import { Fiel } from '@nodecfdi/sat-ws-descarga-masiva';

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

export async function GET() {
  try {
    const [rows] = await db.query('SELECT rfc, razon_social, regimen_fiscal, codigo_postal, cer, finkok_username, finkok_password_enc, serie_facturas, logo, pac_produccion, updated_at FROM config_sat WHERE id = 1') as any[];
    const row = rows[0];
    if (!row) return NextResponse.json({ config: null });
    return NextResponse.json({
      config: {
        rfc: row.rfc || '',
        razon_social: row.razon_social || '',
        regimen_fiscal: row.regimen_fiscal || '',
        codigo_postal: row.codigo_postal || '',
        has_pack: Boolean(row.cer),
        finkok_username: row.finkok_username || '',
        has_finkok_password: Boolean(row.finkok_password_enc),
        serie_facturas: row.serie_facturas || 'F',
        pac_produccion: Boolean(row.pac_produccion),
        has_logo: Boolean(row.logo),
        updated_at: row.updated_at,
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const rfc = String(formData.get('rfc') || '').trim().toUpperCase();
    const razon_social = String(formData.get('razon_social') || '').trim();
    const regimen_fiscal = String(formData.get('regimen_fiscal') || '').trim();
    const codigo_postal = String(formData.get('codigo_postal') || '').trim();
    const finkok_username = String(formData.get('finkok_username') || '').trim();
    const finkok_password = String(formData.get('finkok_password') || '');
    const serie_facturas = String(formData.get('serie_facturas') || 'F').trim().toUpperCase().slice(0, 10);
    const pac_produccion = formData.get('pac_produccion') === '1' || formData.get('pac_produccion') === 'true';
    const logoFile = formData.get('logo') as File | null;

    if (!rfc) return NextResponse.json({ error: 'El RFC es obligatorio' }, { status: 400 });

    const cerFile = formData.get('cer') as File | null;
    const keyFile = formData.get('key') as File | null;
    const password = String(formData.get('password') || '');

    let cer: string | null = null;
    let keyEnc: string | null = null;
    let passwordEnc: string | null = null;

    if (cerFile && keyFile) {
      if (!password) return NextResponse.json({ error: 'Escribe la contraseña de la FIEL para guardar el pack' }, { status: 400 });
      const cerContent = Buffer.from(await cerFile.arrayBuffer()).toString('latin1');
      const keyContent = Buffer.from(await keyFile.arrayBuffer()).toString('latin1');

      const fiel = Fiel.create(cerContent, keyContent, password);
      if (!fiel.isValid()) {
        return NextResponse.json({ error: 'La FIEL no es válida: revisa que el certificado (.cer) no esté vencido y que la contraseña sea correcta' }, { status: 400 });
      }

      cer = Buffer.from(cerContent, 'latin1').toString('base64');
      keyEnc = encryptSecret(keyContent);
      passwordEnc = encryptSecret(password);
    } else {
      const [existing] = await db.query('SELECT cer, key_enc, password_enc FROM config_sat WHERE id = 1') as any[];
      if (existing[0]?.cer) {
        cer = existing[0].cer;
        keyEnc = existing[0].key_enc;
        passwordEnc = existing[0].password_enc;
      }
    }

    let finkok_password_enc: string | null = null;
    if (finkok_password) {
      finkok_password_enc = encryptSecret(finkok_password);
    } else {
      const [existing] = await db.query('SELECT finkok_password_enc FROM config_sat WHERE id = 1') as any[];
      finkok_password_enc = existing[0]?.finkok_password_enc || null;
    }

    let logo: string | null = null;
    if (logoFile && logoFile.size > 0) {
      const buf = Buffer.from(await logoFile.arrayBuffer());
      if (buf.length > 2 * 1024 * 1024) return NextResponse.json({ error: 'El logo no debe superar 2 MB' }, { status: 400 });
      logo = buf.toString('base64');
    } else {
      const [existing] = await db.query('SELECT logo FROM config_sat WHERE id = 1') as any[];
      logo = existing[0]?.logo || null;
    }

    const updatedBy = getUserId(req);

    await db.query(
      `UPDATE config_sat SET rfc = ?, razon_social = ?, regimen_fiscal = ?, codigo_postal = ?, cer = ?, key_enc = ?, password_enc = ?, finkok_username = ?, finkok_password_enc = ?, serie_facturas = ?, logo = ?, pac_produccion = ?, updated_by = ? WHERE id = 1`,
      [rfc, razon_social, regimen_fiscal, codigo_postal, cer, keyEnc, passwordEnc, finkok_username || null, finkok_password_enc, serie_facturas || 'F', logo, pac_produccion ? 1 : 0, updatedBy]
    );

    return NextResponse.json({ message: 'Configuración fiscal guardada correctamente', has_pack: Boolean(cer) });
  } catch (e: any) {
    return NextResponse.json({ error: `Error al guardar la configuración: ${e.message}` }, { status: 500 });
  }
}
