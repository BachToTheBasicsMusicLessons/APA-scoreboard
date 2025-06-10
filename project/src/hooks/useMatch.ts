import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, Match } from '../lib/supabase';

export function useMatch(sessionId: string) {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<any>(null);
  const fallbackIntervalRef = useRef<any>(null);

  // Force refresh function that always fetches from Supabase
  const refreshMatch = useCallback(async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching data for session: ${sessionId}`);

      const { data, error: fetchError } = await supabase
        .from('matches')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }

      if (data) {
        console.log('Match data loaded:', data);
        setMatch(data);
      } else {
        console.log('No match found for session:', sessionId);
        setMatch(null);
        setError(`No match found for session: ${sessionId}`);
      }
    } catch (err) {
      console.error('Error in refreshMatch:', err);
      setError(err instanceof Error ? err.message : 'Failed to load match');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Create a new match (only used by controller)
  const createMatch = useCallback(async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);

      console.log('Creating new match for session:', sessionId);

      const defaultMatch = {
        session_id: sessionId,
        match_format: '8-Ball',
        team_a_name: 'Team A',
        team_b_name: 'Team B',
        team_a_color: '#3B82F6',
        team_b_color: '#EF4444',
        team_a_score: 0,
        team_b_score: 0,
        player_a_name: 'Player A',
        player_b_name: 'Player B',
        player_a_skill_level: 5,
        player_b_skill_level: 5,
        player_a_race_goal: 50,
        player_b_race_goal: 50,
        player_a_score: 0,
        player_b_score: 0,
        sudden_death: false,
        sudden_death_time: ''
      };

      const { data, error: upsertError } = await supabase
        .from('matches')
        .upsert([defaultMatch], {
          onConflict: 'session_id',
          ignoreDuplicates: false
        })
        .select()
        .maybeSingle();

      if (upsertError) {
        console.error('Create error:', upsertError);
        throw upsertError;
      }

      if (data) {
        console.log('New match created:', data);
        setMatch(data);
      } else {
        throw new Error('Failed to create match - no data returned');
      }
    } catch (err) {
      console.error('Error creating match:', err);
      setError(err instanceof Error ? err.message : 'Failed to create match');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    console.log(`Setting up useMatch for session: ${sessionId}`);

    // Clean up any existing subscription and interval
    if (subscriptionRef.current) {
      console.log('Cleaning up existing subscription');
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }

    // Initial fetch
    refreshMatch();

    // Set up real-time subscription with unique channel name
    console.log('Setting up real-time subscription');
    
    const channelName = `match-updates-${sessionId}-${Date.now()}`;
    
    const subscription = supabase
      .channel(channelName)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'matches',
          filter: `session_id=eq.${sessionId}`
        }, 
        (payload) => {
          console.log('Real-time update received:', payload);
          
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            console.log('Updating match with new data:', payload.new);
            setMatch(payload.new as Match);
            setError(null);
          } else if (payload.eventType === 'DELETE') {
            console.log('Match deleted');
            setMatch(null);
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        
        // Set up fallback polling if real-time fails
        if (status === 'SUBSCRIBED') {
          console.log('Real-time subscription active');
          // Clear any existing fallback interval
          if (fallbackIntervalRef.current) {
            clearInterval(fallbackIntervalRef.current);
            fallbackIntervalRef.current = null;
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.log('Real-time subscription failed, setting up fallback polling');
          // Set up fallback polling every 1 second
          fallbackIntervalRef.current = setInterval(() => {
            console.log('Fallback polling refresh');
            refreshMatch();
          }, 1000);
        }
      });

    subscriptionRef.current = subscription;

    // Cleanup function
    return () => {
      console.log('Cleaning up useMatch');
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
      }
    };
  }, [sessionId, refreshMatch]);

  // Instant update function - updates local state immediately and syncs to database
  const updateMatch = useCallback(async (updates: Partial<Omit<Match, 'id' | 'session_id' | 'created_at' | 'updated_at'>>) => {
    if (!match) {
      console.error('Cannot update match: no match loaded');
      return;
    }

    console.log('Instant update with:', updates);

    // Optimistic update - apply changes immediately to local state
    const previousMatch = match;
    const updatedMatch = { ...match, ...updates };
    setMatch(updatedMatch);

    try {
      // Send update to Supabase (this will trigger real-time updates for other clients)
      const { data, error } = await supabase
        .from('matches')
        .update(updates)
        .eq('session_id', sessionId)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating match:', error);
        setError(`Failed to update match: ${error.message}`);
        // Revert optimistic update on error
        setMatch(previousMatch);
      } else if (data) {
        console.log('Match updated successfully:', data);
        setError(null);
        // Update with server response to ensure consistency
        setMatch(data);
      } else {
        console.error('Update returned no data');
        setError('Update failed - no data returned');
        // Revert optimistic update on error
        setMatch(previousMatch);
      }
    } catch (err) {
      console.error('Unexpected error updating match:', err);
      setError('An unexpected error occurred while updating the match');
      // Revert optimistic update on error
      setMatch(previousMatch);
    }
  }, [match, sessionId]);

  return { match, loading, error, updateMatch, refreshMatch, createMatch };
}