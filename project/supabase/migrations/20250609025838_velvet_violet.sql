/*
  # APA Scoreboard Matches Schema

  1. New Tables
    - `matches`
      - `id` (uuid, primary key)
      - `session_id` (text, unique) - for URL sharing
      - `match_format` (text) - "8-Ball" or "9-Ball"
      - `team_a_name` (text)
      - `team_b_name` (text)
      - `team_a_color` (text) - hex color code
      - `team_b_color` (text) - hex color code
      - `team_a_score` (integer)
      - `team_b_score` (integer)
      - `player_a_name` (text)
      - `player_b_name` (text)
      - `player_a_skill_level` (integer)
      - `player_b_skill_level` (integer)
      - `player_a_race_goal` (integer)
      - `player_b_race_goal` (integer)
      - `player_a_score` (integer)
      - `player_b_score` (integer)
      - `sudden_death` (boolean)
      - `sudden_death_time` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `matches` table
    - Add policies for public read/write access (no auth required for MVP)
*/

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

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Allow public read access for overlay display
CREATE POLICY "Public read access for matches"
  ON matches
  FOR SELECT
  TO anon
  USING (true);

-- Allow public write access for controller updates
CREATE POLICY "Public write access for matches"
  ON matches
  FOR ALL
  TO anon
  USING (true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_matches_updated_at 
    BEFORE UPDATE ON matches 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();