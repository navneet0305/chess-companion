import React from 'react';
import type { TimeControl } from '../../types/chess';
import { TIME_CONTROLS } from '../../types/chess';

interface TimeControlSelectorProps {
  selected: TimeControl;
  onSelect: (timeControl: TimeControl) => void;
}

export default function TimeControlSelector({
  selected,
  onSelect,
}: TimeControlSelectorProps) {
  const categories = ['Bullet', 'Blitz', 'Rapid', 'Unlimited'] as const;

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Time Control
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TIME_CONTROLS.map((tc) => {
          const isSelected = selected.name === tc.name;
          return (
            <button
              key={tc.name}
              type="button"
              onClick={() => onSelect(tc)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                isSelected
                  ? 'border-green-500 bg-green-500/10 text-white shadow-sm'
                  : 'border-[#2a2a2a] bg-[#242424] text-gray-400 hover:border-[#3a3a3a] hover:text-gray-200'
              }`}
            >
              <span className={`text-xs font-bold ${isSelected ? 'text-green-400' : 'text-gray-200'}`}>
                {tc.name}
              </span>
              <span className="text-[10px] text-gray-500 mt-0.5">
                {tc.category}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
