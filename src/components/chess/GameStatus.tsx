'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { GameStatus as GameStatusType, GameEndReason } from '@/types/chess';

interface GameStatusProps {
  status: GameStatusType;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  endReason?: GameEndReason;
}

interface StatusDisplay {
  label: string;
  color: string; // Tailwind text-* class
  bg: string;    // Tailwind bg-* class
  pulse?: boolean;
}

function getStatusDisplay(props: GameStatusProps): StatusDisplay {
  const { status, isCheck, isCheckmate, isStalemate, isDraw, endReason } = props;

  if (isCheckmate) {
    return { label: 'Checkmate!', color: 'text-red-300', bg: 'bg-red-500/15', pulse: true };
  }
  if (isStalemate) {
    return { label: 'Stalemate', color: 'text-yellow-300', bg: 'bg-yellow-500/15' };
  }
  if (isDraw) {
    const reasonLabels: Record<string, string> = {
      threefold_repetition: 'Draw — Threefold Repetition',
      fifty_moves: 'Draw — Fifty-move Rule',
      insufficient_material: 'Draw — Insufficient Material',
      draw_agreement: 'Draw — Agreement',
    };
    const label = (endReason && reasonLabels[endReason]) || 'Draw';
    return { label, color: 'text-yellow-300', bg: 'bg-yellow-500/15' };
  }
  if (status === 'ended') {
    if (endReason === 'resignation') {
      return { label: 'Resigned', color: 'text-orange-300', bg: 'bg-orange-500/15' };
    }
    if (endReason === 'timeout') {
      return { label: 'Time Out', color: 'text-orange-300', bg: 'bg-orange-500/15' };
    }
    return { label: 'Game Over', color: 'text-gray-300', bg: 'bg-gray-500/15' };
  }
  if (isCheck) {
    return { label: 'Check!', color: 'text-red-400', bg: 'bg-red-500/10', pulse: true };
  }
  if (status === 'playing') {
    return { label: 'Playing', color: 'text-green-400', bg: 'bg-green-500/10' };
  }
  if (status === 'paused') {
    return { label: 'Paused', color: 'text-gray-400', bg: 'bg-gray-500/10' };
  }

  // idle
  return { label: 'Ready', color: 'text-gray-500', bg: 'bg-gray-500/5' };
}

export default function GameStatus(props: GameStatusProps) {
  const display = getStatusDisplay(props);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={display.label}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${display.bg}`}
      >
        {/* Status dot */}
        <motion.span
          className={`h-2 w-2 rounded-full ${display.color.replace('text-', 'bg-')}`}
          animate={
            display.pulse
              ? { scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }
              : { scale: 1, opacity: 1 }
          }
          transition={
            display.pulse
              ? { repeat: Infinity, duration: 1.2, ease: 'easeInOut' }
              : {}
          }
        />

        <span className={`text-xs font-semibold uppercase tracking-wider ${display.color}`}>
          {display.label}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
