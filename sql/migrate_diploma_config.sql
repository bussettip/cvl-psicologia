USE cvl_psicologia;
ALTER TABLE talleres ADD COLUMN IF NOT EXISTS diploma_config JSON NULL AFTER diploma_template;
