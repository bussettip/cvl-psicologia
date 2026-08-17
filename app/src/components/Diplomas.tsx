'use client';

import { useState, useEffect, useRef } from 'react';

interface Taller {
  id: number;
  titulo: string;
  fecha: string;
  capacidad: number;
  inscritos: number;
  estado: string;
  diploma_template: string | null;
}

interface Participante {
  id: number;
  taller_id: number;
  nombre_adolescente: string;
  nombre_padre: string | null;
  cantidad_pagada: number;
  correo: string | null;
  whatsapp: string | null;
}

interface Diploma {
  id: number;
  taller_id: number;
  participante_id: number;
  nombre_adolescente: string;
  nombre_padre: string | null;
  impreso: number;
  fecha_impresion: string | null;
  taller_titulo: string;
  taller_fecha: string;
}

export default function Diplomas() {
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [tallerSeleccionado, setTallerSeleccionado] = useState<number | null>(null);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/talleres')
      .then(r => r.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setTalleres(arr.filter((t: Taller) => t.estado === 'activo' || t.estado === 'completado'));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (tallerSeleccionado) {
      cargarDatos(tallerSeleccionado);
    }
  }, [tallerSeleccionado]);

  const cargarDatos = async (tallerId: number) => {
    setLoading(true);
    try {
      const [pRes, dRes] = await Promise.all([
        fetch(`/api/talleres/participantes?taller_id=${tallerId}`),
        fetch(`/api/talleres/diplomas?taller_id=${tallerId}`),
      ]);
      const pData = await pRes.json();
      const dData = await dRes.json();
      setParticipantes(Array.isArray(pData) ? pData : []);
      setDiplomas(Array.isArray(dData) ? dData : []);
    } catch {
      setMsg('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tallerSeleccionado) return;

    setUploading(true);
    setMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('taller_id', String(tallerSeleccionado));

      const res = await fetch('/api/talleres/participantes/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.ok) {
        setMsg(`${data.imported} participantes importados correctamente`);
        cargarDatos(tallerSeleccionado);
      } else {
        setMsg(data.error || 'Error al importar');
      }
    } catch {
      setMsg('Error al subir archivo');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleGenerarDiplomas = async () => {
    if (!tallerSeleccionado) return;
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('/api/talleres/diplomas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taller_id: tallerSeleccionado }),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg(`${data.generated} diplomas generados`);
        cargarDatos(tallerSeleccionado);
      } else {
        setMsg(data.error || 'Error al generar');
      }
    } catch {
      setMsg('Error al generar diplomas');
    } finally {
      setLoading(false);
    }
  };

  const handleImprimirTodos = () => {
    if (diplomas.length === 0) return;

    const contenido = diplomas.map(d => `
      <div style="width:210mm;height:297mm;padding:15mm;page-break-after:always;position:relative;font-family:'Times New Roman',serif;">
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:80%;">
          <div style="font-size:14px;color:#333;margin-bottom:8px;">El Centro VivirLibre.org</div>
          <div style="font-size:16px;font-weight:bold;color:#333;margin-bottom:12px;">Otorga el presente RECONOCIMIENTO</div>
          <div style="font-size:13px;color:#333;margin-bottom:6px;">a la extraordinaria piloto:</div>
          <div style="font-size:28px;font-weight:bold;font-style:italic;color:#222;margin:20px 0;padding:8px 20px;border-bottom:2px solid #666;">${d.nombre_adolescente}</div>
          <div style="font-size:13px;color:#333;margin-bottom:6px;">y su gran Torre de Control:</div>
          <div style="font-size:28px;font-weight:bold;font-style:italic;color:#222;margin:20px 0;padding:8px 20px;border-bottom:2px solid #666;">${d.nombre_padre || ''}</div>
          <div style="font-size:13px;color:#333;margin-top:16px;">su participación en el taller</div>
          <div style="font-size:16px;font-weight:bold;color:#333;margin:8px 0;">"Aprendiendo a volar"</div>
          <div style="font-size:12px;color:#555;">(inteligencia emocional y autoestima para adolescentes de 13 a 17 años)</div>
          <div style="font-size:12px;color:#555;margin-top:4px;">nivel introductorio</div>
          <div style="font-size:12px;color:#555;margin-top:8px;">Impartido por Gabriela de Moroso Bussetti y su equipo en el Centro VivirLibre.org campus CDMX el</div>
          <div style="font-size:13px;color:#333;margin-top:8px;">domingo 23 de agosto del 2026 de 10 a 18 horas.</div>
          <div style="margin-top:40px;">
            <div style="border-top:1px solid #333;width:250px;margin:0 auto;padding-top:5px;font-size:13px;font-weight:bold;">Gabriela Torres de Moroso Bussetti</div>
            <div style="font-size:11px;color:#555;">Psicoterapeuta y Directora General de CVL</div>
          </div>
        </div>
      </div>
    `).join('');

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<html><head><title>Diplomas - ${diplomas[0]?.taller_titulo || ''}</title></head><body style="margin:0;">${contenido}</body></html>`);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  };

  const handleImprimirUno = (d: Diploma) => {
    const contenido = `
      <div style="width:210mm;height:297mm;padding:15mm;position:relative;font-family:'Times New Roman',serif;">
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:80%;">
          <div style="font-size:14px;color:#333;margin-bottom:8px;">El Centro VivirLibre.org</div>
          <div style="font-size:16px;font-weight:bold;color:#333;margin-bottom:12px;">Otorga el presente RECONOCIMIENTO</div>
          <div style="font-size:13px;color:#333;margin-bottom:6px;">a la extraordinaria piloto:</div>
          <div style="font-size:28px;font-weight:bold;font-style:italic;color:#222;margin:20px 0;padding:8px 20px;border-bottom:2px solid #666;">${d.nombre_adolescente}</div>
          <div style="font-size:13px;color:#333;margin-bottom:6px;">y su gran Torre de Control:</div>
          <div style="font-size:28px;font-weight:bold;font-style:italic;color:#222;margin:20px 0;padding:8px 20px;border-bottom:2px solid #666;">${d.nombre_padre || ''}</div>
          <div style="font-size:13px;color:#333;margin-top:16px;">su participación en el taller</div>
          <div style="font-size:16px;font-weight:bold;color:#333;margin:8px 0;">"Aprendiendo a volar"</div>
          <div style="font-size:12px;color:#555;">(inteligencia emocional y autoestima para adolescentes de 13 a 17 años)</div>
          <div style="font-size:12px;color:#555;margin-top:4px;">nivel introductorio</div>
          <div style="font-size:12px;color:#555;margin-top:8px;">Impartido por Gabriela de Moroso Bussetti y su equipo en el Centro VivirLibre.org campus CDMX el</div>
          <div style="font-size:13px;color:#333;margin-top:8px;">domingo 23 de agosto del 2026 de 10 a 18 horas.</div>
          <div style="margin-top:40px;">
            <div style="border-top:1px solid #333;width:250px;margin:0 auto;padding-top:5px;font-size:13px;font-weight:bold;">Gabriela Torres de Moroso Bussetti</div>
            <div style="font-size:11px;color:#555;">Psicoterapeuta y Directora General de CVL</div>
          </div>
        </div>
      </div>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<html><head><title>Diploma - ${d.nombre_adolescente}</title></head><body style="margin:0;">${contenido}</body></html>`);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Diplomas de Talleres</h2>
      </div>

      {msg && (
        <div className={`p-3 rounded-lg text-sm ${msg.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {msg}
        </div>
      )}

      {/* Selector de taller */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Taller</label>
        <select
          value={tallerSeleccionado || ''}
          onChange={e => setTallerSeleccionado(Number(e.target.value) || null)}
          className="w-full md:w-96 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">-- Seleccionar taller --</option>
          {talleres.map(t => (
            <option key={t.id} value={t.id}>
              {t.titulo} - {new Date(t.fecha).toLocaleDateString('es-MX')} ({t.inscritos}/{t.capacidad})
            </option>
          ))}
        </select>
      </div>

      {tallerSeleccionado && (
        <>
          {/* Botones de acción */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex flex-wrap gap-3">
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleUploadExcel}
                className="hidden"
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? '⏳ Subiendo...' : '📁 Subir Excel de Participantes'}
              </button>
              <button
                onClick={handleGenerarDiplomas}
                disabled={loading || participantes.length === 0}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? '⏳ Generando...' : '🎓 Generar Diplomas'}
              </button>
              {diplomas.length > 0 && (
                <button
                  onClick={handleImprimirTodos}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2"
                >
                  🖨️ Imprimir Todos ({diplomas.length})
                </button>
              )}
            </div>
          </div>

          {/* Lista de participantes */}
          {participantes.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Participantes ({participantes.length})</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adolescente</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Padre/Madre/Tutor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pago</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {participantes.map((p, i) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.nombre_adolescente}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{p.nombre_padre || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">${p.cantidad_pagada}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{p.whatsapp || p.correo || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Lista de diplomas */}
          {diplomas.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Diplomas Generados ({diplomas.length})</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adolescente</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Padre/Madre/Tutor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {diplomas.map((d, i) => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{d.nombre_adolescente}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{d.nombre_padre || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${d.impreso ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {d.impreso ? 'Impreso' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleImprimirUno(d)}
                            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200"
                          >
                            🖨️ Imprimir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
