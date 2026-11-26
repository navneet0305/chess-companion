'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { PieceSymbol } from 'chess.js';
import {
  type PlayerPieceSkins,
  type AnyPieceSkinId,
  type CustomPieceAppearance,
  DEFAULT_PIECE_SKINS,
} from '../types/pieceSkins';

interface PieceSkinContextValue {
  pieceSkins: PlayerPieceSkins;
  setPieceSkin: (piece: PieceSymbol, skinId: AnyPieceSkinId) => void;
  customAppearances: Partial<Record<PieceSymbol, CustomPieceAppearance>>;
  setCustomAppearance: (piece: PieceSymbol, appearance: CustomPieceAppearance) => void;
  clearCustomAppearance: (piece: PieceSymbol) => void;
  resetPieceSkins: () => void;
  applyPresetTheme: (theme: 'pirate_anime' | 'classic' | 'cyber') => void;
}

const STORAGE_KEY = 'chessmate_piece_skins_customization';
const CUSTOM_APPEARANCE_KEY = 'chessmate_custom_piece_appearances';

const PieceSkinContext = createContext<PieceSkinContextValue | undefined>(undefined);

export function PieceSkinProvider({ children }: { children: React.ReactNode }) {
  const [pieceSkins, setPieceSkins] = useState<PlayerPieceSkins>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PIECE_SKINS, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_PIECE_SKINS;
  });

  const [customAppearances, setCustomAppearances] = useState<
    Partial<Record<PieceSymbol, CustomPieceAppearance>>
  >(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_APPEARANCE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pieceSkins));
    } catch {}
  }, [pieceSkins]);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_APPEARANCE_KEY, JSON.stringify(customAppearances));
    } catch {}
  }, [customAppearances]);

  const setPieceSkin = (piece: PieceSymbol, skinId: AnyPieceSkinId) => {
    // Selecting a standard skin clears any custom generated override for that piece
    setCustomAppearances((prev) => {
      if (!prev[piece]) return prev;
      const copy = { ...prev };
      delete copy[piece];
      return copy;
    });
    setPieceSkins((prev) => ({
      ...prev,
      [piece]: skinId,
    }));
  };

  const setCustomAppearance = (piece: PieceSymbol, appearance: CustomPieceAppearance) => {
    setCustomAppearances((prev) => ({
      ...prev,
      [piece]: appearance,
    }));
  };

  const clearCustomAppearance = (piece: PieceSymbol) => {
    setCustomAppearances((prev) => {
      const copy = { ...prev };
      delete copy[piece];
      return copy;
    });
  };

  const resetPieceSkins = () => {
    setPieceSkins(DEFAULT_PIECE_SKINS);
    setCustomAppearances({});
  };

  const applyPresetTheme = (theme: 'pirate_anime' | 'classic' | 'cyber') => {
    setCustomAppearances({});
    if (theme === 'classic') {
      setPieceSkins({
        b: 'bishop_classic',
        n: 'knight_classic',
        r: 'rook_classic',
        q: 'queen_classic',
        k: 'king_classic',
        p: 'pawn_classic',
      });
    } else if (theme === 'cyber') {
      setPieceSkins({
        b: 'bishop_cyber_oracle',
        n: 'knight_cyber_steed',
        r: 'rook_neon',
        q: 'queen_celestial',
        k: 'king_cyber_overlord',
        p: 'pawn_cyber_drone',
      });
    } else {
      setPieceSkins({
        b: 'bishop_one_eyed',
        n: 'knight_straw_hat',
        r: 'rook_siege_cannon',
        q: 'queen_valkyrie',
        k: 'king_pirate_king',
        p: 'pawn_bandaged',
      });
    }
  };

  return (
    <PieceSkinContext.Provider
      value={{
        pieceSkins,
        setPieceSkin,
        customAppearances,
        setCustomAppearance,
        clearCustomAppearance,
        resetPieceSkins,
        applyPresetTheme,
      }}
    >
      {children}
    </PieceSkinContext.Provider>
  );
}

export function usePieceSkins() {
  const context = useContext(PieceSkinContext);
  if (!context) {
    throw new Error('usePieceSkins must be used within a PieceSkinProvider');
  }
  return context;
}
