'use client';

import { useEffect, useRef, forwardRef } from 'react';
import type { PieceSymbol } from 'chess.js';
import type { ClassifiedMove } from '../../types/chess';
import { CLASSIFICATION_BADGES } from '../../services/moveClassifier';

interface MoveHistoryProps {
  moves: ClassifiedMove[];
  currentMoveIndex: number;
  onMoveClick?: (index: number) => void;
}

/** Map piece symbols to Unicode glyphs for algebraic notation display. */
const PIECE_GLYPHS: Record<PieceSymbol, string> = {
  k: '♔',
  q: '♕',
  r: '♖',
  b: '♗',
  n: '♘',
  p: '',
};

/**
 * Format a chess.js Move into a display string with Unicode piece symbols.
 * E.g. "Nf3" → "♘f3", "O-O" stays as-is.
 */
function formatMove(move: ClassifiedMove): string {
  const { san } = move;

  // Castling – leave as-is
  if (san.startsWith('O-O')) return san;

  // The first character is uppercase for a piece move
  const piece = san[0];
  if (piece >= 'A' && piece <= 'Z') {
    const symbol = PIECE_GLYPHS[piece.toLowerCase() as PieceSymbol];
    if (symbol) return symbol + san.slice(1);
  }

  return san;
}

export default function MoveHistory({ moves, currentMoveIndex, onMoveClick }: MoveHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLSpanElement>(null);

  // Auto-scroll ONLY within the MoveHistory scroll box (never jump the outer page on mobile)
  useEffect(() => {
    const container = scrollRef.current;
    const active = activeRef.current;
    if (!container || !active) return;

    const containerRect = container.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    if (containerRect.height === 0 || containerRect.width === 0) return;

    if (activeRect.bottom > containerRect.bottom) {
      container.scrollTop += activeRect.bottom - containerRect.bottom + 4;
    } else if (activeRect.top < containerRect.top) {
      container.scrollTop -= containerRect.top - activeRect.top + 4;
    }
  }, [currentMoveIndex]);

  // Build pairs: [ [whiteMove, blackMove?], ... ]
  const movePairs: [ClassifiedMove, ClassifiedMove | undefined][] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push([moves[i], moves[i + 1]]);
  }

  return (
    <div className="flex flex-col rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]">
      {/* Header */}
      <div className="border-b border-[#2a2a2a] px-3 py-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Move History</h3>
        <span className="text-[10px] text-gray-500 font-mono">{moves.length} moves</span>
      </div>

      {/* Scrollable move list */}
      <div ref={scrollRef} className="max-h-64 overflow-y-auto overscroll-contain scrollbar-thin">
        {movePairs.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-gray-600">No moves yet</div>
        ) : (
          <table className="w-full font-mono text-xs">
            <tbody>
              {movePairs.map(([white, black], pairIdx) => {
                const whiteIdx = pairIdx * 2;
                const blackIdx = pairIdx * 2 + 1;

                return (
                  <tr
                    key={pairIdx}
                    className="border-b border-[#2a2a2a]/50 last:border-b-0 hover:bg-white/[0.02]"
                  >
                    {/* Move number */}
                    <td className="w-9 py-1 pl-2.5 pr-1 text-right text-gray-600 select-none">
                      {pairIdx + 1}.
                    </td>

                    {/* White move */}
                    <td className="w-[45%] py-1 px-1.5">
                      <MoveCell
                        ref={whiteIdx === currentMoveIndex ? activeRef : undefined}
                        move={white}
                        isActive={whiteIdx === currentMoveIndex}
                        onClick={() => onMoveClick?.(whiteIdx)}
                      />
                    </td>

                    {/* Black move */}
                    <td className="w-[45%] py-1 px-1.5">
                      {black ? (
                        <MoveCell
                          ref={blackIdx === currentMoveIndex ? activeRef : undefined}
                          move={black}
                          isActive={blackIdx === currentMoveIndex}
                          onClick={() => onMoveClick?.(blackIdx)}
                        />
                      ) : (
                        <span className="text-gray-700">…</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Single move cell with optional classification badge                */
/* ------------------------------------------------------------------ */

interface MoveCellProps {
  move: ClassifiedMove;
  isActive: boolean;
  onClick?: () => void;
}

const MoveCell = forwardRef<HTMLSpanElement, MoveCellProps>(
  ({ move, isActive, onClick }, ref) => {
    const badge = move.classification ? CLASSIFICATION_BADGES[move.classification] : null;

    return (
      <span
        ref={ref}
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 cursor-pointer rounded px-1.5 py-0.5 transition-colors ${
          isActive
            ? 'bg-green-500/20 text-green-400 font-medium'
            : 'text-gray-300 hover:bg-[#2a2a2a] hover:text-white'
        }`}
      >
        <span>{formatMove(move)}</span>
        {badge && (
          <span
            className="text-[10px] font-bold px-1 py-0.2 rounded leading-tight"
            style={{
              color: badge.color,
              backgroundColor: badge.bg,
            }}
            title={badge.label}
          >
            {badge.symbol}
          </span>
        )}
      </span>
    );
  }
);

MoveCell.displayName = 'MoveCell';
