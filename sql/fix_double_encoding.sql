-- Fix double-encoded UTF-8 data in all tables with text columns
USE cvl_psicologia;

-- Fix metas_programa
UPDATE metas_programa SET titulo = CONVERT(CAST(titulo AS BINARY) USING latin1);
UPDATE metas_programa SET descripcion = CONVERT(CAST(descripcion AS BINARY) USING latin1) WHERE descripcion IS NOT NULL;

-- Fix reglas_clinica items (JSON)
UPDATE reglas_clinica SET titulo = CONVERT(CAST(titulo AS BINARY) USING latin1);
UPDATE reglas_clinica SET items = CONVERT(CAST(items AS BINARY) USING latin1);

-- Fix notas_paciente
UPDATE notas_paciente SET contenido = CONVERT(CAST(contenido AS BINARY) USING latin1);

-- Fix sesiones
UPDATE sesiones SET temas_trabajados = CONVERT(CAST(temas_trabajados AS BINARY) USING latin1) WHERE temas_trabajados IS NOT NULL;
UPDATE sesiones SET observaciones_psicologa = CONVERT(CAST(observaciones_psicologa AS BINARY) USING latin1) WHERE observaciones_psicologa IS NOT NULL;
UPDATE sesiones SET observaciones_supervisor = CONVERT(CAST(observaciones_supervisor AS BINARY) USING latin1) WHERE observaciones_supervisor IS NOT NULL;
UPDATE sesiones SET motivo_desviacion = CONVERT(CAST(motivo_desviacion AS BINARY) USING latin1) WHERE motivo_desviacion IS NOT NULL;

-- Fix alertas_desviacion
UPDATE alertas_desviacion SET descripcion = CONVERT(CAST(descripcion AS BINARY) USING latin1);
UPDATE alertas_desviacion SET notas_resolucion = CONVERT(CAST(notas_resolucion AS BINARY) USING latin1) WHERE notas_resolucion IS NOT NULL;

-- Fix observaciones_supervision
UPDATE observaciones_supervision SET observacion = CONVERT(CAST(observacion AS BINARY) USING latin1);

-- Fix pacientes
UPDATE pacientes SET motivo_consulta = CONVERT(CAST(motivo_consulta AS BINARY) USING latin1) WHERE motivo_consulta IS NOT NULL;
UPDATE pacientes SET diagnostico_inicial = CONVERT(CAST(diagnostico_inicial AS BINARY) USING latin1) WHERE diagnostico_inicial IS NOT NULL;
UPDATE pacientes SET observaciones_generales = CONVERT(CAST(observaciones_generales AS BINARY) USING latin1) WHERE observaciones_generales IS NOT NULL;

-- Fix programas_terapeuticos
UPDATE programas_terapeuticos SET descripcion = CONVERT(CAST(descripcion AS BINARY) USING latin1) WHERE descripcion IS NOT NULL;

-- Fix cobros
UPDATE cobros SET concepto = CONVERT(CAST(concepto AS BINARY) USING latin1) WHERE concepto IS NOT NULL;
UPDATE cobros SET observaciones = CONVERT(CAST(observaciones AS BINARY) USING latin1) WHERE observaciones IS NOT NULL;

-- Fix talleres
UPDATE talleres SET descripcion = CONVERT(CAST(descripcion AS BINARY) USING latin1) WHERE descripcion IS NOT NULL;
UPDATE talleres SET publico_objetivo = CONVERT(CAST(publico_objetivo AS BINARY) USING latin1) WHERE publico_objetivo IS NOT NULL;
UPDATE talleres SET materiales = CONVERT(CAST(materiales AS BINARY) USING latin1) WHERE materiales IS NOT NULL;
UPDATE talleres SET resultado = CONVERT(CAST(resultado AS BINARY) USING latin1) WHERE resultado IS NOT NULL;

-- Verify fix
SELECT id, titulo, HEX(titulo) FROM metas_programa WHERE id IN (10, 55);
