const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'crm_psicologia'
  });

  await conn.query(`
    CREATE TABLE IF NOT EXISTS entregas_dinero (
      id INT AUTO_INCREMENT PRIMARY KEY,
      psicologa_id INT NOT NULL,
      receptor_id INT NOT NULL,
      monto DECIMAL(10,2) NOT NULL,
      fecha DATE NOT NULL,
      hora TIME DEFAULT NULL,
      concepto TEXT,
      estado ENUM('pendiente','confirmada','cancelada') DEFAULT 'pendiente',
      observaciones TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (psicologa_id) REFERENCES usuarios(id),
      FOREIGN KEY (receptor_id) REFERENCES usuarios(id)
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS gastos_caja_chica (
      id INT AUTO_INCREMENT PRIMARY KEY,
      solicitado_por INT NOT NULL,
      autorizado_por INT DEFAULT NULL,
      proveedor VARCHAR(200) DEFAULT NULL,
      concepto TEXT NOT NULL,
      monto DECIMAL(10,2) NOT NULL,
      metodo_pago VARCHAR(50) DEFAULT 'efectivo',
      fecha DATE NOT NULL,
      estado ENUM('pendiente','aprobado','pagado','rechazado') DEFAULT 'pendiente',
      comprobante_url VARCHAR(500) DEFAULT NULL,
      observaciones TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (solicitado_por) REFERENCES usuarios(id),
      FOREIGN KEY (autorizado_por) REFERENCES usuarios(id)
    )
  `);

  console.log('Tablas entregas_dinero y gastos_caja_chica creadas exitosamente');
  await conn.end();
}

run().catch(e => { console.error(e); process.exit(1); });
