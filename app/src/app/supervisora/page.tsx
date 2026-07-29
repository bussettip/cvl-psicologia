'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DictationButton from '@/components/DictationButton';


type SubTab = 'resumen' | 'pacientes' | 'programas' | 'talleres' | 'cuestionario' | 'admin' | 'reglas';

export default function SupervisoraPage() {
  const [user, setUser] = useState<any>(null);
  const [subTab, setSubTab] = useState<SubTab>('resumen');
  const [stats, setStats] = useState<any>(null);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [rendimiento, setRendimiento] = useState<any[]>([]);
  const [sesiones, setSesiones] = useState<any[]>([]);
  const [notas, setNotas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [psicologas, setPsicologas] = useState<any[]>([]);
  const [filtroPsicologa, setFiltroPsicologa] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [expandedPac, setExpandedPac] = useState<number | null>(null);
  const [historial, setHistorial] = useState<{ paciente: any; asignaciones: any[]; sesiones: any[]; notas: any[] }>({ paciente: null, asignaciones: [], sesiones: [], notas: [] });
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [guardandoComentario, setGuardandoComentario] = useState(false);
  const [comentarioTipo, setComentarioTipo] = useState('sugerencia_supervisora');
  const [reglas, setReglas] = useState<any[]>([]);
  const [editingRegla, setEditingRegla] = useState<number | null>(null);
  const [editReglaItems, setEditReglaItems] = useState<string[]>([]);
  const [nuevoItemRegla, setNuevoItemRegla] = useState('');
  const [savingRegla, setSavingRegla] = useState(false);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(data => {
      setUser(data.user || null);
    }).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then(r => r.json()),
      fetch('/api/admin/notas').then(r => r.json()),
    ]).then(([dash, notasData]) => {
      setStats(dash);
      setAlertas(dash.alertasRecientes || []);
      setRendimiento(dash.rendimiento || []);
      setSesiones(dash.ultimasSesiones || []);
      setNotas(notasData.notas || []);
    }).finally(() => setLoading(false));

    fetch('/api/admin/pacientes').then(r => r.json()).then(d => {
      setPacientes(Array.isArray(d) ? d : d.pacientes || []);
    }).catch(() => {});

    fetch('/api/admin/usuarios?rol=psicologa').then(r => r.json()).then(d => {
      const list = Array.isArray(d) ? d : d.usuarios || [];
      setPsicologas(list.filter((u: any) => u.rol === 'psicologa'));
    }).catch(() => {});

    fetch('/api/admin/reglas').then(r => r.json()).then(d => {
      setReglas(d.reglas || []);
    }).catch(() => {});
  }, []);

  if (!user && loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500">Cargando...</p></div>;

  if (!user || !['supervisora', 'supervisor', 'lider'].includes(user.rol)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Acceso restringido a supervisores/líder</p>
          <Link href="/" className="text-indigo-600 hover:underline">Volver al Dashboard</Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500">Cargando...</p></div>;

  const totalAlertas = alertas.length;
  const totalCasosActivos = rendimiento.reduce((sum: number, r: any) => sum + Number(r.casos_activos), 0);
  const totalSesionesHoy = sesiones.filter((s: any) => {
    const today = new Date().toISOString().split('T')[0];
    return s.fecha_programada === today;
  }).length;

  const togglePaciente = async (pacienteId: number) => {
    if (expandedPac === pacienteId) {
      setExpandedPac(null);
      setHistorial({ paciente: null, asignaciones: [], sesiones: [], notas: [] });
      return;
    }
    setExpandedPac(pacienteId);
    setLoadingHistorial(true);
    setNuevoComentario('');
    try {
      const res = await fetch(`/api/pacientes/${pacienteId}`);
      const data = await res.json();
      setHistorial({ paciente: data.paciente, asignaciones: data.asignaciones || [], sesiones: data.sesiones || [], notas: data.notas || [] });
    } catch { setHistorial({ paciente: null, asignaciones: [], sesiones: [], notas: [] }); }
    setLoadingHistorial(false);
  };

  const startEditRegla = (r: any) => {
    setEditingRegla(r.id);
    setEditReglaItems(Array.isArray(r.items) ? [...r.items] : JSON.parse(r.items || '[]'));
    setNuevoItemRegla('');
  };

  const saveRegla = async () => {
    if (!editingRegla) return;
    setSavingRegla(true);
    try {
      const res = await fetch('/api/admin/reglas', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingRegla, items: editReglaItems, actualizado_por: user?.id })
      });
      if (!res.ok) throw new Error('Error al guardar');
      setReglas(prev => prev.map(r => r.id === editingRegla ? { ...r, items: JSON.stringify(editReglaItems) } : r));
      setEditingRegla(null);
    } catch (e: any) { alert('Error: ' + e.message); }
    setSavingRegla(false);
  };

  const addItemRegla = () => {
    if (!nuevoItemRegla.trim()) return;
    setEditReglaItems(prev => [...prev, nuevoItemRegla.trim()]);
    setNuevoItemRegla('');
  };

  const removeItemRegla = (idx: number) => {
    setEditReglaItems(prev => prev.filter((_, i) => i !== idx));
  };

  const pacientesFiltrados = pacientes.filter((p: any) => {
    if (filtroPsicologa && String(p.psicologa_id_asign) !== filtroPsicologa) return false;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      return (p.nombre || '').toLowerCase().includes(q) || (p.apellido || '').toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q);
    }
    return true;
  });

  const guardarComentario = async (pacienteId: number) => {
    if (!nuevoComentario.trim()) { alert('Escribe un comentario'); return; }
    setGuardandoComentario(true);
    try {
      const res = await fetch('/api/admin/notas', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente_id: pacienteId,
          autor_id: user.id,
          autor_rol: user.rol,
          tipo: comentarioTipo,
          contenido: nuevoComentario
        })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      alert('Comentario guardado — visible para la psicóloga');
      setNuevoComentario('');
      togglePaciente(pacienteId);
    } catch (e: any) { alert('Error: ' + e.message); }
    setGuardandoComentario(false);
  };

  const subTabs: { key: SubTab; label: string; icon: string }[] = [
    { key: 'resumen', label: 'Resumen', icon: '📊' },
    { key: 'pacientes', label: 'Pacientes', icon: '🧑' },
    { key: 'programas', label: 'Programas', icon: '📚' },
    { key: 'talleres', label: 'Talleres', icon: '🎓' },
    { key: 'cuestionario', label: 'Cuestionario', icon: '📋' },
    { key: 'admin', label: 'Admin', icon: '⚙️' },
    { key: 'reglas', label: 'Reglas', icon: '📜' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">👩‍⚕️ Panel Supervisora</h1>
              <p className="text-sm text-gray-500">{user.nombre} {user.apellido}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                Dashboard
              </Link>
              <Link href="/recepcion" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                📋 Recepción
              </Link>
              <Link href="/mercadeo" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                📣 Mercadeo
              </Link>
              <span className="text-sm text-gray-500">{user.nombre}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Subtabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 -mb-px overflow-x-auto">
            {subTabs.map(t => (
              <button key={t.key} onClick={() => setSubTab(t.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  subTab === t.key
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* RESUMEN */}
        {subTab === 'resumen' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-5 border-l-4 border-red-500">
                <p className="text-sm font-medium text-gray-500">🔴 Alertas Pendientes</p>
                <p className="text-3xl font-bold text-red-600">{totalAlertas}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-5 border-l-4 border-indigo-500">
                <p className="text-sm font-medium text-gray-500">📋 Casos Activos</p>
                <p className="text-3xl font-bold text-indigo-600">{totalCasosActivos}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-5 border-l-4 border-teal-500">
                <p className="text-sm font-medium text-gray-500">📅 Sesiones Hoy</p>
                <p className="text-3xl font-bold text-teal-600">{totalSesionesHoy}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-5">
                <h2 className="text-lg font-bold text-gray-800 mb-4">👩‍⚕️ Rendimiento por Psicóloga</h2>
                <div className="space-y-3">
                  {rendimiento.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{r.nombre} {r.apellido}</p>
                        <p className="text-xs text-gray-500">
                          {r.casos_activos} activos · {r.casos_completados} completados · {r.sesiones_completadas} sesiones
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {Number(r.alertas_pendientes) > 0 && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            {r.alertas_pendientes} alerta(s)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {rendimiento.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Sin datos</p>}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-5">
                <h2 className="text-lg font-bold text-gray-800 mb-4">⚠️ Alertas Recientes</h2>
                <div className="space-y-3">
                  {alertas.map((a: any) => (
                    <div key={a.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-red-800 text-sm">{a.paciente_nombre} {a.paciente_apellido}</p>
                          <p className="text-xs text-gray-600">Psicóloga: {a.psicologa_nombre} {a.psicologa_apellido}</p>
                          <p className="text-xs text-red-600 mt-1">{a.tipo_alerta}: {a.descripcion}</p>
                        </div>
                        <span className="text-xs text-gray-400">Sesión {a.numero_sesion || '-'}</span>
                      </div>
                    </div>
                  ))}
                  {alertas.length === 0 && <p className="text-green-600 text-sm text-center py-4">✅ Sin alertas pendientes</p>}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-5 mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4">📋 Últimas Sesiones</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="py-2 px-3">Fecha</th>
                      <th className="py-2 px-3">Paciente</th>
                      <th className="py-2 px-3">Psicóloga</th>
                      <th className="py-2 px-3">Nº Sesión</th>
                      <th className="py-2 px-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sesiones.map((s: any) => (
                      <tr key={s.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3">{s.fecha_programada}</td>
                        <td className="py-2 px-3 font-medium">{s.paciente_nombre} {s.paciente_apellido}</td>
                        <td className="py-2 px-3">{s.psicologa_nombre} {s.psicologa_apellido}</td>
                        <td className="py-2 px-3">{s.numero_sesion}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.estado === 'completada' ? 'bg-green-100 text-green-700' : s.estado === 'desviada' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {s.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {sesiones.length === 0 && <tr><td colSpan={5} className="text-center text-gray-400 py-4">Sin sesiones</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-4">📝 Últimas Notas / Sugerencias</h2>
              <div className="space-y-3">
                {notas.slice(0, 10).map((n: any) => (
                  <div key={n.id} className={`p-3 rounded-lg border ${n.tipo === 'sugerencia' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-gray-500">{n.tipo === 'sugerencia' ? '💡 Sugerencia' : '📝 Nota'} · {n.autor_nombre} {n.autor_apellido} → {n.psicologa_nombre} {n.psicologa_apellido}</p>
                        <p className="text-sm text-gray-800 mt-1">{n.contenido}</p>
                        {n.paso_tratamiento && <p className="text-xs text-gray-400 mt-1">Paso: {n.paso_tratamiento}</p>}
                      </div>
                      <span className="text-xs text-gray-400">{n.created_at?.split('T')[0]}</span>
                    </div>
                  </div>
                ))}
                {notas.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Sin notas registradas</p>}
              </div>
            </div>
          </>
        )}

        {/* PACIENTES */}
        {subTab === 'pacientes' && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">🧑 Todos los Pacientes ({pacientesFiltrados.length})</h2>

            {/* Filtros */}
            <div className="flex flex-wrap gap-3 mb-4">
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
                placeholder="🔍 Buscar por nombre o email..."
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              <select value={filtroPsicologa} onChange={e => setFiltroPsicologa(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">👩‍⚕️ Todas las psicólogas</option>
                {psicologas.map((ps: any) => (
                  <option key={ps.id} value={ps.id}>{ps.nombre} {ps.apellido}</option>
                ))}
              </select>
              {(filtroPsicologa || busqueda) && (
                <button onClick={() => { setFiltroPsicologa(''); setBusqueda(''); }}
                  className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">✕ Limpiar</button>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3">Nombre</th>
                    <th className="text-left px-4 py-3">Psicóloga</th>
                    <th className="text-left px-4 py-3">Programa</th>
                    <th className="text-left px-4 py-3">Progreso</th>
                    <th className="text-left px-4 py-3">Estado</th>
                    <th className="text-left px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientesFiltrados.map((p: any) => (
                    <tr key={p.id} className={`border-t hover:bg-gray-50 ${expandedPac === p.id ? 'bg-indigo-50' : ''}`}>
                      <td className="px-4 py-3 font-medium">{p.nombre} {p.apellido}</td>
                      <td className="px-4 py-3 text-gray-600">{p.psicologa_nombre || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{p.programa_nombre || '—'}</td>
                      <td className="px-4 py-3">
                        {p.total_sesiones ? (
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${Math.min(p.porcentaje_avance || 0, 100)}%` }} />
                            </div>
                            <span className="text-xs text-gray-500">{p.sesion_actual}/{p.total_sesiones}</span>
                          </div>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>{p.estado || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => togglePaciente(p.id)}
                          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                            expandedPac === p.id ? 'bg-indigo-700 text-white' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                          }`}>
                          {expandedPac === p.id ? 'Cerrar' : 'Ver Historial'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pacientesFiltrados.length === 0 && (
                    <tr><td colSpan={6} className="text-center text-gray-400 py-6">No se encontraron pacientes</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Panel expandido: Historial clínico */}
            {expandedPac && (
              <div className="mt-4 bg-white rounded-xl shadow-sm border p-6">
                {loadingHistorial ? (
                  <p className="text-gray-500 text-center py-6">Cargando historial...</p>
                ) : (
                  <div className="space-y-6">
                    {/* Datos del paciente */}
                    {historial.paciente && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <p className="text-xs font-semibold text-blue-700 mb-1">Motivo de Consulta</p>
                          <p className="text-sm text-gray-800">{historial.paciente.motivo_consulta || 'Sin registrar'}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                          <p className="text-xs font-semibold text-purple-700 mb-1">Diagnóstico Inicial</p>
                          <p className="text-sm text-gray-800">{historial.paciente.diagnostico_inicial || 'Sin registrar'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <p className="text-xs font-semibold text-gray-700 mb-1">Observaciones</p>
                          <p className="text-sm text-gray-800">{historial.paciente.observaciones_generales || 'Sin observaciones'}</p>
                        </div>
                      </div>
                    )}

                    {/* Tratamientos/Asignaciones */}
                    {historial.asignaciones.length > 0 && (
                      <div>
                        <h3 className="font-bold text-sm text-gray-700 mb-3">📋 Tratamientos Asignados</h3>
                        <div className="space-y-2">
                          {historial.asignaciones.map((a: any) => (
                            <div key={a.id} className="bg-indigo-50 p-3 rounded-lg border border-indigo-200 text-xs">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-indigo-800">{a.programa_nombre}</p>
                                  <p className="text-gray-600">Psicóloga: {a.psicologa_nombre} {a.psicologa_apellido} | Supervisor: {a.supervisor_nombre} {a.supervisor_apellido}</p>
                                </div>
                                <div className="text-right">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    a.estado === 'en_curso' ? 'bg-green-100 text-green-700' :
                                    a.estado === 'completado' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                  }`}>{a.estado}</span>
                                  <p className="text-gray-500 mt-1">Sesiones: {a.sesion_actual || 0}/{a.total_sesiones}</p>
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${Math.min(((a.sesion_actual || 0) / (a.total_sesiones || 1)) * 100, 100)}%` }} />
                              </div>
                              {a.alertas_pendientes > 0 && <p className="text-red-600 mt-1 font-semibold">⚠️ {a.alertas_pendientes} alerta(s) pendiente(s)</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sesiones */}
                    <div>
                      <h3 className="font-bold text-sm text-gray-700 mb-3">📅 Historial de Sesiones ({historial.sesiones.length})</h3>
                      {historial.sesiones.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">Sin sesiones registradas</p>
                      ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {historial.sesiones.map((s: any) => (
                            <div key={s.id} className="bg-gray-50 p-3 rounded-lg border text-xs">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium text-gray-800">Sesión {s.numero_sesion} — {s.fecha_programada}</p>
                                  {s.fecha_real && <p className="text-gray-500">Realizada: {s.fecha_real}{s.duracion_minutos ? ` (${s.duracion_minutos} min)` : ''}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                  {s.confirmada_psicologa ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">✅ Confirmada</span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-700">⏳ Pendiente confirmar</span>
                                  )}
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    s.estado === 'completada' ? 'bg-green-100 text-green-700' : s.estado === 'desviada' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                  }`}>{s.estado}</span>
                                </div>
                              </div>
                              {s.meta_titulo && <p className="text-indigo-700 mb-1">🎯 Meta: {s.meta_titulo}</p>}
                              {s.temas_trabajados && <p className="text-gray-700 mt-1"><span className="font-medium">📝 Temas trabajados:</span> {s.temas_trabajados}</p>}
                              {s.observaciones_psicologa && <p className="text-gray-700 mt-1"><span className="font-medium">👁️ Observaciones:</span> {s.observaciones_psicologa}</p>}
                              {s.desviacion === 1 || s.desviacion === true ? (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                  <p className="font-semibold text-red-700">⚠️ Desviación detectada</p>
                                  <p className="text-red-600">Tipo: {s.tipo_desviacion || 'No especificado'}</p>
                                  {s.motivo_desviacion && <p className="text-red-600">Motivo: {s.motivo_desviacion}</p>}
                                </div>
                              ) : null}
                              {s.archivo_url && (
                                <p className="text-gray-500 mt-1">📎 <a href={s.archivo_url} target="_blank" className="underline text-indigo-600">{s.archivo_nombre || 'Archivo adjunto'}</a></p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Notas existentes */}
                    <div>
                      <h3 className="font-bold text-sm text-gray-700 mb-3">📝 Notas Clínicas ({historial.notas.length})</h3>
                      {historial.notas.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">Sin notas registradas</p>
                      ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {historial.notas.map((n: any) => (
                            <div key={n.id} className={`p-3 rounded-lg border text-xs ${
                              n.tipo === 'sugerencia_supervisora' ? 'bg-amber-50 border-amber-200' :
                              n.tipo === 'nota_clinica' ? 'bg-blue-50 border-blue-200' :
                              n.tipo === 'nota_psicologa' ? 'bg-purple-50 border-purple-200' :
                              'bg-green-50 border-green-200'
                            }`}>
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-700">
                                    {n.tipo === 'sugerencia_supervisora' ? '💡 Sugerencia de Supervisora' :
                                     n.tipo === 'nota_clinica' ? '📝 Nota Clínica' :
                                     n.tipo === 'nota_psicologa' ? '👩‍⚕️ Nota de Psicóloga' :
                                     n.tipo === 'observacion' ? '👁️ Observación' :
                                     n.tipo === 'evolucion' ? '📈 Evolución' :
                                     n.tipo === 'impresion' ? '💭 Impresión' : n.tipo}
                                    {' '}· {n.autor_nombre} {n.autor_apellido}
                                  </p>
                                  <p className="text-gray-700 mt-1 whitespace-pre-wrap">{n.contenido}</p>
                                  {n.paso_tratamiento && <p className="text-indigo-600 mt-1">Paso: {n.paso_tratamiento}</p>}
                                </div>
                                <span className="text-gray-400 text-[10px] ml-2 whitespace-nowrap">{n.created_at?.split('T')[0]}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Formulario de comentario */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border-2 border-amber-200">
                      <h3 className="font-bold text-sm text-amber-800 mb-3">💬 Agregar Comentario para la Psicóloga</h3>
                      <p className="text-xs text-amber-700 mb-3">Este comentario será visible en el panel de la psicóloga asignada a este paciente.</p>
                      <div className="flex gap-2 mb-3">
                        <select value={comentarioTipo} onChange={e => setComentarioTipo(e.target.value)}
                          className="px-3 py-1.5 border border-amber-300 rounded text-sm bg-white">
                          <option value="sugerencia_supervisora">💡 Sugerencia</option>
                          <option value="nota_clinica">📝 Nota Clínica</option>
                          <option value="observacion">👁️ Observación</option>
                          <option value="evolucion">📈 Evolución</option>
                          <option value="impresion">💭 Impresión</option>
                        </select>
                      </div>
                      <div className="flex gap-2 items-start">
                        <textarea value={nuevoComentario} onChange={e => setNuevoComentario(e.target.value)} rows={3}
                          className="flex-1 px-3 py-2 border border-amber-300 rounded text-sm resize-none"
                          placeholder="Escribe un comentario, sugerencia o indicación para la psicóloga..." />
                        <DictationButton onResult={(t) => setNuevoComentario(prev => prev + t)} label="🎤 Dictar" />
                      </div>
                      <div className="flex justify-end mt-3">
                        <button onClick={() => guardarComentario(expandedPac)} disabled={guardandoComentario || !nuevoComentario.trim()}
                          className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white rounded text-sm font-medium">
                          {guardandoComentario ? 'Guardando...' : '💬 Guardar Comentario'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PROGRAMAS */}
        {subTab === 'programas' && (
          <iframe src="/programas" className="w-full border-0 rounded-lg shadow" style={{ height: 'calc(100vh - 220px)' }} />
        )}

        {/* TALLERES */}
        {subTab === 'talleres' && (
          <iframe src="/talleres" className="w-full border-0 rounded-lg shadow" style={{ height: 'calc(100vh - 220px)' }} />
        )}

        {/* CUESTIONARIO */}
        {subTab === 'cuestionario' && (
          <iframe src="/cuestionario" className="w-full border-0 rounded-lg shadow" style={{ height: 'calc(100vh - 220px)' }} />
        )}

        {/* ADMIN */}
        {subTab === 'admin' && (
          <iframe src="/admin" className="w-full border-0 rounded-lg shadow" style={{ height: 'calc(100vh - 220px)' }} />
        )}

        {/* REGLAS */}
        {subTab === 'reglas' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-2xl">📜</span> Reglas de la Clínica
              </h2>
              <p className="text-xs text-gray-500 mb-4">Solo la supervisora/líder puede editar estas reglas. Haz clic en "Editar" en cualquier sección.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reglas.map((r: any) => {
                  const items: string[] = editingRegla === r.id ? editReglaItems : (Array.isArray(r.items) ? r.items : (() => { try { return JSON.parse(r.items); } catch { return []; } })());
                  const colors: Record<string, string> = {
                    financieras: 'green', sesiones: 'blue', accesos: 'purple', evaluacion: 'amber',
                    asignacion: 'indigo', derechos: 'green', obligaciones: 'red', flujo: 'gray'
                  };
                  const c = colors[r.seccion] || 'gray';
                  const isEditing = editingRegla === r.id;

                  return (
                    <div key={r.id} className={`bg-${c}-50 rounded-lg border border-${c}-200 p-4`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`font-bold text-sm text-${c}-800`}>{r.titulo}</h3>
                        {isEditing ? (
                          <div className="flex gap-1">
                            <button onClick={saveRegla} disabled={savingRegla}
                              className="px-2 py-1 bg-green-600 text-white rounded text-[10px] font-medium hover:bg-green-700 disabled:bg-gray-400">
                              {savingRegla ? '⏳' : '💾 Guardar'}
                            </button>
                            <button onClick={() => setEditingRegla(null)}
                              className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-[10px] hover:bg-gray-300">✕</button>
                          </div>
                        ) : (
                          <button onClick={() => startEditRegla(r)}
                            className="px-2 py-1 bg-white border border-gray-300 text-gray-600 rounded text-[10px] font-medium hover:bg-gray-50">
                            ✏️ Editar
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="space-y-1.5">
                          {items.map((item: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-1.5 bg-white rounded px-2 py-1 border">
                              <span className="text-gray-400 text-[10px] w-4">{idx + 1}.</span>
                              <input value={item} onChange={e => {
                                const newItems = [...items]; newItems[idx] = e.target.value; setEditReglaItems(newItems);
                              }} className="flex-1 text-xs px-1 py-0.5 border-b border-gray-200 focus:outline-none focus:border-indigo-400 bg-transparent" />
                              <button onClick={() => removeItemRegla(idx)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                            </div>
                          ))}
                          <div className="flex gap-1.5 mt-2">
                            <input value={nuevoItemRegla} onChange={e => setNuevoItemRegla(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && addItemRegla()}
                              placeholder="Nuevo item..."
                              className="flex-1 text-xs px-2 py-1 border border-dashed border-gray-300 rounded focus:outline-none focus:border-indigo-400" />
                            <button onClick={addItemRegla}
                              className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs hover:bg-indigo-200">+ Añadir</button>
                          </div>
                        </div>
                      ) : (
                        <ul className="space-y-1.5 text-xs text-gray-700">
                          {items.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className={`text-${c}-600 mt-0.5`}>•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {r.actualizado_nombre && (
                        <p className="text-[10px] text-gray-400 mt-2">Última edición: {r.actualizado_nombre} {r.actualizado_apellido} — {r.actualizado_en?.split('T')[0]}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Distribución de Ingresos */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💵</span> Distribución de Ingresos por Sesión ($750 MXN)
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-100 rounded-lg p-4 text-center border border-green-300">
                  <p className="text-2xl font-bold text-green-700">$375</p>
                  <p className="text-xs text-green-600 font-medium mt-1">👩‍⚕️ Psicóloga (50%)</p>
                </div>
                <div className="bg-blue-100 rounded-lg p-4 text-center border border-blue-300">
                  <p className="text-2xl font-bold text-blue-700">$187.50</p>
                  <p className="text-xs text-blue-600 font-medium mt-1">🏢 Propietario (25%)</p>
                </div>
                <div className="bg-purple-100 rounded-lg p-4 text-center border border-purple-300">
                  <p className="text-2xl font-bold text-purple-700">$187.50</p>
                  <p className="text-xs text-purple-600 font-medium mt-1">👁️ Supervisora (25%)</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
