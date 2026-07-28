const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'crm_psicologia'
  });

  await conn.query(`
    CREATE TABLE IF NOT EXISTS citas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      paciente_id INT NOT NULL,
      psicologa_id INT NOT NULL,
      fecha DATE NOT NULL,
      hora_inicio TIME NOT NULL,
      hora_fin TIME DEFAULT NULL,
      tipo ENUM('sesion','seguimiento','evaluacion','taller','otro') DEFAULT 'sesion',
      estado ENUM('programada','confirmada','en_curso','completada','cancelada','no_asistio') DEFAULT 'programada',
      motivo VARCHAR(500) DEFAULT NULL,
      notas TEXT DEFAULT NULL,
      created_by INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
      FOREIGN KEY (psicologa_id) REFERENCES usuarios(id),
      FOREIGN KEY (created_by) REFERENCES usuarios(id)
    )
  `);

  console.log('Tabla citas creada exitosamente');
  await conn.end();
}

run().catch(e => { console.error(e); process.exit(1); });
