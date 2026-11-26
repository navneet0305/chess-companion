'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CompanionPlaceholderProps {
  status?: string;
  isThinking?: boolean;
}

export default function CompanionPlaceholder({
  status = 'ready',
  isThinking = false,
}: CompanionPlaceholderProps) {
  return (
    <div className="w-full max-w-[560px] mx-auto mb-3">
      <div className="relative flex items-center justify-between px-4 py-2.5 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]/90 backdrop-blur-sm shadow-md overflow-hidden">
        {/* Ambient subtle glow background */}
        <div className="absolute -left-4 -top-4 w-24 h-24 bg-green-500/5 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center gap-3 z-10">
          {/* Mascot icon avatar with subtle idle animation */}
          <motion.div
            className="relative flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] border border-green-500/30 text-green-400 shadow-inner"
            animate={
              isThinking
                ? { scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] }
                : { y: [0, -2, 0] }
            }
            transition={{
              repeat: Infinity,
              duration: isThinking ? 1.2 : 3,
              ease: 'easeInOut',
            }}
          >
            {/* Expressive Robot / Chess Companion SVG */}
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="8" width="16" height="12" rx="3" />
              <line x1="12" y1="4" x2="12" y2="8" />
              <circle cx="12" cy="3" r="1" fill="currentColor" />
              {/* Eyes */}
              <circle cx="9" cy="13" r="1.5" fill="currentColor" />
              <circle cx="15" cy="13" r="1.5" fill="currentColor" />
              {/* Smile or thinking line */}
              {isThinking ? (
                <path d="M10 17h4" strokeWidth="2" />
              ) : (
                <path d="M9.5 16.5c1 .8 4 .8 5 0" />
              )}
            </svg>

            {/* Glowing active antenna dot */}
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
          </motion.div>

          {/* Dialogue / Speech Bubble */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-200 tracking-wide flex items-center gap-1.5">
                Gambit <span className="text-[10px] px-1.5 py-0.2 rounded bg-green-500/20 text-green-400 font-mono">AI COMPANION</span>
              </span>
            </div>
            <motion.p
              key={isThinking ? 'thinking' : status}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-gray-400 font-medium"
            >
              {isThinking
                ? 'Thinking about the best countermove...'
                : status === 'playing'
                ? "I'm watching your moves. Make it count!"
                : 'Ready when you are! Choose your side and let’s play.'}
            </motion.p>
          </div>
        </div>

        {/* Emotion / Mood badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#242424] border border-[#333] text-[11px] text-gray-300">
          <span className="text-xs">{isThinking ? '🧠' : '👀'}</span>
          <span className="font-mono text-[10px] text-gray-400">
            {isThinking ? 'CALCULATING' : 'FOCUSED'}
          </span>
        </div>
      </div>
    </div>
  );
}
