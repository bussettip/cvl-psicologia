const mysql = require('mysql2/promise');
async function main() {
  const c = await mysql.createConnection({host:'localhost',user:'root',password:'',database:'crm_psicologia'});
  
  // Check column type
  const [cols] = await c.query("SHOW COLUMNS FROM pacientes WHERE Field='psicologa_id'");
  console.log('Column type:', JSON.stringify(cols[0]));
  
  // Test with explicit cast
  const [r1] = await c.query('SELECT * FROM pacientes WHERE psicologa_id = ? AND estado = ?', [5, 'activo']);
  console.log('With 5 (number):', r1.length, 'rows');
  
  const [r2] = await c.query('SELECT * FROM pacientes WHERE psicologa_id = ? AND estado = ?', ['5', 'activo']);
  console.log('With "5" (string):', r2.length, 'rows');
  
  await c.end();
}
main();
