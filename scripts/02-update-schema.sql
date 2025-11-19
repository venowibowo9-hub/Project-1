-- Alter roll_usage table to replace quantity_used (meters) with machine_number and pieces_counter
ALTER TABLE roll_usage 
DROP COLUMN IF EXISTS quantity_used;

ALTER TABLE roll_usage 
ADD COLUMN machine_number TEXT NOT NULL DEFAULT '',
ADD COLUMN pieces_counter INTEGER NOT NULL DEFAULT 0;

-- Drop old indexes
DROP INDEX IF EXISTS idx_roll_usage_line;

-- Create new indexes for better performance
CREATE INDEX IF NOT EXISTS idx_roll_usage_machine ON roll_usage(machine_number);
CREATE INDEX IF NOT EXISTS idx_roll_usage_pieces ON roll_usage(pieces_counter);

-- Add comment to document the schema change
COMMENT ON COLUMN roll_usage.machine_number IS 'Machine/Equipment number where roll was used';
COMMENT ON COLUMN roll_usage.pieces_counter IS 'Number of pieces/count when roll was changed';
