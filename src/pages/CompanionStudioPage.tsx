'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CompanionAvatar from '../components/companion/character/CompanionAvatar';
import { useCompanion, CharacterBase, HeadwearType, AccessoryType, ColorPalette } from '../contexts/CompanionContext';
import { companionVoice } from '../services/voiceService';
import type { Personality, AnimationState } from '../types/companion';
import Button from '../components/ui/Button';

const CHARACTERS: { id: CharacterBase; name: string; desc: string; icon: string }[] = [
  { id: 'bruno', name: 'Bruno', desc: 'A cheeky crowned 3D mascot with purple headphones, cool half-lidded smirk, finger-gun swagger, and chunky purple sneakers', icon: '👑' },
  { id: 'luffy', name: 'Monkey D. Luffy', desc: 'The fearless future Pirate King with his iconic straw hat, eye scar, open red vest, and rubbery tactical energy', icon: '👒' },
  { id: 'zoro', name: 'Roronoa Zoro', desc: 'The legendary master swordsman with moss-green hair, eye scar, triple golden earrings, and fierce tactical precision', icon: '⚔️' },
  { id: 'gojo', name: 'Satoru Gojo', desc: 'The strongest jujutsu sorcerer with spiky white hair, blindfold / glowing Six Eyes, and infinite tactical swagger', icon: '👁️' },
  { id: 'mateo', name: 'Mateo', desc: 'The charismatic Grand Maestro with his dapper mustache, maroon turtleneck, and flamboyant tactical flair', icon: '🎨' },
  { id: 'gambit', name: 'Leo "Gambit"', desc: 'The young chess prodigy in a stylish streetwear hoodie and sneakers', icon: '👦' },
  { id: 'rookus', name: 'Commander Rookus', desc: 'The stoic defensive tactician in a structured trench coat', icon: '🧑‍✈️' },
  { id: 'knightly', name: 'Sir Knightly', desc: 'The dashing dynamic speed-demon in a sharp varsity jacket', icon: '👱' },
  { id: 'bishop', name: 'Grandmaster Barnaby', desc: 'The distinguished chess professor in a tailored suit and tie', icon: '👴' },
  { id: 'queenie', name: 'Queen Helena', desc: 'The confident supreme grandmaster champion in royal championship attire', icon: '👩‍🦰' },
];

const HEADWEARS: { id: HeadwearType; name: string; icon: string }[] = [
  { id: 'none', name: 'Natural Hairstyle', icon: '💇' },
  { id: 'santa', name: 'Santa Hat (Festive)', icon: '🎅' },
  { id: 'crown', name: 'Golden Crown', icon: '👑' },
  { id: 'headphones', name: 'Cyber Headphones', icon: '🎧' },
  { id: 'detective', name: 'Detective Fedora', icon: '🕵️' },
  { id: 'wizard', name: 'Starry Wizard Hat', icon: '🧙' },
];

const ACCESSORIES: { id: AccessoryType; name: string; icon: string }[] = [
  { id: 'none', name: 'None', icon: '🚫' },
  { id: 'sunglasses', name: 'Cool Shades', icon: '🕶️' },
  { id: 'bowtie', name: 'Dapper Bowtie', icon: '🎀' },
  { id: 'medal', name: 'Champion Medal', icon: '🏅' },
  { id: 'scarf', name: 'Cozy Winter Scarf', icon: '🧣' },
];

const PALETTES: { id: ColorPalette; name: string; hex: string }[] = [
  { id: 'mint', name: 'Emerald Mint', hex: '#22c55e' },
  { id: 'cyan', name: 'Cyber Cyan', hex: '#06b6d4' },
  { id: 'ruby', name: 'Crimson Ruby', hex: '#ef4444' },
  { id: 'gold', name: 'Royal Gold', hex: '#eab308' },
  { id: 'purple', name: 'Twilight Purple', hex: '#a855f7' },
];

const PERSONALITIES: { id: Personality; name: string; icon: string; desc: string; sample: string }[] = [
  { id: 'roaster', name: 'The Roaster', icon: '🔥', desc: 'Sarcastic, witty, and roasts every mistake with humor', sample: "Try not to lose your queen in five moves this time." },
  { id: 'supportive', name: 'Supportive Friend', icon: '💖', desc: 'Warm, encouraging, and believes in your tactical greatness', sample: "You've got this! Take your time and trust your instincts." },
  { id: 'competitive', name: 'The Competitor', icon: '⚔️', desc: 'Fierce, victory-driven, and focused on total domination', sample: "No blunders, no mercy. Let's crush them." },
  { id: 'coach', name: 'Calm Grandmaster', icon: '🧠', desc: 'Patient teacher focusing on fundamentals and board harmony', sample: "Remember: control the center and coordinate your pieces." },
  { id: 'chaotic', name: 'Chaotic Gremlin', icon: '⚡', desc: 'Unpredictable, wild, and loves insane sacrifices', sample: "Push pawns like the keyboard is on fire! CHAOS REIGNS!" },
];

const ANIMATION_PREVIEWS: AnimationState[] = [
  'idle', 'thinking', 'happy', 'shocked', 'facepalm', 'celebrating', 'victory', 'defeat'
];

export default function CompanionStudioPage() {
  const {
    character, setCharacter,
    headwear, setHeadwear,
    accessory, setAccessory,
    palette, setPalette,
    personality, setPersonality,
    voicePitch, setVoicePitch,
    voiceRate, setVoiceRate,
  } = useCompanion();

  const [activeTab, setActiveTab] = useState<'character' | 'outfits' | 'personality' | 'voice'>('character');
  const [testState, setTestState] = useState<AnimationState>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const testVoice = (text?: string) => {
    const p = PERSONALITIES.find(x => x.id === personality);
    const line = text || p?.sample || "Hello! I am ready to play chess!";
    companionVoice.speak(line, personality, () => setIsSpeaking(true), () => setIsSpeaking(false));
  };

  const handleSave = () => {
    setSaveToast(true);
    testVoice("Customization saved! Looking sharp!");
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#2a2a2a] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎨</span>
            <h1 className="text-2xl font-bold text-gray-100">Companion Studio</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-mono">
              PHASE 4 COMPLETE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Customize your companion's appearance, outfits, personality, and neural voice.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={handleSave}>
            Save & Apply to Game
          </Button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Column: Live 2D Interactive Stage Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full relative rounded-2xl border border-[#2a2a2a] bg-gradient-to-b from-[#1e1e24] to-[#121316] p-8 flex flex-col items-center justify-center shadow-2xl overflow-hidden min-h-[380px]">
            {/* Ambient Backdrop Spotlight */}
            <div
              className="absolute w-56 h-56 rounded-full blur-3xl opacity-30 pointer-events-none transition-colors duration-500"
              style={{ backgroundColor: PALETTES.find(p => p.id === palette)?.hex || '#22c55e' }}
            />

            {/* Stage Pedestal */}
            <div className="relative z-10 flex flex-col items-center">
              <CompanionAvatar
                state={testState}
                isSpeaking={isSpeaking}
                size={140}
                character={character}
                headwear={headwear}
                accessory={accessory}
                palette={palette}
              />
              <div className="w-32 h-4 rounded-full bg-black/40 blur-sm mt-3" />
            </div>

            {/* Character Name Tag */}
            <div className="relative z-10 mt-4 text-center">
              <h2 className="text-lg font-bold text-gray-100 flex items-center justify-center gap-2">
                {CHARACTERS.find(c => c.id === character)?.name}
                <span className="text-xs font-normal text-gray-400">
                  ({PERSONALITIES.find(p => p.id === personality)?.name})
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {CHARACTERS.find(c => c.id === character)?.desc}
              </p>
            </div>
          </div>

          {/* Animation Tester Controls */}
          <div className="w-full mt-4 p-4 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2.5">
              🎭 Test Animation Expressions
            </span>
            <div className="grid grid-cols-4 gap-2">
              {ANIMATION_PREVIEWS.map((st) => (
                <button
                  key={st}
                  onClick={() => setTestState(st)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                    testState === st
                      ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                      : 'bg-[#242424] text-gray-300 hover:bg-[#2e2e2e]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Customization Controls & Tabs */}
        <div className="lg:col-span-7 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-[#2a2a2a] gap-2 pb-2">
            {[
              { id: 'character', label: 'Character & Color', icon: '🤖' },
              { id: 'outfits', label: 'Hats & Accessories', icon: '🎩' },
              { id: 'personality', label: 'Personality', icon: '🧠' },
              { id: 'voice', label: 'Voice Tuning', icon: '🔊' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#242424]'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6 flex-1">
            {/* 1. Character & Color Tab */}
            {activeTab === 'character' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    Choose Companion Character
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CHARACTERS.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setCharacter(c.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          character === c.id
                            ? 'bg-green-500/10 border-green-500/50 shadow-md'
                            : 'bg-[#1e1e24] border-[#2a2a2a] hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl font-bold font-mono text-green-400">{c.icon}</span>
                          <span className="text-sm font-bold text-gray-200">{c.name}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{c.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    Color Palette
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {PALETTES.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPalette(p.id)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                          palette === p.id
                            ? 'bg-white/10 border-white text-white shadow-md'
                            : 'bg-[#1e1e24] border-[#2a2a2a] text-gray-300 hover:bg-[#282830]'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: p.hex }} />
                        <span>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Outfits & Accessories Tab */}
            {activeTab === 'outfits' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    Headwear & Hats
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {HEADWEARS.map((h) => (
                      <div
                        key={h.id}
                        onClick={() => setHeadwear(h.id)}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                          headwear === h.id
                            ? 'bg-green-500/15 border-green-500 text-green-400'
                            : 'bg-[#1e1e24] border-[#2a2a2a] text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <span className="text-xl">{h.icon}</span>
                        <span className="text-xs font-semibold">{h.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    Accessories
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {ACCESSORIES.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => setAccessory(a.id)}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                          accessory === a.id
                            ? 'bg-green-500/15 border-green-500 text-green-400'
                            : 'bg-[#1e1e24] border-[#2a2a2a] text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <span className="text-xl">{a.icon}</span>
                        <span className="text-xs font-semibold">{a.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Personality Tab */}
            {activeTab === 'personality' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Select Personality
                </h3>
                {PERSONALITIES.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setPersonality(p.id);
                      testVoice(p.sample);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                      personality === p.id
                        ? 'bg-green-500/10 border-green-500 shadow-md'
                        : 'bg-[#1e1e24] border-[#2a2a2a] hover:border-gray-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{p.icon}</span>
                        <h4 className="text-sm font-bold text-gray-100">{p.name}</h4>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{p.desc}</p>
                      <p className="text-xs italic text-gray-500 mt-2">"{p.sample}"</p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPersonality(p.id);
                        testVoice(p.sample);
                      }}
                      className="px-2.5 py-1 rounded bg-[#2a2a2a] hover:bg-[#333] text-gray-300 text-xs flex items-center gap-1"
                    >
                      <span>🔊</span>
                      <span>Preview</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 4. Voice Tuning Tab */}
            {activeTab === 'voice' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl border border-[#2a2a2a] bg-[#1e1e24] space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300 font-medium">Voice Pitch:</span>
                      <span className="font-mono text-green-400">{voicePitch.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.1"
                      value={voicePitch}
                      onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                      className="w-full accent-green-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300 font-medium">Speaking Rate:</span>
                      <span className="font-mono text-green-400">{voiceRate.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.7"
                      max="1.3"
                      step="0.05"
                      value={voiceRate}
                      onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                      className="w-full accent-green-500"
                    />
                  </div>

                  <div className="pt-2">
                    <Button variant="secondary" size="sm" onClick={() => testVoice()}>
                      🔊 Test Voice Cadence
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Toast Notification */}
      {saveToast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-green-500 text-neutral-900 font-bold text-xs shadow-2xl flex items-center gap-2"
        >
          <span>✓</span>
          <span>Companion Customization Saved & Applied!</span>
        </motion.div>
      )}
    </div>
  );
}
