'use client';
import { useEffect, useState } from 'react';

interface Banco {
  id: number; nombre: string; banco: string; numero_cuenta: string;
  tipo: string; saldo_inicial: number; saldo: number; num_movimientos: number;
}
interface Movimiento {
  id: number; banco_id: number; banco_nombre: string;
  tipo: string; concepto: string; monto: number;
  fecha: string; metodo_pago: string; observaciones: string;
}
interface Impuesto {
  id: number; concepto: string; tipo: string; monto: number;
  fecha: string; vencimiento: string | null; estado: string;
  observaciones: string; autor_nombre: string; autor_apellido: string;
}
interface CalculoMes {
  mes: number; nombre: string;
  ingresos: number; egresos_factura: number; egresos_psicologas: number;
  base_iva: number; iva: number; base_isr: number; isr: number;
}
interface ImpuestosData {
  anio: number;
  calculoImpuestos: {
    porMes: CalculoMes[];
    anual: { ingresos: number; egresos_factura: number; egresos_psicologas: number; base_iva: number; iva: number; base_isr: number; isr: number };
  };
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default function Contabilidad() {
  const [tab, setTab] = useState<'bancos' | 'facturas' | 'impuestos'>('bancos');
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [data, setData] = useState<ImpuestosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [bancos, setBancos] = useState<Banco[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [impuestos, setImpuestos] = useState<Impuesto[]>([]);
  const [user, setUser] = useState<any>(null);

  const [facturas, setFacturas] = useState<any[]>([]);
  const [factAnio, setFactAnio] = useState(new Date().getFullYear());
  const [factMes, setFactMes] = useState(new Date().getMonth() + 1);
  const [factTipo, setFactTipo] = useState('recibidas');
  const [satStatus, setSatStatus] = useState('');

  const [showBancoForm, setShowBancoForm] = useState(false);
  const [bancoForm, setBancoForm] = useState({ nombre: '', banco: '', numero_cuenta: '', tipo: 'cuenta', saldo_inicial: '' });
  const [showMovForm, setShowMovForm] = useState(false);
  const [movForm, setMovForm] = useState({ banco_id: '', tipo: 'ingreso', concepto: '', monto: '', fecha: '', metodo_pago: 'efectivo' });
  const [showImpForm, setShowImpForm] = useState(false);
  const [impForm, setImpForm] = useState({ concepto: '', tipo: 'IVA', monto: '', fecha: '', vencimiento: '', estado: 'pendiente', observaciones: '' });

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => { if (d.user) setUser(d.user); }).catch(() => {});
  }, []);

  const loadBancos = () => {
    fetch('/api/finanzas/bancos').then(r => r.json()).then(d => {
      if (!d.error) { setBancos(d.bancos || []); setMovimientos(d.movimientos || []); }
    }).catch(() => {});
  };

  const loadImpuestos = () => {
    fetch('/api/finanzas/impuestos').then(r => r.json()).then(d => {
      if (!d.error) setImpuestos(d.impuestos || []);
    }).catch(() => {});
  };

  const loadFacturas = () => {
    fetch(`/api/facturas?anio=${factAnio}&mes=${factMes}`).then(r => r.json()).then(d => {
      if (!d.error) setFacturas(d.facturas || []);
    }).catch(() => {});
  };

  useEffect(() => {
    setLoading(true);
    fetch(`/api/finanzas?anio=${anio}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); setData(null); }
        else { setData({ anio: d.anio, calculoImpuestos: d.calculoImpuestos }); setError(''); }
      })
      .catch(() => setError('Error de conexión'))
      .finally(() => setLoading(false));
    loadBancos();
    loadImpuestos();
  }, [anio]);

  useEffect(() => {
    if (tab === 'facturas') loadFacturas();
  }, [tab, factAnio, factMes]);

  if (loading) return <div className="text-center py-12 text-gray-500">Cargando contabilidad...</div>;
  if (error) return <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>;
  if (!data) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">🧾 Contabilidad {anio}</h2>
        <select value={anio} onChange={e => setAnio(Number(e.target.value))}
          className="px-3 py-2 border rounded-lg text-sm bg-white">
          {[2026, 2025, 2024].map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="flex gap-1 mb-6 bg-white rounded-lg shadow p-1 w-fit flex-wrap">
        <button onClick={() => setTab('bancos')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'bancos' ? 'bg-sky-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          🏦 Bancos
        </button>
        <button onClick={() => setTab('facturas')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'facturas' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          📄 Facturas SAT
        </button>
        <button onClick={() => setTab('impuestos')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'impuestos' ? 'bg-amber-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          📜 Impuestos
        </button>
      </div>

      {tab === 'bancos' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-sky-500">
              <p className="text-sm font-medium text-gray-500">Cuentas</p>
              <p className="text-2xl font-bold text-gray-800">{bancos.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <p className="text-sm font-medium text-gray-500">Saldo Total</p>
              <p className="text-2xl font-bold text-green-600">${bancos.reduce((s, b) => s + Number(b.saldo || 0), 0).toLocaleString('es-MX')}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <p className="text-sm font-medium text-gray-500">Movimientos</p>
              <p className="text-2xl font-bold text-gray-800">{movimientos.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-amber-500">
              <p className="text-sm font-medium text-gray-500">Ingresos Registrados</p>
              <p className="text-2xl font-bold text-amber-600">${movimientos.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + Number(m.monto), 0).toLocaleString('es-MX')}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setShowBancoForm(true)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium">
              + Nueva Cuenta
            </button>
            <button onClick={() => setShowMovForm(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
              + Nuevo Movimiento
            </button>
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h3 className="font-bold text-sm text-gray-800">Cuentas Bancarias</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Cuenta</th>
                  <th className="text-left px-4 py-3 font-medium">Banco</th>
                  <th className="text-left px-4 py-3 font-medium">No. Cuenta</th>
                  <th className="text-center px-4 py-3 font-medium">Tipo</th>
                  <th className="text-right px-4 py-3 font-medium">Saldo</th>
                  <th className="text-center px-4 py-3 font-medium">Movimientos</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bancos.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400 text-xs italic">Sin cuentas registradas</td></tr>
                ) : bancos.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{b.nombre}</td>
                    <td className="px-4 py-3 text-gray-500">{b.banco || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{b.numero_cuenta || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 capitalize">{b.tipo}</span>
                    </td>
                    <td className={`px-4 py-3 text-right font-bold ${Number(b.saldo) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${Number(b.saldo).toLocaleString('es-MX')}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">{b.num_movimientos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h3 className="font-bold text-sm text-gray-800">Últimos Movimientos</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium">Cuenta</th>
                  <th className="text-left px-4 py-3 font-medium">Concepto</th>
                  <th className="text-center px-4 py-3 font-medium">Tipo</th>
                  <th className="text-right px-4 py-3 font-medium">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {movimientos.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400 text-xs italic">Sin movimientos registrados</td></tr>
                ) : movimientos.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-500">{m.fecha}</td>
                    <td className="px-4 py-2.5 font-medium text-gray-700">{m.banco_nombre}</td>
                    <td className="px-4 py-2.5 text-gray-600">{m.concepto || '—'}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${m.tipo === 'ingreso' ? 'bg-green-100 text-green-700' : m.tipo === 'egreso' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {m.tipo}
                      </span>
                    </td>
                    <td className={`px-4 py-2.5 text-right font-bold ${m.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                      {m.tipo === 'ingreso' ? '+' : '-'}${Number(m.monto).toLocaleString('es-MX')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'facturas' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow p-4 border border-teal-100">
            <h3 className="font-bold text-sm text-gray-800 mb-1">📥 Descargar Facturas del SAT</h3>
            <p className="text-xs text-gray-500 mb-4">
              Usa el Web Service oficial de descarga masiva con tu <b>FIEL</b> (.cer y .key). Los archivos se procesan en memoria y
              <b> no se guarda tu contraseña ni tu .key</b> en el sistema. Los XML descargados se almacenan y se indexan por mes.
            </p>
            <form onSubmit={async e => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const fd = new FormData(form);
              setSatStatus('⏳ Conectando con el SAT... esto puede tardar 1-2 minutos');
              setFacturas([]);
              try {
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
            }} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Certificado (.cer) *</label>
                  <input required type="file" accept=".cer" name="cer"
                    className="w-full border rounded-lg px-3 py-2 text-sm file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-teal-600 file:text-white file:text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Llave privada (.key) *</label>
                  <input required type="file" accept=".key,.pem" name="key"
                    className="w-full border rounded-lg px-3 py-2 text-sm file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-teal-600 file:text-white file:text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña de la FIEL *</label>
                  <input required type="password" name="password" autoComplete="off"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="••••••••" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Mes *</label>
                  <select name="mes" value={factMes} onChange={e => setFactMes(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                    {MESES.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Año *</label>
                  <input type="number" name="anio" min="2017" max={new Date().getFullYear()} value={factAnio}
                    onChange={e => setFactAnio(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                  <select name="tipo" value={factTipo} onChange={e => setFactTipo(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="recibidas">Recibidas</option>
                    <option value="emitidas">Emitidas</option>
                  </select>
                </div>
              </div>
              <button type="submit"
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium">
                ⬇️ Descargar Facturas del Mes
              </button>
            </form>
            {satStatus && <p className="mt-3 text-xs text-gray-600 whitespace-pre-line">{satStatus}</p>}
          </div>

          <div className="flex gap-2 items-center">
            <button onClick={loadFacturas}
              className="px-4 py-2 bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-lg text-sm font-medium">
              🔄 Refrescar Listado
            </button>
            <span className="text-xs text-gray-500">{facturas.length} factura(s) de {factMes}/{factAnio}</span>
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-800">Facturas {factMes}/{factAnio} ({factTipo})</h3>
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
                    <tr><td colSpan={9} className="px-4 py-6 text-center text-gray-400 text-xs italic">Sin facturas. Descarga las del mes con tu FIEL.</td></tr>
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
                          <a href={f.archivo_xml} target="_blank" rel="noopener noreferrer"
                            className="text-teal-600 hover:underline">📄 Ver</a>
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

      {tab === 'impuestos' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-500">
              <p className="text-sm font-medium text-gray-500">IVA Estimado {data.anio}</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">${data.calculoImpuestos.anual.iva.toLocaleString('es-MX', { maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-gray-400 mt-1">16% sobre base de {data.calculoImpuestos.anual.base_iva.toLocaleString('es-MX')}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-5 border-l-4 border-indigo-500">
              <p className="text-sm font-medium text-gray-500">ISR Estimado {data.anio}</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">${data.calculoImpuestos.anual.isr.toLocaleString('es-MX', { maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-gray-400 mt-1">Tarifa mensual Art. 96 LISR sobre base de {data.calculoImpuestos.anual.base_isr.toLocaleString('es-MX')}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-5 border-l-4 border-green-500">
              <p className="text-sm font-medium text-gray-500">Pago a Psicólogas {data.anio}</p>
              <p className="text-2xl font-bold text-green-600 mt-1">${data.calculoImpuestos.anual.egresos_psicologas.toLocaleString('es-MX')}</p>
              <p className="text-xs text-gray-400 mt-1">Tratado como factura; cada psicóloga paga sus propios impuestos</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-800">🧾 Cálculo de IVA e ISR por Mes</h3>
              <span className="text-[10px] text-gray-400">Ingresos − gastos con factura = base. Las entregas a psicólogas se deducen solo del ISR.</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-3 py-2.5 font-medium">Mes</th>
                    <th className="text-right px-3 py-2.5 font-medium">Ingresos</th>
                    <th className="text-right px-3 py-2.5 font-medium">Gastos</th>
                    <th className="text-right px-3 py-2.5 font-medium">Psicólogas</th>
                    <th className="text-right px-3 py-2.5 font-medium">Base IVA</th>
                    <th className="text-right px-3 py-2.5 font-medium">IVA (16%)</th>
                    <th className="text-right px-3 py-2.5 font-medium">Base ISR</th>
                    <th className="text-right px-3 py-2.5 font-medium">ISR</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.calculoImpuestos.porMes.map(m => (
                    <tr key={m.mes} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-700">{m.nombre}</td>
                      <td className="px-3 py-2 text-right text-gray-800">${m.ingresos.toLocaleString('es-MX')}</td>
                      <td className="px-3 py-2 text-right text-gray-600">${m.egresos_factura.toLocaleString('es-MX')}</td>
                      <td className="px-3 py-2 text-right text-gray-600">${m.egresos_psicologas.toLocaleString('es-MX')}</td>
                      <td className="px-3 py-2 text-right text-gray-700">${Math.round(m.base_iva).toLocaleString('es-MX')}</td>
                      <td className="px-3 py-2 text-right font-semibold text-blue-600">${m.iva.toLocaleString('es-MX', { maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-right text-gray-700">${Math.round(m.base_isr).toLocaleString('es-MX')}</td>
                      <td className="px-3 py-2 text-right font-semibold text-indigo-600">${m.isr.toLocaleString('es-MX', { maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-bold text-gray-800">
                  <tr>
                    <td className="px-3 py-2.5">Total</td>
                    <td className="px-3 py-2.5 text-right">${data.calculoImpuestos.anual.ingresos.toLocaleString('es-MX')}</td>
                    <td className="px-3 py-2.5 text-right">${data.calculoImpuestos.anual.egresos_factura.toLocaleString('es-MX')}</td>
                    <td className="px-3 py-2.5 text-right">${data.calculoImpuestos.anual.egresos_psicologas.toLocaleString('es-MX')}</td>
                    <td className="px-3 py-2.5 text-right">${Math.round(data.calculoImpuestos.anual.base_iva).toLocaleString('es-MX')}</td>
                    <td className="px-3 py-2.5 text-right text-blue-600">${data.calculoImpuestos.anual.iva.toLocaleString('es-MX', { maximumFractionDigits: 2 })}</td>
                    <td className="px-3 py-2.5 text-right">${Math.round(data.calculoImpuestos.anual.base_isr).toLocaleString('es-MX')}</td>
                    <td className="px-3 py-2.5 text-right text-indigo-600">${data.calculoImpuestos.anual.isr.toLocaleString('es-MX', { maximumFractionDigits: 2 })}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 border border-blue-100">
            <h3 className="font-bold text-sm text-gray-800 mb-2">ℹ️ Metodología</h3>
            <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
              <li><b>Base IVA</b> = Ingresos cobrados − Gastos de la clínica (con factura). IVA = 16% de la base.</li>
              <li><b>Base ISR</b> = Ingresos cobrados − Gastos de la clínica − Pagos a psicólogas.</li>
              <li>Los <b>egresos a psicólogas</b> se registran como factura: son deducibles para la clínica, pero <b>no generan IVA acreditable</b> porque cada psicóloga cubre sus propios impuestos.</li>
              <li>El ISR usa la tarifa mensual de pagos provisionales del Art. 96 LISR (actividad empresarial y profesional).</li>
              <li>Los montos son <b>estimaciones</b>; consulta a tu contador para el cálculo definitivo.</li>
            </ul>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-amber-500">
              <p className="text-sm font-medium text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-amber-600">${impuestos.filter(i => i.estado === 'pendiente').reduce((s, i) => s + Number(i.monto), 0).toLocaleString('es-MX')}</p>
              <p className="text-xs text-gray-400">{impuestos.filter(i => i.estado === 'pendiente').length} impuesto(s)</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <p className="text-sm font-medium text-gray-500">Pagados</p>
              <p className="text-2xl font-bold text-green-600">${impuestos.filter(i => i.estado === 'pagado').reduce((s, i) => s + Number(i.monto), 0).toLocaleString('es-MX')}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
              <p className="text-sm font-medium text-gray-500">Total Registrado</p>
              <p className="text-2xl font-bold text-red-600">${impuestos.reduce((s, i) => s + Number(i.monto), 0).toLocaleString('es-MX')}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <p className="text-sm font-medium text-gray-500">Por Vencer</p>
              <p className="text-2xl font-bold text-blue-600">{impuestos.filter(i => i.estado === 'pendiente' && i.vencimiento).length}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setShowImpForm(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium">
              + Registrar Impuesto
            </button>
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h3 className="font-bold text-sm text-gray-800">Impuestos</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Concepto</th>
                  <th className="text-center px-4 py-3 font-medium">Tipo</th>
                  <th className="text-right px-4 py-3 font-medium">Monto</th>
                  <th className="text-left px-4 py-3 font-medium">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium">Vencimiento</th>
                  <th className="text-center px-4 py-3 font-medium">Estado</th>
                  <th className="text-center px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {impuestos.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400 text-xs italic">Sin impuestos registrados</td></tr>
                ) : impuestos.map(i => (
                  <tr key={i.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-800">{i.concepto}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-100 text-purple-700">{i.tipo}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-gray-800">${Number(i.monto).toLocaleString('es-MX')}</td>
                    <td className="px-4 py-2.5 text-gray-500">{i.fecha}</td>
                    <td className="px-4 py-2.5 text-gray-500">{i.vencimiento || '—'}</td>
                    <td className="px-4 py-2.5 text-center">
                      <select value={i.estado} onChange={async e => {
                        const res = await fetch('/api/finanzas/impuestos', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: i.id, estado: e.target.value })
                        });
                        if (res.ok) loadImpuestos();
                      }}
                        className={`px-2 py-1 rounded text-[11px] font-semibold border ${i.estado === 'pendiente' ? 'bg-amber-50 text-amber-700 border-amber-200' : i.estado === 'pagado' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        <option value="pendiente">Pendiente</option>
                        <option value="pagado">Pagado</option>
                        <option value="exento">Exento</option>
                      </select>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button onClick={async () => {
                        if (!confirm('¿Eliminar este impuesto?')) return;
                        await fetch(`/api/finanzas/impuestos?id=${i.id}`, { method: 'DELETE' });
                        loadImpuestos();
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
      )}

      {showBancoForm && (
        <Modal title="Nueva Cuenta Bancaria" onClose={() => setShowBancoForm(false)}>
          <form onSubmit={async e => {
            e.preventDefault();
            const res = await fetch('/api/finanzas/bancos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...bancoForm, saldo_inicial: Number(bancoForm.saldo_inicial || 0) }) });
            if (res.ok) {
              setShowBancoForm(false);
              setBancoForm({ nombre: '', banco: '', numero_cuenta: '', tipo: 'cuenta', saldo_inicial: '' });
              loadBancos();
            } else {
              const d = await res.json();
              alert(d.error || 'Error al guardar');
            }
          }} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre de la Cuenta *</label>
              <input required value={bancoForm.nombre} onChange={e => setBancoForm({ ...bancoForm, nombre: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Ej. Cuenta principal" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Banco *</label>
                <input required value={bancoForm.banco} onChange={e => setBancoForm({ ...bancoForm, banco: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Ej. BBVA" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">No. Cuenta</label>
                <input value={bancoForm.numero_cuenta} onChange={e => setBancoForm({ ...bancoForm, numero_cuenta: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                <select value={bancoForm.tipo} onChange={e => setBancoForm({ ...bancoForm, tipo: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500">
                  <option value="cuenta">Cuenta</option>
                  <option value="inversion">Inversión</option>
                  <option value="caja">Caja chica</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Saldo Inicial</label>
                <input type="number" step="0.01" value={bancoForm.saldo_inicial}
                  onChange={e => setBancoForm({ ...bancoForm, saldo_inicial: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="0.00" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium">
                Guardar Cuenta
              </button>
              <button type="button" onClick={() => setShowBancoForm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium">
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showMovForm && (
        <Modal title="Nuevo Movimiento" onClose={() => setShowMovForm(false)}>
          <form onSubmit={async e => {
            e.preventDefault();
            const res = await fetch('/api/finanzas/movimientos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...movForm, banco_id: Number(movForm.banco_id), monto: Number(movForm.monto), fecha: movForm.fecha || new Date().toISOString().slice(0, 10) }) });
            if (res.ok) {
              setShowMovForm(false);
              setMovForm({ banco_id: '', tipo: 'ingreso', concepto: '', monto: '', fecha: '', metodo_pago: 'efectivo' });
              loadBancos();
            } else {
              const d = await res.json();
              alert(d.error || 'Error al guardar');
            }
          }} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cuenta *</label>
              <select required value={movForm.banco_id} onChange={e => setMovForm({ ...movForm, banco_id: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Seleccionar cuenta...</option>
                {bancos.map(b => <option key={b.id} value={b.id}>{b.nombre} ({b.banco})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tipo *</label>
                <select value={movForm.tipo} onChange={e => setMovForm({ ...movForm, tipo: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="ingreso">Ingreso</option>
                  <option value="egreso">Egreso</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Monto (MXN) *</label>
                <input required type="number" min="0" step="0.01" value={movForm.monto}
                  onChange={e => setMovForm({ ...movForm, monto: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="0.00" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Concepto *</label>
              <input required value={movForm.concepto} onChange={e => setMovForm({ ...movForm, concepto: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Ej. Depósito honorarios" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fecha *</label>
                <input required type="date" value={movForm.fecha}
                  onChange={e => setMovForm({ ...movForm, fecha: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Método de Pago</label>
                <select value={movForm.metodo_pago} onChange={e => setMovForm({ ...movForm, metodo_pago: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="deposito">Depósito</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
                Guardar Movimiento
              </button>
              <button type="button" onClick={() => setShowMovForm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium">
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showImpForm && (
        <Modal title="Registrar Impuesto" onClose={() => setShowImpForm(false)}>
          <form onSubmit={async e => {
            e.preventDefault();
            const body: any = { concepto: impForm.concepto, tipo: impForm.tipo, monto: Number(impForm.monto), fecha: impForm.fecha || new Date().toISOString().slice(0, 10), vencimiento: impForm.vencimiento || null, estado: impForm.estado, observaciones: impForm.observaciones };
            if (user) body.created_by = user.id;
            const res = await fetch('/api/finanzas/impuestos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (res.ok) {
              setShowImpForm(false);
              setImpForm({ concepto: '', tipo: 'IVA', monto: '', fecha: '', vencimiento: '', estado: 'pendiente', observaciones: '' });
              loadImpuestos();
            } else {
              const d = await res.json();
              alert(d.error || 'Error al guardar');
            }
          }} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Concepto *</label>
              <input required value={impForm.concepto} onChange={e => setImpForm({ ...impForm, concepto: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Ej. ISR mensual" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tipo *</label>
                <select value={impForm.tipo} onChange={e => setImpForm({ ...impForm, tipo: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <option value="IVA">IVA</option>
                  <option value="ISR">ISR</option>
                  <option value="IMSS">IMSS</option>
                  <option value="ISN">ISN</option>
                  <option value="otros">Otros</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Monto (MXN) *</label>
                <input required type="number" min="0" step="0.01" value={impForm.monto}
                  onChange={e => setImpForm({ ...impForm, monto: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="0.00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fecha *</label>
                <input required type="date" value={impForm.fecha}
                  onChange={e => setImpForm({ ...impForm, fecha: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Vencimiento</label>
                <input type="date" value={impForm.vencimiento}
                  onChange={e => setImpForm({ ...impForm, vencimiento: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
                <select value={impForm.estado} onChange={e => setImpForm({ ...impForm, estado: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <option value="pendiente">Pendiente</option>
                  <option value="pagado">Pagado</option>
                  <option value="exento">Exento</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Observaciones</label>
                <input value={impForm.observaciones} onChange={e => setImpForm({ ...impForm, observaciones: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium">
                Guardar Impuesto
              </button>
              <button type="button" onClick={() => setShowImpForm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium">
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-bold text-sm text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
