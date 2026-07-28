const mysql = require('mysql2/promise');

async function run() {
  const c = await mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'crm_psicologia', multipleStatements: true
  });
  
  // 1. Crear programa
  const [r] = await c.query(
    'INSERT INTO programas_terapeuticos (nombre, descripcion, total_sesiones, created_by) VALUES (?, ?, ?, ?)',
    [
      'Programa Apego y Relación de Pareja',
      'Tratamiento integral para parejas con patrones de apego inseguro. Incluye evaluación individual y de la díada, regulación emocional, comunicación afectiva, reparación del vínculo y construcción de seguridad emocional.',
      14, 1
    ]
  );
  const progId = r.insertId;
  console.log('Programa creado ID:', progId);
  
  // 2. Crear metas
  const metas = [
    [1, 'Evaluación inicial individual', 'Historia de apego, estilos de apego (ECR-R), dinámica de pareja, motivo de consulta, expectativas', 'evaluacion'],
    [2, 'Evaluación de la díada', 'Evaluación conjunta: patrones interaccionales, ciclo de conflicto, mapa de apego de la pareja', 'evaluacion'],
    [3, 'Psicoeducación sobre apego', 'Teoría del apego: seguro/inseguro/evitativo/ansioso, cómo se manifiesta en la relación actual', 'intervencion'],
    [4, 'Identificación de patrones', 'Identificar los ciclos de desconexión-reparación, triggers de inseguridad, respuestas de estrés relacional', 'intervencion'],
    [5, 'Regulación emocional I', 'Técnicas de autorregulación, tolerancia a la angustia relacional, manejo de la reactividad', 'intervencion'],
    [6, 'Regulación emocional II', 'Co-regulación emocional en pareja, validar emociones del otro, crear seguridad emocional', 'intervencion'],
    [7, 'Comunicación afectiva I', 'Escucha empática, expresión de necesidades desde el apego, lenguaje de vulnerabilidad vs. ataque', 'intervencion'],
    [8, 'Comunicación afectiva II', 'Manejo de conflictos constructivamente, reparación emocional post-conflicto, diálogo de apego', 'intervencion'],
    [9, 'Profundización del vínculo', 'Creación de rituales de conexión, vulnerabilidad compartida, reconstrucción de confianza', 'intervencion'],
    [10, 'Trabajo con heridas de apego', 'Procesar heridas de la infancia que afectan la relación, sanar el apego interno', 'intervencion'],
    [11, 'Construcción de seguridad', 'Crear base segura, responder a las necesidades de apego, consolidar nuevos patrones', 'seguimiento'],
    [12, 'Resolución de conflictos pendientes', 'Abordar temas no resueltos, perdón, reconstrucción del vínculo dañado', 'seguimiento'],
    [13, 'Consolidación y prevención', 'Plan de mantenimiento, identificar señales de alerta, estrategias de reparación autónoma', 'seguimiento'],
    [14, 'Cierre y fortalecimiento', 'Evaluación final, celebrar logros, plan de seguimiento, fortalecer la conexión', 'cierre']
  ];
  
  for (const m of metas) {
    await c.query(
      'INSERT INTO metas_programa (programa_id, sesion_numero, titulo, descripcion, categoria, orden) VALUES (?, ?, ?, ?, ?, ?)',
      [progId, m[0], m[1], m[2], m[3], m[0]]
    );
  }
  console.log('Metas creadas:', metas.length);
  
  // 3. Verificar
  const [progs] = await c.query('SELECT id, nombre, total_sesiones FROM programas_terapeuticos');
  console.log('\n=== TODOS LOS PROGRAMAS ===');
  progs.forEach(p => console.log(`${p.id} | ${p.nombre} | ${p.total_sesiones} sesiones`));
  
  const [metasCount] = await c.query('SELECT programa_id, COUNT(*) as total FROM metas_programa GROUP BY programa_id');
  console.log('\n=== METAS POR PROGRAMA ===');
  metasCount.forEach(m => console.log(`Programa ${m.programa_id}: ${m.total} metas`));
  
  await c.end();
}

run().catch(e => console.error('Error:', e.message));
