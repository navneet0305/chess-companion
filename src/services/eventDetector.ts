/**
 * Live Chess Event Detector
 * Analyzes moves and game states to extract actionable companion reaction events.
 */

import type { Move, Chess } from 'chess.js';
import type { ChessEvent } from '../lib/dialogueLibrary';
import { getPieceValue } from '../lib/chess-utils';

export interface DetectedEvent {
  event: ChessEvent;
  priority: 'low' | 'medium' | 'high';
  description: string;
}

export function detectChessEvent(
  move: Move,
  game: Chess,
  isPlayerMove: boolean
): DetectedEvent {
  // 1. Checkmate & Victory / Defeat
  if (game.isCheckmate() || move.san.includes('#')) {
    return {
      event: isPlayerMove ? 'victory' : 'defeat',
      priority: 'high',
      description: isPlayerMove ? 'Player delivered checkmate!' : 'Opponent delivered checkmate',
    };
  }

  // 2. Stalemate or Draw
  if (game.isDraw() || game.isStalemate()) {
    return {
      event: 'draw',
      priority: 'high',
      description: 'Game drawn',
    };
  }

  // 3. Check
  if (game.isCheck() || move.san.includes('+')) {
    return {
      event: 'check',
      priority: 'medium',
      description: isPlayerMove ? 'Player gave check' : 'Opponent gave check',
    };
  }

  // 4. Castling
  if (move.flags.includes('k') || move.flags.includes('q') || move.san.startsWith('O-O')) {
    return {
      event: 'castling',
      priority: 'medium',
      description: isPlayerMove ? 'Player castled' : 'Opponent castled',
    };
  }

  // 5. Captures & Material evaluation
  if (move.captured) {
    if (move.captured === 'q') {
      return {
        event: isPlayerMove ? 'capture_queen' : 'lost_queen',
        priority: 'high',
        description: isPlayerMove ? 'Captured enemy Queen!' : 'Lost friendly Queen!',
      };
    }
    const val = getPieceValue(move.captured);
    if (val >= 5) { // Rook
      return {
        event: isPlayerMove ? 'capture_major' : 'lost_material',
        priority: 'high',
        description: isPlayerMove ? 'Captured enemy Rook' : 'Lost friendly Rook',
      };
    }
    return {
      event: isPlayerMove ? 'capture' : 'lost_material',
      priority: 'medium',
      description: isPlayerMove ? `Captured ${move.captured.toUpperCase()}` : `Lost ${move.captured.toUpperCase()}`,
    };
  }

  // 6. Good quiet move / standard development
  return {
    event: 'good_move',
    priority: 'low',
    description: 'Standard development move',
  };
}
