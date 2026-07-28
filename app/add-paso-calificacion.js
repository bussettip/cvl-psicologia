const mysql = require('mysql2/promise');

async function run() {
  const c = await mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'crm_psicologia'
  });
  
  // Agregar campo de paso del tratamiento
  const [cols1] = await c.query("SHOW COLUMNS FROM notas_paciente LIKE 'paso_tratamiento'");
  if (cols1.length === 0) {
    await c.query("ALTER TABLE notas_paciente ADD COLUMN paso_tratamiento INT DEFAULT NULL AFTER contenido");
    console.log('Columna paso_tratamiento agregada');
  }
  
  // Agregar campo de meta asociada
  const [cols2] = await c.query("SHOW COLUMNS FROM notas_paciente LIKE 'meta_id'");
  if (cols2.length === 0) {
    await c.query("ALTER TABLE notas_paciente ADD COLUMN meta_id INT DEFAULT NULL AFTER paso_tratamiento");
    console.log('Columna meta_id agregada');
  }
  
  // Tabla de calificaciones de supervisora a psicóloga
  await c.query(`
    CREATE TABLE IF NOT EXISTS calificaciones_psicologa (
      id INT AUTO_INCREMENT PRIMARY KEY,
      psicologa_id INT NOT NULL,
      supervisor_id INT NOT NULL,
      asignacion_id INT,
      paciente_id INT,
      categoria ENUM('desempeno', 'tecnica', 'comunicacion', 'seguimiento', 'general') NOT NULL,
      calificacion INT NOT NULL CHECK (calificacion BETWEEN 1 AND 10),
      observaciones TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (psicologa_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (supervisor_id) REFERENCES usuarios(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('Tabla calificaciones_psicologa creada');
  
  // Verificar estructura
  const [r] = await c.query('DESCRIBE notas_paciente');
  console.log('\n=== NOTAS_PACIENTE ===');
  r.forEach(x => console.log(x.Field, x.Type));
  
  await c.end();
}

run().catch(e => console.error('Error:', e.message));
