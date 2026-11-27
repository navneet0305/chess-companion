import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Personality } from '../types/companion';

export type CharacterBase = 'bruno' | 'crowned' | 'luffy' | 'zoro' | 'gojo' | 'mateo' | 'oscar' | 'gambit' | 'rookus' | 'knightly' | 'bishop' | 'queenie';
export type HeadwearType = 'none' | 'santa' | 'crown' | 'headphones' | 'detective' | 'wizard';
export type AccessoryType = 'none' | 'bowtie' | 'sunglasses' | 'medal' | 'scarf';
export type ColorPalette = 'mint' | 'cyan' | 'ruby' | 'gold' | 'purple';

export interface CompanionCustomization {
  character: CharacterBase;
  personality: Personality;
  headwear: HeadwearType;
  accessory: AccessoryType;
  palette: ColorPalette;
  voicePitch: number;
  voiceRate: number;
}

interface CompanionContextValue extends CompanionCustomization {
  setCharacter: (c: CharacterBase) => void;
  setPersonality: (p: Personality) => void;
  setHeadwear: (h: HeadwearType) => void;
  setAccessory: (a: AccessoryType) => void;
  setPalette: (cp: ColorPalette) => void;
  setVoicePitch: (pitch: number) => void;
  setVoiceRate: (rate: number) => void;
  resetCustomization: () => void;
}

const STORAGE_KEY = 'chessmate_companion_customization_v2';

const DEFAULT_CUSTOMIZATION: CompanionCustomization = {
  character: 'bruno',
  personality: 'roaster',
  headwear: 'none',
  accessory: 'none',
  palette: 'ruby',
  voicePitch: 1.0,
  voiceRate: 1.0,
};

const CompanionContext = createContext<CompanionContextValue | undefined>(undefined);

export function CompanionProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<CompanionCustomization>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_CUSTOMIZATION, ...parsed };
      }
    } catch {}
    return DEFAULT_CUSTOMIZATION;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {}
  }, [config]);

  const setCharacter = (character: CharacterBase) => setConfig(prev => ({ ...prev, character }));
  const setPersonality = (personality: Personality) => setConfig(prev => ({ ...prev, personality }));
  const setHeadwear = (headwear: HeadwearType) => setConfig(prev => ({ ...prev, headwear }));
  const setAccessory = (accessory: AccessoryType) => setConfig(prev => ({ ...prev, accessory }));
  const setPalette = (palette: ColorPalette) => setConfig(prev => ({ ...prev, palette }));
  const setVoicePitch = (voicePitch: number) => setConfig(prev => ({ ...prev, voicePitch }));
  const setVoiceRate = (voiceRate: number) => setConfig(prev => ({ ...prev, voiceRate }));
  const resetCustomization = () => setConfig(DEFAULT_CUSTOMIZATION);

  return (
    <CompanionContext.Provider
      value={{
        ...config,
        setCharacter,
        setPersonality,
        setHeadwear,
        setAccessory,
        setPalette,
        setVoicePitch,
        setVoiceRate,
        resetCustomization,
      }}
    >
      {children}
    </CompanionContext.Provider>
  );
}

export function useCompanion() {
  const context = useContext(CompanionContext);
  if (!context) {
    throw new Error('useCompanion must be used within a CompanionProvider');
  }
  return context;
}
