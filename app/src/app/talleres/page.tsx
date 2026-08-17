'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';


interface Taller {
  id: number; titulo: string; descripcion: string; tema: string; fecha: string;
  hora_inicio: string; hora_fin: string; lugar: string; instructor: string;
  capacidad: number; inscritos: number; estado: string; publico_objetivo: string;
  materiales: string; resultado: string; diploma_template: string | null;
  autor_nombre: string; autor_apellido: string;
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
  const [uploadingParticipants, setUploadingParticipants] = useState<number | null>(null);
  const [uploadingTemplate, setUploadingTemplate] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const [participantes, setParticipantes] = useState<any[]>([]);
  const [loadingPart, setLoadingPart] = useState(false);
  const [generandoDiplomas, setGenerandoDiplomas] = useState<number | null>(null);

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
      setParticipantes([]);
    } else {
      setExpandedTaller(tallerId);
      fetchInvitaciones(tallerId);
      fetchParticipantes(tallerId);
    }
  };

  const fetchParticipantes = async (tallerId: number) => {
    setLoadingPart(true);
    try {
      const res = await fetch(`/api/talleres/participantes?taller_id=${tallerId}`);
      const data = await res.json();
      setParticipantes(Array.isArray(data) ? data : []);
    } catch { setParticipantes([]); }
    finally { setLoadingPart(false); }
  };

  const handleGenerarDiplomas = async (tallerId: number) => {
    setGenerandoDiplomas(tallerId);
    setMsg('');
    try {
      const res = await fetch('/api/talleres/diplomas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taller_id: tallerId }),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg(`${data.generated} diplomas generados correctamente`);
      } else {
        setMsg(data.error || 'Error al generar');
      }
    } catch { setMsg('Error al generar diplomas'); }
    finally { setGenerandoDiplomas(null); }
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

  const handleUploadParticipants = async (tallerId: number, file: File) => {
    setUploadingParticipants(tallerId);
    setMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('taller_id', String(tallerId));
      const res = await fetch('/api/talleres/participantes/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.ok) {
        setMsg(`${data.imported} participantes importados al taller`);
        fetchData();
      } else {
        setMsg(data.error || 'Error al importar');
      }
    } catch {
      setMsg('Error al subir archivo');
    } finally {
      setUploadingParticipants(null);
    }
  };

  const handleUploadTemplate = async (tallerId: number, file: File) => {
    setUploadingTemplate(tallerId);
    setMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('taller_id', String(tallerId));
      const res = await fetch('/api/talleres/diploma-template', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.ok) {
        setMsg('Plantilla de diploma subida correctamente');
        fetchData();
      } else {
        setMsg(data.error || 'Error al subir');
      }
    } catch {
      setMsg('Error al subir plantilla');
    } finally {
      setUploadingTemplate(null);
    }
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
        {/* Mensaje */}
        {msg && (
          <div className={`p-3 rounded-lg text-sm mb-4 ${msg.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {msg}
          </div>
        )}

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
                  {expandedTaller === item.id ? 'Cerrar' : `👁️ Ver Detalles`}
                </button>
                {/* Botón Subir Participantes */}
                <label className={`px-3 py-1 rounded text-xs font-medium cursor-pointer ${uploadingParticipants === item.id ? 'bg-yellow-200 text-yellow-800' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                  {uploadingParticipants === item.id ? '⏳ Subiendo...' : '📁 Subir Participantes'}
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadParticipants(item.id, file);
                      e.target.value = '';
                    }}
                  />
                </label>
                {/* Botón Subir Diploma */}
                <label className={`px-3 py-1 rounded text-xs font-medium cursor-pointer ${uploadingTemplate === item.id ? 'bg-yellow-200 text-yellow-800' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
                  {uploadingTemplate === item.id ? '⏳ Subiendo...' : item.diploma_template ? '✅ Diplomas' : '🎨 Subir Diploma'}
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadTemplate(item.id, file);
                      e.target.value = '';
                    }}
                  />
                </label>
                {user && (user.rol === 'supervisora' || user.rol === 'lider') && (
                  <button onClick={() => handleDelete(item.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">Eliminar</button>
                )}
              </div>

              {/* Sección expandida */}
              {expandedTaller === item.id && (
                <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
                  {/* Plantilla de diploma */}
                  <div>
                    <h4 className="font-bold text-xs text-gray-800 mb-2">Plantilla de Diploma</h4>
                    {item.diploma_template ? (
                      <div className="flex items-center gap-3">
                        <a href={item.diploma_template} target="_blank" rel="noopener noreferrer"
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 font-medium">
                          📄 Ver Plantilla
                        </a>
                        <label className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200 font-medium cursor-pointer">
                          🔄 Cambiar Plantilla
                          <input type="file" accept=".png,.jpg,.jpeg,.pdf" className="hidden"
                            onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadTemplate(item.id, f); e.target.value = ''; }} />
                        </label>
                      </div>
                    ) : (
                      <label className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 font-medium cursor-pointer">
                        {uploadingTemplate === item.id ? '⏳ Subiendo...' : '🎨 Subir Plantilla de Diploma'}
                        <input type="file" accept=".png,.jpg,.jpeg,.pdf" className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadTemplate(item.id, f); e.target.value = ''; }} />
                      </label>
                    )}
                  </div>

                  {/* Participantes subidos */}
                  <div>
                    <h4 className="font-bold text-xs text-gray-800 mb-2">Participantes ({participantes.length})</h4>
                    {loadingPart ? (
                      <p className="text-xs text-gray-500">Cargando...</p>
                    ) : participantes.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">Sin participantes registrados. Sube un Excel con los datos.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-2 py-1 text-left font-medium text-gray-600">#</th>
                              <th className="px-2 py-1 text-left font-medium text-gray-600">Adolescente</th>
                              <th className="px-2 py-1 text-left font-medium text-gray-600">Padre/Madre</th>
                              <th className="px-2 py-1 text-left font-medium text-gray-600">Pago</th>
                              <th className="px-2 py-1 text-left font-medium text-gray-600">Contacto</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {participantes.map((p: any, i: number) => (
                              <tr key={p.id} className="hover:bg-gray-100">
                                <td className="px-2 py-1 text-gray-500">{i + 1}</td>
                                <td className="px-2 py-1 font-medium text-gray-900">{p.nombre_adolescente}</td>
                                <td className="px-2 py-1 text-gray-700">{p.nombre_padre || '-'}</td>
                                <td className="px-2 py-1 text-gray-700">${p.cantidad_pagada}</td>
                                <td className="px-2 py-1 text-gray-500">{p.whatsapp || p.correo || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <button onClick={() => handleGenerarDiplomas(item.id)}
                      disabled={generandoDiplomas === item.id || participantes.length === 0}
                      className={`px-4 py-2 rounded-lg text-xs font-medium text-white ${generandoDiplomas === item.id ? 'bg-yellow-500' : 'bg-emerald-600 hover:bg-emerald-700'} disabled:opacity-50`}>
                      {generandoDiplomas === item.id ? '⏳ Generando...' : `🎓 Generar Diplomas (${participantes.length})`}
                    </button>
                    <Link href={`/diplomas?taller=${item.id}`}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700">
                      🖨️ Ver e Imprimir Diplomas
                    </Link>
                  </div>
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
