'use client';
import { useEffect, useState } from 'react';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

interface ConfigSat {
  rfc: string;
  razon_social: string;
  regimen_fiscal: string;
  codigo_postal: string;
  has_pack: boolean;
  finkok_username: string;
  has_finkok_password: boolean;
  serie_facturas: string;
  pac_produccion: boolean;
  has_logo: boolean;
  updated_at?: string;
}

export default function SatConfig() {
  const [tab, setTab] = useState<'empresa' | 'descargar' | 'listado'>('empresa');
  const [config, setConfig] = useState<ConfigSat | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const [rfc, setRfc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [regimen, setRegimen] = useState('601');
  const [cp, setCp] = useState('');
  const [cerFile, setCerFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [finkokUser, setFinkokUser] = useState('');
  const [finkokPass, setFinkokPass] = useState('');
  const [serie, setSerie] = useState('F');
  const [pacProduccion, setPacProduccion] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const [factAnio, setFactAnio] = useState(new Date().getFullYear());
  const [factMes, setFactMes] = useState(new Date().getMonth() + 1);
  const [factTipo, setFactTipo] = useState('recibidas');
  const [satStatus, setSatStatus] = useState('');
  const [descargando, setDescargando] = useState(false);

  const [facturas, setFacturas] = useState<any[]>([]);
  const [factLoading, setFactLoading] = useState(false);

  const loadConfig = () => {
    fetch('/api/sat/config').then(r => r.json()).then(d => {
      if (d.config) {
        setConfig(d.config);
        setRfc(d.config.rfc || '');
        setRazonSocial(d.config.razon_social || '');
        setRegimen(d.config.regimen_fiscal || '601');
        setCp(d.config.codigo_postal || '');
        setFinkokUser(d.config.finkok_username || '');
        setSerie(d.config.serie_facturas || 'F');
        setPacProduccion(Boolean(d.config.pac_produccion));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { loadConfig(); }, []);

  const loadFacturas = async () => {
    setFactLoading(true);
    try {
      const res = await fetch(`/api/facturas?anio=${factAnio}&mes=${factMes}`);
      const d = await res.json();
      if (!d.error) setFacturas(d.facturas || []);
    } catch {}
    setFactLoading(false);
  };

  useEffect(() => {
    if (tab === 'listado') loadFacturas();
  }, [tab, factAnio, factMes]);

  const saveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const fd = new FormData();
      fd.append('rfc', rfc);
      fd.append('razon_social', razonSocial);
      fd.append('regimen_fiscal', regimen);
      fd.append('codigo_postal', cp);
      if (cerFile) fd.append('cer', cerFile);
      if (keyFile) fd.append('key', keyFile);
      if (password) fd.append('password', password);
      if (finkokUser) fd.append('finkok_username', finkokUser);
      if (finkokPass) fd.append('finkok_password', finkokPass);
      fd.append('serie_facturas', serie);
      fd.append('pac_produccion', pacProduccion ? '1' : '0');
      if (logoFile) fd.append('logo', logoFile);
      const res = await fetch('/api/sat/config', { method: 'POST', body: fd });
      const d = await res.json();
      if (d.error) setMsg(`❌ ${d.error}`);
      else {
        setMsg(`✅ ${d.message}`);
        setCerFile(null); setKeyFile(null); setPassword(''); setFinkokPass(''); setLogoFile(null);
        loadConfig();
      }
    } catch (err: any) {
      setMsg(`❌ ${err.message}`);
    }
    setSaving(false);
  };

  const descargar = async (e: React.FormEvent) => {
    e.preventDefault();
    setDescargando(true);
    setSatStatus('⏳ Conectando con el SAT... esto puede tardar 1-2 minutos');
    try {
      const fd = new FormData();
      fd.append('usar_pack', '1');
      fd.append('anio', String(factAnio));
      fd.append('mes', String(factMes));
      fd.append('tipo', factTipo);
      const res = await fetch('/api/sat/descargar', { method: 'POST', body: fd });
      const d = await res.json();
      if (d.error) setSatStatus(`❌ ${d.error}`);
      else {
        const icon = d.message === 'Descarga completada' ? '✅' : '⚠️';
        setSatStatus(`${icon} Total: ${d.total} • Guardadas: ${d.guardadas} • Duplicadas: ${d.duplicadas}${d.errores?.length ? ` • Errores: ${d.errores.length}` : ''}`);
        loadFacturas();
      }
    } catch {
      setSatStatus('❌ Error de conexión al descargar');
    }
    setDescargando(false);
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Cargando contabilidad...</div>;

  return (
    <div className="space-y-6">
      <div className="flex gap-1 mb-4 bg-white rounded-lg shadow p-1 w-fit flex-wrap">
        <button onClick={() => setTab('empresa')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'empresa' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          🏢 Empresa y Pack
        </button>
        <button onClick={() => setTab('descargar')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'descargar' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          ⬇️ Descargar del SAT
        </button>
        <button onClick={() => setTab('listado')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'listado' ? 'bg-sky-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          📄 Facturas
        </button>
      </div>

      {tab === 'empresa' && (
        <form onSubmit={saveConfig} className="bg-white rounded-xl shadow p-5 space-y-4 max-w-3xl">
          <div>
            <h3 className="font-bold text-sm text-gray-800 mb-1">🏢 Datos Fiscales de la Empresa</h3>
            <p className="text-xs text-gray-500 mb-4">
              RFC y datos que se usarán para emitir y recibir facturas. El pack (.cer y .key) se guarda <b>cifrado</b> en la base de datos.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">RFC *</label>
              <input required value={rfc} onChange={e => setRfc(e.target.value.toUpperCase())}
                placeholder="XAXX010101000"
                className="w-full border rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Razón social</label>
              <input value={razonSocial} onChange={e => setRazonSocial(e.target.value)}
                placeholder="Nombre o razón social"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Régimen fiscal</label>
              <select value={regimen} onChange={e => setRegimen(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="601">601 - General de Ley Personas Morales</option>
                <option value="603">603 - Personas Morales con Fines no Lucrativos</option>
                <option value="605">605 - Sueldos y Salarios</option>
                <option value="606">606 - Arrendamiento</option>
                <option value="608">608 - Demás ingresos</option>
                <option value="609">609 - Consolidación</option>
                <option value="610">610 - Residentes en el Extranjero</option>
                <option value="611">611 - Ingresos por Dividendos</option>
                <option value="612">612 - Personas Físicas con Actividades Empresariales y Profesionales</option>
                <option value="614">614 - Ingresos por intereses</option>
                <option value="615">615 - Régimen de los ingresos por obtención de premios</option>
                <option value="616">616 - Sin obligaciones fiscales</option>
                <option value="621">621 - Incorporación Fiscal</option>
                <option value="625">625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas</option>
                <option value="626">626 - Régimen Simplificado de Confianza</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Código postal</label>
              <input value={cp} onChange={e => setCp(e.target.value)}
                placeholder="C.P. de la empresa"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold text-sm text-gray-800 mb-1">📦 Pack de la FIEL / CSD</h3>
            <p className="text-xs text-gray-500 mb-3">
              {config?.has_pack
                ? 'Ya hay un pack guardado. Vuelve a subirlo solo si necesitas renovarlo.'
                : 'Aún no hay pack guardado. Sube el .cer y .key para poder descargar facturas del SAT.'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Certificado (.cer)</label>
                <input type="file" accept=".cer" onChange={e => setCerFile(e.target.files?.[0] || null)}
                  className="w-full border rounded-lg px-3 py-2 text-sm file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-indigo-600 file:text-white file:text-xs" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Llave privada (.key)</label>
                <input type="file" accept=".key,.pem" onChange={e => setKeyFile(e.target.files?.[0] || null)}
                  className="w-full border rounded-lg px-3 py-2 text-sm file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-indigo-600 file:text-white file:text-xs" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña de la FIEL</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="off"
                  placeholder="••••••••"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              La llave privada y la contraseña se cifran (AES-256-GCM) antes de guardarse. Nunca se muestran ni se exponen.
            </p>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold text-sm text-gray-800 mb-1">🖨️ Emisión de Facturas (PAC Finkok)</h3>
            <p className="text-xs text-gray-500 mb-3">
              Credenciales del PAC para timbrar los CFDI que emiten desde Recepción/Supervisora. Se guardan cifradas.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Usuario Finkok</label>
                <input value={finkokUser} onChange={e => setFinkokUser(e.target.value)}
                  placeholder="usuario@finkok.com"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña Finkok</label>
                <input type="password" value={finkokPass} onChange={e => setFinkokPass(e.target.value)} autoComplete="off"
                  placeholder={config?.has_finkok_password ? '•••••••• (guardada)' : 'Contraseña del PAC'}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Serie de facturas</label>
                <input value={serie} onChange={e => setSerie(e.target.value.toUpperCase().slice(0, 10))}
                  placeholder="F"
                  className="w-full border rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={pacProduccion} onChange={e => setPacProduccion(e.target.checked)}
                    className="w-4 h-4 text-indigo-600" />
                  PAC de producción (desmarcado = demo/pruebas)
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Logo para el PDF</label>
                <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)}
                  className="w-full border rounded-lg px-3 py-2 text-sm file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-indigo-600 file:text-white file:text-xs" />
                <p className="text-[11px] text-gray-400 mt-1">
                  {config?.has_logo ? 'Hay un logo guardado. Sube otro para reemplazarlo.' : 'Sin logo: el PDF mostrará la razón social.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-center pt-1">
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium">
              {saving ? 'Guardando...' : '💾 Guardar Configuración'}
            </button>
            {msg && <span className="text-sm text-gray-700">{msg}</span>}
          </div>
        </form>
      )}

      {tab === 'descargar' && (
        <div className="bg-white rounded-xl shadow p-5 space-y-4 max-w-3xl">
          <div>
            <h3 className="font-bold text-sm text-gray-800 mb-1">⬇️ Descargar Facturas del SAT</h3>
            <p className="text-xs text-gray-500 mb-4">
              Usa el Web Service de descarga masiva con el pack guardado. Se descargan los XML y se indexan por mes.
            </p>
          </div>
          <form onSubmit={descargar} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mes *</label>
                <select value={factMes} onChange={e => setFactMes(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                  {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Año *</label>
                <input type="number" min="2017" max={new Date().getFullYear()} value={factAnio}
                  onChange={e => setFactAnio(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                <select value={factTipo} onChange={e => setFactTipo(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="recibidas">Recibidas</option>
                  <option value="emitidas">Emitidas</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={descargando || !config?.has_pack}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium">
              {descargando ? '⏳ Descargando...' : '⬇️ Descargar Facturas del Mes'}
            </button>
          </form>
          {!config?.has_pack && (
            <p className="text-xs text-amber-600">Primero sube el pack de la FIEL en la pestaña &quot;Empresa y Pack&quot;.</p>
          )}
          {satStatus && <p className="text-xs text-gray-600 whitespace-pre-line">{satStatus}</p>}
        </div>
      )}

      {tab === 'listado' && (
        <div className="space-y-4">
          <div className="flex gap-2 items-center flex-wrap">
            <select value={factMes} onChange={e => setFactMes(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 text-sm bg-white">
              {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <input type="number" value={factAnio} onChange={e => setFactAnio(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 text-sm w-24" />
            <button onClick={loadFacturas} disabled={factLoading}
              className="px-4 py-2 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-lg text-sm font-medium">
              🔄 Refrescar
            </button>
            <span className="text-xs text-gray-500">{facturas.length} factura(s) de {factMes}/{factAnio}</span>
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-800">Facturas {factMes}/{factAnio}</h3>
              <span className="text-[10px] text-gray-400">Total del mes: ${facturas.reduce((s, f) => s + Number(f.total || 0), 0).toLocaleString('es-MX')}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-3 py-2.5 font-medium">Fecha</th>
                    <th className="text-left px-3 py-2.5 font-medium">Emisor</th>
                    <th className="text-left px-3 py-2.5 font-medium">RFC</th>
                    <th className="text-right px-3 py-2.5 font-medium">Subtotal</th>
                    <th className="text-right px-3 py-2.5 font-medium">IVA</th>
                    <th className="text-right px-3 py-2.5 font-medium">Total</th>
                    <th className="text-center px-3 py-2.5 font-medium">Tipo</th>
                    <th className="text-center px-3 py-2.5 font-medium">XML</th>
                    <th className="text-center px-3 py-2.5 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {facturas.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-6 text-center text-gray-400 text-xs italic">Sin facturas. Descarga las del mes en la pestaña &quot;Descargar del SAT&quot;.</td></tr>
                  ) : facturas.map(f => (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-500">{f.fecha ? String(f.fecha).slice(0, 10) : '—'}</td>
                      <td className="px-3 py-2 font-medium text-gray-800 max-w-[180px] truncate">{f.emisor || '—'}</td>
                      <td className="px-3 py-2 text-gray-500">{f.rfc_emisor || '—'}</td>
                      <td className="px-3 py-2 text-right text-gray-700">${Number(f.subtotal).toLocaleString('es-MX')}</td>
                      <td className="px-3 py-2 text-right text-blue-600">${Number(f.iva).toLocaleString('es-MX')}</td>
                      <td className="px-3 py-2 text-right font-semibold text-gray-800">${Number(f.total).toLocaleString('es-MX')}</td>
                      <td className="px-3 py-2 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600">
                          {f.tipo === 'I' ? 'Ingreso' : f.tipo === 'E' ? 'Egreso' : f.tipo === 'P' ? 'Pago' : f.tipo}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {f.archivo_xml && (
                          <a href={f.archivo_xml} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">📄 Ver</a>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={async () => {
                          if (!confirm('¿Eliminar esta factura y su XML?')) return;
                          await fetch(`/api/facturas?id=${f.id}`, { method: 'DELETE' });
                          loadFacturas();
                        }}
                          className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-[10px] font-medium">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
