'use client';

import { motion } from 'framer-motion';

interface ChessClockProps {
  /** Remaining time in seconds. */
  time: number;
  /** Whether this clock is currently counting down. */
  isActive: boolean;
  /** Whether this clock belongs to the bottom (player's) side of the board. */
  isPlayerClock?: boolean;
}

/**
 * Format seconds into a display string.
 * - Under 10 s → "M:SS.T" (shows tenths)
 * - Otherwise  → "M:SS"  or "H:MM:SS"
 */
function formatClockTime(seconds: number): string {
  if (seconds < 0) seconds = 0;

  if (seconds < 10) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds * 10) % 10);
    return `${mins}:${String(secs).padStart(2, '0')}.${tenths}`;
  }

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function getTimeColor(seconds: number, isActive: boolean): string {
  if (!isActive) return 'text-gray-400';
  if (seconds < 10) return 'text-red-400';
  if (seconds < 30) return 'text-orange-400';
  return 'text-white';
}

export default function ChessClock({ time, isActive, isPlayerClock }: ChessClockProps) {
  const displayTime = formatClockTime(time);
  const colorClass = getTimeColor(time, isActive);
  const isLow = isActive && time < 30;

  return (
    <motion.div
      className={`relative flex items-center justify-center rounded-md bg-[#242424] px-3 py-1.5 font-mono ${
        isActive ? 'ring-1 ring-green-500/30' : ''
      }`}
      animate={
        isActive && time < 10
          ? { boxShadow: ['0 0 4px rgba(239,68,68,0.3)', '0 0 12px rgba(239,68,68,0.5)', '0 0 4px rgba(239,68,68,0.3)'] }
          : isActive
            ? { boxShadow: ['0 0 4px rgba(34,197,94,0.1)', '0 0 8px rgba(34,197,94,0.25)', '0 0 4px rgba(34,197,94,0.1)'] }
            : { boxShadow: '0 0 0px transparent' }
      }
      transition={
        isActive
          ? { repeat: Infinity, duration: 1.5, ease: 'easeInOut' }
          : { duration: 0.3 }
      }
    >
      <span className={`text-lg font-bold tabular-nums leading-none ${colorClass} transition-colors duration-300`}>
        {displayTime}
      </span>

      {/* Low-time indicator dot */}
      {isLow && (
        <motion.span
          className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        />
      )}
    </motion.div>
  );
}
