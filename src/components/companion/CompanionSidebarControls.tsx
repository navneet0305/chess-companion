'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ELEVENLABS_VOICES,
  type VoiceApiProvider,
  type VoiceApiSettings,
  type VoiceStatus,
} from '../../services/voiceService';
import type { Personality } from '../../types/companion';
import type { CompanionBet } from '../../lib/companionBets';
import type { CharacterBase } from '../../contexts/CompanionContext';
import { PERSONALITY_LABELS } from '../../hooks/useCompanionController';

interface CompanionSidebarControlsProps {
  character?: CharacterBase;
  onSelectCharacter?: (c: CharacterBase) => void;
  characterName: string;
  characterTitle: string;
  mood: { text: string; icon: string; color: string };
  personality: Personality;
  isVoiceMuted: boolean;
  freeRoam: boolean;
  activeBet: CompanionBet;
  voiceSettings: VoiceApiSettings;
  voiceStatus?: VoiceStatus;
  onToggleVoiceMuted: () => void;
  onSelectPersonality: (personality: Personality) => void;
  onInteractiveAction: (action: 'hint' | 'vibe' | 'hype') => void;
  onToggleFreeRoam: () => void;
  onVoiceSettingChange: (patch: Partial<VoiceApiSettings>) => void;
  onTestVoice: () => void;
  onRunDare: () => void;
  onNextBet: () => void;
}

/**
 * Right-sidebar card holding all companion controls (mood, voice engine, mute,
 * personality selector, Hint / Board Vibe / Hype / Free Roam actions, and live Dare/Bet).
 */
export default function CompanionSidebarControls({
  character,
  onSelectCharacter,
  characterName,
  characterTitle,
  mood,
  personality,
  isVoiceMuted,
  freeRoam,
  activeBet,
  voiceSettings,
  voiceStatus,
  onToggleVoiceMuted,
  onSelectPersonality,
  onInteractiveAction,
  onToggleFreeRoam,
  onVoiceSettingChange,
  onTestVoice,
  onRunDare,
  onNextBet,
}: CompanionSidebarControlsProps) {
  const [showPersonalityMenu, setShowPersonalityMenu] = useState(false);
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowPersonalityMenu(false);
      }
    }
    if (showPersonalityMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPersonalityMenu]);

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 shadow-sm space-y-3">
      {/* Header: Name + Mood Pill + Mute Button */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#2a2a2a]">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200 truncate">
              {characterName}
            </h4>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold whitespace-nowrap">
              {characterTitle}
            </span>
          </div>
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 mt-1.5 rounded-full border text-[10px] font-mono tracking-wide ${mood.color}`}
          >
            <span>{mood.icon}</span>
            <span>{mood.text}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleVoiceMuted}
          className="px-2 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2e2e2e] border border-[#363636] text-gray-300 hover:text-white transition-colors text-xs flex-shrink-0"
          title={isVoiceMuted ? 'Unmute Voice' : 'Mute Voice'}
        >
          {isVoiceMuted ? '🔇 Muted' : '🔊 Sound'}
        </button>
      </div>

      {/* Quick 1-Click Companion Switcher between Old (Bruno) and Existing (Crown Mascot) */}
      <div className="flex items-center gap-1.5 p-1 bg-[#141414] rounded-lg border border-[#2a2a2a]">
        <button
          type="button"
          onClick={() => onSelectCharacter?.('bruno')}
          className={`flex-1 py-1 px-2 rounded text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            character === 'bruno' || character === 'mateo'
              ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#202020]'
          }`}
          title="Switch to Classic Maestro Bruno (Tailored Blazer, Mustache, Espresso)"
        >
          <span>🎭</span>
          <span>Bruno (Classic)</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectCharacter?.('crowned')}
          className={`flex-1 py-1 px-2 rounded text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            character === 'crowned'
              ? 'bg-purple-500/25 text-purple-200 border border-purple-500/50 shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#202020]'
          }`}
          title="Switch to Crown Mascot (Purple Headphones, Crown, Clean Smirk)"
        >
          <span>👑</span>
          <span>Crown Mascot</span>
        </button>
      </div>

      {/* Personality Dropdown + Voice API Toggle */}
      <div className="grid grid-cols-2 gap-1.5">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowPersonalityMenu((prev) => !prev)}
            className="w-full flex items-center justify-between gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2e2e2e] text-gray-200 border border-[#3b3b3b] transition-colors"
            title="Change AI Mode / Personality"
          >
            <span className="flex items-center gap-1 min-w-0 truncate">
              <span>{PERSONALITY_LABELS[personality].icon}</span>
              <span className="truncate">{PERSONALITY_LABELS[personality].label}</span>
            </span>
            <span className="text-[9px] text-gray-400 flex-shrink-0">▼</span>
          </button>

          <AnimatePresence>
            {showPersonalityMenu && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                className="absolute left-0 top-full mt-2 z-[100] w-64 rounded-2xl border border-[#3b4252] bg-[#181a22]/98 backdrop-blur-xl p-2 shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-1"
              >
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-gray-400 border-b border-[#2b303c] mb-1 flex items-center justify-between">
                  <span>AI PERSONALITY MODE</span>
                  <span className="text-green-400 font-bold">5 MODES</span>
                </div>
                {(Object.keys(PERSONALITY_LABELS) as Personality[]).map((key) => {
                  const item = PERSONALITY_LABELS[key];
                  const isSelected = personality === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        onSelectPersonality(key);
                        setShowPersonalityMenu(false);
                      }}
                      className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'bg-green-500/20 text-green-300 border border-green-500/40 shadow-sm'
                          : 'text-gray-200 hover:bg-[#252a36] border border-transparent'
                      }`}
                    >
                      <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold leading-tight flex items-center justify-between gap-2">
                          <span>{item.label}</span>
                          {isSelected && (
                            <span className="text-[10px] text-green-400 font-mono">ACTIVE</span>
                          )}
                        </span>
                        <span className="text-[10px] text-gray-400 leading-tight mt-0.5">
                          {item.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => setShowVoicePanel((prev) => !prev)}
          className={`w-full px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-colors flex items-center justify-center gap-1 ${
            showVoicePanel
              ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200'
              : 'bg-[#242424] hover:bg-[#2e2e2e] border-cyan-500/30 text-cyan-300'
          }`}
          title="Configure Realistic Human Voice API (ElevenLabs / OpenAI / Neural)"
        >
          <span>🎙️</span>
          <span>Voice API</span>
          {voiceSettings.provider === 'elevenlabs' && !voiceSettings.elevenLabsApiKey.trim() && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-amber-400"
              title="Add ElevenLabs API key for this device"
            />
          )}
        </button>
      </div>

      {/* Inline Voice Engine Panel (no viewport-clipping overhang) */}
      <AnimatePresence>
        {showVoicePanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-[#3b4252] bg-[#14161e] p-3 space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#2b303c] pb-1.5">
                <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                  🎙️ Realistic Voice Engine
                </span>
                <button
                  type="button"
                  onClick={() => setShowVoicePanel(false)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-semibold">Voice Provider</label>
                <select
                  value={voiceSettings.provider}
                  onChange={(e) =>
                    onVoiceSettingChange({ provider: e.target.value as VoiceApiProvider })
                  }
                  className="w-full bg-[#242631] border border-[#3a3d4d] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="auto">Auto (API Key → Free Neural → Browser)</option>
                  <option value="streamelements">Free Neural TTS API (StreamElements)</option>
                  <option value="elevenlabs">ElevenLabs AI Voice (API Key)</option>
                  <option value="openai">OpenAI TTS-1 Human Voice (API Key)</option>
                  <option value="browser">Humanized Browser Neural</option>
                </select>
              </div>

              {(voiceSettings.provider === 'elevenlabs' || voiceSettings.provider === 'auto') && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-semibold">
                      ElevenLabs Voice
                    </label>
                    <select
                      value={voiceSettings.elevenLabsVoiceId}
                      onChange={(e) =>
                        onVoiceSettingChange({ elevenLabsVoiceId: e.target.value })
                      }
                      className="w-full bg-[#242631] border border-[#3a3d4d] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      {ELEVENLABS_VOICES.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-semibold">
                      ElevenLabs API Key
                    </label>
                    <input
                      type="password"
                      placeholder="xi-api-key..."
                      value={voiceSettings.elevenLabsApiKey}
                      onChange={(e) =>
                        onVoiceSettingChange({ elevenLabsApiKey: e.target.value })
                      }
                      className="w-full bg-[#242631] border border-[#3a3d4d] rounded-lg px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                    />
                    {!voiceSettings.elevenLabsApiKey.trim() && (
                      <p className="text-[10px] text-amber-300/90 leading-tight">
                        Saved only on this device (localStorage). Without a key, Browser / Free Neural voice is used.
                      </p>
                    )}
                  </div>
                </>
              )}

              {(voiceSettings.provider === 'openai' || voiceSettings.provider === 'auto') && (
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-semibold">
                    OpenAI API Key (Optional)
                  </label>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={voiceSettings.openAiApiKey}
                    onChange={(e) =>
                      onVoiceSettingChange({ openAiApiKey: e.target.value })
                    }
                    className="w-full bg-[#242631] border border-[#3a3d4d] rounded-lg px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={onTestVoice}
                className="w-full py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition"
              >
                🔊 Test Humanized Voice
              </button>

              {voiceStatus && (
                <p
                  className={`text-[10px] leading-tight px-2 py-1 rounded border ${
                    voiceStatus.ok
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                  }`}
                >
                  {voiceStatus.message}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Companion Action Buttons */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => onInteractiveAction('hint')}
          className="px-2.5 py-1.5 rounded-lg bg-[#222530] hover:bg-[#2c3140] border border-[#363b4d] text-[11px] font-semibold text-amber-300 transition flex items-center justify-center gap-1"
        >
          <span>💡</span> Ask Hint
        </button>
        <button
          type="button"
          onClick={() => onInteractiveAction('vibe')}
          className="px-2.5 py-1.5 rounded-lg bg-[#222530] hover:bg-[#2c3140] border border-[#363b4d] text-[11px] font-semibold text-cyan-300 transition flex items-center justify-center gap-1"
        >
          <span>📊</span> Board Vibe
        </button>
        <button
          type="button"
          onClick={() => onInteractiveAction('hype')}
          className="px-2.5 py-1.5 rounded-lg bg-[#222530] hover:bg-[#2c3140] border border-[#363b4d] text-[11px] font-semibold text-rose-300 transition flex items-center justify-center gap-1"
        >
          <span>🔥</span> Chat / Hype
        </button>
        <button
          type="button"
          onClick={onToggleFreeRoam}
          title="Allow 3D Bruno to roam freely & drag anywhere on screen"
          className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition flex items-center justify-center gap-1 ${
            freeRoam
              ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300'
              : 'bg-[#222530] hover:bg-[#2c3140] border-[#363b4d] text-emerald-300'
          }`}
        >
          <span>{freeRoam ? '📌' : '🦋'}</span>
          <span>{freeRoam ? 'Dock Back' : 'Free Roam'}</span>
        </button>
      </div>

      {/* Live Match Bet / Creative Condition Dare */}
      <div className="rounded-xl bg-[#161820] border border-amber-500/30 p-2.5 space-y-2">
        <div className="flex items-start gap-1.5 text-[11px] min-w-0">
          <span className="flex-shrink-0 mt-0.5">{activeBet.icon}</span>
          <span className="text-amber-200 font-medium leading-snug break-words">
            {activeBet.betPrompt}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onRunDare}
            className="flex-1 py-1 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 font-bold text-[11px] transition"
            title="Preview this creative 3D condition skit right now!"
          >
            🎭 Run Dare
          </button>
          <button
            type="button"
            onClick={onNextBet}
            className="px-2.5 py-1 rounded-lg bg-[#272a36] hover:bg-[#323646] text-gray-300 font-semibold text-[11px] transition"
            title="Pick a different creative bet"
          >
            🎲
          </button>
        </div>
      </div>
    </div>
  );
}
