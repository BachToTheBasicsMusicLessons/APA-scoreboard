import React, { useState, useCallback, useEffect } from 'react';
import { Edit3, Palette, RotateCcw, ExternalLink, Trophy, Users, Home, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Match } from '../lib/supabase';
import { InstallButton } from './InstallButton';

interface ControllerInterfaceProps {
  match: Match;
  onUpdate: (updates: Partial<Match>) => void;
  sessionId: string;
}

export function ControllerInterface({ match, onUpdate, sessionId }: ControllerInterfaceProps) {
  const [editingField, setEditingField] = useState<string | null>(null);

  const overlayUrl = `${window.location.origin}/overlay/${sessionId}`;
  const previewUrl = `${window.location.origin}/preview?session_id=${sessionId}`;

  // Instant update handler - triggers immediate database sync
  const handleUpdate = useCallback((updates: Partial<Match>) => {
    onUpdate(updates);
  }, [onUpdate]);

  // Instant field change handler - updates on every keystroke
  const handleInstantChange = useCallback((field: string, value: string | number | boolean) => {
    handleUpdate({ [field]: value });
  }, [handleUpdate]);

  const handleFieldEdit = (field: string, value: string | number | boolean) => {
    handleUpdate({ [field]: value });
    setEditingField(null);
  };

  const handleScoreChange = (field: string, delta: number) => {
    const currentValue = (match as any)[field] || 0;
    const newValue = Math.max(0, currentValue + delta);
    handleUpdate({ [field]: newValue });
  };

  const EditableField = ({ 
    field, 
    value, 
    type = 'text',
    className = '',
    placeholder = '',
    min,
    max,
    instantUpdate = false
  }: {
    field: string;
    value: string | number;
    type?: string;
    className?: string;
    placeholder?: string;
    min?: number;
    max?: number;
    instantUpdate?: boolean;
  }) => {
    const isEditing = editingField === field;

    if (isEditing) {
      return (
        <div className="relative">
          <input
            type={type}
            defaultValue={value}
            min={min}
            max={max}
            className={`w-full p-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
            placeholder={placeholder}
            autoFocus
            onChange={instantUpdate ? (e) => {
              let newValue: string | number = e.target.value;
              if (type === 'number') {
                newValue = parseInt(e.target.value) || 0;
                if (min !== undefined) newValue = Math.max(min, newValue);
                if (max !== undefined) newValue = Math.min(max, newValue);
              }
              handleInstantChange(field, newValue);
            } : undefined}
            onBlur={(e) => {
              let newValue: string | number = e.target.value;
              if (type === 'number') {
                newValue = parseInt(e.target.value) || 0;
                if (min !== undefined) newValue = Math.max(min, newValue);
                if (max !== undefined) newValue = Math.min(max, newValue);
              }
              handleFieldEdit(field, newValue);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                let newValue: string | number = (e.target as HTMLInputElement).value;
                if (type === 'number') {
                  newValue = parseInt((e.target as HTMLInputElement).value) || 0;
                  if (min !== undefined) newValue = Math.max(min, newValue);
                  if (max !== undefined) newValue = Math.min(max, newValue);
                }
                handleFieldEdit(field, newValue);
              }
              if (e.key === 'Escape') {
                setEditingField(null);
              }
            }}
          />
        </div>
      );
    }

    return (
      <button
        onClick={() => setEditingField(field)}
        className={`text-left w-full p-2 rounded-lg hover:bg-gray-50 transition-colors ${className}`}
      >
        {value || placeholder}
      </button>
    );
  };

  const ColorPicker = ({ field, value }: { field: string; value: string }) => {
    return (
      <div className="flex items-center space-x-2">
        <div 
          className="w-8 h-8 rounded-lg border-2 border-gray-300"
          style={{ backgroundColor: value }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => handleInstantChange(field, e.target.value)}
          className="w-12 h-8 rounded border-none cursor-pointer"
        />
      </div>
    );
  };

  const ScoreControl = ({ field, value }: { field: string; value: number }) => {
    return (
      <div className="flex items-center space-x-2">
        <EditableField
          field={field}
          value={value}
          type="number"
          min={0}
          className="text-center font-bold text-lg"
          instantUpdate={true}
        />
        <button
          onClick={() => handleScoreChange(field, -1)}
          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          -
        </button>
        <button
          onClick={() => handleScoreChange(field, 1)}
          className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
        >
          +
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Trophy className="mr-2 text-blue-600" size={24} />
              APA Scoreboard
            </h1>
            <Link
              to="/"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Home"
            >
              <Home size={20} />
            </Link>
          </div>
          <p className="text-gray-600 text-sm mb-4">Changes sync instantly • Real-time updates</p>
          
          {/* PWA Install Button */}
          <InstallButton 
            variant="secondary" 
            size="sm" 
            className="w-full"
          />
        </div>

        {/* URLs */}
        <div className="space-y-3">
          {/* Overlay URL */}
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-blue-900 flex items-center">
                <ExternalLink size={16} className="mr-1" />
                Overlay URL (for OBS)
              </h3>
              <button
                onClick={() => navigator.clipboard.writeText(overlayUrl)}
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
            <div className="text-xs text-blue-700 font-mono break-all bg-white p-2 rounded border">
              {overlayUrl}
            </div>
          </div>

          {/* Preview URL */}
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-green-900 flex items-center">
                <Eye size={16} className="mr-1" />
                Preview URL
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigator.clipboard.writeText(previewUrl)}
                  className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                >
                  Copy
                </button>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                >
                  Open
                </a>
              </div>
            </div>
            <div className="text-xs text-green-700 font-mono break-all bg-white p-2 rounded border">
              {previewUrl}
            </div>
          </div>
        </div>

        {/* Match Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Edit3 size={16} className="mr-2" />
            Match Settings
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <select
                value={match.match_format}
                onChange={(e) => handleInstantChange('match_format', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="8-Ball">8-Ball</option>
                <option value="9-Ball">9-Ball</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sudden Death</label>
                <button
                  onClick={() => handleInstantChange('sudden_death', !match.sudden_death)}
                  className={`w-full p-2 rounded-lg font-medium transition-colors ${
                    match.sudden_death 
                      ? 'bg-red-100 text-red-700 border border-red-300' 
                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                  }`}
                >
                  {match.sudden_death ? 'ON' : 'OFF'}
                </button>
              </div>
              {match.sudden_death && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <EditableField
                    field="sudden_death_time"
                    value={match.sudden_death_time}
                    placeholder="e.g., 1:00 PM"
                    className="text-sm"
                    instantUpdate={true}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Team A */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Users size={16} className="mr-2" />
              Team A
            </h3>
            <ColorPicker field="team_a_color" value={match.team_a_color} />
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
              <EditableField
                field="team_a_name"
                value={match.team_a_name}
                placeholder="Team A"
                instantUpdate={true}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Score</label>
              <ScoreControl field="team_a_score" value={match.team_a_score} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Player Name</label>
                <EditableField
                  field="player_a_name"
                  value={match.player_a_name}
                  placeholder="Player A"
                  instantUpdate={true}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Game Score</label>
                <div className="flex items-center space-x-1">
                  <EditableField
                    field="player_a_score"
                    value={match.player_a_score}
                    type="number"
                    min={0}
                    className="text-center font-bold"
                    instantUpdate={true}
                  />
                  <button
                    onClick={() => handleScoreChange('player_a_score', -1)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded text-sm transition-colors"
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleScoreChange('player_a_score', 1)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded text-sm transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
                <EditableField
                  field="player_a_skill_level"
                  value={match.player_a_skill_level}
                  type="number"
                  min={1}
                  max={9}
                  className="text-center"
                  instantUpdate={true}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Race Goal</label>
                <EditableField
                  field="player_a_race_goal"
                  value={match.player_a_race_goal}
                  type="number"
                  min={1}
                  className="text-center"
                  instantUpdate={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Team B */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Users size={16} className="mr-2" />
              Team B
            </h3>
            <ColorPicker field="team_b_color" value={match.team_b_color} />
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
              <EditableField
                field="team_b_name"
                value={match.team_b_name}
                placeholder="Team B"
                instantUpdate={true}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Score</label>
              <ScoreControl field="team_b_score" value={match.team_b_score} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Player Name</label>
                <EditableField
                  field="player_b_name"
                  value={match.player_b_name}
                  placeholder="Player B"
                  instantUpdate={true}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Game Score</label>
                <div className="flex items-center space-x-1">
                  <EditableField
                    field="player_b_score"
                    value={match.player_b_score}
                    type="number"
                    min={0}
                    className="text-center font-bold"
                    instantUpdate={true}
                  />
                  <button
                    onClick={() => handleScoreChange('player_b_score', -1)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded text-sm transition-colors"
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleScoreChange('player_b_score', 1)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded text-sm transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
                <EditableField
                  field="player_b_skill_level"
                  value={match.player_b_skill_level}
                  type="number"
                  min={1}
                  max={9}
                  className="text-center"
                  instantUpdate={true}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Race Goal</label>
                <EditableField
                  field="player_b_race_goal"
                  value={match.player_b_race_goal}
                  type="number"
                  min={1}
                  className="text-center"
                  instantUpdate={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <button
            onClick={() => {
              handleUpdate({
                team_a_score: 0,
                team_b_score: 0,
                player_a_score: 0,
                player_b_score: 0,
                sudden_death: false,
                sudden_death_time: ''
              });
            }}
            className="w-full p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <RotateCcw size={16} className="mr-2" />
            Reset Scores
          </button>
        </div>
      </div>
    </div>
  );
}