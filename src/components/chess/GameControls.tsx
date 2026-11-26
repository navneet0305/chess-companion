'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameControlsProps {
  onNewGame: () => void;
  onUndo: () => void;
  onFlipBoard: () => void;
  onResign: () => void;
  canUndo: boolean;
  isGameOver: boolean;
}

export default function GameControls({
  onNewGame,
  onUndo,
  onFlipBoard,
  onResign,
  canUndo,
  isGameOver,
}: GameControlsProps) {
  const [showResignConfirm, setShowResignConfirm] = useState(false);

  const handleResignClick = () => {
    if (isGameOver) return;
    setShowResignConfirm(true);
  };

  const confirmResign = () => {
    setShowResignConfirm(false);
    onResign();
  };

  const cancelResign = () => {
    setShowResignConfirm(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#242424] px-3 py-2">
        {/* New Game */}
        <ControlButton
          onClick={onNewGame}
          label="New Game"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          }
        />

        {/* Undo Move */}
        <ControlButton
          onClick={onUndo}
          label="Undo"
          disabled={!canUndo || isGameOver}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          }
        />

        {/* Flip Board */}
        <ControlButton
          onClick={onFlipBoard}
          label="Flip"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
          }
        />

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-[#2a2a2a]" />

        {/* Resign */}
        <ControlButton
          onClick={handleResignClick}
          label="Resign"
          disabled={isGameOver}
          variant="danger"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
          }
        />
      </div>

      {/* Resign confirmation overlay */}
      <AnimatePresence>
        {showResignConfirm && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-10 mt-2 flex items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-[#1a1a1a] px-4 py-3 shadow-lg"
          >
            <span className="text-sm text-red-400">Resign this game?</span>
            <div className="flex gap-2">
              <button
                onClick={cancelResign}
                className="rounded-md border border-[#2a2a2a] bg-[#242424] px-3 py-1 text-xs text-gray-400 transition-colors hover:bg-[#2a2a2a] hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmResign}
                className="rounded-md bg-red-600 px-3 py-1 text-xs text-white transition-colors hover:bg-red-500"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Internal button component                                         */
/* ------------------------------------------------------------------ */

interface ControlButtonProps {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}

function ControlButton({
  onClick,
  label,
  icon,
  disabled = false,
  variant = 'default',
}: ControlButtonProps) {
  const base =
    'flex flex-col items-center gap-1 rounded-md px-3 py-2 text-[10px] font-medium uppercase tracking-wider transition-all duration-150';

  const variants = {
    default: disabled
      ? 'cursor-not-allowed text-gray-600'
      : 'text-gray-400 hover:bg-[#2a2a2a] hover:text-gray-200 active:scale-95',
    danger: disabled
      ? 'cursor-not-allowed text-gray-600'
      : 'text-red-400 hover:bg-red-500/10 hover:text-red-300 active:scale-95',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]}`}
      title={label}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
