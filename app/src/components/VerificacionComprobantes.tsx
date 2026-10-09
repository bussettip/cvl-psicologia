'use client';
import { useEffect, useState } from 'react';

interface Fila {
  comprobante_id: number;
  cobro_id: number | null;
  nombre_original: string | null;
  fecha: string | null;
  tipo: string | null;
  concepto: string | null;
  cobro_estado: string | null;
  monto_plataforma: number | null;
  paciente: string | null;
  telefono: string | null;
  email: string | null;
  monto_comprobante: number | null;
  diferencia: number | null;
  estado: string | null;
  correo_aclaracion: number;
  verificado_en: string | null;
}

const money = (n: number | null) =>
  n == null ? '—' : `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const badgeEstado = (e: string | null) => {
  switch (e) {
    case 'coincide': return { txt: '✓ Coincide', cls: 'bg-green-100 text-green-700 border-green-300' };
    case 'diferencia': return { txt: '⚠ Diferencia', cls: 'bg-red-100 text-red-700 border-red-300' };
    case 'no_detectado': return { txt: '? No detectado', cls: 'bg-amber-100 text-amber-700 border-amber-300' };
    case 'sin_comprobante': return { txt: 'Sin comprobante', cls: 'bg-gray-100 text-gray-600 border-gray-300' };
    default: return { txt: 'Sin verificar', cls: 'bg-blue-100 text-blue-700 border-blue-300' };
  }
};

export default function VerificacionComprobantes() {
  const [filas, setFilas] = useState<Fila[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const d = await fetch('/api/verificaciones').then(r => r.json());
      setFilas(d.verificaciones || []);
    } catch { /* noop */ }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const verificarTodos = async () => {
    if (!confirm('Se analizarán TODOS los comprobantes con OCR. Puede tardar varios minutos. ¿Continuar?')) return;
    setVerificando(true); setMsg('');
    try {
      const d = await fetch('/api/verificaciones/verificar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
      }).then(r => r.json());
      if (d.error) throw new Error(d.error);
      setMsg(`Verificación completa: ${d.coincide} coinciden · ${d.diferencia} con diferencia · ${d.no_detectado} sin detectar.`);
      await load();
    } catch (e: any) { setMsg('Error: ' + e.message); }
    setVerificando(false);
  };

  const verificarUno = async (id: number) => {
    setBusy(id);
    try {
      const d = await fetch('/api/verificaciones/verificar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comprobante_id: id })
      }).then(r => r.json());
      if (d.error) throw new Error(d.error);
      await load();
    } catch (e: any) { alert('Error: ' + e.message); }
    setBusy(null);
  };

  const enviarAclaracion = async (id?: number) => {
    setBusy(id ?? -1);
    try {
      const d = await fetch('/api/verificaciones/aclaracion', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(id ? { comprobante_id: id } : {})
      }).then(r => r.json());
      const c = d.correo || {};
      if (c.enviado) alert(`Correo de aclaración enviado a ${c.to} (${c.count} comprobante${c.count === 1 ? '' : 's'}).`);
      else alert('No se envió: ' + (c.error || 'sin datos'));
      await load();
    } catch (e: any) { alert('Error: ' + e.message); }
    setBusy(null);
  };

  const conteo = (est: string) => filas.filter(f => f.estado === est).length;
  const sinVerificar = filas.filter(f => !f.estado).length;
  const difPendientes = filas.filter(f => f.estado === 'diferencia' && !f.correo_aclaracion).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-indigo-500">
          <p className="text-sm font-medium text-gray-500">Comprobantes</p>
          <p className="text-2xl font-bold text-gray-800">{filas.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-500">Coinciden</p>
          <p className="text-2xl font-bold text-green-700">{conteo('coincide')}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
          <p className="text-sm font-medium text-gray-500">Con diferencia</p>
          <p className="text-2xl font-bold text-red-700">{conteo('diferencia')}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-amber-500">
          <p className="text-sm font-medium text-gray-500">No detectado</p>
          <p className="text-2xl font-bold text-amber-700">{conteo('no_detectado')}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-500">Sin verificar</p>
          <p className="text-2xl font-bold text-blue-700">{sinVerificar}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={verificarTodos} disabled={verificando}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium">
          {verificando ? '⏳ Verificando…' : '🔎 Verificar todos (OCR)'}
        </button>
        <button onClick={() => enviarAclaracion()} disabled={busy === -1 || difPendientes === 0}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-800 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
          title={difPendientes ? '' : 'No hay diferencias pendientes'}>
          ✉️ Enviar aclaraciones ({difPendientes})
        </button>
        {msg && <span className="text-xs text-gray-600">{msg}</span>}
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-800">Verificación de comprobantes de pago</h3>
          <span className="text-[10px] text-gray-400">Monto registrado vs. monto del comprobante (OCR)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-3 py-3 font-medium">Cobro</th>
                <th className="text-left px-3 py-3 font-medium">Paciente</th>
                <th className="text-left px-3 py-3 font-medium">Fecha</th>
                <th className="text-right px-3 py-3 font-medium">Plataforma</th>
                <th className="text-right px-3 py-3 font-medium">Comprobante</th>
                <th className="text-right px-3 py-3 font-medium">Diferencia</th>
                <th className="text-center px-3 py-3 font-medium">Estado</th>
                <th className="text-center px-3 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400 text-xs italic">Cargando…</td></tr>
              ) : filas.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400 text-xs italic">No hay comprobantes de pago con cobro asociado.</td></tr>
              ) : filas.map(f => {
                const b = badgeEstado(f.estado);
                const dif = f.diferencia;
                const difCls = dif == null ? 'text-gray-400' : Math.abs(dif) > 0.5 ? 'text-red-600 font-bold' : 'text-green-600';
                return (
                  <tr key={f.comprobante_id} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-gray-500">#{f.cobro_id ?? '—'}</td>
                    <td className="px-3 py-2.5 text-gray-700">
                      <div className="font-medium">{f.paciente || '—'}</div>
                      <div className="text-[10px] text-gray-400">{f.concepto || f.tipo || ''}</div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-500">{f.fecha || '—'}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-gray-800">{money(f.monto_plataforma)}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-gray-800">{money(f.monto_comprobante)}</td>
                    <td className={`px-3 py-2.5 text-right ${difCls}`}>{dif != null ? money(dif) : '—'}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${b.cls}`}>{b.txt}</span>
                      {f.estado === 'diferencia' && f.correo_aclaracion ? (
                        <div className="text-[9px] text-gray-400 mt-0.5">aclaración enviada</div>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap justify-center gap-1">
                        <a href={`/api/pago-publico/comprobante?id=${f.comprobante_id}`} target="_blank" rel="noopener noreferrer"
                          title="Ver comprobante"
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[10px] font-medium">🧾 Ver</a>
                        <button onClick={() => verificarUno(f.comprobante_id)} disabled={busy === f.comprobante_id}
                          title="Verificar este comprobante"
                          className="px-2 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded text-[10px] font-medium disabled:opacity-50">
                          {busy === f.comprobante_id ? '…' : '🔎'}
                        </button>
                        {f.estado === 'diferencia' && (
                          <button onClick={() => enviarAclaracion(f.comprobante_id)} disabled={busy === f.comprobante_id}
                            title="Enviar correo de aclaración a administración"
                            className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-[10px] font-medium disabled:opacity-50">
                            ✉️ Aclaración
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-gray-400">
        El OCR lee el monto del comprobante y lo compara con el monto registrado en el cobro. Las diferencias &gt; $0.50 se marcan y puedes enviar la aclaración a administración.
      </p>
    </div>
  );
}
