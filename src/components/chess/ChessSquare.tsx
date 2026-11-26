'use client';

import React, { memo, useCallback } from 'react';
import type { Square, PieceSymbol, Color } from 'chess.js';
import ChessPiece from './ChessPiece';
import MoveHighlights from './MoveHighlights';
import { useBoardTheme } from '../../contexts/ThemeContext';
import { usePieceAbilities } from '../../contexts/AbilityContext';

export interface SquarePiece {
  type: PieceSymbol;
  color: Color;
}

export interface ChessSquareProps {
  square: Square;
  piece: SquarePiece | null;
  isLight: boolean;
  isSelected: boolean;
  isLegalMove: boolean;
  isLastMove: boolean;
  isCheck: boolean;
  onClick: (square: Square) => void;
  onDragStart: (square: Square, e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (square: Square, e: React.DragEvent) => void;
}

const ChessSquare = memo(function ChessSquare({
  square,
  piece,
  isLight,
  isSelected,
  isLegalMove,
  isLastMove,
  isCheck,
  onClick,
  onDragStart,
  onDragOver,
  onDrop,
}: ChessSquareProps) {
  const { themeConfig } = useBoardTheme();
  const { abilitiesEnabled } = usePieceAbilities();
  const bgColor = isLight ? themeConfig.lightSquare : themeConfig.darkSquare;

  const handleClick = useCallback(() => {
    onClick(square);
  }, [onClick, square]);

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      onDragStart(square, e);
    },
    [onDragStart, square],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      onDragOver(e);
    },
    [onDragOver],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      onDrop(square, e);
    },
    [onDrop, square],
  );

  const hasPiece = piece !== null;

  return (
    <div
      role="button"
      tabIndex={0}
      data-square={square}
      className={`
        relative flex items-center justify-center touch-manipulation select-none
        ${hasPiece ? 'cursor-grab active:cursor-grabbing' : isLegalMove ? 'cursor-pointer' : 'cursor-default'}
      `}
      style={{ backgroundColor: bgColor }}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      draggable={hasPiece}
      onDragStart={hasPiece ? handleDragStart : undefined}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
      aria-label={`Square ${square}${piece ? ` with ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : ''}`}
    >
      {/* Highlight overlays */}
      <MoveHighlights
        isSelected={isSelected}
        isLegalMove={isLegalMove}
        isLastMove={isLastMove}
        isCheck={isCheck}
        hasPiece={hasPiece}
      />

      {/* Piece */}
      {piece && (
        <div className="relative z-[1] w-[80%] h-[80%]">
          <ChessPiece type={piece.type} color={piece.color} />
          {abilitiesEnabled && (piece.type === 'b' || piece.type === 'n' || piece.type === 'r' || piece.type === 'q') && (
            <span
              className="absolute -bottom-1 -right-1 text-[8px] leading-none p-0.5 rounded-full bg-black/60 border border-amber-400/50 text-amber-300 drop-shadow pointer-events-none"
              title={`${piece.type.toUpperCase()} Ability Active`}
            >
              {piece.type === 'b' ? '⚡' : piece.type === 'n' ? '💥' : piece.type === 'r' ? '🚀' : '🌀'}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

export default ChessSquare;
