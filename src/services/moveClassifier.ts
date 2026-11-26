/**
 * Comprehensive Move Classifier & Tactical Analyzer
 * Categorizes chess moves using Stockfish centipawn evaluations and chess.js board state.
 */

import { Chess, type Move } from 'chess.js';
import type { MoveClassification, EvaluationData } from '../types/chess';
import { getPieceValue } from '../lib/chess-utils';

export interface MoveAnalysisResult {
  classification: MoveClassification;
  centipawnLoss: number;
  evalBefore: number;
  evalAfter: number;
  tacticalEvent: 'fork' | 'pin' | 'hanging_piece' | 'sacrifice' | null;
  badge: {
    symbol: string;
    label: string;
    color: string;
    bg: string;
  };
}

export const CLASSIFICATION_BADGES: Record<
  MoveClassification,
  { symbol: string; label: string; color: string; bg: string }
> = {
  brilliant:   { symbol: '!!', label: 'Brilliant',   color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' },
  best:        { symbol: '★',  label: 'Best Move',   color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)'  },
  excellent:   { symbol: '✓',  label: 'Excellent',   color: '#84cc16', bg: 'rgba(132, 204, 22, 0.15)' },
  good:        { symbol: '•',  label: 'Good',        color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)'},
  inaccuracy:  { symbol: '?!', label: 'Inaccuracy',  color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)'  },
  mistake:     { symbol: '?',  label: 'Mistake',     color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' },
  blunder:     { symbol: '??', label: 'Blunder',     color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)'  },
  missed_win:  { symbol: '✕',  label: 'Missed Win',  color: '#dc2626', bg: 'rgba(220, 38, 38, 0.15)'  },
};

/**
 * Classify a move given position evaluations before and after.
 * evaluations are from White's perspective (+ = White advantage, - = Black advantage).
 */
export function classifyMove(
  move: Move,
  gameBefore: Chess,
  evalBeforeData: EvaluationData,
  evalAfterData: EvaluationData,
  bestEngineMove: string | null
): MoveAnalysisResult {
  const turn = move.color; // 'w' or 'b'
  const isWhite = turn === 'w';

  // Normalize evaluations to player's perspective (+ = advantage for the player who made the move)
  const playerEvalBefore = isWhite ? evalBeforeData.score : -evalBeforeData.score;
  const playerEvalAfter = isWhite ? evalAfterData.score : -evalAfterData.score;

  // Centipawn loss: how much advantage the player lost by making this move
  const centipawnLoss = Math.max(0, playerEvalBefore - playerEvalAfter);

  // Check UCI string match (e.g. "e2e4")
  const uciMove = `${move.from}${move.to}${move.promotion || ''}`;
  const isEngineBest = bestEngineMove === uciMove;

  // Tactical checks
  let tacticalEvent: 'fork' | 'pin' | 'hanging_piece' | 'sacrifice' | null = null;

  // 1. Check for sacrifice (material given up while position remains strong)
  const pieceVal = getPieceValue(move.piece);
  const capturedVal = move.captured ? getPieceValue(move.captured) : 0;
  const isSacrifice = pieceVal >= 3 && capturedVal < pieceVal && playerEvalAfter >= 150;

  if (isSacrifice) {
    tacticalEvent = 'sacrifice';
  }

  // 2. Check for checkmate delivered
  const gameAfter = new Chess(gameBefore.fen());
  gameAfter.move(move);

  if (gameAfter.isCheckmate()) {
    return {
      classification: 'best',
      centipawnLoss: 0,
      evalBefore: playerEvalBefore,
      evalAfter: 9999,
      tacticalEvent: null,
      badge: CLASSIFICATION_BADGES.best,
    };
  }

  // 3. Classify based on sacrifice, engine best, and centipawn loss
  let classification: MoveClassification;

  if (isSacrifice && playerEvalAfter >= 200) {
    classification = 'brilliant';
  } else if (isEngineBest || centipawnLoss <= 10) {
    classification = 'best';
  } else if (centipawnLoss <= 35) {
    classification = 'excellent';
  } else if (centipawnLoss <= 80) {
    classification = 'good';
  } else if (centipawnLoss <= 160) {
    classification = 'inaccuracy';
  } else if (centipawnLoss <= 320) {
    classification = 'mistake';
  } else {
    // If player was winning by > +300 and gave it away to <= 50, it's a missed win
    if (playerEvalBefore >= 300 && playerEvalAfter <= 50) {
      classification = 'missed_win';
    } else {
      classification = 'blunder';
    }
  }

  return {
    classification,
    centipawnLoss,
    evalBefore: playerEvalBefore,
    evalAfter: playerEvalAfter,
    tacticalEvent,
    badge: CLASSIFICATION_BADGES[classification],
  };
}
