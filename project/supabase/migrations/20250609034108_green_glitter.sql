/*
  # Create APA Scoreboard Matches Table

  1. New Tables
    - `matches`
      - `id` (uuid, primary key)
      - `session_id` (text, unique) - links controller to overlay
      - `match_format` (text) - "8-Ball" or "9-Ball"
      - Team A fields: name, score, color, player name, skill level, race goal, player score
      - Team B fields: name, score, color, player name, skill level, race goal, player score
      - Sudden death: enabled flag and time string
      - Timestamps: created_at, updated_at

  2. Security
    - Enable RLS on `matches` table
    - Add policies for public read/write access (required for live streaming)
    - Add automatic updated_at trigger

  3. Performance
    - Index on session_id for fast lookups
    - Index on created_at for sorting
*/

-- Drop the existing table completely to start fresh
DROP TABLE IF EXISTS matches CASCADE;

-- Drop any existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create the matches table with all required fields
CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  match_format text DEFAULT '8-Ball' NOT NULL,
  
  -- Team A fields
  team_a_name text DEFAULT 'Team A' NOT NULL,
  team_a_score integer DEFAULT 0 NOT NULL,
  team_a_color text DEFAULT '#3B82F6' NOT NULL,
  player_a_name text DEFAULT 'Player A' NOT NULL,
  player_a_skill_level integer DEFAULT 5 NOT NULL,
  player_a_race_goal integer DEFAULT 50 NOT NULL,
  player_a_score integer DEFAULT 0 NOT NULL,
  
  -- Team B fields
  team_b_name text DEFAULT 'Team B' NOT NULL,
  team_b_score integer DEFAULT 0 NOT NULL,
  team_b_color text DEFAULT '#EF4444' NOT NULL,
  player_b_name text DEFAULT 'Player B' NOT NULL,
  player_b_skill_level integer DEFAULT 5 NOT NULL,
  player_b_race_goal integer DEFAULT 50 NOT NULL,
  player_b_score integer DEFAULT 0 NOT NULL,
  
  -- Sudden death fields
  sudden_death boolean DEFAULT false NOT NULL,
  sudden_death_time text DEFAULT '' NOT NULL,
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (required for live streaming without authentication)
CREATE POLICY "Public read access for matches"
  ON matches
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public write access for matches"
  ON matches
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on any update
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_matches_session_id ON matches(session_id);
CREATE INDEX idx_matches_created_at ON matches(created_at);

-- Insert a test record to verify the table works correctly
INSERT INTO matches (
  session_id,
  match_format,
  team_a_name,
  team_b_name,
  player_a_name,
  player_b_name,
  player_a_skill_level,
  player_b_skill_level,
  player_a_race_goal,
  player_b_race_goal
) VALUES (
  'demo-session-001',
  '8-Ball',
  'Sharks',
  'Eagles',
  'John Smith',
  'Jane Doe',
  7,
  6,
  75,
  65
);