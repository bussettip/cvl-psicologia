import { NextRequest, NextResponse } from 'next/server';

const ZERNIO_API_KEY = process.env.ZERNIO_API_KEY || 'sk_74fe2e3e707fa98f461f6f0eb8a7103b601cc8ba13e2422956fe677301e6e911';
const ZERNIO_API_URL = 'https://zernio.com/api';

const CONOCIMIENTO = {
  centro: {
    nombre: 'Centro VivirLibre.org',
    psicologa: 'Gabriela Torres de Moroso Bussetti',
    experiencia: '22 años de experiencia (2004-2026)',
    telefono: '55-5418-0137',
    direccion: 'Cerro del Cubilete #145, Colonia Campestre Churubusco, Coyoacán, CP 04200, Cd.Mx.',
    web: 'www.inteligenciaemocional.mx',
    webTalleres: 'www.inteligenciaemocional.mx/talleres',
    webLibros: 'www.inteligenciaemocional.mx/libros',
    webPsicoterapia: 'www.inteligenciaemocional.mx/psicoterapia',
    ebookTienda: 'https://payhip.com/mipsicologa',
  },
  notaAniversario: '¡Bienvenid@ a Centro VivirLibre.org! Este año celebramos nuestro 22 Aniversario y por eso TODOS nuestros talleres presenciales en Cd.Mx. están con 50% de descuento: $499 (precio regular $999). Precios más IVA. Grupos limitados a 25 personas.',
  servicios: {
    psicoterapia: {
      tipos: ['Individual', 'De pareja', 'Grupal', 'Para niños/adolescentes', 'En línea (OnLine)', 'Citas'],
      url: 'www.inteligenciaemocional.mx/psicoterapia',
    },
    talleres: [
      { nombre: 'Taller de Inteligencia Emocional para Adolescentes', url: 'https://www.inteligenciaemocional.mx/adolescentes1', precio: '$499' },
      { nombre: 'Taller de Inteligencia Emocional para Adultos', url: 'https://www.inteligenciaemocional.mx/adultos', precio: '$499' },
      { nombre: 'Taller de PsicoNutrición', url: 'https://www.inteligenciaemocional.mx/psiconutricion', precio: '$499' },
      { nombre: 'Taller del Perdón (Tres caminos hacia el perdón)', url: 'https://www.inteligenciaemocional.mx/perdon', precio: '$499' },
      { nombre: 'Proceso de Divorcio Emocional', url: 'https://www.inteligenciaemocional.mx/de', precio: '$499' },
      { nombre: 'Taller "Las Mujeres que se Aman Demasiado"', url: 'https://www.inteligenciaemocional.mx/mujer', precio: '$499' },
      { nombre: 'Proceso "De Soledad a Solitud"', url: 'https://www.inteligenciaemocional.mx/solitud', precio: 'Desde $499' },
      { nombre: 'Taller "Aprendiendo a Vivir Libre"', url: 'https://www.inteligenciaemocional.mx', precio: '$499' },
      { nombre: 'Taller de Duelo y Tanatología', url: 'https://www.inteligenciaemocional.mx/duelo', precio: '$499' },
      { nombre: 'Taller de Duelo por una Mascota', url: 'https://www.inteligenciaemocional.mx/animalitos', precio: '$499' },
      { nombre: 'Taller "Del Miedo al Amor"', url: 'https://www.inteligenciaemocional.mx/delmiedoalamor', precio: '$600' },
      { nombre: 'Taller de Autoestima Femenina', url: 'https://www.inteligenciaemocional.mx/intro', precio: '$499' },
      { nombre: 'Codependencia (Taller GRATIS)', url: 'https://www.inteligenciaemocional.mx/codependencia', precio: 'GRATIS' },
      { nombre: 'Retiro de Inteligencia Espiritual', url: 'https://www.inteligenciaemocional.mx/ie', precio: 'Consultar' },
    ],
    libros: [
      { nombre: 'Vivir Libre', url: 'https://www.inteligenciaemocional.mx/librovl' },
      { nombre: 'Divorcio Emocional', url: 'https://www.inteligenciaemocional.mx/librode' },
      { nombre: 'Gimnasio Emocional', url: 'https://www.inteligenciaemocional.mx/libroge' },
      { nombre: 'Las Mujeres que SE Aman Demasiado', url: 'https://www.inteligenciaemocional.mx/libro' },
      { nombre: 'Paternaje basado en principios', url: 'https://www.inteligenciaemocional.mx/libropbp' },
    ],
    campamentos: [
      { nombre: 'Retiro de Inteligencia Espiritual', url: 'https://www.inteligenciaemocional.mx/retiro' },
      { nombre: 'Fogatas Terapéuticas', url: 'https://www.inteligenciaemocional.mx/fogatas' },
      { nombre: 'Campamento del Perdón', url: 'https://www.inteligenciaemocional.mx/campingperdon' },
    ],
    procesos: [
      { nombre: 'De Soledad a Solitud', url: 'https://www.inteligenciaemocional.mx/solitud' },
      { nombre: 'Divorcio Emocional', url: 'https://www.inteligenciaemocional.mx/de' },
      { nombre: 'Proyecto Gaviota', url: 'https://www.inteligenciaemocional.mx/pg' },
      { nombre: 'Grupo Codependencia', url: 'https://www.inteligenciaemocional.mx/grupo' },
    ],
    codependencia: {
      opciones: ['Taller GRATIS de introducción', 'Grupo terapéutico', 'Especialidad en Codependencia'],
      url: 'https://www.inteligenciaemocional.mx/codependencia',
    },
  },
};

function detectarTema(mensaje: string): string {
  const m = mensaje.toLowerCase();
  if (/\b(hola|buenos?|buenas?|saludos?|hey)\b/.test(m)) return 'saludo';
  if (/\b(precio|costo|cuánto|cuanto|tarifa|costos?|pagan|cobran)\b/.test(m)) return 'precios';
  if (/\b(horario|horarios?|cuándo|cuando|disponibilidad|atención)\b/.test(m)) return 'horarios';
  if (/\b(terapia|psicoterapia|sesión|sesiones|consulta|consultas?)\b/.test(m)) return 'terapia';
  if (/\b(taller|talleres|workshop|capacitación)\b/.test(m)) return 'talleres';
  if (/\b(camping|campamento|retiro|fogata)\b/.test(m)) return 'campamentos';
  if (/\b(codependencia|dependencia|relacion|pareja)\b/.test(m)) return 'codependencia';
  if (/\b(duelo|perdón|perdon|perdonar)\b/.test(m)) return 'duelo';
  if (/\b(autoestima|autoconcepto|amor propio)\b/.test(m)) return 'autoestima';
  if (/\b(niño|niña|adolescente|joven|kid)\b/.test(m)) return 'ninos';
  if (/\b(mujer|mujeres|femenino|femenina)\b/.test(m)) return 'mujeres';
  if (/\b(varón|varones|hombre| hombres)\b/.test(m)) return 'varones';
  if (/\b(cita|agendar|agendar|reservar|appointment)\b/.test(m)) return 'cita';
  if (/\b(equipo|psicóloga|psicologa|staff)\b/.test(m)) return 'equipo';
  if (/\b(libro|libros|lectura|leer)\b/.test(m)) return 'libros';
  if (/\b(gratis|gratuito|free|sin costo)\b/.test(m)) return 'gratis';
  if (/\b(grupo|grupos|terapia grupal)\b/.test(m)) return 'grupos';
  return 'general';
}

function generarRespuesta(tema: string, mensaje: string): string {
  const { centro, servicios } = CONOCIMIENTO;
  const nombre = centro.psicologa.split(' ')[0];

  switch (tema) {
    case 'saludo':
      return `¡Hola! Soy la asistente virtual del ${centro.nombre}. ¿En qué puedo ayudarle hoy? Ofrecemos psicoterapia, talleres de inteligencia emocional y campamentos terapéuticos.`;

    case 'precios':
      return `Nuestros costos son muy accesibles. La psicoterapia individual comienza desde $250 pesos mensuales. Para información detallada sobre talleres y campamentos, envíe un WhatsApp al ${centro.telefono} o visite ${centro.web}.`;

    case 'horarios':
      return `Trabajamos con horarios flexibles, a acordar con cada especialista. Ofrecemos modalidad en línea para mayor comodidad. Para agendar una cita, contacte al ${centro.telefono}.`;

    case 'terapia':
      return `Ofrecemos psicoterapia individual, de pareja, grupal y para niños/adolescentes, toda en modalidad en línea. ${nombre} cuenta con ${centro.experiencia}. ¿Desea agendar una sesión de diagnóstico?`;

    case 'talleres':
      return `Contamos con talleres de: Inteligencia Emocional, Del miedo al amor, 3 caminos hacia el perdón, Psiconutrición, Inteligencia Espiritual, Duelo y más. Para fechas y costos, visite ${centro.web}/talleres o contacte al ${centro.telefono}.`;

    case 'campamentos':
      return `Nuestros campamentos terapéuticos incluyen: Inteligencia Espiritual, Fogatas Terapéuticas y Campamento del Perdón. Son experiencias transformadoras de fin de semana. Más info en ${centro.web}.`;

    case 'codependencia':
      return `Para la codependencia ofrecemos: Taller GRATIS para iniciarse, Grupo terapéutico "Gimnasio Emocional" y Certificación profesional. ${nombre} es especialista en esta área. ¿Le interesa algún programa?`;

    case 'duelo':
      return `Tenemos el Taller de Duelo y Tanatología, el Taller de Duelo por Animalitos, y el Campamento del Perdón. Cada taller aborda diferentes facetas del proceso de duelo. ¿Necesita información específica?`;

    case 'autoestima':
      return `Para trabajar la autoestima recomendamos: Proyecto Gaviota (grupo terapéutico), "El arte de amarme" (taller femenino) y "Del miedo al amor" (autoconfianza). ¿Le gustaría saber más sobre alguno?`;

    case 'ninos':
      return `Atendemos niños y adolescentes con psicoterapia especializada. También contamos con talleres de Inteligencia Emocional para esta población. Para más información, contacte al ${centro.telefono}.`;

    case 'mujeres':
      return `Para mujeres ofrecemos: "El arte de amarme" (autoestima femenina), "Las mujeres que se aman demasiado" (campamento) y grupos terapéuticos especializados. ${nombre} es experta en empoderamiento femenino.`;

    case 'varones':
      return `Tenemos talleres y grupos específicos para varones que desean trabajar su inteligencia emocional y sus relaciones. Para más información, contacte al ${centro.telefono}.`;

    case 'cita':
      return `Para agendar una cita, envíe un WhatsApp al ${centro.telefono} o visite ${centro.web}/citas. También puede agendar una sesión de diagnóstico de 45 minutos con ${nombre}.`;

    case 'equipo':
      return `${nombre} es psicóloga clínica con ${centro.experiencia}. Contamos con un equipo de profesionales especializados en diferentes áreas. Más info en ${centro.web}/equipo.`;

    case 'libros':
      return `${nombre} es autora de: "Divorcio Emocional", "Gimnasio Emocional", "Las mujeres que SE aman demasiado", "Paternaje basado en principios" y "Vivir Libre". Disponibles en ${centro.web}/libros.`;

    case 'gratis':
      return `Ofrecemos una sesión grupal gratuita para que conozca nuestros grupos (Proyecto Gaviota o Gimnasio Emocional). También tenemos el Taller de Codependencia GRATIS. ¿Le interesa?`;

    case 'grupos':
      return `Nuestros grupos terapéuticos incluyen: Proyecto Gaviota (autoestima), Gimnasio Emocional (codependencia) y grupos de psicoterapia grupal. Todos son en línea. Para más información, contacte al ${centro.telefono}.`;

    default:
      return `Gracias por contactarnos. Ofrecemos psicoterapia, talleres de inteligencia emocional y campamentos terapéuticos. Para información específica, puede visitar ${centro.web} o escribir al ${centro.telefono}. ¿En qué puedo ayudarle?`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, data } = body;

    if (event !== 'message.received') {
      return NextResponse.json({ ok: true });
    }

    const mensaje = data?.text || '';
    const remitente = data?.from || '';
    const conversationId = data?.conversationId || '';
    const accountId = data?.accountId || '';

    if (!mensaje || !remitente) {
      return NextResponse.json({ ok: true });
    }

    const tema = detectarTema(mensaje);
    const respuesta = generarRespuesta(tema, mensaje);

    await fetch(`${ZERNIO_API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ZERNIO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId,
        to: remitente,
        type: 'text',
        text: respuesta,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'WhatsApp webhook activo' });
}
