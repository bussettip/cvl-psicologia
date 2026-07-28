const mysql = require('mysql2/promise');

async function run() {
  const c = await mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'crm_psicologia', multipleStatements: true
  });
  
  // Tabla de respuestas del cuestionario
  await c.query(`
    CREATE TABLE IF NOT EXISTS cuestionario_respuestas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      paciente_id INT NOT NULL,
      psicologa_id INT NOT NULL,
      programa_id INT,
      respuestas JSON NOT NULL,
      puntuacion_phq4 INT,
      puntuacion_escala_especifica INT,
      nivel_riesgo ENUM('bajo', 'medio', 'alto', 'critico') DEFAULT 'bajo',
      observaciones_riesgo TEXT,
      completado BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
      FOREIGN KEY (psicologa_id) REFERENCES usuarios(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('Tabla cuestionario_respuestas creada');
  
  // Actualizar passwords de las psicólogas (formato simple para demo)
  const passwords = [
    { email: 'ana.garcia@clinica.com', pass: 'ana123' },
    { email: 'maria.lopez@clinica.com', pass: 'maria123' },
    { email: 'laura.perez@clinica.com', pass: 'laura123' },
    { email: 'jose.hernandez@clinica.com', pass: 'jose123' },
    { email: 'sofia.morales@clinica.com', pass: 'sofia123' },
    { email: 'diego.ramirez@clinica.com', pass: 'diego123' },
    { email: 'valeria.torres@clinica.com', pass: 'valeria123' },
    { email: 'fernando.diaz@clinica.com', pass: 'fernando123' },
    { email: 'camila.rios@clinica.com', pass: 'camila123' },
    { email: 'pablo.silva@clinica.com', pass: 'pablo123' },
    { email: 'carmen.ruiz@clinica.com', pass: 'lider123' },
    { email: 'roberto.martin@clinica.com', pass: 'super123' },
    { email: 'elena.vargas@clinica.com', pass: 'super123' },
  ];
  
  for (const p of passwords) {
    await c.query('UPDATE usuarios SET password_hash = ? WHERE email = ?', [p.pass, p.email]);
  }
  console.log('Passwords actualizados para', passwords.length, 'usuarios');
  
  // Verificar
  const [rows] = await c.query('SELECT email, password_hash, rol FROM usuarios');
  console.log('\n=== USUARIOS ===');
  rows.forEach(r => console.log(`${r.email} | Pass: ${r.password_hash} | Rol: ${r.rol}`));
  
  await c.end();
}

run().catch(e => console.error('Error:', e.message));
