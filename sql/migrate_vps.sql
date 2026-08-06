-- ============================================================
-- CVL Psicologías - Migración VPS (29/07/2026)
-- Copiar al VPS y ejecutar:
--   docker exec -i cvl-psicologia-db-2 mysql -u root -p cvl_psicologia < migrate_vps.sql
--   (password: CVLpsicologia2026!)
-- ============================================================

-- 1. Crear tabla talleres (faltaba en schema.sql)
CREATE TABLE IF NOT EXISTS talleres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tema VARCHAR(255),
  fecha DATE NOT NULL,
  hora_inicio TIME,
  hora_fin TIME,
  lugar VARCHAR(255),
  instructor VARCHAR(255),
  capacidad INT DEFAULT 0,
  inscritos INT DEFAULT 0,
  estado ENUM('activo','completado','cancelado') DEFAULT 'activo',
  publico_objetivo TEXT,
  materiales TEXT,
  resultado TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Crear tabla mercadeo (si no existe)
CREATE TABLE IF NOT EXISTS mercadeo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50) NOT NULL,
  plataforma VARCHAR(100),
  fecha_inicio DATE,
  fecha_fin DATE,
  estado ENUM('borrador','programado','publicado','cancelado') DEFAULT 'borrador',
  contenido TEXT,
  resultado TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Actualizar ENUM de cobros para nuevos tipos de pago
ALTER TABLE cobros MODIFY COLUMN tipo ENUM('sesion','taller','programa','venta_libros','gastos_talleres','otro') NOT NULL DEFAULT 'sesion';

-- 4. Crear tabla libros (catálogo de ventas)
CREATE TABLE IF NOT EXISTS libros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  autor VARCHAR(255),
  precio DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INT DEFAULT 0,
  descripcion TEXT,
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Insertar libros de ejemplo
INSERT INTO libros (titulo, autor, precio, stock, descripcion) VALUES
('Manual de Terapia Cognitivo-Conductual', 'Dr. Juan Pérez', 350.00, 10, 'Guía completa de TCC para profesionales'),
('Cuaderno de Trabajo para la Ansiedad', 'Lic. María García', 180.00, 15, 'Ejercicios prácticos para pacientes con ansiedad'),
('Mindfulness para la Vida Diaria', 'Dra. Laura Martínez', 250.00, 8, 'Técnicas de mindfulness aplicadas'),
('Diario de Emociones', 'Equipo CVL', 120.00, 20, 'Cuaderno para registro de emociones diarias'),
('Guía de Autoayuda para la Depresión', 'Dr. Roberto Sánchez', 200.00, 12, 'Estrategias basadas en activación conductual');
