const mysql = require('mysql2/promise');

async function setup() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3306,
    multipleStatements: true
  });

  const fs = require('fs');
  const path = require('path');

  // Read and execute schema
  const schema = fs.readFileSync(path.join(__dirname, '..', 'sql', 'schema.sql'), 'utf8');
  console.log('Executing schema.sql...');
  await conn.query(schema);
  console.log('Schema created successfully.');

  // Read and execute seed
  const seed = fs.readFileSync(path.join(__dirname, '..', 'sql', 'seed.sql'), 'utf8');
  console.log('Executing seed.sql...');
  await conn.query(seed);
  console.log('Seed data inserted successfully.');

  // Verify
  const [rows] = await conn.query('SELECT COUNT(*) as total FROM usuarios');
  console.log(`Usuarios: ${rows[0].total}`);
  
  const [pacientes] = await conn.query('SELECT COUNT(*) as total FROM pacientes');
  console.log(`Pacientes: ${pacientes[0].total}`);
  
  const [programas] = await conn.query('SELECT COUNT(*) as total FROM programas_terapeuticos');
  console.log(`Programas: ${programas[0].total}`);

  await conn.end();
  console.log('Setup complete!');
}

setup().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
