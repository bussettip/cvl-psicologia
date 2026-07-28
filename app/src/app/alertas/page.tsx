'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Alerta {
  id: number;
  tipo: string;
  descripcion: string;
  paciente_nombre: string;
  paciente_apellido: string;
  psicologa_nombre: string;
  psicologa_apellido: string;
  numero_sesion: number;
  gravedad: string;
  resuelta: boolean;
  detectada_por_nombre: string;
  detectada_por_apellido: string;
  notas_resolucion: string;
  created_at: string;
}

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('pendientes');

  useEffect(() => {
    fetchAlertas();
  }, []);

  const fetchAlertas = async () => {
    try {
      const res = await fetch('/api/alertas');
      const data = await res.json();
      setAlertas(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGravedadColor = (gravedad: string) => {
    switch (gravedad) {
      case 'critica': return 'bg-red-100 text-red-800 border-red-300';
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'baja': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'retraso': return 'Retraso';
      case 'repeticion': return 'Repetición';
      case 'salto_meta': return 'Salto de meta';
      case 'fuera_programa': return 'Fuera de programa';
      default: return tipo;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'retraso': return '⏰';
      case 'repeticion': return '🔄';
      case 'salto_meta': return '⬆️';
      case 'fuera_programa': return '⚠️';
      default: return '📋';
    }
  };

  const alertasFiltradas = filtro === 'pendientes' 
    ? alertas.filter(a => !a.resuelta)
    : filtro === 'resueltas'
    ? alertas.filter(a => a.resuelta)
    : alertas;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Cargando alertas...</div>
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
              <h1 className="text-xl font-bold text-gray-900">Alertas de Desviación</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {alertas.filter(a => !a.resuelta).length} pendientes
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          {['pendientes', 'resueltas', 'todas'].map((f) => (
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

        {/* Lista de Alertas */}
        <div className="space-y-4">
          {alertasFiltradas.map((alerta) => (
            <div key={alerta.id} className={`bg-white rounded-lg shadow border-l-4 p-6 ${
              alerta.resuelta ? 'opacity-75' : getGravedadColor(alerta.gravedad)
            }`}>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{getTipoIcon(alerta.tipo)}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {alerta.paciente_nombre} {alerta.paciente_apellido}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGravedadColor(alerta.gravedad)}`}>
                        {alerta.gravedad}
                      </span>
                      {alerta.resuelta && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Resuelta
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">{alerta.psicologa_nombre} {alerta.psicologa_apellido}</span>
                      {' · Sesión '}
                      <span className="font-medium">{alerta.numero_sesion}</span>
                      {' · {getTipoLabel(alerta.tipo)}'}
                    </p>
                    <p className="text-gray-700">{alerta.descripcion}</p>
                    
                    {alerta.resuelta && alerta.notas_resolucion && (
                      <div className="mt-3 p-3 bg-green-50 rounded-md">
                        <p className="text-sm text-green-800">
                          <span className="font-medium">Resolución:</span> {alerta.notas_resolucion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right text-sm text-gray-500">
                  <p>Detectada por: {alerta.detectada_por_nombre} {alerta.detectada_por_apellido}</p>
                  <p>{new Date(alerta.created_at).toLocaleDateString('es-MX')}</p>
                  {!alerta.resuelta && (
                    <button className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
                      Resolver
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {alertasFiltradas.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
            No hay alertas {filtro === 'pendientes' ? 'pendientes' : filtro === 'resueltas' ? 'resueltas' : 'para mostrar'}
          </div>
        )}
      </main>
    </div>
  );
}
