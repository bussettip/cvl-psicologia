USE cvl_psicologia;

CREATE TABLE IF NOT EXISTS facturas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(64) NOT NULL,
  rfc_emisor VARCHAR(20),
  emisor VARCHAR(300),
  rfc_receptor VARCHAR(20),
  receptor VARCHAR(300),
  fecha DATETIME,
  tipo VARCHAR(10) DEFAULT 'I',
  subtotal DECIMAL(12,2) DEFAULT 0,
  iva DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  estado VARCHAR(20) DEFAULT 'vigente',
  archivo_xml VARCHAR(500),
  anio INT,
  mes INT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_factura_uuid (uuid),
  KEY idx_factura_fecha (fecha),
  KEY idx_factura_anio_mes (anio, mes),
  FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
