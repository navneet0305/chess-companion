import type { PieceSymbol, Color, Square } from 'chess.js';

export interface EliminationEvent {
  id: string;
  attackerType: PieceSymbol;
  attackerColor: Color;
  capturedType: PieceSymbol;
  fromSquare: Square;
  targetSquare: Square;
  timestamp: number;
}

export interface PieceEliminationMeta {
  pieceType: PieceSymbol;
  name: string;
  weaponName: string;
  icon: string;
  callout: string;
  accentColor: string;
  description: string;
}

export const ELIMINATION_CONFIG: Record<PieceSymbol, PieceEliminationMeta> = {
  p: {
    pieceType: 'p',
    name: 'Pawn',
    weaponName: 'Sword Slash',
    icon: '⚔️',
    callout: 'SLASHED!',
    accentColor: '#38bdf8',
    description: 'Swings a razor-sharp steel blade, slicing the captured piece cleanly in two.',
  },
  b: {
    pieceType: 'b',
    name: 'Bishop',
    weaponName: 'Pistol Shot',
    icon: '🔫',
    callout: 'HEADSHOT!',
    accentColor: '#facc15',
    description: 'Draws a flintlock pistol and fires a blazing high-velocity tracer round.',
  },
  n: {
    pieceType: 'n',
    name: 'Knight',
    weaponName: 'Lance Charge',
    icon: '🔱',
    callout: 'IMPALED!',
    accentColor: '#fb923c',
    description: 'Charges in with a gleaming cavalry lance, piercing straight through the target.',
  },
  r: {
    pieceType: 'r',
    name: 'Rook',
    weaponName: 'Cannon Blast',
    icon: '💣',
    callout: 'BOOM!',
    accentColor: '#ef4444',
    description: 'Fires a heavy iron cannonball that detonates on impact in a fiery blast.',
  },
  q: {
    pieceType: 'q',
    name: 'Queen',
    weaponName: 'Royal Execution',
    icon: '👑',
    callout: 'EXECUTED!',
    accentColor: '#c084fc',
    description: 'Unleashes twin crisscrossing royal energy blades in a lethal X-strike.',
  },
  k: {
    pieceType: 'k',
    name: 'King',
    weaponName: 'Scepter Smite',
    icon: '⚡',
    callout: 'SMITED!',
    accentColor: '#fde047',
    description: 'Calls down a golden bolt of royal lightning to obliterate the trespasser.',
  },
};
