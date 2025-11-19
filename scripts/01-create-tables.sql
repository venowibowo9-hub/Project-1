-- Create packaging_rolls table
CREATE TABLE IF NOT EXISTS packaging_rolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode TEXT NOT NULL UNIQUE,
  roll_name TEXT NOT NULL,
  width_mm INTEGER,
  length_m DECIMAL(10, 2),
  weight_kg DECIMAL(10, 2),
  supplier TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create roll_usage table for tracking each usage event
CREATE TABLE IF NOT EXISTS roll_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_id UUID NOT NULL REFERENCES packaging_rolls(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  quantity_used DECIMAL(10, 2) NOT NULL,
  usage_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  operator_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_roll_usage_roll_id ON roll_usage(roll_id);
CREATE INDEX IF NOT EXISTS idx_roll_usage_date ON roll_usage(usage_date);
CREATE INDEX IF NOT EXISTS idx_roll_usage_line ON roll_usage(line_number);

-- Enable RLS
ALTER TABLE packaging_rolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE roll_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now, secure as needed)
CREATE POLICY "Allow all for packaging_rolls" ON packaging_rolls FOR ALL USING (true);
CREATE POLICY "Allow all for roll_usage" ON roll_usage FOR ALL USING (true);
