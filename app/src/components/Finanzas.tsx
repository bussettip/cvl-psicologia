'use client';
import { useEffect, useState } from 'react';

interface MesData {
  mes: number; nombre: string;
  ingreso: number; num_ingresos: number;
  gasto: number; num_gastos: number;
  entrega: number; num_entregas: number;
  presupuesto: number;
}
interface Presupuesto {
  id: number; titulo: string; descripcion: string; fecha: string;
  monto: number; archivo_url: string; archivo_nombre: string;
  estado: string; autor_nombre: string; autor_apellido: string; created_at: string;
}
interface FinanzasData {
  anio: number;
  resumen: {
    ingreso_anual: number; pendiente_anual: number; gasto_anual: number;
    presupuesto_anual: number; beneficio_anual: number; margen: number;
    ejecucion_presupuesto: number; num_cobros_anual: number;
    sesiones_anual: number; total_pacientes: number; total_psicologas: number;
    ingreso_promedio_mes: number;
  };
  porMes: MesData[];
  presupuestos: Presupuesto[];
  porTipoMes: Record<string, { mes: number; tipo: string; metodo_pago: string; total: number; num: number }[]>;
}

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

const TIPO_LABELS: Record<string, string> = {
  sesion: '🧠 Sesión', taller: '🎓 Taller', programa: '📋 Programa',
  venta_libros: '📚 Venta de Libros', gastos_talleres: '🛠️ Gastos de Talleres', otro: 'Otro'
};
const METODO_LABELS: Record<string, string> = {
  efectivo: '💵 Efectivo', tarjeta_credito: '💳 Crédito',
  tarjeta_debito: '💳 Débito', transferencia: '🏦 Transferencia', otro: 'Otro'
};

export default function Finanzas() {
  const [tab, setTab] = useState<'presupuesto' | 'bancos' | 'impuestos' | 'kpi'>('presupuesto');
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [data, setData] = useState<FinanzasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [bancos, setBancos] = useState<Banco[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [impuestos, setImpuestos] = useState<Impuesto[]>([]);
  const [user, setUser] = useState<any>(null);

  const [showPresForm, setShowPresForm] = useState(false);
  const [presForm, setPresForm] = useState({ titulo: '', descripcion: '', fecha: '', monto: '' });
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

  useEffect(() => {
    setLoading(true);
    fetch(`/api/finanzas?anio=${anio}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); setData(null); }
        else { setData(d); setError(''); }
      })
      .catch(() => setError('Error de conexión'))
      .finally(() => setLoading(false));
    loadBancos();
    loadImpuestos();
  }, [anio]);

  if (loading) return <div className="text-center py-12 text-gray-500">Cargando finanzas...</div>;
  if (error) return <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>;
  if (!data) return null;

  const r = data.resumen;

  const KPI = (label: string, value: string, color: string, sub?: string) => (
    <div className="bg-white rounded-lg shadow p-4 border-l-4" style={{ borderColor: color }}>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">💰 Finanzas {anio}</h2>
        <select value={anio} onChange={e => setAnio(Number(e.target.value))}
          className="px-3 py-2 border rounded-lg text-sm bg-white">
          {[2026, 2025, 2024].map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="flex gap-1 mb-6 bg-white rounded-lg shadow p-1 w-fit flex-wrap">
        <button onClick={() => setTab('presupuesto')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'presupuesto' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          📊 Presupuesto Anual
        </button>
        <button onClick={() => setTab('bancos')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'bancos' ? 'bg-sky-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          🏦 Bancos
        </button>
        <button onClick={() => setTab('impuestos')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'impuestos' ? 'bg-amber-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          📜 Impuestos
        </button>
        <button onClick={() => setTab('kpi')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'kpi' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          📈 KPI
        </button>
      </div>

      {tab === 'presupuesto' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {KPI('Presupuesto Anual', `$${r.presupuesto_anual.toLocaleString('es-MX')}`, '#10b981', `${data.anio}`)}
            {KPI('Ingresos Reales', `$${r.ingreso_anual.toLocaleString('es-MX')}`, '#3b82f6', `${r.num_cobros_anual} cobros`)}
            {KPI('Gastos', `$${r.gasto_anual.toLocaleString('es-MX')}`, '#ef4444', 'gastos aprobados/pagados')}
            {KPI('Beneficio Neto', `$${r.beneficio_anual.toLocaleString('es-MX')}`, r.beneficio_anual >= 0 ? '#059669' : '#dc2626', `${r.margen.toFixed(1)}% del presupuesto`)}
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-gray-800">Ejecución del Presupuesto</h3>
              <span className="text-sm font-bold text-gray-700">{r.ejecucion_presupuesto.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${r.ejecucion_presupuesto > 100 ? 'bg-red-500' : r.ejecucion_presupuesto > 70 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(100, r.ejecucion_presupuesto)}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">Ingresos reales vs presupuesto proyectado del año</p>
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h3 className="font-bold text-sm text-gray-800">Ingresos por Mes</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Mes</th>
                  <th className="text-right px-4 py-3 font-medium">Presupuesto</th>
                  <th className="text-right px-4 py-3 font-medium">Ingreso</th>
                  <th className="text-right px-4 py-3 font-medium">Gasto</th>
                  <th className="text-right px-4 py-3 font-medium">Beneficio</th>
                  <th className="text-right px-4 py-3 font-medium">Cumplimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.porMes.map(m => {
                  const beneficioMes = m.ingreso - m.gasto;
                  const cumplimiento = m.presupuesto > 0 ? (m.ingreso / m.presupuesto) * 100 : (m.ingreso > 0 ? 100 : 0);
                  return (
                    <tr key={m.mes} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-medium text-gray-800">{m.nombre}</td>
                      <td className="px-4 py-2.5 text-right text-gray-500">{m.presupuesto > 0 ? `$${m.presupuesto.toLocaleString('es-MX')}` : '—'}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-blue-600">${m.ingreso.toLocaleString('es-MX')}</td>
                      <td className="px-4 py-2.5 text-right text-red-500">{m.gasto > 0 ? `-$${m.gasto.toLocaleString('es-MX')}` : '—'}</td>
                      <td className={`px-4 py-2.5 text-right font-bold ${beneficioMes >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        ${beneficioMes.toLocaleString('es-MX')}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${cumplimiento >= 90 ? 'bg-emerald-100 text-emerald-700' : cumplimiento >= 50 ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {cumplimiento.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-gray-800">Partidas Presupuestales ({data.presupuestos.length})</h3>
              <button onClick={() => setShowPresForm(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium">
                + Nueva Partida
              </button>
            </div>
            {data.presupuestos.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Sin presupuestos registrados para {data.anio}</p>
            ) : (
              <div className="space-y-2">
                {data.presupuestos.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg border text-xs">
                    <div>
                      <p className="font-medium text-gray-800">{p.titulo}</p>
                      <p className="text-gray-400">{p.fecha}{p.descripcion ? ` • ${p.descripcion}` : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">${Number(p.monto || 0).toLocaleString('es-MX')}</p>
                      {p.archivo_url && (
                        <a href={p.archivo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">📄 Ver archivo</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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

      {tab === 'impuestos' && (
        <div className="space-y-6">
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

      {tab === 'kpi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {KPI('Ingreso Anual', `$${r.ingreso_anual.toLocaleString('es-MX')}`, '#3b82f6', `${r.num_cobros_anual} cobros en ${data.anio}`)}
            {KPI('Ingreso Promedio/Mes', `$${Math.round(r.ingreso_promedio_mes).toLocaleString('es-MX')}`, '#8b5cf6', 'promedio anual')}
            {KPI('Pendiente de Cobrar', `$${r.pendiente_anual.toLocaleString('es-MX')}`, '#f59e0b', 'cobros en estado pendiente')}
            {KPI('Gasto Promedio/Mes', `$${Math.round(r.gasto_anual / 12).toLocaleString('es-MX')}`, '#ef4444', 'gastos aprobados/pagados')}
            {KPI('Sesiones Completadas', String(r.sesiones_anual), '#059669', `en ${data.anio}`)}
            {KPI('Pacientes Registrados', String(r.total_pacientes), '#10b981', 'total en el sistema')}
            {KPI('Psicólogas Activas', String(r.total_psicologas), '#06b6d4', 'con rol psicóloga')}
            {KPI('Margen de Beneficio', `${r.margen.toFixed(1)}%`, r.margen >= 0 ? '#059669' : '#dc2626', `${r.beneficio_anual >= 0 ? 'positivo' : 'negativo'}`)}
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-bold text-sm text-gray-800 mb-3">📈 Ingresos por Mes</h3>
            <div className="flex items-end gap-1.5 h-40">
              {data.porMes.map(m => {
                const max = Math.max(...data.porMes.map(x => x.ingreso), 1);
                return (
                  <div key={m.mes} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <div className="w-full rounded-t-md bg-blue-500 hover:bg-blue-600 transition-colors"
                      style={{ height: `${Math.max(3, (m.ingreso / max) * 100)}%` }} title={`${m.nombre}: $${m.ingreso.toLocaleString('es-MX')}`} />
                    <span className="text-[9px] text-gray-400 mt-1">{m.nombre.slice(0, 3)}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Cobros pagados por mes ({data.anio})</p>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-bold text-sm text-gray-800 mb-3">💼 Distribución por Tipo y Método</h3>
            {Object.keys(data.porTipoMes).length === 0 ? (
              <p className="text-xs text-gray-400 italic">Sin cobros este año</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(data.porTipoMes).map(([key, items]) => {
                  const mes = items[0].mes;
                  const total = items.reduce((s, i) => s + i.total, 0);
                  const mesData = data.porMes.find(x => x.mes === mes);
                  return (
                    <div key={key} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">{TIPO_LABELS[items[0].tipo] || items[0].tipo}</span>
                        <span className="text-xs text-gray-400">{mesData?.nombre || mes}</span>
                      </div>
                      <div className="mt-1 space-y-1">
                        {items.map((i, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-gray-500">{METODO_LABELS[i.metodo_pago] || i.metodo_pago} ({i.num})</span>
                            <span className="font-medium text-gray-700">${i.total.toLocaleString('es-MX')}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-right text-xs font-bold text-gray-800 mt-1">${total.toLocaleString('es-MX')}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-bold text-sm text-gray-800 mb-3">🎯 Eficiencia Operativa</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500">Ingreso por Sesión</p>
                <p className="text-lg font-bold text-gray-800">
                  {r.sesiones_anual > 0 ? `$${Math.round(r.ingreso_anual / r.sesiones_anual).toLocaleString('es-MX')}` : '—'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500">Ingreso por Paciente</p>
                <p className="text-lg font-bold text-gray-800">
                  {r.total_pacientes > 0 ? `$${Math.round(r.ingreso_anual / r.total_pacientes).toLocaleString('es-MX')}` : '—'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500">Ingreso por Psicóloga</p>
                <p className="text-lg font-bold text-gray-800">
                  {r.total_psicologas > 0 ? `$${Math.round(r.ingreso_anual / r.total_psicologas).toLocaleString('es-MX')}` : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPresForm && (
        <Modal title="Nueva Partida Presupuestal" onClose={() => setShowPresForm(false)}>
          <form onSubmit={async e => {
            e.preventDefault();
            const body: any = { titulo: presForm.titulo, descripcion: presForm.descripcion, monto: Number(presForm.monto), fecha: presForm.fecha || new Date().toISOString().slice(0, 10) };
            if (user) { body.created_by = user.id; }
            const res = await fetch('/api/mercadeo/presupuestos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (res.ok) {
              setShowPresForm(false);
              setPresForm({ titulo: '', descripcion: '', fecha: '', monto: '' });
              setLoading(true);
              fetch(`/api/finanzas?anio=${anio}`).then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
            } else {
              const d = await res.json();
              alert(d.error || 'Error al guardar');
            }
          }} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Título *</label>
              <input required value={presForm.titulo} onChange={e => setPresForm({ ...presForm, titulo: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej. Materiales terapéuticos" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
              <textarea value={presForm.descripcion} onChange={e => setPresForm({ ...presForm, descripcion: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Monto (MXN) *</label>
                <input required type="number" min="0" step="0.01" value={presForm.monto}
                  onChange={e => setPresForm({ ...presForm, monto: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fecha *</label>
                <input required type="date" value={presForm.fecha}
                  onChange={e => setPresForm({ ...presForm, fecha: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium">
                Guardar Partida
              </button>
              <button type="button" onClick={() => setShowPresForm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium">
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
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
