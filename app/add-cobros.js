const mysql = require('mysql2/promise');

async function run() {
  const c = await mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'crm_psicologia'
  });

  await c.query(`
    CREATE TABLE IF NOT EXISTS cobros (
      id INT AUTO_INCREMENT PRIMARY KEY,
      paciente_id INT,
      tipo ENUM('sesion','taller','programa','otro') NOT NULL DEFAULT 'sesion',
      concepto VARCHAR(255),
      sesion_id INT DEFAULT NULL,
      taller_id INT DEFAULT NULL,
      monto DECIMAL(10,2) NOT NULL DEFAULT 750.00,
      metodo_pago ENUM('efectivo','tarjeta_credito','tarjeta_debito','transferencia','otro') DEFAULT 'efectivo',
      fecha DATE NOT NULL,
      hora TIME DEFAULT NULL,
      estado ENUM('pagado','pendiente','cancelado') DEFAULT 'pagado',
      observaciones TEXT,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('Tabla cobros creada');
  await c.end();
}

run().catch(e => console.error('Error:', e.message));
