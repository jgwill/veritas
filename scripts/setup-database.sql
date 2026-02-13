-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Model templates table
CREATE TABLE IF NOT EXISTS model_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type INTEGER NOT NULL CHECK (type IN (1, 2)),
  config JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User models table (instances of templates)
CREATE TABLE IF NOT EXISTS user_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES model_templates(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type INTEGER NOT NULL CHECK (type IN (1, 2)),
  config JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analysis snapshots table
CREATE TABLE IF NOT EXISTS analysis_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES user_models(id) ON DELETE CASCADE,
  snapshot_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scratchpad table (for Type 2 models - Performance Review)
CREATE TABLE IF NOT EXISTS scratchpads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES user_models(id) ON DELETE CASCADE,
  snapshot_id UUID REFERENCES analysis_snapshots(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  structuring_insights JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_models_user_id ON user_models(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_snapshots_user_id ON analysis_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_snapshots_model_id ON analysis_snapshots(model_id);
CREATE INDEX IF NOT EXISTS idx_scratchpads_user_id ON scratchpads(user_id);
CREATE INDEX IF NOT EXISTS idx_scratchpads_model_id ON scratchpads(model_id);
CREATE INDEX IF NOT EXISTS idx_scratchpads_snapshot_id ON scratchpads(snapshot_id);

-- Insert default model templates
INSERT INTO model_templates (name, description, type, config, is_default)
VALUES 
  (
    'Digital Decision Making',
    'A pairwise comparison model for making decisions between multiple options',
    1,
    '{"options": [], "comparisons": [], "weights": {}}'::jsonb,
    true
  ),
  (
    'Digital Performance Review',
    'A trend analysis model for tracking performance metrics over time',
    2,
    '{"metrics": [{"id": "m1", "label": "Metric 1", "state": 0, "trend": "stable"}]}'::jsonb,
    true
  )
ON CONFLICT DO NOTHING;
