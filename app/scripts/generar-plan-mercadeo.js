const XLSX = require('xlsx');
const path = require('path');

const wb = XLSX.utils.book_new();

// ─── HOJA 1: Resumen Ejecutivo ────────────────────────────
const resumen = [
  ['PLAN DE MERCADEO — CLÍNICA DE PSICOLOGÍA'],
  ['Ocupación al 100% | Sur de la Ciudad de México'],
  [''],
  ['OBJETIVO GENERAL'],
  ['Mantener ocupación al 100% (1,100 sesiones/mes) de forma sostenida,'],
  ['enfocándose en mujeres de 30-55 años del sur de la Ciudad de México'],
  ['con problemas emocionales, de ansiedad, depresión y relaciones.'],
  [''],
  ['DATOS CLAVE'],
  ['Sesiones totales/mes (100% capacidad)', '1,100'],
  ['Ocupación actual estimada (70%)', '770'],
  ['Sesiones adicionales necesarias', '330'],
  ['Pacientes adicionales necesarios (~10 sesiones c/u)', '33'],
  ['Ingreso adicional mensual (330 × $750)', '$247,500 MXN'],
  [''],
  ['PÚBLICO OBJETIVO'],
  ['Género', 'Mujer'],
  ['Edad', '30-55 años'],
  ['Zona', 'Sur CDMX (Coyoacán, Tlalpan, Xochimilco, Milpa Alta, Tláhuac, Iztapalapa Sur)'],
  ['Nivel socioeconómico', 'Medio / Medio-alto'],
  ['Problemas principales', 'Ansiedad, depresión, estrés laboral, problemas de pareja, duelos, autoestima'],
  ['Canal digital', 'Instagram, Facebook, WhatsApp, correo electrónico'],
  [''],
  ['SUB-SEGMENTOS PRIORITARIOS'],
  ['Mujeres 30-40', 'Estrés laboral, maternidad, crisis de pareja, ansiedad'],
  ['Mujeres 40-50', 'Crisis de mediana edad, menopausia, duelos, vacío existencial'],
  ['Mujeres 50-55', 'Síndrome del nido, duelos, depresión, replanteamiento de vida'],
  [''],
  ['PRESUPUESTO MENSUAL TOTAL', '$19,000 MXN (~1.6% de ingresos)'],
  ['META DE OCUPACIÓN', '≥95% (1,045 sesiones/mes)'],
];
const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
wsResumen['!cols'] = [{ wch: 55 }, { wch: 50 }];
XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen Ejecutivo');

// ─── HOJA 2: Pilares de Contenido ─────────────────────────
const pilares = [
  ['PILARES DE CONTENIDO — Rotación Semanal'],
  [''],
  ['Día', 'Pilar', 'Ejemplo', 'Plataforma'],
  ['Lunes', '💡 Educación', '5 señales de que tu ansiedad necesita atención profesional', 'Instagram + Facebook'],
  ['Martes', '💬 Testimonio/Transformación', 'María logró superar su crisis de ansiedad en 12 sesiones', 'Instagram + Correo'],
  ['Miércoles', '🧠 Tips prácticos', '3 respiraciones para calmar un ataque de ansiedad ahora', 'Instagram Reels + TikTok'],
  ['Jueves', '🤝 Cercanía/Humanización', '¿Sabías que pedir ayuda es un acto de valentía?', 'Facebook + Instagram Stories'],
  ['Viernes', '📢 Llamada a la acción', 'Agenda tu primera sesión con 20% de descuento', 'Todos los canales'],
  [''],
  ['VOLUMEN MENSUAL DE CONTENIDO'],
  ['Tipo', 'Cantidad/mes', 'Descripción'],
  ['Publicaciones estáticas', '12-16', 'Imágenes con frases, datos, infografías'],
  ['Reels/Carruseles', '8-10', 'Videos cortos, tutoriales, tips'],
  ['Historias', '20-30', 'Contenido diario, encuestas, preguntas'],
  ['Correos electrónicos', '4', 'Newsletter quincenal'],
  ['Artículos/Blog', '2', 'SEO + autoridad'],
  ['WhatsApp Broadcast', '2-4', 'Ofertas, recordatorios, contenido exclusivo'],
];
const wsPilares = XLSX.utils.aoa_to_sheet(pilares);
wsPilares['!cols'] = [{ wch: 22 }, { wch: 30 }, { wch: 60 }, { wch: 35 }];
XLSX.utils.book_append_sheet(wb, wsPilares, 'Pilares de Contenido');

// ─── HOJA 3: Calendario Editorial ─────────────────────────
const calendario = [
  ['CALENDARIO EDITORIAL — Mes Completo (4 Semanas)'],
  [''],
  ['SEMANA 1'],
  ['Día', 'Canal', 'Contenido', 'Tipo'],
  ['Lunes', 'IG + FB', '¿Sabías que el 40% de las mujeres mexicanas sufren ansiedad?', 'Dato impactante'],
  ['Martes', 'IG Stories', 'Encuesta: ¿Cuál es tu mayor fuente de estrés?', 'Interacción'],
  ['Miércoles', 'IG Reels', '3 técnicas de respiración que puedes hacer en tu trabajo', 'Educación'],
  ['Jueves', 'Correo', 'Newsletter: Por qué las mujeres callan su dolor', 'Nutrición'],
  ['Viernes', 'IG + FB', 'Agenda tu sesión con 20% de descuento + CTA', 'Conversión'],
  [''],
  ['SEMANA 2'],
  ['Día', 'Canal', 'Contenido', 'Tipo'],
  ['Lunes', 'IG Carrusel', '5 tipos de ansiedad que debes conocer', 'Educación'],
  ['Martes', 'IG Stories', 'Behind the scenes de la clínica', 'Cercanía'],
  ['Miércoles', 'FB Live', 'Pregúntale a la psicóloga (30 min)', 'Autoridad'],
  ['Jueves', 'WhatsApp', 'Tips para dormir mejor esta noche', 'Valor'],
  ['Viernes', 'IG + FB', 'Testimonio + CTA', 'Conversión'],
  [''],
  ['SEMANA 3'],
  ['Día', 'Canal', 'Contenido', 'Tipo'],
  ['Lunes', 'IG', 'La depresión no es debilidad, es una enfermedad', 'Romper estigma'],
  ['Martes', 'IG Reels', 'Ejercicio de autoestima en 2 minutos', 'Tips prácticos'],
  ['Miércoles', 'Correo', 'Newsletter: Señales de que necesitas hablar con alguien', 'Nutrición'],
  ['Jueves', 'IG Stories', 'Pregunta abierta: ¿Qué te gustaría mejorar de ti?', 'Interacción'],
  ['Viernes', 'IG + FB', 'Taller gratuito próximo + registro', 'Evento'],
  [''],
  ['SEMANA 4'],
  ['Día', 'Canal', 'Contenido', 'Tipo'],
  ['Lunes', 'IG Carrusel', 'Cómo explicarle a tu familia que necesitas terapia', 'Educación'],
  ['Martes', 'IG Stories', 'Testimonio anónimo escrito', 'Prueba social'],
  ['Miércoles', 'IG Reels', 'Señales de burnout en mujeres trabajadoras', 'Educación'],
  ['Jueves', 'WhatsApp Broadcast', 'Oferta especial fin de mes', 'Conversión'],
  ['Viernes', 'IG + FB', 'Resumen del mes + CTA permanente', 'Conversión'],
];
const wsCalendario = XLSX.utils.aoa_to_sheet(calendario);
wsCalendario['!cols'] = [{ wch: 18 }, { wch: 22 }, { wch: 65 }, { wch: 20 }];
XLSX.utils.book_append_sheet(wb, wsCalendario, 'Calendario Editorial');

// ─── HOJA 4: Estrategia por Canal ─────────────────────────
const canales = [
  ['ESTRATEGIA POR CANAL'],
  [''],
  ['📱 INSTAGRAM (Canal Principal)'],
  ['Objetivo', 'Generar confianza y acercamiento'],
  ['Frecuencia', '3-4 publicaciones/semana + stories diarias'],
  ['Contenido', 'Carruseles educativos, reels de tips, historias de transformación'],
  ['Presupuesto publicidad', '$4,000 MXN/mes'],
  ['Segmentación', 'Mujeres 30-55, CDMX sur, intereses en salud mental, bienestar, autoayuda'],
  ['Objetivo publicidad', 'Mensajes Directos + WhatsApp'],
  ['Hashtags estratégicos', '#PsicologíaSurCDMX #AnsiedadCDMX #DepresiónMujer #SaludMentalMujer #TerapiaEnLínea #PsicólogaEnCoyoacán #BienestarEmocional #MujerFuerte #AutoestimaMujer'],
  [''],
  ['📘 FACEBOOK'],
  ['Objetivo', 'Alcance comunitario y grupos'],
  ['Frecuencia', '2-3 publicaciones/semana'],
  ['Estrategia especial', 'Crear grupo "Mujeres en Equilibrio — Sur CDMX"'],
  ['Contenido grupo', 'Contenido exclusivo, live sessions mensuales, comunidad de apoyo'],
  ['Presupuesto publicidad', '$3,000 MXN/mes'],
  ['Segmentación', 'Mujeres 30-55, radio 15km de la clínica'],
  [''],
  ['📧 CORREO ELECTRÓNICO'],
  ['Objetivo', 'Nutrir leads y fidelizar pacientes'],
  ['Frecuencia', 'Quincenal (2 correos/mes)'],
  ['Secuencia de bienvenida', '5 correos en 21 días (bienvenida → educación → testimonio → oferta → recordatorio)'],
  [''],
  ['💬 WHATSAPP BUSINESS'],
  ['Objetivo', 'Atención directa y cercana'],
  ['Automatización', 'Respuestas rápidas para precios, seguros, agendamiento'],
  ['Broadcast', 'Ofertas especiales, recordatorios de seguimiento'],
];
const wsCanales = XLSX.utils.aoa_to_sheet(canales);
wsCanales['!cols'] = [{ wch: 28 }, { wch: 80 }];
XLSX.utils.book_append_sheet(wb, wsCanales, 'Estrategia por Canal');

// ─── HOJA 5: Funnel y Métricas ────────────────────────────
const funnel = [
  ['FUNNEL DE CAPTACIÓN — Métricas por Etapa'],
  [''],
  ['Etapa', 'Descripción', 'Métrica', 'Meta mensual'],
  ['Awareness', 'Conocimiento — Redes sociales, Google, referidos', 'Alcance publicaciones', '10,000-15,000 personas'],
  ['Interés', 'Interés — Visita perfil, descarga contenido, sigue cuenta', 'Seguidores nuevos', '+200-300'],
  ['Consideración', 'Consideración — Envía DM, llama, visita página', 'Mensajes/llamadas recibidas', '40-60'],
  ['Conversión', 'Conversión — Agenda primera sesión', 'Primera sesión agendada', '25-35'],
  ['Retención', 'Retención — Sigue en tratamiento, recomienda', 'Pacientes en tratamiento activo', '100+'],
  [''],
  ['INDICADORES CLAVE (KPIs)'],
  ['KPI', 'Meta', 'Frecuencia'],
  ['Ocupación', '≥95% (1,045 sesiones/mes)', 'Semanal'],
  ['Nuevos pacientes/mes', '25-35', 'Mensual'],
  ['Costo por lead', '<$150', 'Mensual'],
  ['Costo por adquisición', '<$500', 'Mensual'],
  ['Tasa de conversión (lead → paciente)', '≥15%', 'Mensual'],
  ['Retención a 3 meses', '≥70%', 'Trimestral'],
  ['Seguidores nuevos IG', '+200/mes', 'Mensual'],
  ['Tasa de apertura correos', '≥25%', 'Mensual'],
  ['Referidos de pacientes', '≥10/mes', 'Mensual'],
  ['Satisfacción paciente', '≥4.5/5', 'Trimestral'],
];
const wsFunnel = XLSX.utils.aoa_to_sheet(funnel);
wsFunnel['!cols'] = [{ wch: 35 }, { wch: 60 }, { wch: 35 }, { wch: 30 }];
XLSX.utils.book_append_sheet(wb, wsFunnel, 'Funnel y Métricas');

// ─── HOJA 6: Ofertas y Promociones ────────────────────────
const ofertas = [
  ['OFERTAS Y PROMOCIONES — Rotación Mensual'],
  [''],
  ['Oferta', 'Target', 'Canal', 'Duración', 'ROI esperado'],
  ['20% dto primera sesión', 'Nuevos pacientes', 'Instagram + Correo', 'Permanente', 'Alto — bajo costo de adquisición'],
  ['Sesión de pareja $900', 'Parejas en crisis', 'Facebook Ads', 'Quincenal', 'Medio — nicho específico'],
  ['Pausa activa emocional', 'Mujeres estresadas', 'Instagram Reels', 'Semanal', 'Alto — contenido viral'],
  ['Taller gratuito "Ansiedad"', 'Leads fríos', 'Eventbrite + Facebook', 'Mensual', 'Medio — genera base de datos'],
  ['Referido + sesión gratis', 'Pacientes actuales', 'WhatsApp + Correo', 'Permanente', 'Muy alto — boca a boca'],
  ['Pack 8 sesiones $5,400', 'Compromiso largo plazo', 'Correo + WhatsApp', 'Mensual', 'Alto — recurrencia'],
  [''],
  ['ALIANZAS ESTRATÉGICAS — Sur CDMX'],
  ['Aliado', 'Tipo de alianza'],
  ['Gimnasios de women-only', 'Flyers + descuento cruzado'],
  ['Centros de yoga/pilates', 'Talleres conjuntos'],
  ['Farmacias', 'Folletos en zona de espera'],
  ['Ginecólogos/médicos', 'Red de derivaciones'],
  ['Centros de belleza', 'Tarjetas de presentación'],
  ['Empresas locales', 'Programa de bienestar laboral'],
];
const wsOfertas = XLSX.utils.aoa_to_sheet(ofertas);
wsOfertas['!cols'] = [{ wch: 32 }, { wch: 25 }, { wch: 30 }, { wch: 18 }, { wch: 40 }];
XLSX.utils.book_append_sheet(wb, wsOfertas, 'Ofertas y Alianzas');

// ─── HOJA 7: Presupuesto ──────────────────────────────────
const presupuesto = [
  ['PRESUPUESTO DE MARKETING MENSUAL'],
  [''],
  ['Concepto', 'Inversión (MXN)', '% del total', 'Detalle'],
  ['Facebook Ads', '$3,000', '15.8%', 'Segmentación sur CDMX, mujeres 30-55'],
  ['Instagram Ads', '$4,000', '21.1%', 'Carruseles + Reels patrocinados'],
  ['Google Ads', '$3,000', '15.8%', '"Psicóloga en Coyoacán", "ansiedad tratamiento"'],
  ['Diseño gráfico', '$2,000', '10.5%', 'Canva Pro + plantillas'],
  ['Email marketing', '$1,000', '5.3%', 'Mailchimp Free o Sendinblue'],
  ['Talleres gratuitos', '$2,000', '10.5%', 'Espacio, material, refrigerios'],
  ['Impresos', '$1,500', '7.9%', 'Flyers, tarjetas, calendarios'],
  ['Contenido audiovisual', '$2,500', '13.2%', 'Edición de reels, fotos'],
  [''],
  ['TOTAL', '$19,000', '100%', '~1.6% de ingresos a ocupación plena'],
  [''],
  ['ANÁLISIS DE RETORNO'],
  ['Inversión mensual', '$19,000'],
  ['Sesiones adicionales necesarias', '330'],
  ['Ingreso adicional (330 × $750)', '$247,500'],
  ['ROI mensual', '13x ($247,500 / $19,000)'],
  ['Costo por paciente adquirido', '~$576 ($19,000 / 33)'],
];
const wsPresupuesto = XLSX.utils.aoa_to_sheet(presupuesto);
wsPresupuesto['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 12 }, { wch: 55 }];
XLSX.utils.book_append_sheet(wb, wsPresupuesto, 'Presupuesto');

// ─── HOJA 8: Ejemplos de Copy ─────────────────────────────
const copy = [
  ['EJEMPLOS DE COPY PARA PUBLICACIONES'],
  [''],
  ['POST 1 — ANSIEDAD'],
  ['Redes sociales:', ''],
  ['', '¿Sientes que tu corazón se acelera sin razón?'],
  ['', 'Tienes dificultad para dormir o concentrarte?'],
  ['', 'La ansiedad no tiene por ser tu compañera de vida.'],
  ['', ''],
  ['', 'En nuestra clínica en el sur de la CDMX,'],
  ['', 'te ayudamos a recuperar tu paz interior'],
  ['', 'con un equipo de psicólogas especializadas.'],
  ['', ''],
  ['', '📞 Agenda tu primera sesión: (55) 1234-5678'],
  ['', '💬 WhatsApp: (55) 9876-5432'],
  ['', '📍 Coyoacán, Ciudad de México'],
  ['', ''],
  ['', '#AnsiedadCDMX #SaludMentalMujer #TerapiaSurCDMX'],
  [''],
  ['POST 2 — AUTOESTIMA'],
  ['Redes sociales:', ''],
  ['', 'Mujer, tu valor no depende de lo que hagas,'],
  ['', 'sino de quien eres.'],
  ['', ''],
  ['', 'Si sientes que has perdido tu espejo,'],
  ['', 'nosotras te ayudamos a encontrarlo. 🪞'],
  ['', ''],
  ['', 'Primera sesión con 20% de descuento.'],
  ['', 'Solo agenda y da el primer paso.'],
  ['', ''],
  ['', '#AutoestimaMujer #MujerFuerte #PsicologíaSur'],
  [''],
  ['POST 3 — DEPRESIÓN'],
  ['Redes sociales:', ''],
  ['', 'No estás sola. No es tu culpa. Sí tiene solución.'],
  ['', ''],
  ['', 'La depresión afecta a 1 de cada 5 mujeres'],
  ['', 'en algún momento de su vida.'],
  ['', ''],
  ['', 'Pedir ayuda no es debilidad,'],
  ['', 'es el acto más valiente que puedes hacer hoy.'],
  ['', ''],
  ['', '💙 Escríbenos y agenda tu evaluación.'],
  ['', ''],
  ['', '#DepresiónNoEsDebilidad #SaludMental #TerapiaCDMX'],
  [''],
  ['ASUNTOS DE CORREO (Subject Lines)'],
  ['Opción A', '¿Sientes que la ansiedad controla tu vida?'],
  ['Opción B', '5 pasos para recuperar tu paz interior'],
  ['Opción C', 'Tu bienestar emocional comienza con un paso'],
  ['Opción D', 'Las mujeres fuertes también necesitan ayuda'],
  ['Opción E', 'No dejes que la depresión defina tu historia'],
];
const wsCopy = XLSX.utils.aoa_to_sheet(copy);
wsCopy['!cols'] = [{ wch: 28 }, { wch: 65 }];
XLSX.utils.book_append_sheet(wb, wsCopy, 'Ejemplos de Copy');

// ─── HOJA 9: Plan de Emergencia ───────────────────────────
const emergencia = [
  ['PLAN DE EMERGENCIA — Si la ocupación baja'],
  [''],
  ['Nivel', 'Ocupación', 'Acción', 'Plazo'],
  ['Alerta 1', '70-80%', 'Duplicar publicidad + oferta primera sesión agresiva', 'Inmediato'],
  ['Alerta 2', '60-70%', 'Campaña agresiva + alianzas + talleres gratuitos + promociones especiales', '1 semana'],
  ['Alerta 3', '<60%', 'Reunión de equipo completo + promociones especiales + promoción referidos + revisar precios', 'Inmediato'],
  [''],
  ['ACCIONES PERMANENTES PARA MANTENER OCUPACIÓN'],
  ['Semana 1 del mes', 'Revisar métricas del mes anterior, ajustar presupuesto'],
  ['Semana 2 del mes', 'Evaluación de contenido con mejor rendimiento'],
  ['Semana 3 del mes', 'Llamadas de seguimiento a leads fríos'],
  ['Semana 4 del mes', 'Planificación del mes siguiente + reporte'],
  [''],
  ['HERRAMIENTAS RECOMENDADAS'],
  ['Función', 'Herramienta', 'Costo'],
  ['Email Marketing', 'Mailchimp / Sendinblue', 'Gratis-$'],
  ['Programación redes', 'Buffer / Later', '$15-30 USD/mes'],
  ['Diseño', 'Canva Pro', '$13 USD/mes'],
  ['Landing Pages', 'Carrd / Linktree', 'Gratis'],
  ['CRM', 'Sistema actual CRM Psicología', 'Ya incluido'],
  ['Google Analytics', 'GA4', 'Gratis'],
  ['Calendario contenido', 'Notion / Google Sheets', 'Gratis'],
];
const wsEmergencia = XLSX.utils.aoa_to_sheet(emergencia);
wsEmergencia['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 65 }, { wch: 25 }];
XLSX.utils.book_append_sheet(wb, wsEmergencia, 'Emergencia y Herramientas');

// ─── HOJA 10: Seguimiento de Publicaciones ────────────────
const tracker = [
  ['TRACKER DE PUBLICACIONES — Registro mensual'],
  [''],
  ['Semana', 'Día', 'Canal', 'Título/Contenido', 'Tipo', 'Estado', 'Engagement', 'Notas'],
  ['Semana 1', 'Lunes', 'IG + FB', '', 'Educación', 'Pendiente', '', ''],
  ['Semana 1', 'Martes', 'IG Stories', '', 'Interacción', 'Pendiente', '', ''],
  ['Semana 1', 'Miércoles', 'IG Reels', '', 'Tips', 'Pendiente', '', ''],
  ['Semana 1', 'Jueves', 'Correo', '', 'Newsletter', 'Pendiente', '', ''],
  ['Semana 1', 'Viernes', 'IG + FB', '', 'CTA', 'Pendiente', '', ''],
  ['Semana 2', 'Lunes', 'IG Carrusel', '', 'Educación', 'Pendiente', '', ''],
  ['Semana 2', 'Martes', 'IG Stories', '', 'Cercanía', 'Pendiente', '', ''],
  ['Semana 2', 'Miércoles', 'FB Live', '', 'Autoridad', 'Pendiente', '', ''],
  ['Semana 2', 'Jueves', 'WhatsApp', '', 'Valor', 'Pendiente', '', ''],
  ['Semana 2', 'Viernes', 'IG + FB', '', 'CTA', 'Pendiente', '', ''],
  ['Semana 3', 'Lunes', 'IG', '', 'Educación', 'Pendiente', '', ''],
  ['Semana 3', 'Martes', 'IG Reels', '', 'Tips', 'Pendiente', '', ''],
  ['Semana 3', 'Miércoles', 'Correo', '', 'Newsletter', 'Pendiente', '', ''],
  ['Semana 3', 'Jueves', 'IG Stories', '', 'Interacción', 'Pendiente', '', ''],
  ['Semana 3', 'Viernes', 'IG + FB', '', 'Evento', 'Pendiente', '', ''],
  ['Semana 4', 'Lunes', 'IG Carrusel', '', 'Educación', 'Pendiente', '', ''],
  ['Semana 4', 'Martes', 'IG Stories', '', 'Social Proof', 'Pendiente', '', ''],
  ['Semana 4', 'Miércoles', 'IG Reels', '', 'Educación', 'Pendiente', '', ''],
  ['Semana 4', 'Jueves', 'WhatsApp', '', 'Conversión', 'Pendiente', '', ''],
  ['Semana 4', 'Viernes', 'IG + FB', '', 'CTA', 'Pendiente', '', ''],
];
const wsTracker = XLSX.utils.aoa_to_sheet(tracker);
wsTracker['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 45 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 30 }];
XLSX.utils.book_append_sheet(wb, wsTracker, 'Tracker Publicaciones');

// ─── Guardar ──────────────────────────────────────────────
const outPath = path.join(__dirname, '..', 'PLAN_MERCADEO.xlsx');
XLSX.writeFile(wb, outPath);
console.log('✅ Excel generado en:', outPath);
