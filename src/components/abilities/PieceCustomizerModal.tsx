'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PieceSymbol } from 'chess.js';
import { usePieceAbilities } from '../../contexts/AbilityContext';
import { usePieceSkins } from '../../contexts/PieceSkinContext';
import {
  PIECE_ABILITIES,
  PIECE_DISPLAY_NAMES,
  getAbilitiesForPiece,
} from '../../lib/abilitiesLibrary';
import {
  PIECE_SKIN_CATALOG,
  type AnyPieceSkinId,
} from '../../types/pieceSkins';
import { abilitySounds } from '../../services/abilityEngine';
import { generatePieceAppearanceFromPrompt } from '../../services/pieceGenerator';
import type { PieceAbilityId } from '../../types/abilities';
import ChessPiece from '../chess/ChessPiece';

interface PieceCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PIECE_KEYS: PieceSymbol[] = ['b', 'n', 'r', 'q', 'p', 'k'];

export default function PieceCustomizerModal({ isOpen, onClose }: PieceCustomizerModalProps) {
  const {
    abilitiesEnabled,
    setAbilitiesEnabled,
    abilities,
    setPieceAbility,
    resetAbilities,
  } = usePieceAbilities();

  const {
    pieceSkins,
    setPieceSkin,
    customAppearances,
    setCustomAppearance,
    clearCustomAppearance,
    resetPieceSkins,
    applyPresetTheme,
  } = usePieceSkins();

  const [mainTab, setMainTab] = useState<'skins' | 'abilities'>('skins');
  const [selectedPiece, setSelectedPiece] = useState<PieceSymbol>('q');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [customSide, setCustomSide] = useState<'both' | 'w' | 'b'>('both');
  const [saveToast, setSaveToast] = useState(false);

  if (!isOpen) return null;

  const currentPieceAbilities = getAbilitiesForPiece(selectedPiece);
  const activeAbilityId = abilities[selectedPiece];

  const currentPieceSkins = PIECE_SKIN_CATALOG[selectedPiece] || [];
  const activeSkinId = pieceSkins[selectedPiece];
  const activeCustomAppearance = customAppearances[selectedPiece] || null;

  const handleGenerateCustomPiece = (promptOverride?: string, sideOverride?: 'both' | 'w' | 'b') => {
    const promptToUse = (promptOverride ?? customPrompt).trim();
    if (!promptToUse) return;
    const generated = generatePieceAppearanceFromPrompt(
      promptToUse,
      selectedPiece,
      sideOverride ?? customSide
    );
    setCustomAppearance(selectedPiece, generated);
    abilitySounds.play('teleport');
    if (!promptOverride) setCustomPrompt('');
  };

  const handleSelectAbility = (abilityId: PieceAbilityId) => {
    setPieceAbility(selectedPiece, abilityId);
    const cfg = PIECE_ABILITIES.find((a) => a.id === abilityId);
    if (cfg) {
      abilitySounds.play(cfg.soundType);
    }
  };

  const handleSelectSkin = (skinId: AnyPieceSkinId) => {
    setPieceSkin(selectedPiece, skinId);
    abilitySounds.play('shield');
  };

  const handleSave = () => {
    setSaveToast(true);
    abilitySounds.play('laser');
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 900);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        {/* Click outside backdrop */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          className="relative w-full max-w-3xl bg-[#16171b] border border-[#2e2f38] rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]"
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a32] bg-[#121316]">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Piece Customizer & Abilities
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                    CUSTOM CHESS
                  </span>
                </h2>
                <p className="text-xs text-gray-400">
                  Customize piece skins (One-Eyed Bishop, etc.) and superpower mechanics.
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Dual Main Mode Selector */}
          <div className="flex border-b border-[#2a2a32] bg-[#1a1b22]">
            <button
              onClick={() => setMainTab('skins')}
              className={`flex-1 py-3 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all border-b-2 ${
                mainTab === 'skins'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <span>🎨</span>
              <span>Piece Appearance & Skins</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                One-Eyed Bishop 👁️
              </span>
            </button>

            <button
              onClick={() => setMainTab('abilities')}
              className={`flex-1 py-3 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all border-b-2 ${
                mainTab === 'abilities'
                  ? 'border-purple-400 text-purple-300 bg-purple-950/20'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <span>⚡</span>
              <span>Superpowers & Abilities</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                Death Ray 💥
              </span>
            </button>
          </div>

          {/* Quick Theme Presets Bar (in Skins Tab) */}
          {mainTab === 'skins' && (
            <div className="px-6 py-2.5 bg-[#14151a] border-b border-[#24252e] flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
                <span>⚡ Quick Skin Sets:</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => applyPresetTheme('pirate_anime')}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-950/40 border border-amber-500/40 hover:bg-amber-900/50 text-amber-300 transition"
                >
                  👒 Pirate Anime (One-Eyed Bishop & Straw Hat)
                </button>
                <button
                  onClick={() => applyPresetTheme('cyber')}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-950/40 border border-cyan-500/40 hover:bg-cyan-900/50 text-cyan-300 transition"
                >
                  🤖 Cyberpunk Mecha
                </button>
                <button
                  onClick={() => applyPresetTheme('classic')}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-300 transition"
                >
                  ♟️ Standard Staunton
                </button>
              </div>
            </div>
          )}

          {/* Master Enable/Disable Bar (in Abilities Tab) */}
          {mainTab === 'abilities' && (
            <div className="px-6 py-3 bg-[#1e1f26] border-b border-[#2a2a32] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{abilitiesEnabled ? '🔥' : '♟️'}</span>
                <div>
                  <span className="text-sm font-semibold text-white block">
                    {abilitiesEnabled ? 'Special Piece Abilities Active' : 'Standard Classic Chess Rules'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {abilitiesEnabled
                      ? 'Pieces unleash laser beams, shockwaves, and powers during moves.'
                      : 'All special powers are disabled. Standard FIDE rules apply.'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setAbilitiesEnabled(!abilitiesEnabled)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  abilitiesEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30'
                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'
                }`}
              >
                {abilitiesEnabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          )}

          {/* Piece Category Navigation Tabs */}
          <div className="flex px-6 pt-3 pb-2 gap-2 border-b border-[#24252e] bg-[#121316] overflow-x-auto">
            {PIECE_KEYS.map((k) => {
              const isSelected = selectedPiece === k;
              return (
                <button
                  key={k}
                  onClick={() => setSelectedPiece(k)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                      : 'bg-[#1e1f26] text-gray-400 hover:text-gray-200 hover:bg-[#282933]'
                  }`}
                >
                  <span className="uppercase">{k}</span>
                  <span>{PIECE_DISPLAY_NAMES[k].name}</span>
                  {k === 'b' && <span className="text-[10px]">👁️</span>}
                  {k === 'n' && <span className="text-[10px]">👒</span>}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* ─── TAB 1: PIECE SKINS & VISUALS ─── */}
            {mainTab === 'skins' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Left: Interactive 3D/2D Piece Preview Box */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <div className="w-full rounded-2xl border border-[#2e2f38] bg-gradient-to-b from-[#1c1d24] to-[#111215] p-6 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">
                      Live Piece Skin Preview
                    </span>

                    {/* Both White and Black preview side-by-side */}
                    <div className="flex items-center justify-center gap-8 py-2">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-xl bg-[#282a36] border border-[#3c3e4f] flex items-center justify-center shadow-lg p-1.5">
                          <ChessPiece type={selectedPiece} color="w" size={54} skinOverride={activeSkinId} />
                        </div>
                        <span className="text-[11px] font-semibold text-gray-300">White Piece</span>
                      </div>

                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-xl bg-[#282a36] border border-[#3c3e4f] flex items-center justify-center shadow-lg p-1.5">
                          <ChessPiece type={selectedPiece} color="b" size={54} skinOverride={activeSkinId} />
                        </div>
                        <span className="text-[11px] font-semibold text-gray-300">Black Piece</span>
                      </div>
                    </div>

                    <div className="mt-4 text-center">
                      <span className="text-xs font-bold text-cyan-300 block">
                        {activeCustomAppearance
                          ? `✨ ${activeCustomAppearance.displayName} (${PIECE_DISPLAY_NAMES[selectedPiece].name})`
                          : currentPieceSkins.find((s) => s.id === activeSkinId)?.name}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5 block max-w-xs">
                        {activeCustomAppearance
                          ? `Custom generated character appearance ("${activeCustomAppearance.prompt}")`
                          : currentPieceSkins.find((s) => s.id === activeSkinId)?.description}
                      </span>
                      {activeCustomAppearance && (
                        <button
                          type="button"
                          onClick={() => clearCustomAppearance(selectedPiece)}
                          className="mt-2 px-2.5 py-1 rounded bg-rose-950/60 border border-rose-500/40 text-[10px] font-bold text-rose-300 hover:bg-rose-900/60 transition"
                        >
                          ✕ Revert to Standard Skin
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Custom Character Generator + Skin Selection Cards */}
                <div className="md:col-span-7 space-y-2.5">
                  {/* ✨ AI / Custom Character Piece Generator */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/60 via-purple-950/50 to-[#1b1c24] border border-purple-500/50 shadow-md space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-purple-200 flex items-center gap-1.5">
                        <span>✨</span>
                        <span>Generate Custom {PIECE_DISPLAY_NAMES[selectedPiece].name} Character</span>
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                        ANIME / ANY NAME
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleGenerateCustomPiece();
                          }
                        }}
                        placeholder={`Type name or style (e.g. "Gojo", "Naruto", "Fire Dragon")...`}
                        className="flex-1 bg-[#121318] border border-[#3a3d4d] rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleGenerateCustomPiece()}
                        disabled={!customPrompt.trim()}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-40 text-white text-xs font-bold transition shadow-sm whitespace-nowrap"
                      >
                        ✨ Generate
                      </button>
                    </div>

                    {/* Side Selection (Both | White Only | Black Only) */}
                    <div className="flex items-center justify-between gap-2 text-[10px]">
                      <span className="text-gray-400 font-semibold">Apply Character To:</span>
                      <div className="flex items-center gap-1">
                        {[
                          { id: 'both' as const, label: 'Both Sides' },
                          { id: 'w' as const, label: 'White Only' },
                          { id: 'b' as const, label: 'Black Only' },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setCustomSide(opt.id);
                              if (activeCustomAppearance) {
                                setCustomAppearance(selectedPiece, {
                                  ...activeCustomAppearance,
                                  targetSide: opt.id,
                                });
                              }
                            }}
                            className={`px-2 py-0.5 rounded font-bold transition ${
                              customSide === opt.id
                                ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-200'
                                : 'bg-[#242634] border border-[#383b4e] text-gray-400 hover:text-gray-200'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick 1-click anime / hero presets */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-gray-400">Quick ideas:</span>
                      {[
                        { label: '👁️ Gojo', prompt: 'Satoru Gojo' },
                        { label: '👒 Luffy', prompt: 'Monkey D. Luffy' },
                        { label: '⚔️ Zoro', prompt: 'Roronoa Zoro' },
                        { label: '🔱 Sukuna', prompt: 'Ryomen Sukuna' },
                        { label: '🍥 Naruto', prompt: 'Naruto' },
                        { label: '🔥 Goku', prompt: 'Goku' },
                        { label: '🕷️ Spider-Man', prompt: 'Spider-Man' },
                      ].map((chip) => (
                        <button
                          key={chip.prompt}
                          type="button"
                          onClick={() => handleGenerateCustomPiece(chip.prompt)}
                          className="px-2 py-0.5 rounded-md bg-[#242634] hover:bg-purple-900/60 border border-[#383b4e] hover:border-purple-400 text-[10px] font-semibold text-gray-200 transition"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 flex items-center justify-between pt-1">
                    <span>Available Styles for {PIECE_DISPLAY_NAMES[selectedPiece].name}:</span>
                    {selectedPiece === 'b' && (
                      <span className="text-amber-400 text-[11px] font-bold">★ User Requested</span>
                    )}
                  </div>

                  {currentPieceSkins.map((skin) => {
                    const isSelected = !activeCustomAppearance && skin.id === activeSkinId;
                    return (
                      <div
                        key={skin.id}
                        onClick={() => handleSelectSkin(skin.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-cyan-950/30 border-cyan-500 shadow-md shadow-cyan-500/10'
                            : 'bg-[#1b1c22] border-[#292a34] hover:border-[#3d3f4d] hover:bg-[#202128]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#252631] flex items-center justify-center text-xl flex-shrink-0">
                            {skin.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{skin.name}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-mono bg-cyan-500/20 text-cyan-300">
                                {skin.tag}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                              {skin.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <button
                            type="button"
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-cyan-500 text-black shadow-sm font-black'
                                : 'bg-[#292a34] text-gray-300 hover:bg-[#363847]'
                            }`}
                          >
                            {isSelected ? 'EQUIPPED ✓' : 'EQUIP'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── TAB 2: PIECE SUPERPOWERS ─── */}
            {mainTab === 'abilities' && (
              <div className="space-y-3">
                {selectedPiece === 'b' && (
                  <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <span className="font-bold block text-purple-100">
                        User Requested Feature: Diagonal Destruction Ray!
                      </span>
                      <span>
                        Whenever this Bishop moves or an enemy steps into its diagonal sightline, a high-voltage laser strikes and vaporizes that opponent piece!
                      </span>
                    </div>
                  </div>
                )}

                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Select Superpower for {PIECE_DISPLAY_NAMES[selectedPiece].name}:
                </div>

                {currentPieceAbilities.map((ability) => {
                  const isSelected = ability.id === activeAbilityId;
                  return (
                    <div
                      key={ability.id}
                      onClick={() => handleSelectAbility(ability.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-purple-950/30 border-purple-500 shadow-md shadow-purple-500/10'
                          : 'bg-[#1b1c22] border-[#292a34] hover:border-[#3d3f4d] hover:bg-[#202128]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl mt-0.5">{ability.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{ability.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-purple-500/20 text-purple-300">
                              {ability.badge.toUpperCase()}
                            </span>
                            {ability.id === 'bishop_diagonal_laser' && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                                USER FAVORITE
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{ability.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            abilitySounds.play(ability.soundType);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#282a35] text-gray-300 hover:text-white hover:bg-[#343746] transition"
                          title="Preview sound effect"
                        >
                          🔊 Test
                        </button>

                        <button
                          type="button"
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'bg-[#292a34] text-gray-300 hover:bg-[#363847]'
                          }`}
                        >
                          {isSelected ? 'ACTIVE ✓' : 'SELECT'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2a32] bg-[#121316]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  resetPieceSkins();
                  resetAbilities();
                }}
                className="text-xs text-gray-400 hover:text-gray-200 transition underline decoration-gray-600"
              >
                Reset to Defaults
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
              >
                <span>⚡</span>
                <span>Save & Deploy Customizations</span>
              </button>
            </div>
          </div>

          {/* Save Success Toast */}
          <AnimatePresence>
            {saveToast && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-xl flex items-center gap-2 z-50 pointer-events-none"
              >
                <span>✓</span>
                <span>Piece Skins & Superpowers Saved and Active!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
