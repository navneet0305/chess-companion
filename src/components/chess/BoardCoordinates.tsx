'use client';

import React, { memo } from 'react';
import { FILES, RANKS } from '../../lib/constants';

export interface BoardCoordinatesProps {
  boardFlipped: boolean;
}

/**
 * Renders coordinate labels (a-h, 1-8) overlaid inside the board squares.
 *
 * File labels appear in the bottom-left corner of the bottom row squares.
 * Rank labels appear in the top-left corner of the leftmost column squares.
 *
 * When boardFlipped is true the labels are reordered accordingly.
 */
const BoardCoordinates = memo(function BoardCoordinates({
  boardFlipped,
}: BoardCoordinatesProps) {
  const files = boardFlipped ? [...FILES].reverse() : [...FILES];
  const ranks = boardFlipped ? [...RANKS] : [...RANKS].reverse();

  return (
    <>
      {/* Rank labels — left column, one per row */}
      {ranks.map((rank, rowIdx) => {
        // Determine if the square at left column of this row is light
        // Row 0 col 0 → (0+0)%2===0 → light
        const isLight = (rowIdx + 0) % 2 === 0;
        return (
          <div
            key={`rank-${rank}`}
            className="absolute pointer-events-none select-none z-10"
            style={{
              top: `${(rowIdx / 8) * 100}%`,
              left: 0,
              width: `${100 / 8}%`,
              height: `${100 / 8}%`,
              padding: '2px 0 0 3px',
            }}
          >
            <span
              className="text-[10px] font-semibold leading-none"
              style={{ color: isLight ? '#b48866' : '#e8d5b5' }}
            >
              {rank}
            </span>
          </div>
        );
      })}

      {/* File labels — bottom row, one per column */}
      {files.map((file, colIdx) => {
        const isLight = (7 + colIdx) % 2 === 0;
        return (
          <div
            key={`file-${file}`}
            className="absolute pointer-events-none select-none z-10 flex items-end justify-end"
            style={{
              top: `${(7 / 8) * 100}%`,
              left: `${(colIdx / 8) * 100}%`,
              width: `${100 / 8}%`,
              height: `${100 / 8}%`,
              padding: '0 3px 1px 0',
            }}
          >
            <span
              className="text-[10px] font-semibold leading-none"
              style={{ color: isLight ? '#b48866' : '#e8d5b5' }}
            >
              {file}
            </span>
          </div>
        );
      })}
    </>
  );
});

export default BoardCoordinates;
