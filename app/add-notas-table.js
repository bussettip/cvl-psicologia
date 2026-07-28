const mysql = require('mysql2/promise');

async function run() {
  const c = await mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'crm_psicologia'
  });
  
  // Tabla de notas del paciente (psicóloga + supervisora)
  await c.query(`
    CREATE TABLE IF NOT EXISTS notas_paciente (
      id INT AUTO_INCREMENT PRIMARY KEY,
      paciente_id INT NOT NULL,
      asignacion_id INT,
      autor_id INT NOT NULL,
      autor_rol ENUM('psicologa', 'supervisora', 'supervisor', 'lider') NOT NULL,
      tipo ENUM('nota_psicologa', 'sugerencia_supervisora') NOT NULL,
      contenido TEXT NOT NULL,
      calificacion INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
      FOREIGN KEY (autor_id) REFERENCES usuarios(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('Tabla notas_paciente creada');
  
  await c.end();
}

run().catch(e => console.error('Error:', e.message));
