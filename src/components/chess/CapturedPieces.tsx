'use client';

import type { PieceSymbol } from 'chess.js';
import { PIECE_VALUES, PIECE_UNICODE } from '@/lib/constants';
import { getMaterialBalance } from '@/lib/chess-utils';

interface CapturedPiecesProps {
  capturedPieces: { w: PieceSymbol[]; b: PieceSymbol[] };
  /** Which color's captured-pieces row to display (pieces this color has captured, i.e. opponent's lost pieces). */
  perspective: 'w' | 'b';
}

/** Sort order: highest value first. */
const VALUE_ORDER: PieceSymbol[] = ['q', 'r', 'b', 'n', 'p'];

function sortByValue(pieces: PieceSymbol[]): PieceSymbol[] {
  return [...pieces].sort(
    (a, b) => VALUE_ORDER.indexOf(a) - VALUE_ORDER.indexOf(b)
  );
}

export default function CapturedPieces({ capturedPieces, perspective }: CapturedPiecesProps) {
  // "perspective" = the color whose captures we show (what they took from the opponent)
  const pieces = sortByValue(capturedPieces[perspective]);
  const balance = getMaterialBalance(capturedPieces);

  // Material advantage for this perspective
  // Positive balance = white ahead, so if perspective is white show +N when balance > 0
  const advantage = perspective === 'w' ? balance : -balance;

  if (pieces.length === 0 && advantage <= 0) {
    return <div className="h-5" />; // empty placeholder to keep layout stable
  }

  // The captured pieces belong to the *opponent*, so render them in opponent's color
  const opponentColor = perspective === 'w' ? 'b' : 'w';

  return (
    <div className="flex items-center gap-0.5">
      {pieces.map((piece, i) => (
        <span
          key={`${piece}-${i}`}
          className="text-sm leading-none opacity-80"
          title={piece.toUpperCase()}
        >
          {PIECE_UNICODE[piece]?.[opponentColor] ?? piece}
        </span>
      ))}
      {advantage > 0 && (
        <span className="ml-1 text-xs font-medium text-gray-500">
          +{advantage}
        </span>
      )}
    </div>
  );
}
