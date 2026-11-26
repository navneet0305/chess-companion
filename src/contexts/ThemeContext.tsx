import React, { createContext, useContext, useState, useEffect } from 'react';

export type BoardThemeId = 'classic-dark' | 'christmas' | 'wood' | 'emerald' | 'cyber';

export interface BoardThemeConfig {
  id: BoardThemeId;
  name: string;
  desc: string;
  lightSquare: string;
  darkSquare: string;
  accent: string;
  isSeasonal?: boolean;
}

export const BOARD_THEMES: Record<BoardThemeId, BoardThemeConfig> = {
  'classic-dark': {
    id: 'classic-dark',
    name: 'Classic Dark',
    desc: 'Deep graphite and muted charcoal tournament contrast',
    lightSquare: '#40444f',
    darkSquare: '#23252b',
    accent: '#22c55e',
  },
  'christmas': {
    id: 'christmas',
    name: 'Christmas Holiday',
    desc: 'Festive holiday crimson and frosted snow mist with falling flakes',
    lightSquare: '#e2e8f0',
    darkSquare: '#881337',
    accent: '#ef4444',
    isSeasonal: true,
  },
  'wood': {
    id: 'wood',
    name: 'Heritage Wood',
    desc: 'Warm walnut and maple handcrafted natural grains',
    lightSquare: '#edd6b5',
    darkSquare: '#b58863',
    accent: '#d97706',
  },
  'emerald': {
    id: 'emerald',
    name: 'Royal Emerald',
    desc: 'Classical mint and forest green championship styling',
    lightSquare: '#c4e8d1',
    darkSquare: '#2d6a4f',
    accent: '#10b981',
  },
  'cyber': {
    id: 'cyber',
    name: 'Cyberpunk Neon',
    desc: 'High-contrast cyan lasers on midnight obsidian',
    lightSquare: '#0891b2',
    darkSquare: '#0f172a',
    accent: '#06b6d4',
  },
};

interface ThemeContextValue {
  theme: BoardThemeId;
  themeConfig: BoardThemeConfig;
  setTheme: (t: BoardThemeId) => void;
  snowEnabled: boolean;
  setSnowEnabled: (enabled: boolean) => void;
}

const STORAGE_KEY_THEME = 'chessmate_board_theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<BoardThemeId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved && (saved in BOARD_THEMES)) {
        return saved as BoardThemeId;
      }
    } catch {}
    return 'classic-dark';
  });

  const [snowEnabled, setSnowEnabled] = useState<boolean>(theme === 'christmas');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch {}
    if (theme === 'christmas') {
      setSnowEnabled(true);
    }
  }, [theme]);

  const setTheme = (t: BoardThemeId) => {
    setThemeState(t);
    if (t === 'christmas') {
      setSnowEnabled(true);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeConfig: BOARD_THEMES[theme],
        setTheme,
        snowEnabled,
        setSnowEnabled,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useBoardTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useBoardTheme must be used within a ThemeProvider');
  }
  return context;
}
