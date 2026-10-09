-- Verificación del monto del comprobante contra el monto registrado en la plataforma.
-- Un registro por comprobante (idempotente vía ON DUPLICATE KEY).
CREATE TABLE IF NOT EXISTS verificacion_comprobante (
  comprobante_id     INT NOT NULL,
  cobro_id           INT NULL,
  monto_plataforma   DECIMAL(12,2) NULL,
  monto_comprobante  DECIMAL(12,2) NULL,
  diferencia         DECIMAL(12,2) NULL,
  estado             VARCHAR(20) NOT NULL DEFAULT 'no_detectado', -- coincide | diferencia | no_detectado | sin_comprobante
  motivo             TEXT NULL,
  texto_ocr          TEXT NULL,
  correo_aclaracion  TINYINT(1) NOT NULL DEFAULT 0,
  correo_enviado_en  DATETIME NULL,
  verificado_en      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (comprobante_id),
  KEY idx_cobro (cobro_id),
  KEY idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
