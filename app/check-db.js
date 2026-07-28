const mysql = require('mysql2/promise');

async function run() {
  const c = await mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'crm_psicologia'
  });
  
  const [rows] = await c.query('SELECT id, nombre, total_sesiones FROM programas_terapeuticos');
  console.log('=== PROGRAMAS ===');
  rows.forEach(r => console.log(`${r.id} | ${r.nombre} | ${r.total_sesiones} sesiones`));
  
  const [metas] = await c.query('SELECT programa_id, COUNT(*) as total FROM metas_programa GROUP BY programa_id');
  console.log('\n=== METAS POR PROGRAMA ===');
  metas.forEach(m => console.log(`Programa ${m.programa_id}: ${m.total} metas`));
  
  await c.end();
}

run().catch(e => console.error('Error:', e.message));
