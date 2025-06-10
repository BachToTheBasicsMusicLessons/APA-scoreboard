import React, { useEffect, useState, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { ScoreboardOverlay } from '../components/ScoreboardOverlay';
import { useMatch } from '../hooks/useMatch';
import { RefreshCw } from 'lucide-react';
import { supabase, Match } from '../lib/supabase';

export function OverlayPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [pollingMatch, setPollingMatch] = useState<Match | null>(null);
  const lastDataRef = useRef<string>('');
  
  if (!sessionId) {
    return <Navigate to="/\" replace />;
  }

  const { match, loading, error, refreshMatch } = useMatch(sessionId);

  // Force refresh on mount
  useEffect(() => {
    console.log('OverlayPage mounted for session:', sessionId);
    refreshMatch();
  }, [sessionId, refreshMatch]);

  // Add 1-second polling with deep comparison to prevent flickering
  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(async () => {
      console.log('Overlay polling refresh');
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("session_id", sessionId)
        .maybeSingle();

      if (data) {
        const newDataString = JSON.stringify(data);
        // Only update if the data has actually changed
        if (newDataString !== lastDataRef.current) {
          console.log('Overlay data changed, updating state');
          setPollingMatch(data);
          lastDataRef.current = newDataString;
        }
      }
    }, 1000); // re-fetch every 1 second

    return () => clearInterval(interval);
  }, [sessionId]);

  // Use polling match if available, otherwise fall back to hook match
  const currentMatch = pollingMatch || match;

  if (loading && !currentMatch) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading overlay...</p>
          <p className="text-sm text-white/60 mt-2">Session: {sessionId}</p>
        </div>
      </div>
    );
  }

  if ((error || !currentMatch) && !loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="text-white text-center max-w-md">
          <div className="text-red-400 mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Overlay Not Available</h2>
          <p className="text-white/80 mb-4">
            {error?.includes('No match found') 
              ? `No match found for session: ${sessionId}`
              : error || 'No match data available'
            }
          </p>
          <p className="text-sm text-white/60 mb-4">Session: {sessionId}</p>
          <div className="space-y-2">
            <button
              onClick={refreshMatch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            <p className="text-xs text-white/50">
              Make sure the controller is set up first at:
            </p>
            <p className="text-xs text-blue-400 font-mono break-all">
              {window.location.origin}/controller/{sessionId}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <ScoreboardOverlay match={currentMatch} />;
}