'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';


interface Mercadeo {
  id: number; titulo: string; descripcion: string; tipo: string; plataforma: string;
  fecha_inicio: string; fecha_fin: string; estado: string; contenido: string;
  resultado: string; autor_nombre: string; autor_apellido: string; created_at: string;
}

export default function MercadeoPage() {
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<Mercadeo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filtro, setFiltro] = useState('todos');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    titulo: '', descripcion: '', tipo: 'publicacion', plataforma: '',
    fecha_inicio: '', fecha_fin: '', estado: 'borrador', contenido: '', resultado: ''
  });
  const [archivos, setArchivos] = useState<{ name: string; size: number; created: string }[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [showArchivos, setShowArchivos] = useState(false);
  const [showRecordatorios, setShowRecordatorios] = useState(false);
  const [recordatoriosPendientes, setRecordatoriosPendientes] = useState<any[]>([]);
  const [historialRecordatorios, setHistorialRecordatorios] = useState<any[]>([]);
  const [loadingRecordatorios, setLoadingRecordatorios] = useState(false);
  const [enviandoRecordatorios, setEnviandoRecordatorios] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/me').then(r => r.json()).then(data => {
      if (data.user) {
        if (data.user.rol !== 'supervisora' && data.user.rol !== 'lider') { window.location.href = '/'; return; }
        setUser(data.user);
        fetchData();
        fetchArchivos();
      } else {
        window.location.href = '/login';
      }
    }).catch(() => { window.location.href = '/login'; });
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/mercadeo');
      const data = await res.json();
      setItems(data.mercadeo || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchArchivos = async () => {
    try {
      const res = await fetch('/api/upload/mercadeo');
      const data = await res.json();
      setArchivos(data.files || []);
    } catch (e) { console.error(e); }
  };

  const fetchRecordatorios = async () => {
    setLoadingRecordatorios(true);
    try {
      const res = await fetch('/api/email/recordatorios');
      const data = await res.json();
      setRecordatoriosPendientes(data.pendientes || []);
    } catch (e) { console.error(e); }
    setLoadingRecordatorios(false);
  };

  const generarRecordatorios = async () => {
    setLoadingRecordatorios(true);
    try {
      const res = await fetch('/api/email/recordatorios', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'generar' })
      });
      const data = await res.json();
      alert(data.message || 'Revisión completada');
      fetchRecordatorios();
    } catch (e: any) { alert('Error: ' + e.message); }
    setLoadingRecordatorios(false);
  };

  const enviarRecordatorios = async () => {
    if (!confirm(`¿Enviar ${recordatoriosPendientes.length} recordatorios por correo?`)) return;
    setEnviandoRecordatorios(true);
    try {
      const res = await fetch('/api/email/recordatorios', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'enviar_pendientes' })
      });
      const data = await res.json();
      alert(`Enviados: ${data.enviados}, Errores: ${data.errores}`);
      fetchRecordatorios();
    } catch (e: any) { alert('Error: ' + e.message); }
    setEnviandoRecordatorios(false);
  };

  const fetchHistorialRecordatorios = async () => {
    try {
      const res = await fetch('/api/email/recordatorios?accion=historial');
      const data = await res.json();
      setHistorialRecordatorios(data.historial || []);
    } catch (e) { console.error(e); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload/mercadeo', { method: 'POST', body: fd });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      fetchArchivos();
    } catch (err: any) { alert('Error: ' + err.message); }
    finally { setSubiendo(false); e.target.value = ''; }
  };

  const handleDeleteArchivo = async (name: string) => {
    if (!confirm('¿Eliminar este archivo?')) return;
    await fetch(`/api/upload/mercadeo?name=${encodeURIComponent(name)}`, { method: 'DELETE' });
    fetchArchivos();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const resetForm = () => {
    setForm({ titulo: '', descripcion: '', tipo: 'publicacion', plataforma: '', fecha_inicio: '', fecha_fin: '', estado: 'borrador', contenido: '', resultado: '' });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.titulo) { alert('Título es obligatorio'); return; }
    try {
      const res = await fetch('/api/admin/mercadeo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, created_by: user?.id })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setShowForm(false);
      resetForm();
      fetchData();
    } catch (e: any) { alert('Error: ' + e.message); }
  };

  const handleEdit = (item: Mercadeo) => {
    setEditingId(item.id);
    setForm({
      titulo: item.titulo, descripcion: item.descripcion || '', tipo: item.tipo,
      plataforma: item.plataforma || '', fecha_inicio: item.fecha_inicio || '',
      fecha_fin: item.fecha_fin || '', estado: item.estado, contenido: item.contenido || '',
      resultado: item.resultado || ''
    });
    setShowForm(true);
  };

  const handleUpdate = async () => {
    if (!form.titulo || !editingId) { alert('Título es obligatorio'); return; }
    try {
      const res = await fetch('/api/admin/mercadeo', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, id: editingId })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setShowForm(false);
      resetForm();
      fetchData();
    } catch (e: any) { alert('Error: ' + e.message); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta publicación?')) return;
    await fetch(`/api/admin/mercadeo?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  const tipoColors: Record<string, string> = {
    publicacion: 'bg-blue-100 text-blue-800', campana: 'bg-purple-100 text-purple-800',
    evento: 'bg-green-100 text-green-800', otro: 'bg-gray-100 text-gray-800'
  };
  const estadoColors: Record<string, string> = {
    borrador: 'bg-gray-100 text-gray-700', publicado: 'bg-green-100 text-green-800',
    programado: 'bg-blue-100 text-blue-800', finalizado: 'bg-yellow-100 text-yellow-800'
  };

  const filtered = filtro === 'todos' ? items : items.filter(i => i.estado === filtro);

  if (!mounted || loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-500">Cargando...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-600">← Volver</Link>
            <h1 className="text-xl font-bold text-gray-800">📣 Mercadeo</h1>
          </div>
          <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); else { resetForm(); } }}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${showForm ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
            {showForm ? 'Cancelar' : '+ Nueva Publicación'}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Formulario */}
        {showForm && (
          <div className="bg-white p-4 rounded-xl shadow border border-indigo-200 mb-6">
            <h3 className="font-bold text-sm text-gray-800 mb-3">{editingId ? '✏️ Editar Publicación' : 'Nueva Publicación'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-600 font-medium">Título *</label>
                <input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})}
                  className="w-full px-2 py-1.5 border rounded text-xs mt-0.5" placeholder="Ej: Campaña de bienvenida" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Tipo</label>
                <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}
                  className="w-full px-2 py-1.5 border rounded text-xs mt-0.5">
                  <option value="publicacion">Publicación</option>
                  <option value="campana">Campaña</option>
                  <option value="evento">Evento</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Plataforma</label>
                <input value={form.plataforma} onChange={e => setForm({...form, plataforma: e.target.value})}
                  className="w-full px-2 py-1.5 border rounded text-xs mt-0.5" placeholder="Instagram, Facebook..." />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Fecha Inicio</label>
                <input type="date" value={form.fecha_inicio} onChange={e => setForm({...form, fecha_inicio: e.target.value})}
                  className="w-full px-2 py-1.5 border rounded text-xs mt-0.5" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Fecha Fin</label>
                <input type="date" value={form.fecha_fin} onChange={e => setForm({...form, fecha_fin: e.target.value})}
                  className="w-full px-2 py-1.5 border rounded text-xs mt-0.5" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Estado</label>
                <select value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}
                  className="w-full px-2 py-1.5 border rounded text-xs mt-0.5">
                  <option value="borrador">Borrador</option>
                  <option value="publicado">Publicado</option>
                  <option value="programado">Programado</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs text-gray-600 font-medium">Descripción</label>
              <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} rows={2}
                className="w-full px-2 py-1.5 border rounded text-xs mt-0.5 resize-none" placeholder="Descripción de la publicación..." />
            </div>
            <div className="mt-3">
              <label className="text-xs text-gray-600 font-medium">Contenido / Texto de la publicación</label>
              <textarea value={form.contenido} onChange={e => setForm({...form, contenido: e.target.value})} rows={3}
                className="w-full px-2 py-1.5 border rounded text-xs mt-0.5 resize-none" placeholder="Texto que se publicará..." />
            </div>
            <div className="mt-3">
              <label className="text-xs text-gray-600 font-medium">Resultado / Observaciones</label>
              <textarea value={form.resultado} onChange={e => setForm({...form, resultado: e.target.value})} rows={2}
                className="w-full px-2 py-1.5 border rounded text-xs mt-0.5 resize-none" placeholder="Resultado de la publicación, métricas, observaciones..." />
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={editingId ? handleUpdate : handleSave} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium">
                {editingId ? 'Guardar Cambios' : 'Guardar Publicación'}
              </button>
              {editingId && (
                <button onClick={() => { setShowForm(false); resetForm(); }} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm font-medium">
                  Cancelar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 mb-4">
          {['todos', 'borrador', 'publicado', 'programado', 'finalizado'].map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${filtro === f ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Archivos del plan de mercadeo */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <button onClick={() => setShowArchivos(!showArchivos)}
            className="w-full px-4 py-3 flex items-center justify-between text-left">
            <div className="flex items-center gap-2">
              <span className="text-lg">📎</span>
              <span className="font-bold text-sm text-gray-800">Archivos del Plan de Mercadeo</span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">{archivos.length}</span>
            </div>
            <span className="text-gray-400 text-xs">{showArchivos ? '▲ Ocultar' : '▼ Mostrar'}</span>
          </button>
          {showArchivos && (
            <div className="border-t px-4 pb-4">
              <div className="mt-3 flex items-center gap-3">
                <label className={`px-4 py-2 rounded-lg text-xs font-medium text-white cursor-pointer transition-colors ${subiendo ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                  {subiendo ? '⏳ Subiendo...' : '📁 Subir archivo (Excel, PDF, Word, imagen)'}
                  <input type="file" className="hidden" onChange={handleUpload}
                    accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.png,.jpg,.jpeg" disabled={subiendo} />
                </label>
                <span className="text-xs text-gray-400">Formatos: XLSX, XLS, CSV, PDF, DOC, DOCX, PNG, JPG</span>
              </div>
              {archivos.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {archivos.map(a => (
                    <div key={a.name} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {a.name.endsWith('.xlsx') || a.name.endsWith('.xls') ? '📊' :
                           a.name.endsWith('.pdf') ? '📄' :
                           a.name.endsWith('.doc') || a.name.endsWith('.docx') ? '📝' : '🖼️'}
                        </span>
                        <div>
                          <a href={`/uploads/mercadeo/${encodeURIComponent(a.name)}`} target="_blank" rel="noopener noreferrer"
                            className="text-sm font-medium text-indigo-700 hover:underline">
                            {a.name.replace(/^\d+_/, '')}
                          </a>
                          <p className="text-xs text-gray-400">{formatSize(a.size)} • {new Date(a.created).toLocaleDateString('es-MX')}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <a href={`/uploads/mercadeo/${encodeURIComponent(a.name)}`} target="_blank" rel="noopener noreferrer"
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">Abrir</a>
                        <button onClick={() => handleDeleteArchivo(a.name)}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">Eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-gray-400 text-center py-4">No hay archivos subidos. Sube el plan de mercadeo en Excel u otros formatos.</p>
              )}
            </div>
          )}
        </div>

        {/* Recordatorios de Correo */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <button onClick={() => { setShowRecordatorios(!showRecordatorios); if (!showRecordatorios) fetchRecordatorios(); }}
            className="w-full px-4 py-3 flex items-center justify-between text-left">
            <div className="flex items-center gap-2">
              <span className="text-lg">📧</span>
              <span className="font-bold text-sm text-gray-800">Recordatorios de Sesión (Correo 24h antes)</span>
              {recordatoriosPendientes.length > 0 && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">{recordatoriosPendientes.length} pendientes</span>
              )}
            </div>
            <span className="text-gray-400 text-xs">{showRecordatorios ? '▲ Ocultar' : '▼ Mostrar'}</span>
          </button>
          {showRecordatorios && (
            <div className="border-t px-4 pb-4">
              <div className="mt-3 flex items-center gap-3">
                <button onClick={generarRecordatorios} disabled={loadingRecordatorios}
                  className={`px-4 py-2 rounded-lg text-xs font-medium text-white ${loadingRecordatorios ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                  {loadingRecordatorios ? '⏳ Buscando...' : '🔍 Buscar sesiones de mañana'}
                </button>
                <button onClick={enviarRecordatorios} disabled={enviandoRecordatorios || recordatoriosPendientes.length === 0}
                  className={`px-4 py-2 rounded-lg text-xs font-medium text-white ${enviandoRecordatorios ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}>
                  {enviandoRecordatorios ? '⏳ Enviando...' : `📨 Enviar ${recordatoriosPendientes.length} pendientes`}
                </button>
                <button onClick={fetchHistorialRecordatorios}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200">
                  📋 Ver historial
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Los recordatorios se generan automáticamente para sesiones programadas 24h en adelante. El correo incluye fecha, psicóloga y recordatorio de pago ($750 MXN).
              </p>

              {recordatoriosPendientes.length > 0 && (
                <div className="mt-3 space-y-2">
                  {recordatoriosPendientes.map((r: any) => (
                    <div key={r.id} className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-800">{r.paciente_nombre} {r.paciente_apellido}</p>
                        <p className="text-[10px] text-gray-500">Sesión: {r.fecha_sesion} • Psicóloga: {r.psicologa_nombre} {r.psicologa_apellido}</p>
                        <p className="text-[10px] text-gray-500">📧 {r.email_paciente || 'Sin email registrado'}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-semibold">Pendiente</span>
                    </div>
                  ))}
                </div>
              )}
              {recordatoriosPendientes.length === 0 && !loadingRecordatorios && (
                <p className="mt-3 text-xs text-gray-400 text-center py-2">No hay recordatorios pendientes para mañana</p>
              )}

              {historialRecordatorios.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-gray-600 mb-2">📋 Historial de Enviados</h4>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {historialRecordatorios.map((r: any) => (
                      <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-1.5 text-[10px]">
                        <div>
                          <span className="font-medium">{r.paciente_nombre} {r.paciente_apellido}</span>
                          <span className="text-gray-400 ml-2">{r.fecha_sesion}</span>
                        </div>
                        <span className={r.enviado ? 'text-green-600 font-semibold' : 'text-red-500'}>
                          {r.enviado ? '✅ Enviado' : r.error ? `❌ Error: ${r.error}` : '⏳ Pendiente'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lista */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-sm text-gray-800">{item.titulo}</h3>
                  <p className="text-xs text-gray-400">{item.autor_nombre} {item.autor_apellido} • {new Date(item.created_at).toLocaleDateString('es-MX')}</p>
                </div>
                <div className="flex gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tipoColors[item.tipo] || 'bg-gray-100'}`}>{item.tipo}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${estadoColors[item.estado] || 'bg-gray-100'}`}>{item.estado}</span>
                </div>
              </div>
              {item.plataforma && <p className="text-xs text-gray-500 mb-1">📱 {item.plataforma}</p>}
              {item.descripcion && <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.descripcion}</p>}
              {item.resultado && <p className="text-xs text-gray-500 mb-2 italic line-clamp-2">📊 {item.resultado}</p>}
              {item.fecha_inicio && <p className="text-xs text-gray-400">📅 {item.fecha_inicio}{item.fecha_fin ? ` → ${item.fecha_fin}` : ''}</p>}
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleEdit(item)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">Editar</button>
                <button onClick={() => handleDelete(item.id)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <p className="text-center text-gray-400 py-8">Sin publicaciones</p>}
      </div>
    </div>
  );
}
