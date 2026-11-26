'use client';

import type { PieceSymbol } from 'chess.js';
import CapturedPieces from './CapturedPieces';
import ChessClock from './ChessClock';

interface PlayerCardProps {
  name: string;
  subtitle?: string;
  isActive: boolean;
  capturedPieces: { w: PieceSymbol[]; b: PieceSymbol[] };
  /** Which color this player is — also used to pick which captured set to show. */
  perspective: 'w' | 'b';
  time?: number;
  isAI?: boolean;
}

export default function PlayerCard({
  name,
  subtitle,
  isActive,
  capturedPieces,
  perspective,
  time,
  isAI = false,
}: PlayerCardProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border bg-[#1a1a1a] px-3 py-2 transition-colors ${
        isActive ? 'border-green-500/40' : 'border-[#2a2a2a]'
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          isAI
            ? 'bg-purple-500/20 text-purple-400'
            : 'bg-blue-500/20 text-blue-400'
        }`}
      >
        {isAI ? '🤖' : name.charAt(0).toUpperCase()}
      </div>

      {/* Name & subtitle */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-gray-200">
          {name}
        </span>
        {subtitle && (
          <span className="truncate text-xs text-gray-500">{subtitle}</span>
        )}
      </div>

      {/* Captured pieces */}
      <div className="flex-shrink-0">
        <CapturedPieces capturedPieces={capturedPieces} perspective={perspective} />
      </div>

      {/* Clock */}
      {time !== undefined && (
        <div className="flex-shrink-0">
          <ChessClock time={time} isActive={isActive} isPlayerClock={perspective === 'w'} />
        </div>
      )}
    </div>
  );
}
