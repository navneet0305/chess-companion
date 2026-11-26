'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Square } from 'chess.js';
import type { EliminationEvent } from '../../types/eliminations';
import { ELIMINATION_CONFIG } from '../../types/eliminations';
import { FILES, RANKS } from '../../lib/constants';

interface EliminationVfxOverlayProps {
  event: EliminationEvent | null;
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

// Realistic piece splinter / rubble trajectories on capture impact
const SHARD_DIRECTIONS = [
  { dx: -5.5, dy: -4.2, rot: -120 },
  { dx: 5.2, dy: -4.8, rot: 95 },
  { dx: -4.5, dy: 4.5, rot: -75 },
  { dx: 5.6, dy: 3.8, rot: 140 },
  { dx: 0.4, dy: -6.0, rot: 45 },
];

export default function EliminationVfxOverlay({
  event,
  boardFlipped,
}: EliminationVfxOverlayProps) {
  const coords = useMemo(() => {
    if (!event) return null;
    const from = squareToPercent(event.fromSquare, boardFlipped);
    const to = squareToPercent(event.targetSquare, boardFlipped);
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
    return { from, to, angleDeg };
  }, [event, boardFlipped]);

  if (!event || !coords) return null;

  const { from, to, angleDeg } = coords;
  const meta = ELIMINATION_CONFIG[event.attackerType];
  const shardColor = event.attackerColor === 'w' ? '#1e293b' : '#f1f5f9';
  const shardStroke = event.attackerColor === 'w' ? '#475569' : '#94a3b8';

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30 select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={event.id}
          className="absolute inset-0"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100">
            <defs>
              <radialGradient id="smokeCloud" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.75" />
                <stop offset="60%" stopColor="#475569" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="fireCore" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="35%" stopColor="#fde047" stopOpacity="0.95" />
                <stop offset="75%" stopColor="#ea580c" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#991b1b" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="steelBlade" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="50%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>
            </defs>

            {/* ─── 1. PAWN: REALISTIC STEEL SABRE SLASH ─── */}
            {event.attackerType === 'p' && (
              <g>
                {/* Ground slice fracture mark */}
                <motion.line
                  x1={to.x - 6}
                  y1={to.y + 6}
                  x2={to.x + 6}
                  y2={to.y - 6}
                  stroke="#0f172a"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.85, 0] }}
                  transition={{ duration: 0.9, delay: 0.12 }}
                />
                {/* Metallic arc glint */}
                <motion.path
                  d={`M ${to.x - 7.5} ${to.y + 6.5} Q ${to.x - 2} ${to.y - 5.5} ${to.x + 7.5} ${to.y - 7.5}`}
                  fill="none"
                  stroke="url(#steelBlade)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.45 }}
                />
                {/* Detailed Shaded Sabre Swinging */}
                <motion.g
                  initial={{ x: to.x - 5, y: to.y + 4, rotate: -70, opacity: 1 }}
                  animate={{ x: to.x + 2, y: to.y - 3, rotate: 40, opacity: [1, 1, 0] }}
                  transition={{ duration: 0.42, ease: 'easeOut' }}
                >
                  <path d="M 0 0 Q 3 -4 8.5 -8.5 L 7.2 -6.2 Q 2.5 -2.5 0.6 0.4 Z" fill="url(#steelBlade)" stroke="#334155" strokeWidth="0.3" />
                  <line x1="-1.4" y1="-1.4" x2="1.6" y2="1.6" stroke="#d97706" strokeWidth="1.1" strokeLinecap="round" />
                  <line x1="0" y1="0" x2="-2" y2="2" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" />
                </motion.g>
              </g>
            )}

            {/* ─── 2. BISHOP: REALISTIC REVOLVER / FLINTLOCK SHOT ─── */}
            {event.attackerType === 'b' && (
              <g>
                {/* Detailed Shaded Revolver with Recoil Kickback */}
                <motion.g
                  transform={`translate(${from.x}, ${from.y}) rotate(${angleDeg})`}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1.05, 1] }}
                  transition={{ duration: 0.8 }}
                >
                  {/* Wooden grip & steel barrel/cylinder */}
                  <path d="M -2.5 0.8 L -1 0.8 L -0.4 4.2 L -2.8 4 Z" fill="#78350f" stroke="#451a03" strokeWidth="0.3" />
                  <rect x="-2" y="-1.4" width="7.2" height="1.8" rx="0.3" fill="#475569" stroke="#0f172a" strokeWidth="0.35" />
                  <rect x="-1.2" y="-0.8" width="2.2" height="1.9" rx="0.3" fill="#334155" stroke="#0f172a" strokeWidth="0.25" />
                  {/* Realistic Radial Muzzle Flash + Smoke */}
                  <motion.circle
                    cx="6.2"
                    cy="-0.5"
                    r="3.8"
                    fill="url(#fireCore)"
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: [0, 1.3, 0], opacity: [1, 0.9, 0] }}
                    transition={{ duration: 0.22 }}
                  />
                  <motion.circle
                    cx="7"
                    cy="-0.5"
                    r="4.2"
                    fill="url(#smokeCloud)"
                    initial={{ scale: 0.2, opacity: 0 }}
                    animate={{ scale: [0.3, 1.5], opacity: [0.7, 0] }}
                    transition={{ duration: 0.65, delay: 0.08 }}
                  />
                </motion.g>

                {/* Faint Gunpowder Vapor Trail */}
                <motion.line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#cbd5e1"
                  strokeWidth="0.8"
                  strokeDasharray="2 2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 0.65 }}
                />

                {/* High-Velocity Brass Bullet */}
                <motion.g
                  initial={{ x: from.x, y: from.y, opacity: 1 }}
                  animate={{ x: to.x, y: to.y, opacity: [1, 1, 0] }}
                  transition={{ duration: 0.2, ease: 'linear' }}
                >
                  <g transform={`rotate(${angleDeg})`}>
                    <ellipse cx="0" cy="0" rx="1.8" ry="0.65" fill="#fbbf24" stroke="#ffffff" strokeWidth="0.25" />
                  </g>
                </motion.g>

                {/* Bullet Impact Fracture Cracks */}
                <motion.g
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: [0.5, 1.1], opacity: [0, 0.9, 0] }}
                  transition={{ duration: 0.75, delay: 0.18 }}
                >
                  <path
                    d={`M ${to.x - 3.5} ${to.y - 2} L ${to.x} ${to.y} L ${to.x + 3.8} ${to.y + 1.5} M ${to.x} ${to.y} L ${to.x - 1.5} ${to.y + 3.8} M ${to.x} ${to.y} L ${to.x + 2} ${to.y - 3.5}`}
                    stroke="#0f172a"
                    strokeWidth="0.7"
                    fill="none"
                  />
                </motion.g>
              </g>
            )}

            {/* ─── 3. KNIGHT: CAVALRY JOUSTING LANCE ─── */}
            {event.attackerType === 'n' && (
              <g>
                <motion.line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#92400e"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.9, 0] }}
                  transition={{ duration: 0.45 }}
                />
                <motion.g
                  transform={`translate(${to.x}, ${to.y}) rotate(${angleDeg})`}
                  initial={{ x: -6, opacity: 0 }}
                  animate={{ x: 0, opacity: [0, 1, 0] }}
                  transition={{ duration: 0.5, delay: 0.08 }}
                >
                  <polygon points="3.5,0 -4.5,-2.2 -3,0 -4.5,2.2" fill="url(#steelBlade)" stroke="#334155" strokeWidth="0.4" />
                </motion.g>
              </g>
            )}

            {/* ─── 4. ROOK: HEAVY IRON CANNON BLAST ─── */}
            {event.attackerType === 'r' && (
              <g>
                {/* Cannon Smoke Trail */}
                <motion.line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#64748b"
                  strokeWidth="2.2"
                  strokeDasharray="3 3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 0.7 }}
                />
                {/* Heavy Iron Cannonball */}
                <motion.circle
                  r="2.5"
                  fill="#1e293b"
                  stroke="#475569"
                  strokeWidth="0.6"
                  initial={{ cx: from.x, cy: from.y, opacity: 1 }}
                  animate={{ cx: to.x, cy: to.y, opacity: [1, 1, 0] }}
                  transition={{ duration: 0.26, ease: 'easeIn' }}
                />
                {/* Multi-Stage Fireball Explosion */}
                <motion.circle
                  cx={to.x}
                  cy={to.y}
                  r="8"
                  fill="url(#fireCore)"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.35, 1.6], opacity: [0, 1, 0] }}
                  transition={{ duration: 0.65, delay: 0.22 }}
                />
              </g>
            )}

            {/* ─── 5. QUEEN: TWIN STEEL RAPIER EXECUTION ─── */}
            {event.attackerType === 'q' && (
              <g>
                <motion.line
                  x1={to.x - 7}
                  y1={to.y - 7}
                  x2={to.x + 7}
                  y2={to.y + 7}
                  stroke="url(#steelBlade)"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.55 }}
                />
                <motion.line
                  x1={to.x + 7}
                  y1={to.y - 7}
                  x2={to.x - 7}
                  y2={to.y + 7}
                  stroke="url(#steelBlade)"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.55, delay: 0.08 }}
                />
              </g>
            )}

            {/* ─── 6. KING: HEAVY ROYAL WARHAMMER SLAM ─── */}
            {event.attackerType === 'k' && (
              <g>
                <motion.g
                  initial={{ x: to.x, y: to.y - 12, rotate: -35, opacity: 1 }}
                  animate={{ x: to.x, y: to.y - 1, rotate: 15, opacity: [1, 1, 0] }}
                  transition={{ duration: 0.38, ease: 'easeIn' }}
                >
                  <line x1="0" y1="0" x2="0" y2="-8" stroke="#78350f" strokeWidth="1.3" />
                  <rect x="-3.5" y="-10" width="7" height="3.5" rx="0.5" fill="#fbbf24" stroke="#92400e" strokeWidth="0.4" />
                </motion.g>
                <motion.circle
                  cx={to.x}
                  cy={to.y}
                  r="6"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="1.4"
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ scale: [0.3, 1.5], opacity: [0, 1, 0] }}
                  transition={{ duration: 0.55, delay: 0.25 }}
                />
              </g>
            )}

            {/* ─── SHARED REALISTIC IMPACT DUST CLOUD & SHATTERING PIECE SHARDS ─── */}
            <motion.circle
              cx={to.x}
              cy={to.y}
              r="7.5"
              fill="url(#smokeCloud)"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: [0.4, 1.4, 1.8], opacity: [0, 0.85, 0] }}
              transition={{ duration: 0.85, delay: 0.16 }}
            />

            {SHARD_DIRECTIONS.map((sh, idx) => (
              <motion.polygon
                key={idx}
                points="-1.1,-0.7 1.2,-0.5 0.6,1.1 -0.9,0.8"
                fill={shardColor}
                stroke={shardStroke}
                strokeWidth="0.25"
                initial={{ x: to.x, y: to.y, rotate: 0, opacity: 0 }}
                animate={{
                  x: to.x + sh.dx,
                  y: to.y + sh.dy + 1.8,
                  rotate: sh.rot,
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 0.65, ease: 'easeOut', delay: 0.16 }}
              />
            ))}
          </svg>

          {/* Floating Callout Pill at Target Square */}
          <motion.div
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${to.x}%`, top: `${Math.max(10, to.y - 7)}%` }}
            initial={{ y: 8, scale: 0.7, opacity: 0 }}
            animate={{ y: -6, scale: [0.8, 1.1, 1], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.25 }}
          >
            <div
              className="px-2.5 py-1 rounded-full bg-black/85 border text-[10px] font-black tracking-wider shadow-xl whitespace-nowrap flex items-center gap-1"
              style={{
                borderColor: meta.accentColor,
                color: meta.accentColor,
              }}
            >
              <span>{meta.icon}</span>
              <span>{meta.callout}</span>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
