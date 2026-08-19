-- Tablas faltantes para CVL Psicologías
USE cvl_psicologia;

-- whatsapp column en pacientes (skip if exists)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='cvl_psicologia' AND table_name='pacientes' AND column_name='whatsapp');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE pacientes ADD COLUMN whatsapp VARCHAR(20) AFTER telefono', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- prespupuestos
CREATE TABLE IF NOT EXISTS presupuestos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  fecha DATE NOT NULL,
  monto DECIMAL(10,2),
  archivo_url TEXT,
  archivo_nombre VARCHAR(255),
  estado ENUM('pendiente','aprobado','rechazado') DEFAULT 'pendiente',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- gastos caja chica
CREATE TABLE IF NOT EXISTS gastos_caja_chica (
  id INT AUTO_INCREMENT PRIMARY KEY,
  concepto VARCHAR(255) NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  fecha DATE NOT NULL,
  categoria VARCHAR(100),
  estado ENUM('pendiente','aprobado','rechazado','pagado') DEFAULT 'pendiente',
  comprobante_url TEXT,
  autorizado_por INT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- entregas de dinero
CREATE TABLE IF NOT EXISTS entregas_dinero (
  id INT AUTO_INCREMENT PRIMARY KEY,
  concepto VARCHAR(255) NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  fecha DATE NOT NULL,
  estado ENUM('pendiente','confirmada','rechazada') DEFAULT 'pendiente',
  observations TEXT,
  confirmado_por INT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- bancos
CREATE TABLE IF NOT EXISTS bancos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  banco VARCHAR(100),
  numero_cuenta VARCHAR(50),
  tipo VARCHAR(50),
  saldo_inicial DECIMAL(12,2) DEFAULT 0,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- movimientos banco
CREATE TABLE IF NOT EXISTS movimientos_banco (
  id INT AUTO_INCREMENT PRIMARY KEY,
  banco_id INT,
  tipo ENUM('ingreso','egreso','transferencia') NOT NULL,
  concepto VARCHAR(255) NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  fecha DATE NOT NULL,
  metodo_pago VARCHAR(50),
  observaciones TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (banco_id) REFERENCES bancos(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- comprobantes bancarios
CREATE TABLE IF NOT EXISTS comprobantes_bancarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  banco VARCHAR(100),
  archivo_pdf TEXT,
  nombre_original VARCHAR(255),
  fecha DATE,
  monto DECIMAL(12,2),
  concepto TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- impuestos
CREATE TABLE IF NOT EXISTS impuestos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  concepto VARCHAR(255) NOT NULL,
  tipo VARCHAR(50),
  monto DECIMAL(12,2) NOT NULL,
  fecha DATE NOT NULL,
  vencimiento DATE,
  estado ENUM('pendiente','pagado','vencido') DEFAULT 'pendiente',
  observaciones TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- config SAT
CREATE TABLE IF NOT EXISTS config_sat (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rfc VARCHAR(13),
  razon_social VARCHAR(255),
  regimen_fiscal VARCHAR(10),
  codigo_postal VARCHAR(5),
  cer TEXT,
  key_enc TEXT,
  password_enc TEXT,
  finkok_username VARCHAR(100),
  finkok_password_enc TEXT,
  serie_facturas VARCHAR(10),
  logo TEXT,
  pac_produccion BOOLEAN DEFAULT FALSE,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- facturas
CREATE TABLE IF NOT EXISTS facturas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(36),
  rfc_emisor VARCHAR(13),
  emisor VARCHAR(255),
  rfc_receptor VARCHAR(13),
  receptor VARCHAR(255),
  fecha DATETIME,
  tipo VARCHAR(10),
  subtotal DECIMAL(12,2),
  iva DECIMAL(12,2),
  total DECIMAL(12,2),
  estado VARCHAR(20),
  archivo_xml TEXT,
  anio INT,
  mes INT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_uuid (uuid)
);

-- solicitudes factura
CREATE TABLE IF NOT EXISTS solicitudes_factura (
  id INT AUTO_INCREMENT PRIMARY KEY,
  paciente_id INT,
  concepto VARCHAR(255),
  monto DECIMAL(12,2),
  rfc_receptor VARCHAR(13),
  nombre_receptor VARCHAR(255),
  uso_cfdi VARCHAR(10),
  estado ENUM('pendiente','aprobada','rechazada','timbrada','error') DEFAULT 'pendiente',
  uuid VARCHAR(36),
  serie VARCHAR(10),
  folio INT,
  fecha_timbrado DATETIME,
  error_timbrado TEXT,
  comentario_supervisora TEXT,
  validada_por INT,
  validada_en DATETIME,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- participantes_taller
CREATE TABLE IF NOT EXISTS participantes_taller (
  id INT AUTO_INCREMENT PRIMARY KEY,
  taller_id INT NOT NULL,
  nombre_adolescente VARCHAR(255) NOT NULL,
  nombre_padre VARCHAR(255),
  fecha_nacimiento DATE,
  cantidad_pagada DECIMAL(10,2),
  fecha_pago DATE,
  correo VARCHAR(255),
  whatsapp VARCHAR(20),
  comentarios TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE CASCADE
);

-- diplomas
CREATE TABLE IF NOT EXISTS diplomas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  taller_id INT NOT NULL,
  participante_id INT,
  nombre_adolescente VARCHAR(255),
  nombre_padre VARCHAR(255),
  impreso BOOLEAN DEFAULT FALSE,
  fecha_impresion DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE CASCADE,
  FOREIGN KEY (participante_id) REFERENCES participantes_taller(id) ON DELETE SET NULL
);

-- mercadeo: add finalizado to estado enum if missing
-- (already exists in schema.sql)

-- recordatorios envio
CREATE TABLE IF NOT EXISTS recordatorios_envio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sesion_id INT NOT NULL,
  paciente_id INT NOT NULL,
  email_paciente VARCHAR(255),
  enviado BOOLEAN DEFAULT FALSE,
  error TEXT,
  enviado_en DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sesion_id) REFERENCES sesiones(id) ON DELETE CASCADE,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
);
