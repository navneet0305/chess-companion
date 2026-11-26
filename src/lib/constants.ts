import type { PieceSymbol } from 'chess.js';

/** Application name used across the UI. */
export const APP_NAME = 'ChessMate';

/** Starting FEN for a standard chess game. */
export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

/** Standard piece point values. */
export const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

/** Unicode symbols for rendering pieces as text. */
export const PIECE_UNICODE: Record<PieceSymbol, { w: string; b: string }> = {
  p: { w: '♙', b: '♟' },
  n: { w: '♘', b: '♞' },
  b: { w: '♗', b: '♝' },
  r: { w: '♖', b: '♜' },
  q: { w: '♕', b: '♛' },
  k: { w: '♔', b: '♚' },
};

/** File labels a–h. */
export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;

/** Rank labels 1–8. */
export const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

/** Total number of squares on the board. */
export const BOARD_SIZE = 8;

/** Default animation duration in milliseconds. */
export const ANIMATION_DURATION_MS = 200;

/** LocalStorage key for persisted game state. */
export const STORAGE_KEY_GAME = 'chessmate_game';

/** LocalStorage key for user preferences / settings. */
export const STORAGE_KEY_SETTINGS = 'chessmate_settings';
