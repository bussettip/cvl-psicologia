'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DictationButton from '@/components/DictationButton';

interface Meta {
  id: number;
  programa_id: number;
  sesion_numero: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  orden: number;
}

interface AsignacionCaso {
  id: number;
  paciente_nombre: string;
  paciente_apellido: string;
  psicologa_nombre: string;
  psicologa_apellido: string;
  sesion_actual: number;
  sesiones_completadas: number;
  total_sesiones: number;
  estado: string;
  fecha_inicio: string;
  fecha_fin_estimada: string;
  dias_transcurridos: number;
  dias_totales: number;
}

interface Programa {
  id: number;
  nombre: string;
  descripcion: string;
  total_sesiones: number;
  creador_nombre: string;
  creador_apellido: string;
  metas: Meta[];
  asignaciones: AsignacionCaso[];
}

export default function ProgramaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [programa, setPrograma] = useState<Programa | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingPrograma, setEditingPrograma] = useState(false);
  const [editForm, setEditForm] = useState({ nombre: '', descripcion: '', total_sesiones: 14 });
  
  const [showAddMeta, setShowAddMeta] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);
  const [metaForm, setMetaForm] = useState({ sesion_numero: 1, titulo: '', descripcion: '', categoria: 'intervencion' });
  const [metaError, setMetaError] = useState('');

  useEffect(() => {
    fetchPrograma();
  }, [id]);

  const fetchPrograma = async () => {
    try {
      const res = await fetch(`/api/programas/${id}`);
      const data = await res.json();
      setPrograma(data);
      setEditForm({ nombre: data.nombre, descripcion: data.descripcion, total_sesiones: data.total_sesiones });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrograma = async () => {
    try {
      await fetch(`/api/programas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      setEditingPrograma(false);
      fetchPrograma();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddMeta = async () => {
    setMetaError('');
    try {
      const res = await fetch('/api/metas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...metaForm, programa_id: parseInt(id) })
      });
      if (res.ok) {
        setShowAddMeta(false);
        setMetaForm({ sesion_numero: (programa?.metas.length || 0) + 1, titulo: '', descripcion: '', categoria: 'intervencion' });
        fetchPrograma();
      } else {
        const data = await res.json();
        setMetaError(data.error || 'Error al crear meta');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUpdateMeta = async () => {
    if (!editingMeta) return;
    setMetaError('');
    try {
      const res = await fetch('/api/metas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...metaForm, id: editingMeta.id })
      });
      if (res.ok) {
        setEditingMeta(null);
        setMetaForm({ sesion_numero: 1, titulo: '', descripcion: '', categoria: 'intervencion' });
        fetchPrograma();
      } else {
        const data = await res.json();
        setMetaError(data.error || 'Error al actualizar meta');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteMeta = async (metaId: number) => {
    if (!confirm('¿Eliminar esta meta?')) return;
    try {
      await fetch(`/api/metas?id=${metaId}`, { method: 'DELETE' });
      fetchPrograma();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const startEditMeta = (meta: Meta) => {
    setEditingMeta(meta);
    setMetaForm({ sesion_numero: meta.sesion_numero, titulo: meta.titulo, descripcion: meta.descripcion, categoria: meta.categoria });
    setShowAddMeta(true);
  };

  const getCategoriaColor = (cat: string) => {
    switch (cat) {
      case 'evaluacion': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'intervencion': return 'bg-green-100 text-green-800 border-green-200';
      case 'seguimiento': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cierre': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgresoTiempo = (diasTranscurridos: number, diasTotales: number) => {
    if (!diasTotales || diasTotales <= 0) return 0;
    return Math.min(100, Math.round((diasTranscurridos / diasTotales) * 100));
  };

  const getProgresoSesiones = (completadas: number, total: number) => {
    if (!total || total <= 0) return 0;
    return Math.round((completadas / total) * 100);
  };

  const getProgresoColor = (pct: number) => {
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 50) return 'bg-blue-500';
    if (pct >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'en_curso': return 'bg-green-100 text-green-800';
      case 'desviado': return 'bg-red-100 text-red-800';
      case 'pausado': return 'bg-yellow-100 text-yellow-800';
      case 'completado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const diasRestantes = (programa?.asignaciones || []).map(a => {
    const restantes = a.dias_totales - a.dias_transcurridos;
    return restantes > 0 ? restantes : 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Cargando programa...</div>
      </div>
    );
  }

  if (!programa) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Programa no encontrado</div>
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
              <Link href="/programas" className="text-gray-400 hover:text-gray-600">
                ← Volver
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Programa: {programa.nombre}</h1>
            </div>
            <button
              onClick={() => setEditingPrograma(!editingPrograma)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
            >
              {editingPrograma ? 'Cancelar' : 'Editar Programa'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Editar Programa */}
        {editingPrograma && (
          <div className="bg-white rounded-lg shadow p-6 mb-8 border-l-4 border-indigo-500">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Editar Programa</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={editForm.descripcion}
                  onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Sesiones</label>
                <input
                  type="number"
                  min={12}
                  max={16}
                  value={editForm.total_sesiones}
                  onChange={(e) => setEditForm({ ...editForm, total_sesiones: parseInt(e.target.value) || 14 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleSavePrograma} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium">
                Guardar Cambios
              </button>
              <button onClick={() => setEditingPrograma(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Info del Programa */}
        {!editingPrograma && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500">Descripción</p>
                <p className="text-gray-900">{programa.descripcion}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Creado por</p>
                <p className="text-gray-900 font-medium">{programa.creador_nombre} {programa.creador_apellido}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total sesiones</p>
                <p className="text-gray-900 font-medium">{programa.total_sesiones}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Metas / Pasos del Programa */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Pasos del Programa ({programa.metas.length} de {programa.total_sesiones})
                </h2>
                <button
                  onClick={() => { setShowAddMeta(true); setEditingMeta(null); setMetaForm({ sesion_numero: (programa.metas.length || 0) + 1, titulo: '', descripcion: '', categoria: 'intervencion' }); }}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  + Agregar Paso
                </button>
              </div>

              {/* Formulario Agregar/Editar Meta */}
              {showAddMeta && (
                <div className="p-6 bg-indigo-50 border-b border-indigo-100">
                  <h3 className="text-sm font-semibold text-indigo-900 mb-3">
                    {editingMeta ? 'Editar Paso' : 'Agregar Nuevo Paso'}
                  </h3>
                  {metaError && (
                    <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">{metaError}</div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Sesión #</label>
                      <input
                        type="number"
                        min={1}
                        max={programa.total_sesiones}
                        value={metaForm.sesion_numero}
                        onChange={(e) => setMetaForm({ ...metaForm, sesion_numero: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
                      <select
                        value={metaForm.categoria}
                        onChange={(e) => setMetaForm({ ...metaForm, categoria: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="evaluacion">Evaluación</option>
                        <option value="intervencion">Intervención</option>
                        <option value="seguimiento">Seguimiento</option>
                        <option value="cierre">Cierre</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Título</label>
                        <DictationButton onResult={(t) => setMetaForm({ ...metaForm, titulo: metaForm.titulo + t })} />
                      </div>
                      <input
                        type="text"
                        value={metaForm.titulo}
                        onChange={(e) => setMetaForm({ ...metaForm, titulo: e.target.value })}
                        placeholder="Ej: Técnicas de relajación"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
                        <DictationButton onResult={(t) => setMetaForm({ ...metaForm, descripcion: metaForm.descripcion + t })} />
                      </div>
                      <textarea
                        value={metaForm.descripcion}
                        onChange={(e) => setMetaForm({ ...metaForm, descripcion: e.target.value })}
                        rows={2}
                        placeholder="Descripción detallada del paso..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={editingMeta ? handleUpdateMeta : handleAddMeta}
                      className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                    >
                      {editingMeta ? 'Actualizar' : 'Agregar'}
                    </button>
                    <button
                      onClick={() => { setShowAddMeta(false); setEditingMeta(null); setMetaError(''); }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de Metas */}
              <div className="divide-y divide-gray-100">
                {programa.metas.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No hay pasos definidos. Agrega el primer paso del programa.
                  </div>
                ) : (
                  programa.metas.map((meta) => (
                    <div key={meta.id} className="p-4 hover:bg-gray-50 flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-indigo-600">{meta.sesion_numero}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-900">{meta.titulo}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getCategoriaColor(meta.categoria)}`}>
                            {meta.categoria}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{meta.descripcion}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEditMeta(meta)}
                          className="px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteMeta(meta.id)}
                          className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Progreso de Casos Asignados */}
          <div>
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Casos con este Programa</h2>
              </div>
              <div className="p-4 space-y-4">
                {programa.asignaciones.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No hay casos asignados</p>
                ) : (
                  programa.asignaciones.map((caso) => {
                    const progresoTiempo = getProgresoTiempo(caso.dias_transcurridos, caso.dias_totales);
                    const progresoSesiones = getProgresoSesiones(caso.sesiones_completadas, caso.total_sesiones);
                    const diasRest = caso.dias_totales - caso.dias_transcurridos;
                    
                    return (
                      <div key={caso.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">
                              {caso.paciente_nombre} {caso.paciente_apellido}
                            </h3>
                            <p className="text-xs text-gray-500">{caso.psicologa_nombre} {caso.psicologa_apellido}</p>
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoBadge(caso.estado)}`}>
                            {caso.estado.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Barra de Progreso por Tiempo */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Progreso por tiempo</span>
                            <span className="font-medium text-gray-700">{progresoTiempo}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all ${getProgresoColor(progresoTiempo)}`}
                              style={{ width: `${progresoTiempo}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs mt-1 text-gray-400">
                            <span>{new Date(caso.fecha_inicio).toLocaleDateString('es-MX')}</span>
                            <span>
                              {diasRest > 0 
                                ? `${diasRest} días restantes` 
                                : 'Tiempo completado'}
                            </span>
                            <span>{new Date(caso.fecha_fin_estimada).toLocaleDateString('es-MX')}</span>
                          </div>
                        </div>

                        {/* Barra de Progreso por Sesiones */}
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Sesiones completadas</span>
                            <span className="font-medium text-gray-700">
                              {caso.sesiones_completadas} / {caso.total_sesiones} ({progresoSesiones}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${getProgresoColor(progresoSesiones)}`}
                              style={{ width: `${progresoSesiones}%` }}
                            />
                          </div>
                        </div>

                        {/* Semáforo de alerta */}
                        {progresoTiempo > progresoSesiones + 15 && caso.estado !== 'completado' && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700 flex items-center gap-1">
                            <span>⚠</span>
                            <span>El tiempo avanza más rápido que las sesiones completadas</span>
                          </div>
                        )}
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
