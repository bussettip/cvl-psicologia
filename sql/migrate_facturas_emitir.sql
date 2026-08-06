USE cvl_psicologia;

CREATE TABLE IF NOT EXISTS solicitudes_factura (
  id INT AUTO_INCREMENT PRIMARY KEY,
  paciente_id INT DEFAULT NULL,
  paciente_nombre VARCHAR(200) DEFAULT NULL,
  solicitado_por INT DEFAULT NULL,
  concepto VARCHAR(500) NOT NULL,
  cantidad DECIMAL(10,4) DEFAULT 1,
  unidad VARCHAR(50) DEFAULT 'SERVICIO',
  clave_prod_serv VARCHAR(20) DEFAULT '85121706',
  clave_unidad VARCHAR(10) DEFAULT 'E48',
  subtotal DECIMAL(12,2) NOT NULL,
  iva DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  rfc_receptor VARCHAR(13) NOT NULL DEFAULT 'XAXX010101000',
  razon_social_receptor VARCHAR(300) NOT NULL,
  regimen_fiscal_receptor VARCHAR(10) DEFAULT '616',
  uso_cfdi VARCHAR(3) DEFAULT 'S01',
  forma_pago VARCHAR(2) DEFAULT '01',
  metodo_pago VARCHAR(3) DEFAULT 'PUE',
  estado ENUM('pendiente','aprobada','rechazada','timbrada','error') DEFAULT 'pendiente',
  comentario_supervisora TEXT DEFAULT NULL,
  validada_por INT DEFAULT NULL,
  validada_en DATETIME DEFAULT NULL,
  uuid VARCHAR(64) DEFAULT NULL,
  serie VARCHAR(10) DEFAULT NULL,
  folio INT DEFAULT NULL,
  fecha_timbrado DATETIME DEFAULT NULL,
  xml_path VARCHAR(500) DEFAULT NULL,
  pdf_path VARCHAR(500) DEFAULT NULL,
  error_timbrado TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_sol_factura_estado (estado),
  KEY idx_sol_factura_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE config_sat
  ADD COLUMN finkok_username VARCHAR(100) DEFAULT NULL,
  ADD COLUMN finkok_password_enc TEXT DEFAULT NULL,
  ADD COLUMN serie_facturas VARCHAR(5) DEFAULT 'F',
  ADD COLUMN logo LONGTEXT DEFAULT NULL,
  ADD COLUMN pac_produccion TINYINT(1) DEFAULT 0;
