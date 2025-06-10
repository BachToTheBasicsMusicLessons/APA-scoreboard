/*
  # Fix APA Scoreboard Backend Schema

  1. New Tables
    - Recreate `matches` table with proper structure
    - All required fields for APA scoreboard functionality
    - Proper data types and constraints

  2. Security
    - Enable RLS with public access policies
    - Required for live streaming functionality

  3. Performance
    - Add indexes for session_id and timestamps
    - Auto-update trigger for updated_at field
*/

-- Drop the existing table if it exists (to start fresh)
DROP TABLE IF EXISTS matches CASCADE;

-- Create the matches table with all required fields
CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  match_format text DEFAULT '8-Ball' NOT NULL,
  team_a_name text DEFAULT 'Team A' NOT NULL,
  team_b_name text DEFAULT 'Team B' NOT NULL,
  team_a_color text DEFAULT '#3B82F6' NOT NULL,
  team_b_color text DEFAULT '#EF4444' NOT NULL,
  team_a_score integer DEFAULT 0 NOT NULL,
  team_b_score integer DEFAULT 0 NOT NULL,
  player_a_name text DEFAULT 'Player A' NOT NULL,
  player_b_name text DEFAULT 'Player B' NOT NULL,
  player_a_skill_level integer DEFAULT 5 NOT NULL,
  player_b_skill_level integer DEFAULT 5 NOT NULL,
  player_a_race_goal integer DEFAULT 50 NOT NULL,
  player_b_race_goal integer DEFAULT 50 NOT NULL,
  player_a_score integer DEFAULT 0 NOT NULL,
  player_b_score integer DEFAULT 0 NOT NULL,
  sudden_death boolean DEFAULT false NOT NULL,
  sudden_death_time text DEFAULT '' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (required for live streaming)
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_matches_session_id ON matches(session_id);
CREATE INDEX idx_matches_created_at ON matches(created_at);

-- Insert a test record to verify everything works
INSERT INTO matches (session_id, team_a_name, team_b_name, player_a_name, player_b_name)
VALUES ('test-session-123', 'Test Team A', 'Test Team B', 'Test Player A', 'Test Player B');