import React from 'react';
import type { PlayerColor } from '../../types/chess';
import { WhiteKing, BlackKing } from '../../lib/piece-icons';

export type SideChoice = PlayerColor | 'random';

interface SideSelectorProps {
  selected: SideChoice;
  onSelect: (side: SideChoice) => void;
}

export default function SideSelector({ selected, onSelect }: SideSelectorProps) {
  const options: { value: SideChoice; label: string; icon: React.ReactNode }[] = [
    {
      value: 'w',
      label: 'White',
      icon: (
        <div className="w-8 h-8 flex items-center justify-center">
          <WhiteKing size={32} />
        </div>
      ),
    },
    {
      value: 'random',
      label: 'Random',
      icon: (
        <div className="w-8 h-8 flex items-center justify-center text-xl">
          🎲
        </div>
      ),
    },
    {
      value: 'b',
      label: 'Black',
      icon: (
        <div className="w-8 h-8 flex items-center justify-center">
          <BlackKing size={32} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Play As
      </label>
      <div className="grid grid-cols-3 gap-3">
        {options.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                isSelected
                  ? 'border-green-500 bg-green-500/10 text-white shadow-sm'
                  : 'border-[#2a2a2a] bg-[#242424] text-gray-400 hover:border-[#3a3a3a] hover:text-gray-200'
              }`}
            >
              {opt.icon}
              <span className={`text-xs font-semibold ${isSelected ? 'text-green-400' : 'text-gray-300'}`}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
