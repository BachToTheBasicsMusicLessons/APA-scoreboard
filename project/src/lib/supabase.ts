import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Match {
  id: string;
  session_id: string;
  match_format: string;
  team_a_name: string;
  team_b_name: string;
  team_a_color: string;
  team_b_color: string;
  team_a_score: number;
  team_b_score: number;
  player_a_name: string;
  player_b_name: string;
  player_a_skill_level: number;
  player_b_skill_level: number;
  player_a_race_goal: number;
  player_b_race_goal: number;
  player_a_score: number;
  player_b_score: number;
  sudden_death: boolean;
  sudden_death_time: string;
  created_at: string;
  updated_at: string;
}