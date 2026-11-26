import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { PieceSymbol } from 'chess.js';
import type { PieceAbilityId, AbilityTriggerEvent } from '../types/abilities';
import { DEFAULT_PIECE_ABILITIES } from '../lib/abilitiesLibrary';

interface AbilityContextValue {
  abilitiesEnabled: boolean;
  setAbilitiesEnabled: (enabled: boolean) => void;
  abilities: Record<PieceSymbol, PieceAbilityId>;
  setPieceAbility: (piece: PieceSymbol, abilityId: PieceAbilityId) => void;
  resetAbilities: () => void;
  activeAbilityEvent: AbilityTriggerEvent | null;
  triggerAbilityEvent: (event: AbilityTriggerEvent) => void;
  clearAbilityEvent: () => void;
}

const STORAGE_KEY = 'chessmate_piece_abilities_customization';

const AbilityContext = createContext<AbilityContextValue | undefined>(undefined);

export function AbilityProvider({ children }: { children: React.ReactNode }) {
  const [abilitiesEnabled, setAbilitiesEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.enabled === 'boolean') return parsed.enabled;
      }
    } catch {}
    return true; // Enabled by default as requested by user
  });

  const [abilities, setAbilities] = useState<Record<PieceSymbol, PieceAbilityId>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.abilities) {
          return { ...DEFAULT_PIECE_ABILITIES, ...parsed.abilities };
        }
      }
    } catch {}
    return DEFAULT_PIECE_ABILITIES;
  });

  const [activeAbilityEvent, setActiveAbilityEvent] = useState<AbilityTriggerEvent | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          enabled: abilitiesEnabled,
          abilities,
        })
      );
    } catch {}
  }, [abilitiesEnabled, abilities]);

  const setPieceAbility = useCallback((piece: PieceSymbol, abilityId: PieceAbilityId) => {
    setAbilities((prev) => ({
      ...prev,
      [piece]: abilityId,
    }));
  }, []);

  const resetAbilities = useCallback(() => {
    setAbilities(DEFAULT_PIECE_ABILITIES);
    setAbilitiesEnabled(true);
  }, []);

  const triggerAbilityEvent = useCallback((event: AbilityTriggerEvent) => {
    setActiveAbilityEvent(event);
    // Automatically clear event after 2.4 seconds so the animation concludes gracefully
    setTimeout(() => {
      setActiveAbilityEvent((current) => (current?.id === event.id ? null : current));
    }, 2400);
  }, []);

  const clearAbilityEvent = useCallback(() => {
    setActiveAbilityEvent(null);
  }, []);

  return (
    <AbilityContext.Provider
      value={{
        abilitiesEnabled,
        setAbilitiesEnabled,
        abilities,
        setPieceAbility,
        resetAbilities,
        activeAbilityEvent,
        triggerAbilityEvent,
        clearAbilityEvent,
      }}
    >
      {children}
    </AbilityContext.Provider>
  );
}

export function usePieceAbilities() {
  const context = useContext(AbilityContext);
  if (!context) {
    throw new Error('usePieceAbilities must be used within an AbilityProvider');
  }
  return context;
}
