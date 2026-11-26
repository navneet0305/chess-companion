'use client';

import React, { memo } from 'react';
import type { PieceSymbol, Color } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import ChessPiece from './ChessPiece';

export interface PromotionDialogProps {
  /** Whether the dialog is visible. */
  isOpen: boolean;
  /** Color of the promoting side. */
  color: Color;
  /** Called with the chosen piece type. */
  onSelect: (piece: PieceSymbol) => void;
  /** Called when clicking the backdrop (cancel). */
  onCancel?: () => void;
}

const PROMOTION_PIECES: PieceSymbol[] = ['q', 'r', 'b', 'n'];

const PIECE_LABELS: Record<PieceSymbol, string> = {
  q: 'Queen',
  r: 'Rook',
  b: 'Bishop',
  n: 'Knight',
  p: 'Pawn',
  k: 'King',
};

const PromotionDialog = memo(function PromotionDialog({
  isOpen,
  color,
  onSelect,
  onCancel,
}: PromotionDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onCancel}
            aria-hidden
          />

          {/* Dialog */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className="pointer-events-auto bg-white rounded-xl shadow-2xl p-3 flex gap-2">
              <p className="sr-only">Choose a piece to promote to</p>
              {PROMOTION_PIECES.map((piece) => (
                <button
                  key={piece}
                  type="button"
                  onClick={() => onSelect(piece)}
                  className="
                    w-16 h-16 flex items-center justify-center rounded-lg
                    hover:bg-amber-100 active:bg-amber-200
                    transition-colors duration-100
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
                  "
                  aria-label={`Promote to ${PIECE_LABELS[piece]}`}
                >
                  <ChessPiece type={piece} color={color} />
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

export default PromotionDialog;
