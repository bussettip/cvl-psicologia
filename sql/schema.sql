-- ============================================================
-- CVL Psicologías - Schema Completo para MySQL
-- Base de datos: cvl_psicologia
-- ============================================================

DROP DATABASE IF EXISTS cvl_psicologia;
CREATE DATABASE cvl_psicologia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cvl_psicologia;

-- ============================================================
-- TABLA: usuarios (psicólogas, líder, supervisor)
-- ============================================================
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  rol ENUM('psicologa', 'lider', 'supervisor') NOT NULL,
  avatar_url VARCHAR(500),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA: pacientes
-- ============================================================
CREATE TABLE pacientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  fecha_nac DATE,
  telefono VARCHAR(20),
  email VARCHAR(255),
  direccion TEXT,
  motivo_consulta TEXT,
  diagnostico_inicial TEXT,
  observaciones_generales TEXT,
  estado ENUM('activo', 'pausado', 'finalizado', 'derivado') DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA: programas_terapeuticos (plantillas de la líder)
-- ============================================================
CREATE TABLE programas_terapeuticos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  total_sesiones INT NOT NULL CHECK (total_sesiones BETWEEN 12 AND 16),
  created_by INT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ============================================================
-- TABLA: metas_programa (metas dentro de cada plantilla)
-- ============================================================
CREATE TABLE metas_programa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  programa_id INT NOT NULL,
  sesion_numero INT NOT NULL,
  titulo VARCHAR(300) NOT NULL,
  descripcion TEXT,
  categoria ENUM('evaluacion', 'intervencion', 'seguimiento', 'cierre') NOT NULL,
  orden INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (programa_id) REFERENCES programas_terapeuticos(id) ON DELETE CASCADE,
  UNIQUE KEY unique_programa_sesion (programa_id, sesion_numero)
);

-- ============================================================
-- TABLA: asignaciones (paciente ↔ psicóloga ↔ programa)
-- ============================================================
CREATE TABLE asignaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  paciente_id INT NOT NULL,
  psicologa_id INT NOT NULL,
  supervisor_id INT,
  programa_id INT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin_estimada DATE,
  fecha_fin_real DATE,
  sesion_actual INT DEFAULT 0,
  estado ENUM('en_curso', 'pausado', 'completado', 'desviado', 'cancelado') DEFAULT 'en_curso',
  motivo_estado TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
  FOREIGN KEY (psicologa_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (supervisor_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (programa_id) REFERENCES programas_terapeuticos(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: sesiones (registro detallado de cada sesión)
-- ============================================================
CREATE TABLE sesiones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asignacion_id INT NOT NULL,
  numero_sesion INT NOT NULL,
  fecha_programada DATE NOT NULL,
  fecha_real DATE,
  meta_id INT,
  estado ENUM('programada', 'completada', 'reprogramada', 'cancelada') DEFAULT 'programada',
  duracion_minutos INT,
  temas_trabajados TEXT,
  observaciones_psicologa TEXT,
  observaciones_supervisor TEXT,
  desviacion BOOLEAN DEFAULT FALSE,
  motivo_desviacion TEXT,
  tipo_desviacion ENUM('retraso', 'salto_meta', 'repeticion', 'fuera_programa', 'ninguna') DEFAULT 'ninguna',
  confirmada_psicologa BOOLEAN DEFAULT FALSE,
  confirmada_fecha DATETIME DEFAULT NULL,
  archivo_url VARCHAR(500) DEFAULT NULL,
  archivo_nombre VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (asignacion_id) REFERENCES asignaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (meta_id) REFERENCES metas_programa(id) ON DELETE SET NULL,
  UNIQUE KEY unique_asignacion_sesion (asignacion_id, numero_sesion)
);

-- ============================================================
-- TABLA: alertas_desviacion
-- ============================================================
CREATE TABLE alertas_desviacion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asignacion_id INT NOT NULL,
  sesion_id INT,
  tipo ENUM('retraso', 'salto_meta', 'repeticion', 'fuera_programa', 'otro') NOT NULL,
  descripcion TEXT NOT NULL,
  detectada_por INT,
  gravedad ENUM('baja', 'media', 'alta', 'critica') DEFAULT 'media',
  resuelta BOOLEAN DEFAULT FALSE,
  resuelta_por INT,
  notas_resolucion TEXT,
  fecha_resolucion TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asignacion_id) REFERENCES asignaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (sesion_id) REFERENCES sesiones(id) ON DELETE SET NULL,
  FOREIGN KEY (detectada_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (resuelta_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ============================================================
-- TABLA: observaciones_supervision
-- ============================================================
CREATE TABLE observaciones_supervision (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sesion_id INT NOT NULL,
  supervisor_id INT NOT NULL,
  observacion TEXT NOT NULL,
  tipo ENUM('general', 'tecnica', 'correccion', 'apoyo') DEFAULT 'general',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sesion_id) REFERENCES sesiones(id) ON DELETE CASCADE,
  FOREIGN KEY (supervisor_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: historial_cambios (audit log)
-- ============================================================
CREATE TABLE historial_cambios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tabla_afectada VARCHAR(50) NOT NULL,
  registro_id INT NOT NULL,
  accion ENUM('crear', 'editar', 'eliminar', 'reasignar') NOT NULL,
  datos_anteriores JSON,
  datos_nuevos JSON,
  usuario_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ============================================================
-- ÍNDICES para rendimiento
-- ============================================================
CREATE INDEX idx_pacientes_estado ON pacientes(estado);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_asignaciones_estado ON asignaciones(estado);
CREATE INDEX idx_asignaciones_psicologa ON asignaciones(psicologa_id);
CREATE INDEX idx_sesiones_estado ON sesiones(estado);
CREATE INDEX idx_sesiones_fecha ON sesiones(fecha_programada);
CREATE INDEX idx_alertas_resuelta ON alertas_desviacion(resuelta);
CREATE INDEX idx_alertas_gravedad ON alertas_desviacion(gravedad);

-- ============================================================
-- TABLA: cobros
-- ============================================================
CREATE TABLE cobros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  paciente_id INT,
  tipo ENUM('sesion','taller','programa','otro') NOT NULL DEFAULT 'sesion',
  concepto VARCHAR(255),
  sesion_id INT DEFAULT NULL,
  taller_id INT DEFAULT NULL,
  monto DECIMAL(10,2) NOT NULL DEFAULT 750.00,
  metodo_pago ENUM('efectivo','tarjeta_credito','tarjeta_debito','transferencia','otro') DEFAULT 'efectivo',
  fecha DATE NOT NULL,
  hora TIME DEFAULT NULL,
  estado ENUM('pagado','pendiente','cancelado') DEFAULT 'pagado',
  observaciones TEXT,
  confirmado_psicologa BOOLEAN DEFAULT FALSE,
  confirmado_psicologa_id INT DEFAULT NULL,
  confirmado_psicologa_fecha DATETIME DEFAULT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLA: reglas_clinica
-- ============================================================
CREATE TABLE reglas_clinica (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seccion VARCHAR(50) NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  items JSON NOT NULL,
  actualizado_por INT,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actualizado_por) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLA: notas_paciente
-- ============================================================
CREATE TABLE notas_paciente (
  id INT AUTO_INCREMENT PRIMARY KEY,
  paciente_id INT NOT NULL,
  asignacion_id INT,
  autor_id INT NOT NULL,
  autor_rol VARCHAR(50),
  tipo VARCHAR(50) NOT NULL,
  contenido TEXT NOT NULL,
  calificacion INT,
  paso_tratamiento VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
  FOREIGN KEY (asignacion_id) REFERENCES asignaciones(id) ON DELETE SET NULL,
  FOREIGN KEY (autor_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLA: calificaciones_psicologa
-- ============================================================
CREATE TABLE IF NOT EXISTS calificaciones_psicologa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  psicologa_id INT NOT NULL,
  supervisor_id INT NOT NULL,
  asignacion_id INT,
  paciente_id INT,
  categoria VARCHAR(50) NOT NULL,
  calificacion INT NOT NULL,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (psicologa_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (supervisor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (asignacion_id) REFERENCES asignaciones(id) ON DELETE SET NULL,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
