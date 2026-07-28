'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DictationButton from '@/components/DictationButton';

interface Asignacion {
  id: number;
  psicologa_nombre: string;
  psicologa_apellido: string;
  supervisor_nombre: string;
  supervisor_apellido: string;
  programa_nombre: string;
  total_sesiones: number;
  sesiones_completadas: number;
  sesion_actual: number;
  estado: string;
  fecha_inicio: string;
  fecha_fin_estimada: string;
  alertas_pendientes: number;
}

interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  fecha_nac: string;
  telefono: string;
  email: string;
  direccion: string;
  motivo_consulta: string;
  diagnostico_inicial: string;
  observaciones_generales: string;
  estado: string;
}

interface Programa {
  id: number;
  nombre: string;
  total_sesiones: number;
}

interface Psicologa {
  id: number;
  nombre: string;
  apellido: string;
}

interface Supervisor {
  id: number;
  nombre: string;
  apellido: string;
}

export default function PacienteDetallePage() {
  const params = useParams();
  const id = params.id as string;
  
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [psicologas, setPsicologas] = useState<Psicologa[]>([]);
  const [supervisores, setSupervisores] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAssign, setShowAssign] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [assignForm, setAssignForm] = useState({
    programa_id: '',
    psicologa_id: '',
    supervisor_id: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
  });
  const [editForm, setEditForm] = useState({
    nombre: '', apellido: '', fecha_nac: '', telefono: '', email: '',
    direccion: '', motivo_consulta: '', diagnostico_inicial: '',
    observaciones_generales: '', estado: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [pacRes, progRes, psiRes, supRes] = await Promise.all([
        fetch(`/api/pacientes/${id}`),
        fetch('/api/programas'),
        fetch('/api/usuarios'),
        fetch('/api/usuarios'),
      ]);
      
      const pacData = await pacRes.json();
      setPaciente(pacData.paciente);
      setAsignaciones(pacData.asignaciones);
      setEditForm(pacData.paciente);
      
      setProgramas(await progRes.json());
      
      const usuarios = await psiRes.json();
      setPsicologas(usuarios.filter((u: any) => u.rol === 'psicologa'));
      setSupervisores(usuarios.filter((u: any) => u.rol === 'supervisor'));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    setError('');
    if (!assignForm.programa_id || !assignForm.psicologa_id) {
      setError('Selecciona programa y psicóloga');
      return;
    }
    try {
      const res = await fetch('/api/asignaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...assignForm, paciente_id: parseInt(id) })
      });
      if (res.ok) {
        setShowAssign(false);
        setAssignForm({ programa_id: '', psicologa_id: '', supervisor_id: '', fecha_inicio: new Date().toISOString().split('T')[0] });
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'Error al asignar');
      }
    } catch (error) {
      setError('Error al asignar');
    }
  };

  const handleEdit = async () => {
    try {
      const res = await fetch(`/api/pacientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setShowEdit(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getProgreso = (completadas: number, total: number) => {
    return total > 0 ? Math.round((completadas / total) * 100) : 0;
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'en_curso': return 'bg-green-100 text-green-800';
      case 'desviado': return 'bg-red-100 text-red-800';
      case 'pausado': return 'bg-yellow-100 text-yellow-800';
      case 'completado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPacienteEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'pausado': return 'bg-yellow-100 text-yellow-800';
      case 'finalizado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Cargando paciente...</div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Paciente no encontrado</div>
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
              <Link href="/pacientes" className="text-gray-400 hover:text-gray-600">
                ← Volver
              </Link>
              <h1 className="text-xl font-bold text-gray-900">
                {paciente.nombre} {paciente.apellido}
              </h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPacienteEstadoColor(paciente.estado)}`}>
                {paciente.estado}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEdit(!showEdit)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
              >
                {showEdit ? 'Cancelar' : 'Editar Datos'}
              </button>
              <button
                onClick={() => setShowAssign(!showAssign)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                {showAssign ? 'Cancelar' : '+ Asignar Tratamiento'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Formulario Editar Paciente */}
        {showEdit && (
          <div className="bg-white rounded-lg shadow p-6 mb-6 border-l-4 border-gray-500">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Editar Datos del Paciente</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input type="text" value={editForm.nombre} onChange={(e) => setEditForm({...editForm, nombre: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                <input type="text" value={editForm.apellido} onChange={(e) => setEditForm({...editForm, apellido: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Nacimiento</label>
                <input type="date" value={editForm.fecha_nac?.split('T')[0] || ''} onChange={(e) => setEditForm({...editForm, fecha_nac: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="text" value={editForm.telefono || ''} onChange={(e) => setEditForm({...editForm, telefono: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={editForm.email || ''} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select value={editForm.estado} onChange={(e) => setEditForm({...editForm, estado: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="activo">Activo</option>
                  <option value="pausado">Pausado</option>
                  <option value="finalizado">Finalizado</option>
                  <option value="derivado">Derivado</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de Consulta</label>
                  <DictationButton onResult={(t) => setEditForm({...editForm, motivo_consulta: (editForm.motivo_consulta || '') + t})} />
                </div>
                <textarea value={editForm.motivo_consulta || ''} onChange={(e) => setEditForm({...editForm, motivo_consulta: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div className="md:col-span-3">
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico Inicial</label>
                  <DictationButton onResult={(t) => setEditForm({...editForm, diagnostico_inicial: (editForm.diagnostico_inicial || '') + t})} />
                </div>
                <textarea value={editForm.diagnostico_inicial || ''} onChange={(e) => setEditForm({...editForm, diagnostico_inicial: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleEdit} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">Guardar</button>
              <button onClick={() => setShowEdit(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300">Cancelar</button>
            </div>
          </div>
        )}

        {/* Formulario Asignar Tratamiento */}
        {showAssign && (
          <div className="bg-white rounded-lg shadow p-6 mb-6 border-l-4 border-indigo-500">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Asignar Nuevo Tratamiento</h2>
            {error && <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Programa Terapéutico *</label>
                <select value={assignForm.programa_id} onChange={(e) => setAssignForm({...assignForm, programa_id: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="">Seleccionar programa...</option>
                  {programas.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} ({p.total_sesiones} sesiones)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Psicóloga Asignada *</label>
                <select value={assignForm.psicologa_id} onChange={(e) => setAssignForm({...assignForm, psicologa_id: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="">Seleccionar psicóloga...</option>
                  {psicologas.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor</label>
                <select value={assignForm.supervisor_id} onChange={(e) => setAssignForm({...assignForm, supervisor_id: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="">Seleccionar supervisor...</option>
                  {supervisores.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre} {s.apellido}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                <input type="date" value={assignForm.fecha_inicio} onChange={(e) => setAssignForm({...assignForm, fecha_inicio: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleAssign} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Asignar Tratamiento</button>
              <button onClick={() => setShowAssign(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300">Cancelar</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info del Paciente */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-indigo-600">{paciente.nombre[0]}{paciente.apellido[0]}</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{paciente.nombre} {paciente.apellido}</h2>
                  <p className="text-sm text-gray-500">{paciente.email || 'Sin email'}</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Teléfono:</span>
                  <span className="ml-2 text-gray-900">{paciente.telefono || 'No registrado'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Fecha nacimiento:</span>
                  <span className="ml-2 text-gray-900">{paciente.fecha_nac ? new Date(paciente.fecha_nac).toLocaleDateString('es-MX') : 'No registrada'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Motivo consulta:</span>
                  <p className="mt-1 text-gray-900">{paciente.motivo_consulta || 'No registrado'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Diagnóstico:</span>
                  <p className="mt-1 text-gray-900">{paciente.diagnostico_inicial || 'No registrado'}</p>
                </div>
                {paciente.observaciones_generales && (
                  <div>
                    <span className="text-gray-500">Observaciones:</span>
                    <p className="mt-1 text-gray-900">{paciente.observaciones_generales}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tratamientos Asignados */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Tratamientos Asignados ({asignaciones.length})</h2>
                <button
                  onClick={() => setShowAssign(true)}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  + Nuevo Tratamiento
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {asignaciones.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No hay tratamientos asignados. Haz clic en "+ Nuevo Tratamiento" para asignar uno.
                  </div>
                ) : (
                  asignaciones.map((asig) => {
                    const progreso = getProgreso(asig.sesiones_completadas, asig.total_sesiones);
                    return (
                      <div key={asig.id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-base font-semibold text-gray-900">{asig.programa_nombre}</h3>
                            <p className="text-sm text-gray-500">
                              {asig.psicologa_nombre} {asig.psicologa_apellido} · Supervisor: {asig.supervisor_nombre} {asig.supervisor_apellido}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(asig.estado)}`}>
                            {asig.estado.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                          <div>
                            <p className="text-gray-500">Inicio</p>
                            <p className="font-medium text-gray-900">{new Date(asig.fecha_inicio).toLocaleDateString('es-MX')}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Fin estimado</p>
                            <p className="font-medium text-gray-900">{asig.fecha_fin_estimada ? new Date(asig.fecha_fin_estimada).toLocaleDateString('es-MX') : '-'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Sesiones</p>
                            <p className="font-medium text-gray-900">{asig.sesiones_completadas} / {asig.total_sesiones}</p>
                          </div>
                        </div>

                        {/* Barra de Progreso */}
                        <div className="mb-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${progreso >= 80 ? 'bg-green-500' : progreso >= 50 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                              style={{ width: `${progreso}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-right">{progreso}% completado</p>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            {asig.alertas_pendientes > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {asig.alertas_pendientes} alerta{asig.alertas_pendientes > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <Link href={`/asignaciones/${asig.id}`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                            Ver caso →
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
