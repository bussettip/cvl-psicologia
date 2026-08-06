'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';


interface Paciente { id: number; nombre: string; apellido: string; telefono: string; }
interface Taller { id: number; titulo: string; fecha: string; hora_inicio: string; }
interface Usuario { id: number; nombre: string; apellido: string; rol: string; }
interface Cobro {
  id: number; paciente_id: number; paciente_nombre: string; paciente_apellido: string;
  tipo: string; concepto: string; sesion_id?: number; monto: number; metodo_pago: string;
  fecha: string; hora: string; estado: string; observaciones: string; created_at: string;
  taller_nombre?: string;
  confirmado_psicologa: boolean; confirmado_psicologa_id: number | null;
  confirmado_psicologa_fecha: string | null;
}
interface Entrega {
  id: number; psicologa_id: number; receptor_id: number; monto: number;
  fecha: string; hora: string; concepto: string; estado: string; observaciones: string;
  firma_digital: string | null; firma_fecha: string | null; firma_metodo: string | null;
  solicitante_nombre: string; solicitante_apellido: string;
  receptor_nombre: string; receptor_apellido: string;
}
interface Cita {
  id: number; paciente_id: number; psicologa_id: number; fecha: string;
  hora_inicio: string; hora_fin: string; tipo: string; estado: string;
  motivo: string; notas: string;
  paciente_nombre: string; paciente_apellido: string; paciente_telefono: string;
  psicologa_nombre: string; psicologa_apellido: string;
}
interface Gasto {
  id: number; solicitado_por: number; autorizado_por: number | null;
  proveedor: string; concepto: string; monto: number; metodo_pago: string;
  fecha: string; estado: string; observaciones: string; comprobante_url: string | null;
  firma_digital: string | null; firma_fecha: string | null; firma_metodo: string | null;
  solicitante_nombre: string; solicitante_apellido: string;
  autorizador_nombre: string; autorizador_apellido: string;
}
interface SolicitudFactura {
  id: number; paciente_id: number | null; paciente_nombre: string | null; concepto: string; cantidad: number; unidad: string;
  subtotal: number; iva: number; total: number; rfc_receptor: string; razon_social_receptor: string;
  regimen_fiscal_receptor: string; uso_cfdi: string; forma_pago: string; metodo_pago: string;
  estado: string; comentario_supervisora: string | null; serie: string | null; folio: number | null;
  uuid: string | null; xml_path: string | null; pdf_path: string | null; error_timbrado: string | null;
  created_at: string; solicitante_nombre: string | null; solicitante_apellido: string | null;
  validador_nombre: string | null; validador_apellido: string | null;
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MONTO_SESION = 750;

export default function RecepcionPage() {
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [libros, setLibros] = useState<any[]>([]);
  const [facturas, setFacturas] = useState<SolicitudFactura[]>([]);

  const [fechaActual, setFechaActual] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);
  const [showCobroForm, setShowCobroForm] = useState(false);
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1);
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'cobros'|'entregas'|'gastos'|'citas'|'facturas'>('cobros');

  const [cobroForm, setCobroForm] = useState({
    paciente_id: '', tipo: 'sesion', concepto: '', monto: MONTO_SESION.toString(),
    metodo_pago: 'efectivo', fecha: '', hora: '', observaciones: ''
  });
  const [showCorte, setShowCorte] = useState(false);
  const [corteFecha, setCorteFecha] = useState(new Date().toISOString().split('T')[0]);
  const [corteTaller, setCorteTaller] = useState('');
  const [corteData, setCorteData] = useState<{cobros: Cobro[], total: number, porMetodo: Record<string, number>, porTipo: Record<string, number>} | null>(null);

  const [showEntregaForm, setShowEntregaForm] = useState(false);
  const [entregaForm, setEntregaForm] = useState({ psicologa_id: '', receptor_id: '', monto: '', fecha: '', hora: '', concepto: '', observaciones: '' });

  const [showGastoForm, setShowGastoForm] = useState(false);
  const [gastoForm, setGastoForm] = useState({ solicitado_por: '', proveedor: '', concepto: '', monto: '', metodo_pago: 'efectivo', fecha: '', observaciones: '' });
  const [gastoFile, setGastoFile] = useState<File | null>(null);

  const [showFacturaForm, setShowFacturaForm] = useState(false);
  const [facturaForm, setFacturaForm] = useState({
    paciente_id: '', concepto: '', cantidad: '1', unidad: 'SERVICIO',
    subtotal: '', iva: '', total: '',
    rfc_receptor: 'XAXX010101000', razon_social_receptor: 'PUBLICO EN GENERAL',
    regimen_fiscal_receptor: '616', uso_cfdi: 'S01', forma_pago: '01', metodo_pago: 'PUE',
  });
  const [facturaIva, setFacturaIva] = useState(true);
  const [guardandoFactura, setGuardandoFactura] = useState(false);

  const [showCitaForm, setShowCitaForm] = useState(false);
  const [citaForm, setCitaForm] = useState({ paciente_id: '', psicologa_id: '', fecha: '', hora_inicio: '', hora_fin: '', tipo: 'sesion', motivo: '', notas: '' });
  const [citaBatch, setCitaBatch] = useState(false);
  const [citaBatchNum, setCitaBatchNum] = useState('4');
  const [citaBatchDias, setCitaBatchDias] = useState<string[]>([]);
  const [filtroFechaInicio, setFiltroFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [filtroFechaFin, setFiltroFechaFin] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0]; });

  const [citaVista, setCitaVista] = useState<'lista'|'calendario'>('lista');
  const [calFecha, setCalFecha] = useState(() => new Date().toISOString().split('T')[0]);

  const [showFirmaModal, setShowFirmaModal] = useState(false);
  const [firmaGastoId, setFirmaGastoId] = useState<number | null>(null);
  const [firmaEmail, setFirmaEmail] = useState('');
  const [firmaPassword, setFirmaPassword] = useState('');
  const [firmaError, setFirmaError] = useState('');

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authGastoId, setAuthGastoId] = useState<number | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [showEntregaFirmaModal, setShowEntregaFirmaModal] = useState(false);
  const [entregaFirmaId, setEntregaFirmaId] = useState<number | null>(null);
  const [entregaFirmaEmail, setEntregaFirmaEmail] = useState('');
  const [entregaFirmaPassword, setEntregaFirmaPassword] = useState('');
  const [entregaFirmaError, setEntregaFirmaError] = useState('');

  const [showEntregaAuthModal, setShowEntregaAuthModal] = useState(false);
  const [entregaAuthId, setEntregaAuthId] = useState<number | null>(null);
  const [entregaAuthEmail, setEntregaAuthEmail] = useState('');
  const [entregaAuthPassword, setEntregaAuthPassword] = useState('');
  const [entregaAuthError, setEntregaAuthError] = useState('');

  const isSupervisor = user && (user.rol === 'supervisora' || user.rol === 'supervisor' || user.rol === 'lider');

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

  useEffect(() => { loadData(); }, [filtroMes, filtroAnio]);

  const loadData = async () => {
    try {
      const [pRes, tRes, cRes, uRes, lRes] = await Promise.all([
        fetch('/api/pacientes'),
        fetch('/api/admin/talleres'),
        fetch(`/api/cobros?mes=${filtroMes}&anio=${filtroAnio}`),
        fetch('/api/admin/usuarios'),
        fetch('/api/libros')
      ]);
      const pData = await pRes.json();
      const tData = await tRes.json();
      const cData = await cRes.json();
      const uData = await uRes.json();
      const lData = await lRes.json();
      setPacientes(Array.isArray(pData) ? pData : pData.pacientes || []);
      setTalleres(tData.talleres || []);
      setCobros(cData.cobros || []);
      setUsuarios(Array.isArray(uData) ? uData : uData.usuarios || []);
      setLibros(lData.libros || []);
      loadEntregas();
      loadGastos();
      loadCitas();
      loadFacturas();
    } catch (e) { console.error(e); }
  };

  const loadEntregas = async () => {
    try {
      const res = await fetch(`/api/entregas?mes=${filtroMes}&anio=${filtroAnio}`);
      const data = await res.json();
      setEntregas(data.entregas || []);
    } catch (e) { console.error(e); }
  };

  const loadGastos = async () => {
    try {
      const res = await fetch(`/api/gastos?mes=${filtroMes}&anio=${filtroAnio}`);
      const data = await res.json();
      setGastos(data.gastos || []);
    } catch (e) { console.error(e); }
  };

  const loadFacturas = async () => {
    try {
      const res = await fetch(`/api/solicitudes-factura?mes=${filtroMes}&anio=${filtroAnio}`);
      const data = await res.json();
      setFacturas(data.solicitudes || []);
    } catch (e) { console.error(e); }
  };

  const loadCitas = async () => {
    try {
      const res = await fetch(`/api/citas?fecha_inicio=${filtroFechaInicio}&fecha_fin=${filtroFechaFin}`);
      const data = await res.json();
      setCitas(data.citas || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadCitas(); }, [filtroFechaInicio, filtroFechaFin]);

  const crearCita = async () => {
    if (!citaForm.paciente_id || !citaForm.psicologa_id || !citaForm.fecha || !citaForm.hora_inicio) {
      alert('Selecciona paciente, psicóloga, fecha y hora');
      return;
    }
    try {
      if (citaBatch && Number(citaBatchNum) > 0) {
        const baseDate = new Date(citaForm.fecha + 'T12:00:00');
        let creadas = 0;
        const errores: string[] = [];
        for (let i = 0; i < Number(citaBatchNum); i++) {
          const nextDate = new Date(baseDate);
          nextDate.setDate(nextDate.getDate() + (i * 7));
          const fechaStr = nextDate.toISOString().split('T')[0];
          const res = await fetch('/api/citas', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...citaForm, fecha: fechaStr, created_by: user?.id })
          });
          if (res.ok) creadas++;
          else { const d = await res.json(); errores.push(`${fechaStr}: ${d.error}`); }
        }
        let msg = `${creadas} de ${citaBatchNum} citas programadas`;
        if (errores.length > 0) msg += `\n\nErrores:\n${errores.join('\n')}`;
        alert(msg);
      } else {
        const res = await fetch('/api/citas', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...citaForm, created_by: user?.id })
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
        alert('Cita programada');
      }
      setShowCitaForm(false);
      setCitaForm({ paciente_id: '', psicologa_id: '', fecha: '', hora_inicio: '', hora_fin: '', tipo: 'sesion', motivo: '', notas: '' });
      setCitaBatch(false);
      setCitaBatchNum('4');
      loadCitas();
    } catch (e: any) { alert('Error: ' + e.message); }
  };

  const actualizarCita = async (id: number, estado: string) => {
    try {
      await fetch('/api/citas', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado })
      });
      loadCitas();
    } catch (e) { console.error(e); }
  };

  const cancelarCita = async (id: number) => {
    if (!confirm('¿Cancelar esta cita?')) return;
    try {
      await fetch('/api/citas', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado: 'cancelada' })
      });
      loadCitas();
    } catch (e) { console.error(e); }
  };

  const crearCobro = async () => {
    if (!cobroForm.paciente_id || !cobroForm.fecha || !cobroForm.monto) {
      alert('Selecciona paciente, fecha y monto');
      return;
    }
    try {
      const res = await fetch('/api/cobros', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cobroForm, monto: Number(cobroForm.monto), created_by: user?.id })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      alert('Cobro registrado');
      setShowCobroForm(false);
      setCobroForm({ paciente_id: '', tipo: 'sesion', concepto: '', monto: MONTO_SESION.toString(), metodo_pago: 'efectivo', fecha: '', hora: '', observaciones: '' });
      loadData();
    } catch (e: any) { alert('Error: ' + e.message); }
  };

  const crearEntrega = async () => {
    if (!entregaForm.psicologa_id || !entregaForm.receptor_id || !entregaForm.monto || !entregaForm.fecha) {
      alert('Selecciona psicóloga, receptor, monto y fecha');
      return;
    }
    if (entregaForm.receptor_id === entregaForm.psicologa_id) {
      alert('La psicóloga y el receptor deben ser personas diferentes');
      return;
    }
    try {
      const res = await fetch('/api/entregas', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...entregaForm, monto: Number(entregaForm.monto) })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      alert('Entrega registrada');
      setShowEntregaForm(false);
      setEntregaForm({ psicologa_id: '', receptor_id: '', monto: '', fecha: '', hora: '', concepto: '', observaciones: '' });
      loadEntregas();
    } catch (e: any) { alert('Error: ' + e.message); }
  };

  const confirmarEntrega = async (id: number) => {
    setEntregaAuthId(id);
    setEntregaAuthEmail('');
    setEntregaAuthPassword('');
    setEntregaAuthError('');
    setShowEntregaAuthModal(true);
  };

  const confirmarEntregaAuth = async () => {
    if (!entregaAuthEmail || !entregaAuthPassword) { setEntregaAuthError('Ingresa email y contraseña'); return; }
    try {
      const vr = await fetch('/api/verify-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: entregaAuthEmail, password: entregaAuthPassword })
      });
      const vd = await vr.json();
      if (!vr.ok || !vd.valid) { setEntregaAuthError(vd.error || 'Credenciales incorrectas'); return; }
      if (vd.usuario.rol !== 'supervisora' && vd.usuario.rol !== 'supervisor' && vd.usuario.rol !== 'lider') {
        setEntregaAuthError('Solo supervisora/líder pueden recibir dinero'); return;
      }
      await fetch('/api/entregas', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: entregaAuthId, estado: 'confirmada' })
      });
      setShowEntregaAuthModal(false);
      loadEntregas();
      alert('Entrega confirmada por ' + vd.usuario.nombre + ' ' + vd.usuario.apellido);
    } catch (e: any) { setEntregaAuthError('Error: ' + e.message); }
  };

  const firmarEntrega = (id: number) => {
    setEntregaFirmaId(id);
    setEntregaFirmaEmail('');
    setEntregaFirmaPassword('');
    setEntregaFirmaError('');
    setShowEntregaFirmaModal(true);
  };

  const confirmarFirmaEntrega = async () => {
    if (!entregaFirmaEmail || !entregaFirmaPassword) { setEntregaFirmaError('Ingresa email y contraseña'); return; }
    try {
      const vr = await fetch('/api/verify-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: entregaFirmaEmail, password: entregaFirmaPassword })
      });
      const vd = await vr.json();
      if (!vr.ok || !vd.valid) { setEntregaFirmaError(vd.error || 'Credenciales incorrectas'); return; }
      await fetch('/api/entregas', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: entregaFirmaId, firma_digital: `${vd.usuario.nombre} ${vd.usuario.apellido} (${vd.usuario.email})`, firma_metodo: 'password' })
      });
      setShowEntregaFirmaModal(false);
      loadEntregas();
      alert('Entrega firmada por ' + vd.usuario.nombre + ' ' + vd.usuario.apellido);
    } catch (e: any) { setEntregaFirmaError('Error: ' + e.message); }
  };

  const imprimirHardcopyEntrega = (e: Entrega) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Entrega de Dinero #${e.id}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 18px; }
        .header p { margin: 2px 0; font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        td { padding: 8px 12px; border: 1px solid #ccc; font-size: 13px; }
        td.label { background: #f5f5f5; font-weight: bold; width: 30%; }
        .signature-box { margin-top: 40px; display: flex; justify-content: space-between; gap: 40px; }
        .sig-block { flex: 1; text-align: center; }
        .sig-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 5px; font-size: 11px; }
        .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
        @media print { body { padding: 20px; } }
      </style>
    </head><body>
      <div class="header">
        <h1>ENTREGA DE DINERO</h1>
        <p>Clínica de Psicología — Sistema CRM</p>
        <p>Folio: #${e.id} | Fecha: ${e.fecha} ${e.hora || ''}</p>
      </div>
      <table>
        <tr><td class="label">Solicitante (quien entrega)</td><td>${e.solicitante_nombre} ${e.solicitante_apellido}</td></tr>
        <tr><td class="label">Receptor (quien recibe)</td><td>${e.receptor_nombre} ${e.receptor_apellido}</td></tr>
        <tr><td class="label">Monto</td><td><strong>$${Number(e.monto).toLocaleString('es-MX')} MXN</strong></td></tr>
        <tr><td class="label">Concepto</td><td>${e.concepto || 'Sin concepto'}</td></tr>
        <tr><td class="label">Estado</td><td>${e.estado.toUpperCase()}</td></tr>
        ${e.observaciones ? `<tr><td class="label">Observaciones</td><td>${e.observaciones}</td></tr>` : ''}
        ${e.firma_digital ? `<tr><td class="label">Firma Digital</td><td>✅ ${e.firma_digital} — ${e.firma_fecha || ''}</td></tr>` : ''}
      </table>
      <div class="signature-box">
        <div class="sig-block">
          <div class="sig-line">Firma del Solicitante<br/><small>${e.solicitante_nombre} ${e.solicitante_apellido}</small></div>
        </div>
        <div class="sig-block">
          <div class="sig-line">Firma del Receptor (Supervisora/Líder)<br/><small>${e.receptor_nombre} ${e.receptor_apellido}</small></div>
        </div>
      </div>
      <div class="footer">
        Documento generado el ${new Date().toLocaleDateString('es-MX')} ${new Date().toLocaleTimeString('es-MX')} — CRM Psicología
      </div>
      <script>window.onload=function(){window.print();}</script>
    </body></html>`);
    win.document.close();
  };

  const crearGasto = async () => {
    if (!gastoForm.solicitado_por || !gastoForm.concepto || !gastoForm.monto || !gastoForm.fecha) {
      alert('Selecciona solicitante, concepto, monto y fecha');
      return;
    }
    try {
      let comprobanteUrl = '';
      if (gastoFile) {
        const fd = new FormData();
        fd.append('file', gastoFile);
        fd.append('gasto_id', 'temp');
        const upRes = await fetch('/api/upload/factura', { method: 'POST', body: fd });
        if (!upRes.ok) { const d = await upRes.json(); throw new Error(d.error); }
        const upData = await upRes.json();
        comprobanteUrl = upData.url;
      }
      const res = await fetch('/api/gastos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...gastoForm, monto: Number(gastoForm.monto), comprobante_url: comprobanteUrl || null })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      alert('Gasto registrado');
      setShowGastoForm(false);
      setGastoForm({ solicitado_por: '', proveedor: '', concepto: '', monto: '', metodo_pago: 'efectivo', fecha: '', observaciones: '' });
      setGastoFile(null);
      loadGastos();
    } catch (e: any) { alert('Error: ' + e.message); }
  };

  const crearFactura = async () => {
    if (!facturaForm.concepto || !facturaForm.subtotal || !facturaForm.rfc_receptor || !facturaForm.razon_social_receptor) {
      alert('Completa concepto, subtotal, RFC y razón social del receptor');
      return;
    }
    setGuardandoFactura(true);
    try {
      const sub = Number(facturaForm.subtotal);
      const iva = facturaIva ? Math.round(sub * 0.16 * 100) / 100 : 0;
      const total = Math.round((sub + iva) * 100) / 100;
      const res = await fetch('/api/solicitudes-factura', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente_id: facturaForm.paciente_id ? Number(facturaForm.paciente_id) : null,
          concepto: facturaForm.concepto,
          cantidad: Number(facturaForm.cantidad || 1),
          unidad: facturaForm.unidad,
          subtotal: sub,
          iva,
          total,
          rfc_receptor: facturaForm.rfc_receptor,
          razon_social_receptor: facturaForm.razon_social_receptor,
          regimen_fiscal_receptor: facturaForm.regimen_fiscal_receptor,
          uso_cfdi: facturaForm.uso_cfdi,
          forma_pago: facturaForm.forma_pago,
          metodo_pago: facturaForm.metodo_pago,
        })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const d = await res.json();
      alert(`Solicitud de factura F${d.folio} creada. Queda pendiente de validación por la supervisora.`);
      setShowFacturaForm(false);
      setFacturaForm({
        paciente_id: '', concepto: '', cantidad: '1', unidad: 'SERVICIO',
        subtotal: '', iva: '', total: '',
        rfc_receptor: 'XAXX010101000', razon_social_receptor: 'PUBLICO EN GENERAL',
        regimen_fiscal_receptor: '616', uso_cfdi: 'S01', forma_pago: '01', metodo_pago: 'PUE',
      });
      setFacturaIva(true);
      loadFacturas();
    } catch (e: any) { alert('Error: ' + e.message); }
    setGuardandoFactura(false);
  };

  const autorizarGasto = async (id: number) => {
    setAuthGastoId(id);
    setAuthEmail('');
    setAuthPassword('');
    setAuthError('');
    setShowAuthModal(true);
  };

  const confirmarAutorizacion = async () => {
    if (!authEmail || !authPassword) { setAuthError('Ingresa email y contraseña'); return; }
    try {
      const vr = await fetch('/api/verify-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const vd = await vr.json();
      if (!vr.ok || !vd.valid) { setAuthError(vd.error || 'Credenciales incorrectas'); return; }
      if (vd.usuario.rol !== 'supervisora' && vd.usuario.rol !== 'supervisor' && vd.usuario.rol !== 'lider') {
        setAuthError('Solo supervisora/líder pueden autorizar gastos'); return;
      }
      await fetch('/api/gastos', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: authGastoId, estado: 'aprobado', autorizado_por: vd.usuario.id })
      });
      setShowAuthModal(false);
      loadGastos();
      alert('Gasto autorizado por ' + vd.usuario.nombre + ' ' + vd.usuario.apellido);
    } catch (e: any) { setAuthError('Error: ' + e.message); }
  };

  const firmarGasto = (id: number) => {
    setFirmaGastoId(id);
    setFirmaEmail('');
    setFirmaPassword('');
    setFirmaError('');
    setShowFirmaModal(true);
  };

  const confirmarFirma = async () => {
    if (!firmaEmail || !firmaPassword) { setFirmaError('Ingresa email y contraseña'); return; }
    try {
      const vr = await fetch('/api/verify-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: firmaEmail, password: firmaPassword })
      });
      const vd = await vr.json();
      if (!vr.ok || !vd.valid) { setFirmaError(vd.error || 'Credenciales incorrectas'); return; }
      await fetch('/api/gastos', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: firmaGastoId, firma_digital: `${vd.usuario.nombre} ${vd.usuario.apellido} (${vd.usuario.email})`, firma_metodo: 'password' })
      });
      setShowFirmaModal(false);
      loadGastos();
      alert('Gasto firmado digitalmente por ' + vd.usuario.nombre + ' ' + vd.usuario.apellido);
    } catch (e: any) { setFirmaError('Error: ' + e.message); }
  };

  const imprimirHardcopy = (g: Gasto) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Solicitud de Gasto #${g.id}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 18px; }
        .header p { margin: 2px 0; font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        td { padding: 8px 12px; border: 1px solid #ccc; font-size: 13px; }
        td.label { background: #f5f5f5; font-weight: bold; width: 30%; }
        .signature-box { margin-top: 40px; display: flex; justify-content: space-between; gap: 40px; }
        .sig-block { flex: 1; text-align: center; }
        .sig-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 5px; font-size: 11px; }
        .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
        @media print { body { padding: 20px; } }
      </style>
    </head><body>
      <div class="header">
        <h1>SOLICITUD DE GASTO DE CAJA CHICA</h1>
        <p>Clínica de Psicología — Sistema CRM</p>
        <p>Folio: #${g.id} | Fecha: ${g.fecha}</p>
      </div>
      <table>
        <tr><td class="label">Solicitante</td><td>${g.solicitante_nombre} ${g.solicitante_apellido}</td></tr>
        <tr><td class="label">Concepto</td><td>${g.concepto}</td></tr>
        ${g.proveedor ? `<tr><td class="label">Proveedor</td><td>${g.proveedor}</td></tr>` : ''}
        <tr><td class="label">Monto</td><td><strong>$${Number(g.monto).toLocaleString('es-MX')} MXN</strong></td></tr>
        <tr><td class="label">Método de Pago</td><td>${g.metodo_pago}</td></tr>
        <tr><td class="label">Estado</td><td>${g.estado.toUpperCase()}</td></tr>
        ${g.observaciones ? `<tr><td class="label">Observaciones</td><td>${g.observaciones}</td></tr>` : ''}
        ${g.comprobante_url ? `<tr><td class="label">Comprobante</td><td>Archivo adjunto: ${g.comprobante_url.split('/').pop()}</td></tr>` : ''}
        ${g.firma_digital ? `<tr><td class="label">Firma Digital</td><td>✅ ${g.firma_digital} — ${g.firma_fecha || ''}</td></tr>` : ''}
      </table>
      <div class="signature-box">
        <div class="sig-block">
          <div class="sig-line">Firma del Solicitante<br/><small>${g.solicitante_nombre} ${g.solicitante_apellido}</small></div>
        </div>
        <div class="sig-block">
          <div class="sig-line">Vo.Bo. Autorización (Supervisora/Líder)<br/><small>${g.autorizador_nombre ? g.autorizador_nombre + ' ' + g.autorizador_apellido : '___________________'}</small></div>
        </div>
      </div>
      <div class="footer">
        Documento generado el ${new Date().toLocaleDateString('es-MX')} ${new Date().toLocaleTimeString('es-MX')} — CRM Psicología
      </div>
      <script>window.onload=function(){window.print();}</script>
    </body></html>`);
    win.document.close();
  };

  const cobrosDelDia = (fecha: string) => cobros.filter(c => c.fecha === fecha);
  const totalDelDia = (fecha: string) => cobrosDelDia(fecha).reduce((s, c) => s + Number(c.monto), 0);

  const generarCalendario = () => {
    const anio = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();
    const primerDia = new Date(anio, mes, 1).getDay();
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();
    const dias: { num: number | null; fecha: string | null }[] = [];
    for (let i = 0; i < primerDia; i++) dias.push({ num: null, fecha: null });
    for (let d = 1; d <= diasEnMes; d++) {
      const f = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      dias.push({ num: d, fecha: f });
    }
    return dias;
  };

  const handleNuevoCobro = (fecha?: string) => {
    setCobroForm(prev => ({ ...prev, fecha: fecha || new Date().toISOString().split('T')[0] }));
    setDiaSeleccionado(fecha || null);
    setShowCobroForm(true);
  };

  const imprimirHardcopyCobro = (c: Cobro) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Comprobante de Cobro #${c.id}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 18px; }
        .header p { margin: 2px 0; font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        td { padding: 8px 12px; border: 1px solid #ccc; font-size: 13px; }
        td.label { background: #f5f5f5; font-weight: bold; width: 30%; }
        .total-row td { font-weight: bold; font-size: 15px; background: #e8f5e9; }
        .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
        @media print { body { padding: 20px; } }
      </style>
    </head><body>
      <div class="header">
        <h1>COMPROBANTE DE COBRO</h1>
        <p>Clínica de Psicología — Sistema CRM</p>
        <p>Folio: #${c.id} | Fecha: ${c.fecha} ${c.hora || ''}</p>
      </div>
      <table>
        <tr><td class="label">Paciente</td><td>${c.paciente_nombre} ${c.paciente_apellido}</td></tr>
        ${c.taller_nombre ? `<tr><td class="label">Taller</td><td>${c.taller_nombre}</td></tr>` : ''}
        <tr><td class="label">Concepto</td><td>${tipoLabels[c.tipo] || c.tipo}${c.concepto ? ` — ${c.concepto}` : ''}</td></tr>
        <tr><td class="label">Método de Pago</td><td>${metodoLabels[c.metodo_pago] || c.metodo_pago}</td></tr>
        <tr class="total-row"><td class="label">Total</td><td>$${Number(c.monto).toLocaleString('es-MX')} MXN</td></tr>
        </table>
      <div class="footer">
        Generado por ${user?.nombre} ${user?.apellido} el ${new Date().toLocaleDateString('es-MX')} ${new Date().toLocaleTimeString('es-MX')}
      </div>
      <script>window.onload=function(){window.print();}</script>
    </body></html>`);
    win.document.close();
  };

  const generarCorte = async () => {
    try {
      let url = `/api/cobros?fecha=${corteFecha}`;
      if (corteTaller) url += `&taller_id=${corteTaller}`;
      const res = await fetch(url);
      const data = await res.json();
      const cobrosDia = data.cobros || [];
      const total = cobrosDia.reduce((s: number, c: Cobro) => s + Number(c.monto), 0);
      const porMetodo: Record<string, number> = {};
      const porTipo: Record<string, number> = {};
      cobrosDia.forEach((c: Cobro) => {
        porMetodo[c.metodo_pago] = (porMetodo[c.metodo_pago] || 0) + Number(c.monto);
        porTipo[c.tipo] = (porTipo[c.tipo] || 0) + Number(c.monto);
      });
      setCorteData({ cobros: cobrosDia, total, porMetodo, porTipo });
      setShowCorte(true);
    } catch (e) { console.error(e); }
  };

  const exportarExcel = () => {
    if (!corteData) return;
    const BOM = '\uFEFF';
    const rows: string[] = [];
    rows.push('CORTE DE CAJA DIARIO');
    rows.push(`Fecha,${corteFecha}`);
    rows.push(`Generado por,${user?.nombre} ${user?.apellido}`);
    rows.push(`Fecha/Hora exportación,"${new Date().toLocaleString('es-MX')}"`);
    rows.push('');
    rows.push('RESUMEN');
    rows.push(`Total del día,${corteData.total}`);
    rows.push(`Total cobros,${corteData.cobros.length}`);
    rows.push('');
    rows.push('POR MÉTODO DE PAGO');
    Object.entries(corteData.porMetodo).forEach(([metodo, total]) => {
      rows.push(`${metodoLabels[metodo] || metodo},${total}`);
    });
    rows.push('');
    rows.push('POR TIPO DE COBRO');
    Object.entries(corteData.porTipo).forEach(([tipo, total]) => {
      rows.push(`${tipoLabels[tipo] || tipo},${total}`);
    });
    rows.push('');
    rows.push('DETALLE DE COBROS');
    rows.push('ID,Paciente,Fecha,Hora,Tipo,Concepto,Monto,Método Pago,Estado,Observaciones,Confirmado Psicóloga');
    corteData.cobros.forEach(c => {
      rows.push(`${c.id},"${c.paciente_nombre} ${c.paciente_apellido}",${c.fecha},${c.hora||''},${c.tipo},"${(c.concepto||'').replace(/"/g,'""')}",${Number(c.monto)},${c.metodo_pago},${c.estado},"${(c.observaciones||'').replace(/"/g,'""')}",${c.confirmado_psicologa ? 'Sí' : 'No'}`);
    });
    const blob = new Blob([BOM + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `corte_caja_${corteFecha}${corteTaller ? '_taller'+corteTaller : ''}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const metodoLabels: Record<string, string> = {
    efectivo: '💵 Efectivo', tarjeta_credito: '💳 Tarjeta Crédito',
    tarjeta_debito: '💳 Tarjeta Débito', transferencia: '🏦 Transferencia', otro: 'Otro'
  };
  const tipoLabels: Record<string, string> = {
    sesion: '🧠 Sesión', taller: '🎓 Taller', programa: '📋 Programa',
    venta_libros: '📚 Venta de Libros', gastos_talleres: '🛠️ Gastos de Talleres', otro: 'Otro'
  };

  const mesAnterior = () => {
    const d = new Date(fechaActual);
    d.setMonth(d.getMonth() - 1);
    setFechaActual(d);
    setFiltroMes(d.getMonth() + 1);
    setFiltroAnio(d.getFullYear());
  };

  const mesSiguiente = () => {
    const d = new Date(fechaActual);
    d.setMonth(d.getMonth() + 1);
    setFechaActual(d);
    setFiltroMes(d.getMonth() + 1);
    setFiltroAnio(d.getFullYear());
  };

  const totalMes = cobros.reduce((s, c) => s + Number(c.monto), 0);
  const pagadosMes = cobros.filter(c => c.estado === 'pagado').reduce((s, c) => s + Number(c.monto), 0);
  const pendientesMes = cobros.filter(c => c.estado === 'pendiente').reduce((s, c) => s + Number(c.monto), 0);
  const totalEntregas = entregas.filter(e => e.estado === 'confirmada').reduce((s, e) => s + Number(e.monto), 0);
  const totalGastos = gastos.filter(g => g.estado === 'aprobado' || g.estado === 'pagado').reduce((s, g) => s + Number(g.monto), 0);
  const totalGastosPendientes = gastos.filter(g => g.estado === 'pendiente').reduce((s, g) => s + Number(g.monto), 0);

  if (!mounted) return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-500">Cargando...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-600">← Volver</Link>
            <h1 className="text-xl font-bold text-gray-800">📋 Recepción y Cobros</h1>
          </div>
          <div className="flex gap-2">
            {activeTab === 'cobros' && (
              <>
                <button onClick={() => handleNuevoCobro()}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
                  💰 Nuevo Cobro
                </button>
                <button onClick={generarCorte}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">
                  📊 Corte de Caja
                </button>
              </>
            )}
            {activeTab === 'entregas' && (
              <button onClick={() => setShowEntregaForm(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium">
                💸 Nueva Entrega
              </button>
            )}
            {activeTab === 'gastos' && (
              <button onClick={() => setShowGastoForm(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">
                🧾 Nuevo Gasto
              </button>
            )}
            {activeTab === 'citas' && (
              <button onClick={() => setShowCitaForm(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">
                📅 Nueva Cita
              </button>
            )}
            {activeTab === 'facturas' && (
              <button onClick={() => setShowFacturaForm(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
                🧾 Nueva Factura
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg shadow p-1 w-fit">
          <button onClick={() => setActiveTab('cobros')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'cobros' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            💰 Cobros ({cobros.length})
          </button>
          <button onClick={() => setActiveTab('entregas')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'entregas' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            💸 Entregas de Dinero ({entregas.length})
          </button>
          <button onClick={() => setActiveTab('gastos')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'gastos' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            🧾 Caja Chica ({gastos.length})
          </button>
          <button onClick={() => setActiveTab('citas')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'citas' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            📅 Citas ({citas.length})
          </button>
          <button onClick={() => setActiveTab('facturas')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'facturas' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            🧾 Facturas ({facturas.length})
          </button>
        </div>

        {/* ==================== TAB: COBROS ==================== */}
        {activeTab === 'cobros' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-white rounded-lg shadow p-3 border-l-4 border-green-500">
                <p className="text-xs text-gray-500">Total Mes</p>
                <p className="text-xl font-bold text-gray-800">${totalMes.toLocaleString('es-MX')}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-3 border-l-4 border-blue-500">
                <p className="text-xs text-gray-500">Pagados</p>
                <p className="text-xl font-bold text-green-600">${pagadosMes.toLocaleString('es-MX')}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-3 border-l-4 border-yellow-500">
                <p className="text-xs text-gray-500">Pendientes</p>
                <p className="text-xl font-bold text-yellow-600">${pendientesMes.toLocaleString('es-MX')}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-3 border-l-4 border-indigo-500">
                <p className="text-xs text-gray-500">Total Cobros</p>
                <p className="text-xl font-bold text-gray-800">{cobros.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow p-4">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={mesAnterior} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm">← Anterior</button>
                    <h2 className="text-lg font-bold text-gray-800">{MESES[fechaActual.getMonth()]} {fechaActual.getFullYear()}</h2>
                    <button onClick={mesSiguiente} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm">Siguiente →</button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {DIAS.map(d => <div key={d} className="text-center text-xs font-bold text-gray-500 py-1">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {generarCalendario().map((dia, i) => {
                      if (dia.num === null) return <div key={i} />;
                      const cobrosDia = cobrosDelDia(dia.fecha!);
                      const total = totalDelDia(dia.fecha!);
                      const esHoy = dia.fecha === new Date().toISOString().split('T')[0];
                      const isSelected = diaSeleccionado === dia.fecha;
                      return (
                        <div key={i} onClick={() => handleNuevoCobro(dia.fecha!)}
                          className={`relative p-1.5 rounded-lg cursor-pointer transition-all min-h-[64px] ${
                            esHoy ? 'bg-indigo-100 border-2 border-indigo-500' :
                            isSelected ? 'bg-blue-100 border-2 border-blue-500' :
                            'hover:bg-gray-100 border border-transparent'
                          }`}>
                          <span className={`text-xs font-bold ${esHoy ? 'text-indigo-600' : 'text-gray-700'}`}>{dia.num}</span>
                          {cobrosDia.length > 0 && (
                            <div className="mt-0.5">
                              <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded">{cobrosDia.length} cobro{cobrosDia.length > 1 ? 's' : ''}</span>
                              <p className="text-[10px] text-green-600 font-bold mt-0.5">${total.toLocaleString('es-MX')}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-3 text-center">Haz clic en un día para registrar un cobro</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-xl shadow p-4">
                  <h3 className="font-bold text-sm text-gray-800 mb-3">Cobros del Mes</h3>
                  {cobros.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Sin cobros este mes</p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {cobros.slice(0, 15).map(c => (
                        <div key={c.id} className="p-2 rounded-lg border text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-700">{c.paciente_nombre} {c.paciente_apellido}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              c.estado === 'pagado' ? 'bg-green-100 text-green-700' :
                              c.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>{c.estado}</span>
                          </div>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-gray-500">{new Date(c.fecha).toLocaleDateString('es-MX')} • {tipoLabels[c.tipo] || c.tipo}</span>
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-green-600">${Number(c.monto).toLocaleString('es-MX')}</span>
                              <button onClick={() => imprimirHardcopyCobro(c)}
                                className="px-1.5 py-0.5 bg-gray-500 hover:bg-gray-600 text-white rounded text-[9px] font-medium">
                                🖨️
                              </button>
                            </div>
                          </div>
                          {c.tipo === 'sesion' && (
                            <div className="mt-1">
                              {c.confirmado_psicologa ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-300">
                                  ✅ Psicóloga confirmó
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-700 border border-orange-300">
                                  ⏳ Sin confirmación psicóloga
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ==================== TAB: ENTREGAS DE DINERO ==================== */}
        {activeTab === 'entregas' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-lg shadow p-3 border-l-4 border-orange-500">
                <p className="text-xs text-gray-500">Total Entregas Confirmadas</p>
                <p className="text-xl font-bold text-orange-600">${totalEntregas.toLocaleString('es-MX')}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-3 border-l-4 border-blue-500">
                <p className="text-xs text-gray-500">Entregas este Mes</p>
                <p className="text-xl font-bold text-gray-800">{entregas.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-3 border-l-4 border-green-500">
                <p className="text-xs text-gray-500">Pendientes Confirmar</p>
                <p className="text-xl font-bold text-yellow-600">{entregas.filter(e => e.estado === 'pendiente').length}</p>
              </div>
            </div>

            {!isSupervisor && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-800">
                ⚠️ Solo las supervisoras/líder pueden confirmar recepción de dinero.
              </div>
            )}

            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-bold text-sm text-gray-800 mb-3">Historial de Entregas</h3>
              {entregas.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Sin entregas registradas este mes</p>
              ) : (
                <div className="space-y-2">
                  {entregas.map(e => (
                    <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border text-xs">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-700">De: {e.solicitante_nombre} {e.solicitante_apellido}</span>
                          <span className="text-gray-400">→</span>
                          <span className="font-bold text-gray-700">Para: {e.receptor_nombre} {e.receptor_apellido}</span>
                        </div>
                        <p className="text-gray-500 mt-0.5">{e.concepto || 'Sin concepto'} • {e.fecha} {e.hora || ''}</p>
                        {e.firma_digital && (
                          <p className="text-green-600 mt-0.5 text-[10px]">✅ Firmado: {e.firma_digital} • {e.firma_fecha ? new Date(e.firma_fecha).toLocaleString('es-MX') : ''}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-orange-600 text-sm">${Number(e.monto).toLocaleString('es-MX')}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          e.estado === 'confirmada' ? 'bg-green-100 text-green-700' :
                          e.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>{e.estado}</span>
                        {e.firma_digital && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">✍️ Firmado</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {isSupervisor && e.estado === 'pendiente' && (
                          <button onClick={() => confirmarEntrega(e.id)}
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-medium">
                            ✅ Recibir
                          </button>
                        )}
                        {!e.firma_digital && (
                          <button onClick={() => firmarEntrega(e.id)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-medium">
                            ✍️ Firmar
                          </button>
                        )}
                        <button onClick={() => imprimirHardcopyEntrega(e)}
                          className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-[10px] font-medium">
                          🖨️ Imprimir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ==================== TAB: CAJA CHICA ==================== */}
        {activeTab === 'gastos' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-lg shadow p-3 border-l-4 border-red-500">
                <p className="text-xs text-gray-500">Total Gastos Aprobados</p>
                <p className="text-xl font-bold text-red-600">${totalGastos.toLocaleString('es-MX')}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-3 border-l-4 border-yellow-500">
                <p className="text-xs text-gray-500">Pendientes Aprobación</p>
                <p className="text-xl font-bold text-yellow-600">${totalGastosPendientes.toLocaleString('es-MX')}</p>
                <p className="text-[10px] text-gray-400">{gastos.filter(g => g.estado === 'pendiente').length} gasto(s)</p>
              </div>
              <div className="bg-white rounded-lg shadow p-3 border-l-4 border-indigo-500">
                <p className="text-xs text-gray-500">Gastos este Mes</p>
                <p className="text-xl font-bold text-gray-800">{gastos.length}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-bold text-sm text-gray-800 mb-3">Historial de Gastos</h3>
              {gastos.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Sin gastos registrados este mes</p>
              ) : (
                <div className="space-y-2">
                  {gastos.map(g => (
                    <div key={g.id} className="flex items-center justify-between p-3 rounded-lg border text-xs">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-700">{g.concepto}</span>
                          {g.proveedor && <span className="text-gray-400">• {g.proveedor}</span>}
                        </div>
                        <p className="text-gray-500 mt-0.5">
                          Solicitado por: {g.solicitante_nombre} {g.solicitante_apellido} • {g.fecha}
                          {g.autorizador_nombre && ` • Autorizado por: ${g.autorizador_nombre} ${g.autorizador_apellido}`}
                        </p>
                        {g.observaciones && <p className="text-gray-400 mt-0.5 truncate">{g.observaciones}</p>}
                        {g.comprobante_url && (
                          <a href={g.comprobante_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-1 text-blue-600 hover:text-blue-800 text-[10px] font-medium">
                            📄 Ver Factura
                          </a>
                        )}
                        {g.firma_digital && (
                          <p className="text-green-600 mt-0.5 text-[10px]">✅ Firmado: {g.firma_digital} • {g.firma_fecha ? new Date(g.firma_fecha).toLocaleString('es-MX') : ''}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-red-600 text-sm">${Number(g.monto).toLocaleString('es-MX')}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          g.estado === 'aprobado' || g.estado === 'pagado' ? 'bg-green-100 text-green-700' :
                          g.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>{g.estado}</span>
                        {g.firma_digital && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">✍️ Firmado</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {isSupervisor && g.estado === 'pendiente' && (
                          <button onClick={() => autorizarGasto(g.id)}
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-medium">
                            ✅ Autorizar
                          </button>
                        )}
                        {!g.firma_digital && (
                          <button onClick={() => firmarGasto(g.id)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-medium">
                            ✍️ Firmar
                          </button>
                        )}
                        <button onClick={() => imprimirHardcopy(g)}
                          className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-[10px] font-medium">
                          🖨️ Imprimir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ==================== TAB: CITAS ==================== */}
        {activeTab === 'citas' && (
          <>
            {/* Filtros */}
            <div className="bg-white rounded-xl shadow p-4 mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-gray-600">📅 Rango de fechas:</span>
                <input type="date" value={filtroFechaInicio} onChange={e => setFiltroFechaInicio(e.target.value)}
                  className="px-3 py-1.5 border rounded-lg text-sm" />
                <span className="text-gray-400">al</span>
                <input type="date" value={filtroFechaFin} onChange={e => setFiltroFechaFin(e.target.value)}
                  className="px-3 py-1.5 border rounded-lg text-sm" />
                <span className="text-xs text-gray-400 ml-auto">{citas.length} cita(s) en este periodo</span>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => setCitaVista('lista')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${citaVista === 'lista' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>📋 Lista</button>
                  <button onClick={() => setCitaVista('calendario')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${citaVista === 'calendario' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>📅 Calendario</button>
                </div>
              </div>
            </div>

            {/* Resumen rápido */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <div className="bg-white rounded-lg shadow p-3 border-l-4 border-purple-500">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-xl font-bold text-gray-800">{citas.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-3 border-l-4 border-blue-500">
                <p className="text-xs text-gray-500">Programadas</p>
                <p className="text-xl font-bold text-blue-600">{citas.filter(c => c.estado === 'programada').length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-3 border-l-4 border-green-500">
                <p className="text-xs text-gray-500">Confirmadas</p>
                <p className="text-xl font-bold text-green-600">{citas.filter(c => c.estado === 'confirmada').length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-3 border-l-4 border-emerald-500">
                <p className="text-xs text-gray-500">Completadas</p>
                <p className="text-xl font-bold text-emerald-600">{citas.filter(c => c.estado === 'completada').length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-3 border-l-4 border-red-500">
                <p className="text-xs text-gray-500">Canceladas</p>
                <p className="text-xl font-bold text-red-600">{citas.filter(c => c.estado === 'cancelada' || c.estado === 'no_asistio').length}</p>
              </div>
            </div>

            {citaVista === 'lista' ? (
              <div className="bg-white rounded-xl shadow p-4">
                <h3 className="font-bold text-sm text-gray-800 mb-3">Citas Programadas</h3>
                {citas.length === 0 ? (
                  <p className="text-xs text-gray-400 italic text-center py-6">No hay citas en este periodo</p>
                ) : (
                  <div className="space-y-2">
                    {citas.map(c => {
                      const estadoColors: Record<string, string> = {
                        programada: 'bg-blue-100 text-blue-700',
                        confirmada: 'bg-green-100 text-green-700',
                        en_curso: 'bg-yellow-100 text-yellow-700',
                        completada: 'bg-emerald-100 text-emerald-700',
                        cancelada: 'bg-red-100 text-red-700',
                        no_asistio: 'bg-gray-100 text-gray-700'
                      };
                      const tipoLabels: Record<string, string> = {
                        sesion: '🧠 Sesión', seguimiento: '📋 Seguimiento', evaluacion: '📝 Evaluación', taller: '🎓 Taller', otro: '📌 Otro'
                      };
                      const esHoy = c.fecha === new Date().toISOString().split('T')[0];
                      return (
                        <div key={c.id} className={`flex items-center justify-between p-3 rounded-lg border text-xs ${esHoy ? 'border-purple-300 bg-purple-50' : ''}`}>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${esHoy ? 'text-purple-700' : 'text-gray-700'}`}>
                                {c.paciente_nombre} {c.paciente_apellido}
                              </span>
                              <span className="text-gray-400">con</span>
                              <span className="font-medium text-gray-600">{c.psicologa_nombre} {c.psicologa_apellido}</span>
                            </div>
                            <p className="text-gray-500 mt-0.5">
                              {tipoLabels[c.tipo] || c.tipo} • {c.fecha} {c.hora_inicio}{c.hora_fin ? ` - ${c.hora_fin}` : ''}
                              {esHoy && <span className="text-purple-600 font-bold ml-1">HOY</span>}
                            </p>
                            {c.motivo && <p className="text-gray-400 mt-0.5 truncate">{c.motivo}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${estadoColors[c.estado] || 'bg-gray-100 text-gray-700'}`}>
                              {c.estado.replace('_', ' ')}
                            </span>
                            {c.estado === 'programada' && (
                              <button onClick={() => actualizarCita(c.id, 'confirmada')}
                                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-medium">
                                ✅ Confirmar
                              </button>
                            )}
                            {(c.estado === 'programada' || c.estado === 'confirmada') && (
                              <>
                                <button onClick={() => actualizarCita(c.id, 'completada')}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-medium">
                                  ✔️ Completar
                                </button>
                                <button onClick={() => cancelarCita(c.id)}
                                  className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-[10px] font-medium">
                                  ✕ Cancelar
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => { const d = new Date(calFecha); d.setMonth(d.getMonth() - 1); const s = d.toISOString().split('T')[0]; setCalFecha(s); setFiltroFechaInicio(new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]); setFiltroFechaFin(new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]); }}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">◀ Anterior</button>
                  <h3 className="font-bold text-sm text-gray-800">
                    {new Date(calFecha).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button onClick={() => { const d = new Date(calFecha); d.setMonth(d.getMonth() + 1); const s = d.toISOString().split('T')[0]; setCalFecha(s); setFiltroFechaInicio(new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]); setFiltroFechaFin(new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]); }}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">Siguiente ▶</button>
                </div>
                <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden text-xs">
                  {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d => (
                    <div key={d} className="bg-gray-50 p-2 text-center font-semibold text-gray-500">{d}</div>
                  ))}
                  {(() => {
                    const d = new Date(calFecha);
                    const year = d.getFullYear();
                    const month = d.getMonth();
                    const firstDay = new Date(year, month, 1).getDay();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const citasPorFecha: Record<string, typeof citas> = {};
                    citas.forEach(c => { if (!citasPorFecha[c.fecha]) citasPorFecha[c.fecha] = []; citasPorFecha[c.fecha].push(c); });
                    const cells = [];
                    for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} className="bg-white p-1.5 min-h-[60px]" />);
                    for (let day = 1; day <= daysInMonth; day++) {
                      const fechaStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const citasDia = citasPorFecha[fechaStr] || [];
                      const esHoy = fechaStr === new Date().toISOString().split('T')[0];
                      cells.push(
                        <div key={day} className={`bg-white p-1.5 min-h-[60px] ${esHoy ? 'ring-2 ring-purple-500' : ''}`}>
                          <span className={`text-[10px] font-bold ${esHoy ? 'text-purple-700' : 'text-gray-600'}`}>{day}</span>
                          <div className="mt-0.5 space-y-0.5">
                            {citasDia.slice(0, 3).map(c => (
                              <div key={c.id} className={`text-[8px] px-1 py-0.5 rounded truncate font-medium ${c.estado === 'programada' ? 'bg-blue-100 text-blue-700' : c.estado === 'confirmada' ? 'bg-green-100 text-green-700' : c.estado === 'completada' ? 'bg-emerald-100 text-emerald-700' : c.estado === 'cancelada' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                {c.hora_inicio?.slice(0,5)} {c.paciente_nombre?.split(' ')[0]}
                              </div>
                            ))}
                            {citasDia.length > 3 && <span className="text-[8px] text-gray-400">+{citasDia.length - 3} más</span>}
                          </div>
                        </div>
                      );
                    }
                    return cells;
                  })()}
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* Modal Nuevo Cobro */}
      {showCobroForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">💰 Registrar Cobro</h3>
                <button onClick={() => setShowCobroForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Paciente *</label>
                  <select value={cobroForm.paciente_id} onChange={e => {
                    const pac = pacientes.find(p => p.id === Number(e.target.value));
                    setCobroForm({...cobroForm, paciente_id: e.target.value, concepto: cobroForm.concepto || `Sesión - ${pac?.nombre} ${pac?.apellido}`});
                  }} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="">— Seleccionar paciente —</option>
                    {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de Cobro *</label>
                    <select value={cobroForm.tipo} onChange={e => {
                      const montoDefault = e.target.value === 'sesion' ? MONTO_SESION.toString() : cobroForm.monto;
                      setCobroForm({...cobroForm, tipo: e.target.value, monto: montoDefault});
                    }} className="w-full px-3 py-2 border rounded-lg text-sm">
                      <option value="sesion">🧠 Sesión Terapéutica (${MONTO_SESION})</option>
                      <option value="taller">🎓 Taller</option>
                      <option value="programa">📋 Programa Completo</option>
                      <option value="venta_libros">📚 Venta de Libros</option>
                      <option value="gastos_talleres">🛠️ Gastos de Talleres</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Monto (MXN) *</label>
                    <input type="number" step="0.01" min="0" value={cobroForm.monto}
                      onChange={e => setCobroForm({...cobroForm, monto: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                </div>
                {cobroForm.tipo === 'venta_libros' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Seleccionar Libro</label>
                    <select onChange={e => {
                      const lib = libros.find(l => l.id === Number(e.target.value));
                      if (lib) setCobroForm({...cobroForm, concepto: `Venta: ${lib.titulo}${lib.autor ? ` - ${lib.autor}` : ''}`, monto: lib.precio.toString()});
                    }} className="w-full px-3 py-2 border rounded-lg text-sm">
                      <option value="">— Elegir libro —</option>
                      {libros.filter(l => l.stock > 0).map(l => (
                        <option key={l.id} value={l.id}>📖 {l.titulo} — ${Number(l.precio).toLocaleString('es-MX')} ({l.stock} disp.)</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fecha *</label>
                    <input type="date" value={cobroForm.fecha}
                      onChange={e => setCobroForm({...cobroForm, fecha: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Hora</label>
                    <input type="time" value={cobroForm.hora}
                      onChange={e => setCobroForm({...cobroForm, hora: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Método de Pago</label>
                  <select value={cobroForm.metodo_pago} onChange={e => setCobroForm({...cobroForm, metodo_pago: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="efectivo">💵 Efectivo</option>
                    <option value="tarjeta_credito">💳 Tarjeta Crédito</option>
                    <option value="tarjeta_debito">💳 Tarjeta Débito</option>
                    <option value="transferencia">🏦 Transferencia</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Concepto</label>
                  <input value={cobroForm.concepto}
                    onChange={e => setCobroForm({...cobroForm, concepto: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Sesión individual, Taller grupal..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Observaciones</label>
                  <textarea value={cobroForm.observaciones} onChange={e => setCobroForm({...cobroForm, observaciones: e.target.value})} rows={2}
                    className="w-full px-3 py-2 border rounded-lg text-sm resize-none" placeholder="Notas adicionales..." />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={crearCobro}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
                  💰 Registrar Cobro
                </button>
                <button onClick={() => setShowCobroForm(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Corte de Caja */}
      {showCorte && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">📊 Corte de Caja Diario</h3>
                <button onClick={() => { setShowCorte(false); setCorteData(null); }} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <div className="mb-4">
                <label className="text-xs text-gray-600 font-medium">Fecha del corte</label>
                <div className="flex gap-2 mt-1">
                  <input type="date" value={corteFecha} onChange={e => setCorteFecha(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs text-gray-600 font-medium">Filtrar por Taller (opcional)</label>
                <select value={corteTaller} onChange={e => setCorteTaller(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1">
                  <option value="">— Todos los cobros —</option>
                  {talleres.map(t => <option key={t.id} value={t.id}>{t.titulo}</option>)}
                </select>
              </div>
              <div className="flex gap-2 mb-4">
                <button onClick={generarCorte}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">
                  Generar Corte
                </button>
                {corteData && (
                  <button onClick={exportarExcel}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
                    📥 Exportar Excel
                  </button>
                )}
              </div>
              {corteData && (
                <div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-xs text-gray-500">Total del Día</p>
                      <p className="text-xl font-bold text-green-700">${corteData.total.toLocaleString('es-MX')}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-xs text-gray-500">Total Cobros</p>
                      <p className="text-xl font-bold text-blue-700">{corteData.cobros.length}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-bold text-xs text-gray-700 mb-2">Por Método de Pago</h4>
                    <div className="space-y-1">
                      {Object.entries(corteData.porMetodo).map(([metodo, total]) => (
                        <div key={metodo} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                          <span>{metodoLabels[metodo] || metodo}</span>
                          <span className="font-bold text-green-600">${total.toLocaleString('es-MX')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-bold text-xs text-gray-700 mb-2">Por Tipo de Cobro</h4>
                    <div className="space-y-1">
                      {Object.entries(corteData.porTipo).map(([tipo, total]) => (
                        <div key={tipo} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                          <span>{tipoLabels[tipo] || tipo}</span>
                          <span className="font-bold text-green-600">${total.toLocaleString('es-MX')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-700 mb-2">Detalle de Cobros</h4>
                    {corteData.cobros.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Sin cobros en esta fecha</p>
                    ) : (
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {corteData.cobros.map(c => (
                          <div key={c.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{c.paciente_nombre} {c.paciente_apellido}</span>
                                {c.tipo === 'sesion' && (
                                  c.confirmado_psicologa
                                    ? <span className="text-[9px] px-1 py-0.5 bg-green-100 text-green-700 rounded font-bold">✅ Psic. OK</span>
                                    : <span className="text-[9px] px-1 py-0.5 bg-orange-100 text-orange-700 rounded font-medium">⏳ Sin confirmar</span>
                                )}
                              </div>
                              <span className="text-gray-400 ml-0">• {c.hora || '--:--'}</span>
                              {c.taller_nombre && <span className="text-purple-500 ml-1">🎓 {c.taller_nombre}</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">{metodoLabels[c.metodo_pago]?.split(' ')[0]}</span>
                              <span className="font-bold text-green-600">${Number(c.monto).toLocaleString('es-MX')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 p-3 bg-gray-100 rounded-lg text-center">
                    <p className="text-xs text-gray-500">Corte generado por: {user?.nombre} {user?.apellido}</p>
                    <p className="text-xs text-gray-500">Fecha: {new Date().toLocaleDateString('es-MX')} {new Date().toLocaleTimeString('es-MX')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB: FACTURAS ==================== */}
      {activeTab === 'facturas' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-lg shadow p-3 border-l-4 border-blue-500">
              <p className="text-xs text-gray-500">Total Solicitudes</p>
              <p className="text-xl font-bold text-gray-800">{facturas.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-3 border-l-4 border-yellow-500">
              <p className="text-xs text-gray-500">Pendientes</p>
              <p className="text-xl font-bold text-yellow-600">{facturas.filter(f => f.estado === 'pendiente').length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-3 border-l-4 border-green-500">
              <p className="text-xs text-gray-500">Timbradas</p>
              <p className="text-xl font-bold text-green-600">{facturas.filter(f => f.estado === 'timbrada').length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-3 border-l-4 border-red-500">
              <p className="text-xs text-gray-500">Total Timbrado</p>
              <p className="text-xl font-bold text-red-600">${facturas.filter(f => f.estado === 'timbrada').reduce((a, f) => a + Number(f.total), 0).toLocaleString('es-MX')}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-bold text-sm text-gray-800 mb-3">Historial de Solicitudes de Factura</h3>
            {facturas.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-6">Sin solicitudes este mes. Usa el botón "Nueva Factura" para crear una.</p>
            ) : (
              <div className="space-y-2">
                {facturas.map(f => (
                  <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border text-xs">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-700">{f.serie}{f.folio ? `-${f.folio}` : ''} • {f.concepto}</span>
                        {f.paciente_nombre && <span className="text-gray-400">👤 {f.paciente_nombre}</span>}
                      </div>
                      <p className="text-gray-500 mt-0.5">
                        RFC: {f.rfc_receptor} • {f.razon_social_receptor}
                      </p>
                      <p className="text-gray-400 mt-0.5">
                        Solicitada por: {f.solicitante_nombre || '—'} {f.solicitante_apellido || ''} • {new Date(f.created_at).toLocaleDateString('es-MX')}
                        {f.validador_nombre && ` • Validada por: ${f.validador_nombre} ${f.validador_apellido}`}
                      </p>
                      {f.comentario_supervisora && (
                        <p className="text-orange-500 mt-0.5">💬 {f.comentario_supervisora}</p>
                      )}
                      {f.estado === 'error' && f.error_timbrado && (
                        <p className="text-red-500 mt-0.5 truncate" title={f.error_timbrado}>⚠️ {f.error_timbrado}</p>
                      )}
                      {f.uuid && (
                        <p className="text-gray-400 mt-0.5 text-[10px]">UUID: {f.uuid}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800 text-sm">${Number(f.total).toLocaleString('es-MX')}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        f.estado === 'timbrada' ? 'bg-green-100 text-green-700' :
                        f.estado === 'aprobada' ? 'bg-blue-100 text-blue-700' :
                        f.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                        f.estado === 'rechazada' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>{f.estado}</span>
                      <div className="flex flex-col gap-1">
                        {f.pdf_path && (
                          <a href={`/${f.pdf_path}`} target="_blank" rel="noopener noreferrer"
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-medium text-center">
                            📄 PDF
                          </a>
                        )}
                        {f.xml_path && (
                          <a href={`/${f.xml_path}`} target="_blank" rel="noopener noreferrer"
                            className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-[10px] font-medium text-center">
                            📎 XML
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal Nueva Entrega */}
      {showEntregaForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">💸 Registrar Entrega de Dinero</h3>
                <button onClick={() => setShowEntregaForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Psicóloga que entrega *</label>
                  <select value={entregaForm.psicologa_id}
                    onChange={e => setEntregaForm({...entregaForm, psicologa_id: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="">— Seleccionar psicóloga —</option>
                    {usuarios.filter(u => u.rol === 'psicologa').map(u => (
                      <option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Receptor (supervisora/líder) *</label>
                  <select value={entregaForm.receptor_id}
                    onChange={e => setEntregaForm({...entregaForm, receptor_id: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="">— Seleccionar receptor —</option>
                    {usuarios.filter(u => u.rol === 'supervisora' || u.rol === 'supervisor' || u.rol === 'lider').map(u => (
                      <option key={u.id} value={u.id}>{u.nombre} {u.apellido} ({u.rol})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Monto (MXN) *</label>
                    <input type="number" step="0.01" min="0" value={entregaForm.monto}
                      onChange={e => setEntregaForm({...entregaForm, monto: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fecha *</label>
                    <input type="date" value={entregaForm.fecha}
                      onChange={e => setEntregaForm({...entregaForm, fecha: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Hora</label>
                  <input type="time" value={entregaForm.hora}
                    onChange={e => setEntregaForm({...entregaForm, hora: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Concepto</label>
                  <input value={entregaForm.concepto}
                    onChange={e => setEntregaForm({...entregaForm, concepto: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Ej: Entrega de cobros del día..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Observaciones</label>
                  <textarea value={entregaForm.observaciones} onChange={e => setEntregaForm({...entregaForm, observaciones: e.target.value})} rows={2}
                    className="w-full px-3 py-2 border rounded-lg text-sm resize-none" placeholder="Notas adicionales..." />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={crearEntrega} disabled={!entregaForm.psicologa_id || !entregaForm.receptor_id || !entregaForm.monto || !entregaForm.fecha}
                  className={`flex-1 py-2 text-white rounded-lg text-sm font-medium ${!entregaForm.psicologa_id || !entregaForm.receptor_id || !entregaForm.monto || !entregaForm.fecha ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}>
                  💸 Registrar Entrega
                </button>
                <button onClick={() => setShowEntregaForm(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Gasto */}
      {showGastoForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">🧾 Registrar Gasto de Caja Chica</h3>
                <button onClick={() => setShowGastoForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Solicitado por *</label>
                  <select value={gastoForm.solicitado_por}
                    onChange={e => setGastoForm({...gastoForm, solicitado_por: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="">— Seleccionar solicitante —</option>
                    {usuarios.map(u => (
                      <option key={u.id} value={u.id}>{u.nombre} {u.apellido} ({u.rol})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Concepto *</label>
                  <input value={gastoForm.concepto}
                    onChange={e => setGastoForm({...gastoForm, concepto: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Ej: Pago de servicios de limpieza..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Proveedor</label>
                  <input value={gastoForm.proveedor}
                    onChange={e => setGastoForm({...gastoForm, proveedor: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Nombre del proveedor/servicio..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Monto (MXN) *</label>
                    <input type="number" step="0.01" min="0" value={gastoForm.monto}
                      onChange={e => setGastoForm({...gastoForm, monto: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Método de Pago</label>
                    <select value={gastoForm.metodo_pago}
                      onChange={e => setGastoForm({...gastoForm, metodo_pago: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm">
                      <option value="efectivo">💵 Efectivo</option>
                      <option value="tarjeta_credito">💳 Tarjeta Crédito</option>
                      <option value="tarjeta_debito">💳 Tarjeta Débito</option>
                      <option value="transferencia">🏦 Transferencia</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fecha *</label>
                  <input type="date" value={gastoForm.fecha}
                    onChange={e => setGastoForm({...gastoForm, fecha: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Factura / Comprobante (PDF, JPG, PNG, DOC)</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={e => setGastoFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border rounded-lg text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-red-50 file:text-red-700 hover:file:bg-red-100" />
                  {gastoFile && (
                    <p className="text-xs text-green-600 mt-1">📎 {gastoFile.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Observaciones</label>
                  <textarea value={gastoForm.observaciones} onChange={e => setGastoForm({...gastoForm, observaciones: e.target.value})} rows={2}
                    className="w-full px-3 py-2 border rounded-lg text-sm resize-none" placeholder="Detalles adicionales..." />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={crearGasto} disabled={!gastoForm.solicitado_por || !gastoForm.concepto || !gastoForm.monto || !gastoForm.fecha}
                  className={`flex-1 py-2 text-white rounded-lg text-sm font-medium ${!gastoForm.solicitado_por || !gastoForm.concepto || !gastoForm.monto || !gastoForm.fecha ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>
                  🧾 Registrar Gasto
                </button>
                <button onClick={() => setShowGastoForm(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Firma Digital */}
      {showFirmaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">✍️ Firma Digital del Gasto</h3>
                <button onClick={() => setShowFirmaModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <p className="text-xs text-gray-500 mb-4">Ingresa las credenciales del solicitante para firmar digitalmente este gasto.</p>
              {firmaError && <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-2 rounded-lg mb-3">{firmaError}</div>}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email del firmante</label>
                  <input type="email" value={firmaEmail} onChange={e => setFirmaEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="correo@clinica.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña</label>
                  <input type="password" value={firmaPassword} onChange={e => setFirmaPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="••••••" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={confirmarFirma}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
                  ✍️ Firmar Digitalmente
                </button>
                <button onClick={() => setShowFirmaModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Autorización de Gasto */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">✅ Autorizar Gasto</h3>
                <button onClick={() => setShowAuthModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <p className="text-xs text-gray-500 mb-4">Solo supervisora/líder pueden autorizar. Ingresa tus credenciales para confirmar.</p>
              {authError && <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-2 rounded-lg mb-3">{authError}</div>}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email de la supervisora/líder</label>
                  <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="correo@clinica.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña</label>
                  <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="••••••" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={confirmarAutorizacion}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
                  ✅ Autorizar Gasto
                </button>
                <button onClick={() => setShowAuthModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Firma Entrega */}
      {showEntregaFirmaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">✍️ Firma Digital de Entrega</h3>
                <button onClick={() => setShowEntregaFirmaModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <p className="text-xs text-gray-500 mb-4">Ingresa las credenciales para firmar digitalmente esta entrega de dinero.</p>
              {entregaFirmaError && <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-2 rounded-lg mb-3">{entregaFirmaError}</div>}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email del firmante</label>
                  <input type="email" value={entregaFirmaEmail} onChange={e => setEntregaFirmaEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="correo@clinica.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña</label>
                  <input type="password" value={entregaFirmaPassword} onChange={e => setEntregaFirmaPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="••••••" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={confirmarFirmaEntrega}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
                  ✍️ Firmar Digitalmente
                </button>
                <button onClick={() => setShowEntregaFirmaModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Autorización Entrega */}
      {showEntregaAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">✅ Recibir Entrega de Dinero</h3>
                <button onClick={() => setShowEntregaAuthModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <p className="text-xs text-gray-500 mb-4">Solo supervisora/líder pueden recibir dinero. Ingresa tus credenciales para confirmar la recepción.</p>
              {entregaAuthError && <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-2 rounded-lg mb-3">{entregaAuthError}</div>}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email de la supervisora/líder</label>
                  <input type="email" value={entregaAuthEmail} onChange={e => setEntregaAuthEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="correo@clinica.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña</label>
                  <input type="password" value={entregaAuthPassword} onChange={e => setEntregaAuthPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="••••••" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={confirmarEntregaAuth}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
                  ✅ Confirmar Recepción
                </button>
                <button onClick={() => setShowEntregaAuthModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Cita */}
      {showCitaForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">📅 Programar Nueva Cita</h3>
                <button onClick={() => setShowCitaForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Paciente *</label>
                  <select value={citaForm.paciente_id} onChange={e => setCitaForm({...citaForm, paciente_id: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="">— Seleccionar paciente —</option>
                    {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Psicóloga *</label>
                  <select value={citaForm.psicologa_id} onChange={e => setCitaForm({...citaForm, psicologa_id: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="">— Seleccionar psicóloga —</option>
                    {usuarios.filter(u => u.rol === 'psicologa').map(u => (
                      <option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fecha *</label>
                    <input type="date" value={citaForm.fecha}
                      onChange={e => setCitaForm({...citaForm, fecha: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de Cita</label>
                    <select value={citaForm.tipo} onChange={e => setCitaForm({...citaForm, tipo: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm">
                      <option value="sesion">🧠 Sesión</option>
                      <option value="seguimiento">📋 Seguimiento</option>
                      <option value="evaluacion">📝 Evaluación</option>
                      <option value="taller">🎓 Taller</option>
                      <option value="otro">📌 Otro</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Hora Inicio *</label>
                    <input type="time" value={citaForm.hora_inicio}
                      onChange={e => setCitaForm({...citaForm, hora_inicio: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Hora Fin</label>
                    <input type="time" value={citaForm.hora_fin}
                      onChange={e => setCitaForm({...citaForm, hora_fin: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Motivo</label>
                  <input value={citaForm.motivo}
                    onChange={e => setCitaForm({...citaForm, motivo: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Motivo de la cita..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
                  <textarea value={citaForm.notas} onChange={e => setCitaForm({...citaForm, notas: e.target.value})} rows={2}
                    className="w-full px-3 py-2 border rounded-lg text-sm resize-none" placeholder="Notas adicionales..." />
                </div>

                <div className="border-t pt-3 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={citaBatch} onChange={e => setCitaBatch(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded" />
                    <span className="text-sm font-medium text-gray-700">📅 Programar mes completo (cada semana)</span>
                  </label>
                  {citaBatch && (
                    <div className="mt-2 bg-purple-50 rounded-lg p-3 space-y-2">
                      <p className="text-[11px] text-purple-600">Se crearán citas repetidas cada 7 días a partir de la fecha seleccionada.</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Número de citas</label>
                          <select value={citaBatchNum} onChange={e => setCitaBatchNum(e.target.value)}
                            className="w-full px-3 py-1.5 border rounded-lg text-sm">
                            {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} cita(s) — {n} semana(s)</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Día</label>
                          <div className="px-3 py-1.5 bg-white border rounded-lg text-sm text-gray-600">
                            {(() => {
                              const d = new Date(citaForm.fecha + 'T12:00:00');
                              const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
                              return dias[d.getDay()];
                            })()}
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500">
                        Ejemplo: {citaBatchNum} citas cada martes a las {citaForm.hora_inicio || '--:--'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={crearCita}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">
                  📅 {citaBatch ? `Programar ${citaBatchNum} Citas` : 'Programar Cita'}
                </button>
                <button onClick={() => setShowCitaForm(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Factura */}
      {showFacturaForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">🧾 Solicitar Factura</h3>
                <button onClick={() => setShowFacturaForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Paciente (opcional)</label>
                  <select value={facturaForm.paciente_id}
                    onChange={e => setFacturaForm({...facturaForm, paciente_id: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="">— Sin paciente / Público en general —</option>
                    {pacientes.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Concepto *</label>
                  <input value={facturaForm.concepto}
                    onChange={e => setFacturaForm({...facturaForm, concepto: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Ej: Servicios de psicología" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad</label>
                    <input type="number" step="0.01" min="0" value={facturaForm.cantidad}
                      onChange={e => setFacturaForm({...facturaForm, cantidad: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Unidad</label>
                    <select value={facturaForm.unidad}
                      onChange={e => setFacturaForm({...facturaForm, unidad: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm">
                      <option value="SERVICIO">Servicio</option>
                      <option value="ACT">Actividad</option>
                      <option value="E48">Unidad de servicio</option>
                      <option value="SES">Sesión</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Subtotal (MXN) *</label>
                    <input type="number" step="0.01" min="0" value={facturaForm.subtotal}
                      onChange={e => setFacturaForm({...facturaForm, subtotal: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 mt-6 cursor-pointer">
                      <input type="checkbox" checked={facturaIva} onChange={e => setFacturaIva(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded" />
                      <span className="text-sm font-medium text-gray-700">Incluir IVA 16%</span>
                    </label>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Total: ${(Number(facturaForm.subtotal || 0) + (facturaIva ? Number(facturaForm.subtotal || 0) * 0.16 : 0)).toLocaleString('es-MX')}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-3 mt-1">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Datos del receptor</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">RFC *</label>
                      <input value={facturaForm.rfc_receptor}
                        onChange={e => setFacturaForm({...facturaForm, rfc_receptor: e.target.value.toUpperCase()})}
                        className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="XAXX010101000" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Régimen Fiscal</label>
                      <select value={facturaForm.regimen_fiscal_receptor}
                        onChange={e => setFacturaForm({...facturaForm, regimen_fiscal_receptor: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm">
                        <option value="616">616 - Sin obligaciones fiscales</option>
                        <option value="601">601 - General de Ley Personas Morales</option>
                        <option value="603">603 - Personas Morales con Fines no Lucrativos</option>
                        <option value="605">605 - Sueldos y Salarios</option>
                        <option value="606">606 - Arrendamiento</option>
                        <option value="608">608 - Demás ingresos</option>
                        <option value="610">610 - Residentes en el Extranjero</option>
                        <option value="611">611 - Ingresos por Dividendos</option>
                        <option value="612">612 - Personas Físicas con Actividades Empresariales</option>
                        <option value="614">614 - Ingresos por intereses</option>
                        <option value="615">615 - Ingresos por obtención de premios</option>
                        <option value="621">621 - Régimen de Incorporación Fiscal</option>
                        <option value="625">625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas</option>
                        <option value="626">626 - Régimen Simplificado de Confianza</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Razón Social *</label>
                    <input value={facturaForm.razon_social_receptor}
                      onChange={e => setFacturaForm({...facturaForm, razon_social_receptor: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Nombre completo o razón social" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Uso CFDI</label>
                      <select value={facturaForm.uso_cfdi}
                        onChange={e => setFacturaForm({...facturaForm, uso_cfdi: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm">
                        <option value="S01">S01 - Sin efectos fiscales</option>
                        <option value="G01">G01 - Adquisición de mercancías</option>
                        <option value="G02">G02 - Devoluciones, descuentos y bonificaciones</option>
                        <option value="G03">G03 - Gastos en general</option>
                        <option value="I01">I01 - Construcciones</option>
                        <option value="I02">I02 - Mobiliario y equipo de oficina</option>
                        <option value="I03">I03 - Equipo de transporte</option>
                        <option value="I04">I04 - Equipo de cómputo</option>
                        <option value="I05">I05 - Dados, troqueles, moldes, matrices y herramental</option>
                        <option value="I06">I06 - Comunicaciones telefónicas</option>
                        <option value="I07">I07 - Comunicaciones satelitales</option>
                        <option value="I08">I08 - Otra maquinaria y equipo</option>
                        <option value="D01">D01 - Honorarios médicos, dentales y gastos hospitalarios</option>
                        <option value="D02">D02 - Gastos médicos por incapacidad o discapacidad</option>
                        <option value="D03">D03 - Gastos funerales</option>
                        <option value="D04">D04 - Donativos</option>
                        <option value="D05">D05 - Intereses reales efectivamente pagados por créditos hipotecarios</option>
                        <option value="D06">D06 - Aportaciones voluntarias al SAR</option>
                        <option value="D07">D07 - Primas por seguros de gastos médicos</option>
                        <option value="D08">D08 - Gastos de transportación escolar obligatoria</option>
                        <option value="D09">D09 - Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones</option>
                        <option value="D10">D10 - Pagos por servicios educativos (colegiaturas)</option>
                        <option value="P01">P01 - Por definir</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Forma de Pago</label>
                      <select value={facturaForm.forma_pago}
                        onChange={e => setFacturaForm({...facturaForm, forma_pago: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm">
                        <option value="01">01 - Efectivo</option>
                        <option value="02">02 - Cheque nominativo</option>
                        <option value="03">03 - Transferencia electrónica</option>
                        <option value="04">04 - Tarjeta de crédito</option>
                        <option value="28">28 - Tarjeta de débito</option>
                        <option value="99">99 - Por definir</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Método de Pago</label>
                      <select value={facturaForm.metodo_pago}
                        onChange={e => setFacturaForm({...facturaForm, metodo_pago: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm">
                        <option value="PUE">PUE - Pago en una sola exhibición</option>
                        <option value="PPD">PPD - Pago en parcialidades</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={crearFactura} disabled={guardandoFactura}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium">
                  {guardandoFactura ? 'Guardando...' : '🧾 Crear Solicitud'}
                </button>
                <button onClick={() => setShowFacturaForm(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
