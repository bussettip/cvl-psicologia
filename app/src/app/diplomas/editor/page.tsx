'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface TextBlock {
  id: string;
  label: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: string;
  fontStyle: string;
  preview: string;
}

const DEFAULT_CONFIG: TextBlock[] = [
  { id: 'nombre_adolescente', label: 'Nombre Adolescente', x: 50, y: 40, fontSize: 32, color: '#222222', fontWeight: 'bold', fontStyle: 'italic', preview: 'María García López' },
  { id: 'nombre_padre', label: 'Nombre Padre/Tutor', x: 50, y: 55, fontSize: 28, color: '#222222', fontWeight: 'bold', fontStyle: 'italic', preview: 'Juan García Ruiz' },
  { id: 'titulo_taller', label: 'Título Taller', x: 50, y: 68, fontSize: 16, color: '#333333', fontWeight: 'bold', fontStyle: 'normal', preview: 'Aprendiendo a volar' },
  { id: 'fecha_taller', label: 'Fecha', x: 50, y: 80, fontSize: 13, color: '#555555', fontWeight: 'normal', fontStyle: 'normal', preview: 'domingo 23 de agosto del 2026' },
];

function EditorContent() {
  const searchParams = useSearchParams();
  const tallerId = searchParams.get('taller');
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [template, setTemplate] = useState('');
  const [blocks, setBlocks] = useState<TextBlock[]>(DEFAULT_CONFIG);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [tallerTitle, setTallerTitle] = useState('');
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!tallerId) return;
    fetch(`/api/talleres/diploma-config?taller_id=${tallerId}`)
      .then(r => r.json())
      .then(data => {
        if (data.template) setTemplate(data.template);
        if (data.config && Array.isArray(data.config)) setBlocks(data.config);
        fetch(`/api/admin/talleres`)
          .then(r => r.json())
          .then(d => {
            const t = (d.talleres || []).find((t: any) => String(t.id) === String(tallerId));
            if (t) setTallerTitle(t.titulo);
          });
      });
  }, [tallerId]);

  const handleImgLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
  }, []);

  const toPercent = useCallback((clientX: number, clientY: number) => {
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 50, y: 50 };
    return {
      x: Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100)),
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, blockId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(blockId);
    setSelectedBlock(blockId);
    const pos = toPercent(e.clientX, e.clientY);
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      setDragOffset({ x: pos.x - block.x, y: pos.y - block.y });
    }
  }, [blocks, toPercent]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const pos = toPercent(e.clientX, e.clientY);
    setBlocks(prev => prev.map(b =>
      b.id === dragging ? { ...b, x: pos.x - dragOffset.x, y: pos.y - dragOffset.y } : b
    ));
  }, [dragging, dragOffset, toPercent]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handleSave = async () => {
    if (!tallerId) return;
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/talleres/diploma-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taller_id: tallerId, config: blocks }),
      });
      const data = await res.json();
      if (data.ok) setMsg('Posiciones guardadas correctamente');
      else setMsg(data.error || 'Error al guardar');
    } catch {
      setMsg('Error al guardar');
    }
    setSaving(false);
  };

  const handleUploadTemplate = async () => {
    if (!uploadedFile || !tallerId) return;
    setSaving(true);
    setMsg('');
    try {
      const fd = new FormData();
      fd.append('file', uploadedFile);
      fd.append('taller_id', tallerId);
      const res = await fetch('/api/talleres/diploma-template', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.ok) {
        setTemplate(data.path);
        setMsg('Plantilla subida correctamente');
      } else {
        setMsg(data.error || 'Error al subir');
      }
    } catch {
      setMsg('Error al subir plantilla');
    }
    setSaving(false);
  };

  const updateBlock = (id: string, field: keyof TextBlock, value: any) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const selected = blocks.find(b => b.id === selectedBlock);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/talleres" className="text-gray-400 hover:text-gray-600">← Volver</Link>
            <h1 className="text-xl font-bold text-gray-800">Editor de Diploma</h1>
            {tallerTitle && <span className="text-sm text-gray-500">— {tallerTitle}</span>}
          </div>
          <div className="flex items-center gap-2">
            {msg && <span className={`text-sm ${msg.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>{msg}</span>}
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar Posiciones'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex gap-0" style={{ height: 'calc(100vh - 56px)' }}>
        {/* Panel lateral: controles */}
        <div className="w-72 bg-white border-r overflow-y-auto p-4 space-y-4 flex-shrink-0">
          <div>
            <h3 className="font-bold text-xs text-gray-800 mb-2">Plantilla de Fondo</h3>
            <input type="file" accept=".png,.jpg,.jpeg,.bmp,.pdf" ref={fileInputRef} className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) {
                  setUploadedFile(f);
                  setPreviewUrl(URL.createObjectURL(f));
                }
              }} />
            <button onClick={() => fileInputRef.current?.click()}
              className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200">
              {template ? 'Cambiar Plantilla' : 'Subir Plantilla de Fondo'}
            </button>
            {uploadedFile && (
              <button onClick={handleUploadTemplate} disabled={saving}
                className="w-full mt-2 px-3 py-2 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700">
                {saving ? 'Subiendo...' : `Subir: ${uploadedFile.name}`}
              </button>
            )}
            {template && (
              <p className="text-xs text-gray-500 mt-1 truncate">Actual: {template}</p>
            )}
          </div>

          <hr />

          {/* Bloques de texto */}
          <div>
            <h3 className="font-bold text-xs text-gray-800 mb-2">Elementos de Texto</h3>
            <p className="text-xs text-gray-400 mb-2">Arrastra sobre la imagen para posicionar</p>
            <div className="space-y-1">
              {blocks.map(b => (
                <button key={b.id} onClick={() => setSelectedBlock(b.id)}
                  className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-colors ${selectedBlock === b.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Editor del bloque seleccionado */}
          {selected && (
            <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
              <h4 className="font-bold text-xs text-gray-800">{selected.label}</h4>
              <div>
                <label className="text-xs text-gray-500">Tamaño fuente</label>
                <input type="range" min="8" max="60" value={selected.fontSize}
                  onChange={e => updateBlock(selected.id, 'fontSize', Number(e.target.value))}
                  className="w-full" />
                <span className="text-xs text-gray-600">{selected.fontSize}px</span>
              </div>
              <div>
                <label className="text-xs text-gray-500">Color</label>
                <input type="color" value={selected.color}
                  onChange={e => updateBlock(selected.id, 'color', e.target.value)}
                  className="w-full h-8 rounded cursor-pointer" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Estilo</label>
                <div className="flex gap-1">
                  <button onClick={() => updateBlock(selected.id, 'fontWeight', selected.fontWeight === 'bold' ? 'normal' : 'bold')}
                    className={`px-2 py-1 rounded text-xs ${selected.fontWeight === 'bold' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>B</button>
                  <button onClick={() => updateBlock(selected.id, 'fontStyle', selected.fontStyle === 'italic' ? 'normal' : 'italic')}
                    className={`px-2 py-1 rounded text-xs ${selected.fontStyle === 'italic' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>I</button>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-500">X%</label>
                  <input type="number" min="0" max="100" step="0.5" value={Math.round(selected.x * 10) / 10}
                    onChange={e => updateBlock(selected.id, 'x', Number(e.target.value))}
                    className="w-full px-2 py-1 border rounded text-xs" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Y%</label>
                  <input type="number" min="0" max="100" step="0.5" value={Math.round(selected.y * 10) / 10}
                    onChange={e => updateBlock(selected.id, 'y', Number(e.target.value))}
                    className="w-full px-2 py-1 border rounded text-xs" />
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
            <p className="font-bold mb-1">Instrucciones:</p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>Sube la imagen de fondo del diploma</li>
              <li>Haz clic en un elemento de texto</li>
              <li>Arrástralo sobre la imagen a la posición deseada</li>
              <li>Ajusta tamaño, color y estilo</li>
              <li>Guarda las posiciones</li>
            </ol>
          </div>
        </div>

        {/* Área del diploma */}
        <div ref={containerRef} className="flex-1 overflow-auto bg-gray-200 flex items-center justify-center p-8"
          onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>

          {template ? (
            <div className="relative inline-block shadow-2xl" style={{ maxWidth: '100%', maxHeight: '100%' }}>
              <img ref={imgRef} src={previewUrl || template} alt="Diploma" onLoad={handleImgLoad}
                className="max-w-full max-h-[80vh] select-none" draggable={false}
                onMouseDown={(e) => {
                  if (dragging) return;
                  setSelectedBlock(null);
                }} />

              {/* Bloques de texto superpuestos */}
              {blocks.map(b => (
                <div key={b.id}
                  onMouseDown={(e) => handleMouseDown(e, b.id)}
                  className={`absolute cursor-move select-none transition-shadow ${dragging === b.id ? 'ring-2 ring-indigo-500 z-50' : selectedBlock === b.id ? 'ring-2 ring-indigo-300 z-40' : 'hover:ring-1 hover:ring-indigo-200'}`}
                  style={{
                    left: `${b.x}%`,
                    top: `${b.y}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: `${b.fontSize}px`,
                    color: b.color,
                    fontWeight: b.fontWeight,
                    fontStyle: b.fontStyle,
                    fontFamily: "'Times New Roman', Georgia, serif",
                    textShadow: '0 0 4px rgba(255,255,255,0.8), 0 0 8px rgba(255,255,255,0.5)',
                    whiteSpace: 'nowrap',
                    padding: '2px 4px',
                    borderRadius: '2px',
                  }}>
                  {b.preview}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <p className="text-lg mb-2">Sube una imagen de fondo para comenzar</p>
              <p className="text-sm">La imagen será el fondo del diploma. Arrastra el texto sobre ella.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DiplomaEditorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p className="text-gray-500">Cargando editor...</p></div>}>
      <EditorContent />
    </Suspense>
  );
}
