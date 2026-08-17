USE cvl_psicologia;

CREATE TABLE IF NOT EXISTS comprobantes_bancarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  banco VARCHAR(50) NOT NULL,
  archivo_pdf VARCHAR(500) NOT NULL,
  nombre_original VARCHAR(300),
  fecha DATE,
  monto DECIMAL(12,2),
  concepto VARCHAR(255),
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_comprobantes_banco (banco),
  FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
