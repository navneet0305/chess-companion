import type { PieceSymbol } from 'chess.js';

export type BishopSkinId = 'bishop_one_eyed' | 'bishop_classic' | 'bishop_cyber_oracle' | 'bishop_inquisitor';
export type KnightSkinId = 'knight_straw_hat' | 'knight_classic' | 'knight_cyber_steed' | 'knight_pegasus';
export type RookSkinId = 'rook_siege_cannon' | 'rook_classic' | 'rook_iron_citadel' | 'rook_neon';
export type QueenSkinId = 'queen_valkyrie' | 'queen_classic' | 'queen_pirate_empress' | 'queen_celestial';
export type KingSkinId = 'king_pirate_king' | 'king_classic' | 'king_grand_emperor' | 'king_cyber_overlord';
export type PawnSkinId = 'pawn_bandaged' | 'pawn_classic' | 'pawn_straw_hat' | 'pawn_cyber_drone';

export type AnyPieceSkinId =
  | BishopSkinId
  | KnightSkinId
  | RookSkinId
  | QueenSkinId
  | KingSkinId
  | PawnSkinId;

export interface PieceSkinDefinition {
  id: AnyPieceSkinId;
  pieceType: PieceSymbol;
  name: string;
  tag: string;
  icon: string;
  description: string;
  rarity?: 'legendary' | 'epic' | 'rare' | 'classic';
}

export type PlayerPieceSkins = {
  b: BishopSkinId;
  n: KnightSkinId;
  r: RookSkinId;
  q: QueenSkinId;
  k: KingSkinId;
  p: PawnSkinId;
};

export interface CustomPieceAppearance {
  id: string;
  pieceType: PieceSymbol;
  targetSide?: 'w' | 'b' | 'both';
  prompt: string;
  displayName: string;
  auraColor: string;
  outfitColor: string;
  outfitAccent: string;
  skinColor: string;
  hairColor: string;
  hairStyle: 'spiky_gojo' | 'spiky_wild' | 'straw_hat_hair' | 'slick' | 'hooded' | 'helmet';
  eyeStyle: 'six_eyes' | 'blindfold_peek' | 'sharingan' | 'fierce' | 'visor' | 'mask_eyes' | 'scar_eye';
  eyeColor: string;
  headwear: 'none' | 'blindfold' | 'straw_hat' | 'headband' | 'crown' | 'helmet_mask' | 'horns';
  facialMark: 'none' | 'scar_cheek' | 'scar_eye' | 'whiskers' | 'sukuna_marks' | 'spider_web';
  prop: 'none' | 'infinity_orb' | 'katana' | 'fire_ki' | 'lightning' | 'web' | 'saber';
}

export const DEFAULT_PIECE_SKINS: PlayerPieceSkins = {
  b: 'bishop_one_eyed',       // User's requested One-Eyed Bishop!
  n: 'knight_straw_hat',      // Luffy's Straw Hat Steed!
  r: 'rook_siege_cannon',     // Heavy Iron Siege Cannon
  q: 'queen_valkyrie',        // Winged Valkyrie Sovereign
  k: 'king_pirate_king',      // Crowned Straw Hat Pirate King
  p: 'pawn_bandaged',         // Battle-Hardened Bandaged Cadet
};

export const PIECE_SKIN_CATALOG: Record<PieceSymbol, PieceSkinDefinition[]> = {
  b: [
    {
      id: 'bishop_one_eyed',
      pieceType: 'b',
      name: 'One-Eyed Bishop',
      tag: 'USER FAVORITE 👁️',
      icon: '👁️',
      description: 'Battle-hardened bishop with a pirate leather eyepatch, combat sword scar, and glowing laser eye.',
      rarity: 'legendary',
    },
    {
      id: 'bishop_cyber_oracle',
      pieceType: 'b',
      name: 'Cyber Oracle',
      tag: 'CYBERPUNK 🔮',
      icon: '🔮',
      description: 'Futuristic bishop equipped with an augmented cybernetic optic visor with digital tracking reticle.',
      rarity: 'epic',
    },
    {
      id: 'bishop_inquisitor',
      pieceType: 'b',
      name: 'Grand Inquisitor',
      tag: 'HOLY ORDER ✝️',
      icon: '✝️',
      description: 'Ornate gold-trimmed papal mitre topped with a radiant celestial cross finial.',
      rarity: 'rare',
    },
    {
      id: 'bishop_classic',
      pieceType: 'b',
      name: 'Classic Staunton',
      tag: 'TOURNAMENT ♟️',
      icon: '♟️',
      description: 'Traditional standard tournament Staunton bishop with iconic mitre cleft.',
      rarity: 'classic',
    },
  ],
  n: [
    {
      id: 'knight_straw_hat',
      pieceType: 'n',
      name: 'Straw Hat Stallion',
      tag: 'ANIME PIRATE 👒',
      icon: '👒',
      description: 'Monkey D. Luffy inspired warhorse donning a signature woven straw hat with scarlet crimson band.',
      rarity: 'legendary',
    },
    {
      id: 'knight_cyber_steed',
      pieceType: 'n',
      name: 'Mecha Cyber-Steed',
      tag: 'TECH MECHA 🤖',
      icon: '🤖',
      description: 'Chromed cybernetic warhorse with glowing blue power cables and reinforced head plating.',
      rarity: 'epic',
    },
    {
      id: 'knight_pegasus',
      pieceType: 'n',
      name: 'Celestial Pegasus',
      tag: 'MYTHIC 🪽',
      icon: '🪽',
      description: 'Divine winged warhorse with feathered celestial wings arching from its muscular neck.',
      rarity: 'rare',
    },
    {
      id: 'knight_classic',
      pieceType: 'n',
      name: 'Classic Staunton',
      tag: 'TOURNAMENT ♟️',
      icon: '♟️',
      description: 'Traditional tournament hand-carved equestrian Staunton knight.',
      rarity: 'classic',
    },
  ],
  r: [
    {
      id: 'rook_siege_cannon',
      pieceType: 'r',
      name: 'Siege Artillery Cannon',
      tag: 'HEAVY ARTILLERY 💥',
      icon: '💥',
      description: 'Reinforced iron-clad fortress turret fitted with an active explosive cannon barrel.',
      rarity: 'legendary',
    },
    {
      id: 'rook_iron_citadel',
      pieceType: 'r',
      name: 'Iron Spired Citadel',
      tag: 'FORTIFIED 🏰',
      icon: '🏰',
      description: 'Stone bastion with spiked defensive battlements and reinforced steel portcullis.',
      rarity: 'epic',
    },
    {
      id: 'rook_neon',
      pieceType: 'r',
      name: 'Neon Cyber Bastion',
      tag: 'NEON GRID 🌆',
      icon: '🌆',
      description: 'Glowing cyberpunk monolith with glowing neon energy conduits and forcefield emitters.',
      rarity: 'rare',
    },
    {
      id: 'rook_classic',
      pieceType: 'r',
      name: 'Classic Staunton',
      tag: 'TOURNAMENT ♟️',
      icon: '♟️',
      description: 'Traditional four-cleft castle battlement Staunton rook.',
      rarity: 'classic',
    },
  ],
  q: [
    {
      id: 'queen_valkyrie',
      pieceType: 'q',
      name: 'Valkyrie Sovereign',
      tag: 'VALKYRIE 👑',
      icon: '👑',
      description: 'Radiant battle-queen tiara flaring out with golden valkyrie wings and glowing emerald gems.',
      rarity: 'legendary',
    },
    {
      id: 'queen_pirate_empress',
      pieceType: 'q',
      name: 'Pirate Empress',
      tag: 'SEAS RULER 🏴‍☠️',
      icon: '🏴‍☠️',
      description: 'Opulent captain tricorn adorned with royal plumages, golden skull jewel, and ruby corsage.',
      rarity: 'epic',
    },
    {
      id: 'queen_celestial',
      pieceType: 'q',
      name: 'Celestial Empress',
      tag: 'COSMIC ✨',
      icon: '✨',
      description: 'Cosmic coronal halo encircled by rotating astral gems and starlight diamond crest.',
      rarity: 'rare',
    },
    {
      id: 'queen_classic',
      pieceType: 'q',
      name: 'Classic Staunton',
      tag: 'TOURNAMENT ♟️',
      icon: '♟️',
      description: 'Traditional five-point coronet Staunton queen.',
      rarity: 'classic',
    },
  ],
  k: [
    {
      id: 'king_pirate_king',
      pieceType: 'k',
      name: 'The Pirate King',
      tag: 'PIRATE KING 👑',
      icon: '👑',
      description: 'Luffy-inspired straw hat fused with the golden imperial cross of the grand monarch.',
      rarity: 'legendary',
    },
    {
      id: 'king_grand_emperor',
      pieceType: 'k',
      name: 'Grand Emperor',
      tag: 'ROYALTY ⚜️',
      icon: '⚜️',
      description: 'Heavy imperial gold monarch crown encrusted with diamonds and royal fleur-de-lis.',
      rarity: 'epic',
    },
    {
      id: 'king_cyber_overlord',
      pieceType: 'k',
      name: 'Cybernetic Overlord',
      tag: 'QUANTUM 🛡️',
      icon: '🛡️',
      description: 'Hex-shielded high-tech crown with pulsating quantum core energy emitter.',
      rarity: 'rare',
    },
    {
      id: 'king_classic',
      pieceType: 'k',
      name: 'Classic Staunton',
      tag: 'TOURNAMENT ♟️',
      icon: '♟️',
      description: 'Traditional finial cross Staunton king.',
      rarity: 'classic',
    },
  ],
  p: [
    {
      id: 'pawn_bandaged',
      pieceType: 'p',
      name: 'Bandaged Battle Warrior',
      tag: 'WARRIOR ⚔️',
      icon: '⚔️',
      description: 'Battle-scarred frontline warrior with a cross-bandage patch and defiant crimson headband.',
      rarity: 'legendary',
    },
    {
      id: 'pawn_straw_hat',
      pieceType: 'p',
      name: 'Straw Hat Cadet',
      tag: 'RECRUIT 👒',
      icon: '👒',
      description: 'Eager novice pirate pawn proudly wearing a miniature rookie straw hat.',
      rarity: 'epic',
    },
    {
      id: 'pawn_cyber_drone',
      pieceType: 'p',
      name: 'Cyber Sentry Drone',
      tag: 'AUTOMATON 🤖',
      icon: '🤖',
      description: 'High-tech reconnaissance unit with glowing cyclopean mono-sensor lens.',
      rarity: 'rare',
    },
    {
      id: 'pawn_classic',
      pieceType: 'p',
      name: 'Classic Staunton',
      tag: 'TOURNAMENT ♟️',
      icon: '♟️',
      description: 'Traditional rounded ball-finial Staunton pawn.',
      rarity: 'classic',
    },
  ],
};
