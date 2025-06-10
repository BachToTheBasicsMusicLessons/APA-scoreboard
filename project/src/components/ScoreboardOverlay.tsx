import React from 'react';
import { Match } from '../lib/supabase';

interface ScoreboardOverlayProps {
  match: Match;
}

export function ScoreboardOverlay({ match }: ScoreboardOverlayProps) {
  return (
    <>
      {/* Portrait Mode Warning */}
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 portrait:flex landscape:hidden">
        <div className="text-center text-white p-8 max-w-sm">
          <div className="text-6xl mb-4">📱</div>
          <h2 className="text-2xl font-bold mb-4">Rotate Your Device</h2>
          <p className="text-gray-300 mb-6">
            Please rotate your device to landscape orientation for the best scoreboard experience.
          </p>
          <div className="text-sm text-gray-400">
            Optimized for landscape viewing
          </div>
        </div>
      </div>

      {/* Main Scoreboard - Only visible in landscape */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm border-t-2 border-gray-600 shadow-2xl portrait:hidden landscape:block">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
          {/* Match Format Header */}
          <div className="text-center mb-1 sm:mb-2">
            <span className="text-white text-xs sm:text-sm font-medium tracking-wide drop-shadow-lg">
              APA {match.match_format}
            </span>
            {match.sudden_death && (
              <div className="mt-1">
                <span className="bg-red-600 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-bold tracking-wider drop-shadow-lg">
                  SUDDEN DEATH
                </span>
                {match.sudden_death_time && (
                  <span className="text-red-400 text-xs ml-1 sm:ml-2 drop-shadow-lg">
                    {match.sudden_death_time}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Main Scoreboard */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 items-center">
            {/* Team A */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
              <div 
                className="relative p-2 sm:p-3 min-w-0 flex-1"
                style={{
                  backgroundColor: match.team_a_color,
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)'
                }}
              >
                <div className="text-white pl-1 sm:pl-2">
                  <div className="text-sm sm:text-lg lg:text-xl font-bold truncate leading-tight drop-shadow-md">
                    {match.player_a_name}
                  </div>
                  <div className="text-xs sm:text-sm font-normal opacity-90 truncate drop-shadow-md">
                    {match.team_a_name}
                  </div>
                  <div className="text-xs opacity-75 mt-0.5 sm:mt-1 drop-shadow-md">
                    SL{match.player_a_skill_level} ({match.player_a_race_goal})
                  </div>
                </div>
              </div>
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-white tabular-nums drop-shadow-lg">
                {match.player_a_score}
              </div>
            </div>

            {/* Center Score */}
            <div className="text-center">
              <div className="text-white text-xs sm:text-sm mb-0.5 sm:mb-1 drop-shadow-lg">Match Score</div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white tabular-nums drop-shadow-lg">
                {match.team_a_score} - {match.team_b_score}
              </div>
            </div>

            {/* Team B */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 justify-end">
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-white tabular-nums drop-shadow-lg">
                {match.player_b_score}
              </div>
              <div 
                className="relative p-2 sm:p-3 min-w-0 flex-1"
                style={{
                  backgroundColor: match.team_b_color,
                  clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'
                }}
              >
                <div className="text-white text-right pr-1 sm:pr-2">
                  <div className="text-sm sm:text-lg lg:text-xl font-bold truncate leading-tight drop-shadow-md">
                    {match.player_b_name}
                  </div>
                  <div className="text-xs sm:text-sm font-normal opacity-90 truncate drop-shadow-md">
                    {match.team_b_name}
                  </div>
                  <div className="text-xs opacity-75 mt-0.5 sm:mt-1 drop-shadow-md">
                    SL{match.player_b_skill_level} ({match.player_b_race_goal})
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}