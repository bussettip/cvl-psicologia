const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'crm_psicologia'
  });

  try {
    await conn.query(`
      ALTER TABLE entregas_dinero
      ADD COLUMN firma_digital VARCHAR(255) DEFAULT NULL AFTER observaciones,
      ADD COLUMN firma_fecha DATETIME DEFAULT NULL AFTER firma_digital,
      ADD COLUMN firma_ip VARCHAR(50) DEFAULT NULL AFTER firma_fecha,
      ADD COLUMN firma_metodo VARCHAR(20) DEFAULT NULL AFTER firma_ip
    `);
    console.log('Columnas de firma agregadas a entregas_dinero');
  } catch (e) {
    if (e.message.includes('Duplicate column')) {
      console.log('Columnas ya existen');
    } else {
      throw e;
    }
  }

  await conn.end();
}

run().catch(e => { console.error(e); process.exit(1); });
