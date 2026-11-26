import React from 'react';
import type { PieceSymbol, Color } from 'chess.js';
import type { AnyPieceSkinId } from '../../types/pieceSkins';

interface PieceSkinDecorationsProps {
  pieceType: PieceSymbol;
  color: Color;
  skinId: AnyPieceSkinId;
}

/**
 * High-definition SVG overlays that decorate chess pieces with custom styles
 * (e.g. One-Eyed Bishop eyepatch & scar, Straw Hat Knight, Siege Cannon Rook, etc.).
 * Designed to fit standard 45x45 chess piece SVG coordinate systems.
 */
export default function PieceSkinDecorations({
  pieceType,
  color,
  skinId,
}: PieceSkinDecorationsProps) {
  // ─── 1. BISHOP SKINS ────────────────────────────────────────────────────────
  if (pieceType === 'b') {
    if (skinId === 'bishop_one_eyed') {
      return (
        <svg viewBox="0 0 45 45" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Diagonal Eyepatch Leather Strap wrapping across the Mitre */}
          <path
            d="M17 14 L28 24"
            stroke="#262626"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <path
            d="M17.2 13.8 L28.2 23.8"
            stroke={color === 'w' ? '#525252' : '#737373'}
            strokeWidth="0.4"
            strokeLinecap="round"
          />

          {/* Deep Black Pirate Eyepatch over the Right Eye */}
          <ellipse
            cx="24.8"
            cy="19.8"
            rx="2.6"
            ry="3.2"
            transform="rotate(18 24.8 19.8)"
            fill="#171717"
            stroke={color === 'w' ? '#0a0a0a' : '#d4d4d4'}
            strokeWidth="0.75"
          />
          {/* Eyepatch silver rivet/buckle */}
          <circle cx="24.8" cy="19.8" r="0.7" fill="#fbbf24" stroke="#78350f" strokeWidth="0.3" />

          {/* Vertical Combat Sword Scar through the Eyepatch */}
          <path
            d="M24.2 15.5 L25.4 24"
            stroke="#dc2626"
            strokeWidth="0.65"
            strokeLinecap="round"
          />

          {/* Mystical Glowing Laser Eye on the Left Eye (Unpatched) */}
          <circle
            cx="19.2"
            cy="19.5"
            r="1.4"
            fill="#06b6d4"
            filter="url(#eyeGlow)"
          />
          <circle
            cx="19.2"
            cy="19.5"
            r="0.6"
            fill="#ffffff"
          />
        </svg>
      );
    }

    if (skinId === 'bishop_cyber_oracle') {
      return (
        <svg viewBox="0 0 45 45" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* Cyber Visor bar across eyes */}
          <rect
            x="16.5"
            y="18"
            width="12"
            height="3.2"
            rx="1"
            fill="#0284c7"
            stroke="#38bdf8"
            strokeWidth="0.8"
          />
          {/* Targeting reticle line */}
          <line x1="17.5" y1="19.6" x2="27.5" y2="19.6" stroke="#ffffff" strokeWidth="0.5" />
          <circle cx="22.5" cy="19.6" r="1.1" fill="#f43f5e" />
        </svg>
      );
    }

    if (skinId === 'bishop_inquisitor') {
      return (
        <svg viewBox="0 0 45 45" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* Ornate Gold Cross Finial */}
          <path d="M22.5 4.5 V9.5 M20 7 H25" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="22.5" cy="7" r="1" fill="#ef4444" />
          {/* Golden Ribbon borders */}
          <path d="M19 22 Q22.5 24 26 22" fill="none" stroke="#fbbf24" strokeWidth="0.8" />
        </svg>
      );
    }
  }

  // ─── 2. KNIGHT SKINS ────────────────────────────────────────────────────────
  if (pieceType === 'n') {
    if (skinId === 'knight_straw_hat') {
      return (
        <svg viewBox="0 0 45 45" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* Monkey D. Luffy Miniature Straw Hat on the Knight's Head */}
          {/* Straw Hat Crown */}
          <ellipse
            cx="19"
            cy="7.5"
            rx="3.2"
            ry="2.2"
            fill="#eab308"
            stroke="#ca8a04"
            strokeWidth="0.5"
          />
          {/* Red Ribbon Band */}
          <path
            d="M16 8 Q19 7.2 22 8"
            stroke="#ef4444"
            strokeWidth="1.1"
            strokeLinecap="round"
            fill="none"
          />
          {/* Straw Hat Wide Brim */}
          <ellipse
            cx="19"
            cy="8.8"
            rx="6"
            ry="2.2"
            transform="rotate(-8 19 8.8)"
            fill="#facc15"
            stroke="#ca8a04"
            strokeWidth="0.6"
          />
        </svg>
      );
    }

    if (skinId === 'knight_cyber_steed') {
      return (
        <svg viewBox="0 0 45 45" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* Glowing Cyber Optic Visor */}
          <polygon
            points="13,14 17,13 16,17 12,17"
            fill="#06b6d4"
            stroke="#38bdf8"
            strokeWidth="0.5"
          />
          <circle cx="14.5" cy="15" r="0.8" fill="#ffffff" />
          {/* Cyber Head Antenna */}
          <line x1="20" y1="10" x2="22" y2="6" stroke="#06b6d4" strokeWidth="1" strokeLinecap="round" />
          <circle cx="22" cy="6" r="0.8" fill="#38bdf8" />
        </svg>
      );
    }

    if (skinId === 'knight_pegasus') {
      return (
        <svg viewBox="0 0 45 45" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* Celestial Pegasus Feathered Wing */}
          <path
            d="M26 14 Q34 11 36 17 Q34 23 27 25"
            fill="rgba(255,255,255,0.7)"
            stroke="#e2e8f0"
            strokeWidth="0.8"
          />
          <path d="M29 15 Q34 16 33 21" stroke="#cbd5e1" strokeWidth="0.6" fill="none" />
        </svg>
      );
    }
  }

  // ─── 3. ROOK SKINS ──────────────────────────────────────────────────────────
  if (pieceType === 'r') {
    if (skinId === 'rook_siege_cannon') {
      return (
        <svg viewBox="0 0 45 45" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* Central Heavy Artillery Cannon Barrel Port */}
          <circle
            cx="22.5"
            cy="23"
            r="3.8"
            fill="#334155"
            stroke={color === 'w' ? '#0f172a' : '#94a3b8'}
            strokeWidth="1.1"
          />
          {/* Dark bore depth */}
          <circle cx="22.5" cy="23" r="2.2" fill="#090d16" />
          {/* Glowing gunpowder spark in bore */}
          <circle cx="22.5" cy="23" r="1.1" fill="#f97316" />
          <circle cx="22.5" cy="23" r="0.5" fill="#fef08a" />
          {/* Reinforced Iron Rivet Band */}
          <rect x="13.5" y="29.5" width="18" height="2" rx="0.5" fill="#475569" stroke="#1e293b" strokeWidth="0.4" />
          <circle cx="16" cy="30.5" r="0.5" fill="#cbd5e1" />
          <circle cx="22.5" cy="30.5" r="0.5" fill="#cbd5e1" />
          <circle cx="29" cy="30.5" r="0.5" fill="#cbd5e1" />
        </svg>
      );
    }

    if (skinId === 'rook_iron_citadel') {
      return (
        <svg viewBox="0 0 45 45" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* Spiked iron crenellations */}
          <polygon points="11,9 13,6 15,9" fill="#475569" stroke="#0f172a" strokeWidth="0.4" />
          <polygon points="20,9 22.5,6 25,9" fill="#475569" stroke="#0f172a" strokeWidth="0.4" />
          <polygon points="30,9 32.5,6 34,9" fill="#475569" stroke="#0f172a" strokeWidth="0.4" />
        </svg>
      );
    }

    if (skinId === 'rook_neon') {
      return (
        <svg viewBox="0 0 45 45" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* Neon vertical energy columns */}
          <line x1="17" y1="18" x2="17" y2="28" stroke="#a855f7" strokeWidth="1" strokeLinecap="round" />
          <line x1="22.5" y1="18" x2="22.5" y2="28" stroke="#06b6d4" strokeWidth="1" strokeLinecap="round" />
          <line x1="28" y1="18" x2="28" y2="28" stroke="#a855f7" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );
    }
  }

  // ─── 4. QUEEN SKINS ─────────────────────────────────────────────────────────
  if (pieceType === 'q') {
    if (skinId === 'queen_valkyrie') {
      return (
        <svg viewBox="0 0 45 45" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* Sweeping Golden Valkyrie Wings on Left & Right of Crown */}
          {/* Left Wing */}
          <path
            d="M9 22 Q4 15 5 9 Q10 14 11 18"
            fill="#facc15"
            stroke="#ca8a04"
            strokeWidth="0.6"
          />
          {/* Right Wing */}
          <path
            d="M36 22 Q41 15 40 9 Q35 14 34 18"
            fill="#facc15"
            stroke="#ca8a04"
            strokeWidth="0.6"
          />
          {/* Center Royal Emerald Gem */}
          <polygon
            points="22.5,16 24.5,19 22.5,22 20.5,19"
            fill="#10b981"
            stroke="#047857"
            strokeWidth="0.4"
          />
          <circle cx="22.5" cy="19" r="0.7" fill="#a7f3d0" />
        </svg>
      );
    }

    if (skinId === 'queen_pirate_empress') {
      return (
        <svg viewBox="0 0 45 45" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* Feather plume on crown side */}
          <path
            d="M31 10 Q37 4 41 6 Q39 12 33 13"
            fill="#ef4444"
            stroke="#b91c1c"
            strokeWidth="0.5"
          />
          {/* Skull / Crossbone golden brooch */}
          <circle cx="22.5" cy="19" r="1.5" fill="#facc15" />
          <circle cx="22" cy="18.8" r="0.4" fill="#18181b" />
          <circle cx="23" cy="18.8" r="0.4" fill="#18181b" />
        </svg>
      );
    }

    if (skinId === 'queen_celestial') {
      return (
        <svg viewBox="0 0 45 45" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* Astral Starlight gems */}
          <circle cx="22.5" cy="5" r="1.5" fill="#38bdf8" />
          <circle cx="14" cy="6" r="1" fill="#e0e7ff" />
          <circle cx="31" cy="6" r="1" fill="#e0e7ff" />
        </svg>
      );
    }
  }

  // ─── 5. KING SKINS ──────────────────────────────────────────────────────────
  if (pieceType === 'k') {
    if (skinId === 'king_pirate_king') {
      return (
        <svg viewBox="0 0 45 45" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* Straw Hat Brim right below the imperial cross */}
          <ellipse
            cx="22.5"
            cy="11.8"
            rx="6.5"
            ry="2.1"
            fill="#facc15"
            stroke="#ca8a04"
            strokeWidth="0.6"
          />
          {/* Scarlet Ribbon */}
          <path
            d="M18.5 11 Q22.5 10.2 26.5 11"
            stroke="#ef4444"
            strokeWidth="1.2"
            fill="none"
          />
          {/* Golden Pirate cross badge */}
          <circle cx="22.5" cy="8" r="1.3" fill="#fbbf24" stroke="#b45309" strokeWidth="0.3" />
        </svg>
      );
    }

    if (skinId === 'king_grand_emperor') {
      return (
        <svg viewBox="0 0 45 45" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* Imperial Ruby on Cross */}
          <circle cx="22.5" cy="8" r="1.6" fill="#dc2626" stroke="#991b1b" strokeWidth="0.4" />
          <circle cx="22.5" cy="8" r="0.6" fill="#fecaca" />
          {/* Golden Sash */}
          <path d="M14 28 Q22.5 31 31 28" stroke="#fbbf24" strokeWidth="1" fill="none" />
        </svg>
      );
    }

    if (skinId === 'king_cyber_overlord') {
      return (
        <svg viewBox="0 0 45 45" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* Hexagonal Quantum Force Shield Core */}
          <polygon
            points="22.5,5 25,6.5 25,9.5 22.5,11 20,9.5 20,6.5"
            fill="#06b6d4"
            stroke="#38bdf8"
            strokeWidth="0.6"
          />
          <circle cx="22.5" cy="8" r="0.9" fill="#ffffff" />
        </svg>
      );
    }
  }

  // ─── 6. PAWN SKINS ──────────────────────────────────────────────────────────
  if (pieceType === 'p') {
    if (skinId === 'pawn_bandaged') {
      return (
        <svg viewBox="0 0 45 45" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* Defiant Red Warrior Headband across Pawn Head */}
          <rect
            x="18"
            y="11.8"
            width="9"
            height="2.4"
            rx="0.5"
            fill="#ef4444"
            stroke="#b91c1c"
            strokeWidth="0.4"
          />
          {/* Trailing Headband Knot / Ribbon Ends */}
          <path
            d="M26.5 13 L30.5 15.5 L31 17.5"
            stroke="#ef4444"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M26.5 13.5 L29 17"
            stroke="#b91c1c"
            strokeWidth="0.8"
            strokeLinecap="round"
            fill="none"
          />
          {/* Battle Cross Bandage on cheek */}
          <path d="M21 16 L24 19 M24 16 L21 19" stroke="#ffffff" strokeWidth="0.7" strokeLinecap="round" />
        </svg>
      );
    }

    if (skinId === 'pawn_straw_hat') {
      return (
        <svg viewBox="0 0 45 45" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* Miniature Rookie Straw Hat */}
          <ellipse cx="22.5" cy="8.8" rx="4.8" ry="1.6" fill="#facc15" stroke="#ca8a04" strokeWidth="0.5" />
          <ellipse cx="22.5" cy="7.6" rx="2.4" ry="1.4" fill="#eab308" stroke="#ca8a04" strokeWidth="0.4" />
          <path d="M20.2 8.2 Q22.5 7.6 24.8 8.2" stroke="#ef4444" strokeWidth="0.9" fill="none" />
        </svg>
      );
    }

    if (skinId === 'pawn_cyber_drone') {
      return (
        <svg viewBox="0 0 45 45" className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* Cyclops optic sensor lens */}
          <circle cx="22.5" cy="13" r="1.8" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.5" />
          <circle cx="22.5" cy="13" r="0.7" fill="#ef4444" />
        </svg>
      );
    }
  }

  // Classic or fallback: no extra overlay
  return null;
}
