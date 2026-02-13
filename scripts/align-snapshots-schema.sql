-- Add missing columns to analysis_snapshots table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='analysis_snapshots' AND column_name='snapshot_name'
  ) THEN
    ALTER TABLE analysis_snapshots ADD COLUMN snapshot_name VARCHAR(255);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='analysis_snapshots' AND column_name='elements_data'
  ) THEN
    ALTER TABLE analysis_snapshots ADD COLUMN elements_data JSONB;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='analysis_snapshots' AND column_name='summary_notes'
  ) THEN
    ALTER TABLE analysis_snapshots ADD COLUMN summary_notes TEXT;
  END IF;
END $$;

-- Migrate data from old columns to new columns
UPDATE analysis_snapshots 
SET elements_data = data 
WHERE elements_data IS NULL AND data IS NOT NULL;

UPDATE analysis_snapshots 
SET summary_notes = scratchpad 
WHERE summary_notes IS NULL AND scratchpad IS NOT NULL;
