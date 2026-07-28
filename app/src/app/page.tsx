'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUsuario, clearUsuario } from '@/lib/auth';

interface Estadisticas {
  totalPacientes: number;
  totalPsicologas: number;
  asignacionesActivas: number;
  alertasPendientes: number;
  sesionesCompletadas: number;
  programasActivos: number;
}

interface Psicologa {
  id: number;
  nombre: string;
  apellido: string;
  total_casos: number;
  casos_activos: number;
  casos_completados: number;
  casos_desviados: number;
  sesiones_completadas: number;
  alertas_pendientes: number;
}

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
  created_at: string;
}

interface IngresoHoy {
  total: number;
  num_cobros: number;
}

interface Ingresos {
  hoy: IngresoHoy;
  mes: IngresoHoy;
  pendiente_hoy: IngresoHoy;
  pendiente_mes: IngresoHoy;
  por_metodo: { metodo_pago: string; total: number; num_cobros: number }[];
  por_tipo: { tipo: string; total: number; num_cobros: number }[];
  gastos_fijos: number;
  beneficio_neto: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Estadisticas | null>(null);
  const [ingresos, setIngresos] = useState<Ingresos | null>(null);
  const [psicologas, setPsicologas] = useState<Psicologa[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [showPsicologaMenu, setShowPsicologaMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/me').then(r => r.json()).then(data => {
      if (data.user) {
        setUser(data.user);
        fetchDashboard();
      } else {
        window.location.href = '/login';
      }
    }).catch(() => { window.location.href = '/login'; });
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      setStats(data.estadisticas);
      setIngresos(data.ingresos);
      setPsicologas(data.rendimiento);
      setAlertas(data.alertasRecientes);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGravedadColor = (gravedad: string) => {
    switch (gravedad) {
      case 'critica': return 'bg-red-100 text-red-800 border-red-200';
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
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

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Cargando dashboard...</div>
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
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CRM Psicología</h1>
                <p className="text-sm text-gray-500">Gestión de Casos Terapéuticos</p>
              </div>
            </div>
            <nav className="flex items-center gap-2 flex-wrap">
              <Link href="/" className="px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md">
                Dashboard
              </Link>
              <div className="relative" onMouseLeave={() => setShowPsicologaMenu(false)}>
                <button onClick={() => setShowPsicologaMenu(!showPsicologaMenu)}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md flex items-center gap-1">
                  👩‍⚕️ Psicóloga <span className="text-xs">▾</span>
                </button>
                {showPsicologaMenu && (
                  <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg py-1 z-50 min-w-[160px]">
                    <Link href="/psicologa" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      👩‍⚕️ Mi Panel
                    </Link>
                  </div>
                )}
              </div>
              <Link href="/recepcion" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                📋 Recepción
              </Link>
              {user && (user.rol === 'supervisora' || user.rol === 'supervisor' || user.rol === 'lider') && (
                <Link href="/supervisora" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                  👩‍⚕️ Panel Supervisora
                </Link>
              )}
              {user && (user.rol === 'supervisora' || user.rol === 'supervisor' || user.rol === 'lider') && (
                <Link href="/mercadeo" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                  📣 Mercadeo
                </Link>
              )}
              {user && (
                <>
                  <span className="text-sm text-gray-500">{user.nombre}</span>
                  <button onClick={() => { try{clearUsuario();}catch{} window.location.href = '/login'; }}
                    className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md">
                    Salir
                  </button>
                </>
              )}
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">DR</span>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
            <p className="text-sm font-medium text-gray-500">Pacientes Activos</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalPacientes || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-sm font-medium text-gray-500">Psicólogas</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalPsicologas || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-500">Casos Activos</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.asignacionesActivas || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <p className="text-sm font-medium text-gray-500">Alertas Pendientes</p>
            <p className="text-2xl font-bold text-red-600">{stats?.alertasPendientes || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <p className="text-sm font-medium text-gray-500">Sesiones Completadas</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.sesionesCompletadas || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-teal-500">
            <p className="text-sm font-medium text-gray-500">Programas Activos</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.programasActivos || 0}</p>
          </div>
        </div>

        {/* Ingresos */}
        {ingresos && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">💰 Ingresos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-emerald-500">
                <p className="text-sm font-medium text-gray-500">Ingresos Hoy</p>
                <p className="text-2xl font-bold text-emerald-600">${(ingresos.hoy.total || 0).toLocaleString('es-MX')}</p>
                <p className="text-xs text-gray-400">{ingresos.hoy.num_cobros} cobro(s)</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                <p className="text-sm font-medium text-gray-500">Ingresos del Mes</p>
                <p className="text-2xl font-bold text-blue-600">${(ingresos.mes.total || 0).toLocaleString('es-MX')}</p>
                <p className="text-xs text-gray-400">{ingresos.mes.num_cobros} cobro(s)</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                <p className="text-sm font-medium text-gray-500">Pendiente Hoy</p>
                <p className="text-2xl font-bold text-yellow-600">${(ingresos.pendiente_hoy.total || 0).toLocaleString('es-MX')}</p>
                <p className="text-xs text-gray-400">{ingresos.pendiente_hoy.num_cobros} cobro(s)</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                <p className="text-sm font-medium text-gray-500">Pendiente del Mes</p>
                <p className="text-2xl font-bold text-red-600">${(ingresos.pendiente_mes.total || 0).toLocaleString('es-MX')}</p>
                <p className="text-xs text-gray-400">{ingresos.pendiente_mes.num_cobros} cobro(s)</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500 mb-2">Por Método de Pago</p>
                {ingresos.por_metodo.length === 0 ? (
                  <p className="text-xs text-gray-400">Sin datos este mes</p>
                ) : (
                  <div className="space-y-1">
                    {ingresos.por_metodo.map((m) => (
                      <div key={m.metodo_pago} className="flex justify-between text-xs">
                        <span className="capitalize text-gray-600">{m.metodo_pago}</span>
                        <span className="font-medium">${m.total.toLocaleString('es-MX')} ({m.num_cobros})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500 mb-2">Por Tipo</p>
                {ingresos.por_tipo.length === 0 ? (
                  <p className="text-xs text-gray-400">Sin datos este mes</p>
                ) : (
                  <div className="space-y-1">
                    {ingresos.por_tipo.map((t) => (
                      <div key={t.tipo} className="flex justify-between text-xs">
                        <span className="capitalize text-gray-600">{t.tipo}</span>
                        <span className="font-medium">${t.total.toLocaleString('es-MX')} ({t.num_cobros})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500 mb-2">Rentabilidad Mensual</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Ingresos brutos</span>
                    <span className="font-medium text-emerald-600">${(ingresos.mes.total || 0).toLocaleString('es-MX')}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Gastos fijos</span>
                    <span className="font-medium text-red-600">-${ingresos.gastos_fijos.toLocaleString('es-MX')}</span>
                  </div>
                  <div className="border-t pt-1.5 flex justify-between text-xs font-bold">
                    <span className="text-gray-700">Beneficio neto</span>
                    <span className={ingresos.beneficio_neto >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                      ${ingresos.beneficio_neto.toLocaleString('es-MX')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rendimiento por Psicóloga */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Rendimiento por Psicóloga</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Psicóloga</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Casos</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Activos</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Completados</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Desviados</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sesiones</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Alertas</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {psicologas.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-indigo-600">
                              {p.nombre[0]}{p.apellido[0]}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{p.nombre} {p.apellido}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">{p.total_casos}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {p.casos_activos}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {p.casos_completados}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.casos_desviados > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {p.casos_desviados}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">{p.sesiones_completadas}</td>
                      <td className="px-4 py-3 text-center">
                        {p.alertas_pendientes > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {p.alertas_pendientes}
                          </span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alertas Recientes */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Alertas Pendientes</h2>
            </div>
            <div className="p-4 space-y-3">
              {alertas.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No hay alertas pendientes</p>
              ) : (
                alertas.map((alerta) => (
                  <div key={alerta.id} className={`p-3 rounded-lg border ${getGravedadColor(alerta.gravedad)}`}>
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{getTipoIcon(alerta.tipo)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{alerta.paciente_nombre} {alerta.paciente_apellido}</p>
                        <p className="text-xs opacity-75">{alerta.psicologa_nombre} {alerta.psicologa_apellido} - Sesión {alerta.numero_sesion}</p>
                        <p className="text-xs mt-1 opacity-80">{alerta.descripcion.substring(0, 80)}...</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/pacientes" className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-indigo-600 text-xl">👤</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Ver Pacientes</p>
                <p className="text-sm text-gray-500">{stats?.totalPacientes} activos</p>
              </div>
            </Link>
            <Link href="/programas" className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">📋</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Programas</p>
                <p className="text-sm text-gray-500">{stats?.programasActivos} disponibles</p>
              </div>
            </Link>
            <Link href="/asignaciones" className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">🔗</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Asignaciones</p>
                <p className="text-sm text-gray-500">{stats?.asignacionesActivas} en curso</p>
              </div>
            </Link>
            <Link href="/alertas" className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-xl">🔔</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Alertas</p>
                <p className="text-sm text-gray-500">{stats?.alertasPendientes} pendientes</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
