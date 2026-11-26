import React from 'react';
import type { EvaluationData } from '../../types/chess';

interface EvaluationBarProps {
  evaluation: EvaluationData;
  isFlipped?: boolean;
  className?: string;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({
  evaluation,
  isFlipped = false,
  className = '',
}) => {
  const { score, mate } = evaluation;

  // Calculate percentage of White's advantage (0% to 100%)
  // Standard sigmoid curve: 50 + 50 * (2 / (1 + exp(-0.0035 * score)) - 1)
  let whitePercent = 50;

  if (mate !== null) {
    whitePercent = mate > 0 ? 100 : 0;
  } else {
    const clampedScore = Math.max(-1500, Math.min(1500, score));
    whitePercent = 100 / (1 + Math.exp(-0.0035 * clampedScore));
    whitePercent = Math.max(5, Math.min(95, whitePercent));
  }

  // Display text formatted
  let evalText = '0.0';
  if (mate !== null) {
    evalText = mate > 0 ? `+M${Math.abs(mate)}` : `-M${Math.abs(mate)}`;
  } else {
    const pawnVal = (score / 100).toFixed(1);
    evalText = score > 0 ? `+${pawnVal}` : pawnVal;
    if (evalText === '-0.0') evalText = '0.0';
  }

  // Height percentage of the white portion
  // If not flipped, white is at bottom (so bottom: 0, height: whitePercent%)
  // If flipped, white is at top (so top: 0, height: whitePercent%)
  const whiteHeight = `${whitePercent}%`;
  const isWhiteWinning = (mate !== null && mate > 0) || score > 0;

  return (
    <div
      className={`relative w-6 md:w-7 rounded-lg overflow-hidden flex flex-col justify-between border border-border/60 bg-[#1e2025] shadow-inner select-none ${className}`}
      title={`Engine Evaluation: ${evalText}`}
    >
      {/* Background (Black side) */}
      <div className="absolute inset-0 bg-[#18191d]" />

      {/* White side bar fill */}
      <div
        className="absolute left-0 right-0 bg-[#e2e8f0] transition-all duration-500 ease-out"
        style={
          isFlipped
            ? { top: 0, height: whiteHeight }
            : { bottom: 0, height: whiteHeight }
        }
      />

      {/* Numerical score badge */}
      <div
        className={`relative z-10 w-full flex items-center justify-center text-[10px] md:text-[11px] font-bold font-mono tracking-tight py-1 transition-colors ${
          (isFlipped && isWhiteWinning) || (!isFlipped && !isWhiteWinning)
            ? 'text-foreground/90'
            : 'text-neutral-900'
        }`}
        style={
          isFlipped
            ? isWhiteWinning
              ? { top: 0 }
              : { bottom: 0, position: 'absolute' }
            : isWhiteWinning
            ? { bottom: 0, position: 'absolute' }
            : { top: 0 }
        }
      >
        <span>{evalText}</span>
      </div>
    </div>
  );
};
