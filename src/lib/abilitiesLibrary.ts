import type { PieceSymbol } from 'chess.js';
import type { PieceAbilityConfig, PieceAbilityId } from '../types/abilities';

export const PIECE_ABILITIES: PieceAbilityConfig[] = [
  // ─── BISHOP ABILITIES ───
  {
    id: 'bishop_diagonal_laser',
    name: 'Diagonal Death Ray',
    pieceType: 'b',
    icon: '⚡',
    badge: 'USER FAVORITE',
    tagline: 'Annihilates any opponent piece in its diagonal line of sight!',
    description: 'Whenever your Bishop moves or when an opponent enters its diagonal rays, the Bishop unleashes a high-powered energy beam vaporizing all enemy pieces caught in that diagonal sightline!',
    vfx: 'laser_beam',
    soundType: 'laser',
  },
  {
    id: 'bishop_divine_shield',
    name: 'Aegis of the Clergy',
    pieceType: 'b',
    icon: '🛡️',
    badge: 'DEFENSIVE',
    tagline: 'Grants invulnerability to all diagonal allies',
    description: 'All friendly pieces positioned along the Bishop diagonal rays are bathed in holy light and cannot be captured.',
    vfx: 'shield_bubble',
    soundType: 'shield',
  },
  {
    id: 'bishop_teleport',
    name: 'Shadow Phase',
    pieceType: 'b',
    icon: '✨',
    badge: 'MOBILITY',
    tagline: 'Teleport to any empty square of the same color',
    description: 'Can warp instantly to any unoccupied square of its designated color across the entire board.',
    vfx: 'teleport_sparkle',
    soundType: 'teleport',
  },

  // ─── KNIGHT ABILITIES ───
  {
    id: 'knight_shockwave',
    name: 'Meteor Stomp',
    pieceType: 'n',
    icon: '💥',
    badge: 'AOE DAMAGE',
    tagline: 'Crashing landing creates a destructive seismic shockwave',
    description: 'Upon landing from its leap, the Knight triggers a ground-shaking shockwave that disintegrates any adjacent enemy pawns within a 1-square radius!',
    vfx: 'shockwave_blast',
    soundType: 'shockwave',
  },
  {
    id: 'knight_quantum_leap',
    name: 'Hyper Steed',
    pieceType: 'n',
    icon: '🐴',
    badge: 'MOBILITY',
    tagline: 'Can leap in extended 3x1 and 2x1 L-shapes',
    description: 'Extends the knight jumping range, allowing it to bypass deep fortifications and ambush from distant flanks.',
    vfx: 'teleport_sparkle',
    soundType: 'teleport',
  },

  // ─── ROOK ABILITIES ───
  {
    id: 'rook_battering_ram',
    name: 'Siege Cannon',
    pieceType: 'r',
    icon: '🚀',
    badge: 'PIERCING',
    tagline: 'Obliterates all pieces in an unobstructed rank or file',
    description: 'Charges forward with colossal momentum, crushing through and vaporizing any enemy pieces in its path along the rank or file!',
    vfx: 'fire_explosion',
    soundType: 'explosion',
  },
  {
    id: 'rook_ballista',
    name: 'Fortress Ballista',
    pieceType: 'r',
    icon: '🎯',
    badge: 'RANGED',
    tagline: 'Can fire a ranged missile along its rank or file',
    description: 'Target an enemy piece anywhere along the Rook rank or file and destroy it with an incendiary siege arrow.',
    vfx: 'laser_beam',
    soundType: 'laser',
  },

  // ─── QUEEN ABILITIES ───
  {
    id: 'queen_gravity_well',
    name: 'Singularity Horizon',
    pieceType: 'q',
    icon: '🌀',
    badge: 'CONTROL',
    tagline: 'Gravitational singularity pulls enemy pieces inward',
    description: 'The Queen exerts a massive gravitational pull, dragging adjacent enemy pieces 1 square closer and disrupting the opponent coordination.',
    vfx: 'shockwave_blast',
    soundType: 'shockwave',
  },
  {
    id: 'queen_chrono_surge',
    name: 'Chrono Warp',
    pieceType: 'q',
    icon: '⏳',
    badge: 'TEMPO',
    tagline: 'Grants an immediate bonus turn after moving',
    description: 'Bends the space-time continuum, allowing you to immediately play a second move right after moving your Queen!',
    vfx: 'teleport_sparkle',
    soundType: 'teleport',
  },

  // ─── PAWN ABILITIES ───
  {
    id: 'pawn_kamikaze',
    name: 'Martyr Bomb',
    pieceType: 'p',
    icon: '💣',
    badge: 'REVENGE',
    tagline: 'Detonates upon capture, taking the attacker with it',
    description: 'When an opponent piece captures this pawn, it triggers an explosive payload that destroys the capturing piece as well!',
    vfx: 'fire_explosion',
    soundType: 'explosion',
  },
  {
    id: 'pawn_super_dash',
    name: 'Vanguard Sprint',
    pieceType: 'p',
    icon: '👟',
    badge: 'SPEED',
    tagline: 'Can sprint 3 squares forward on its opening move',
    description: 'Allows pawns to launch a lightning blitz, moving 3 squares forward from their home rank to seize the center instantly.',
    vfx: 'laser_beam',
    soundType: 'laser',
  },

  // ─── KING ABILITIES ───
  {
    id: 'king_immortal_aegis',
    name: 'Divine Resurrection',
    pieceType: 'k',
    icon: '👑',
    badge: 'SURVIVAL',
    tagline: 'Survives fatal capture/checkmate once per match',
    description: 'When facing lethal checkmate or capture, the King deploys a golden celestial barrier, destroying the attacking piece and surviving!',
    vfx: 'shield_bubble',
    soundType: 'shield',
  },
  {
    id: 'king_royal_swap',
    name: 'Royal Castling Swap',
    pieceType: 'k',
    icon: '🔄',
    badge: 'TACTICAL',
    tagline: 'Can swap positions with any friendly piece on board',
    description: 'Once per game, the King can command any friendly piece and swap locations with it instantly, escaping danger or launching an attack.',
    vfx: 'teleport_sparkle',
    soundType: 'teleport',
  },
];

export const DEFAULT_PIECE_ABILITIES: Record<PieceSymbol, PieceAbilityId> = {
  b: 'bishop_diagonal_laser', // User's requested Bishop diagonal destruction
  n: 'knight_shockwave',
  r: 'rook_battering_ram',
  q: 'queen_gravity_well',
  p: 'pawn_kamikaze',
  k: 'king_immortal_aegis',
};

export const PIECE_DISPLAY_NAMES: Record<PieceSymbol, { name: string; icon: string }> = {
  p: { name: 'Pawn', icon: '♟' },
  n: { name: 'Knight', icon: '♞' },
  b: { name: 'Bishop', icon: '♝' },
  r: { name: 'Rook', icon: '♜' },
  q: { name: 'Queen', icon: '♛' },
  k: { name: 'King', icon: '♚' },
};

export function getAbilitiesForPiece(type: PieceSymbol): PieceAbilityConfig[] {
  return PIECE_ABILITIES.filter((a) => a.pieceType === type);
}

export function getAbilityConfig(id: PieceAbilityId): PieceAbilityConfig | undefined {
  return PIECE_ABILITIES.find((a) => a.id === id);
}
