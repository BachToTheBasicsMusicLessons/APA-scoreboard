/*
  # Complete APA Scoreboard Schema

  1. Schema Updates
    - Ensure all required fields exist with proper names
    - Add any missing columns
    - Update field names to match frontend requirements
    - Set appropriate defaults for all fields

  2. Security
    - Enable RLS on matches table
    - Add policies for public read/write access (required for live streaming)

  3. Triggers
    - Auto-update timestamp trigger
*/

-- Ensure the matches table exists with all required fields
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  match_format text DEFAULT '8-Ball',
  team_a_name text DEFAULT 'Team A',
  team_b_name text DEFAULT 'Team B',
  team_a_color text DEFAULT '#3B82F6',
  team_b_color text DEFAULT '#EF4444',
  team_a_score integer DEFAULT 0,
  team_b_score integer DEFAULT 0,
  player_a_name text DEFAULT 'Player A',
  player_b_name text DEFAULT 'Player B',
  player_a_skill_level integer DEFAULT 5,
  player_b_skill_level integer DEFAULT 5,
  player_a_race_goal integer DEFAULT 50,
  player_b_race_goal integer DEFAULT 50,
  player_a_score integer DEFAULT 0,
  player_b_score integer DEFAULT 0,
  sudden_death boolean DEFAULT false,
  sudden_death_time text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add any missing columns (in case table exists but is missing fields)
DO $$
BEGIN
  -- Check and add missing columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'match_format'
  ) THEN
    ALTER TABLE matches ADD COLUMN match_format text DEFAULT '8-Ball';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'team_a_name'
  ) THEN
    ALTER TABLE matches ADD COLUMN team_a_name text DEFAULT 'Team A';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'team_b_name'
  ) THEN
    ALTER TABLE matches ADD COLUMN team_b_name text DEFAULT 'Team B';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'team_a_color'
  ) THEN
    ALTER TABLE matches ADD COLUMN team_a_color text DEFAULT '#3B82F6';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'team_b_color'
  ) THEN
    ALTER TABLE matches ADD COLUMN team_b_color text DEFAULT '#EF4444';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'team_a_score'
  ) THEN
    ALTER TABLE matches ADD COLUMN team_a_score integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'team_b_score'
  ) THEN
    ALTER TABLE matches ADD COLUMN team_b_score integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'player_a_name'
  ) THEN
    ALTER TABLE matches ADD COLUMN player_a_name text DEFAULT 'Player A';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'player_b_name'
  ) THEN
    ALTER TABLE matches ADD COLUMN player_b_name text DEFAULT 'Player B';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'player_a_skill_level'
  ) THEN
    ALTER TABLE matches ADD COLUMN player_a_skill_level integer DEFAULT 5;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'player_b_skill_level'
  ) THEN
    ALTER TABLE matches ADD COLUMN player_b_skill_level integer DEFAULT 5;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'player_a_race_goal'
  ) THEN
    ALTER TABLE matches ADD COLUMN player_a_race_goal integer DEFAULT 50;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'player_b_race_goal'
  ) THEN
    ALTER TABLE matches ADD COLUMN player_b_race_goal integer DEFAULT 50;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'player_a_score'
  ) THEN
    ALTER TABLE matches ADD COLUMN player_a_score integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'player_b_score'
  ) THEN
    ALTER TABLE matches ADD COLUMN player_b_score integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'sudden_death'
  ) THEN
    ALTER TABLE matches ADD COLUMN sudden_death boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'sudden_death_time'
  ) THEN
    ALTER TABLE matches ADD COLUMN sudden_death_time text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE matches ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE matches ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
DO $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Public read access for matches" ON matches;
  DROP POLICY IF EXISTS "Public write access for matches" ON matches;
  
  -- Create new policies for public access (required for live streaming)
  CREATE POLICY "Public read access for matches"
    ON matches
    FOR SELECT
    TO anon
    USING (true);

  CREATE POLICY "Public write access for matches"
    ON matches
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);
END $$;

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists, then create new one
DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_matches_session_id ON matches(session_id);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at);