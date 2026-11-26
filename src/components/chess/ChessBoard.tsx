'use client';

import React, { memo, useMemo, useCallback } from 'react';
import type { Square, PieceSymbol, Color } from 'chess.js';
import type { EvaluationData } from '../../types/chess';
import ChessSquare from './ChessSquare';
import BoardCoordinates from './BoardCoordinates';
import { EvaluationBar } from './EvaluationBar';
import AbilityVfxOverlay from './AbilityVfxOverlay';
import EliminationVfxOverlay from './EliminationVfxOverlay';
import BoardCompanionWalker3D, { type BoardWalkEvent } from './BoardCompanionWalker3D';
import { usePieceAbilities } from '../../contexts/AbilityContext';
import { useEliminationFx } from '../../contexts/EliminationContext';
import { FILES, RANKS } from '../../lib/constants';

export interface ChessBoardProps {
  fen: string;
  selectedSquare: Square | null;
  legalMoves: Square[];
  lastMove: { from: Square; to: Square } | null;
  isCheck: boolean;
  turn: Color;
  boardFlipped: boolean;
  evaluation?: EvaluationData;
  boardWalkEvent?: BoardWalkEvent | null;
  hiddenSquare?: Square | null;
  onSquareClick: (square: Square) => void;
  onMoveDrop?: (from: Square, to: Square) => void;
}

/**
 * Parses the piece placement string from a FEN into a map of square to { type, color }.
 */
function parseFenPieces(fen: string): Map<Square, { type: PieceSymbol; color: Color }> {
  const pieces = new Map<Square, { type: PieceSymbol; color: Color }>();
  const [placement] = fen.split(' ');
  const rows = placement.split('/');

  rows.forEach((row, rowIndex) => {
    const rank = (8 - rowIndex).toString();
    let colIndex = 0;

    for (const char of row) {
      if (/[1-8]/.test(char)) {
        colIndex += parseInt(char, 10);
      } else {
        const file = FILES[colIndex];
        const square = `${file}${rank}` as Square;
        const color: Color = char === char.toUpperCase() ? 'w' : 'b';
        const type = char.toLowerCase() as PieceSymbol;
        pieces.set(square, { type, color });
        colIndex += 1;
      }
    }
  });

  return pieces;
}

const ChessBoard = memo(function ChessBoard({
  fen,
  selectedSquare,
  legalMoves,
  lastMove,
  isCheck,
  turn,
  boardFlipped,
  evaluation,
  boardWalkEvent = null,
  hiddenSquare = null,
  onSquareClick,
  onMoveDrop,
}: ChessBoardProps) {
  const { activeAbilityEvent } = usePieceAbilities();
  const { activeElimination } = useEliminationFx();
  const pieceMap = useMemo(() => parseFenPieces(fen), [fen]);

  // Find king square for check highlight
  const checkSquare = useMemo(() => {
    if (!isCheck) return null;
    for (const [sq, piece] of pieceMap.entries()) {
      if (piece.type === 'k' && piece.color === turn) {
        return sq;
      }
    }
    return null;
  }, [isCheck, pieceMap, turn]);

  // Ordered list of 64 squares according to board orientation
  const squares = useMemo(() => {
    const orderedFiles = boardFlipped ? [...FILES].reverse() : [...FILES];
    const orderedRanks = boardFlipped ? [...RANKS] : [...RANKS].reverse();

    const sqs: Square[] = [];
    for (const rank of orderedRanks) {
      for (const file of orderedFiles) {
        sqs.push(`${file}${rank}` as Square);
      }
    }
    return sqs;
  }, [boardFlipped]);

  const handleDragStart = useCallback((square: Square, e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', square);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (targetSquare: Square, e: React.DragEvent) => {
      e.preventDefault();
      const fromSquare = e.dataTransfer.getData('text/plain') as Square;
      if (!fromSquare || fromSquare === targetSquare) return;

      if (onMoveDrop) {
        onMoveDrop(fromSquare, targetSquare);
      } else {
        onSquareClick(fromSquare);
        onSquareClick(targetSquare);
      }
    },
    [onMoveDrop, onSquareClick]
  );

  return (
    <div className="flex items-stretch gap-2.5 w-full max-w-[590px] mx-auto select-none">
      {/* Live vertical evaluation bar */}
      {evaluation && (
        <EvaluationBar evaluation={evaluation} isFlipped={boardFlipped} />
      )}

      {/* Board container with subtle border & shadow */}
      <div className="relative aspect-square flex-1 rounded-xl overflow-hidden shadow-2xl border-4 border-[#242424] bg-[#1a1a1a]">
        {/* 8x8 Grid */}
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
          {squares.map((square, index) => {
            const rowIdx = Math.floor(index / 8);
            const colIdx = index % 8;
            const isLight = (rowIdx + colIdx) % 2 === 0;
            const piece = hiddenSquare === square ? null : (pieceMap.get(square) ?? null);
            const isSelected = selectedSquare === square;
            const isLegalMove = legalMoves.includes(square);
            const isLastMove = lastMove?.from === square || lastMove?.to === square;
            const isKingInCheck = checkSquare === square;

            return (
              <ChessSquare
                key={square}
                square={square}
                piece={piece}
                isLight={isLight}
                isSelected={isSelected}
                isLegalMove={isLegalMove}
                isLastMove={isLastMove}
                isCheck={isKingInCheck}
                onClick={onSquareClick}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            );
          })}
        </div>

        {/* Superpower Ability Visual FX Overlay (Laser beams, shockwaves, explosions) */}
        <AbilityVfxOverlay event={activeAbilityEvent} boardFlipped={boardFlipped} />

        {/* Capture Elimination Visual FX Overlay (Sword slash, Pistol shot, Cannon blast, etc.) */}
        <EliminationVfxOverlay event={activeElimination} boardFlipped={boardFlipped} />

        {/* 3D Companion Walking onto Board & Picking Up Captured Pieces */}
        <BoardCompanionWalker3D walkEvent={boardWalkEvent} boardFlipped={boardFlipped} />

        {/* Board coordinate overlays (a-h, 1-8) */}
        <BoardCoordinates boardFlipped={boardFlipped} />
      </div>
    </div>
  );
});

export default ChessBoard;
