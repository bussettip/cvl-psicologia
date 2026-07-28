const mysql = require('mysql2/promise');

async function run() {
  const c = await mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'crm_psicologia'
  });

  await c.query(`
    CREATE TABLE IF NOT EXISTS mercadeo (
      id INT AUTO_INCREMENT PRIMARY KEY,
      titulo VARCHAR(255) NOT NULL,
      descripcion TEXT,
      tipo ENUM('publicacion','campana','evento','otro') NOT NULL DEFAULT 'publicacion',
      plataforma VARCHAR(100),
      fecha_inicio DATE,
      fecha_fin DATE,
      estado ENUM('borrador','publicado','programado','finalizado') DEFAULT 'borrador',
      imagen_url VARCHAR(500),
      contenido TEXT,
      resultado TEXT,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('Tabla mercadeo creada');

  await c.query(`
    CREATE TABLE IF NOT EXISTS talleres (
      id INT AUTO_INCREMENT PRIMARY KEY,
      titulo VARCHAR(255) NOT NULL,
      descripcion TEXT,
      tema VARCHAR(255),
      fecha DATE,
      hora_inicio TIME,
      hora_fin TIME,
      lugar VARCHAR(255),
      instructor VARCHAR(255),
      capacidad INT DEFAULT 0,
      inscritos INT DEFAULT 0,
      estado ENUM('programado','en_curso','finalizado','cancelado') DEFAULT 'programado',
      publico_objetivo VARCHAR(255),
      materiales TEXT,
      resultado TEXT,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('Tabla talleres creada');

  await c.end();
}

run().catch(e => console.error('Error:', e.message));
