import type { PieceSymbol } from 'chess.js';
import type { CustomPieceAppearance } from '../types/pieceSkins';

const PRESET_RECIPES: Record<string, Omit<CustomPieceAppearance, 'id' | 'pieceType' | 'prompt'>> = {
  gojo: {
    displayName: 'Satoru Gojo',
    auraColor: '#38bdf8',
    outfitColor: '#0f172a',
    outfitAccent: '#8b5cf6',
    skinColor: '#ffedd5',
    hairColor: '#f8fafc',
    hairStyle: 'spiky_gojo',
    eyeStyle: 'six_eyes',
    eyeColor: '#38bdf8',
    headwear: 'blindfold',
    facialMark: 'none',
    prop: 'infinity_orb',
  },
  luffy: {
    displayName: 'Monkey D. Luffy',
    auraColor: '#facc15',
    outfitColor: '#dc2626',
    outfitAccent: '#facc15',
    skinColor: '#fed7aa',
    hairColor: '#111827',
    hairStyle: 'straw_hat_hair',
    eyeStyle: 'fierce',
    eyeColor: '#1e293b',
    headwear: 'straw_hat',
    facialMark: 'scar_cheek',
    prop: 'fire_ki',
  },
  zoro: {
    displayName: 'Roronoa Zoro',
    auraColor: '#22c55e',
    outfitColor: '#14532d',
    outfitAccent: '#22c55e',
    skinColor: '#fed7aa',
    hairColor: '#22c55e',
    hairStyle: 'spiky_wild',
    eyeStyle: 'scar_eye',
    eyeColor: '#1e293b',
    headwear: 'none',
    facialMark: 'scar_eye',
    prop: 'katana',
  },
  sukuna: {
    displayName: 'Ryomen Sukuna',
    auraColor: '#ef4444',
    outfitColor: '#f8fafc',
    outfitAccent: '#dc2626',
    skinColor: '#fed7aa',
    hairColor: '#f472b6',
    hairStyle: 'spiky_wild',
    eyeStyle: 'fierce',
    eyeColor: '#ef4444',
    headwear: 'none',
    facialMark: 'sukuna_marks',
    prop: 'fire_ki',
  },
  naruto: {
    displayName: 'Naruto Uzumaki',
    auraColor: '#fb923c',
    outfitColor: '#f97316',
    outfitAccent: '#0f172a',
    skinColor: '#fed7aa',
    hairColor: '#facc15',
    hairStyle: 'spiky_gojo',
    eyeStyle: 'fierce',
    eyeColor: '#38bdf8',
    headwear: 'headband',
    facialMark: 'whiskers',
    prop: 'infinity_orb',
  },
  goku: {
    displayName: 'Son Goku (SSJ)',
    auraColor: '#fde047',
    outfitColor: '#ea580c',
    outfitAccent: '#1d4ed8',
    skinColor: '#fed7aa',
    hairColor: '#facc15',
    hairStyle: 'spiky_wild',
    eyeStyle: 'fierce',
    eyeColor: '#22d3ee',
    headwear: 'none',
    facialMark: 'none',
    prop: 'fire_ki',
  },
  sasuke: {
    displayName: 'Sasuke Uchiha',
    auraColor: '#a855f7',
    outfitColor: '#1e1b4b',
    outfitAccent: '#c084fc',
    skinColor: '#ffedd5',
    hairColor: '#0f172a',
    hairStyle: 'spiky_gojo',
    eyeStyle: 'sharingan',
    eyeColor: '#ef4444',
    headwear: 'headband',
    facialMark: 'none',
    prop: 'lightning',
  },
  spiderman: {
    displayName: 'Spider-Man',
    auraColor: '#ef4444',
    outfitColor: '#dc2626',
    outfitAccent: '#1d4ed8',
    skinColor: '#dc2626',
    hairColor: '#dc2626',
    hairStyle: 'helmet',
    eyeStyle: 'mask_eyes',
    eyeColor: '#ffffff',
    headwear: 'helmet_mask',
    facialMark: 'spider_web',
    prop: 'web',
  },
  ironman: {
    displayName: 'Iron Man',
    auraColor: '#38bdf8',
    outfitColor: '#b91c1c',
    outfitAccent: '#facc15',
    skinColor: '#b91c1c',
    hairColor: '#facc15',
    hairStyle: 'helmet',
    eyeStyle: 'visor',
    eyeColor: '#7dd3fc',
    headwear: 'helmet_mask',
    facialMark: 'none',
    prop: 'infinity_orb',
  },
  batman: {
    displayName: 'Batman',
    auraColor: '#64748b',
    outfitColor: '#0f172a',
    outfitAccent: '#facc15',
    skinColor: '#fed7aa',
    hairColor: '#09090b',
    hairStyle: 'helmet',
    eyeStyle: 'mask_eyes',
    eyeColor: '#ffffff',
    headwear: 'horns',
    facialMark: 'none',
    prop: 'none',
  },
  vader: {
    displayName: 'Darth Vader',
    auraColor: '#ef4444',
    outfitColor: '#09090b',
    outfitAccent: '#ef4444',
    skinColor: '#18181b',
    hairColor: '#09090b',
    hairStyle: 'helmet',
    eyeStyle: 'visor',
    eyeColor: '#ef4444',
    headwear: 'helmet_mask',
    facialMark: 'none',
    prop: 'saber',
  },
  pikachu: {
    displayName: 'Pikachu',
    auraColor: '#facc15',
    outfitColor: '#eab308',
    outfitAccent: '#ef4444',
    skinColor: '#fde047',
    hairColor: '#eab308',
    hairStyle: 'slick',
    eyeStyle: 'fierce',
    eyeColor: '#18181b',
    headwear: 'horns',
    facialMark: 'none',
    prop: 'lightning',
  },
};

function hashPrompt(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const PALETTES = [
  { aura: '#38bdf8', outfit: '#0f172a', accent: '#38bdf8', hair: '#f8fafc' },
  { aura: '#f43f5e', outfit: '#4c0519', accent: '#fb7185', hair: '#18181b' },
  { aura: '#a855f7', outfit: '#2e1065', accent: '#c084fc', hair: '#e9d5ff' },
  { aura: '#22c55e', outfit: '#052e16', accent: '#4ade80', hair: '#15803d' },
  { aura: '#f59e0b', outfit: '#451a03', accent: '#fbbf24', hair: '#fef08a' },
  { aura: '#06b6d4', outfit: '#083344', accent: '#22d3ee', hair: '#0f172a' },
];

/**
 * Generates a unique, rich custom character chess piece appearance from ANY user prompt
 * (e.g. "Gojo", "Naruto", "Cyber Samurai", "Fire Dragon Queen", etc.).
 */
export function generatePieceAppearanceFromPrompt(
  rawPrompt: string,
  pieceType: PieceSymbol,
  targetSide: 'w' | 'b' | 'both' = 'both'
): CustomPieceAppearance {
  const clean = rawPrompt.trim();
  const lower = clean.toLowerCase();
  const id = `custom_${pieceType}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;

  // 1. Check exact / keyword preset character matches
  const keywordAliases: [string[], keyof typeof PRESET_RECIPES][] = [
    [['gojo', 'satoru', 'limitless', 'hollow purple'], 'gojo'],
    [['luffy', 'straw hat', 'strawhat', 'monkey d'], 'luffy'],
    [['zoro', 'roronoa', 'santoryu'], 'zoro'],
    [['sukuna', 'ryomen'], 'sukuna'],
    [['naruto', 'uzumaki', 'hokage'], 'naruto'],
    [['goku', 'saiyan', 'kamehameha', 'vegeta'], 'goku'],
    [['sasuke', 'uchiha', 'sharingan', 'itachi'], 'sasuke'],
    [['spider', 'spidey', 'peter parker'], 'spiderman'],
    [['iron man', 'ironman', 'stark'], 'ironman'],
    [['batman', 'bruce wayne', 'dark knight'], 'batman'],
    [['vader', 'sith', 'darth'], 'vader'],
    [['pikachu', 'pokemon'], 'pikachu'],
  ];

  for (const [keywords, recipeKey] of keywordAliases) {
    if (keywords.some((kw) => lower.includes(kw))) {
      const recipe = PRESET_RECIPES[recipeKey];
      return {
        ...recipe,
        id,
        pieceType,
        targetSide,
        prompt: clean,
        displayName: clean.length > 2 && !lower.includes(recipeKey) ? clean : recipe.displayName,
      };
    }
  }

  // 2. Semantic procedural synthesis for any custom text prompt
  const seed = hashPrompt(lower || 'custom');
  const pal = PALETTES[seed % PALETTES.length];

  let auraColor = pal.aura;
  let outfitColor = pal.outfit;
  let hairColor = pal.hair;
  let eyeColor = pal.accent;

  if (lower.includes('fire') || lower.includes('red') || lower.includes('flame') || lower.includes('crimson')) {
    auraColor = '#ef4444';
    outfitColor = '#7f1d1d';
    eyeColor = '#f97316';
  } else if (lower.includes('ice') || lower.includes('blue') || lower.includes('frost') || lower.includes('cyan')) {
    auraColor = '#38bdf8';
    outfitColor = '#0c4a6e';
    hairColor = '#e0f2fe';
    eyeColor = '#7dd3fc';
  } else if (lower.includes('gold') || lower.includes('king') || lower.includes('royal') || lower.includes('sun')) {
    auraColor = '#facc15';
    outfitColor = '#78350f';
    hairColor = '#fde047';
    eyeColor = '#fbbf24';
  } else if (lower.includes('shadow') || lower.includes('dark') || lower.includes('void') || lower.includes('purple')) {
    auraColor = '#a855f7';
    outfitColor = '#1e1b4b';
    hairColor = '#09090b';
    eyeColor = '#c084fc';
  } else if (lower.includes('emerald') || lower.includes('green') || lower.includes('poison')) {
    auraColor = '#22c55e';
    outfitColor = '#14532d';
    eyeColor = '#4ade80';
  }

  const hairStyles: CustomPieceAppearance['hairStyle'][] = [
    'spiky_gojo',
    'spiky_wild',
    'slick',
    'hooded',
    'helmet',
  ];
  const eyeStyles: CustomPieceAppearance['eyeStyle'][] = [
    'six_eyes',
    'fierce',
    'visor',
    'sharingan',
    'scar_eye',
  ];

  let headwear: CustomPieceAppearance['headwear'] = 'none';
  if (lower.includes('crown') || lower.includes('queen') || lower.includes('king')) headwear = 'crown';
  else if (lower.includes('hat')) headwear = 'straw_hat';
  else if (lower.includes('ninja') || lower.includes('headband')) headwear = 'headband';
  else if (lower.includes('demon') || lower.includes('dragon') || lower.includes('horn')) headwear = 'horns';
  else if (lower.includes('cyber') || lower.includes('robot') || lower.includes('mecha') || lower.includes('armor')) headwear = 'helmet_mask';
  else if (lower.includes('blindfold')) headwear = 'blindfold';

  let prop: CustomPieceAppearance['prop'] = 'infinity_orb';
  if (lower.includes('sword') || lower.includes('samurai') || lower.includes('katana') || lower.includes('knight')) prop = 'katana';
  else if (lower.includes('lightning') || lower.includes('thunder')) prop = 'lightning';
  else if (lower.includes('fire') || lower.includes('dragon')) prop = 'fire_ki';
  else if (lower.includes('saber') || lower.includes('laser')) prop = 'saber';

  const titleCased =
    clean
      .split(/\s+/)
      .slice(0, 3)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || 'Custom Legend';

  return {
    id,
    pieceType,
    targetSide,
    prompt: clean,
    displayName: titleCased,
    auraColor,
    outfitColor,
    outfitAccent: auraColor,
    skinColor: lower.includes('demon') || lower.includes('alien') ? '#cbd5e1' : '#fed7aa',
    hairColor,
    hairStyle: headwear === 'helmet_mask' ? 'helmet' : hairStyles[seed % 3],
    eyeStyle: headwear === 'helmet_mask' ? 'visor' : eyeStyles[seed % eyeStyles.length],
    eyeColor,
    headwear,
    facialMark: lower.includes('scar') ? 'scar_eye' : 'none',
    prop,
  };
}
