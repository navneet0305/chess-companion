'use client';

import React from 'react';
import { motion } from 'framer-motion';
import CompanionAvatar from './character/CompanionAvatar';
import type { AnimationState } from '../../types/companion';
import type {
  CharacterBase,
  HeadwearType,
  AccessoryType,
  ColorPalette,
} from '../../contexts/CompanionContext';
import type { CompanionSkitId } from '../../lib/companionBets';

interface CompanionFloatingPresenceProps {
  animationState: AnimationState;
  activeSkit: CompanionSkitId;
  freeRoam: boolean;
  isSpeaking: boolean;
  isGestureOnly: boolean;
  currentText: string;
  character: CharacterBase;
  characterName: string;
  headwear: HeadwearType;
  accessory: AccessoryType;
  palette: ColorPalette;
  onCompanionClick: () => void;
}

/**
 * Unframed, boxless companion stage floating cleanly above the top edge of the board.
 * Keeps only the living 3D/vector companion and its floating speech bubble while all
 * controls live in CompanionSidebarControls.
 */
export default function CompanionFloatingPresence({
  animationState,
  activeSkit,
  freeRoam,
  isSpeaking,
  isGestureOnly,
  currentText,
  character,
  characterName,
  headwear,
  accessory,
  palette,
  onCompanionClick,
}: CompanionFloatingPresenceProps) {
  return (
    <motion.div
      drag={freeRoam}
      dragMomentum={false}
      animate={freeRoam ? undefined : { x: 0, y: 0 }}
      className={`w-full max-w-[560px] mx-auto mb-1 select-none relative overflow-visible ${
        freeRoam ? 'z-50 cursor-grab active:cursor-grabbing' : 'z-40'
      }`}
    >
      <div className="flex items-center justify-start gap-2 sm:gap-3 pl-2 sm:pl-5 overflow-visible">
        {/* Completely unframed 3D/Vector Companion standing freely above the top edge of the board */}
        <div className="relative flex-shrink-0 overflow-visible">
          <CompanionAvatar
            state={animationState}
            skit={activeSkit}
            freeRoam={freeRoam}
            framed={false}
            onClick={onCompanionClick}
            isSpeaking={isSpeaking}
            size={148}
            character={character}
            headwear={headwear}
            accessory={accessory}
            palette={palette}
          />

          {isSpeaking && (
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-green-500/25 border border-green-500/50 shadow-md z-20"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              <span className="w-1 h-2 bg-green-400 rounded-full animate-bounce" />
              <span className="w-1 h-3 bg-green-400 rounded-full animate-bounce delay-75" />
              <span className="w-1 h-2 bg-green-400 rounded-full animate-bounce delay-150" />
            </motion.div>
          )}

          {freeRoam && (
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-[9px] font-mono font-bold text-emerald-300 whitespace-nowrap pointer-events-none">
              DRAG FREE ROAM
            </span>
          )}
        </div>

        {/* Floating Speech / Gesture Bubble only (no heavy HUD box) */}
        <div className="relative min-w-0 max-w-[360px] flex-1">
          <div className="relative bg-[#1a1d26]/90 backdrop-blur-md border border-[#313847] rounded-2xl px-3.5 py-2.5 shadow-lg">
            {/* Bubble tail pointing toward companion */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-[#313847]" />
            <div className="absolute -left-[6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[7px] border-r-[#1a1d26]" />

            <div className="flex items-start justify-between gap-2 min-w-0">
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-300/90 mb-0.5">
                  {characterName}
                </span>
                <p
                  className={`text-xs sm:text-sm leading-snug break-words ${
                    isGestureOnly
                      ? 'italic text-gray-400 font-medium'
                      : 'font-semibold text-gray-100'
                  }`}
                >
                  {isGestureOnly ? currentText : `"${currentText}"`}
                </p>
              </div>
              {isGestureOnly && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800/90 text-gray-400 font-mono flex-shrink-0">
                  🤫 GESTURE
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
