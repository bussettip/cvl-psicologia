const mysql = require('mysql2/promise');
async function main() {
  const c = await mysql.createConnection({host:'localhost',user:'root',password:'',database:'crm_psicologia'});
  try {
    await c.query('ALTER TABLE cobros ADD COLUMN confirmado_psicologa TINYINT(1) DEFAULT 0 AFTER created_by');
    console.log('Added confirmado_psicologa');
  } catch(e) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; console.log('confirmado_psicologa exists'); }
  try {
    await c.query('ALTER TABLE cobros ADD COLUMN confirmado_psicologa_id INT NULL AFTER confirmado_psicologa');
    console.log('Added confirmado_psicologa_id');
  } catch(e) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; console.log('confirmado_psicologa_id exists'); }
  try {
    await c.query('ALTER TABLE cobros ADD COLUMN confirmado_psicologa_fecha TIMESTAMP NULL AFTER confirmado_psicologa_id');
    console.log('Added confirmado_psicologa_fecha');
  } catch(e) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; console.log('confirmado_psicologa_fecha exists'); }
  try {
    await c.query('ALTER TABLE sesiones ADD COLUMN confirmada_psicologa TINYINT(1) DEFAULT 0 AFTER desviacion');
    console.log('Added confirmada_psicologa');
  } catch(e) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; console.log('confirmada_psicologa exists'); }
  try {
    await c.query('ALTER TABLE sesiones ADD COLUMN confirmada_fecha TIMESTAMP NULL AFTER confirmada_psicologa');
    console.log('Added confirmada_fecha');
  } catch(e) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; console.log('confirmada_fecha exists'); }
  await c.end();
  console.log('Done');
}
main();
