'use client';

import React, { memo } from 'react';
import type { PieceSymbol, Color } from 'chess.js';
import { getPieceIcon } from '../../lib/piece-icons';
import { usePieceSkins } from '../../contexts/PieceSkinContext';
import PieceSkinDecorations from './PieceSkinDecorations';
import CustomGeneratedPieceIcon from './CustomGeneratedPieceIcon';
import type { AnyPieceSkinId, CustomPieceAppearance } from '../../types/pieceSkins';

export interface ChessPieceProps {
  type: PieceSymbol;
  color: Color;
  size?: number;
  isDragging?: boolean;
  skinOverride?: AnyPieceSkinId;
  customAppearanceOverride?: CustomPieceAppearance | null;
}

const ChessPiece = memo(function ChessPiece({
  type,
  color,
  size,
  isDragging = false,
  skinOverride,
  customAppearanceOverride,
}: ChessPieceProps) {
  const { pieceSkins, customAppearances } = usePieceSkins();
  const PieceIcon = getPieceIcon({ type, color });
  const rawCustom =
    customAppearanceOverride !== undefined
      ? customAppearanceOverride
      : customAppearances[type] || null;
  const activeCustom =
    rawCustom &&
    (!rawCustom.targetSide || rawCustom.targetSide === 'both' || rawCustom.targetSide === color)
      ? rawCustom
      : null;
  const activeSkin = skinOverride || pieceSkins[type];

  return (
    <div
      className={`
        relative flex items-center justify-center
        transition-transform duration-150 ease-out
        ${isDragging ? 'scale-110 opacity-70' : 'scale-100 opacity-100'}
        animate-piece-move
        drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]
      `}
      style={size ? { width: size, height: size } : undefined}
      draggable={false}
      aria-hidden
    >
      {activeCustom ? (
        <CustomGeneratedPieceIcon
          appearance={activeCustom}
          color={color}
          pieceType={type}
          className="w-full h-full pointer-events-none select-none"
        />
      ) : (
        <>
          <PieceIcon className="w-full h-full pointer-events-none select-none" />
          {activeSkin && (
            <PieceSkinDecorations
              pieceType={type}
              color={color}
              skinId={activeSkin}
            />
          )}
        </>
      )}
    </div>
  );
});

export default ChessPiece;
