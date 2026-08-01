USE cvl_psicologia;

CREATE TABLE IF NOT EXISTS bancos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  banco VARCHAR(100),
  numero_cuenta VARCHAR(100),
  tipo ENUM('cuenta','efectivo','inversion') DEFAULT 'cuenta',
  saldo_inicial DECIMAL(10,2) DEFAULT 0,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS movimientos_banco (
  id INT AUTO_INCREMENT PRIMARY KEY,
  banco_id INT NOT NULL,
  tipo ENUM('ingreso','egreso','transferencia') NOT NULL DEFAULT 'ingreso',
  concepto VARCHAR(255),
  monto DECIMAL(10,2) NOT NULL,
  fecha DATE NOT NULL,
  metodo_pago VARCHAR(50) DEFAULT 'efectivo',
  observaciones TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (banco_id) REFERENCES bancos(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS impuestos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  concepto VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'IVA',
  monto DECIMAL(10,2) NOT NULL,
  fecha DATE NOT NULL,
  vencimiento DATE,
  estado ENUM('pendiente','pagado','exento') DEFAULT 'pendiente',
  observaciones TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
