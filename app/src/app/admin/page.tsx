'use client';
import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import DictationButton from '@/components/DictationButton';
import CameraCapture from '@/components/CameraCapture';
import FingerprintCapture from '@/components/FingerprintCapture';


type Tab = 'psicologas' | 'pacientes' | 'asignaciones' | 'supervision' | 'personal';

interface Usuario {
  id: number; nombre: string; apellido: string; email: string; telefono: string; rol: string; activo: number; created_at: string;
  direccion?: string; avatar_url?: string;
}
interface Paciente {
  id: number; nombre: string; apellido: string; fecha_nac: string; telefono: string; email: string;
  direccion: string; motivo_consulta: string; diagnostico_inicial: string; estado: string; psicologa_id: string;
}
interface Asignacion {
  id: number; paciente_id: number; psicologa_id: number; supervisor_id: number; programa_id: number;
  fecha_inicio: string; fecha_fin_estimada: string; fecha_fin_real: string; sesion_actual: number;
  estado: string; motivo_estado: string;
  paciente_nombre: string; paciente_apellido: string;
  psicologa_nombre: string; psicologa_apellido: string;
  programa_nombre: string; total_sesiones: number;
  supervisor_nombre: string; supervisor_apellido: string;
}
interface Programa { id: number; nombre: string; total_sesiones: number; }

const EMPTY_USUARIO = { nombre:'', apellido:'', email:'', password_hash:'', rol:'psicologa', telefono:'', direccion:'', avatar_url:'' };
const EMPTY_PACIENTE = { nombre:'', apellido:'', fecha_nac:'', telefono:'', email:'', direccion:'', motivo_consulta:'', diagnostico_inicial:'', psicologa_id:'' };
const EMPTY_ASIGNACION = { paciente_id:'', psicologa_id:'', supervisor_id:'', programa_id:'', fecha_inicio:'', fecha_fin_estimada:'' };

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('psicologas');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Data
  const [psicologas, setPsicologas] = useState<Usuario[]>([]);
  const [personal, setPersonal] = useState<Usuario[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number|null>(null);
  const [formUsuario, setFormUsuario] = useState(EMPTY_USUARIO);
  const [formPaciente, setFormPaciente] = useState(EMPTY_PACIENTE);
  const [formAsignacion, setFormAsignacion] = useState(EMPTY_ASIGNACION);
  const [searchPac, setSearchPac] = useState('');
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [expandedPac, setExpandedPac] = useState<number|null>(null);
  const [asignPrograma, setAsignPrograma] = useState('');
  const [asignPsicologa, setAsignPsicologa] = useState('');
  const [notas, setNotas] = useState<any[]>([]);
  const [notaText, setNotaText] = useState('');
  const [notaCalif, setNotaCalif] = useState('');
  const [notaPaso, setNotaPaso] = useState('');
  const [sugerenciaText, setSugerenciaText] = useState('');
  const [loadingNotas, setLoadingNotas] = useState(false);
  const [califPsicologa, setCalifPsicologa] = useState('');
  const [califCategoria, setCalifCategoria] = useState('general');
  const [califObs, setCalifObs] = useState('');
  const [showCalif, setShowCalif] = useState<number|null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showFingerprint, setShowFingerprint] = useState<number|null>(null);

  useEffect(() => {
    setMounted(true);
    fetch('/api/me').then(r => r.json()).then(data => {
      if (data.user) {
        if (data.user.rol !== 'supervisora' && data.user.rol !== 'supervisor' && data.user.rol !== 'lider') {
          alert('No tiene permisos de administración');
          router.push('/');
          return;
        }
        setUser(data.user);
        loadData();
      } else {
        router.push('/login');
      }
    }).catch(() => { router.push('/login'); });
  }, []);

  const loadData = async () => {
    try {
      const [pRes, paRes, aRes, prRes, allRes] = await Promise.all([
        fetch('/api/admin/usuarios?rol=psicologa'),
        fetch('/api/admin/pacientes'),
        fetch('/api/admin/asignaciones'),
        fetch('/api/programas'),
        fetch('/api/admin/usuarios')
      ]);
      const pData = await pRes.json();
      const paData = await paRes.json();
      const aData = await aRes.json();
      const prData = await prRes.json();
      const allData = await allRes.json();
      setPsicologas(Array.isArray(pData) ? pData : pData.usuarios || []);
      setPersonal(Array.isArray(allData) ? allData : allData.usuarios || []);
      setPacientes(Array.isArray(paData) ? paData : paData.pacientes || []);
      setAsignaciones(aData.asignaciones || []);
      setProgramas(Array.isArray(prData) ? prData : prData.programas || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const saveUsuario = async () => {
    setError('');
    try {
      const url = '/api/admin/usuarios';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...formUsuario, id: editingId } : formUsuario;
      const res = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowModal(false); setEditingId(null); setFormUsuario(EMPTY_USUARIO);
      loadData();
    } catch (e: any) { setError(e.message); }
  };

  const savePaciente = async () => {
    setError('');
    try {
      const url = '/api/admin/pacientes';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...formPaciente, id: editingId } : formPaciente;
      const res = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowModal(false); setEditingId(null); setFormPaciente(EMPTY_PACIENTE);
      loadData();
    } catch (e: any) { setError(e.message); }
  };

  const saveAsignacion = async () => {
    setError('');
    try {
      const res = await fetch('/api/admin/asignaciones', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ ...formAsignacion, supervisor_id: user?.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowModal(false); setFormAsignacion(EMPTY_ASIGNACION);
      loadData();
    } catch (e: any) { setError(e.message); }
  };

  const updateAsignacionEstado = async (id: number, estado: string, motivo?: string) => {
    try {
      await fetch('/api/admin/asignaciones', {
        method: 'PUT', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ id, estado, motivo_estado: motivo || '' })
      });
      loadData();
    } catch (e) { console.error(e); }
  };

  const desactivarUsuario = async (id: number) => {
    if (!confirm('¿Desactivar este usuario?')) return;
    await fetch(`/api/admin/usuarios?id=${id}`, { method: 'DELETE' });
    loadData();
  };

  const eliminarUsuario = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar permanentemente a ${nombre}? Esta acción no se puede deshacer.`)) return;
    await fetch(`/api/admin/usuarios?id=${id}&hard=true`, { method: 'DELETE' });
    loadData();
  };

  const asignarDirecto = async (pacienteId: number) => {
    if (!asignPrograma || !asignPsicologa) {
      alert('Selecciona programa y psicóloga');
      return;
    }
    try {
      const res = await fetch('/api/admin/asignaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente_id: pacienteId,
          psicologa_id: Number(asignPsicologa),
          supervisor_id: user?.id,
          programa_id: Number(asignPrograma),
          fecha_inicio: new Date().toISOString().split('T')[0]
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert('Tratamiento asignado exitosamente');
      setAsignPrograma('');
      setAsignPsicologa('');
      setExpandedPac(null);
      loadData();
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  const fetchNotas = async (pacienteId: number) => {
    setLoadingNotas(true);
    try {
      const res = await fetch(`/api/admin/notas?paciente_id=${pacienteId}`);
      const data = await res.json();
      setNotas(data.notas || []);
    } catch { setNotas([]); }
    setLoadingNotas(false);
  };

  const saveNotaPsicologa = async (pacienteId: number) => {
    if (!notaText.trim()) { alert('Escribe una nota'); return; }
    try {
      await fetch('/api/admin/notas', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          paciente_id: pacienteId,
          autor_id: user?.id,
          autor_rol: user?.rol,
          tipo: 'nota_psicologa',
          contenido: notaText,
          calificacion: notaCalif || null,
          paso_tratamiento: notaPaso || null
        })
      });
      setNotaText(''); setNotaCalif(''); setNotaPaso('');
      fetchNotas(pacienteId);
    } catch (e: any) { alert(e.message); }
  };

  const saveSugerencia = async (pacienteId: number) => {
    if (!sugerenciaText.trim()) { alert('Escribe una sugerencia'); return; }
    try {
      await fetch('/api/admin/notas', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ paciente_id: pacienteId, autor_id: user?.id, autor_rol: user?.rol, tipo: 'sugerencia_supervisora', contenido: sugerenciaText })
      });
      setSugerenciaText('');
      fetchNotas(pacienteId);
    } catch (e: any) { alert(e.message); }
  };

  const saveCalificacion = async (psicologaId: number, pacienteId: number, asignacionId?: number, enviar?: boolean) => {
    if (!califPsicologa) { alert('Selecciona una calificación'); return; }
    try {
      await fetch('/api/admin/calificaciones', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          psicologa_id: psicologaId,
          supervisor_id: user?.id,
          asignacion_id: asignacionId || null,
          paciente_id: pacienteId || null,
          categoria: califCategoria,
          calificacion: Number(califPsicologa),
          observaciones: califObs || null,
          enviar: enviar ? true : false
        })
      });
      setCalifPsicologa(''); setCalifCategoria('general'); setCalifObs(''); setShowCalif(null);
      alert(enviar ? 'Calificación guardada y enviada a la psicóloga' : 'Calificación guardada en historial');
    } catch (e: any) { alert(e.message); }
  };

  const filteredPacientes = searchPac
    ? pacientes.filter(p => `${p.nombre} ${p.apellido} ${p.email}`.toLowerCase().includes(searchPac.toLowerCase()))
    : pacientes;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload/avatar', { method: 'POST', body: fd });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const data = await res.json();
      setFormUsuario({ ...formUsuario, avatar_url: data.url });
    } catch (err: any) { alert('Error: ' + err.message); }
    finally { setUploadingPhoto(false); }
  };

  const handleCameraCapture = async (dataUrl: string) => {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const fd = new FormData();
      fd.append('file', new File([blob], 'camera_photo.jpg', { type: 'image/jpeg' }));
      const uploadRes = await fetch('/api/upload/avatar', { method: 'POST', body: fd });
      if (!uploadRes.ok) { const d = await uploadRes.json(); throw new Error(d.error); }
      const data = await uploadRes.json();
      setFormUsuario({ ...formUsuario, avatar_url: data.url });
    } catch (err: any) { alert('Error al subir foto: ' + err.message); }
    setShowCamera(false);
  };

  if (!mounted || loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-500">Cargando panel de administración...</p></div>;

  const estadoColors: Record<string, string> = {
    en_curso: 'bg-green-100 text-green-800', pausado: 'bg-yellow-100 text-yellow-800',
    completado: 'bg-blue-100 text-blue-800', desviado: 'bg-red-100 text-red-800', cancelado: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-gray-500 hover:text-gray-700">← Volver</button>
            <h1 className="text-xl font-bold text-gray-800">⚙️ Panel de Administración</h1>
            <span className="text-sm text-gray-500">| {user?.nombre}</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-2 mb-6 border-b pb-2">
          {([['psicologas','👩‍⚕️ Psicólogas'],['personal','👤 Personal'],['pacientes','🧑 Pacientes'],['asignaciones','📋 Tratamientos'],['supervision','👁️ Supervisión']] as [Tab,string][]).map(([t,label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${tab===t ? 'bg-indigo-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ===== PSICÓLOGAS ===== */}
        {tab === 'psicologas' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Psicólogas ({psicologas.length})</h2>
              <button onClick={() => { setEditingId(null); setFormUsuario(EMPTY_USUARIO); setShowModal(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                + Nueva Psicóloga
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3">Nombre</th>
                    <th className="text-left px-4 py-3">Email</th>
                    <th className="text-left px-4 py-3">Teléfono</th>
                    <th className="text-left px-4 py-3">Estado</th>
                    <th className="text-left px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {psicologas.map(p => (
                    <tr key={p.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.avatar_url ? (
                            <img src={p.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                          ) : (
                            <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-indigo-600">{p.nombre[0]}{p.apellido[0]}</span>
                            </div>
                          )}
                          <span className="font-medium">{p.nombre} {p.apellido}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.email}</td>
                      <td className="px-4 py-3 text-gray-600">{p.telefono || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.activo ? 'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>
                          {p.activo ? 'Activa':'Inactiva'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => { setEditingId(p.id); setFormUsuario({nombre:p.nombre,apellido:p.apellido,email:p.email,password_hash:'',rol:p.rol,telefono:p.telefono||'',direccion:p.direccion||'',avatar_url:p.avatar_url||''}); setShowModal(true); }}
                          className="text-indigo-600 hover:text-indigo-800 text-xs mr-3">Editar</button>
                        <button onClick={() => desactivarUsuario(p.id)} className="text-yellow-600 hover:text-yellow-800 text-xs mr-3">Desactivar</button>
                        <button onClick={() => eliminarUsuario(p.id, `${p.nombre} ${p.apellido}`)} className="text-red-600 hover:text-red-800 text-xs">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== PACIENTES ===== */}
        {tab === 'pacientes' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-gray-800">Pacientes ({pacientes.length})</h2>
                <input type="text" value={searchPac} onChange={e => setSearchPac(e.target.value)} placeholder="Buscar..."
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm w-64" />
              </div>
              <button onClick={() => { setEditingId(null); setFormPaciente(EMPTY_PACIENTE); setShowModal(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                + Nuevo Paciente
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3">Nombre</th>
                    <th className="text-left px-4 py-3">Psicóloga</th>
                    <th className="text-left px-4 py-3">Email</th>
                    <th className="text-left px-4 py-3">Teléfono</th>
                    <th className="text-left px-4 py-3">Tratamientos</th>
                    <th className="text-left px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPacientes.map(p => {
                    const pacAsignaciones = asignaciones.filter(a => a.paciente_id === p.id);
                    const isExpanded = expandedPac === p.id;
                    return (
                      <Fragment key={p.id}>
                        <tr className={`border-t hover:bg-gray-50 ${isExpanded ? 'bg-indigo-50':''}`}>
                          <td className="px-4 py-3 font-medium">{p.nombre} {p.apellido}</td>
                          <td className="px-4 py-3 text-gray-600">{(() => { const psc = psicologas.find(u => String(u.id) === String(p.psicologa_id)); return psc ? `${psc.nombre} ${psc.apellido}` : '—'; })()}</td>
                          <td className="px-4 py-3 text-gray-600">{p.email || '—'}</td>
                          <td className="px-4 py-3 text-gray-600">{p.telefono || '—'}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-gray-500">{pacAsignaciones.length} tratamiento(s)</span>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => {
                              const next = isExpanded ? null : p.id;
                              setExpandedPac(next);
                              if (next) fetchNotas(p.id);
                              else { setNotas([]); setNotaText(''); setNotaCalif(''); setSugerenciaText(''); }
                            }}
                              className={`px-3 py-1 rounded text-xs font-medium mr-2 ${isExpanded ? 'bg-indigo-600 text-white':'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}>
                              {isExpanded ? 'Cerrar' : 'Desplegar'}
                            </button>
                            <button onClick={() => { setEditingId(p.id); setFormPaciente({nombre:p.nombre,apellido:p.apellido,fecha_nac:p.fecha_nac||'',telefono:p.telefono||'',email:p.email||'',direccion:p.direccion||'',motivo_consulta:p.motivo_consulta||'',diagnostico_inicial:p.diagnostico_inicial||'',psicologa_id:p.psicologa_id||''}); setShowModal(true); }}
                              className="text-indigo-600 hover:text-indigo-800 text-xs">Editar</button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${p.id}-detail`}>
                            <td colSpan={5} className="px-4 py-4 bg-indigo-50/50">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                {/* Tratamientos actuales */}
                                <div>
                                  <h4 className="font-bold text-sm text-gray-700 mb-2">📋 Tratamientos Actuales</h4>
                                  {pacAsignaciones.length === 0 ? (
                                    <p className="text-xs text-gray-500 italic">Sin tratamientos asignados</p>
                                  ) : (
                                    <div className="space-y-2">
                                      {pacAsignaciones.map(a => {
                                        const prog = a.total_sesiones || 1;
                                        const pct = Math.round((a.sesion_actual / prog) * 100);
                                        return (
                                          <div key={a.id} className="bg-white p-3 rounded-lg border text-xs">
                                            <div className="flex items-center justify-between mb-1">
                                              <span className="font-semibold">{a.programa_nombre}</span>
                                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${a.estado==='en_curso'?'bg-green-100 text-green-700':a.estado==='completado'?'bg-blue-100 text-blue-700':a.estado==='pausado'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-700'}`}>{a.estado}</span>
                                            </div>
                                            <p className="text-gray-600">Psicóloga: {a.psicologa_nombre} {a.psicologa_apellido}</p>
                                            <p className="text-gray-500">Sesión {a.sesion_actual}/{prog} | Inicio: {a.fecha_inicio}</p>
                                            <div className="mt-1.5 w-full bg-gray-200 rounded-full h-1.5">
                                              <div className="bg-indigo-600 h-1.5 rounded-full" style={{width:`${pct}%`}} />
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                                {/* Asignar nuevo tratamiento */}
                                <div>
                                  <h4 className="font-bold text-sm text-gray-700 mb-2">➕ Asignar Nuevo Tratamiento</h4>
                                  <div className="bg-white p-3 rounded-lg border space-y-2">
                                    <div>
                                      <label className="text-xs text-gray-600">Programa *</label>
                                      <select value={asignPrograma} onChange={e => setAsignPrograma(e.target.value)}
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs mt-0.5">
                                        <option value="">— Seleccionar programa —</option>
                                        {programas.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.total_sesiones} sesiones)</option>)}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-600">Psicóloga *</label>
                                      <select value={asignPsicologa} onChange={e => setAsignPsicologa(e.target.value)}
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs mt-0.5">
                                        <option value="">— Seleccionar psicóloga —</option>
                                        {psicologas.map(ps => <option key={ps.id} value={ps.id}>{ps.nombre} {ps.apellido}</option>)}
                                      </select>
                                    </div>
                                    <button onClick={() => asignarDirecto(p.id)}
                                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded text-xs font-medium">
                                      Asignar Tratamiento
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Notas y Sugerencias */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Nota de psicóloga */}
                                <div>
                                  <h4 className="font-bold text-sm text-gray-700 mb-2">📝 Nota de Psicóloga</h4>
                                  <div className="bg-white p-3 rounded-lg border space-y-2">
                                    <div>
                                      <label className="text-xs text-gray-600">Paso del tratamiento (nº de meta)</label>
                                      <input type="number" min="1" value={notaPaso} onChange={e => setNotaPaso(e.target.value)}
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs mt-0.5" placeholder="Ej: 3" />
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-600">Calificación del programa (1-10)</label>
                                      <input type="number" min="1" max="10" value={notaCalif} onChange={e => setNotaCalif(e.target.value)}
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs mt-0.5" placeholder="Opcional" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <label className="text-xs text-gray-600">Nota / Observación</label>
                                        <DictationButton onResult={(t) => setNotaText(notaText + t)} />
                                      </div>
                                      <textarea value={notaText} onChange={e => setNotaText(e.target.value)} rows={3}
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs mt-0.5 resize-none"
                                        placeholder="Escriba una nota sobre el progreso del paciente, el programa, observaciones clínicas..." />
                                    </div>
                                    <button onClick={() => saveNotaPsicologa(p.id)}
                                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-1.5 rounded text-xs font-medium">
                                      Guardar Nota
                                    </button>
                                  </div>
                                </div>
                                {/* Sugerencia de supervisora */}
                                <div>
                                  <h4 className="font-bold text-sm text-gray-700 mb-2">💡 Sugerencia de Supervisora</h4>
                                  <div className="bg-white p-3 rounded-lg border space-y-2">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <label className="text-xs text-gray-600">Sugerencia / Recomendación</label>
                                        <DictationButton onResult={(t) => setSugerenciaText(sugerenciaText + t)} />
                                      </div>
                                      <textarea value={sugerenciaText} onChange={e => setSugerenciaText(e.target.value)} rows={3}
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs mt-0.5 resize-none"
                                        placeholder="Escriba una sugerencia, recomendación o directriz para la psicóloga..." />
                                    </div>
                                    <button onClick={() => saveSugerencia(p.id)}
                                      className="w-full bg-amber-600 hover:bg-amber-700 text-white py-1.5 rounded text-xs font-medium">
                                      Guardar Sugerencia
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Historial de notas */}
                              <div className="mt-4">
                                <h4 className="font-bold text-sm text-gray-700 mb-2">📜 Historial</h4>
                                {loadingNotas ? (
                                  <p className="text-xs text-gray-500">Cargando...</p>
                                ) : notas.length === 0 ? (
                                  <p className="text-xs text-gray-500 italic">Sin notas registradas</p>
                                ) : (
                                  <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {notas.map(n => (
                                      <div key={n.id} className={`p-3 rounded-lg border text-xs ${n.tipo==='nota_psicologa'?'bg-purple-50 border-purple-200':'bg-amber-50 border-amber-200'}`}>
                                        <div className="flex items-center justify-between mb-1">
                                          <span className={`font-semibold ${n.tipo==='nota_psicologa'?'text-purple-700':'text-amber-700'}`}>
                                            {n.tipo==='nota_psicologa'?'📝 Nota de Psicóloga':'💡 Sugerencia de Supervisora'}
                                          </span>
                                          <span className="text-gray-400">{new Date(n.created_at).toLocaleDateString('es-MX')} {new Date(n.created_at).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})}</span>
                                        </div>
                                        <p className="text-gray-600 font-medium">{n.autor_nombre} {n.autor_apellido}</p>
                                        {n.calificacion && <p className="text-gray-500 mt-0.5">Calificación: <span className="font-bold">{n.calificacion}/10</span></p>}
                                        {n.paso_tratamiento && <p className="text-blue-500 mt-0.5">📍 Paso: <span className="font-bold">#{n.paso_tratamiento}</span></p>}
                                        <p className="text-gray-700 mt-1 whitespace-pre-wrap">{n.contenido}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== ASIGNACIONES ===== */}
        {tab === 'asignaciones' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Tratamientos Asignados ({asignaciones.length})</h2>
              <button onClick={() => { setFormAsignacion(EMPTY_ASIGNACION); setShowModal(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                + Asignar Tratamiento
              </button>
            </div>
            <div className="grid gap-3">
              {asignaciones.map(a => {
                const progress = a.total_sesiones ? Math.round((a.sesion_actual / a.total_sesiones) * 100) : 0;
                return (
                  <div key={a.id} className="bg-white rounded-xl shadow-sm border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-800">{a.paciente_nombre} {a.paciente_apellido}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${estadoColors[a.estado] || 'bg-gray-100'}`}>{a.estado}</span>
                        </div>
                        <p className="text-sm text-gray-600">Psicóloga: {a.psicologa_nombre} {a.psicologa_apellido} | Programa: {a.programa_nombre}</p>
                        <p className="text-xs text-gray-500 mt-1">Inicio: {a.fecha_inicio} | Sesión {a.sesion_actual}/{a.total_sesiones}</p>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-indigo-600 h-2 rounded-full" style={{width:`${progress}%`}} />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{progress}% completado</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {a.estado === 'en_curso' && (
                          <>
                            <button onClick={() => updateAsignacionEstado(a.id, 'pausado')}
                              className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200">Pausar</button>
                            <button onClick={() => updateAsignacionEstado(a.id, 'completado')}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">Completar</button>
                          </>
                        )}
                        {a.estado === 'pausado' && (
                          <button onClick={() => updateAsignacionEstado(a.id, 'en_curso')}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">Reanudar</button>
                        )}
                      </div>
                    </div>
                    {a.motivo_estado && <p className="text-xs text-red-600 mt-2 italic">Motivo: {a.motivo_estado}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== SUPERVISIÓN ===== */}
        {tab === 'supervision' && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">👁️ Supervisión de Tratamientos</h2>
            <div className="grid gap-4">
              {psicologas.map(ps => {
                const casos = asignaciones.filter(a => a.psicologa_id === ps.id && a.estado === 'en_curso');
                const completados = asignaciones.filter(a => a.psicologa_id === ps.id && a.estado === 'completado');
                const desviados = asignaciones.filter(a => a.psicologa_id === ps.id && a.estado === 'desviado');
                const isOpen = showCalif === ps.id;
                return (
                  <div key={ps.id} className="bg-white rounded-xl shadow-sm border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-800">👩‍⚕️ {ps.nombre} {ps.apellido}</h3>
                        <span className="text-xs text-gray-400">{ps.email}</span>
                      </div>
                      <div className="flex gap-3 text-xs items-center">
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{casos.length} activos</span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{completados.length} completados</span>
                        {desviados.length > 0 && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{desviados.length} desviados</span>}
                        <button onClick={() => setShowCalif(isOpen ? null : ps.id)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${isOpen ? 'bg-indigo-700 text-white':'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                          {isOpen ? 'Cerrar' : '⭐ Calificar'}
                        </button>
                      </div>
                    </div>

                    {/* Panel de calificación (solo visible para supervisora/lider) */}
                    {(user?.rol === 'supervisora' || user?.rol === 'lider' || user?.rol === 'supervisor') && isOpen && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
                        <h4 className="font-bold text-sm text-indigo-800 mb-3">⭐ Calificar a {ps.nombre} {ps.apellido}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <label className="text-xs text-gray-600">Categoría *</label>
                            <select value={califCategoria} onChange={e => setCalifCategoria(e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs mt-0.5">
                              <option value="general">General</option>
                              <option value="desempeno">Desempeño</option>
                              <option value="tecnica">Técnica</option>
                              <option value="comunicacion">Comunicación</option>
                              <option value="seguimiento">Seguimiento</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Calificación (1-10) *</label>
                            <select value={califPsicologa} onChange={e => setCalifPsicologa(e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs mt-0.5">
                              <option value="">— Seleccionar —</option>
                              {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-xs text-gray-600">Observaciones</label>
                            <input value={califObs} onChange={e => setCalifObs(e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs mt-0.5"
                              placeholder="Retroalimentación para la psicóloga..." />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => { if (ps.id) saveCalificacion(ps.id, 0, undefined, false); }}
                            className="flex-1 px-4 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs font-medium">
                            💾 Guardar
                          </button>
                          <button onClick={() => { if (ps.id) saveCalificacion(ps.id, 0, undefined, true); }}
                            className="flex-1 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium">
                            📨 Guardar y Enviar
                          </button>
                        </div>
                      </div>
                    )}

                    {casos.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Sin casos activos</p>
                    ) : (
                      <div className="space-y-2">
                        {casos.map(c => {
                          const prog = c.total_sesiones || 1;
                          const pct = Math.round((c.sesion_actual / prog) * 100);
                          const diasTranscurridos = Math.floor((Date.now() - new Date(c.fecha_inicio).getTime()) / 86400000);
                          const diasEstimados = c.fecha_fin_estimada ? Math.floor((new Date(c.fecha_fin_estimada).getTime() - new Date(c.fecha_inicio).getTime()) / 86400000) : prog;
                          const tiempoPct = diasEstimados ? Math.round((diasTranscurridos / diasEstimados) * 100) : 0;
                          const desviado = Math.abs(pct - tiempoPct) > 20;
                          return (
                            <div key={c.id} className={`flex items-center gap-4 p-2 rounded-lg ${desviado ? 'bg-red-50 border border-red-200':'bg-gray-50'}`}>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{c.paciente_nombre} {c.paciente_apellido} — {c.programa_nombre}</p>
                                <p className="text-xs text-gray-500">Sesión {c.sesion_actual}/{prog} | Días: {diasTranscurridos}/{diasEstimados}</p>
                              </div>
                              <div className="w-32">
                                <div className="text-xs text-gray-500 mb-0.5">Sesiones: {pct}%</div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-indigo-600 h-1.5 rounded-full" style={{width:`${Math.min(pct,100)}%`}} /></div>
                                <div className="text-xs text-gray-500 mt-0.5">Tiempo: {tiempoPct}%</div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${desviado?'bg-red-500':'bg-green-500'}`} style={{width:`${Math.min(tiempoPct,100)}%`}} /></div>
                              </div>
                              {desviado && <span className="text-red-600 text-xs font-bold">⚠️ DESVIADO</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== PERSONAL ===== */}
        {tab === 'personal' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Personal ({personal.length})</h2>
              <button onClick={() => { setEditingId(null); setFormUsuario(EMPTY_USUARIO); setShowModal(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                + Nuevo Personal
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3">Nombre</th>
                    <th className="text-left px-4 py-3">Email</th>
                    <th className="text-left px-4 py-3">Teléfono</th>
                    <th className="text-left px-4 py-3">Rol</th>
                    <th className="text-left px-4 py-3">Estado</th>
                    <th className="text-left px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {personal.map(p => (
                    <tr key={p.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.avatar_url ? (
                            <img src={p.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                          ) : (
                            <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-indigo-600">{p.nombre[0]}{p.apellido[0]}</span>
                            </div>
                          )}
                          <div>
                            <span className="font-medium">{p.nombre} {p.apellido}</span>
                            {p.direccion && <p className="text-xs text-gray-400 mt-0.5">📍 {p.direccion}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.email}</td>
                      <td className="px-4 py-3 text-gray-600">{p.telefono || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          p.rol === 'psicologa' ? 'bg-blue-100 text-blue-700' :
                          p.rol === 'recepcionista' ? 'bg-teal-100 text-teal-700' :
                          p.rol === 'supervisora' ? 'bg-purple-100 text-purple-700' :
                          p.rol === 'lider' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {p.rol === 'psicologa' ? '👩‍⚕️ Psicóloga' :
                           p.rol === 'recepcionista' ? '📋 Recepcionista' :
                           p.rol === 'supervisora' ? '👩‍⚕️ Supervisora' :
                           p.rol === 'lider' ? '👑 Líder' : p.rol}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.activo ? 'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>
                          {p.activo ? 'Activo':'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => { setEditingId(p.id); setFormUsuario({nombre:p.nombre,apellido:p.apellido,email:p.email,password_hash:'',rol:p.rol,telefono:p.telefono||'',direccion:p.direccion||'',avatar_url:p.avatar_url||''}); setShowModal(true); }}
                          className="text-indigo-600 hover:text-indigo-800 text-xs mr-3">Editar</button>
                        <button onClick={() => desactivarUsuario(p.id)} className="text-yellow-600 hover:text-yellow-800 text-xs mr-3">Desactivar</button>
                        <button onClick={() => eliminarUsuario(p.id, `${p.nombre} ${p.apellido}`)} className="text-red-600 hover:text-red-800 text-xs">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {(tab === 'psicologas' || tab === 'personal') && (editingId ? 'Editar Personal' : 'Nuevo Personal')}
                  {tab === 'pacientes' && (editingId ? 'Editar Paciente' : 'Nuevo Paciente')}
                  {tab === 'asignaciones' && 'Asignar Tratamiento'}
                </h3>
                <button onClick={() => { setShowModal(false); setEditingId(null); setError(''); }} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>

              {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4">{error}</div>}

              {/* Form Psicóloga / Personal */}
              {(tab === 'psicologas' || tab === 'personal') && (
                <div className="space-y-3">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="relative">
                      {formUsuario.avatar_url ? (
                        <img src={formUsuario.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-indigo-200" />
                      ) : (
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center border-2 border-indigo-200">
                          <span className="text-2xl text-indigo-400">👤</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-1.5">
                        <label className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white cursor-pointer transition-colors ${uploadingPhoto ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                          {uploadingPhoto ? '⏳ Subiendo...' : '📁 Subir Archivo'}
                          <input type="file" className="hidden" onChange={handlePhotoUpload} accept=".jpg,.jpeg,.png,.gif,.webp" disabled={uploadingPhoto} />
                        </label>
                        <button onClick={() => setShowCamera(true)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors">
                          📷 Tomar Foto
                        </button>
                      </div>
                      {formUsuario.avatar_url && (
                        <button onClick={() => setFormUsuario({...formUsuario, avatar_url: ''})}
                          className="px-2 py-1 text-xs text-red-600 hover:text-red-800 text-left">Quitar foto</button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
                      <input value={formUsuario.nombre} onChange={e => setFormUsuario({...formUsuario, nombre:e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Apellido *</label>
                      <input value={formUsuario.apellido} onChange={e => setFormUsuario({...formUsuario, apellido:e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  </div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                    <input type="email" value={formUsuario.email} onChange={e => setFormUsuario({...formUsuario, email:e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Contraseña {editingId ? '(dejar vacío para no cambiar)' : '*'}</label>
                    <input type="password" value={formUsuario.password_hash} onChange={e => setFormUsuario({...formUsuario, password_hash:e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
                    <input value={formUsuario.telefono} onChange={e => setFormUsuario({...formUsuario, telefono:e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Dirección</label>
                    <input value={formUsuario.direccion} onChange={e => setFormUsuario({...formUsuario, direccion:e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Calle, número, colonia, C.P." /></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
                    <select value={formUsuario.rol} onChange={e => setFormUsuario({...formUsuario, rol:e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm">
                      <option value="psicologa">Psicóloga</option>
                      <option value="recepcionista">Recepcionista</option>
                      <option value="supervisora">Supervisora</option>
                      <option value="lider">Líder</option>
                    </select></div>
                  {editingId && (
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-700">🔐 Acceso Biométrico</p>
                          <p className="text-xs text-gray-500">Registrar huella dactilar para inicio de sesión rápido</p>
                        </div>
                        <button onClick={() => setShowFingerprint(editingId)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-medium">
                          👆 Registrar Huella
                        </button>
                      </div>
                    </div>
                  )}
                  <button onClick={saveUsuario} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium mt-2">
                    {editingId ? 'Guardar Cambios' : 'Crear Personal'}
                  </button>
                </div>
              )}

              {/* Form Paciente */}
              {tab === 'pacientes' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center gap-1"><label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label><DictationButton onResult={(t) => setFormPaciente({...formPaciente, nombre: formPaciente.nombre + t})} /></div>
                      <input value={formPaciente.nombre} onChange={e => setFormPaciente({...formPaciente, nombre:e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                    <div>
                      <div className="flex items-center gap-1"><label className="block text-xs font-medium text-gray-600 mb-1">Apellido *</label><DictationButton onResult={(t) => setFormPaciente({...formPaciente, apellido: formPaciente.apellido + t})} /></div>
                      <input value={formPaciente.apellido} onChange={e => setFormPaciente({...formPaciente, apellido:e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Fecha de nacimiento</label>
                      <input type="date" value={formPaciente.fecha_nac} onChange={e => setFormPaciente({...formPaciente, fecha_nac:e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                      <input type="email" value={formPaciente.email} onChange={e => setFormPaciente({...formPaciente, email:e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1"><label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label><DictationButton onResult={(t) => setFormPaciente({...formPaciente, telefono: formPaciente.telefono + t})} /></div>
                    <input value={formPaciente.telefono} onChange={e => setFormPaciente({...formPaciente, telefono:e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div>
                    <div className="flex items-center gap-1"><label className="block text-xs font-medium text-gray-600 mb-1">Dirección</label><DictationButton onResult={(t) => setFormPaciente({...formPaciente, direccion: formPaciente.direccion + t})} /></div>
                    <input value={formPaciente.direccion} onChange={e => setFormPaciente({...formPaciente, direccion:e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div>
                    <div className="flex items-center gap-1"><label className="block text-xs font-medium text-gray-600 mb-1">Motivo de consulta</label><DictationButton onResult={(t) => setFormPaciente({...formPaciente, motivo_consulta: formPaciente.motivo_consulta + t})} /></div>
                    <textarea value={formPaciente.motivo_consulta} onChange={e => setFormPaciente({...formPaciente, motivo_consulta:e.target.value})} rows={2}
                      className="w-full px-3 py-2 border rounded-lg text-sm resize-none" /></div>
                   <div>
                    <div className="flex items-center gap-1"><label className="block text-xs font-medium text-gray-600 mb-1">Diagnóstico inicial</label><DictationButton onResult={(t) => setFormPaciente({...formPaciente, diagnostico_inicial: formPaciente.diagnostico_inicial + t})} /></div>
                    <textarea value={formPaciente.diagnostico_inicial} onChange={e => setFormPaciente({...formPaciente, diagnostico_inicial:e.target.value})} rows={2}
                      className="w-full px-3 py-2 border rounded-lg text-sm resize-none" /></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Psicóloga asignada</label>
                    <select value={formPaciente.psicologa_id} onChange={e => setFormPaciente({...formPaciente, psicologa_id:e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm">
                      <option value="">— Sin asignar —</option>
                      {psicologas.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                    </select></div>
                  <button onClick={savePaciente} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium mt-2">
                    {editingId ? 'Guardar Cambios' : 'Crear Paciente'}
                  </button>
                </div>
              )}

              {/* Form Asignación */}
              {tab === 'asignaciones' && (
                <div className="space-y-3">
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Paciente *</label>
                    <select value={formAsignacion.paciente_id} onChange={e => setFormAsignacion({...formAsignacion, paciente_id:e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm">
                      <option value="">— Seleccionar —</option>
                      {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                    </select></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Psicóloga *</label>
                    <select value={formAsignacion.psicologa_id} onChange={e => setFormAsignacion({...formAsignacion, psicologa_id:e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm">
                      <option value="">— Seleccionar —</option>
                      {psicologas.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                    </select></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Programa *</label>
                    <select value={formAsignacion.programa_id} onChange={e => setFormAsignacion({...formAsignacion, programa_id:e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm">
                      <option value="">— Seleccionar —</option>
                      {programas.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.total_sesiones} sesiones)</option>)}
                    </select></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Fecha inicio</label>
                      <input type="date" value={formAsignacion.fecha_inicio} onChange={e => setFormAsignacion({...formAsignacion, fecha_inicio:e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Fecha fin estimada</label>
                      <input type="date" value={formAsignacion.fecha_fin_estimada} onChange={e => setFormAsignacion({...formAsignacion, fecha_fin_estimada:e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  </div>
                  <button onClick={saveAsignacion} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium mt-2">
                    Asignar Tratamiento
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCamera && (
        <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
      )}

      {showFingerprint && (
        <FingerprintCapture
          userId={showFingerprint}
          userName={personal.find(p => p.id === showFingerprint)?.nombre + ' ' + (personal.find(p => p.id === showFingerprint)?.apellido || '')}
          onRegistered={() => { alert('Huella registrada exitosamente'); }}
          onClose={() => setShowFingerprint(null)}
        />
      )}
    </div>
  );
}
