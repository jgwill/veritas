-- Enable pgcrypto extension for password hashing (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add is_default column to model_templates if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='model_templates' AND column_name='is_default'
  ) THEN
    ALTER TABLE model_templates ADD COLUMN is_default BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create scratchpads table for detailed notes per snapshot
CREATE TABLE IF NOT EXISTS scratchpads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  snapshot_id UUID REFERENCES analysis_snapshots(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  structuring_insights JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for scratchpads
CREATE INDEX IF NOT EXISTS idx_scratchpads_user_id ON scratchpads(user_id);
CREATE INDEX IF NOT EXISTS idx_scratchpads_model_id ON scratchpads(model_id);
CREATE INDEX IF NOT EXISTS idx_scratchpads_snapshot_id ON scratchpads(snapshot_id);

-- Insert default model templates (if they don't exist)
INSERT INTO model_templates (name, description, model_type, config, is_default)
SELECT 
  'Digital Decision Making',
  'A pairwise comparison model for making decisions between multiple options',
  1,
  '{"options": [], "comparisons": [], "weights": {}}'::jsonb,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM model_templates WHERE name = 'Digital Decision Making' AND is_default = true
);

INSERT INTO model_templates (name, description, model_type, config, is_default)
SELECT
  'Digital Performance Review',
  'A trend analysis model for tracking performance metrics over time',
  2,
  '{"metrics": [{"id": "m1", "label": "Metric 1", "state": 0, "trend": "stable"}]}'::jsonb,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM model_templates WHERE name = 'Digital Performance Review' AND is_default = true
);
