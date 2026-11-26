import type { PieceSymbol, Square } from 'chess.js';
import { PIECE_VALUES, FILES, RANKS } from '@/lib/constants';

/**
 * Get the standard point value of a piece.
 */
export function getPieceValue(piece: PieceSymbol): number {
  return PIECE_VALUES[piece] ?? 0;
}

/**
 * Calculate the material balance from captured pieces.
 * Positive = white is ahead, negative = black is ahead.
 */
export function getMaterialBalance(capturedPieces: { w: PieceSymbol[]; b: PieceSymbol[] }): number {
  const whiteCaptured = capturedPieces.w.reduce((sum, p) => sum + getPieceValue(p), 0);
  const blackCaptured = capturedPieces.b.reduce((sum, p) => sum + getPieceValue(p), 0);
  // White captured pieces are pieces that *black* lost, so they favor white.
  // blackCaptured are pieces *white* lost, favoring black.
  return whiteCaptured - blackCaptured;
}

/**
 * Format a time value in seconds to a human-readable clock string.
 * - Under an hour: "M:SS"
 * - An hour or more: "H:MM:SS"
 */
export function formatTime(seconds: number): string {
  if (seconds < 0) seconds = 0;

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/**
 * Convert an algebraic square (e.g. "e4") to 0-indexed row/col.
 * Row 0 = rank 8 (top of board from white's perspective).
 * Col 0 = file a.
 */
export function squareToCoords(square: Square): { row: number; col: number } {
  const file = square[0];
  const rank = square[1];
  const col = FILES.indexOf(file as (typeof FILES)[number]);
  const row = 8 - parseInt(rank, 10);
  return { row, col };
}

/**
 * Convert 0-indexed row/col back to an algebraic square.
 */
export function coordsToSquare(row: number, col: number): Square {
  const file = FILES[col];
  const rank = RANKS[7 - row];
  return `${file}${rank}` as Square;
}

/**
 * Determine whether a square is light or dark.
 */
export function getSquareColor(square: Square): 'light' | 'dark' {
  const { row, col } = squareToCoords(square);
  return (row + col) % 2 === 0 ? 'light' : 'dark';
}
