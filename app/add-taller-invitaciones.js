const mysql = require('mysql2/promise');

async function run() {
  const c = await mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'crm_psicologia'
  });

  await c.query(`
    CREATE TABLE IF NOT EXISTS taller_invitaciones (
      id INT AUTO_INCREMENT PRIMARY KEY,
      taller_id INT NOT NULL,
      paciente_id INT NOT NULL,
      psicologa_id INT NOT NULL,
      fecha_sesion DATE,
      estado ENUM('pendiente','confirmada','asistio','cancelada') DEFAULT 'pendiente',
      notas TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE CASCADE,
      FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
      FOREIGN KEY (psicologa_id) REFERENCES usuarios(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('Tabla taller_invitaciones creada');
  await c.end();
}

run().catch(e => console.error('Error:', e.message));
