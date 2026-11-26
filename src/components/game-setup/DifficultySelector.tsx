import React from 'react';
import type { Difficulty } from '../../types/chess';
import { DIFFICULTY_CONFIG } from '../../types/chess';

interface DifficultySelectorProps {
  selected: Difficulty;
  onSelect: (difficulty: Difficulty) => void;
}

export default function DifficultySelector({
  selected,
  onSelect,
}: DifficultySelectorProps) {
  const difficulties = Object.entries(DIFFICULTY_CONFIG) as [
    Difficulty,
    (typeof DIFFICULTY_CONFIG)[Difficulty]
  ][];

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        AI Difficulty Level
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {difficulties.map(([key, config]) => {
          const isSelected = selected === key;
          const isMax = key === 'stockfish_max';
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={`flex flex-col items-center justify-between p-2.5 rounded-xl border text-center transition-all ${
                isSelected
                  ? isMax
                    ? 'border-amber-400 bg-amber-500/15 text-white shadow-md shadow-amber-500/10'
                    : 'border-green-500 bg-green-500/10 text-white shadow-sm'
                  : 'border-[#2a2a2a] bg-[#242424] text-gray-400 hover:border-[#3a3a3a] hover:text-gray-200'
              }`}
            >
              <span className={`text-xs font-bold ${isSelected ? (isMax ? 'text-amber-400' : 'text-green-400') : 'text-gray-200'}`}>
                {config.label}
              </span>
              <span className={`text-[10px] font-mono mt-1 ${isMax ? 'text-amber-300 font-bold' : 'text-gray-500'}`}>
                {config.elo}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
