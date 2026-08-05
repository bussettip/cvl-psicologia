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

const TIPO_LABELS: Record<string, string> = {
  sesion: '🧠 Sesión', taller: '🎓 Taller', programa: '📋 Programa',
  venta_libros: '📚 Venta de Libros', gastos_talleres: '🛠️ Gastos de Talleres', otro: 'Otro'
};
const METODO_LABELS: Record<string, string> = {
  efectivo: '💵 Efectivo', tarjeta_credito: '💳 Crédito',
  tarjeta_debito: '💳 Débito', transferencia: '🏦 Transferencia', otro: 'Otro'
};

export default function Finanzas() {
  const [tab, setTab] = useState<'presupuesto' | 'kpi'>('presupuesto');
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [data, setData] = useState<FinanzasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  const [showPresForm, setShowPresForm] = useState(false);
  const [presForm, setPresForm] = useState({ titulo: '', descripcion: '', fecha: '', monto: '' });
  const [editingPres, setEditingPres] = useState<Presupuesto | null>(null);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => { if (d.user) setUser(d.user); }).catch(() => {});
  }, []);

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
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <p className="font-bold text-gray-800">${Number(p.monto || 0).toLocaleString('es-MX')}</p>
                        {p.archivo_url && (
                          <a href={p.archivo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">📄 Ver archivo</a>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingPres(p)}
                          className="px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-[10px] font-medium">
                          ✏️ Editar
                        </button>
                        <button onClick={async () => {
                          if (!confirm('¿Eliminar esta partida presupuestal?')) return;
                          await fetch(`/api/mercadeo/presupuestos?id=${p.id}`, { method: 'DELETE' });
                          setLoading(true);
                          fetch(`/api/finanzas?anio=${anio}`).then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
                        }}
                          className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-[10px] font-medium">
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

      {editingPres && (
        <Modal title="Editar Partida Presupuestal" onClose={() => setEditingPres(null)}>
          <form onSubmit={async e => {
            e.preventDefault();
            const res = await fetch('/api/mercadeo/presupuestos', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: editingPres.id,
                titulo: editingPres.titulo,
                descripcion: editingPres.descripcion,
                monto: Number(editingPres.monto || 0),
                fecha: editingPres.fecha,
                estado: editingPres.estado
              })
            });
            if (res.ok) {
              setEditingPres(null);
              setLoading(true);
              fetch(`/api/finanzas?anio=${anio}`).then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
            } else {
              const d = await res.json();
              alert(d.error || 'Error al actualizar');
            }
          }} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Título *</label>
              <input required value={editingPres.titulo} onChange={e => setEditingPres({ ...editingPres, titulo: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
              <textarea value={editingPres.descripcion || ''} onChange={e => setEditingPres({ ...editingPres, descripcion: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Monto (MXN) *</label>
                <input required type="number" min="0" step="0.01" value={String(editingPres.monto ?? '')}
                  onChange={e => setEditingPres({ ...editingPres, monto: Number(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fecha *</label>
                <input required type="date" value={editingPres.fecha}
                  onChange={e => setEditingPres({ ...editingPres, fecha: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
              <select value={editingPres.estado} onChange={e => setEditingPres({ ...editingPres, estado: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium">
                Guardar Cambios
              </button>
              <button type="button" onClick={() => setEditingPres(null)}
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
