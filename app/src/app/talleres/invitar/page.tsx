'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';


interface Taller { id: number; titulo: string; tema: string; fecha: string; hora_inicio: string; hora_fin: string; lugar: string; instructor: string; capacidad: number; inscritos: number; estado: string; publico_objetivo: string; }
interface Paciente { id: number; nombre: string; apellido: string; email: string; telefono: string; }
interface Invitacion {
  id: number; taller_id: number; paciente_id: number; psicologa_id: number;
  fecha_sesion: string; estado: string; notas: string;
  taller_titulo: string; taller_fecha: string; taller_hora: string; taller_lugar: string; taller_tema: string;
  paciente_nombre: string; paciente_apellido: string; paciente_telefono: string;
  psicologa_nombre: string; psicologa_apellido: string; created_at: string;
}

export default function InvitarTallerPage() {
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [invitaciones, setInvitaciones] = useState<Invitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ taller_id: '', paciente_id: '', fecha_sesion: '', notas: '' });

  useEffect(() => {
    setMounted(true);
    fetch('/api/me').then(r => r.json()).then(data => {
      if (data.user) {
        setUser(data.user);
        loadData();
      } else {
        window.location.href = '/login';
      }
    }).catch(() => { window.location.href = '/login'; });
  }, []);

  const loadData = async () => {
    try {
      const [tRes, pRes, iRes] = await Promise.all([
        fetch('/api/admin/talleres?estado=programado'),
        fetch('/api/pacientes'),
        fetch(user?.id ? `/api/invitaciones-taller?psicologa_id=${user.id}` : '/api/invitaciones-taller')
      ]);
      const tData = await tRes.json();
      const pData = await pRes.json();
      const iData = await iRes.json();
      setTalleres(tData.talleres || []);
      setPacientes(pData.pacientes || pData || []);
      setInvitaciones(iData.invitaciones || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleInvitar = async () => {
    if (!form.taller_id || !form.paciente_id) { alert('Selecciona taller y paciente'); return; }
    try {
      const res = await fetch('/api/invitaciones-taller', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, psicologa_id: user?.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      alert('Paciente invitado exitosamente');
      setShowForm(false);
      setForm({ taller_id: '', paciente_id: '', fecha_sesion: '', notas: '' });
      loadData();
    } catch (e: any) { alert('Error: ' + e.message); }
  };

  const cancelarInvitacion = async (id: number) => {
    if (!confirm('¿Cancelar esta invitación?')) return;
    try {
      await fetch('/api/invitaciones-taller', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado: 'cancelada' })
      });
      loadData();
    } catch (e) { console.error(e); }
  };

  const estadoColors: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800', confirmada: 'bg-green-100 text-green-800',
    asistio: 'bg-blue-100 text-blue-800', cancelada: 'bg-red-100 text-red-800'
  };

  const filtered = filtro === 'todos' ? invitaciones : invitaciones.filter(i => i.estado === filtro);

  if (!mounted || loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-500">Cargando...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/talleres" className="text-gray-400 hover:text-gray-600">← Volver</Link>
            <h1 className="text-xl font-bold text-gray-800">🎓 Invitar Pacientes a Talleres</h1>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${showForm ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
            {showForm ? 'Cancelar' : '+ Invitar Paciente'}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Formulario de invitación */}
        {showForm && (
          <div className="bg-white p-4 rounded-xl shadow border border-green-200 mb-6">
            <h3 className="font-bold text-sm text-gray-800 mb-3">Invitar Paciente a Taller</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 font-medium">Taller Disponible *</label>
                <select value={form.taller_id} onChange={e => setForm({...form, taller_id: e.target.value})}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs mt-0.5">
                  <option value="">— Seleccionar taller —</option>
                  {talleres.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.titulo} — {t.fecha ? new Date(t.fecha).toLocaleDateString('es-MX') : 'Sin fecha'} | {t.lugar || 'Por definir'} | ({t.inscritos}/{t.capacidad})
                    </option>
                  ))}
                </select>
                {talleres.length === 0 && <p className="text-xs text-red-500 mt-1">No hay talleres programados disponibles</p>}
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Paciente *</label>
                <select value={form.paciente_id} onChange={e => setForm({...form, paciente_id: e.target.value})}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs mt-0.5">
                  <option value="">— Seleccionar paciente —</option>
                  {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Fecha de asistencia</label>
                <input type="date" value={form.fecha_sesion} onChange={e => setForm({...form, fecha_sesion: e.target.value})}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs mt-0.5" />
                <p className="text-xs text-gray-400 mt-0.5">Fecha en que el paciente asistirá</p>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Notas / Observaciones</label>
                <input value={form.notas} onChange={e => setForm({...form, notas: e.target.value})}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs mt-0.5" placeholder="Motivo de la invitación..." />
              </div>
            </div>
            <button onClick={handleInvitar}
              className="mt-3 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium">
              Enviar Invitación
            </button>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 mb-4">
          {['todos', 'pendiente', 'confirmada', 'asistio', 'cancelada'].map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${filtro === f ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Lista de invitaciones */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Sin invitaciones registradas</p>
          ) : (
            filtered.map(inv => (
              <div key={inv.id} className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-gray-800">🎓 {inv.taller_titulo}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${estadoColors[inv.estado]}`}>{inv.estado}</span>
                    </div>
                    {inv.taller_tema && <p className="text-xs text-purple-600">📚 {inv.taller_tema}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      🧑 Paciente: <span className="font-medium">{inv.paciente_nombre} {inv.paciente_apellido}</span>
                      {inv.paciente_telefono && ` • 📱 ${inv.paciente_telefono}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      📅 {inv.taller_fecha ? new Date(inv.taller_fecha).toLocaleDateString('es-MX') : 'Sin fecha'}{inv.taller_hora ? ` ${inv.taller_hora}` : ''} • 📍 {inv.taller_lugar || 'Por definir'}
                    </p>
                    {inv.fecha_sesion && <p className="text-xs text-gray-400">Fecha de asistencia: {new Date(inv.fecha_sesion).toLocaleDateString('es-MX')}</p>}
                    {inv.notas && <p className="text-xs text-gray-400 mt-1 italic">"{inv.notas}"</p>}
                  </div>
                  <div className="flex gap-2">
                    {inv.estado === 'pendiente' && (
                      <>
                        <button onClick={() => {
                          fetch('/api/invitaciones-taller', {
                            method: 'PUT', headers: {'Content-Type':'application/json'},
                            body: JSON.stringify({ id: inv.id, estado: 'confirmada' })
                          }).then(() => loadData());
                        }} className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">Confirmar</button>
                        <button onClick={() => cancelarInvitacion(inv.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">Cancelar</button>
                      </>
                    )}
                    {inv.estado === 'confirmada' && (
                      <button onClick={() => {
                        fetch('/api/invitaciones-taller', {
                          method: 'PUT', headers: {'Content-Type':'application/json'},
                          body: JSON.stringify({ id: inv.id, estado: 'asistio' })
                        }).then(() => loadData());
                      }} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">Marcar Asistencia</button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
