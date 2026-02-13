-- Add missing columns to model_templates table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='model_templates' AND column_name='template_data'
  ) THEN
    ALTER TABLE model_templates ADD COLUMN template_data JSONB;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='model_templates' AND column_name='is_system'
  ) THEN
    ALTER TABLE model_templates ADD COLUMN is_system BOOLEAN DEFAULT false;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='model_templates' AND column_name='created_by'
  ) THEN
    ALTER TABLE model_templates ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Migrate config to template_data
UPDATE model_templates 
SET template_data = config 
WHERE template_data IS NULL AND config IS NOT NULL;

-- Mark existing templates as system templates
UPDATE model_templates 
SET is_system = true 
WHERE is_default = true AND is_system = false;
