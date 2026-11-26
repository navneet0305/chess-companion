'use client';

import React, { memo } from 'react';

/** Highlight colors used by ChessSquare and other components. */
export const HIGHLIGHT_COLORS = {
  selected: 'rgba(134,239,172,0.4)',
  legalMoveDot: 'rgba(0,0,0,0.15)',
  legalMoveCapture: 'rgba(0,0,0,0.15)',
  lastMove: 'rgba(255,213,79,0.4)',
  check: 'rgba(239,68,68,0.5)',
} as const;

export interface MoveHighlightsProps {
  isSelected: boolean;
  isLegalMove: boolean;
  isLastMove: boolean;
  isCheck: boolean;
  hasPiece: boolean;
}

/**
 * Overlay layer rendered inside a square to show selection, legal-move hints,
 * last-move highlights and check warnings.
 */
const MoveHighlights = memo(function MoveHighlights({
  isSelected,
  isLegalMove,
  isLastMove,
  isCheck,
  hasPiece,
}: MoveHighlightsProps) {
  return (
    <>
      {/* Last move highlight */}
      {isLastMove && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: HIGHLIGHT_COLORS.lastMove }}
        />
      )}

      {/* Selected square highlight */}
      {isSelected && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: HIGHLIGHT_COLORS.selected }}
        />
      )}

      {/* Check highlight — radial gradient */}
      {isCheck && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${HIGHLIGHT_COLORS.check} 0%, rgba(239,68,68,0.25) 50%, transparent 80%)`,
          }}
        />
      )}

      {/* Legal move indicator */}
      {isLegalMove && !hasPiece && (
        /* Empty square: small centered dot */
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="rounded-full"
            style={{
              width: '28%',
              height: '28%',
              backgroundColor: HIGHLIGHT_COLORS.legalMoveDot,
            }}
          />
        </div>
      )}

      {isLegalMove && hasPiece && (
        /* Capture square: ring around the edge */
        <div
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            margin: '4%',
            border: `5px solid ${HIGHLIGHT_COLORS.legalMoveCapture}`,
          }}
        />
      )}
    </>
  );
});

export default MoveHighlights;
