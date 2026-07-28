'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';


interface Taller {
  id: number; titulo: string; descripcion: string; tema: string; fecha: string;
  hora_inicio: string; hora_fin: string; lugar: string; instructor: string;
  capacidad: number; inscritos: number; estado: string; publico_objetivo: string;
  materiales: string; resultado: string; autor_nombre: string; autor_apellido: string;
  created_at: string;
}

export default function TalleresPage() {
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filtro, setFiltro] = useState('todos');
  const [expandedTaller, setExpandedTaller] = useState<number|null>(null);
  const [invitaciones, setInvitaciones] = useState<any[]>([]);
  const [loadingInv, setLoadingInv] = useState(false);
  const [form, setForm] = useState({
    titulo: '', descripcion: '', tema: '', fecha: '', hora_inicio: '', hora_fin: '',
    lugar: '', instructor: '', capacidad: '', publico_objetivo: '', materiales: ''
  });

  useEffect(() => {
    setMounted(true);
    fetch('/api/me').then(r => r.json()).then(data => {
      if (data.user) {
        if (data.user.rol !== 'supervisora' && data.user.rol !== 'lider' && data.user.rol !== 'psicologa') { window.location.href = '/'; return; }
        setUser(data.user);
        fetchData();
      } else {
        window.location.href = '/login';
      }
    }).catch(() => { window.location.href = '/login'; });
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/talleres');
      const data = await res.json();
      setItems(data.talleres || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchInvitaciones = async (tallerId: number) => {
    setLoadingInv(true);
    try {
      const res = await fetch(`/api/invitaciones-taller?taller_id=${tallerId}`);
      const data = await res.json();
      setInvitaciones(data.invitaciones || []);
    } catch (e) { console.error(e); }
    finally { setLoadingInv(false); }
  };

  const toggleExpandTaller = (tallerId: number) => {
    if (expandedTaller === tallerId) {
      setExpandedTaller(null);
      setInvitaciones([]);
    } else {
      setExpandedTaller(tallerId);
      fetchInvitaciones(tallerId);
    }
  };

  const handleSave = async () => {
    if (!form.titulo || !form.fecha) { alert('Título y fecha son obligatorios'); return; }
    try {
      const res = await fetch('/api/admin/talleres', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, capacidad: form.capacidad ? Number(form.capacidad) : 0, created_by: user?.id })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setShowForm(false);
      setForm({ titulo: '', descripcion: '', tema: '', fecha: '', hora_inicio: '', hora_fin: '', lugar: '', instructor: '', capacidad: '', publico_objetivo: '', materiales: '' });
      fetchData();
    } catch (e: any) { alert('Error: ' + e.message); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este taller?')) return;
    await fetch(`/api/admin/talleres?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  const estadoColors: Record<string, string> = {
    programado: 'bg-blue-100 text-blue-800', en_curso: 'bg-green-100 text-green-800',
    finalizado: 'bg-gray-100 text-gray-700', cancelado: 'bg-red-100 text-red-800'
  };

  const filtered = filtro === 'todos' ? items : items.filter(i => i.estado === filtro);

  if (!mounted || loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-500">Cargando...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-600">← Volver</Link>
            <h1 className="text-xl font-bold text-gray-800">🎓 Talleres</h1>
          </div>
          {user && (user.rol === 'supervisora' || user.rol === 'lider') && (
            <button onClick={() => setShowForm(!showForm)}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${showForm ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
              {showForm ? 'Cancelar' : '+ Nuevo Taller'}
            </button>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Formulario */}
        {showForm && (
          <div className="bg-white p-4 rounded-xl shadow border border-indigo-200 mb-6">
            <h3 className="font-bold text-sm text-gray-800 mb-3">Nuevo Taller</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-600 font-medium">Título *</label>
                <input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})}
                  className="w-full px-2 py-1.5 border rounded text-xs mt-0.5" placeholder="Ej: Taller de Relajación" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Tema</label>
                <input value={form.tema} onChange={e => setForm({...form, tema: e.target.value})}
                  className="w-full px-2 py-1.5 border rounded text-xs mt-0.5" placeholder="Ansiedad, estrés..." />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Fecha *</label>
                <input type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})}
                  className="w-full px-2 py-1.5 border rounded text-xs mt-0.5" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Hora Inicio</label>
                <input type="time" value={form.hora_inicio} onChange={e => setForm({...form, hora_inicio: e.target.value})}
                  className="w-full px-2 py-1.5 border rounded text-xs mt-0.5" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Hora Fin</label>
                <input type="time" value={form.hora_fin} onChange={e => setForm({...form, hora_fin: e.target.value})}
                  className="w-full px-2 py-1.5 border rounded text-xs mt-0.5" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Lugar</label>
                <input value={form.lugar} onChange={e => setForm({...form, lugar: e.target.value})}
                  className="w-full px-2 py-1.5 border rounded text-xs mt-0.5" placeholder="Sala 1, Online..." />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Instructor</label>
                <input value={form.instructor} onChange={e => setForm({...form, instructor: e.target.value})}
                  className="w-full px-2 py-1.5 border rounded text-xs mt-0.5" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Capacidad</label>
                <input type="number" min="0" value={form.capacidad} onChange={e => setForm({...form, capacidad: e.target.value})}
                  className="w-full px-2 py-1.5 border rounded text-xs mt-0.5" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Público Objetivo</label>
                <input value={form.publico_objetivo} onChange={e => setForm({...form, publico_objetivo: e.target.value})}
                  className="w-full px-2 py-1.5 border rounded text-xs mt-0.5" placeholder="Parejas, adolescentes..." />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs text-gray-600 font-medium">Descripción</label>
              <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} rows={2}
                className="w-full px-2 py-1.5 border rounded text-xs mt-0.5 resize-none" />
            </div>
            <div className="mt-3">
              <label className="text-xs text-gray-600 font-medium">Materiales</label>
              <textarea value={form.materiales} onChange={e => setForm({...form, materiales: e.target.value})} rows={2}
                className="w-full px-2 py-1.5 border rounded text-xs mt-0.5 resize-none" placeholder="Lista de materiales..." />
            </div>
            <button onClick={handleSave} className="mt-3 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium">
              Guardar Taller
            </button>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 mb-4">
          {['todos', 'programado', 'en_curso', 'finalizado', 'cancelado'].map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${filtro === f ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>
              {f === 'en_curso' ? 'En Curso' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-sm text-gray-800">{item.titulo}</h3>
                  <p className="text-xs text-gray-400">👤 {item.autor_nombre} {item.autor_apellido}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${estadoColors[item.estado] || 'bg-gray-100'}`}>{item.estado === 'en_curso' ? 'En Curso' : item.estado}</span>
                  <Link href="/talleres/invitar"
                    className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 font-medium">
                    + Invitar
                  </Link>
                </div>
              </div>
              {item.tema && <p className="text-xs text-purple-600 mb-1">📚 {item.tema}</p>}
              {item.descripcion && <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.descripcion}</p>}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                {item.fecha && <p>📅 {new Date(item.fecha).toLocaleDateString('es-MX')}{item.hora_inicio ? ` ${item.hora_inicio}` : ''}{item.hora_fin ? ` - ${item.hora_fin}` : ''}</p>}
                {item.lugar && <p>📍 {item.lugar}</p>}
                {item.instructor && <p>🧑‍🏫 {item.instructor}</p>}
                {item.capacidad > 0 && <p>👥 {item.inscritos || 0}/{item.capacidad} inscritos</p>}
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => toggleExpandTaller(item.id)}
                  className={`px-3 py-1 rounded text-xs font-medium ${expandedTaller === item.id ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}>
                  {expandedTaller === item.id ? 'Cerrar' : `👁️ Ver Invitados (${item.inscritos || 0})`}
                </button>
                {user && (user.rol === 'supervisora' || user.rol === 'lider') && (
                  <button onClick={() => handleDelete(item.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">Eliminar</button>
                )}
              </div>

              {/* Lista de invitados */}
              {expandedTaller === item.id && (
                <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <h4 className="font-bold text-xs text-indigo-800 mb-2">Invitados al taller</h4>
                  {loadingInv ? (
                    <p className="text-xs text-gray-500">Cargando...</p>
                  ) : invitaciones.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">Sin invitaciones registradas</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {invitaciones.map((inv: any) => (
                        <div key={inv.id} className="flex items-center justify-between p-2 bg-white rounded border text-xs">
                          <div>
                            <span className="font-medium">{inv.paciente_nombre} {inv.paciente_apellido}</span>
                            <span className="text-gray-400 ml-2">— por {inv.psicologa_nombre} {inv.psicologa_apellido}</span>
                            {inv.fecha_sesion && <span className="text-gray-400 ml-2">📅 {new Date(inv.fecha_sesion).toLocaleDateString('es-MX')}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              inv.estado === 'confirmada' ? 'bg-green-100 text-green-700' :
                              inv.estado === 'asistio' ? 'bg-blue-100 text-blue-700' :
                              inv.estado === 'cancelada' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>{inv.estado}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        {filtered.length === 0 && <p className="text-center text-gray-400 py-8">Sin talleres</p>}
      </div>
    </div>
  );
}
