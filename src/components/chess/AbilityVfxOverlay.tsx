'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Square } from 'chess.js';
import type { AbilityTriggerEvent } from '../../types/abilities';
import { FILES, RANKS } from '../../lib/constants';

interface AbilityVfxOverlayProps {
  event: AbilityTriggerEvent | null;
  boardFlipped: boolean;
}

function squareToPercent(square: Square, boardFlipped: boolean): { x: number; y: number } {
  const file = square[0];
  const rank = square[1];

  let colIdx = FILES.indexOf(file as (typeof FILES)[number]);
  let rowIdx = RANKS.indexOf(rank as (typeof RANKS)[number]);

  if (boardFlipped) {
    colIdx = 7 - colIdx;
  } else {
    rowIdx = 7 - rowIdx;
  }

  return {
    x: (colIdx + 0.5) * 12.5,
    y: (rowIdx + 0.5) * 12.5,
  };
}

const DEBRIS_VECTORS = [
  { dx: -5.5, dy: -4.5, r: 1.1, color: '#e2e8f0' },
  { dx: 5.2, dy: -5.0, r: 0.9, color: '#475569' },
  { dx: -4.8, dy: 4.8, r: 1.0, color: '#94a3b8' },
  { dx: 5.8, dy: 4.2, r: 1.2, color: '#cbd5e1' },
  { dx: 0.5, dy: -6.2, r: 0.85, color: '#f8fafc' },
  { dx: -1.2, dy: 6.0, r: 0.95, color: '#334155' },
];

export default function AbilityVfxOverlay({ event, boardFlipped }: AbilityVfxOverlayProps) {
  const sourcePos = useMemo(
    () => (event ? squareToPercent(event.sourceSquare, boardFlipped) : { x: 50, y: 50 }),
    [event, boardFlipped]
  );

  const destroyedPositions = useMemo(() => {
    if (!event) return [];
    return event.destroyedSquares.map((sq) => ({
      square: sq,
      ...squareToPercent(sq, boardFlipped),
    }));
  }, [event, boardFlipped]);

  if (!event) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30 select-none">
      <AnimatePresence>
        {/* ─── 1. REALISTIC BALLISTIC VOLLEY & SHATTERING IMPACT (Replaces plain laser) ─── */}
        {event.vfx === 'laser_beam' && destroyedPositions.length > 0 && (
          <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100">
            <defs>
              <radialGradient id="muzzleFlare" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="40%" stopColor="#fde047" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="smokePuff" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#334155" stopOpacity="0" />
              </radialGradient>
            </defs>

            {destroyedPositions.map((dest, i) => {
              const dx = dest.x - sourcePos.x;
              const dy = dest.y - sourcePos.y;
              const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
              const midX = (sourcePos.x + dest.x) / 2;
              const midY = (sourcePos.y + dest.y) / 2;

              return (
                <React.Fragment key={dest.square}>
                  {/* Gunpowder Muzzle Flash at Bishop */}
                  <motion.circle
                    cx={sourcePos.x}
                    cy={sourcePos.y}
                    r="5.5"
                    fill="url(#muzzleFlare)"
                    initial={{ scale: 0.2, opacity: 0 }}
                    animate={{ scale: [0.3, 1.4, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 0.3, delay: i * 0.08 }}
                  />

                  {/* Lingering Smoke Trail along trajectory */}
                  <motion.line
                    x1={sourcePos.x}
                    y1={sourcePos.y}
                    x2={dest.x}
                    y2={dest.y}
                    stroke="#cbd5e1"
                    strokeWidth="1.8"
                    strokeDasharray="3 2"
                    strokeLinecap="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.45, 0] }}
                    transition={{ duration: 0.9, delay: i * 0.08 }}
                  />

                  {/* Supersonic Mach Shockwave Ring at midpoint */}
                  <motion.ellipse
                    cx={midX}
                    cy={midY}
                    rx="1.2"
                    ry="3.2"
                    transform={`rotate(${angleDeg} ${midX} ${midY})`}
                    fill="none"
                    stroke="#f8fafc"
                    strokeWidth="0.6"
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: [0.5, 1.3, 1.6], opacity: [0, 0.7, 0] }}
                    transition={{ duration: 0.35, delay: i * 0.08 + 0.08 }}
                  />

                  {/* High-Velocity Brass/Steel Ballistic Round */}
                  <motion.g
                    initial={{ x: sourcePos.x, y: sourcePos.y, opacity: 1 }}
                    animate={{ x: dest.x, y: dest.y, opacity: [1, 1, 0] }}
                    transition={{ duration: 0.22, ease: 'linear', delay: i * 0.08 }}
                  >
                    <g transform={`rotate(${angleDeg})`}>
                      <ellipse cx="0" cy="0" rx="2.2" ry="0.8" fill="#fbbf24" stroke="#ffffff" strokeWidth="0.3" />
                    </g>
                  </motion.g>

                  {/* Shattering Stone/Marble Debris & Dust at Impact */}
                  <motion.circle
                    cx={dest.x}
                    cy={dest.y}
                    r="6.5"
                    fill="url(#smokePuff)"
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: [0.4, 1.5, 1.9], opacity: [0, 0.85, 0] }}
                    transition={{ duration: 0.8, delay: i * 0.08 + 0.18 }}
                  />

                  {DEBRIS_VECTORS.map((d, idx) => (
                    <motion.circle
                      key={idx}
                      cx={dest.x}
                      cy={dest.y}
                      r={d.r}
                      fill={d.color}
                      initial={{ cx: dest.x, cy: dest.y, opacity: 0 }}
                      animate={{
                        cx: dest.x + d.dx,
                        cy: dest.y + d.dy + 1.5,
                        opacity: [0, 1, 0],
                      }}
                      transition={{ duration: 0.65, ease: 'easeOut', delay: i * 0.08 + 0.18 }}
                    />
                  ))}
                </React.Fragment>
              );
            })}
          </svg>
        )}

        {/* ─── 2. SHOCKWAVE & DUST BLAST ON DESTROYED SQUARES ─── */}
        {destroyedPositions.map((dest, i) => (
          <motion.div
            key={`blast-${dest.square}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none"
            style={{ left: `${dest.x}%`, top: `${dest.y}%` }}
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: [0.3, 1.25, 1.0, 0], opacity: [0, 1, 0.9, 0] }}
            transition={{ duration: 1.2, delay: i * 0.08 + 0.16 }}
          >
            <div className="w-12 h-12 rounded-full border-2 border-amber-400/80 bg-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.5)] flex items-center justify-center">
              <span className="text-lg">💥</span>
            </div>
          </motion.div>
        ))}

        {/* ─── 3. FLOATING CALLOUT BANNER ─── */}
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/85 border border-amber-400/60 shadow-2xl backdrop-blur-md flex items-center gap-2 whitespace-nowrap z-40"
        >
          <span className="text-amber-300 text-xs font-extrabold tracking-wide">
            {event.message}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
