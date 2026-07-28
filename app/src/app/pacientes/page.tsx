'use client';

import { useEffect, useState, Fragment } from 'react';
import Link from 'next/link';
import DictationButton from '@/components/DictationButton';


interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  fecha_nac: string;
  telefono: string;
  email: string;
  motivo_consulta: string;
  diagnostico_inicial: string;
  observaciones_generales: string;
  estado: string;
  asignaciones_activas: number;
}

interface Asignacion {
  id: number;
  paciente_id: number;
  programa_id: number;
  psicologa_id: number;
  psicologa_nombre: string;
  psicologa_apellido: string;
  supervisor_nombre: string;
  supervisor_apellido: string;
  programa_nombre: string;
  total_sesiones: number;
  sesion_actual: number;
  estado: string;
  fecha_inicio: string;
  fecha_fin_estimada: string;
  created_at: string;
}

interface Programa {
  id: number;
  nombre: string;
  total_sesiones: number;
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [expandedPac, setExpandedPac] = useState<number|null>(null);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [loadingAsig, setLoadingAsig] = useState(false);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({ programa_id: '', psicologa_id: '' });
  const [psicologas, setPsicologas] = useState<any[]>([]);
  const [showSesion, setShowSesion] = useState<number|null>(null);
  const [sesionForm, setSesionForm] = useState({ fecha_programada: '', meta_id: '', notas_previas: '', paso_tratamiento: '' });
  const [metasDisponibles, setMetasDisponibles] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [historialSesiones, setHistorialSesiones] = useState<any[]>([]);
  const [historialNotas, setHistorialNotas] = useState<any[]>([]);
  const [nuevaNota, setNuevaNota] = useState('');
  const [nuevaNotaTipo, setNuevaNotaTipo] = useState('nota_clinica');
  const [guardandoNota, setGuardandoNota] = useState(false);
  const [confirmSesionId, setConfirmSesionId] = useState<number|null>(null);

  const isSupervisor = user?.rol === 'supervisor' || user?.rol === 'supervisora' || user?.rol === 'lider';

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(data => {
      if (data.user) setUser(data.user);
    }).catch(() => {});
    fetchPacientes();
    fetchProgramas();
    fetchPsicologas();
  }, []);

  const fetchPacientes = async () => {
    try {
      const res = await fetch('/api/pacientes');
      const data = await res.json();
      setPacientes(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgramas = async () => {
    try {
      const res = await fetch('/api/programas');
      const data = await res.json();
      setProgramas(data);
    } catch (error) { console.error(error); }
  };

  const fetchPsicologas = async () => {
    try {
      const res = await fetch('/api/usuarios');
      const data = await res.json();
      setPsicologas((data.usuarios || data).filter((u: any) => u.rol === 'psicologa'));
    } catch (error) { console.error(error); }
  };

  const fetchAsignaciones = async (pacienteId: number) => {
    setLoadingAsig(true);
    try {
      const res = await fetch(`/api/pacientes/${pacienteId}`);
      const data = await res.json();
      setAsignaciones(data.asignaciones || []);
      setHistorialSesiones(data.sesiones || []);
      setHistorialNotas(data.notas || []);
    } catch (error) {
      console.error('Error:', error);
      setAsignaciones([]);
      setHistorialSesiones([]);
      setHistorialNotas([]);
    } finally {
      setLoadingAsig(false);
    }
  };

  const fetchMetas = async (programaId: number) => {
    try {
      const res = await fetch(`/api/metas?programa_id=${programaId}`);
      const data = await res.json();
      setMetasDisponibles(data.metas || data || []);
    } catch (error) { console.error(error); }
  };

  const toggleExpand = (pacienteId: number) => {
    if (expandedPac === pacienteId) {
      setExpandedPac(null);
      setAsignaciones([]);
      setShowAssign(false);
      setShowSesion(null);
      setHistorialSesiones([]);
      setHistorialNotas([]);
      setNuevaNota('');
    } else {
      setExpandedPac(pacienteId);
      setHistorialSesiones([]);
      setHistorialNotas([]);
      setNuevaNota('');
      fetchAsignaciones(pacienteId);
    }
  };

  const toggleSesionForm = (asignacionId: number, programaId: number) => {
    if (showSesion === asignacionId) {
      setShowSesion(null);
      setSesionForm({ fecha_programada: '', meta_id: '', notas_previas: '', paso_tratamiento: '' });
    } else {
      setShowSesion(asignacionId);
      setSesionForm({ fecha_programada: new Date().toISOString().split('T')[0], meta_id: '', notas_previas: '', paso_tratamiento: '' });
      fetchMetas(programaId);
    }
  };

  const crearSesion = async (asignacionId: number, pacienteId: number) => {
    if (!sesionForm.fecha_programada) {
      alert('Selecciona la fecha de la sesión');
      return;
    }
    try {
      const res = await fetch('/api/sesiones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asignacion_id: asignacionId,
          fecha_programada: sesionForm.fecha_programada,
          meta_id: sesionForm.meta_id || null,
          nota_psicologa: sesionForm.notas_previas || null,
          paso_tratamiento: sesionForm.paso_tratamiento || null,
          paciente_id: pacienteId,
          autor_id: user?.id,
          autor_rol: user?.rol
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      alert(`Sesión #${data.numero_sesion} registrada`);
      setShowSesion(null);
      setSesionForm({ fecha_programada: '', meta_id: '', notas_previas: '', paso_tratamiento: '' });
      if (expandedPac) fetchAsignaciones(expandedPac);
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  const asignarTratamiento = async (pacienteId: number) => {
    if (!assignForm.programa_id || !assignForm.psicologa_id) {
      alert('Selecciona programa y psicóloga');
      return;
    }
    try {
      const res = await fetch('/api/admin/asignaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente_id: pacienteId,
          psicologa_id: Number(assignForm.psicologa_id),
          programa_id: Number(assignForm.programa_id),
          fecha_inicio: new Date().toISOString().split('T')[0]
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      alert('Tratamiento asignado');
      setShowAssign(false);
      setAssignForm({ programa_id: '', psicologa_id: '' });
      fetchAsignaciones(pacienteId);
      fetchPacientes();
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  const guardarNotaHistorial = async (pacienteId: number) => {
    if (!nuevaNota.trim()) { alert('Escribe o dicta una nota'); return; }
    setGuardandoNota(true);
    try {
      const firstAsig = asignaciones[0];
      const res = await fetch('/api/admin/notas', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente_id: pacienteId,
          asignacion_id: firstAsig?.id || null,
          autor_id: user?.id || null,
          autor_rol: user?.rol || 'admin',
          tipo: nuevaNotaTipo,
          contenido: nuevaNota
        })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      alert('Sección agregada al historial clínico');
      setNuevaNota('');
      setNuevaNotaTipo('nota_clinica');
      fetchAsignaciones(pacienteId);
    } catch (e: any) { alert('Error: ' + e.message); }
    finally { setGuardandoNota(false); }
  };

  const confirmarSesion = async (sesionId: number) => {
    if (!confirm('¿Confirmar que esta sesión se realizó? Se registrará un cobro de $750 MXN en Recepción.')) return;
    setConfirmSesionId(sesionId);
    try {
      const psicId = user?.id || asignaciones[0]?.psicologa_id;
      const res = await fetch('/api/sesiones/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sesion_id: sesionId, psicologa_id: psicId, monto: 750 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`✅ Sesión confirmada. Cobro registrado en Recepción (ID: ${data.cobro_id})`);
      if (expandedPac) fetchAsignaciones(expandedPac);
      fetchPacientes();
    } catch (e: any) { alert('Error: ' + e.message); }
    finally { setConfirmSesionId(null); }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'pausado': return 'bg-yellow-100 text-yellow-800';
      case 'finalizado': return 'bg-blue-100 text-blue-800';
      case 'derivado': return 'bg-purple-100 text-purple-800';
      case 'en_curso': return 'bg-green-100 text-green-800';
      case 'completado': return 'bg-blue-100 text-blue-800';
      case 'desviado': return 'bg-red-100 text-red-800';
      case 'cancelado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pacientesFiltrados = filtro === 'todos'
    ? pacientes
    : pacientes.filter(p => p.estado === filtro);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Cargando pacientes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-gray-400 hover:text-gray-600">
                ← Volver
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Pacientes</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          {['todos', 'activo', 'pausado', 'finalizado', 'derivado'].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filtro === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Lista de Pacientes */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Asignaciones</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pacientesFiltrados.map((paciente) => (
                <Fragment key={paciente.id}>
                  <tr className={`hover:bg-gray-50 ${expandedPac === paciente.id ? 'bg-indigo-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-600">
                            {paciente.nombre[0]}{paciente.apellido[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{paciente.nombre} {paciente.apellido}</div>
                          <div className="text-sm text-gray-500">{paciente.fecha_nac ? new Date(paciente.fecha_nac).toLocaleDateString('es-MX') : '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{paciente.telefono || '-'}</div>
                      <div className="text-sm text-gray-500">{paciente.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{paciente.motivo_consulta || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(paciente.estado)}`}>
                        {paciente.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        paciente.asignaciones_activas > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {paciente.asignaciones_activas}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => toggleExpand(paciente.id)}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                          expandedPac === paciente.id
                            ? 'bg-indigo-700 text-white'
                            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                        }`}>
                        {expandedPac === paciente.id ? 'Cerrar' : 'Ver Caso'}
                      </button>
                    </td>
                  </tr>

                  {/* Fila expandible con el caso */}
                  {expandedPac === paciente.id && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-indigo-50/50">
                        <div className="space-y-4">
                          {/* Info del paciente */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-3 rounded-lg border">
                              <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Motivo de consulta</h4>
                              <p className="text-sm text-gray-700">{paciente.motivo_consulta || 'Sin registrado'}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg border">
                              <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Diagnóstico inicial</h4>
                              <p className="text-sm text-gray-700">{paciente.diagnostico_inicial || 'Sin registrado'}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg border">
                              <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Observaciones</h4>
                              <p className="text-sm text-gray-700">{paciente.observaciones_generales || 'Sin registrado'}</p>
                            </div>
                          </div>

                          {/* Tratamientos - Solo supervisora/lider */}
                          {isSupervisor ? (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-sm text-gray-700">📋 Tratamientos Asignados</h4>
                              <button onClick={() => setShowAssign(!showAssign)}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                  showAssign ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'
                                }`}>
                                {showAssign ? 'Cancelar' : '+ Asignar Tratamiento'}
                              </button>
                            </div>

                            {/* Formulario de asignación */}
                            {showAssign && (
                              <div className="bg-white p-3 rounded-lg border border-green-200 mb-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs text-gray-600 font-medium">Programa *</label>
                                    <select value={assignForm.programa_id}
                                      onChange={e => setAssignForm({...assignForm, programa_id: e.target.value})}
                                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs mt-0.5">
                                      <option value="">— Seleccionar programa —</option>
                                      {programas.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.total_sesiones} sesiones)</option>)}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-xs text-gray-600 font-medium">Psicóloga *</label>
                                    <select value={assignForm.psicologa_id}
                                      onChange={e => setAssignForm({...assignForm, psicologa_id: e.target.value})}
                                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs mt-0.5">
                                      <option value="">— Seleccionar psicóloga —</option>
                                      {psicologas.map((ps: any) => <option key={ps.id} value={ps.id}>{ps.nombre} {ps.apellido}</option>)}
                                    </select>
                                  </div>
                                </div>
                                <button onClick={() => asignarTratamiento(paciente.id)}
                                  className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white py-1.5 rounded text-xs font-medium">
                                  Asignar Tratamiento
                                </button>
                              </div>
                            )}

                            {/* Lista de tratamientos */}
                            {loadingAsig ? (
                              <p className="text-xs text-gray-500">Cargando tratamientos...</p>
                            ) : asignaciones.length === 0 ? (
                              <p className="text-xs text-gray-500 italic bg-white p-3 rounded-lg border">Sin tratamientos asignados</p>
                            ) : (
                              <div className="space-y-2">
                                {asignaciones.map(a => {
                                  const pct = a.total_sesiones ? Math.round((a.sesion_actual / a.total_sesiones) * 100) : 0;
                                  return (
                                    <div key={a.id} className="bg-white p-3 rounded-lg border">
                                      <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-sm text-gray-800">{a.programa_nombre}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getEstadoColor(a.estado)}`}>{a.estado}</span>
                                          </div>
                                          <p className="text-xs text-gray-500">
                                            Psicóloga: {a.psicologa_nombre} {a.psicologa_apellido}
                                            {a.supervisor_nombre && ` | Supervisora: ${a.supervisor_nombre} ${a.supervisor_apellido}`}
                                          </p>
                                          <p className="text-xs text-gray-500 mt-0.5">
                                            Sesión {a.sesion_actual}/{a.total_sesiones} | Inicio: {a.fecha_inicio}
                                            {a.fecha_fin_estimada && ` | Fin est: ${a.fecha_fin_estimada}`}
                                          </p>
                                        </div>
                                        <div className="w-32">
                                          <div className="text-xs text-gray-500 mb-0.5">{pct}%</div>
                                          <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-indigo-600 h-2 rounded-full" style={{width:`${Math.min(pct,100)}%`}} />
                                          </div>
                                        </div>
                                        {a.estado === 'en_curso' && (
                                          <button onClick={() => toggleSesionForm(a.id, a.programa_id)}
                                            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                                              showSesion === a.id
                                                ? 'bg-red-600 text-white hover:bg-red-700'
                                                : 'bg-teal-600 text-white hover:bg-teal-700'
                                            }`}>
                                            {showSesion === a.id ? 'Cancelar' : '+ Nueva Sesión'}
                                          </button>
                                        )}
                                      </div>

                                      {/* Formulario nueva sesión */}
                                      {showSesion === a.id && (
                                        <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                                          <h5 className="font-bold text-xs text-teal-800 mb-2">Registrar Sesión — {a.programa_nombre}</h5>
                                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <div>
                                              <label className="text-xs text-gray-600 font-medium">Fecha *</label>
                                              <input type="date" value={sesionForm.fecha_programada}
                                                onChange={e => setSesionForm({...sesionForm, fecha_programada: e.target.value})}
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs mt-0.5" />
                                            </div>
                                            <div>
                                              <label className="text-xs text-gray-600 font-medium">Meta a trabajar</label>
                                              <select value={sesionForm.meta_id}
                                                onChange={e => setSesionForm({...sesionForm, meta_id: e.target.value})}
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs mt-0.5">
                                                <option value="">— Sin meta específica —</option>
                                                {metasDisponibles.map((m: any) => (
                                                  <option key={m.id} value={m.id}>Sesión {m.sesion_numero}: {m.titulo}</option>
                                                ))}
                                              </select>
                                            </div>
                                            <div>
                                              <label className="text-xs text-gray-600 font-medium">Paso del tratamiento</label>
                                              <input type="number" min="1" value={sesionForm.paso_tratamiento}
                                                onChange={e => setSesionForm({...sesionForm, paso_tratamiento: e.target.value})}
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs mt-0.5" placeholder="Nº de meta" />
                                            </div>
                                          </div>
                                          <div className="mt-2">
                                            <div className="flex items-center gap-2">
                                              <label className="text-xs text-gray-600 font-medium">📝 Nota de la sesión (visible para supervisora)</label>
                                              <DictationButton onResult={(t) => setSesionForm({...sesionForm, notas_previas: sesionForm.notas_previas + t})} />
                                            </div>
                                            <textarea value={sesionForm.notas_previas}
                                              onChange={e => setSesionForm({...sesionForm, notas_previas: e.target.value})} rows={3}
                                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs mt-0.5 resize-none"
                                              placeholder="Escriba una nota sobre la sesión: temas trabajados, progreso del paciente, observaciones clínicas, puntos a mejorar..." />
                                          </div>
                                          <p className="text-xs text-gray-400 mt-1">La nota se guardará en el historial del paciente y será visible para la supervisora.</p>
                                          <button onClick={() => crearSesion(a.id, paciente.id)}
                                            className="mt-2 w-full bg-teal-600 hover:bg-teal-700 text-white py-1.5 rounded text-xs font-medium">
                                            Guardar Sesión y Nota
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          ) : (
                            asignaciones.length > 0 && (
                              <div className="space-y-1">
                                {asignaciones.map(a => {
                                  const pct = a.total_sesiones ? Math.round((a.sesion_actual / a.total_sesiones) * 100) : 0;
                                  return (
                                    <div key={a.id} className="bg-white p-2 rounded-lg border flex items-center gap-3 text-xs">
                                      <span className="font-bold text-gray-800">{a.programa_nombre}</span>
                                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${getEstadoColor(a.estado)}`}>{a.estado}</span>
                                      <span className="text-gray-500">Sesión {a.sesion_actual}/{a.total_sesiones}</span>
                                      <div className="flex-1 max-w-[100px]">
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                          <div className="bg-indigo-600 h-1.5 rounded-full" style={{width:`${Math.min(pct,100)}%`}} />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )
                          )}

                          {/* Historia Clínica */}
                          <div className="border-t pt-4 mt-4">
                            <h4 className="font-bold text-sm text-gray-700 mb-3">📖 Historia Clínica</h4>

                            {/* Nueva Sección del Historial */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200 mb-4">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-base font-bold text-green-800">➕ Nueva Sección del Historial</span>
                                <DictationButton onResult={(t) => setNuevaNota(nuevaNota + t)} />
                              </div>
                              <p className="text-xs text-green-700 mb-3">Dicta o escribe una nueva entrada para el historial clínico de este paciente.</p>
                              <div className="flex gap-2 mb-3">
                                <select value={nuevaNotaTipo} onChange={e => setNuevaNotaTipo(e.target.value)}
                                  className="px-3 py-1.5 border border-green-300 rounded text-sm bg-white">
                                  <option value="nota_clinica">📝 Nota clínica</option>
                                  <option value="observacion">👁️ Observación</option>
                                  <option value="evolucion">📈 Evolución</option>
                                  <option value="impresion">💭 Impresión clínica</option>
                                </select>
                              </div>
                              <textarea value={nuevaNota} onChange={e => setNuevaNota(e.target.value)} rows={4}
                                className="w-full px-3 py-2 border border-green-300 rounded text-sm resize-none"
                                placeholder="Dicta o escribe la nota para el historial clínico del paciente..." />
                              <div className="flex justify-end mt-2">
                                <button onClick={() => guardarNotaHistorial(paciente.id)} disabled={guardandoNota || !nuevaNota.trim()}
                                  className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm font-medium">
                                  {guardandoNota ? 'Guardando...' : '💾 Guardar Sección en Historial'}
                                </button>
                              </div>
                            </div>

                            {/* Sesiones anteriores */}
                            {historialSesiones.length > 0 && (
                              <div className="mb-4">
                                <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">📅 Sesiones</h5>
                                <div className="space-y-2">
                                  {historialSesiones.map((s: any) => (
                                    <div key={s.id} className="bg-white p-3 rounded-lg border">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <p className="text-xs font-medium text-gray-800">Sesión {s.numero_sesion} — {s.fecha_programada}</p>
                                            {s.confirmada_psicologa ? (
                                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-300">
                                                ✅ Psicóloga confirmó
                                              </span>
                                            ) : (
                                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-300">
                                                ⏳ Pendiente confirmación
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-xs text-gray-500">Psicóloga: {s.psicologa_nombre} {s.psicologa_apellido}</p>
                                          {s.temas_trabajados && <p className="text-xs text-gray-600 mt-1"><span className="font-medium">Temas:</span> {s.temas_trabajados}</p>}
                                          {s.observaciones_psicologa && <p className="text-xs text-gray-600 mt-1"><span className="font-medium">Observaciones:</span> {s.observaciones_psicologa}</p>}
                                          {s.nota_psicologa && <p className="text-xs text-gray-600 mt-1"><span className="font-medium">Nota:</span> {s.nota_psicologa}</p>}
                                        </div>
                                        <div className="flex items-center gap-2 ml-2">
                                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.estado === 'completada' ? 'bg-green-100 text-green-700' : s.estado === 'desviada' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {s.estado}
                                          </span>
                                          {!s.confirmada_psicologa && (
                                            <button onClick={() => confirmarSesion(s.id)} disabled={confirmSesionId === s.id}
                                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded text-xs font-medium whitespace-nowrap">
                                              {confirmSesionId === s.id ? 'Confirmando...' : '✅ Confirmar'}
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Notas clínicas */}
                            {historialNotas.length > 0 && (
                              <div>
                                <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">📝 Notas Clínicas</h5>
                                <div className="space-y-2">
                                  {historialNotas.map((n: any) => (
                                    <div key={n.id} className={`p-3 rounded-lg border ${n.tipo === 'sugerencia_supervisora' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="text-xs text-gray-500">{n.tipo} · {n.autor_nombre} {n.autor_apellido}</p>
                                          <p className="text-sm text-gray-800 mt-1">{n.contenido}</p>
                                        </div>
                                        <span className="text-xs text-gray-400">{n.created_at?.split('T')[0]}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {historialSesiones.length === 0 && historialNotas.length === 0 && (
                              <p className="text-xs text-gray-400 text-center py-4">Sin historia clínica registrada</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          {pacientesFiltrados.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No se encontraron pacientes con el filtro seleccionado
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
