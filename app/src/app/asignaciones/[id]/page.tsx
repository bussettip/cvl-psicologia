'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DictationButton from '@/components/DictationButton';

interface Sesion {
  id: number;
  numero_sesion: number;
  fecha_programada: string;
  fecha_real: string | null;
  estado: string;
  duracion_minutos: number | null;
  temas_trabajados: string | null;
  observaciones_psicologa: string | null;
  desviacion: boolean;
  motivo_desviacion: string | null;
  tipo_desviacion: string;
  meta_titulo: string | null;
  meta_descripcion: string | null;
  meta_categoria: string | null;
  archivo_url: string | null;
  archivo_nombre: string | null;
}

interface AsignacionDetalle {
  id: number;
  paciente_nombre: string;
  paciente_apellido: string;
  motivo_consulta: string;
  diagnostico_inicial: string;
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
  sesiones: Sesion[];
}

export default function AsignacionDetallePage() {
  const params = useParams();
  const id = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [asignacion, setAsignacion] = useState<AsignacionDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [sesionEdit, setSesionEdit] = useState<Sesion | null>(null);
  const [editForm, setEditForm] = useState({
    fecha_real: '',
    duracion_minutos: '',
    temas_trabajados: '',
    observaciones_psicologa: '',
    desviacion: false,
    motivo_desviacion: '',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadSesionId, setUploadSesionId] = useState<number | null>(null);

  useEffect(() => {
    fetchAsignacion();
  }, [id]);

  const fetchAsignacion = async () => {
    try {
      const res = await fetch(`/api/asignaciones/${id}`);
      const data = await res.json();
      setAsignacion(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSesion = (sesion: Sesion) => {
    setSesionEdit(sesion);
    setEditForm({
      fecha_real: sesion.fecha_real ? sesion.fecha_real.split('T')[0] : '',
      duracion_minutos: sesion.duracion_minutos?.toString() || '',
      temas_trabajados: sesion.temas_trabajados || '',
      observaciones_psicologa: sesion.observaciones_psicologa || '',
      desviacion: sesion.desviacion,
      motivo_desviacion: sesion.motivo_desviacion || '',
    });
  };

  const handleSaveSesion = async () => {
    if (!sesionEdit) return;
    try {
      await fetch('/api/sesiones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sesionEdit.id,
          fecha_real: editForm.fecha_real || null,
          duracion_minutos: editForm.duracion_minutos ? parseInt(editForm.duracion_minutos) : null,
          temas_trabajados: editForm.temas_trabajados || null,
          observaciones_psicologa: editForm.observaciones_psicologa || null,
          desviacion: editForm.desviacion,
          motivo_desviacion: editForm.motivo_desviacion || null,
          estado: editForm.fecha_real ? 'completada' : sesionEdit.estado,
        })
      });
      setSesionEdit(null);
      fetchAsignacion();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFileUpload = async (sesionId: number, file: File) => {
    setUploading(true);
    setUploadSesionId(sesionId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sesion_id', sesionId.toString());
      
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      
      if (uploadRes.ok) {
        await fetch('/api/sesiones', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: sesionId,
            archivo_url: uploadData.url,
            archivo_nombre: uploadData.nombre,
          })
        });
        fetchAsignacion();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setUploading(false);
      setUploadSesionId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerUpload = (sesionId: number) => {
    setUploadSesionId(sesionId);
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadSesionId) {
      handleFileUpload(uploadSesionId, file);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completada': return 'bg-green-100 text-green-800';
      case 'programada': return 'bg-blue-100 text-blue-800';
      case 'reprogramada': return 'bg-yellow-100 text-yellow-800';
      case 'cancelada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMetaColor = (cat: string | null) => {
    switch (cat) {
      case 'evaluacion': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'intervencion': return 'bg-green-50 text-green-700 border-green-200';
      case 'seguimiento': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'cierre': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Cargando caso...</div>
      </div>
    );
  }

  if (!asignacion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Caso no encontrado</div>
      </div>
    );
  }

  const sesionesCompletadas = asignacion.sesiones.filter(s => s.estado === 'completada').length;
  const progreso = Math.round((sesionesCompletadas / asignacion.total_sesiones) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={onFileChange}
      />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Link href="/asignaciones" className="text-gray-400 hover:text-gray-600">
                ← Volver
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {asignacion.paciente_nombre} {asignacion.paciente_apellido}
                </h1>
                <p className="text-sm text-gray-500">
                  {asignacion.programa_nombre} · {asignacion.psicologa_nombre} {asignacion.psicologa_apellido}
                </p>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="text-gray-500">Supervisor: <span className="font-medium text-gray-900">{asignacion.supervisor_nombre} {asignacion.supervisor_apellido}</span></p>
              <p className="text-gray-500">Inicio: <span className="font-medium text-gray-900">{new Date(asignacion.fecha_inicio).toLocaleDateString('es-MX')}</span></p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info del paciente */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">Motivo de consulta</p>
              <p className="text-gray-900">{asignacion.motivo_consulta}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Diagnóstico inicial</p>
              <p className="text-gray-900">{asignacion.diagnostico_inicial || 'No registrado'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Progreso general</p>
              <div className="mt-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{sesionesCompletadas} de {asignacion.total_sesiones} sesiones</span>
                  <span className="font-medium">{progreso}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${progreso >= 80 ? 'bg-green-500' : progreso >= 50 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                    style={{ width: `${progreso}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Sesiones */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Sesiones del Programa</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {asignacion.sesiones.map((sesion) => (
              <div key={sesion.id} className={`p-4 ${sesion.desviacion ? 'bg-red-50' : ''} ${sesionEdit?.id === sesion.id ? 'bg-indigo-50' : ''}`}>
                <div className="flex items-start gap-4">
                  {/* Número de sesión */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    sesion.estado === 'completada' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <span className={`text-sm font-bold ${sesion.estado === 'completada' ? 'text-green-600' : 'text-blue-600'}`}>
                      {sesion.numero_sesion}
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getMetaColor(sesion.meta_categoria)}`}>
                        {sesion.meta_categoria || 'Sin categoría'}
                      </span>
                      <h3 className="text-sm font-semibold text-gray-900">{sesion.meta_titulo || `Sesión ${sesion.numero_sesion}`}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(sesion.estado)}`}>
                        {sesion.estado}
                      </span>
                      {sesion.desviacion && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ⚠ Desviación
                        </span>
                      )}
                    </div>

                    {sesion.meta_descripcion && (
                      <p className="text-xs text-gray-500 mb-1">{sesion.meta_descripcion}</p>
                    )}

                    {/* Info de sesión completada */}
                    {sesion.estado === 'completada' && (
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="text-gray-400">Fecha:</span> {sesion.fecha_real ? new Date(sesion.fecha_real).toLocaleDateString('es-MX') : '-'}
                        {sesion.duracion_minutos && <span className="ml-3 text-gray-400">Duración: {sesion.duracion_minutos} min</span>}
                      </div>
                    )}

                    {sesion.temas_trabajados && (
                      <p className="text-sm text-gray-700 mt-1"><span className="font-medium">Temas:</span> {sesion.temas_trabajados}</p>
                    )}

                    {sesion.observaciones_psicologa && (
                      <p className="text-sm text-gray-600 mt-1 italic">"{sesion.observaciones_psicologa}"</p>
                    )}

                    {sesion.desviacion && sesion.motivo_desviacion && (
                      <div className="mt-2 p-2 bg-red-100 rounded text-sm text-red-800">
                        <span className="font-medium">Motivo desviación:</span> {sesion.motivo_desviacion}
                      </div>
                    )}

                    {/* Archivo adjunto */}
                    {sesion.archivo_url && (
                      <div className="mt-2 flex items-center gap-2">
                        <a
                          href={sesion.archivo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-200"
                        >
                          📎 {sesion.archivo_nombre || 'Ver archivo'}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleEditSesion(sesion)}
                      className="px-3 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-200"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => triggerUpload(sesion.id)}
                      disabled={uploading && uploadSesionId === sesion.id}
                      className="px-3 py-1 text-xs text-green-600 hover:bg-green-50 rounded border border-green-200 disabled:opacity-50"
                    >
                      {uploading && uploadSesionId === sesion.id ? 'Subiendo...' : '📎 Archivo'}
                    </button>
                  </div>
                </div>

                {/* Formulario de edición inline */}
                {sesionEdit?.id === sesion.id && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-indigo-200">
                    <h4 className="text-sm font-semibold text-indigo-900 mb-3">Editar Sesión {sesion.numero_sesion}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Fecha Real</label>
                        <input
                          type="date"
                          value={editForm.fecha_real}
                          onChange={(e) => setEditForm({ ...editForm, fecha_real: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Duración (min)</label>
                        <input
                          type="number"
                          value={editForm.duracion_minutos}
                          onChange={(e) => setEditForm({ ...editForm, duracion_minutos: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Temas Trabajados</label>
                          <DictationButton onResult={(t) => setEditForm({ ...editForm, temas_trabajados: editForm.temas_trabajados + t })} />
                        </div>
                        <input
                          type="text"
                          value={editForm.temas_trabajados}
                          onChange={(e) => setEditForm({ ...editForm, temas_trabajados: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Observaciones</label>
                          <DictationButton onResult={(t) => setEditForm({ ...editForm, observaciones_psicologa: editForm.observaciones_psicologa + t })} />
                        </div>
                        <textarea
                          value={editForm.observaciones_psicologa}
                          onChange={(e) => setEditForm({ ...editForm, observaciones_psicologa: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={editForm.desviacion}
                            onChange={(e) => setEditForm({ ...editForm, desviacion: e.target.checked })}
                            className="rounded"
                          />
                          Marcar como desviación
                        </label>
                      </div>
                      {editForm.desviacion && (
                        <div>
                          <div className="flex items-center gap-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Motivo desviación</label>
                            <DictationButton onResult={(t) => setEditForm({ ...editForm, motivo_desviacion: editForm.motivo_desviacion + t })} />
                          </div>
                          <input
                            type="text"
                            value={editForm.motivo_desviacion}
                            onChange={(e) => setEditForm({ ...editForm, motivo_desviacion: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                      )}
                    </div>

                    {/* Zona de subida de archivo */}
                    <div className="mt-3 p-3 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <p className="text-sm text-gray-500 mb-2">Arrastra un archivo o haz clic para subir evaluación</p>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(sesion.id, file);
                        }}
                      />
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button onClick={handleSaveSesion} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">
                        Guardar
                      </button>
                      <button onClick={() => setSesionEdit(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
