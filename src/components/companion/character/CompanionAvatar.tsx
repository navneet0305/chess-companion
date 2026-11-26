'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { AnimationState } from '../../../types/companion';
import type { HeadwearType, AccessoryType, ColorPalette, CharacterBase } from '../../../contexts/CompanionContext';
import type { CompanionSkitId } from '../../../lib/companionBets';
import Companion3D from './Companion3D';

interface CompanionAvatarProps {
  state: AnimationState;
  skit?: CompanionSkitId;
  freeRoam?: boolean;
  framed?: boolean;
  onClick?: () => void;
  isSpeaking?: boolean;
  size?: number;
  character?: CharacterBase;
  headwear?: HeadwearType;
  accessory?: AccessoryType;
  palette?: ColorPalette;
}

// Clothing color themes matching user's selected palette
const CLOTHING_THEMES: Record<ColorPalette, {
  jacket: string;
  jacketDark: string;
  trim: string;
  shirt: string;
  pants: string;
  shoes: string;
}> = {
  mint:   { jacket: '#15803d', jacketDark: '#14532d', trim: '#4ade80', shirt: '#f8fafc', pants: '#1e293b', shoes: '#22c55e' },
  cyan:   { jacket: '#0369a1', jacketDark: '#0c4a6e', trim: '#38bdf8', shirt: '#f8fafc', pants: '#0f172a', shoes: '#0284c7' },
  ruby:   { jacket: '#b91c1c', jacketDark: '#7f1d1d', trim: '#f87171', shirt: '#18181b', pants: '#1e293b', shoes: '#ef4444' },
  gold:   { jacket: '#b45309', jacketDark: '#78350f', trim: '#fbbf24', shirt: '#fffbeb', pants: '#292524', shoes: '#d97706' },
  purple: { jacket: '#6b21a8', jacketDark: '#4c1d95', trim: '#c084fc', shirt: '#faf5ff', pants: '#1e1b4b', shoes: '#9333ea' },
};

// Character specific human & anime profiles
export const CHARACTER_PROFILES: Record<CharacterBase, {
  name: string;
  title: string;
  skin: string;
  skinShadow: string;
  hair: string;
  hairStyle: 'luffy' | 'zoro' | 'gojo' | 'oscar' | 'prodigy' | 'buzz' | 'scholar' | 'regal';
  collarStyle: 'luffy_vest' | 'zoro_robe' | 'gojo_uniform' | 'turtleneck' | 'hoodie' | 'trench' | 'jacket' | 'suit' | 'blazer';
  hasMustache?: boolean;
}> = {
  bruno: {
    name: 'Bruno',
    title: 'COMEDY MAESTRO 🎭',
    skin: '#d99b66', // Warm expressive human skin
    skinShadow: '#92400e',
    hair: '#1c1917', // Expressive dark maestro hair
    hairStyle: 'oscar',
    collarStyle: 'turtleneck',
    hasMustache: true,
  },
  luffy: {
    name: 'Monkey D. Luffy',
    title: 'PIRATE KING 👒',
    skin: '#fed7aa', // Warm sun-kissed anime skin
    skinShadow: '#f97316',
    hair: '#111827', // Jet black spiky anime hair
    hairStyle: 'luffy',
    collarStyle: 'luffy_vest',
  },
  zoro: {
    name: 'Roronoa Zoro',
    title: 'SWORD MASTER ⚔️',
    skin: '#fed7aa',
    skinShadow: '#ea580c',
    hair: '#22c55e', // Iconic moss-green anime hair
    hairStyle: 'zoro',
    collarStyle: 'zoro_robe',
  },
  gojo: {
    name: 'Satoru Gojo',
    title: 'LIMITLESS 👁️',
    skin: '#ffedd5', // Alabaster anime skin
    skinShadow: '#fdba74',
    hair: '#f8fafc', // Spiky snow-white hair
    hairStyle: 'gojo',
    collarStyle: 'gojo_uniform',
  },
  mateo: {
    name: 'Mateo',
    title: 'GRAND MAESTRO',
    skin: '#c68642',
    skinShadow: '#78350f',
    hair: '#171717',
    hairStyle: 'oscar',
    collarStyle: 'turtleneck',
    hasMustache: true,
  },
  oscar: {
    name: 'Mateo',
    title: 'GRAND MAESTRO',
    skin: '#c68642',
    skinShadow: '#78350f',
    hair: '#171717',
    hairStyle: 'oscar',
    collarStyle: 'turtleneck',
    hasMustache: true,
  },
  gambit: {
    name: 'Gambit',
    title: 'PRODIGY',
    skin: '#fed7aa',
    skinShadow: '#c2410c',
    hair: '#3f2212',
    hairStyle: 'prodigy',
    collarStyle: 'hoodie',
  },
  rookus: {
    name: 'Rookus',
    title: 'COMMANDER',
    skin: '#f5d0b5',
    skinShadow: '#9a3412',
    hair: '#1e293b',
    hairStyle: 'buzz',
    collarStyle: 'trench',
  },
  knightly: {
    name: 'Sir Knightly',
    title: 'KNIGHT',
    skin: '#fde047',
    skinShadow: '#a16207',
    hair: '#d97706',
    hairStyle: 'prodigy',
    collarStyle: 'jacket',
  },
  bishop: {
    name: 'Bishop Barnaby',
    title: 'PROFESSOR',
    skin: '#fed7aa',
    skinShadow: '#c2410c',
    hair: '#94a3b8',
    hairStyle: 'scholar',
    collarStyle: 'suit',
  },
  queenie: {
    name: 'Queenie',
    title: 'CHAMPION',
    skin: '#fcd34d',
    skinShadow: '#b45309',
    hair: '#172554',
    hairStyle: 'regal',
    collarStyle: 'blazer',
  },
};

export default function CompanionAvatar({
  state = 'idle',
  skit = 'none',
  freeRoam = false,
  framed = false,
  onClick,
  isSpeaking = false,
  size = 96,
  character = 'bruno',
  headwear = 'none',
  accessory = 'none',
  palette = 'ruby',
}: CompanionAvatarProps) {
  // Render real-time interactive 3D Bruno companion with free movement & condition skits
  if (character === 'bruno' || character === 'mateo' || character === 'oscar') {
    const isShocked = state === 'shocked' || state === 'facepalm' || state === 'nervous';
    const isHyped = state === 'happy' || state === 'excited' || state === 'celebrating' || state === 'victory';

    if (!framed) {
      return (
        <div
          style={{ width: size, height: size }}
          className="relative flex items-center justify-center overflow-visible select-none"
        >
          {/* Ambient floor shadow under shoes so full-body 3D Bruno stands cleanly without a card frame */}
          <div
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[56%] h-3 rounded-full blur-sm pointer-events-none transition-all duration-300"
            style={{
              background: isSpeaking
                ? 'radial-gradient(ellipse at center, rgba(34,197,94,0.45), rgba(0,0,0,0.6) 65%, transparent)'
                : isShocked
                ? 'radial-gradient(ellipse at center, rgba(244,63,94,0.4), rgba(0,0,0,0.6) 65%, transparent)'
                : isHyped
                ? 'radial-gradient(ellipse at center, rgba(250,204,21,0.4), rgba(0,0,0,0.6) 65%, transparent)'
                : 'radial-gradient(ellipse at center, rgba(0,0,0,0.65), transparent 70%)',
            }}
          />
          <div className="relative z-10 drop-shadow-[0_10px_18px_rgba(0,0,0,0.65)]">
            <Companion3D
              state={state}
              skit={skit}
              isSpeaking={isSpeaking}
              size={size}
              freeRoam={freeRoam}
              onClick={onClick}
            />
          </div>
        </div>
      );
    }

    return (
      <div
        style={{ width: size, height: size }}
        className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#363948] bg-gradient-to-b from-[#1e212b] to-[#121318] select-none"
      >
        <Companion3D
          state={state}
          skit={skit}
          isSpeaking={isSpeaking}
          size={size}
          freeRoam={freeRoam}
          onClick={onClick}
        />

        {/* Subtle Mood Rim Glow */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            boxShadow: isSpeaking
              ? 'inset 0 0 18px rgba(34, 197, 94, 0.45)'
              : isShocked
              ? 'inset 0 0 18px rgba(244, 63, 94, 0.4)'
              : isHyped
              ? 'inset 0 0 18px rgba(250, 204, 21, 0.35)'
              : 'inset 0 0 14px rgba(0, 0, 0, 0.45)',
          }}
        />
      </div>
    );
  }

  const profile = CHARACTER_PROFILES[character] || CHARACTER_PROFILES.luffy;
  const cloth = CLOTHING_THEMES[palette] || CLOTHING_THEMES.ruby;

  // Character Type Helpers
  const isLuffy = character === 'luffy';
  const isZoro = character === 'zoro';
  const isGojo = character === 'gojo';
  const isMateo = false;

  // Dynamic colors for clothing
  const vestColor = isLuffy ? '#dc2626' : isZoro ? '#14532d' : isGojo ? '#0f172a' : isMateo ? '#881337' : cloth.jacket;
  const vestDark = isLuffy ? '#991b1b' : isZoro ? '#052e16' : isGojo ? '#020617' : isMateo ? '#4c0519' : cloth.jacketDark;
  const pantsColor = isLuffy ? '#2563eb' : isZoro ? '#064e3b' : isGojo ? '#0f172a' : isMateo ? '#18181b' : cloth.pants;
  const shoesColor = isLuffy ? '#b45309' : isZoro ? '#0f172a' : isGojo ? '#18181b' : isMateo ? '#27272a' : cloth.shoes;

  // Dynamic Shonen Anime Animation Variants
  const rootVariants = {
    idle: {
      y: [0, -3.5, 0],
      rotate: [0, 0.8, 0, -0.8, 0],
      transition: { repeat: Infinity, duration: 2.8, ease: 'easeInOut' },
    },
    thinking: {
      y: [0, -4, 0, -2, 0],
      rotate: [0, 5, 2, 5, 0],
      transition: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' },
    },
    happy: {
      y: [0, -12, 0, -6, 0],
      rotate: [0, 5, -5, 3, -3, 0],
      scale: [1, 1.1, 1],
      transition: { repeat: Infinity, duration: 0.75, ease: 'easeInOut' },
    },
    excited: {
      y: [0, -16, 0, -10, 0],
      scale: [1, 1.18, 1.05, 1.12, 1],
      rotate: [0, -6, 6, -3, 3, 0],
      transition: { repeat: Infinity, duration: 0.65, ease: 'easeOut' },
    },
    shocked: {
      x: [-6, 6, -5, 5, -3, 3, 0],
      y: [-8, 2, -5, 0],
      scale: [1, 1.25, 1.1, 1],
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    sad: {
      y: [0, 5, 2, 5, 0],
      rotate: [0, -3, 0, -2, 0],
      scale: [1, 0.96, 1],
      transition: { repeat: Infinity, duration: 3.0, ease: 'easeInOut' },
    },
    disappointed: {
      y: [0, 7, 4],
      rotate: [0, -10, -6],
      scale: [1, 0.95, 0.96],
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    facepalm: {
      y: [0, -8, 6, 3],
      rotate: [0, -14, 10, -6],
      scale: [1, 1.12, 0.96, 1],
      transition: { duration: 0.65, ease: 'easeOut' },
    },
    nervous: {
      x: [-3, 3, -3, 3, -1, 1, 0],
      y: [0, -2, 0],
      scale: [1, 0.98, 1.02, 1],
      transition: { repeat: Infinity, duration: 0.2, ease: 'linear' },
    },
    confident: {
      y: [0, -5, 0],
      rotate: [0, 3, 0],
      scale: [1, 1.08, 1],
      transition: { repeat: Infinity, duration: 2.0, ease: 'easeInOut' },
    },
    celebrating: {
      y: [0, -22, -4, -16, 0],
      rotate: [0, -10, 10, -6, 6, 0],
      scale: [1, 1.22, 1.05, 1.16, 1],
      transition: { repeat: Infinity, duration: 0.95, ease: 'easeInOut' },
    },
    victory: {
      y: [0, -26, -5, -18, 0],
      rotate: [0, -12, 12, -6, 6, 0],
      scale: [1, 1.25, 1.08, 1.18, 1],
      transition: { repeat: Infinity, duration: 1.0, ease: 'easeInOut' },
    },
    defeat: {
      y: [0, 8, 6],
      rotate: [0, 12, 10],
      scale: [1, 0.92, 0.94],
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
      variants={rootVariants}
      animate={state}
    >
      <svg
        viewBox="0 0 100 115"
        width={size}
        height={size * 1.15}
        className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] overflow-visible"
      >
        <defs>
          {/* Straw Hat Weave Gradient */}
          <linearGradient id="strawHatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>

          {/* Straw Hat Ribbon Band */}
          <linearGradient id="hatRibbonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>

          {/* Luffy Red Vest Gradient */}
          <linearGradient id="luffyVestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>

          {/* Yellow Sash Gradient */}
          <linearGradient id="yellowSashGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Gojo Celestial Six Eyes Radiant Gradient */}
          <radialGradient id="sixEyesGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#7dd3fc" />
            <stop offset="70%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </radialGradient>

          {/* Gojo Dark High Uniform */}
          <linearGradient id="gojoUniformGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="60%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Zoro Green Coat Gradient */}
          <linearGradient id="zoroCoatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="60%" stopColor="#14532d" />
            <stop offset="100%" stopColor="#052e16" />
          </linearGradient>

          {/* Zoro Haramaki Belly Wrap */}
          <linearGradient id="zoroHaramakiGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="50%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>

          {/* Gold for Accessories */}
          <linearGradient id="goldAnime" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>

          {/* Anime Soft Shadow */}
          <filter id="animeSoftShadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000000" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* ─── LEGS & PANTS (Luffy Blue Shorts, Zoro Trousers, Gojo Uniform) ─── */}
        <g id="lower-body">
          {isLuffy ? (
            /* Luffy's iconic blue pirate shorts with white fleece cuffs & sandals */
            <>
              {/* Left Leg */}
              <rect x="36" y="84" width="11" height="15" rx="3" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1.2" />
              {/* Left Fluffy White Cuff */}
              <rect x="34" y="97" width="15" height="3.5" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
              {/* Left Bare Shin & Straw Sandal */}
              <rect x="38" y="100.5" width="7" height="6.5" fill={profile.skin} stroke={profile.skinShadow} strokeWidth="0.8" />
              <path d="M34 107 C34 104 49 104 49 107 L50 110 C50 111 33 111 33 110 Z" fill="#d97706" stroke="#92400e" strokeWidth="1" />
              {/* Sandal X-Strap */}
              <line x1="37" y1="106" x2="45" y2="108" stroke="#78350f" strokeWidth="1" />
              <line x1="45" y1="106" x2="37" y2="108" stroke="#78350f" strokeWidth="1" />

              {/* Right Leg */}
              <rect x="53" y="84" width="11" height="15" rx="3" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1.2" />
              {/* Right Fluffy White Cuff */}
              <rect x="51" y="97" width="15" height="3.5" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
              {/* Right Bare Shin & Straw Sandal */}
              <rect x="55" y="100.5" width="7" height="6.5" fill={profile.skin} stroke={profile.skinShadow} strokeWidth="0.8" />
              <path d="M51 107 C51 104 66 104 66 107 L67 110 C67 111 50 111 50 110 Z" fill="#d97706" stroke="#92400e" strokeWidth="1" />
              <line x1="54" y1="106" x2="62" y2="108" stroke="#78350f" strokeWidth="1" />
              <line x1="62" y1="106" x2="54" y2="108" stroke="#78350f" strokeWidth="1" />
            </>
          ) : (
            /* Zoro / Gojo / Other trousers & shoes */
            <>
              <rect x="36" y="84" width="11" height="19" rx="3" fill={pantsColor} stroke="#09090b" strokeWidth="1" />
              <rect x="53" y="84" width="11" height="19" rx="3" fill={pantsColor} stroke="#09090b" strokeWidth="1" />

              {/* Left Shoe */}
              <path d="M33 103 C33 100 48 100 48 103 L49 108 C49 110 32 110 32 108 Z" fill={shoesColor} stroke="#09090b" strokeWidth="1.2" />
              <rect x="32" y="107" width="17" height="2.5" rx="1" fill="#3f3f46" />

              {/* Right Shoe */}
              <path d="M52 103 C52 100 67 100 67 103 L68 108 C68 110 51 110 51 108 Z" fill={shoesColor} stroke="#09090b" strokeWidth="1.2" />
              <rect x="51" y="107" width="17" height="2.5" rx="1" fill="#3f3f46" />
            </>
          )}
        </g>

        {/* ─── TORSO & ANIME ATTIRE ─── */}
        <g id="torso-clothing">
          {isLuffy ? (
            /* LUFFY'S OPEN RED VEST, MUSCULAR CHEST WITH X-SCAR & YELLOW SASH */
            <>
              {/* Bare Anime Chest / Abdomen */}
              <path
                d="M32 52 C30 68 31 82 34 85 C38 87 62 87 66 85 C69 82 70 68 68 52 Z"
                fill={profile.skin}
                stroke={profile.skinShadow}
                strokeWidth="1.5"
              />

              {/* Pectoral Muscle Contours & Clavicle */}
              <path d="M42 56 Q50 60 58 56" fill="none" stroke={profile.skinShadow} strokeWidth="1.2" strokeLinecap="round" />
              <path d="M44 65 Q50 68 56 65" fill="none" stroke={profile.skinShadow} strokeWidth="1" strokeLinecap="round" />
              <line x1="50" y1="62" x2="50" y2="82" stroke={profile.skinShadow} strokeWidth="1" strokeLinecap="round" opacity="0.6" />

              {/* LUFFY'S ICONIC CROSS X-SCAR ACROSS CHEST */}
              <g id="luffy-chest-scar">
                <path d="M41 57 L59 74" stroke="#b91c1c" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M59 57 L41 74" stroke="#b91c1c" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M41 57 L59 74" stroke="#7f1d1d" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M59 57 L41 74" stroke="#7f1d1d" strokeWidth="1.4" strokeLinecap="round" />
                {/* Stitch hash accents */}
                <line x1="43" y1="58" x2="45" y2="61" stroke="#991b1b" strokeWidth="0.8" />
                <line x1="55" y1="70" x2="57" y2="73" stroke="#991b1b" strokeWidth="0.8" />
              </g>

              {/* Open Red Pirate Vest Panels */}
              {/* Left Vest Flap */}
              <path
                d="M30 52 C28 66 30 78 33 84 L41 84 L39 52 Z"
                fill="url(#luffyVestGrad)"
                stroke="#991b1b"
                strokeWidth="1.5"
              />
              {/* Gold Button on Left Flap */}
              <circle cx="36" cy="62" r="1.5" fill="url(#goldAnime)" stroke="#ca8a04" strokeWidth="0.5" />
              <circle cx="36" cy="72" r="1.5" fill="url(#goldAnime)" stroke="#ca8a04" strokeWidth="0.5" />

              {/* Right Vest Flap */}
              <path
                d="M70 52 C72 66 70 78 67 84 L59 84 L61 52 Z"
                fill="url(#luffyVestGrad)"
                stroke="#991b1b"
                strokeWidth="1.5"
              />

              {/* LUFFY'S BROAD YELLOW SASH BELT */}
              <rect x="32" y="80" width="36" height="5.5" rx="1.5" fill="url(#yellowSashGrad)" stroke="#ca8a04" strokeWidth="1.2" />
              {/* Sash Knot & Hanging Tails */}
              <circle cx="38" cy="83" r="2.2" fill="#eab308" stroke="#ca8a04" strokeWidth="0.8" />
              <path d="M37 84 L35 93 L38 93 L39 84 Z" fill="url(#yellowSashGrad)" stroke="#ca8a04" strokeWidth="0.8" />
              <path d="M39 84 L38 95 L41 95 L41 84 Z" fill="url(#yellowSashGrad)" stroke="#ca8a04" strokeWidth="0.8" />
            </>
          ) : isZoro ? (
            /* ZORO'S DARK GREEN COAT, LIGHT GREEN HARAMAKI & THREE KATANAS */
            <>
              {/* Inner chest */}
              <polygon points="46,52 54,52 52,66 48,66" fill={profile.skin} />
              {/* Zoro Chest Diagonal Scar */}
              <line x1="43" y1="53" x2="55" y2="67" stroke="#b91c1c" strokeWidth="1.8" strokeLinecap="round" />

              {/* Zoro Dark Green Coat */}
              <path
                d="M31 52 C29 66 30 82 34 86 C38 88 62 88 66 86 C70 82 71 66 69 52 Z"
                fill="url(#zoroCoatGrad)"
                stroke="#052e16"
                strokeWidth="1.8"
              />
              {/* Coat Lapels */}
              <polygon points="34,52 46,52 44,70 36,70" fill="#15803d" stroke="#052e16" strokeWidth="1" />
              <polygon points="66,52 54,52 56,70 64,70" fill="#15803d" stroke="#052e16" strokeWidth="1" />

              {/* Zoro's Iconic Light Green Ribbed Haramaki */}
              <rect x="33" y="69" width="34" height="15" rx="2" fill="url(#zoroHaramakiGrad)" stroke="#15803d" strokeWidth="1.2" />
              <line x1="34" y1="73" x2="66" y2="73" stroke="#16a34a" strokeWidth="0.8" />
              <line x1="34" y1="77" x2="66" y2="77" stroke="#16a34a" strokeWidth="0.8" />
              <line x1="34" y1="81" x2="66" y2="81" stroke="#16a34a" strokeWidth="0.8" />

              {/* 3 KATANAS STRAPPED AT HIP (White Wado Ichimonji, Red Kitetsu, Black Shusui) */}
              <g id="zoro-swords">
                {/* Sword 1 (Wado Ichimonji - White) */}
                <line x1="64" y1="68" x2="76" y2="84" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                <rect x="63" y="67" width="3" height="3" fill="#ca8a04" />
                {/* Sword 2 (Sandai Kitetsu - Red) */}
                <line x1="66" y1="69" x2="78" y2="85" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
                {/* Sword 3 (Shusui / Enma - Dark Purple/Black) */}
                <line x1="68" y1="70" x2="80" y2="86" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            </>
          ) : isGojo ? (
            /* GOJO SATORU'S HIGH-COLLARED JUJUTSU HIGH UNIFORM */
            <>
              {/* High Collared Dark Jacket Body */}
              <path
                d="M31 50 C29 66 30 82 34 86 C38 88 62 88 66 86 C70 82 71 66 69 50 Z"
                fill="url(#gojoUniformGrad)"
                stroke="#020617"
                strokeWidth="1.8"
              />
              {/* High Stiff Standing Collar */}
              <path d="M42 45 L42 53 L58 53 L58 45 Z" fill="#0f172a" stroke="#020617" strokeWidth="1.2" />
              <line x1="50" y1="46" x2="50" y2="86" stroke="#020617" strokeWidth="1.5" />
              {/* Jujutsu High Golden Swirl Button */}
              <circle cx="48" cy="51" r="2" fill="url(#goldAnime)" stroke="#ca8a04" strokeWidth="0.8" />
              <path d="M47.2 51 Q48 50.2 48.8 51" fill="none" stroke="#713f12" strokeWidth="0.6" />
            </>
          ) : (
            /* Mateo / Standard characters */
            <>
              <path
                d="M31 52 C29 66 30 82 34 86 C38 88 62 88 66 86 C70 82 71 66 69 52 Z"
                fill={vestColor}
                stroke={vestDark}
                strokeWidth="1.8"
              />
              <rect x="42" y="44" width="16" height="11" rx="3" fill="#be123c" stroke="#4c0519" strokeWidth="1" />
            </>
          )}
        </g>

        {/* ─── ANIME ARMS & GESTURES ─── */}
        <g id="human-arms">
          {state === 'facepalm' ? (
            /* FACEPALM: Comedic Anime Slap */
            <>
              <path d="M32 56 Q22 66 28 76" fill="none" stroke={isLuffy ? profile.skin : vestColor} strokeWidth="6.5" strokeLinecap="round" />
              <circle cx="28" cy="77" r="4" fill={profile.skin} stroke={profile.skinShadow} strokeWidth="0.8" />

              <path d="M68 58 Q80 44 56 32" fill="none" stroke={isLuffy ? profile.skin : vestColor} strokeWidth="6.5" strokeLinecap="round" />
              <ellipse cx="53" cy="30" rx="5" ry="4.5" fill={profile.skin} stroke={profile.skinShadow} strokeWidth="1" />
              <line x1="49" y1="28" x2="55" y2="28" stroke={profile.skinShadow} strokeWidth="0.8" />
              <line x1="49" y1="31" x2="56" y2="31" stroke={profile.skinShadow} strokeWidth="0.8" />
            </>
          ) : state === 'celebrating' || state === 'victory' ? (
            /* CELEBRATING: Dual Anime Fist Pump Raised High \o/ */
            <>
              <motion.path
                d="M32 56 Q18 40 18 18"
                fill="none"
                stroke={isLuffy ? profile.skin : vestColor}
                strokeWidth="6.5"
                strokeLinecap="round"
                animate={{ d: ["M32 56 Q18 40 18 18", "M32 56 Q16 36 16 14", "M32 56 Q18 40 18 18"] }}
                transition={{ repeat: Infinity, duration: 0.55 }}
              />
              <circle cx="18" cy="17" r="4.5" fill={profile.skin} stroke={profile.skinShadow} strokeWidth="0.8" />

              <motion.path
                d="M68 56 Q82 40 82 18"
                fill="none"
                stroke={isLuffy ? profile.skin : vestColor}
                strokeWidth="6.5"
                strokeLinecap="round"
                animate={{ d: ["M68 56 Q82 40 82 18", "M68 56 Q84 36 84 14", "M68 56 Q82 40 82 18"] }}
                transition={{ repeat: Infinity, duration: 0.55 }}
              />
              <circle cx="82" cy="17" r="4.5" fill={profile.skin} stroke={profile.skinShadow} strokeWidth="0.8" />
            </>
          ) : state === 'thinking' ? (
            /* THINKING: Tapping Head / Chewing Gum or Meat */
            <>
              <path d="M32 56 Q24 70 42 74" fill="none" stroke={isLuffy ? profile.skin : vestColor} strokeWidth="6.5" strokeLinecap="round" />
              <circle cx="42" cy="74" r="4" fill={profile.skin} stroke={profile.skinShadow} strokeWidth="0.8" />

              {/* Arm reaching up to tap temple */}
              <motion.path
                d="M68 56 Q78 50 62 36"
                fill="none"
                stroke={isLuffy ? profile.skin : vestColor}
                strokeWidth="6.5"
                strokeLinecap="round"
                animate={{ d: ["M68 56 Q78 50 62 36", "M68 56 Q80 48 60 34", "M68 56 Q78 50 62 36"] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              />
              <circle cx="62" cy="35" r="4" fill={profile.skin} stroke={profile.skinShadow} strokeWidth="0.8" />
            </>
          ) : state === 'shocked' ? (
            /* SHOCKED: Hands on Cheeks */
            <>
              <motion.path
                d="M32 56 Q16 50 24 36"
                fill="none"
                stroke={isLuffy ? profile.skin : vestColor}
                strokeWidth="6.5"
                strokeLinecap="round"
                animate={{ d: ["M32 56 Q16 50 24 36", "M32 56 Q14 48 22 34", "M32 56 Q16 50 24 36"] }}
                transition={{ repeat: Infinity, duration: 0.2 }}
              />
              <circle cx="25" cy="36" r="4.5" fill={profile.skin} stroke={profile.skinShadow} strokeWidth="0.8" />

              <motion.path
                d="M68 56 Q84 50 76 36"
                fill="none"
                stroke={isLuffy ? profile.skin : vestColor}
                strokeWidth="6.5"
                strokeLinecap="round"
                animate={{ d: ["M68 56 Q84 50 76 36", "M68 56 Q86 48 78 34", "M68 56 Q84 50 76 36"] }}
                transition={{ repeat: Infinity, duration: 0.2 }}
              />
              <circle cx="75" cy="36" r="4.5" fill={profile.skin} stroke={profile.skinShadow} strokeWidth="0.8" />
            </>
          ) : isGojo ? (
            /* GOJO SIGNATURE: "Domain Expansion: Infinite Void" Hand Gesture */
            <>
              <path d="M32 56 Q24 68 28 76" fill="none" stroke={vestColor} strokeWidth="6.5" strokeLinecap="round" />
              <circle cx="28" cy="77" r="4" fill={profile.skin} stroke={profile.skinShadow} strokeWidth="0.8" />

              {/* Hand raised with crossed fingers */}
              <path d="M68 56 Q78 52 60 44" fill="none" stroke={vestColor} strokeWidth="6.5" strokeLinecap="round" />
              {/* Crossed fingers (Index + Middle) */}
              <g id="gojo-hand-sign">
                <circle cx="60" cy="44" r="3.5" fill={profile.skin} stroke={profile.skinShadow} strokeWidth="0.6" />
                <line x1="58" y1="44" x2="60" y2="38" stroke={profile.skin} strokeWidth="2.2" strokeLinecap="round" />
                <line x1="60" y1="44" x2="58" y2="38" stroke={profile.skin} strokeWidth="2.2" strokeLinecap="round" />
                {/* Glowing Infinity Cursed Energy Sparkle */}
                <circle cx="59" cy="37" r="2.5" fill="#38bdf8" opacity="0.8" />
                <circle cx="59" cy="37" r="1.2" fill="#ffffff" />
              </g>
            </>
          ) : (
            /* IDLE: Confident Pirate / Swordsman Stance (Hands on Hips / Cheerful Pose) */
            <>
              <path d="M32 56 Q22 66 30 74" fill="none" stroke={isLuffy ? profile.skin : vestColor} strokeWidth="6.5" strokeLinecap="round" />
              <circle cx="31" cy="74" r="4" fill={profile.skin} stroke={profile.skinShadow} strokeWidth="0.8" />

              <path d="M68 56 Q78 66 70 74" fill="none" stroke={isLuffy ? profile.skin : vestColor} strokeWidth="6.5" strokeLinecap="round" />
              <circle cx="69" cy="74" r="4" fill={profile.skin} stroke={profile.skinShadow} strokeWidth="0.8" />
            </>
          )}
        </g>

        {/* ─── ANIME NECK ─── */}
        <rect x="46" y="46" width="8" height="9" rx="2" fill={profile.skinShadow} opacity="0.8" />

        {/* ─── ANIME HEAD & SCULPTED FACE ─── */}
        <g id="human-head">
          {/* Anime V-shaped Jawline & Head Contour */}
          <path
            d="M33 28 C33 16 67 16 67 28 C67 40 60 49 50 51 C40 49 33 40 33 28 Z"
            fill={profile.skin}
            stroke={profile.skinShadow}
            strokeWidth="1.2"
          />

          {/* Ears */}
          <ellipse cx="32" cy="32" rx="2.5" ry="4" fill={profile.skin} stroke={profile.skinShadow} strokeWidth="0.8" />
          <ellipse cx="68" cy="32" rx="2.5" ry="4" fill={profile.skin} stroke={profile.skinShadow} strokeWidth="0.8" />

          {/* ZORO'S 3 GOLDEN SWORD EARRINGS */}
          {isZoro && (
            <g id="zoro-earrings">
              <line x1="31" y1="34" x2="31" y2="40" stroke="url(#goldAnime)" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="29.5" y1="34.5" x2="29.5" y2="40.5" stroke="url(#goldAnime)" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="32.5" y1="34.5" x2="32.5" y2="40.5" stroke="url(#goldAnime)" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          )}

          {/* ─── ANIME HAIR STYLES (Luffy, Zoro, Gojo, Mateo) ─── */}
          <g id="hair">
            {isLuffy ? (
              /* LUFFY'S SPIKY JET-BLACK HAIR */
              <g id="hair-luffy">
                {/* Back hair tufts */}
                <path d="M28 26 C26 12 38 6 50 6 C62 6 74 12 72 26 Z" fill="#111827" />
                {/* Spiky hair locks breaking over forehead and temples */}
                <polygon points="30,26 34,32 36,25" fill="#111827" />
                <polygon points="36,25 40,30 43,24" fill="#111827" />
                <polygon points="44,24 48,29 51,23" fill="#111827" />
                <polygon points="52,23 55,29 59,24" fill="#111827" />
                <polygon points="59,24 63,30 67,25" fill="#111827" />
                <polygon points="67,25 70,32 72,26" fill="#111827" />
                {/* Hair sheen lines */}
                <path d="M38 18 Q50 14 62 18" fill="none" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            ) : isZoro ? (
              /* ZORO'S SPIKY MOSS-GREEN HAIR */
              <g id="hair-zoro">
                <path
                  d="M28 24 C27 8 40 4 50 4 C60 4 73 8 72 24 C68 20 62 18 50 19 C38 18 32 20 28 24 Z"
                  fill="#22c55e"
                  stroke="#15803d"
                  strokeWidth="1"
                />
                {/* Spiky lock layers */}
                <polygon points="32,22 36,12 40,20" fill="#22c55e" stroke="#15803d" strokeWidth="0.8" />
                <polygon points="41,19 46,9 50,18" fill="#22c55e" stroke="#15803d" strokeWidth="0.8" />
                <polygon points="50,18 55,9 59,19" fill="#22c55e" stroke="#15803d" strokeWidth="0.8" />
                <polygon points="60,20 64,12 68,22" fill="#22c55e" stroke="#15803d" strokeWidth="0.8" />
                {/* Green sheen */}
                <path d="M40 14 Q50 10 60 14" fill="none" stroke="#86efac" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            ) : isGojo ? (
              /* GOJO SATORU'S SPIKY SNOW-WHITE HAIR */
              <g id="hair-gojo">
                <path
                  d="M26 26 C25 6 42 2 50 2 C60 2 75 6 74 26 C70 18 62 16 50 17 C38 16 30 18 26 26 Z"
                  fill="#f8fafc"
                  stroke="#cbd5e1"
                  strokeWidth="1.2"
                />
                {/* Fluffy stylish white anime locks */}
                <polygon points="30,24 35,14 40,22" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
                <polygon points="41,20 47,8 51,19" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
                <polygon points="50,19 56,8 60,20" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
                <polygon points="61,22 66,14 71,24" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
                {/* Subtle sky-blue anime ambient bounce */}
                <path d="M38 14 Q50 9 62 14" fill="none" stroke="#bae6fd" strokeWidth="1.4" strokeLinecap="round" />
              </g>
            ) : isMateo ? (
              /* MATEO'S POMPADOUR HAIR */
              <g id="hair-mateo">
                <path d="M26 30 C24 10 38 4 50 4 C64 4 75 10 74 30 C70 19 60 17 50 18 C38 17 30 20 26 30 Z" fill="#171717" />
                <path d="M38 12 Q48 7 60 12" fill="none" stroke="#404040" strokeWidth="2" strokeLinecap="round" />
              </g>
            ) : (
              /* DEFAULT PRODIGY HAIR */
              <path
                d="M28 28 C26 12 40 6 50 6 C62 6 74 12 72 28 C69 22 66 20 62 21 C58 17 54 18 50 22 C46 17 40 18 36 22 C32 20 29 23 28 28 Z"
                fill={profile.hair}
              />
            )}
          </g>

          {/* ─── LUFFY'S ICONIC STRAWHATS (MUGIWARA) ─── */}
          {isLuffy && headwear === 'none' && (
            <g id="luffy-straw-hat" filter="url(#animeSoftShadow)">
              {/* Straw Hat Crown Dome */}
              <path
                d="M32 18 C32 4 68 4 68 18 Z"
                fill="url(#strawHatGrad)"
                stroke="#b45309"
                strokeWidth="1.2"
              />
              {/* Crown Weave Texture */}
              <path d="M40 8 Q50 6 60 8" fill="none" stroke="#eab308" strokeWidth="0.8" opacity="0.6" />
              <path d="M36 13 Q50 10 64 13" fill="none" stroke="#eab308" strokeWidth="0.8" opacity="0.6" />

              {/* Iconic Crimson Red Ribbon Band */}
              <path
                d="M31 18 Q50 14 69 18 L69 21 Q50 17 31 21 Z"
                fill="url(#hatRibbonGrad)"
                stroke="#7f1d1d"
                strokeWidth="0.8"
              />

              {/* Wide Straw Hat Brim */}
              <path
                d="M16 23 C22 17 78 17 84 23 C76 27 24 27 16 23 Z"
                fill="url(#strawHatGrad)"
                stroke="#b45309"
                strokeWidth="1.4"
              />
              {/* Brim edge trim */}
              <path d="M18 23 Q50 28 82 23" fill="none" stroke="#ca8a04" strokeWidth="1" />
            </g>
          )}

          {/* ─── GOJO'S ICONIC BLINDFOLD / CELESTIAL SIX EYES ─── */}
          {isGojo && (
            <g id="gojo-blindfold">
              {/* Black Fabric Blindfold Wrapping Across Face */}
              <path
                d="M33 24 C38 23 62 23 67 24 L68 33 C62 34 38 34 32 33 Z"
                fill="#0f172a"
                stroke="#020617"
                strokeWidth="1.2"
              />
              {/* Fabric tension wrinkles */}
              <path d="M36 27 Q50 29 64 27" fill="none" stroke="#334155" strokeWidth="0.8" />
              <path d="M38 30 Q50 32 62 30" fill="none" stroke="#1e293b" strokeWidth="1" />

              {/* In High Hype / Victory / Confident Mode: Blindfold lifts slightly revealing RADIANT SIX EYES! */}
              {(state === 'celebrating' || state === 'victory' || state === 'excited' || state === 'confident') && (
                <g id="gojo-six-eyes" filter="url(#animeSoftShadow)">
                  {/* Glowing Celestial Blue Eye */}
                  <ellipse cx="44" cy="28.5" rx="4.5" ry="3.8" fill="url(#sixEyesGlow)" stroke="#38bdf8" strokeWidth="1" />
                  {/* Cosmic Star Pupil */}
                  <circle cx="44" cy="28.5" r="1.5" fill="#0369a1" />
                  <circle cx="43.5" cy="27.8" r="0.8" fill="#ffffff" />
                  <text x="44" y="30" fontSize="5" fill="#ffffff" textAnchor="middle">✧</text>

                  {/* Aura Glow */}
                  <circle cx="44" cy="28.5" r="6" fill="#38bdf8" opacity="0.35" />
                </g>
              )}
            </g>
          )}

          {/* ─── ANIME EYEBROWS ─── */}
          {!isGojo && (
            <g id="eyebrows">
              {state === 'shocked' ? (
                <>
                  <path d="M36 21 Q41 15 47 21" fill="none" stroke="#1f2937" strokeWidth="2.4" strokeLinecap="round" />
                  <path d="M53 21 Q59 15 64 21" fill="none" stroke="#1f2937" strokeWidth="2.4" strokeLinecap="round" />
                </>
              ) : state === 'sad' || state === 'disappointed' ? (
                <>
                  <path d="M36 21 Q42 26 47 24" fill="none" stroke="#1f2937" strokeWidth="2.4" strokeLinecap="round" />
                  <path d="M53 24 Q58 26 64 21" fill="none" stroke="#1f2937" strokeWidth="2.4" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <path d="M37 22 Q42 19 47 23" fill="none" stroke="#1f2937" strokeWidth="2.4" strokeLinecap="round" />
                  <path d="M53 23 Q58 19 63 22" fill="none" stroke="#1f2937" strokeWidth="2.4" strokeLinecap="round" />
                </>
              )}
            </g>
          )}

          {/* ─── ANIME EYES & SCARS (Luffy Under-Eye Scar, Zoro Vertical Eye Scar) ─── */}
          {!isGojo && (
            <g id="anime-eyes">
              {isZoro ? (
                /* ZORO: Left eye closed with vertical scar, Right eye piercing swordsman gaze */
                <>
                  {/* Left Eye (Closed with Scar) */}
                  <path d="M37 29 Q42 32 47 29" fill="none" stroke="#09090b" strokeWidth="1.8" strokeLinecap="round" />
                  {/* Zoro Vertical Eye Scar Line */}
                  <line x1="42" y1="23" x2="42" y2="36" stroke="#991b1b" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="42" y1="23" x2="42" y2="36" stroke="#7f1d1d" strokeWidth="1" strokeLinecap="round" />

                  {/* Right Eye (Fierce Swordsman Gaze) */}
                  <ellipse cx="58" cy="29" rx="4.8" ry="3.5" fill="#ffffff" stroke="#09090b" strokeWidth="1.2" />
                  <circle cx="58" cy="29" r="2.2" fill="#15803d" stroke="#09090b" strokeWidth="0.6" />
                  <circle cx="58" cy="29" r="1.1" fill="#09090b" />
                  <circle cx="57.2" cy="28" r="0.8" fill="#ffffff" />
                  <path d="M53 27 Q58 25 63 27.5" fill="none" stroke="#09090b" strokeWidth="1.8" strokeLinecap="round" />
                </>
              ) : state === 'shocked' ? (
                /* Shocked Anime Eyes (Classic One Piece Pop-out Comedy) */
                <>
                  <circle cx="42" cy="29" r="6" fill="#ffffff" stroke="#1f2937" strokeWidth="1.6" />
                  <circle cx="42" cy="29" r="2.2" fill="#09090b" />
                  <circle cx="41" cy="28" r="1" fill="#ffffff" />

                  <circle cx="58" cy="29" r="6" fill="#ffffff" stroke="#1f2937" strokeWidth="1.6" />
                  <circle cx="58" cy="29" r="2.2" fill="#09090b" />
                  <circle cx="57" cy="28" r="1" fill="#ffffff" />
                </>
              ) : state === 'happy' || state === 'celebrating' || state === 'victory' ? (
                /* Joyful Curved Anime Eyes */
                <>
                  <path d="M37 30 Q42 22 47 30" fill="none" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
                  <path d="M53 30 Q58 22 63 30" fill="none" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
                </>
              ) : (
                /* Standard Shonen Anime Eyes with Big Catchlights */
                <>
                  {/* Left Eye */}
                  <ellipse cx="42" cy="29" rx="5" ry="4.5" fill="#ffffff" stroke="#1f2937" strokeWidth="1.4" />
                  <circle cx="42" cy="29" r="2.8" fill="#111827" />
                  <circle cx="40.8" cy="27.8" r="1.2" fill="#ffffff" />
                  <circle cx="43.2" cy="30.2" r="0.6" fill="#ffffff" />
                  {/* Upper Lash Line */}
                  <path d="M37 27 Q42 24 47 27" fill="none" stroke="#111827" strokeWidth="2.2" strokeLinecap="round" />

                  {/* Right Eye */}
                  <ellipse cx="58" cy="29" rx="5" ry="4.5" fill="#ffffff" stroke="#1f2937" strokeWidth="1.4" />
                  <circle cx="58" cy="29" r="2.8" fill="#111827" />
                  <circle cx="56.8" cy="27.8" r="1.2" fill="#ffffff" />
                  <circle cx="59.2" cy="30.2" r="0.6" fill="#ffffff" />
                  {/* Upper Lash Line */}
                  <path d="M53 27 Q58 24 63 27" fill="none" stroke="#111827" strokeWidth="2.2" strokeLinecap="round" />
                </>
              )}

              {/* LUFFY'S ICONIC UNDER-EYE SCAR (Two stitches under left eye) */}
              {isLuffy && (
                <g id="luffy-eye-scar">
                  <line x1="39" y1="35" x2="45" y2="35" stroke="#991b1b" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="40.5" y1="33.8" x2="40.5" y2="36.2" stroke="#991b1b" strokeWidth="1" />
                  <line x1="43.5" y1="33.8" x2="43.5" y2="36.2" stroke="#991b1b" strokeWidth="1" />
                </g>
              )}
            </g>
          )}

          {/* Cute Anime Nose */}
          <path d="M49 33 L50 35 L52 35" fill="none" stroke={profile.skinShadow} strokeWidth="1.4" strokeLinecap="round" />

          {/* Cheerful Anime Blush */}
          {(state === 'happy' || state === 'celebrating' || state === 'excited') && (
            <>
              <ellipse cx="36" cy="35" rx="3.5" ry="2" fill="#fb7185" opacity="0.6" />
              <line x1="34" y1="34" x2="38" y2="36" stroke="#f43f5e" strokeWidth="0.8" opacity="0.7" />
              <ellipse cx="64" cy="35" rx="3.5" ry="2" fill="#fb7185" opacity="0.6" />
              <line x1="62" y1="34" x2="66" y2="36" stroke="#f43f5e" strokeWidth="0.8" opacity="0.7" />
            </>
          )}

          {/* Mateo Mustache (Only if Mateo) */}
          {profile.hasMustache && (
            <path
              d="M50 37.5 C46 35.5 37 35.5 34 39.5 C38 42.5 45 40.5 49 38.5 C50 38.2 50 38.2 51 38.2 C55 40.5 62 42.5 66 39.5 C63 35.5 54 35.5 50 37.5 Z"
              fill="#171717"
              stroke="#09090b"
              strokeWidth="0.8"
            />
          )}

          {/* ─── ANIME MOUTH (Luffy Signature D-Grin, Zoro Smirk, Gojo Grin) ─── */}
          <g id="anime-mouth">
            {isSpeaking ? (
              <motion.ellipse
                cx="50"
                cy="42"
                rx={isLuffy ? 6.5 : 5}
                ry={4}
                fill="#881337"
                stroke="#1f2937"
                strokeWidth="1.2"
                animate={{ ry: [2, 5.5, 2] }}
                transition={{ repeat: Infinity, duration: 0.16 }}
              />
            ) : state === 'shocked' ? (
              /* Comedic Anime Jaw Drop */
              <g id="shocked-mouth">
                <rect x="44" y="39" width="12" height="12" rx="3" fill="#881337" stroke="#1f2937" strokeWidth="1.4" />
                <path d="M44 40 L56 40 L55 43 L45 43 Z" fill="#ffffff" />
                <ellipse cx="50" cy="48" rx="4" ry="2" fill="#e11d48" />
              </g>
            ) : state === 'happy' || state === 'celebrating' || state === 'victory' || isLuffy ? (
              /* LUFFY'S SIGNATURE WIDE TOOTHY D-SMILE! */
              <g id="luffy-d-smile">
                <path
                  d="M38 38 C42 48 58 48 62 38 Z"
                  fill="#ffffff"
                  stroke="#1f2937"
                  strokeWidth="1.4"
                />
                {/* Teeth Lines */}
                <line x1="44" y1="39" x2="44" y2="44" stroke="#e5e7eb" strokeWidth="0.8" />
                <line x1="50" y1="39" x2="50" y2="45" stroke="#e5e7eb" strokeWidth="0.8" />
                <line x1="56" y1="39" x2="56" y2="44" stroke="#e5e7eb" strokeWidth="0.8" />
                {/* Horizontal tooth separator line */}
                <path d="M40 41 Q50 43 60 41" fill="none" stroke="#d1d5db" strokeWidth="0.8" />
                {/* Smile Cheek Crease */}
                <path d="M37 37 Q36 39 38 41" fill="none" stroke="#1f2937" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M63 37 Q64 39 62 41" fill="none" stroke="#1f2937" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            ) : state === 'sad' || state === 'defeat' ? (
              <path d="M45 43 Q50 38 55 43" fill="none" stroke="#1f2937" strokeWidth="2.2" strokeLinecap="round" />
            ) : (
              /* Confident Anime Smirk */
              <path d="M46 40 Q50 44 55 39" fill="none" stroke="#1f2937" strokeWidth="2.0" strokeLinecap="round" />
            )}
          </g>
        </g>

        {/* ─── ACCESSORIES (Sunglasses, Bowtie, Medal, Scarf) ─── */}
        {accessory === 'sunglasses' && (
          <g id="acc-sunglasses">
            <rect x="33" y="24" width="16" height="12" rx="3.5" fill="#09090b" stroke="#000" strokeWidth="1.2" />
            <rect x="51" y="24" width="16" height="12" rx="3.5" fill="#09090b" stroke="#000" strokeWidth="1.2" />
            <line x1="49" y1="28" x2="51" y2="28" stroke="#09090b" strokeWidth="2.5" />
            <line x1="35" y1="26" x2="44" y2="34" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.45" />
          </g>
        )}

        {accessory === 'bowtie' && (
          <g id="acc-bowtie">
            <polygon points="43,51 43,59 48,55" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
            <polygon points="57,51 57,59 52,55" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
            <circle cx="50" cy="55" r="2.2" fill="#b91c1c" />
          </g>
        )}

        {accessory === 'medal' && (
          <g id="acc-medal">
            <path d="M46 54 L50 62 L54 54" fill="none" stroke="#3b82f6" strokeWidth="2" />
            <circle cx="50" cy="64" r="4.5" fill="url(#goldAnime)" stroke="#ca8a04" strokeWidth="1" />
            <text x="50" y="66.5" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#713f12">★</text>
          </g>
        )}

        {accessory === 'scarf' && (
          <g id="acc-scarf">
            <path d="M32 50 Q50 58 68 50 Q50 63 32 50 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1.2" />
            <path d="M54 54 L52 70 L60 70 L58 54 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1.2" />
          </g>
        )}

        {/* ─── HEADWEARS (Custom Hats if chosen) ─── */}
        {headwear === 'santa' && (
          <g id="hat-santa">
            <path d="M26 14 C32 0 68 0 74 14 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
            <path d="M71 6 C82 4 89 16 84 22" fill="none" stroke="#dc2626" strokeWidth="7" strokeLinecap="round" />
            <rect x="24" y="12" width="52" height="7" rx="3.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
            <circle cx="85" cy="24" r="5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
          </g>
        )}

        {headwear === 'crown' && (
          <g id="hat-crown">
            <path d="M28 14 L32 0 L42 8 L50 -2 L58 8 L68 0 L72 14 Z" fill="url(#goldAnime)" stroke="#854d0e" strokeWidth="1.5" />
            <circle cx="32" cy="0" r="2" fill="#ef4444" />
            <circle cx="50" cy="-2" r="2.5" fill="#3b82f6" />
            <circle cx="68" cy="0" r="2" fill="#ef4444" />
          </g>
        )}

        {headwear === 'headphones' && (
          <g id="hat-headphones">
            <path d="M22 34 C22 4 78 4 78 34" fill="none" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" />
            <rect x="18" y="24" width="7" height="16" rx="3.5" fill="#06b6d4" stroke="#0e7490" strokeWidth="1.5" />
            <rect x="75" y="24" width="7" height="16" rx="3.5" fill="#06b6d4" stroke="#0e7490" strokeWidth="1.5" />
          </g>
        )}

        {headwear === 'detective' && (
          <g id="hat-detective">
            <ellipse cx="50" cy="14" rx="32" ry="4.5" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
            <path d="M32 13 C34 1 66 1 68 13 Z" fill="#92400e" stroke="#451a03" strokeWidth="1.5" />
            <rect x="33" y="10" width="34" height="3" fill="#1c1917" />
          </g>
        )}

        {headwear === 'wizard' && (
          <g id="hat-wizard">
            <ellipse cx="50" cy="14" rx="28" ry="4" fill="#581c87" stroke="#3b0764" strokeWidth="1.5" />
            <path d="M30 13 L50 -10 L70 13 Z" fill="#6b21a8" stroke="#3b0764" strokeWidth="1.5" />
            <text x="50" y="4" textAnchor="middle" fill="#facc15" fontSize="7">★</text>
          </g>
        )}

        {/* ─── CELEBRATION SPARKLES & SHONEN TOOTH TWINKLE ─── */}
        {(state === 'celebrating' || state === 'victory') && (
          <g id="sparkles">
            <motion.path
              d="M14 14 L16 8 L18 14 L24 16 L18 18 L16 24 L14 18 L8 16 Z"
              fill="#fef08a"
              animate={{ scale: [0.8, 1.35, 0.8], rotate: [0, 90, 180] }}
              transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
            />
            <motion.path
              d="M84 12 L85.5 7 L87 12 L92 13.5 L87 15 L85.5 20 L84 15 L79 13.5 Z"
              fill="#67e8f9"
              animate={{ scale: [1, 1.4, 1], rotate: [0, -90, -180] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            />
            {/* Shonen tooth twinkle */}
            <motion.text
              x="57"
              y="38"
              fontSize="9"
              fill="#fef08a"
              textAnchor="middle"
              animate={{ scale: [0, 1.6, 0], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              ✧
            </motion.text>
          </g>
        )}

        {/* ─── FUNNY ANIME OVERLAYS ─── */}
        {/* 1. Anime Sweat Drop on Facepalm / Disappointed */}
        {(state === 'facepalm' || state === 'disappointed') && (
          <motion.g
            animate={{ y: [0, 8, 16], opacity: [0, 1, 0], scale: [0.6, 1.2, 0.8] }}
            transition={{ repeat: Infinity, duration: 0.9, ease: 'easeIn' }}
          >
            <path
              d="M31 16 Q34 8 37 16 Q37 22 34 22 Q31 22 31 16 Z"
              fill="#38bdf8"
              stroke="#0284c7"
              strokeWidth="0.8"
            />
          </motion.g>
        )}

        {/* 2. Thinking Bubble: Luffy's Meat Bone 🍖 or Chess Pawn ♟ */}
        {state === 'thinking' && (
          <motion.g
            animate={{ y: [0, -5, 0], scale: [0.95, 1.1, 0.95] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          >
            <circle cx="50" cy="-6" r="9" fill="#fef08a" opacity="0.3" />
            <circle cx="50" cy="-6" r="7" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            <text x="50" y="-3" textAnchor="middle" fontSize="8" fontWeight="bold">
              {isLuffy ? '🍖' : isZoro ? '⚔️' : isGojo ? '👁️' : '♟'}
            </text>
            <circle cx="49" cy="3" r="2.2" fill="#facc15" />
            <circle cx="47" cy="8" r="1.4" fill="#facc15" />
          </motion.g>
        )}

        {/* 3. Anime Shock Lightning Bolts on Shocked */}
        {state === 'shocked' && (
          <motion.g
            animate={{ scale: [1, 1.35, 1], rotate: [-8, 8, -8] }}
            transition={{ repeat: Infinity, duration: 0.25 }}
          >
            <path d="M48 -10 L44 -3 L48 -3 L44 5 L53 -2 L49 -2 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
            <path d="M24 10 L20 16 L24 16 L21 22 L27 17 L24 17 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
            <path d="M76 10 L80 16 L76 16 L79 22 L73 17 L76 17 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
          </motion.g>
        )}
      </svg>
    </motion.div>
  );
}
