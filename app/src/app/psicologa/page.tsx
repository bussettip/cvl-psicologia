'use client';
import { useEffect, useState, Fragment } from 'react';
import DictationButton from '@/components/DictationButton';
import { getPsicologa, setPsicologa, clearPsicologa } from '@/lib/auth';

export default function PsicologaPage() {
  const [user, setUser] = useState<any>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [sesiones, setSesiones] = useState<any[]>([]);
  const [notas, setNotas] = useState<any[]>([]);
  const [calificaciones, setCalificaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedPac, setExpandedPac] = useState<number | null>(null);
  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [loadingAsig, setLoadingAsig] = useState(false);
  const [showSesion, setShowSesion] = useState<number | null>(null);
  const [sesionForm, setSesionForm] = useState({ fecha_programada: '', meta_id: '', notas_previas: '', paso_tratamiento: '' });
  const [metasDisponibles, setMetasDisponibles] = useState<any[]>([]);
  const [historialSesiones, setHistorialSesiones] = useState<any[]>([]);
  const [historialNotas, setHistorialNotas] = useState<any[]>([]);
  const [nuevaNota, setNuevaNota] = useState('');
  const [nuevaNotaTipo, setNuevaNotaTipo] = useState('nota_clinica');
  const [guardandoNota, setGuardandoNota] = useState(false);
  const [confirmSesionId, setConfirmSesionId] = useState<number | null>(null);
  const [ingresos, setIngresos] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pacientes' | 'sesiones'>('dashboard');
  const [nuevaSeccionSesion, setNuevaSeccionSesion] = useState<number | null>(null);
  const [seccionForm, setSeccionForm] = useState({ tipo: 'nota_clinica', contenido: '', sesion_id: '' });
  const [guardandoSeccion, setGuardandoSeccion] = useState(false);

  useEffect(() => {
    try {
      const saved = getPsicologa();
      if (saved) {
        setUser(saved);
        loadData(saved.id);
        fetchIngresos(saved.id);
      }
    } catch {}
  }, []);

  const handleLogin = async () => {
    if (!loginEmail || !loginPass) { setLoginError('Ingresa email y contraseña'); return; }
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/psicologa/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser(data.user);
      setPsicologa(data.user);
      document.cookie = 'psicologa_user=1; path=/; max-age=86400';
      loadData(data.user.id);
      fetchIngresos(data.user.id);
    } catch (e: any) { setLoginError(e.message); }
    finally { setLoginLoading(false); }
  };

  const loadData = async (psicId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/psicologa/pacientes?psicologa_id=${psicId}`);
      const data = await res.json();
      setPacientes(data.pacientes || []);
      setSesiones(data.sesiones || []);
      setNotas(data.notas || []);
      setCalificaciones(data.calificaciones || []);
    } catch {}
    setLoading(false);
  };

  const fetchIngresos = async (psicId: number) => {
    try {
      const res = await fetch(`/api/psicologa/ingresos?psicologa_id=${psicId}`);
      const data = await res.json();
      setIngresos(data);
    } catch {}
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
      setHistorialSesiones([]);
      setHistorialNotas([]);
      setShowSesion(null);
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
          autor_id: user.id,
          autor_rol: 'psicologa',
          psicologa_id: user.id,
          tipo: nuevaNotaTipo,
          contenido: nuevaNota
        })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      alert('Nota agregada al historial clínico');
      setNuevaNota('');
      fetchAsignaciones(pacienteId);
    } catch (e: any) { alert('Error: ' + e.message); }
    finally { setGuardandoNota(false); }
  };

  const confirmarSesion = async (sesionId: number) => {
    if (!confirm('¿Confirmar que esta sesión se realizó? Se registrará un cobro de $750 MXN.')) return;
    setConfirmSesionId(sesionId);
    try {
      const res = await fetch('/api/sesiones/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sesion_id: sesionId, psicologa_id: user.id, monto: 750 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`Sesión confirmada. Ingreso registrado: $750 MXN`);
      if (expandedPac) fetchAsignaciones(expandedPac);
      loadData(user.id);
      fetchIngresos(user.id);
    } catch (e: any) { alert('Error: ' + e.message); }
    finally { setConfirmSesionId(null); }
  };

  const guardarSeccionSesion = async (sesionId: number, pacienteId: number, asignacionId: number) => {
    if (!seccionForm.contenido.trim()) { alert('Escribe o dicta el contenido de la sección'); return; }
    setGuardandoSeccion(true);
    try {
      const res = await fetch('/api/admin/notas', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente_id: pacienteId,
          asignacion_id: asignacionId,
          autor_id: user.id,
          autor_rol: 'psicologa',
          psicologa_id: user.id,
          tipo: seccionForm.tipo,
          contenido: `[Sesión #${sesionId}] ${seccionForm.contenido}`
        })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      alert('Sección agregada al historial de la sesión');
      setNuevaSeccionSesion(null);
      setSeccionForm({ tipo: 'nota_clinica', contenido: '', sesion_id: '' });
      if (expandedPac) fetchAsignaciones(expandedPac);
      loadData(user.id);
    } catch (e: any) { alert('Error: ' + e.message); }
    finally { setGuardandoSeccion(false); }
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

  const handleLogout = () => {
    setUser(null);
    clearPsicologa();
    document.cookie = 'psicologa_user=; path=/; max-age=0';
    setPacientes([]);
    setSesiones([]);
    setNotas([]);
    setCalificaciones([]);
    setIngresos(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">👩‍⚕️ Acceso Psicóloga</h1>
            <p className="text-sm text-gray-500 mt-1">Ingresa con tu usuario y contraseña</p>
          </div>
          {loginError && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4">{loginError}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="tu@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••" />
            </div>
            <button onClick={handleLogin} disabled={loginLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium text-sm">
              {loginLoading ? 'Entrando...' : 'Iniciar Sesión'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500">Cargando...</p></div>;

  const activos = pacientes.filter(p => Number(p.tratamientos_activos) > 0);
  const sinTratamiento = pacientes.filter(p => Number(p.tratamientos_activos) === 0);
  const hoy = new Date().toISOString().split('T')[0];
  const sesionesHoy = sesiones.filter(s => s.fecha_programada === hoy);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">👩‍⚕️ Panel Psicóloga</h1>
              <p className="text-sm text-gray-500">{user.nombre} {user.apellido}</p>
              <p className="text-xs text-indigo-500 mt-0.5">🔒 Solo ves tus pacientes asignados</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleLogout}
                className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md">
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            📊 Dashboard
          </button>
          <button onClick={() => setActiveTab('pacientes')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'pacientes' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            👥 Mis Pacientes
          </button>
          <button onClick={() => setActiveTab('sesiones')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'sesiones' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            📅 Sesiones
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                <p className="text-sm font-medium opacity-90">💰 Ingreso Hoy</p>
                <p className="text-3xl font-bold mt-1">${ingresos?.hoy?.total?.toLocaleString() || '0'}</p>
                <p className="text-xs opacity-75 mt-1">{ingresos?.hoy?.sesiones || 0} sesiones</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <p className="text-sm font-medium opacity-90">📅 Ingreso Semana</p>
                <p className="text-3xl font-bold mt-1">${ingresos?.semana?.total?.toLocaleString() || '0'}</p>
                <p className="text-xs opacity-75 mt-1">{ingresos?.semana?.sesiones || 0} sesiones</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <p className="text-sm font-medium opacity-90">📈 Ingreso Mes</p>
                <p className="text-3xl font-bold mt-1">${ingresos?.mes?.total?.toLocaleString() || '0'}</p>
                <p className="text-xs opacity-75 mt-1">{ingresos?.mes?.sesiones || 0} sesiones</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
                <p className="text-sm font-medium opacity-90">⏳ Próximas Sesiones</p>
                <p className="text-3xl font-bold mt-1">{ingresos?.pendientes || 0}</p>
                <p className="text-xs opacity-75 mt-1">programadas</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Resumen de Actividad</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-indigo-600">{pacientes.length}</p>
                  <p className="text-sm text-gray-500">Pacientes Totales</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{activos.length}</p>
                  <p className="text-sm text-gray-500">Con Tratamiento</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{sinTratamiento.length}</p>
                  <p className="text-sm text-gray-500">Sin Tratamiento</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-teal-600">{sesionesHoy.length}</p>
                  <p className="text-sm text-gray-500">Sesiones Hoy</p>
                </div>
              </div>
            </div>

            {ingresos?.historial && ingresos.historial.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">📅 Historial de Ingresos (Últimos 30 días)</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">Fecha</th>
                        <th className="text-right py-2 px-4 text-sm font-medium text-gray-500">Sesiones</th>
                        <th className="text-right py-2 px-4 text-sm font-medium text-gray-500">Ingreso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingresos.historial.map((h: any, i: number) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-700">{new Date(h.fecha).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 text-right">{h.sesiones}</td>
                          <td className="py-3 px-4 text-sm font-medium text-green-600 text-right">${Number(h.total).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pacientes' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tratamientos</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pacientes.map((p) => (
                  <Fragment key={p.id}>
                    <tr className={`hover:bg-gray-50 ${expandedPac === p.id ? 'bg-indigo-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-600">
                              {p.nombre[0]}{p.apellido[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{p.nombre} {p.apellido}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{p.telefono || '-'}</div>
                        <div className="text-sm text-gray-500">{p.email || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{p.motivo_consulta || '-'}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(p.estado)}`}>
                          {p.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          Number(p.tratamientos_activos) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {p.tratamientos_activos || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => toggleExpand(p.id)}
                          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                            expandedPac === p.id
                              ? 'bg-indigo-700 text-white'
                              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                          }`}>
                          {expandedPac === p.id ? 'Cerrar' : 'Ver Caso'}
                        </button>
                      </td>
                    </tr>

                    {expandedPac === p.id && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-indigo-50/50">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-white p-3 rounded-lg border">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Motivo de consulta</h4>
                                <p className="text-sm text-gray-700">{p.motivo_consulta || 'Sin registrado'}</p>
                              </div>
                              <div className="bg-white p-3 rounded-lg border">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Diagnóstico inicial</h4>
                                <p className="text-sm text-gray-700">{p.diagnostico_inicial || 'Sin registrado'}</p>
                              </div>
                              <div className="bg-white p-3 rounded-lg border">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Observaciones</h4>
                                <p className="text-sm text-gray-700">{p.observaciones_generales || 'Sin registrado'}</p>
                              </div>
                            </div>

                            <div>
                              {loadingAsig ? (
                                <p className="text-xs text-gray-500">Cargando...</p>
                              ) : asignaciones.length > 0 && (
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
                              )}
                            </div>

                            <div className="border-t pt-4">
                              <h4 className="font-bold text-sm text-gray-700 mb-3">📖 Historia Clínica</h4>
                              
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
                                  <button onClick={() => guardarNotaHistorial(p.id)} disabled={guardandoNota || !nuevaNota.trim()}
                                    className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm font-medium">
                                    {guardandoNota ? 'Guardando...' : '💾 Guardar Sección en Historial'}
                                  </button>
                                </div>
                              </div>

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
                                                  ✅ Confirmada
                                                </span>
                                              ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-300">
                                                  ⏳ Pendiente
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-xs text-gray-500">Paciente: {s.paciente_nombre} {s.paciente_apellido}</p>
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
                {pacientes.length === 0 && <tr><td colSpan={6} className="text-center text-gray-400 py-6">No tienes pacientes asignados</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'sesiones' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">📅 Mis Sesiones</h2>
                <button onClick={() => setNuevaSeccionSesion(nuevaSeccionSesion === -1 ? null : -1)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    nuevaSeccionSesion === -1 ? 'bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}>
                  {nuevaSeccionSesion === -1 ? '✕ Cerrar' : '➕ Nueva Sección'}
                </button>
              </div>

              {nuevaSeccionSesion === -1 && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border-2 border-indigo-200 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold text-indigo-800">➕ Agregar nueva sección al historial</span>
                    <DictationButton onResult={(t) => setSeccionForm({...seccionForm, contenido: seccionForm.contenido + t})} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Sesión *</label>
                      <select value={seccionForm.sesion_id || ''} onChange={e => setSeccionForm({...seccionForm, sesion_id: e.target.value})}
                        className="w-full px-3 py-2 border border-indigo-300 rounded text-sm bg-white">
                        <option value="">— Seleccionar sesión —</option>
                        {sesiones.map((s: any) => (
                          <option key={s.id} value={s.id}>Sesión {s.numero_sesion} — {s.paciente_nombre} {s.paciente_apellido} ({s.fecha_programada})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Tipo de sección</label>
                      <select value={seccionForm.tipo} onChange={e => setSeccionForm({...seccionForm, tipo: e.target.value})}
                        className="w-full px-3 py-2 border border-indigo-300 rounded text-sm bg-white">
                        <option value="nota_clinica">📝 Nota clínica</option>
                        <option value="observacion">👁️ Observación</option>
                        <option value="evolucion">📈 Evolución</option>
                        <option value="impresion">💭 Impresión clínica</option>
                      </select>
                    </div>
                  </div>
                  <textarea value={seccionForm.contenido} onChange={e => setSeccionForm({...seccionForm, contenido: e.target.value})} rows={4}
                    className="w-full px-3 py-2 border border-indigo-300 rounded text-sm resize-none mb-3"
                    placeholder="Dicta o escribe la sección para el historial clínico..." />
                  <div className="flex justify-end">
                    <button onClick={() => {
                      const sesionSeleccionada = sesiones.find((s: any) => String(s.id) === String(seccionForm.sesion_id));
                      if (!sesionSeleccionada) { alert('Selecciona una sesión'); return; }
                      guardarSeccionSesion(sesionSeleccionada.id, sesionSeleccionada.paciente_id, sesionSeleccionada.asignacion_id);
                    }} disabled={guardandoSeccion || !seccionForm.contenido.trim() || !seccionForm.sesion_id}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded text-sm font-medium">
                      {guardandoSeccion ? 'Guardando...' : '💾 Guardar Sección en Historial'}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {sesiones.length > 0 ? sesiones.map((s: any) => (
                  <div key={s.id} className="bg-gray-50 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{s.paciente_nombre} {s.paciente_apellido}</p>
                        <p className="text-xs text-gray-500">Sesión {s.numero_sesion} — {s.fecha_programada}</p>
                        {s.nota_psicologa && <p className="text-xs text-gray-600 mt-1">📝 {s.nota_psicologa}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.confirmada_psicologa ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {s.confirmada_psicologa ? '✅ Confirmada' : '⏳ Pendiente'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.estado === 'completada' ? 'bg-green-100 text-green-700' : s.estado === 'desviada' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                          {s.estado}
                        </span>
                        {!s.confirmada_psicologa && (
                          <button onClick={() => confirmarSesion(s.id)} disabled={confirmSesionId === s.id}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded text-xs font-medium">
                            {confirmSesionId === s.id ? 'Confirmando...' : '✅ Confirmar'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-gray-400 py-8">No hay sesiones registradas</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
