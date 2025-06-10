/*
  # Fix matches table setup

  1. New Tables
    - `matches` table with all required fields for APA scoreboard
    - Includes team data, player data, scores, and match settings
    - Uses proper defaults for all fields

  2. Security
    - Enable RLS on matches table
    - Add policies for public read/write access (required for live streaming)
    - Handle existing policies gracefully

  3. Functions & Triggers
    - Create update timestamp function
    - Add trigger for automatic updated_at updates
*/

-- Create the matches table if it doesn't exist
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

-- Enable Row Level Security
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
DO $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Public read access for matches" ON matches;
  DROP POLICY IF EXISTS "Public write access for matches" ON matches;
  
  -- Create new policies
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