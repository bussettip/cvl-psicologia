'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Programa {
  id: number;
  nombre: string;
  descripcion: string;
  total_sesiones: number;
  creador_nombre: string;
  creador_apellido: string;
  total_metas: number;
  asignaciones_activas: number;
  created_at: string;
}

interface Paciente { id: number; nombre: string; apellido: string; email: string; }
interface Psicologa { id: number; nombre: string; apellido: string; }

export default function ProgramasPage() {
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newForm, setNewForm] = useState({ nombre: '', descripcion: '', total_sesiones: 14, created_by: 1 });

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [psicologas, setPsicologas] = useState<Psicologa[]>([]);
  const [asignPrograma, setAsignPrograma] = useState<number|null>(null);
  const [asignPaciente, setAsignPaciente] = useState('');
  const [asignPsicologa, setAsignPsicologa] = useState('');
  const [asignLoading, setAsignLoading] = useState(false);

  useEffect(() => {
    fetchProgramas();
    fetchPacientes();
    fetchPsicologas();
  }, []);

  const fetchProgramas = async () => {
    try {
      const res = await fetch('/api/programas');
      const data = await res.json();
      setProgramas(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPacientes = async () => {
    try {
      const res = await fetch('/api/pacientes');
      const data = await res.json();
      setPacientes(data.pacientes || data);
    } catch (error) { console.error(error); }
  };

  const fetchPsicologas = async () => {
    try {
      const res = await fetch('/api/usuarios');
      const data = await res.json();
      setPsicologas((data.usuarios || data).filter((u: any) => u.rol === 'psicologa'));
    } catch (error) { console.error(error); }
  };

  const handleCreatePrograma = async () => {
    try {
      const res = await fetch('/api/programas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm)
      });
      if (res.ok) {
        setShowNewForm(false);
        setNewForm({ nombre: '', descripcion: '', total_sesiones: 14, created_by: 1 });
        fetchProgramas();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const asignarTratamiento = async (programaId: number) => {
    if (!asignPaciente || !asignPsicologa) {
      alert('Selecciona paciente y psicóloga');
      return;
    }
    setAsignLoading(true);
    try {
      const res = await fetch('/api/admin/asignaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente_id: Number(asignPaciente),
          psicologa_id: Number(asignPsicologa),
          programa_id: programaId,
          fecha_inicio: new Date().toISOString().split('T')[0]
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al asignar');
      alert('Tratamiento asignado exitosamente');
      setAsignPrograma(null);
      setAsignPaciente('');
      setAsignPsicologa('');
      fetchProgramas();
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setAsignLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Cargando programas...</div>
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
              <h1 className="text-xl font-bold text-gray-900">Programas Terapéuticos</h1>
            </div>
            <button
              onClick={() => setShowNewForm(!showNewForm)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
            >
              {showNewForm ? 'Cancelar' : '+ Nuevo Programa'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Formulario Nuevo Programa */}
        {showNewForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8 border-l-4 border-green-500">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Crear Nuevo Programa</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={newForm.nombre}
                  onChange={(e) => setNewForm({ ...newForm, nombre: e.target.value })}
                  placeholder="Ej: Programa Ansiedad"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={newForm.descripcion}
                  onChange={(e) => setNewForm({ ...newForm, descripcion: e.target.value })}
                  placeholder="Descripción breve..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Sesiones (12-16)</label>
                <input
                  type="number"
                  min={12}
                  max={16}
                  value={newForm.total_sesiones}
                  onChange={(e) => setNewForm({ ...newForm, total_sesiones: parseInt(e.target.value) || 14 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleCreatePrograma} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium">
                Crear Programa
              </button>
              <button onClick={() => setShowNewForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de Programas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programas.map((programa) => (
            <div key={programa.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600">
                <h3 className="text-lg font-semibold text-white">{programa.nombre}</h3>
                <p className="text-sm text-indigo-100">{programa.total_sesiones} sesiones</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{programa.descripcion}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500">Creado por</p>
                    <p className="font-medium text-gray-900">{programa.creador_nombre} {programa.creador_apellido}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Metas definidas</p>
                    <p className="font-medium text-gray-900">{programa.total_metas} de {programa.total_sesiones}</p>
                  </div>
                </div>

                {/* Barra de completitud de metas */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Metas definidas</span>
                    <span className="font-medium text-gray-700">
                      {Math.round((programa.total_metas / programa.total_sesiones) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (programa.total_metas / programa.total_sesiones) >= 0.8 ? 'bg-green-500' : 
                        (programa.total_metas / programa.total_sesiones) >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(programa.total_metas / programa.total_sesiones) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    programa.asignaciones_activas > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {programa.asignaciones_activas} caso{programa.asignaciones_activas !== 1 ? 's' : ''} activo{programa.asignaciones_activas !== 1 ? 's' : ''}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAsignPrograma(asignPrograma === programa.id ? null : programa.id)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        asignPrograma === programa.id
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      }`}
                    >
                      {asignPrograma === programa.id ? 'Cancelar' : '📋 Asignar'}
                    </button>
                    <Link 
                      href={`/programas/${programa.id}`}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                    >
                      Ver / Editar →
                    </Link>
                  </div>
                </div>

                {/* Panel de asignación */}
                {asignPrograma === programa.id && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 className="font-bold text-sm text-orange-800 mb-3">Asignar Tratamiento — {programa.nombre}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-600 font-medium">Paciente *</label>
                        <select value={asignPaciente} onChange={e => setAsignPaciente(e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs mt-0.5">
                          <option value="">— Seleccionar paciente —</option>
                          {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 font-medium">Psicóloga *</label>
                        <select value={asignPsicologa} onChange={e => setAsignPsicologa(e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs mt-0.5">
                          <option value="">— Seleccionar psicóloga —</option>
                          {psicologas.map(ps => <option key={ps.id} value={ps.id}>{ps.nombre} {ps.apellido}</option>)}
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => asignarTratamiento(programa.id)}
                      disabled={asignLoading}
                      className="mt-3 w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white py-2 rounded text-xs font-medium transition-colors"
                    >
                      {asignLoading ? 'Asignando...' : 'Asignar Tratamiento'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {programas.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
            No hay programas creados aún
          </div>
        )}
      </main>
    </div>
  );
}
