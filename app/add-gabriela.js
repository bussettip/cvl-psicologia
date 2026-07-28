const mysql = require('mysql2/promise');

async function run() {
  const c = await mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'crm_psicologia'
  });
  
  const [exist] = await c.query('SELECT id FROM usuarios WHERE email = ?', ['gabriela.torres@clinica.com']);
  if (exist.length === 0) {
    await c.query(`INSERT INTO usuarios (nombre, apellido, email, password_hash, rol)
      VALUES ('Gabriela', 'Torres Figueroa', 'gabriela.torres@clinica.com', 'gabriela123', 'supervisora')`);
    console.log('Gabriela Torres Figueroa agregada como supervisora');
  } else {
    await c.query('UPDATE usuarios SET password_hash = ?, rol = ? WHERE email = ?', ['gabriela123', 'supervisora', 'gabriela.torres@clinica.com']);
    console.log('Gabriela actualizada');
  }
  
  const [rows] = await c.query('SELECT id, nombre, apellido, email, password_hash, rol FROM usuarios WHERE rol IN ("supervisor","supervisora","lider")');
  console.log('\n=== SUPERVISORES ===');
  rows.forEach(r => console.log(`${r.id}. ${r.nombre} ${r.apellido} | ${r.email} | Pass: ${r.password_hash} | Rol: ${r.rol}`));
  
  await c.end();
}

run().catch(e => console.error('Error:', e.message));
