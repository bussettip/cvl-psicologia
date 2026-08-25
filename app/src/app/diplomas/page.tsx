'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Diploma {
  id: number;
  taller_id: number;
  nombre_adolescente: string;
  nombre_padre: string | null;
  impreso: number;
  fecha_impresion: string | null;
  taller_titulo: string;
  taller_fecha: string;
}

interface TallerInfo {
  diploma_template: string | null;
  diploma_config: any;
  titulo: string;
  fecha: string;
  instructor: string;
  tema: string;
  descripcion: string;
}

function DiplomasContent() {
  const searchParams = useSearchParams();
  const tallerId = searchParams.get('taller');
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [loading, setLoading] = useState(true);
  const [tallerInfo, setTallerInfo] = useState<TallerInfo | null>(null);

  useEffect(() => {
    if (tallerId) {
      fetch(`/api/talleres/diplomas?taller_id=${tallerId}`)
        .then(r => r.json())
        .then(data => { setDiplomas(Array.isArray(data) ? data : []); setLoading(false); })
        .catch(() => { setLoading(false); });
      fetch(`/api/talleres/diploma-config?taller_id=${tallerId}`)
        .then(r => r.json())
        .then(async data => {
          const config = data.config;
          const tallerRes = await fetch(`/api/admin/talleres`);
          const tallerData = await tallerRes.json();
          const t = (tallerData.talleres || []).find((x: any) => String(x.id) === String(tallerId));
          if (t) {
            setTallerInfo({
              diploma_template: data.template,
              diploma_config: config,
              titulo: t.titulo,
              fecha: t.fecha,
              instructor: t.instructor || '',
              tema: t.tema || '',
              descripcion: t.descripcion || '',
            });
          }
        });
    } else {
      setLoading(false);
    }
  }, [tallerId]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]} del ${d.getFullYear()}`;
  };

  const buildDiplomaHTML = (d: Diploma) => {
    const info = tallerInfo;
    if (info?.diploma_template && info?.diploma_config) {
      const config = info.diploma_config;
      const blocks = Array.isArray(config) ? config : [];
      const textLayers = blocks.map((b: any) => {
        const isDynamic = ['nombre_adolescente', 'nombre_padre', 'titulo_taller', 'fecha_taller'].includes(b.id);
        let text = b.preview;
        if (b.id === 'nombre_adolescente') text = d.nombre_adolescente;
        if (b.id === 'nombre_padre') text = d.nombre_padre || '';
        if (b.id === 'titulo_taller') text = info.titulo || b.preview;
        if (b.id === 'fecha_taller') text = formatDate(info.fecha) || b.preview;
        return `<div style="position:absolute;left:${b.x}%;top:${b.y}%;transform:translate(-50%,-50%);font-size:${b.fontSize}px;color:${b.color};font-weight:${b.fontWeight};font-style:${b.fontStyle};font-family:'Times New Roman',Georgia,serif;white-space:nowrap;">${text}</div>`;
      }).join('\n');

      return `<div style="position:relative;width:210mm;height:297mm;page-break-after:always;overflow:hidden;">
        <img src="${info.diploma_template}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;" />
        ${textLayers}
      </div>`;
    }

    // Fallback: HTML hardcodeado sin plantilla
    return `<div style="width:210mm;height:297mm;padding:15mm;page-break-after:always;position:relative;font-family:'Times New Roman',serif;">
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:80%;">
        <div style="font-size:16px;font-weight:bold;color:#333;margin-bottom:12px;">Otorga el presente RECONOCIMIENTO</div>
        <div style="font-size:13px;color:#333;margin-bottom:6px;">a la extraordinaria piloto:</div>
        <div style="font-size:28px;font-weight:bold;font-style:italic;color:#222;margin:20px 0;padding:8px 20px;border-bottom:2px solid #666;">${d.nombre_adolescente}</div>
        <div style="font-size:13px;color:#333;margin-bottom:6px;">y su gran Torre de Control:</div>
        <div style="font-size:28px;font-weight:bold;font-style:italic;color:#222;margin:20px 0;padding:8px 20px;border-bottom:2px solid #666;">${d.nombre_padre || ''}</div>
        <div style="font-size:13px;color:#333;margin-top:16px;">su participación en el taller</div>
        <div style="font-size:16px;font-weight:bold;color:#333;margin:8px 0;">"${info?.titulo || 'Taller'}"</div>
        ${info?.descripcion ? `<div style="font-size:12px;color:#555;">${info.descripcion}</div>` : ''}
        <div style="font-size:13px;color:#333;margin-top:8px;">${formatDate(info?.fecha || '')}</div>
        ${info?.instructor ? `<div style="margin-top:40px;"><div style="border-top:1px solid #333;width:250px;margin:0 auto;padding-top:5px;font-size:13px;font-weight:bold;">${info.instructor}</div></div>` : ''}
      </div>
    </div>`;
  };

  const handleImprimirTodos = () => {
    if (diplomas.length === 0) return;
    const hasTemplate = tallerInfo?.diploma_template && tallerInfo?.diploma_config;
    const contenido = diplomas.map(d => buildDiplomaHTML(d)).join('');
    const styles = hasTemplate
      ? `@page{size:landscape;margin:0;}body{margin:0;}`
      : `@page{size:A4 portrait;margin:0;}body{margin:0;}`;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<html><head><title>Diplomas - ${tallerInfo?.titulo || ''}</title><style>${styles}</style></head><body>${contenido}</body></html>`);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  };

  const handleImprimirUno = (d: Diploma) => {
    const contenido = buildDiplomaHTML(d);
    const hasTemplate = tallerInfo?.diploma_template && tallerInfo?.diploma_config;
    const styles = hasTemplate
      ? `@page{size:landscape;margin:0;}body{margin:0;}`
      : `@page{size:A4 portrait;margin:0;}body{margin:0;}`;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<html><head><title>Diploma - ${d.nombre_adolescente}</title><style>${styles}</style></head><body>${contenido}</body></html>`);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-500">Cargando diplomas...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/talleres" className="text-gray-400 hover:text-gray-600">← Volver a Talleres</Link>
          <h1 className="text-xl font-bold text-gray-800">Diplomas</h1>
          {tallerInfo && <span className="text-sm text-gray-500">— {tallerInfo.titulo}</span>}
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-4">
        {tallerId && (
          <div className="mb-4 flex gap-2 flex-wrap">
            {diplomas.length > 0 && (
              <button onClick={handleImprimirTodos} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700">
                Imprimir Todos ({diplomas.length})
              </button>
            )}
            <Link href={`/diplomas/editor?taller=${tallerId}`}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
              {tallerInfo?.diploma_template ? 'Editar Posiciones del Diploma' : 'Configurar Diploma'}
            </Link>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          {diplomas.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No hay diplomas generados para este taller</p>
          ) : (
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
                        <button onClick={() => handleImprimirUno(d)} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200">
                          Imprimir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DiplomasPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p className="text-gray-500">Cargando...</p></div>}>
      <DiplomasContent />
    </Suspense>
  );
}
