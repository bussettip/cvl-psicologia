-- ============================================================
-- MIGRACIÓN: Diplomas de Talleres
-- ============================================================

-- Agregar columna para plantilla de diploma
ALTER TABLE talleres ADD COLUMN diploma_template VARCHAR(500) NULL AFTER resultado;

-- Tabla de participantes del taller
CREATE TABLE IF NOT EXISTS participantes_taller (
  id INT AUTO_INCREMENT PRIMARY KEY,
  taller_id INT NOT NULL,
  nombre_adolescente VARCHAR(255) NOT NULL,
  nombre_padre VARCHAR(255),
  fecha_nacimiento DATE,
  cantidad_pagada DECIMAL(10,2) DEFAULT 0,
  fecha_pago DATE,
  correo VARCHAR(255),
  whatsapp VARCHAR(50),
  comprobante_url TEXT,
  comentarios TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de diplomas generados
CREATE TABLE IF NOT EXISTS diplomas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  taller_id INT NOT NULL,
  participante_id INT NOT NULL,
  nombre_adolescente VARCHAR(255) NOT NULL,
  nombre_padre VARCHAR(255),
  archivo_pdf VARCHAR(500),
  impreso TINYINT(1) DEFAULT 0,
  fecha_impresion DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE CASCADE,
  FOREIGN KEY (participante_id) REFERENCES participantes_taller(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar el taller "Aprendiendo a volar" si no existe
INSERT IGNORE INTO talleres (titulo, descripcion, tema, fecha, hora_inicio, hora_fin, lugar, instructor, capacidad, estado, publico_objetivo)
VALUES (
  'Aprendiendo a volar',
  'Taller de inteligencia emocional y autoestima para adolescentes de 13 a 17 años. Nivel introductorio.',
  'Inteligencia Emocional y Autoestima',
  '2026-08-23',
  '10:00:00',
  '18:00:00',
  'Centro VivirLibre.org campus CDMX',
  'Gabriela Torres de Moroso Bussetti',
  30,
  'activo',
  'Adolescentes de 13 a 17 años'
);
