import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { ControllerInterface } from '../components/ControllerInterface';
import { useMatch } from '../hooks/useMatch';

export function ControllerPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  
  if (!sessionId) {
    return <Navigate to="/\" replace />;
  }

  const { match, loading, error, updateMatch, refreshMatch, createMatch } = useMatch(sessionId);

  // Force refresh when the controller page loads
  useEffect(() => {
    console.log('ControllerPage mounted for session:', sessionId);
    refreshMatch();
  }, [sessionId, refreshMatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scoreboard...</p>
          <p className="text-gray-500 text-sm mt-2">Session: {sessionId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600 max-w-md">
          <div className="text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Error Loading Match</h2>
          <p className="mb-4">{error}</p>
          <p className="text-gray-500 text-sm mb-4">Session: {sessionId}</p>
          <div className="space-x-2">
            <button
              onClick={refreshMatch}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            {error.includes('No match found') && (
              <button
                onClick={createMatch}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Match
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <p className="mb-4">No match found for this session</p>
          <p className="text-sm text-gray-500 mb-4">Session ID: {sessionId}</p>
          <button
            onClick={createMatch}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Match
          </button>
        </div>
      </div>
    );
  }

  return (
    <ControllerInterface 
      match={match} 
      onUpdate={updateMatch} 
      sessionId={sessionId}
    />
  );
}