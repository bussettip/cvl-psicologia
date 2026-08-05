-- MIGRACIÓN: Principios y Valores de la Compañía
-- Agrega la sección 'principios' a reglas_clinica (editable desde Panel Supervisora → Reglas)
-- Uso VPS: docker exec -i cvl-psicologia-db mysql -uroot -p'CVLpsicologia2026!' cvl_psicologia < sql/migrate_principios.sql

INSERT INTO reglas_clinica (seccion, titulo, items) VALUES
('principios', 'Principios y Valores de la Compañía', '["Confidencialidad absoluta: la información de cada paciente es privada, protegida y jamás se comparte","Ética profesional: actuamos con integridad, honestidad y responsabilidad en todo momento","Empatía y calidez: tratamos a cada persona con dignidad, respeto y comprensión","Excelencia en el servicio: mejora continua en la calidad de sesiones, atención e instalaciones","Compromiso con el bienestar: el bienestar del paciente es nuestra prioridad absoluta","Transparencia: información clara y honesta sobre precios, horarios y procesos","Ambiente seguro y limpio: instalaciones limpias, ordenadas, accesibles y en buen estado","Trabajo en equipo: colaboración y comunicación respetuosa entre psicólogas, supervisora y recepción"]');
