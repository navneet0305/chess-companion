'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Move, Square } from 'chess.js';
import type { EliminationEvent } from '../types/eliminations';
import { eliminationAudio } from '../services/eliminationAudio';

interface EliminationContextValue {
  eliminationEnabled: boolean;
  setEliminationEnabled: (enabled: boolean) => void;
  toggleEliminationEnabled: () => void;
  activeElimination: EliminationEvent | null;
  triggerElimination: (move: Move) => void;
  clearElimination: () => void;
}

const STORAGE_KEY = 'chessmate_elimination_fx_enabled';

const EliminationContext = createContext<EliminationContextValue | undefined>(undefined);

export function EliminationProvider({ children }: { children: React.ReactNode }) {
  const [eliminationEnabled, setEliminationEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        return JSON.parse(saved) === true;
      }
    } catch {
      // Ignore storage errors
    }
    return true; // Enabled by default
  });

  const [activeElimination, setActiveElimination] = useState<EliminationEvent | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(eliminationEnabled));
    } catch {
      // Ignore storage errors
    }
  }, [eliminationEnabled]);

  const toggleEliminationEnabled = useCallback(() => {
    setEliminationEnabled((prev) => !prev);
  }, []);

  const triggerElimination = useCallback(
    (move: Move) => {
      if (!eliminationEnabled || !move.captured) return;

      const event: EliminationEvent = {
        id: `elim_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        attackerType: move.piece,
        attackerColor: move.color,
        capturedType: move.captured,
        fromSquare: move.from as Square,
        targetSquare: move.to as Square,
        timestamp: Date.now(),
      };

      eliminationAudio.playEliminationSound(move.piece);
      setActiveElimination(event);

      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
      }
      clearTimerRef.current = setTimeout(() => {
        setActiveElimination((curr) => (curr?.id === event.id ? null : curr));
      }, 1500);
    },
    [eliminationEnabled]
  );

  const clearElimination = useCallback(() => {
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
    }
    setActiveElimination(null);
  }, []);

  return (
    <EliminationContext.Provider
      value={{
        eliminationEnabled,
        setEliminationEnabled,
        toggleEliminationEnabled,
        activeElimination,
        triggerElimination,
        clearElimination,
      }}
    >
      {children}
    </EliminationContext.Provider>
  );
}

export function useEliminationFx() {
  const context = useContext(EliminationContext);
  if (!context) {
    throw new Error('useEliminationFx must be used within an EliminationProvider');
  }
  return context;
}
