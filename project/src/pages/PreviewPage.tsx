import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ScoreboardOverlay } from '../components/ScoreboardOverlay';
import { useMatch } from '../hooks/useMatch';
import { ExternalLink, Monitor, Settings, RefreshCw, RotateCcw } from 'lucide-react';
import { supabase, Match } from '../lib/supabase';
import { InstallButton } from '../components/InstallButton';

export function PreviewPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [pollingMatch, setPollingMatch] = useState<Match | null>(null);
  const lastDataRef = useRef<string>('');
  
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-md">
          <Monitor className="mx-auto mb-4 text-gray-400\" size={48} />
          <h1 className="text-2xl font-bold mb-2">Livestream Preview</h1>
          <p className="text-gray-400 mb-6">
            Add a session_id parameter to preview your scoreboard overlay
          </p>
          <div className="bg-gray-800 p-4 rounded-lg text-left mb-4">
            <p className="text-sm text-gray-300 mb-2">Example URL:</p>
            <code className="text-blue-400 text-sm break-all">
              /preview?session_id=your-session-id
            </code>
          </div>
          <InstallButton variant="secondary" size="md" />
        </div>
      </div>
    );
  }

  const { match, loading, error, refreshMatch } = useMatch(sessionId);

  // Force refresh on mount
  useEffect(() => {
    console.log('PreviewPage mounted for session:', sessionId);
    refreshMatch();
  }, [sessionId, refreshMatch]);

  // Add 1-second polling with deep comparison to prevent flickering
  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(async () => {
      console.log('Preview polling refresh');
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("session_id", sessionId)
        .maybeSingle();

      if (data) {
        const newDataString = JSON.stringify(data);
        // Only update if the data has actually changed
        if (newDataString !== lastDataRef.current) {
          console.log('Preview data changed, updating state');
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading preview...</p>
          <p className="text-sm text-gray-500 mt-2">Session: {sessionId}</p>
        </div>
      </div>
    );
  }

  if ((error || !currentMatch) && !loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-md">
          <div className="text-red-400 mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Preview Error</h2>
          <p className="text-gray-400 mb-4">
            {error?.includes('No match found') 
              ? `No match found for session: ${sessionId}`
              : error || 'No match data available'
            }
          </p>
          <p className="text-sm text-gray-500 mb-4">Session: {sessionId}</p>
          <div className="space-y-3">
            <button
              onClick={refreshMatch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
            >
              <RefreshCw size={16} />
              <span>Retry</span>
            </button>
            <InstallButton variant="secondary" size="md" />
            <p className="text-xs text-gray-500">
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

  const controllerUrl = `${window.location.origin}/controller/${sessionId}`;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      {/* Mobile Orientation Helper */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 portrait:block landscape:hidden">
        <div className="bg-amber-600/90 backdrop-blur-sm rounded-lg p-3 text-white text-center">
          <div className="flex items-center space-x-2 text-sm">
            <RotateCcw size={16} />
            <span>Rotate device for best experience</span>
          </div>
        </div>
      </div>

      {/* Simulated Video Background */}
      <div className="absolute inset-0">
        <div className="w-full h-full bg-gradient-to-br from-green-800 via-green-700 to-green-900 relative">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%),
                               linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%),
                               linear-gradient(-45deg, rgba(0,0,0,0.1) 25%, transparent 25%)`,
              backgroundSize: '200px 200px, 300px 300px, 50px 50px, 50px 50px'
            }} />
          </div>
          
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-amber-900 to-amber-800 opacity-60" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-amber-900 to-amber-800 opacity-60" />
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-amber-900 to-amber-800 opacity-60" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-amber-900 to-amber-800 opacity-60" />
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-64 bg-green-600 opacity-30 rounded-lg" />
        </div>
      </div>

      {/* Preview Controls Overlay - Responsive */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-50">
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-white">
          <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium hidden sm:inline">PWA READY</span>
              <span className="text-green-400 font-medium sm:hidden">PWA</span>
            </div>
            <div className="text-gray-400 hidden sm:inline">|</div>
            <div className="text-gray-300 hidden sm:inline">1920×1080</div>
            <div className="text-gray-400 hidden lg:inline">|</div>
            <button
              onClick={refreshMatch}
              className="flex items-center space-x-1 text-green-400 hover:text-green-300 transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={12} className="sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <div className="text-gray-400 hidden sm:inline">|</div>
            <a
              href={controllerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Settings size={12} className="sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Controller</span>
              <ExternalLink size={10} className="sm:w-3 sm:h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Session Info - Responsive */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-50">
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-white">
          <div className="text-xs text-gray-400 mb-1">Session ID</div>
          <div className="font-mono text-xs sm:text-sm text-blue-400 break-all">{sessionId}</div>
          <div className="text-xs text-gray-500 mt-1">
            Last Update: {currentMatch?.updated_at ? new Date(currentMatch.updated_at).toLocaleTimeString() : 'Unknown'}
          </div>
        </div>
      </div>

      {/* PWA Install Button - Mobile Bottom */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 sm:hidden">
        <InstallButton variant="primary" size="sm" />
      </div>

      {/* Scoreboard Overlay */}
      {currentMatch && (
        <div className="absolute inset-0 pointer-events-none">
          <ScoreboardOverlay match={currentMatch} />
        </div>
      )}

      {/* Frame Guidelines - Hidden on mobile */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        <div className="absolute inset-4 border border-white/10 rounded-lg" />
        <div className="absolute inset-8 border border-white/5 rounded-lg" />
      </div>
    </div>
  );
}