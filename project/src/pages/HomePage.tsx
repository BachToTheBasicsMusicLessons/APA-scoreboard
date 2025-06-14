import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export default function HomePage() {
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreateMatch = async () => {
    setCreating(true);
    const newId = uuidv4();

    const { error } = await supabase.from('matches').insert([
      {
        id: newId,
        data: {
          teamA: {
            name: 'Team A',
            score: 0,
            player: 'Player A',
            skill: 5,
            goal: 50,
            color: 'blue',
          },
          teamB: {
            name: 'Team B',
            score: 0,
            player: 'Player B',
            skill: 5,
            goal: 50,
            color: 'red',
          },
          format: '8-Ball',
          suddenDeath: false,
        },
      },
    ]);

    if (error) {
      console.error('Error creating match:', error);
      setCreating(false);
    } else {
      navigate(`/controller/${newId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">APA Scoreboard</h1>
      <p className="text-gray-600 mb-6">Live scoring for APA league matches</p>
      <button
        onClick={handleCreateMatch}
        disabled={creating}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded shadow disabled:opacity-50"
      >
        {creating ? 'Creating Match...' : '+ Create New Match'}
      </button>
    </div>
  );
}
