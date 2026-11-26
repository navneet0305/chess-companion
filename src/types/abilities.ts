import type { PieceSymbol, Square, Color } from 'chess.js';

export type PieceAbilityId =
  // Bishop
  | 'bishop_diagonal_laser'   // Destroys opponent pieces entering or standing in diagonal
  | 'bishop_divine_shield'    // Protects diagonal allies from capture
  | 'bishop_teleport'         // Can teleport to any empty square of its color
  // Knight
  | 'knight_shockwave'        // Explodes in 1-square radius on landing, vaporizing enemy pawns
  | 'knight_quantum_leap'     // Extended L-jumps (3x1, 2x1)
  // Rook
  | 'rook_battering_ram'      // Blasts straight through multiple pieces in rank/file
  | 'rook_ballista'           // Long-range sniper shot along rank/file
  // Queen
  | 'queen_gravity_well'      // Pulls enemy pieces 1 step closer
  | 'queen_chrono_surge'      // Grants an immediate bonus extra move
  // Pawn
  | 'pawn_kamikaze'           // Explodes upon capture, destroying attacker
  | 'pawn_super_dash'         // 3-square opening sprint
  // King
  | 'king_immortal_aegis'     // Survives checkmate/capture once per game
  | 'king_royal_swap';        // Swaps positions with any friendly piece

export interface PieceAbilityConfig {
  id: PieceAbilityId;
  name: string;
  pieceType: PieceSymbol;
  icon: string;
  badge: string;
  tagline: string;
  description: string;
  vfx: 'laser_beam' | 'shockwave_blast' | 'fire_explosion' | 'teleport_sparkle' | 'shield_bubble';
  soundType: 'laser' | 'explosion' | 'teleport' | 'shield' | 'shockwave';
}

export interface PlayerAbilitiesState {
  enabled: boolean;
  abilities: Record<PieceSymbol, PieceAbilityId>;
}

export interface AbilityTriggerEvent {
  id: string;
  abilityId: PieceAbilityId;
  pieceType: PieceSymbol;
  pieceColor: Color;
  sourceSquare: Square;
  targetSquares: Square[];
  destroyedSquares: Square[];
  vfx: 'laser_beam' | 'shockwave_blast' | 'fire_explosion' | 'teleport_sparkle' | 'shield_bubble';
  message: string;
  timestamp: number;
}
