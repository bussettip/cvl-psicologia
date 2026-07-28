const mysql = require('mysql2/promise');

async function run() {
  const c = await mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'crm_psicologia'
  });
  
  await c.query("ALTER TABLE usuarios MODIFY COLUMN rol ENUM('psicologa','lider','supervisor','supervisora') NOT NULL");
  console.log('Enum actualizado');
  
  await c.query("UPDATE usuarios SET rol='supervisora' WHERE email='gabriela.torres@clinica.com'");
  console.log('Gabriela actualizada a supervisora');
  
  const [r] = await c.query('SELECT id, nombre, apellido, email, rol FROM usuarios WHERE id=14');
  console.log(r[0]);
  
  await c.end();
}

run().catch(e => console.error('Error:', e.message));
