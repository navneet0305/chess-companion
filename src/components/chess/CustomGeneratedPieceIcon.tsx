'use client';

import React from 'react';
import type { Color, PieceSymbol } from 'chess.js';
import type { CustomPieceAppearance } from '../../types/pieceSkins';

interface CustomGeneratedPieceIconProps {
  appearance: CustomPieceAppearance;
  color: Color;
  pieceType: PieceSymbol;
  className?: string;
}

const PIECE_RANK_SYMBOLS: Record<PieceSymbol, string> = {
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
};

/**
 * Renders a crisp, cel-shaded transparent-cutout anime/character chess piece bust
 * standing cleanly on the board square (like the custom Gojo anime chess piece style),
 * integrated with a subtle White/Black chess pedestal base so both team and rank are unmistakable.
 */
export default function CustomGeneratedPieceIcon({
  appearance,
  color,
  pieceType,
  className = '',
}: CustomGeneratedPieceIconProps) {
  const isWhite = color === 'w';
  const baseFill = isWhite ? '#f8fafc' : '#18181b';
  const baseTrim = isWhite ? '#0f172a' : '#e2e8f0';
  const outlineGlow = isWhite
    ? 'drop-shadow(0 0 1.4px rgba(255,255,255,0.95)) drop-shadow(0 2px 3px rgba(0,0,0,0.45))'
    : 'drop-shadow(0 0 1.5px rgba(0,0,0,0.95)) drop-shadow(0 2px 3px rgba(0,0,0,0.6))';

  // Coat color nuances (purple-charcoal Jujutsu coat for Gojo, or character uniform)
  const coatMain =
    appearance.headwear === 'blindfold' ? '#2c2538' : appearance.outfitColor;
  const coatShadow = '#161321';

  return (
    <svg
      viewBox="0 0 100 100"
      className={`w-full h-full ${className}`}
      style={{ filter: outlineGlow }}
    >
      {/* ─── 1. CHESS PIECE BASE PEDESTAL (anchors character cleanly as a chess piece) ─── */}
      <path
        d="M16 94 C18 87, 82 87, 84 94 L87 98 L13 98 Z"
        fill={baseFill}
        stroke={baseTrim}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M22 89 C36 86, 64 86, 78 89"
        fill="none"
        stroke={appearance.auraColor}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* ─── 2. CHARACTER SHOULDERS & ANIME HIGH-COLLARED COAT ─── */}
      {/* Back of collar */}
      <path
        d="M32 62 L35 52 L65 52 L68 62 Z"
        fill={coatShadow}
        stroke="#0f172a"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Broad Shoulders & Jacket Chest sitting cleanly onto the pedestal */}
      <path
        d="M14 90 C16 74, 26 67, 36 65 L50 69 L64 65 C74 67, 84 74, 86 90 Z"
        fill={coatMain}
        stroke="#0f172a"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Jacket Shoulder Seam & Center Zip/Button Fold */}
      <path d="M50 69 L50 90" stroke="#0f172a" strokeWidth="2.2" />
      <path
        d="M24 76 Q30 82 28 89 M76 76 Q70 82 72 89"
        fill="none"
        stroke={coatShadow}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Signature Coat Swirl Button (like Jujutsu High uniform button) */}
      <circle cx="44" cy="77" r="2.6" fill="#eab308" stroke="#0f172a" strokeWidth="1.2" />

      {/* Crisp High Collar Wrapping Neck */}
      <path
        d="M33 66 L35 55 Q50 59 65 55 L67 66 Q50 71 33 66 Z"
        fill={coatMain}
        stroke="#0f172a"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />

      {/* ─── 3. ANIME NECK & CHIN CAST SHADOW ─── */}
      <path
        d="M42 54 L42 66 Q50 69 58 66 L58 54 Z"
        fill={appearance.skinColor}
        stroke="#0f172a"
        strokeWidth="2"
      />
      {/* Cel-shaded shadow under chin */}
      <path d="M43 55 Q50 63 57 55 L57 59 Q50 64 43 59 Z" fill="rgba(120,53,15,0.22)" />

      {/* ─── 4. ANIME EARS ─── */}
      <path
        d="M33 38 C28 38, 28 48, 33 49"
        fill={appearance.skinColor}
        stroke="#0f172a"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M67 38 C72 38, 72 48, 67 49"
        fill={appearance.skinColor}
        stroke="#0f172a"
        strokeWidth="2.1"
        strokeLinecap="round"
      />

      {/* ─── 5. SHARP TAPERED ANIME FACE & JAWLINE ─── */}
      <path
        d="M33 27 L33 44 L40 55 L50 60 L60 55 L67 44 L67 27 Z"
        fill={appearance.skinColor}
        stroke="#0f172a"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />

      {/* Facial Marks */}
      {appearance.facialMark === 'whiskers' && (
        <g stroke="#7c2d12" strokeWidth="1.4" strokeLinecap="round">
          <line x1="36" y1="44" x2="41" y2="45" />
          <line x1="36" y1="47.5" x2="41" y2="47.5" />
          <line x1="64" y1="44" x2="59" y2="45" />
          <line x1="64" y1="47.5" x2="59" y2="47.5" />
        </g>
      )}
      {appearance.facialMark === 'scar_cheek' && (
        <path d="M36 45 L42 49 M39 44.5 L39.5 49.5" stroke="#b91c1c" strokeWidth="1.5" strokeLinecap="round" />
      )}
      {appearance.facialMark === 'sukuna_marks' && (
        <g stroke="#0f172a" strokeWidth="1.6" fill="none">
          <path d="M36 45 L40 48 L37 51" />
          <path d="M64 45 L60 48 L63 51" />
          <path d="M46 29 L54 29" />
        </g>
      )}
      {appearance.facialMark === 'spider_web' && (
        <g stroke="#0f172a" strokeWidth="1.1" opacity="0.55" fill="none">
          <line x1="50" y1="24" x2="50" y2="59" />
          <line x1="34" y1="42" x2="66" y2="42" />
          <circle cx="50" cy="42" r="9" />
        </g>
      )}

      {/* Subtle Anime Nose Line */}
      <path d="M50 42 L48.5 46.5 L51 47" fill="none" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />

      {/* Confident Anime Open Smirk / Grin (just like reference image!) */}
      {appearance.headwear === 'blindfold' || appearance.eyeStyle === 'fierce' ? (
        <g>
          <path
            d="M43 51 Q50 56 57 50.5 Q50 51.5 43 51 Z"
            fill="#ffffff"
            stroke="#0f172a"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </g>
      ) : (
        <path
          d="M44 51.5 Q50 54.5 56 51"
          fill="none"
          stroke="#0f172a"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      )}

      {/* ─── 6. EYES / BLINDFOLD / VISOR ─── */}
      {appearance.headwear === 'blindfold' ? (
        <g>
          {/* Classic Gojo Matte Black Blindfold with Cloth Creases & Side Bands */}
          <path
            d="M31 28 Q50 26 69 28 L68 41 Q50 42.5 32 41 Z"
            fill="#14151a"
            stroke="#09090b"
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
          {/* Subtle cloth crease highlights */}
          <path
            d="M36 33 Q45 35 55 32.5 M40 37.5 Q53 39 63 36.5"
            fill="none"
            stroke="#334155"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>
      ) : appearance.eyeStyle === 'visor' ? (
        <rect
          x="33"
          y="33"
          width="34"
          height="7.5"
          rx="2.5"
          fill={appearance.eyeColor}
          stroke="#09090b"
          strokeWidth="2"
        />
      ) : appearance.eyeStyle === 'mask_eyes' ? (
        <g>
          <path d="M35 32 L46 37 L37 40.5 Z" fill={appearance.eyeColor} stroke="#09090b" strokeWidth="1.6" />
          <path d="M65 32 L54 37 L63 40.5 Z" fill={appearance.eyeColor} stroke="#09090b" strokeWidth="1.6" />
        </g>
      ) : (
        <g>
          {/* Left & Right Angled Anime Eyes */}
          <path d="M36 35 L46 37" stroke="#0f172a" strokeWidth="2.3" strokeLinecap="round" />
          <path d="M64 35 L54 37" stroke="#0f172a" strokeWidth="2.3" strokeLinecap="round" />
          <ellipse cx="41" cy="39" rx="3.4" ry="2.6" fill="#ffffff" stroke="#0f172a" strokeWidth="1.3" />
          <ellipse cx="59" cy="39" rx="3.4" ry="2.6" fill="#ffffff" stroke="#0f172a" strokeWidth="1.3" />
          <circle cx="41.5" cy="39" r="1.9" fill={appearance.eyeColor} />
          <circle cx="58.5" cy="39" r="1.9" fill={appearance.eyeColor} />
          <circle cx="42.2" cy="38.2" r="0.8" fill="#ffffff" />
          <circle cx="59.2" cy="38.2" r="0.8" fill="#ffffff" />
          {appearance.eyeStyle === 'scar_eye' && (
            <line x1="41" y1="30" x2="41" y2="46" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
          )}
        </g>
      )}

      {/* ─── 7. MULTI-LAYERED SPIKY ANIME HAIR / HEADWEAR ─── */}
      {appearance.headwear === 'straw_hat' ? (
        <g>
          {/* Dark wavy hair peeking under hat */}
          <path d="M30 29 L33 36 L36 28 L64 28 L67 36 L70 29 Z" fill={appearance.hairColor} stroke="#0f172a" strokeWidth="1.8" />
          <ellipse cx="50" cy="25" rx="31" ry="7.5" fill="#facc15" stroke="#0f172a" strokeWidth="2.2" />
          <path d="M31 24 C34 8, 66 8, 69 24 Z" fill="#eab308" stroke="#0f172a" strokeWidth="2.2" />
          <path d="M32 22.5 Q50 19.5 68 22.5" stroke="#dc2626" strokeWidth="4" fill="none" />
        </g>
      ) : (
        <g>
          {/* Back shadow spikes for anime depth */}
          <path
            d="M27 34 L20 22 L30 23 L27 9 L39 17 L44 3 L52 14 L60 4 L64 17 L75 10 L71 24 L81 24 L73 35 Z"
            fill={appearance.hairColor}
            stroke="#0f172a"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          {/* Cool cel-shaded hairline highlights & front bangs */}
          <path
            d="M31 32 L26 24 L35 26 L36 14 L44 24 L50 10 L55 24 L65 14 L65 26 L74 24 L69 32 Q59 24 50 26 Q40 24 31 32 Z"
            fill={appearance.hairColor}
            stroke="#0f172a"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Subtle cel-shadow accent along hair base */}
          <path
            d="M35 28 L41 20 L48 27 L52 18 L59 27 L66 21 L68 29"
            fill="none"
            stroke={appearance.hairColor === '#f8fafc' ? '#cbd5e1' : 'rgba(0,0,0,0.22)'}
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Optional Ninja Headband / Crown / Horns */}
          {appearance.headwear === 'headband' && (
            <g>
              <rect x="31" y="25" width="38" height="7" rx="1.5" fill="#1e293b" stroke="#0f172a" strokeWidth="1.6" />
              <rect x="41" y="26" width="18" height="5" rx="0.8" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1" />
            </g>
          )}
          {appearance.headwear === 'crown' && (
            <polygon
              points="35,19 38,8 44,15 50,5 56,15 62,8 65,19"
              fill="#facc15"
              stroke="#0f172a"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          )}
          {appearance.headwear === 'horns' && (
            <g fill={appearance.outfitAccent} stroke="#0f172a" strokeWidth="1.8">
              <polygon points="33,22 25,6 40,15" />
              <polygon points="67,22 75,6 60,15" />
            </g>
          )}
        </g>
      )}

      {/* ─── 8. SIGNATURE ENERGY PROP (Subtle corner katana / infinity / ki) ─── */}
      {appearance.prop === 'katana' && (
        <line x1="16" y1="88" x2="32" y2="68" stroke="#e2e8f0" strokeWidth="3.2" strokeLinecap="round" />
      )}
      {appearance.prop === 'saber' && (
        <line x1="80" y1="88" x2="84" y2="52" stroke="#ef4444" strokeWidth="3.8" strokeLinecap="round" />
      )}

      {/* ─── 9. CLEAN CHESS PIECE RANK INDICATOR ON BASE CORNER ─── */}
      <circle cx="82" cy="86" r="10.5" fill={baseFill} stroke={baseTrim} strokeWidth="2" />
      <text
        x="82"
        y="90.5"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill={isWhite ? '#0f172a' : '#f8fafc'}
      >
        {PIECE_RANK_SYMBOLS[pieceType]}
      </text>
    </svg>
  );
}
