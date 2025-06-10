import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Trophy, Monitor, Smartphone, ExternalLink, Plus, History } from 'lucide-react';
import { InstallButton } from '../components/InstallButton';

export function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [recentSessions, setRecentSessions] = useState<string[]>([]);

  useEffect(() => {
    // Load recent sessions from localStorage
    const stored = localStorage.getItem('apa-recent-sessions');
    if (stored) {
      try {
        const sessions = JSON.parse(stored);
        setRecentSessions(sessions.slice(0, 5)); // Keep only last 5 sessions
      } catch (e) {
        console.error('Error loading recent sessions:', e);
      }
    }
  }, []);

  const createNewSession = () => {
    const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Save to recent sessions
    const updated = [sessionId, ...recentSessions.filter(s => s !== sessionId)].slice(0, 5);
    setRecentSessions(updated);
    localStorage.setItem('apa-recent-sessions', JSON.stringify(updated));
    
    navigate(`/controller/${sessionId}`);
  };

  const openSession = (sessionId: string) => {
    // Move to front of recent sessions
    const updated = [sessionId, ...recentSessions.filter(s => s !== sessionId)].slice(0, 5);
    setRecentSessions(updated);
    localStorage.setItem('apa-recent-sessions', JSON.stringify(updated));
    
    navigate(`/controller/${sessionId}`);
  };

  const clearRecentSessions = () => {
    setRecentSessions([]);
    localStorage.removeItem('apa-recent-sessions');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <Trophy className="mx-auto text-blue-600 mb-4" size={48} />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">APA Scoreboard</h1>
          <p className="text-gray-600">Professional pool scoreboard for live streaming</p>
        </div>

        <div className="space-y-4 mb-8">
          <button
            onClick={createNewSession}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Plus size={20} />
            <span>Create New Match</span>
          </button>

          {/* PWA Install Button */}
          <InstallButton 
            variant="secondary" 
            size="md" 
            className="w-full"
          />

          {recentSessions.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <History size={16} className="mr-1" />
                  Recent Sessions
                </h3>
                <button
                  onClick={clearRecentSessions}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-2">
                {recentSessions.map((sessionId) => (
                  <button
                    key={sessionId}
                    onClick={() => openSession(sessionId)}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="font-mono text-sm text-blue-600">{sessionId}</div>
                    <div className="text-xs text-gray-500 mt-1">Click to resume</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 text-sm text-gray-500 border-t pt-6">
          <div className="flex items-center justify-center space-x-2">
            <Monitor size={16} />
            <span>Stream-ready overlay</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Smartphone size={16} />
            <span>Mobile controller</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <ExternalLink size={16} />
            <span>Real-time sync</span>
          </div>
        </div>
      </div>
    </div>
  );
}