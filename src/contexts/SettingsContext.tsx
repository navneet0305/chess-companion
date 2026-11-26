import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactionFrequency } from '../types/companion';
import { STORAGE_KEY_SETTINGS } from '../lib/constants';

interface SettingsContextValue {
  soundEnabled: boolean;
  toggleSounds: () => void;
  boardTheme: string;
  setBoardTheme: (theme: string) => void;
  reactionFrequency: ReactionFrequency;
  setReactionFrequency: (frequency: ReactionFrequency) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.soundEnabled ?? true;
      }
    } catch {}
    return true;
  });

  const [boardTheme, setBoardTheme] = useState<string>('classic');
  const [reactionFrequency, setReactionFrequency] = useState<ReactionFrequency>('balanced');

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_SETTINGS,
        JSON.stringify({
          soundEnabled,
          boardTheme,
          reactionFrequency,
        })
      );
    } catch {}
  }, [soundEnabled, boardTheme, reactionFrequency]);

  const toggleSounds = () => setSoundEnabled((prev) => !prev);

  return (
    <SettingsContext.Provider
      value={{
        soundEnabled,
        toggleSounds,
        boardTheme,
        setBoardTheme,
        reactionFrequency,
        setReactionFrequency,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
