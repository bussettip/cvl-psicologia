'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Asignacion {
  id: number;
  paciente_nombre: string;
  paciente_apellido: string;
  motivo_consulta: string;
  psicologa_nombre: string;
  psicologa_apellido: string;
  supervisor_nombre: string;
  supervisor_apellido: string;
  programa_nombre: string;
  total_sesiones: number;
  sesion_actual: number;
  sesiones_completadas: number;
  estado: string;
  fecha_inicio: string;
  fecha_fin_estimada: string;
  alertas_pendientes: number;
}

export default function AsignacionesPage() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    fetchAsignaciones();
  }, []);

  const fetchAsignaciones = async () => {
    try {
      const res = await fetch('/api/asignaciones');
      const data = await res.json();
      setAsignaciones(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'en_curso': return 'bg-green-100 text-green-800';
      case 'pausado': return 'bg-yellow-100 text-yellow-800';
      case 'completado': return 'bg-blue-100 text-blue-800';
      case 'desviado': return 'bg-red-100 text-red-800';
      case 'cancelado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgreso = (completadas: number, total: number) => {
    return Math.round((completadas / total) * 100);
  };

  const asignacionesFiltradas = filtro === 'todos' 
    ? asignaciones 
    : asignaciones.filter(a => a.estado === filtro);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Cargando asignaciones...</div>
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
              <h1 className="text-xl font-bold text-gray-900">Asignaciones</h1>
            </div>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium">
              + Nueva Asignación
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['todos', 'en_curso', 'desviado', 'pausado', 'completado'].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filtro === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>

        {/* Lista de Asignaciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {asignacionesFiltradas.map((asignacion) => {
            const progreso = getProgreso(asignacion.sesiones_completadas, asignacion.total_sesiones);
            return (
              <div key={asignacion.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {asignacion.paciente_nombre} {asignacion.paciente_apellido}
                    </h3>
                    <p className="text-sm text-gray-500">{asignacion.motivo_consulta}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(asignacion.estado)}`}>
                    {asignacion.estado.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500">Psicóloga</p>
                    <p className="font-medium text-gray-900">{asignacion.psicologa_nombre} {asignacion.psicologa_apellido}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Supervisor</p>
                    <p className="font-medium text-gray-900">{asignacion.supervisor_nombre} {asignacion.supervisor_apellido}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Programa</p>
                    <p className="font-medium text-gray-900">{asignacion.programa_nombre}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Sesiones</p>
                    <p className="font-medium text-gray-900">{asignacion.sesiones_completadas} / {asignacion.total_sesiones}</p>
                  </div>
                </div>

                {/* Barra de Progreso */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progreso</span>
                    <span className="font-medium text-gray-900">{progreso}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${progreso >= 80 ? 'bg-green-500' : progreso >= 50 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                      style={{ width: `${progreso}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Inicio: {new Date(asignacion.fecha_inicio).toLocaleDateString('es-MX')}</span>
                    {asignacion.alertas_pendientes > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {asignacion.alertas_pendientes} alerta{asignacion.alertas_pendientes > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <Link href={`/asignaciones/${asignacion.id}`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                    Ver caso →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {asignacionesFiltradas.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
            No se encontraron asignaciones con el filtro seleccionado
          </div>
        )}
      </main>
    </div>
  );
}
