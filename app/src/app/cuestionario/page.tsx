'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DictationButton from '@/components/DictationButton';


const INITIAL: Record<string, any> = {
  nombre:'', fecha_nac:'', sexo:'', estado_civil:'', escolaridad:'', ocupacion:'', trabaja:'', motivo_no_trabajo:'', telefono:'', email:'', direccion:'', contacto_emergencia:'', refirio:'', terapia_previa:'', detalle_terapia_previa:'', medicamentos:'', lista_medicamentos:'', diagnostico_previo:'', detalle_diagnostico:'',
  motivo_consulta:'', duracion_malestar:'', desencadenantes:'', intentos_previos:'', expectativas:'', sufre_1a10:'', compromiso_1a10:'',
  g28:0,g29:0,g30:0,g31:0,
  f32:'no',f33:'no',f34:'no',f35:'no',f36:'no',f37:'no',f38:'no',f39:'no',f40:'no',f41:'no',f42:'no',f43:'no',f44:'no',f45:'no',f46:'no',f47:'no',f48:'no',f49:'no',
  f32f:'',f33f:'',f34f:'',f35f:'',f36f:'',f37f:'',f38f:'',f39f:'',f40f:'',f41f:'',f42f:'',f43f:'',f44f:'',f45f:'',f46f:'',f47f:'',f48f:'',f49f:'',
  e50:'',e50c:'',e51:'',e51c:'',e52:'',e53:'',e54:'',e55:'',e55c:'',e56:'',e57:'',e58:'',e58c:'',e59:'',e59c:'',e60:'',e60c:'',e61:'',e62:'',
  h63:'',h63c:'',h64:'',h64c:'',h65:'',h65c:'',h66:'',h67:'',h67c:'',h68:'',h69:'',h69c:'',h70:'',h70c:'',h71:'',h71c:'',h72:'',h72c:'',h73:'',h74:'',h75:'',h76:'',
  m77:'',m77c:'',m78:'',m78c:'',m79:'',m79c:'',m80:'',m80c:'',m81:'',m81c:'',m82:'',m83:'',m84:'',m85:'',m86:'',
  r87:'',r88:'',r88c:'',r89:'',r90:'',r91:'',r92:'',r93:'',
  i94:'',i95:'',i96:'',i96c:'',i97:'',i97c:'',i98:'',i99:'',i100:'',i101:'',
  k102:'',k103:'',k104:'',k105:'',k106:'',k107:'',k108:'',k109:'',k110:'',
  l111:'',l112:'',l113:'',l114:'',l115:'',l116:'',l117:'',l118:'',
  com1:'',com2:'',com3:'',com4:'',com5:'',com5c:'',com6:'',com7:'',com8:'',com9:'',com9c:'',com10:'',com11:'',com12:'',com12c:'',com13:'',com14:'',com15:'',com16:'',com17:'',com18:'',com19:'',com20:'',com21:'',com22:'',com23:'',com24:'',com25:'',com26:'',com27:'',com28:'',
  m119:'',m120:'',m121:''
};

const YES_NO = [{v:'si',l:'Sí'},{v:'no',l:'No'}];
const SI_NO = YES_NO;
const SINO = YES_NO;
const FRECUENCIA = [{v:'',l:'—'},{v:'a_veces',l:'A veces'},{v:'frecuente',l:'Frecuente'},{v:'casi_siempre',l:'Casi siempre'}];
const SI_NO_CUAL = [{v:'si',l:'Sí'},{v:'no',l:'No'},{v:'otro',l:'Otro'}];
const ESTADO_CIVIL = ['Soltero/a','Casado/a','Divorciado/a','Unión libre','Otro'];
const ESCOLARIDAD = ['Primaria','Secundaria','Preparatoria','Licenciatura','Maestría','Doctorado'];
const REFIRIO = ['Médico','Amigo','Familiar','Búsqueda propia','Otro'];
const DURACION = ['Menos de 1 mes','1-3 meses','3-6 meses','6-12 meses','Más de 1 año'];
const NO_TRABAJO = ['Por salud','Despedido/a','Renunció','Nunca ha trabajado','Otro'];
const CALIF = [{v:'5',l:'1'},{v:'6',l:'2'},{v:'7',l:'3'},{v:'8',l:'4'},{v:'9',l:'5'},{v:'10',l:'6'},{v:'11',l:'7'},{v:'12',l:'8'},{v:'13',l:'9'},{v:'14',l:'10'}];
const HORARIO = ['Mañana','Tarde','Noche','Fin de semana'];
const TIPO_TERAPIA = ['Individual','Grupal','En línea','Pareja'];
const INFANCIA = ['Estable','Conflictiva','Difícil','Muy difícil'];
const RELACION_PAREJA = ['Sana','Conflictiva','Inexistente','Otra'];
const ALIMENTACION = ['Balanceada','Deficiente','Excesiva','Variable'];

function Label({children,required,className}:{children:React.ReactNode,required?:boolean,className?:string}){return <label className={`block text-sm font-medium text-gray-700 mb-1 ${className||''}`}>{children}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
function Input({value,onChange,type='text',placeholder='',required,className='',dictation}:{value:string,onChange:(v:string)=>void,type?:string,placeholder?:string,required?:boolean,className?:string,dictation?:boolean}){
  if (dictation && type === 'text') {
    return <div className="flex gap-1 items-stretch"><input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required={required}
      className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-gray-800 ${className}`} />
      <DictationButton onResult={(t)=>onChange(value+t)} className="self-center" /></div>;
  }
  return <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required={required}
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-gray-800 ${className}`} />;
}
function Select({value,onChange,options,required}:{value:string,onChange:(v:string)=>void,options:any[],required?:boolean}){
  return <select value={value} onChange={e=>onChange(e.target.value)} required={required}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-gray-800 bg-white">
    <option value="">— Seleccionar —</option>
    {options.map((o:any) => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.v} value={o.v}>{o.l}</option>)}
  </select>;
}
function YesNo({value,onChange}:{value:string,onChange:(v:string)=>void}){
  return <div className="flex gap-4">{SI_NO.map(o=><label key={o.v} className="flex items-center gap-2 cursor-pointer">
    <input type="radio" name={Math.random().toString()} checked={value===o.v} onChange={()=>onChange(o.v)} className="text-indigo-600" />
    <span className="text-sm text-gray-700">{o.l}</span></label>)}</div>;
}
function Textarea({value,onChange,rows=3,placeholder}:{value:string,onChange:(v:string)=>void,rows?:number,placeholder?:string}){
  return <div className="flex gap-1 items-start"><textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows} placeholder={placeholder}
    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-gray-800 resize-none" />
    <DictationButton onResult={(t)=>onChange(value+t)} className="mt-1" /></div>;
}
function Escala({value,onChange,min=1,max=10,label}:{value:string,onChange:(v:string)=>void,min?:number,max?:number,label:string}){
  return <div><Label>{label}</Label><div className="flex items-center gap-3">
    <span className="text-xs text-gray-500">{min}</span>
    <input type="range" min={min} max={max} value={value||'5'} onChange={e=>onChange(e.target.value)}
      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
    <span className="text-xs text-gray-500">{max}</span>
    <span className="ml-2 bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-sm font-semibold">{value||'5'}</span>
  </div></div>;
}
function Phq4({q,onChange,label}:{q:number,onChange:(v:number)=>void,label:string}){
  const opts=[{v:0,l:'Nada en absoluto'},{v:1,l:'Varios días'},{v:2,l:'Más de la mitad de los días'},{v:3,l:'Casi todos los días'}];
  return <div className="py-2 border-b border-gray-100"><Label>{label}</Label>
    <div className="flex flex-wrap gap-2 mt-1">{opts.map(o=><label key={o.v} className="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-indigo-50 transition-colors">
      <input type="radio" name={`phq${label}`} checked={q===o.v} onChange={()=>onChange(o.v)} className="text-indigo-600" />
      <span className="text-xs text-gray-700">{o.l} ({o.v})</span></label>)}</div></div>;
}

export default function CuestionarioPage(){
  const [form,setForm] = useState<Record<string,any>>(INITIAL);
  const [pacientes,setPacientes] = useState<any[]>([]);
  const [selectedPac, setSelectedPac] = useState('');
  const [selectedProg, setSelectedProg] = useState('');
  const [programas, setProgramas] = useState<any[]>([]);
  const [saved, setSaved] = useState(false);
  const [section, setSection] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const u = (k:string,v:any) => setForm(f=>({...f,[k]:v}));

  useEffect(()=>{
    setMounted(true);
    fetch('/api/me').then(r=>r.json()).then(data=>{
      if(data.user){
        setUser(data.user);
        fetch('/api/pacientes').then(r=>r.json()).then(d=>setPacientes(d.pacientes||[]));
        fetch('/api/programas').then(r=>r.json()).then(d=>setProgramas(Array.isArray(d)?d:d.programas||[]));
      }else{
        router.push('/login');
      }
    }).catch(()=>{router.push('/login');});
  },[]);

  const phq4 = Number(form.g28)+Number(form.g29)+Number(form.g30)+Number(form.g31);
  const phq4Level = phq4<=2?'Normal':phq4<=5?'Leve':phq4<=8?'Moderado':'Severo';
  const phq4Color = phq4<=2?'text-green-600':phq4<=5?'text-yellow-600':phq4<=8?'text-orange-600':'text-red-600';

  const riskItems = [form.k102,form.k103,form.k104,form.k105,form.k106].filter(x=>x==='si').length;
  const riskLevel = riskItems===0?'bajo':riskItems<=1?'medio':riskItems<=2?'alto':'critico';

  const sections = [
    {name:'Identificación',icon:'👤'},
    {name:'Motivo',icon:'💬'},
    {name:'PHQ-4',icon:'🧠'},
    {name:'Físicos',icon:'🏥'},
    {name:'Médico',icon:'💊'},
    {name:'Mental',icon:'💭'},
    {name:'Familiar',icon:'👨‍👩‍👧'},
    {name:'Relaciones',icon:'❤️'},
    {name:'Comida',icon:'🍽️'},
    {name:'Funcionamiento',icon:'⚡'},
    {name:'Riesgo',icon:'⚠️'},
    {name:'Expectativas',icon:'🎯'},
    {name:'Consentimiento',icon:'✍️'}
  ];

  const handleSave = async () => {
    if(!selectedPac){alert('Selecciona un paciente');return;}
    const body = { paciente_id:selectedPac, psicologa_id:user?.id, programa_id:selectedProg||null, respuestas:form, puntuacion_phq4:phq4, nivel_riesgo:riskLevel, completado:true };
    const res = await fetch('/api/cuestionario',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(res.ok){setSaved(true);setTimeout(()=>router.push('/'),1500);}
    else{alert('Error al guardar');}
  };

  if (!mounted) return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-500">Cargando...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={()=>router.push('/')} className="text-gray-500 hover:text-gray-700">← Volver</button>
            <h1 className="text-xl font-bold text-gray-800">📋 Cuestionario Inicial General</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>PHQ-4: <span className={`font-bold ${phq4Color}`}>{phq4}/12 ({phq4Level})</span></span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${riskLevel==='bajo'?'bg-green-100 text-green-700':riskLevel==='medio'?'bg-yellow-100 text-yellow-700':riskLevel==='alto'?'bg-orange-100 text-orange-700':'bg-red-100 text-red-700'}`}>
              Riesgo: {riskLevel.toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">
        <nav className="w-56 flex-shrink-0 hidden lg:block">
          <div className="bg-white rounded-xl shadow-sm border p-3 sticky top-20 space-y-1">
            {sections.map((s,i)=>(
              <button key={i} onClick={()=>setSection(i)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${section===i?'bg-indigo-100 text-indigo-700 font-semibold':'text-gray-600 hover:bg-gray-50'}`}>
                <span>{s.icon}</span><span>{s.name}</span>
              </button>
            ))}
            <hr className="my-2" />
            <div className="px-3 space-y-2">
              <Label>Paciente</Label>
              <select value={selectedPac} onChange={e=>setSelectedPac(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs">
                <option value="">— Seleccionar —</option>
                {pacientes.map(p=><option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
              </select>
              <Label>Programa</Label>
              <select value={selectedProg} onChange={e=>setSelectedProg(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs">
                <option value="">— Ninguno —</option>
                {programas.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
          </div>
        </nav>

        <main className="flex-1 min-w-0">
          <div className="lg:hidden mb-4 flex overflow-x-auto gap-2 pb-2">
            {sections.map((s,i)=>(
              <button key={i} onClick={()=>setSection(i)} className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${section===i?'bg-indigo-600 text-white':'bg-white text-gray-600 border'}`}>
                {s.icon} {s.name}
              </button>
            ))}
          </div>

          {section===0 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-3">👤 Datos de Identificación</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label required>Nombre completo</Label><Input dictation value={form.nombre} onChange={v=>u('nombre',v)} required /></div>
                <div><Label required>Fecha de nacimiento</Label><Input type="date" value={form.fecha_nac} onChange={v=>u('fecha_nac',v)} required /></div>
                <div><Label required>Sexo</Label><Select value={form.sexo} onChange={v=>u('sexo',v)} options={[{v:'mujer',l:'Mujer'},{v:'hombre',l:'Hombre'},{v:'nb',l:'No binario'},{v:'otro',l:'Otro'}]} required /></div>
                <div><Label required>Estado civil</Label><Select value={form.estado_civil} onChange={v=>u('estado_civil',v)} options={ESTADO_CIVIL} required /></div>
                <div><Label required>Escolaridad</Label><Select value={form.escolaridad} onChange={v=>u('escolaridad',v)} options={ESCOLARIDAD} required /></div>
                <div><Label>Ocupación actual</Label><Input dictation value={form.ocupacion} onChange={v=>u('ocupacion',v)} /></div>
                <div><Label>¿Trabaja actualmente?</Label><YesNo value={form.trabaja} onChange={v=>u('trabaja',v)} /></div>
                {form.trabaja==='no' && <div><Label>Desde cuándo dejó de trabajar</Label><Input dictation value={form.motivo_no_trabajo} onChange={v=>u('motivo_no_trabajo',v)} /></div>}
                <div><Label>Teléfono</Label><Input dictation value={form.telefono} onChange={v=>u('telefono',v)} /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={v=>u('email',v)} /></div>
                <div className="md:col-span-2"><Label>Dirección</Label><Input dictation value={form.direccion} onChange={v=>u('direccion',v)} /></div>
                <div className="md:col-span-2"><Label>Contacto de emergencia (nombre, parentesco, teléfono)</Label><Input dictation value={form.contacto_emergencia} onChange={v=>u('contacto_emergencia',v)} /></div>
                <div><Label>¿Quién lo refirió?</Label><Select value={form.refirio} onChange={v=>u('refirio',v)} options={REFIRIO} /></div>
                <div><Label>¿Ha recibido terapia antes?</Label><YesNo value={form.terapia_previa} onChange={v=>u('terapia_previa',v)} /></div>
                {form.terapia_previa==='si' && <div className="md:col-span-2"><Label>Detalle terapia previa</Label><Input dictation value={form.detalle_terapia_previa} onChange={v=>u('detalle_terapia_previa',v)} /></div>}
                <div><Label>¿Toma medicamentos?</Label><YesNo value={form.medicamentos} onChange={v=>u('medicamentos',v)} /></div>
                {form.medicamentos==='si' && <div className="md:col-span-2"><Label>Cuáles</Label><Input dictation value={form.lista_medicamentos} onChange={v=>u('lista_medicamentos',v)} /></div>}
                <div><Label>¿Diagnóstico psiquiátrico previo?</Label><YesNo value={form.diagnostico_previo} onChange={v=>u('diagnostico_previo',v)} /></div>
                {form.diagnostico_previo==='si' && <div className="md:col-span-2"><Label>Cuál(es)</Label><Input dictation value={form.detalle_diagnostico} onChange={v=>u('detalle_diagnostico',v)} /></div>}
              </div>
            </div>
          )}

          {section===1 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-3">💬 Motivo de Consulta</h2>
              <div><Label required>¿Qué le trajo a consulta hoy?</Label><Textarea value={form.motivo_consulta} onChange={v=>u('motivo_consulta',v)} /></div>
              <div><Label required>¿Desde cuándo se siente así?</Label><Select value={form.duracion_malestar} onChange={v=>u('duracion_malestar',v)} options={DURACION} required /></div>
              <div><Label>¿Qué situaciones o eventos desencadenaron este malestar?</Label><Textarea value={form.desencadenantes} onChange={v=>u('desencadenantes',v)} /></div>
              <div><Label>¿Qué ha intentado hacer para sentirse mejor?</Label><Textarea value={form.intentos_previos} onChange={v=>u('intentos_previos',v)} /></div>
              <div><Label required>¿Qué espera lograr con la terapia?</Label><Textarea value={form.expectativas} onChange={v=>u('expectativas',v)} /></div>
              <Escala value={form.sufre_1a10} onChange={v=>u('sufre_1a10',v)} label="¿Cuánto sufre por esta situación? (1-10)" />
              <Escala value={form.compromiso_1a10} onChange={v=>u('compromiso_1a10',v)} label="¿Qué tan comprometido está con el proceso terapéutico? (1-10)" />
            </div>
          )}

          {section===2 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-3">🧠 PHQ-4 — Rastreo Rápido</h2>
              <p className="text-sm text-gray-600 italic">Durante las últimas 2 semanas, ¿con qué frecuencia...</p>
              <Phq4 q={form.g28} onChange={v=>u('g28',v)} label="28. Sentirse nervioso/a, ansioso/a o al límite" />
              <Phq4 q={form.g29} onChange={v=>u('g29',v)} label="29. No ser capaz de detener o controlar la preocupación" />
              <Phq4 q={form.g30} onChange={v=>u('g30',v)} label="30. Tener poco interés o placer en hacer las cosas" />
              <Phq4 q={form.g31} onChange={v=>u('g31',v)} label="31. Sentirse deprimido/a, triste o sin esperanza" />
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Puntuación total:</span>
                  <span className={`text-2xl font-bold ${phq4Color}`}>{phq4}/12</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Nivel: <span className={`font-semibold ${phq4Color}`}>{phq4Level}</span></p>
                {phq4>=6 && <p className="text-sm text-orange-600 mt-2">⚠️ Se recomienda aplicar escalas específicas completas (GAD-7, PHQ-9)</p>}
              </div>
            </div>
          )}

          {section===3 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-3">🏥 Síntomas Físicos</h2>
              <p className="text-sm text-gray-600 italic">¿Ha experimentado alguno de los siguientes síntomas en el último mes?</p>
              {[{k:'f32',l:'Dolor de cabeza'},{k:'f33',l:'Dolor de espalda o cuello'},{k:'f34',l:'Dolor de estómago o malestar digestivo'},{k:'f35',l:'Palpitaciones o corazón acelerado'},{k:'f36',l:'Dificultad para respirar o sensación de ahogo'},{k:'f37',l:'Sudoración excesiva'},{k:'f38',l:'Temblores'},{k:'f39',l:'Mareos o sensación de desmayo'},{k:'f40',l:'Insomnio (dificultad para dormir)'},{k:'f41',l:'Dormir demasiado'},{k:'f42',l:'Cansancio o fatiga constante'},{k:'f43',l:'Pérdida de apetito'},{k:'f44',l:'Comer en exceso'},{k:'f45',l:'Tensión muscular'},{k:'f46',l:'Problemas de piel'},{k:'f47',l:'Cambios en el peso'},{k:'f48',l:'Dificultad para concentrarse'},{k:'f49',l:'Olvidos frecuentes'}].map(s=>(
                <div key={s.k} className="flex items-center gap-4 py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-700 flex-1">{s.l}</span>
                  <YesNo value={form[s.k]} onChange={v=>u(s.k,v)} />
                  {form[s.k]==='si' && <select value={form[s.k+'f']} onChange={e=>u(s.k+'f',e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs"><option value="">Frecuencia</option>{FRECUENCIA.slice(1).map(f=><option key={f.v} value={f.v}>{f.l}</option>)}</select>}
                </div>
              ))}
            </div>
          )}

          {section===4 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-3">💊 Historial Médico</h2>
              {[{k:'e50',l:'¿Tiene alguna enfermedad física diagnosticada?',c:'e50c'},{k:'e51',l:'¿Ha tenido intervenciones quirúrgicas?',c:'e51c'},{k:'e52',l:'¿Problemas cardíacos o hipertensión?'},{k:'e53',l:'¿Diabetes?'},{k:'e54',l:'¿Problemas de tiroides?'},{k:'e55',l:'¿Algún tipo de alergia?',c:'e55c'}].map(s=>(
                <div key={s.k} className="py-2 border-b border-gray-100">
                  <Label>{s.l}</Label>
                  <div className="mt-1"><YesNo value={form[s.k]} onChange={v=>u(s.k,v)} /></div>
                  {form[s.k]==='si' && s.c && <div className="mt-2"><Input dictation value={form[s.c]} onChange={v=>u(s.c,v)} placeholder="Especificar..." /></div>}
                </div>
              ))}
              <div className="py-2 border-b border-gray-100"><Label>¿Consume alcohol?</Label><Select value={form.e56} onChange={v=>u('e56',v)} options={[{v:'nunca',l:'Nunca'},{v:'ocasional',l:'Ocasional'},{v:'frecuente',l:'Frecuente'},{v:'diario',l:'Diario'}]} /></div>
              {form.e56 && form.e56!=='nunca' && <div><Label>Cuántas bebidas a la semana</Label><Input type="number" value={form.e57} onChange={v=>u('e57',v)} /></div>}
              <div className="py-2 border-b border-gray-100"><Label>¿Consume alguna otra sustancia?</Label><YesNo value={form.e58} onChange={v=>u('e58',v)} /></div>
              {form.e58==='si' && <div><Label>Cuál</Label><Input dictation value={form.e58c} onChange={v=>u('e58c',v)} /></div>}
              <div className="py-2 border-b border-gray-100"><Label>¿Fuma cigarrillos?</Label><YesNo value={form.e59} onChange={v=>u('e59',v)} /></div>
              {form.e59==='si' && <div><Label>Cuántos al día</Label><Input type="number" value={form.e59c} onChange={v=>u('e59c',v)} /></div>}
              <div className="py-2 border-b border-gray-100"><Label>¿Hace ejercicio físico regularmente?</Label><YesNo value={form.e60} onChange={v=>u('e60',v)} /></div>
              {form.e60==='si' && <div><Label>Tipo y frecuencia</Label><Input dictation value={form.e60c} onChange={v=>u('e60c',v)} placeholder="Ej: Gimnasio 3 veces por semana" /></div>}
              <div className="py-2 border-b border-gray-100"><Label>¿Cuántas horas duerme en promedio?</Label><Input type="number" value={form.e61} onChange={v=>u('e61',v)} /></div>
              <div className="py-2"><Label>¿Cómo describiría su alimentación?</Label><Select value={form.e62} onChange={v=>u('e62',v)} options={ALIMENTACION} /></div>
            </div>
          )}

          {section===5 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-3">💭 Historial Mental y Psicológico</h2>
              {[{k:'h63',l:'¿Ha sido hospitalizado/a por razones psiquiátricas?',c:'h63c'},{k:'h64',l:'¿Ha tenido episodios de ansiedad intensa?',c:'h64c'},{k:'h65',l:'¿Ha tenido episodios depresivos?',c:'h65c'},{k:'h66',l:'¿Ha tenido pensamientos de hacerse daño?'},{k:'h67',l:'¿Ha intentado suicidarse alguna vez?',c:'h67c'},{k:'h68',l:'¿Ha tenido episodios de euforia o manía?'},{k:'h69',l:'¿Realiza rituales o conductas repetitivas que no puede dejar de hacer?',c:'h69c'},{k:'h70',l:'¿Ha tenido ataques de pánico?',c:'h70c'},{k:'h71',l:'¿Evita situaciones específicas por miedo o ansiedad?',c:'h71c'},{k:'h72',l:'¿Ha presenciado o sufrido algún trauma?',c:'h72c'}].map(s=>(
                <div key={s.k} className="py-2 border-b border-gray-100">
                  <Label>{s.l}</Label>
                  <div className="mt-1"><YesNo value={form[s.k]} onChange={v=>u(s.k,v)} /></div>
                  {form[s.k]==='si' && s.c && <div className="mt-2"><Input dictation value={form[s.c]} onChange={v=>u(s.c,v)} placeholder="Especificar..." /></div>}
                </div>
              ))}
              <div className="py-2 border-b border-gray-100"><Label>Si sufrió trauma, ¿hace cuánto fue?</Label><Input dictation value={form.h73} onChange={v=>u('h73',v)} /></div>
              {[{k:'h74',l:'¿Tiene pesadillas o recuerdos intrusivos del trauma?'},{k:'h75',l:'¿Se siente desconectado/a de su cuerpo o de la realidad?'},{k:'h76',l:'¿Tiene dificultad para confiar en otros?'}].map(s=>(
                <div key={s.k} className="py-2 border-b border-gray-100"><Label>{s.l}</Label><div className="mt-1"><YesNo value={form[s.k]} onChange={v=>u(s.k,v)} /></div></div>
              ))}
            </div>
          )}

          {section===6 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-3">👨‍👩‍👧 Historial Familiar</h2>
              {[{k:'m77',l:'¿Alguien en su familia ha tenido problemas de ansiedad?',c:'m77c'},{k:'m78',l:'¿Alguien en su familia ha tenido depresión?',c:'m78c'},{k:'m79',l:'¿Alguien en su familia tiene o ha tenido adicciones?',c:'m79c'},{k:'m80',l:'¿Alguien en su familia ha tenido trastornos psiquiátricos graves?',c:'m80c'},{k:'m81',l:'¿Alguien en su familia se ha suicidado?',c:'m81c'}].map(s=>(
                <div key={s.k} className="py-2 border-b border-gray-100">
                  <Label>{s.l}</Label>
                  <div className="mt-1"><YesNo value={form[s.k]} onChange={v=>u(s.k,v)} /></div>
                  {form[s.k]==='si' && <div className="mt-2"><Input dictation value={form[s.c]} onChange={v=>u(s.c,v)} placeholder="¿Quién?" /></div>}
                </div>
              ))}
              <div className="py-2 border-b border-gray-100"><Label>¿Cómo describiría su infancia?</Label><Select value={form.m82} onChange={v=>u('m82',v)} options={INFANCIA} /></div>
              <div className="py-2 border-b border-gray-100"><Label>¿Sus padres están juntos?</Label><YesNo value={form.m83} onChange={v=>u('m83',v)} /></div>
              <div className="py-2 border-b border-gray-100"><Label>¿Quién lo crió principalmente?</Label><Input dictation value={form.m84} onChange={v=>u('m84',v)} /></div>
              {[{k:'m85',l:'¿Sufrió maltrato físico, emocional o sexual en la infancia?'},{k:'m86',l:'¿Se sintió querido/a y seguro/a de niño/a?'}].map(s=>(
                <div key={s.k} className="py-2 border-b border-gray-100"><Label>{s.l}</Label><div className="mt-1"><YesNo value={form[s.k]} onChange={v=>u(s.k,v)} /></div></div>
              ))}
            </div>
          )}

          {section===7 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-3">❤️ Relaciones y Vida Social</h2>
              <div className="py-2 border-b border-gray-100"><Label>¿Con quién vive actualmente?</Label><Select value={form.r87} onChange={v=>u('r87',v)} options={['Solo/a','Con pareja','Con familia','Con amigos','Compañeros']} /></div>
              <div className="py-2 border-b border-gray-100"><Label>¿Tiene hijos?</Label><YesNo value={form.r88} onChange={v=>u('r88',v)} /></div>
              {form.r88==='si' && <div><Label>Cuántos / edades</Label><Input dictation value={form.r88c} onChange={v=>u('r88c',v)} /></div>}
              <div className="py-2 border-b border-gray-100"><Label>¿Cómo es su relación de pareja actual?</Label><Select value={form.r89} onChange={v=>u('r89',v)} options={RELACION_PAREJA} /></div>
              {[{k:'r90',l:'¿Tiene amigos cercanos con quien pueda hablar?'},{k:'r91',l:'¿Se siente solo/a?'},{k:'r92',l:'¿Tiene una red de apoyo que pueda activar si la necesita?'},{k:'r93',l:'¿Alguien en su vida le hace sentir seguro/a?'}].map(s=>(
                <div key={s.k} className="py-2 border-b border-gray-100"><Label>{s.l}</Label><div className="mt-1"><YesNo value={form[s.k]} onChange={v=>u(s.k,v)} /></div></div>
              ))}
            </div>
          )}

          {section===8 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-3">🍽️ Relación con la Comida</h2>
              <p className="text-sm text-gray-500 italic">Esta sección evalúa problemas psicológicos relacionados con la alimentación.</p>

              <div className="py-2 border-b border-gray-100">
                <Label>1. ¿Cómo describiría su relación con la comida actualmente?</Label>
                <Select value={form.com1} onChange={v=>u('com1',v)} options={['Normal / Saludable','Problemas leves','Problemas moderados','Problemas graves','No quiero responder']} />
              </div>

              <div className="py-2 border-b border-gray-100">
                <Label>2. ¿Ha sentido culpa después de comer?</Label>
                <Select value={form.com2} onChange={v=>u('com2',v)} options={FRECUENCIA} />
              </div>

              <div className="py-2 border-b border-gray-100">
                <Label>3. ¿Ha dejado de comer o reducido cantidades por razones emocionales (tristeza, ansiedad, estrés)?</Label>
                <YesNo value={form.com3} onChange={v=>u('com3',v)} />
              </div>

              <div className="py-2 border-b border-gray-100">
                <Label>4. ¿Ha comido en exceso (binge) por razones emocionales?</Label>
                <YesNo value={form.com4} onChange={v=>u('com4',v)} />
              </div>

              {form.com4==='si' && (
                <div className="py-2 border-b border-gray-100 ml-4">
                  <Label>¿Con qué frecuencia come en exceso?</Label>
                  <Select value={form.com5} onChange={v=>u('com5',v)} options={FRECUENCIA} />
                  <div className="mt-2"><Label>¿Qué come generalmente en estos episodios?</Label><Input dictation value={form.com5c} onChange={v=>u('com5c',v)} placeholder="Comidas chatarra, dulces, etc." /></div>
                </div>
              )}

              <div className="py-2 border-b border-gray-100">
                <Label>5. ¿Ha provocado vómito después de comer para evitar ganar peso?</Label>
                <YesNo value={form.com6} onChange={v=>u('com6',v)} />
              </div>

              <div className="py-2 border-b border-gray-100">
                <Label>6. ¿Ha tomado laxantes, diuréticos o pastillas para bajar de peso sin receta médica?</Label>
                <YesNo value={form.com7} onChange={v=>u('com7',v)} />
              </div>

              <div className="py-2 border-b border-gray-100">
                <Label>7. ¿Ha hecho ejercicio excesivo para compensar lo que come?</Label>
                <YesNo value={form.com8} onChange={v=>u('com8',v)} />
              </div>

              <div className="py-2 border-b border-gray-100">
                <Label>8. ¿Se preocupa excesivamente por el peso o la forma de su cuerpo?</Label>
                <Select value={form.com9} onChange={v=>u('com9',v)} options={FRECUENCIA} />
              </div>

              {form.com9 && form.com9 !== '' && form.com9 !== 'nada' && (
                <div className="py-2 border-b border-gray-100 ml-4">
                  <Label>¿Cómo se describe a sí mismo cuando se mira al espejo?</Label>
                  <Select value={form.com9c} onChange={v=>u('com9c',v)} options={['Satisfecho/a','Normal','Con algo de insatisfacción','Muy insatisfecho/a','No me gusta lo que veo','Evito mirarme']} />
                </div>
              )}

              <div className="py-2 border-b border-gray-100">
                <Label>9. ¿Ha sentido que ha perdido el control sobre lo que come?</Label>
                <Select value={form.com10} onChange={v=>u('com10',v)} options={FRECUENCIA} />
              </div>

              <div className="py-2 border-b border-gray-100">
                <Label>10. ¿Evita ciertos alimentos o grupos de alimentos (carbohidratos, grasas, azúcar)?</Label>
                <YesNo value={form.com11} onChange={v=>u('com11',v)} />
              </div>

              {form.com11==='si' && (
                <div className="py-2 border-b border-gray-100 ml-4">
                  <Label>¿Cuáles alimentos evita?</Label>
                  <Input dictation value={form.com12} onChange={v=>u('com12',v)} placeholder="Ej: pan, arroz, frituras, dulces..." />
                  <div className="mt-2"><Label>¿Desde cuándo?</Label><Input dictation value={form.com12c} onChange={v=>u('com12c',v)} /></div>
                </div>
              )}

              <div className="py-2 border-b border-gray-100">
                <Label>11. ¿Ha recibido comentarios negativos sobre su peso o cuerpo por parte de familiares o amigos?</Label>
                <YesNo value={form.com13} onChange={v=>u('com13',v)} />
              </div>

              <div className="py-2 border-b border-gray-100">
                <Label>12. ¿Ha intentado dietas estrictas o programas de pérdida de peso?</Label>
                <Select value={form.com14} onChange={v=>u('com14',v)} options={['Nunca','1-2 veces','3-5 veces','Muchas veces']} />
              </div>

              <div className="py-2 border-b border-gray-100">
                <Label>13. ¿Ha tenido episodios de ayuno prolongado (más de 24 horas)?</Label>
                <YesNo value={form.com15} onChange={v=>u('com15',v)} />
              </div>

              <div className="py-2 border-b border-gray-100">
                <Label>14. ¿Ha dejado de comer socialmente por vergüenza o miedo a ser juzgado/a?</Label>
                <YesNo value={form.com16} onChange={v=>u('com16',v)} />
              </div>

              <div className="py-2 border-b border-gray-100">
                <Label>15. ¿Ha pensado en suicidio o autolesión relacionado con su imagen corporal o peso?</Label>
                <YesNo value={form.com17} onChange={v=>u('com17',v)} />
              </div>

              <div className="py-2 border-b border-gray-100">
                <Label>16. ¿Tiene conductas rituals o rutinas rígidas con la comida (comer en orden, cortar en pedazos específicos, etc.)?</Label>
                <YesNo value={form.com18} onChange={v=>u('com18',v)} />
              </div>

              <div className="py-2 border-b border-gray-100">
                <Label>17. ¿Ha notado cambios significativos en su peso en los últimos 6 meses?</Label>
                <Select value={form.com19} onChange={v=>u('com19',v)} options={['No','Subí 1-5 kg','Subí más de 5 kg','Bajé 1-5 kg','Bajé más de 5 kg','Fluctúa mucho']} />
              </div>

              <div className="py-2 border-b border-gray-100">
                <Label>18. ¿Ha sido diagnosticado/a con algún trastorno de la conducta alimentaria?</Label>
                <YesNo value={form.com20} onChange={v=>u('com20',v)} />
              </div>

              {form.com20==='si' && (
                <div className="py-2 border-b border-gray-100 ml-4">
                  <Label>¿Cuál?</Label>
                  <Select value={form.com21} onChange={v=>u('com21',v)} options={['Anorexia nerviosa','Bulimia nerviosa','Trastorno por atracones','Trastorno alimentario mixto','Otro']} />
                </div>
              )}

              <div className="py-2 border-b border-gray-100">
                <Label>19. ¿Ha recibido tratamiento previo por problemas de alimentación?</Label>
                <YesNo value={form.com22} onChange={v=>u('com22',v)} />
              </div>

              <div className="py-2 border-b border-gray-100">
                <Label>20. ¿Hay antecedentes familiares de trastornos alimentarios?</Label>
                <YesNo value={form.com23} onChange={v=>u('com23',v)} />
              </div>

              <div className="py-2 border-b border-gray-100">
                <Label>21. ¿Siente hambre cuando está ansioso/a o estresado/a?</Label>
                <Select value={form.com24} onChange={v=>u('com24',v)} options={FRECUENCIA} />
              </div>

              <div className="py-2 border-b border-gray-100">
                <Label>22. ¿Deja de tener apetito cuando está triste o deprimido/a?</Label>
                <Select value={form.com25} onChange={v=>u('com25',v)} options={FRECUENCIA} />
              </div>

              <div className="py-2 border-b border-gray-100">
                <Label>23. ¿Ha notado que come más cuando se siente solo/a?</Label>
                <Select value={form.com26} onChange={v=>u('com26',v)} options={FRECUENCIA} />
              </div>

              <div className="py-2 border-b border-gray-100">
                <Label>24. ¿Ha utilizado la comida como recompensa o castigo?</Label>
                <YesNo value={form.com27} onChange={v=>u('com27',v)} />
              </div>

              <div><Label>25. ¿Algo más que quiera compartir sobre su relación con la comida?</Label>
                <Textarea value={form.com28} onChange={v=>u('com28',v)} rows={3} placeholder="Cuente libremente..." /></div>
            </div>
          )}

          {section===9 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-3">⚡ Funcionamiento Diario</h2>
              {[{k:'i94',l:'¿Puede realizar sus actividades diarias (bañarse, comer, etc.)?',opts:['Sin problema','Con dificultad','No puede']},{k:'i95',l:'¿Asiste regularmente al trabajo/escuela?',opts:['si','no']},{k:'i96',l:'¿Su rendimiento laboral/académico ha cambiado?',opts:['si','no']}].map(s=>(
                <div key={s.k} className="py-2 border-b border-gray-100">
                  <Label>{s.l}</Label>
                  <Select value={form[s.k]} onChange={v=>u(s.k,v)} options={s.opts.map(o=>({v:o,l:o}))} />
                </div>
              ))}
              {form.i96==='si' && <div><Label>¿Cómo ha cambiado?</Label><Input dictation value={form.i96c} onChange={v=>u('i96c',v)} /></div>}
              <div className="py-2 border-b border-gray-100"><Label>¿Ha dejado de hacer actividades que antes disfrutaba?</Label><YesNo value={form.i97} onChange={v=>u('i97',v)} /></div>
              {form.i97==='si' && <div><Label>Cuáles</Label><Input dictation value={form.i97c} onChange={v=>u('i97c',v)} /></div>}
              <Escala value={form.i98} onChange={v=>u('i98',v)} label="Calidad de vida actual (1-10)" />
              <Escala value={form.i99} onChange={v=>u('i99',v)} label="Nivel de energía actual (1-10)" />
              <Escala value={form.i100} onChange={v=>u('i100',v)} label="Estado de ánimo actual (1-10)" />
              <Escala value={form.i101} onChange={v=>u('i101',v)} label="Satisfacción con sus relaciones (1-10)" />
            </div>
          )}

          {section===10 && (
            <div className={`rounded-xl shadow-sm border p-6 space-y-4 ${riskLevel==='critico'?'bg-red-50 border-red-300':riskLevel==='alto'?'bg-orange-50 border-orange-300':'bg-white'}`}>
              <h2 className="text-lg font-bold border-b pb-3 flex items-center gap-2">
                <span className={`text-xl ${riskLevel==='critico'?'text-red-600':riskLevel==='alto'?'text-orange-600':'text-gray-800'}`}>⚠️</span>
                <span>EvalUACIÓN DE RIESGO — CRÍTICO</span>
              </h2>
              <p className={`text-sm font-semibold ${riskLevel==='critico'?'text-red-700':riskLevel==='alto'?'text-orange-700':'text-gray-600'}`}>
                Si responde SÍ a alguna de las primeras 5 preguntas → Evaluar riesgo inmediatamente.
              </p>
              {[{k:'k102',l:'102. ¿Ha tenido pensamientos de quitarse la vida en las últimas 2 semanas?'},{k:'k103',l:'103. ¿Ha pensado en cómo lo haría?'},{k:'k104',l:'104. ¿Tiene acceso a medios para hacerse daño?'},{k:'k105',l:'105. ¿Ha tenido conductas de autolesión?'},{k:'k106',l:'106. ¿Ha perdido el interés en vivir?'},{k:'k107',l:'107. ¿Hay alguien en su vida que lo esté lastimando?'},{k:'k108',l:'108. ¿Alguien lo está obligando a hacer cosas que no quiere?'},{k:'k109',l:'109. ¿Consume sustancias para escapar de sus problemas?'},{k:'k110',l:'110. ¿Ha tenido episodios de violencia?'}].map(s=>(
                <div key={s.k} className="py-2 border-b border-gray-100 flex items-center gap-4">
                  <span className="text-sm text-gray-700 flex-1">{s.l}</span>
                  <YesNo value={form[s.k]} onChange={v=>u(s.k,v)} />
                </div>
              ))}
              {riskItems>0 && <div className="mt-4 p-4 bg-red-100 rounded-lg border border-red-300">
                <p className="text-red-800 font-bold">⚠️ Nivel de riesgo: {riskLevel.toUpperCase()}</p>
                <p className="text-red-700 text-sm mt-1">Se requiere evaluación inmediata y posible derivación a psiquiatría.</p>
              </div>}
            </div>
          )}

          {section===10 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-3">🎯 Expectativas y Motivación</h2>
              {[{k:'l111',l:'¿Qué espera lograr con la terapia?',rows:3},{k:'l112',l:'¿Qué cambiaría de su vida si pudiera?',rows:3},{k:'l113',l:'¿Qué ha intentado antes para sentirse mejor?',rows:3},{k:'l114',l:'¿Qué técnicas o enfoques le gustaría que se usaran?',rows:2}].map(s=>(
                <div key={s.k}><Label>{s.l}</Label><Textarea value={form[s.k]} onChange={v=>u(s.k,v)} rows={s.rows} /></div>
              ))}
              <div className="py-2 border-b border-gray-100"><Label>¿Qué horarios le funcionan mejor?</Label><Select value={form.l115} onChange={v=>u('l115',v)} options={HORARIO} /></div>
              <div className="py-2 border-b border-gray-100"><Label>¿Prefiere terapia individual, grupal o en línea?</Label><Select value={form.l116} onChange={v=>u('l116',v)} options={TIPO_TERAPIA} /></div>
              <div><Label>¿Hay algo que no esté dispuesto a trabajar en terapia?</Label><Textarea value={form.l117} onChange={v=>u('l117',v)} rows={2} /></div>
              <div><Label>¿Qué le gustaría que su terapeuta supiera de usted?</Label><Textarea value={form.l118} onChange={v=>u('l118',v)} rows={3} /></div>
            </div>
          )}

          {section===11 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-3">✍️ Consentimiento Informado</h2>
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 space-y-2">
                <p>Yo, <strong>{form.nombre || '________'}</strong>, declaro que:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>He leído y comprendido el proceso terapéutico que se me propone.</li>
                  <li>Comprendo que la terapia psicológica es un proceso voluntario.</li>
                  <li>Puedo retirarme en cualquier momento sin explicar motivos.</li>
                  <li>Mis datos serán tratados de forma confidencial.</li>
                  <li>Comprendo que en caso de riesgo vital, se contactarán mis números de emergencia.</li>
                </ul>
              </div>
              <div className="py-2 border-b border-gray-100"><Label>¿Ha leído y comprendido el consentimiento informado?</Label><YesNo value={form.m119} onChange={v=>u('m119',v)} /></div>
              <div className="py-2 border-b border-gray-100"><Label>¿Acepta el tratamiento psicológico?</Label><YesNo value={form.m120} onChange={v=>u('m120',v)} /></div>
              <div><Label>Fecha</Label><Input type="date" value={form.m121} onChange={v=>u('m121',v)} required /></div>
              <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
                <Label>Paciente</Label>
                <select value={selectedPac} onChange={e=>setSelectedPac(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-1">
                  <option value="">— Seleccionar paciente —</option>
                  {pacientes.map(p=><option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                </select>
                <Label className="mt-3">Programa asignado</Label>
                <select value={selectedProg} onChange={e=>setSelectedProg(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-1">
                  <option value="">— Ninguno aún —</option>
                  {programas.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              {saved ? (
                <div className="p-4 bg-green-100 rounded-lg text-center">
                  <p className="text-green-700 font-bold text-lg">✅ Cuestionario guardado exitosamente</p>
                  <p className="text-green-600 text-sm">Redirigiendo al panel principal...</p>
                </div>
              ) : (
                <button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg text-lg transition-colors mt-4">
                  💾 Guardar Cuestionario Completo
                </button>
              )}
            </div>
          )}

          <div className="flex justify-between mt-6 mb-8">
            <button onClick={()=>setSection(s=>Math.max(0,s-1))} disabled={section===0}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors">
              ← Anterior
            </button>
            <span className="text-sm text-gray-500 flex items-center">Sección {section+1} de {sections.length}</span>
            <button onClick={()=>setSection(s=>Math.min(sections.length-1,s+1))} disabled={section===sections.length-1}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
              Siguiente →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
