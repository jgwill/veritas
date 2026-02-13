-- Add missing columns to models table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='models' AND column_name='is_archived'
  ) THEN
    ALTER TABLE models ADD COLUMN is_archived BOOLEAN DEFAULT false;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='models' AND column_name='template_id'
  ) THEN
    ALTER TABLE models ADD COLUMN template_id UUID REFERENCES model_templates(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='models' AND column_name='model_data'
  ) THEN
    ALTER TABLE models ADD COLUMN model_data JSONB;
  END IF;
END $$;

-- Migrate config to model_data if needed
UPDATE models SET model_data = config WHERE model_data IS NULL AND config IS NOT NULL;

-- Create index for template_id
CREATE INDEX IF NOT EXISTS idx_models_template_id ON models(template_id);
