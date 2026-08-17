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

function DiplomasContent() {
  const searchParams = useSearchParams();
  const tallerId = searchParams.get('taller');
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tallerId) {
      fetch(`/api/talleres/diplomas?taller_id=${tallerId}`)
        .then(r => r.json())
        .then(data => { setDiplomas(Array.isArray(data) ? data : []); setLoading(false); })
        .catch(() => { setLoading(false); });
    } else {
      setLoading(false);
    }
  }, [tallerId]);

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
      win.document.write(`<html><head><title>Diplomas</title></head><body style="margin:0;">${contenido}</body></html>`);
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
      </div>`;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<html><head><title>Diploma - ${d.nombre_adolescente}</title></head><body style="margin:0;">${contenido}</body></html>`);
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
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-4">
        {diplomas.length > 0 && (
          <div className="mb-4">
            <button onClick={handleImprimirTodos} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700">
              Imprimir Todos ({diplomas.length})
            </button>
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
