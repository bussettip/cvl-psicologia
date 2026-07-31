'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';


interface Mercadeo {
  id: number; titulo: string; descripcion: string; tipo: string; plataforma: string;
  fecha_inicio: string; fecha_fin: string; estado: string; contenido: string;
  resultado: string; autor_nombre: string; autor_apellido: string; created_at: string;
}
interface Presupuesto {
  id: number; titulo: string; descripcion: string; fecha: string;
  monto: number; archivo_url: string; archivo_nombre: string;
  estado: string; autor_nombre: string; autor_apellido: string; created_at: string;
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
  const [showPresupuestos, setShowPresupuestos] = useState(false);
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [showPresupuestoForm, setShowPresupuestoForm] = useState(false);
  const [presupuestoForm, setPresupuestoForm] = useState({ titulo: '', descripcion: '', fecha: '', monto: '' });
  const [presupuestoFile, setPresupuestoFile] = useState<File | null>(null);
  const [subiendoPresupuesto, setSubiendoPresupuesto] = useState(false);
  const [showRecordatorios, setShowRecordatorios] = useState(false);
  const [recordatoriosPendientes, setRecordatoriosPendientes] = useState<any[]>([]);
  const [historialRecordatorios, setHistorialRecordatorios] = useState<any[]>([]);
  const [loadingRecordatorios, setLoadingRecordatorios] = useState(false);
  const [enviandoRecordatorios, setEnviandoRecordatorios] = useState(false);

  const PLAN_TASKS = [
    { id: 'm1t1', month: 1, text: 'Definir temas de los 5 talleres terapéuticos y fechas tentativas' },
    { id: 'm1t2', month: 1, text: 'Crear calendario editorial para redes sociales (3 publicaciones/semana)' },
    { id: 'm1t3', month: 1, text: 'Diseñar flyers / imágenes promocionales por taller' },
    { id: 'm1t4', month: 1, text: 'Redactar descripciones y beneficios de cada taller' },
    { id: 'm1t5', month: 1, text: 'Configurar landing page / formulario de registro' },
    { id: 'm2t1', month: 2, text: 'Lanzar campaña en Facebook/Instagram Ads (público objetivo por taller)' },
    { id: 'm2t2', month: 2, text: 'Enviar newsletter / correo masivo a base de datos existente' },
    { id: 'm2t3', month: 2, text: 'Contactar aliados (psicólogas, clínicas, escuelas) para difusión cruzada' },
    { id: 'm2t4', month: 2, text: 'Publicar testimonios y casos de éxito en redes sociales' },
    { id: 'm2t5', month: 2, text: 'Ofrecer descuento por inscripción temprana (early bird)' },
    { id: 'm3t1', month: 3, text: 'Recordatorio de últimos lugares disponibles (urgencia/escases)' },
    { id: 'm3t2', month: 3, text: 'Enviar recordatorios personalizados a leads que no confirmaron' },
    { id: 'm3t3', month: 3, text: 'Ejecutar los 5 talleres y recolectar feedback' },
    { id: 'm3t4', month: 3, text: 'Publicar resumen / galería de fotos de los talleres' },
    { id: 'm3t5', month: 3, text: 'Medir resultados (asistencia, ingresos, leads nuevos, ROI) y documentar' },
  ];
  const [planChecked, setPlanChecked] = useState<Record<string, boolean>>({});
  const [showPlanAccion, setShowPlanAccion] = useState(false);

  useEffect(() => {
    try { const saved = localStorage.getItem('plan_accion_mercadeo'); if (saved) setPlanChecked(JSON.parse(saved)); } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('plan_accion_mercadeo', JSON.stringify(planChecked));
  }, [planChecked]);

  const togglePlanTask = (id: string) => setPlanChecked(p => ({ ...p, [id]: !p[id] }));
  const resetPlan = () => { if (confirm('¿Reiniciar plan de acción? Se borrarán todos los avances.')) setPlanChecked({}); };

  useEffect(() => {
    setMounted(true);
    fetch('/api/me').then(r => r.json()).then(data => {
      if (data.user) {
        if (data.user.rol !== 'supervisora' && data.user.rol !== 'lider') { window.location.href = '/'; return; }
        setUser(data.user);
        fetchData();
        fetchArchivos();
        fetchPresupuestos();
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

  const fetchPresupuestos = async () => {
    try {
      const res = await fetch('/api/mercadeo/presupuestos');
      const data = await res.json();
      setPresupuestos(data.presupuestos || []);
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

        {/* Presupuestos */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <button onClick={() => { setShowPresupuestos(!showPresupuestos); if (!showPresupuestos) fetchPresupuestos(); }}
            className="w-full px-4 py-3 flex items-center justify-between text-left">
            <div className="flex items-center gap-2">
              <span className="text-lg">💰</span>
              <span className="font-bold text-sm text-gray-800">Presupuestos</span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">{presupuestos.length}</span>
            </div>
            <div className="flex items-center gap-2">
              {showPresupuestos && (
                <button onClick={(e) => { e.stopPropagation(); setShowPresupuestoForm(true); }}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium">
                  + Nuevo
                </button>
              )}
              <span className="text-gray-400 text-xs">{showPresupuestos ? '▲ Ocultar' : '▼ Mostrar'}</span>
            </div>
          </button>
          {showPresupuestos && (
            <div className="border-t px-4 pb-4">
              {presupuestos.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No hay presupuestos registrados</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {presupuestos.map(p => (
                    <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800">{p.titulo}</span>
                          <span className="text-xs text-gray-400">📅 {new Date(p.fecha).toLocaleDateString('es-MX')}</span>
                          {p.monto && <span className="text-xs font-bold text-green-600">${Number(p.monto).toLocaleString('es-MX')}</span>}
                        </div>
                        {p.descripcion && <p className="text-xs text-gray-500 mt-0.5">{p.descripcion}</p>}
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {p.autor_nombre} {p.autor_apellido} • {new Date(p.created_at).toLocaleDateString('es-MX')}
                        </p>
                        {p.archivo_url && (
                          <a href={p.archivo_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-1 text-blue-600 hover:text-blue-800 text-[10px] font-medium">
                            📎 {p.archivo_nombre || 'Ver archivo'}
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {p.archivo_url && (
                          <a href={p.archivo_url} target="_blank" rel="noopener noreferrer"
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">Abrir</a>
                        )}
                        <button onClick={async () => {
                          if (!confirm('¿Eliminar este presupuesto?')) return;
                          await fetch(`/api/mercadeo/presupuestos?id=${p.id}`, { method: 'DELETE' });
                          fetchPresupuestos();
                        }} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">Eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>
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

        {/* Plan de Acción - 5 Talleres en 3 Meses */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <button onClick={() => setShowPlanAccion(!showPlanAccion)}
            className="w-full px-4 py-3 flex items-center justify-between text-left">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span className="font-bold text-sm text-gray-800">Plan de Acción — 5 Talleres en 3 Meses</span>
              {(() => { const total = PLAN_TASKS.length; const done = Object.values(planChecked).filter(Boolean).length; const pct = total ? Math.round(done/total*100) : 0; return (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${pct === 100 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {done}/{total} ({pct}%)
                </span>
              );})()}
            </div>
            <div className="flex items-center gap-2">
              {showPlanAccion && (
                <button onClick={(e) => { e.stopPropagation(); resetPlan(); }}
                  className="px-2 py-1 text-[10px] text-red-600 hover:bg-red-50 rounded font-medium" title="Reiniciar plan">
                  Reiniciar
                </button>
              )}
              <span className="text-gray-400 text-xs">{showPlanAccion ? '▲ Ocultar' : '▼ Mostrar'}</span>
            </div>
          </button>
          {showPlanAccion && (
            <div className="border-t">
              {(() => {
                const total = PLAN_TASKS.length;
                const done = Object.values(planChecked).filter(Boolean).length;
                const pct = total ? Math.round(done/total*100) : 0;
                return (
                  <div className="px-4 pt-4 pb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className={`h-2.5 rounded-full transition-all duration-500 ${pct === 100 ? 'bg-green-500' : 'bg-indigo-500'}`} style={{width: pct+'%'}}></div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 text-right">{pct}% completado</p>
                  </div>
                );
              })()}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-4 px-4 pb-4">
                {[1,2,3].map(mes => {
                  const monthTasks = PLAN_TASKS.filter(t => t.month === mes);
                  const monthDone = monthTasks.filter(t => planChecked[t.id]).length;
                  const monthPct = Math.round(monthDone/monthTasks.length*100);
                  const monthNames = ['Mes 1 — Preparación', 'Mes 2 — Promoción', 'Mes 3 — Cierre'];
                  const monthIcons = ['🚀', '📢', '🏁'];
                  return (
                    <div key={mes} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{monthIcons[mes-1]}</span>
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-gray-700">{monthNames[mes-1]}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${monthPct === 100 ? 'bg-green-400' : 'bg-indigo-400'}`} style={{width: monthPct+'%'}}></div>
                            </div>
                            <span className="text-[10px] text-gray-500">{monthDone}/{monthTasks.length}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {monthTasks.map(t => (
                          <label key={t.id} className={`flex items-start gap-2 p-1.5 rounded-lg cursor-pointer transition-colors ${planChecked[t.id] ? 'bg-green-50' : 'hover:bg-gray-100'}`}>
                            <input type="checkbox" checked={!!planChecked[t.id]} onChange={() => togglePlanTask(t.id)}
                              className="mt-0.5 w-3.5 h-3.5 accent-indigo-600 cursor-pointer" />
                            <span className={`text-xs leading-relaxed ${planChecked[t.id] ? 'text-green-700 line-through' : 'text-gray-700'}`}>{t.text}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Nuevo Presupuesto */}
        {showPresupuestoForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">💰 Nuevo Presupuesto</h3>
                  <button onClick={() => { setShowPresupuestoForm(false); setPresupuestoFile(null); }}
                    className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Título *</label>
                    <input value={presupuestoForm.titulo} onChange={e => setPresupuestoForm({...presupuestoForm, titulo: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Ej: Campaña Google Ads Q3" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Fecha *</label>
                      <input type="date" value={presupuestoForm.fecha} onChange={e => setPresupuestoForm({...presupuestoForm, fecha: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Monto (MXN)</label>
                      <input type="number" step="0.01" min="0" value={presupuestoForm.monto}
                        onChange={e => setPresupuestoForm({...presupuestoForm, monto: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
                    <textarea value={presupuestoForm.descripcion} onChange={e => setPresupuestoForm({...presupuestoForm, descripcion: e.target.value})}
                      rows={2} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" placeholder="Detalles del presupuesto..." />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Archivo (PDF, Excel, Word, imagen)</label>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx,.xls"
                      onChange={e => setPresupuestoFile(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 border rounded-lg text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
                    {presupuestoFile && <p className="text-xs text-green-600 mt-1">📎 {presupuestoFile.name}</p>}
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={async () => {
                    if (!presupuestoForm.titulo || !presupuestoForm.fecha) { alert('Título y fecha son obligatorios'); return; }
                    setSubiendoPresupuesto(true);
                    try {
                      let archivo_url = '';
                      let archivo_nombre = '';
                      if (presupuestoFile) {
                        const fd = new FormData();
                        fd.append('file', presupuestoFile);
                        const upRes = await fetch('/api/upload/presupuestos', { method: 'POST', body: fd });
                        if (!upRes.ok) { const d = await upRes.json(); throw new Error(d.error); }
                        const upData = await upRes.json();
                        archivo_url = upData.url;
                        archivo_nombre = upData.nombre || presupuestoFile.name;
                      }
                      const res = await fetch('/api/mercadeo/presupuestos', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          ...presupuestoForm, monto: presupuestoForm.monto ? Number(presupuestoForm.monto) : null,
                          archivo_url, archivo_nombre, created_by: user?.id
                        })
                      });
                      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
                      setShowPresupuestoForm(false);
                      setPresupuestoForm({ titulo: '', descripcion: '', fecha: '', monto: '' });
                      setPresupuestoFile(null);
                      fetchPresupuestos();
                    } catch (e: any) { alert('Error: ' + e.message); }
                    finally { setSubiendoPresupuesto(false); }
                  }} disabled={subiendoPresupuesto}
                    className={`flex-1 py-2 text-white rounded-lg text-sm font-medium ${subiendoPresupuesto ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
                    {subiendoPresupuesto ? '⏳ Guardando...' : '💰 Guardar Presupuesto'}
                  </button>
                  <button onClick={() => { setShowPresupuestoForm(false); setPresupuestoFile(null); }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
