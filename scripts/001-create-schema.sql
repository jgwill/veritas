-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create models table
CREATE TABLE IF NOT EXISTS models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  model_type INTEGER NOT NULL CHECK (model_type IN (1, 2)),
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analysis_snapshots table
CREATE TABLE IF NOT EXISTS analysis_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  snapshot_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL,
  scratchpad TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_models_user_id ON models(user_id);
CREATE INDEX IF NOT EXISTS idx_models_model_type ON models(model_type);
CREATE INDEX IF NOT EXISTS idx_analysis_snapshots_model_id ON analysis_snapshots(model_id);
CREATE INDEX IF NOT EXISTS idx_analysis_snapshots_user_id ON analysis_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_snapshots_date ON analysis_snapshots(snapshot_date DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analysis_snapshots_updated_at BEFORE UPDATE ON analysis_snapshots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default template models (these will be copied when users create from template)
-- Note: These are stored with a special system user (NULL user_id indicates template)
CREATE TABLE IF NOT EXISTS model_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  model_type INTEGER NOT NULL CHECK (model_type IN (1, 2)),
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the two default templates
INSERT INTO model_templates (name, description, model_type, config)
VALUES 
  (
    'Digital Decision Making',
    'A pairwise comparison model to help you make better decisions by evaluating options against each other.',
    1,
    '{"dimensions":[],"options":[]}'
  ),
  (
    'Digital Performance Review Model',
    'Track and analyze your performance across multiple dimensions using state and trend indicators.',
    2,
    '{"dimensions":[]}'
  )
ON CONFLICT DO NOTHING;
