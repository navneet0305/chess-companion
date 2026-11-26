'use client';

import React from 'react';
import { useBoardTheme, BOARD_THEMES, BoardThemeId } from '../contexts/ThemeContext';
import { useCompanion } from '../contexts/CompanionContext';
import Button from '../components/ui/Button';

export default function ThemesPage() {
  const { theme, setTheme, snowEnabled, setSnowEnabled } = useBoardTheme();
  const { setHeadwear } = useCompanion();

  const handleSelectTheme = (themeId: BoardThemeId) => {
    setTheme(themeId);
    if (themeId === 'christmas') {
      setHeadwear('santa');
    }
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <h1 className="text-2xl font-bold text-gray-100">Board Themes & Seasonal Styles</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono">
            PHASE 5 SEASONAL
          </span>
        </div>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Transform your chessboard aesthetic, switch seasonal holiday styles, and customize visual ambiance.
        </p>
      </div>

      {/* Featured Seasonal Theme Hero Card */}
      <div className="mt-6 p-6 rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/40 via-[#1e1418] to-[#121316] relative overflow-hidden shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold mb-3">
            <span>🎅</span>
            <span>HOLIDAY SEASON SPECIAL</span>
          </div>
          <h2 className="text-xl font-bold text-white">Christmas / Santa Holiday Theme</h2>
          <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
            Dresses Gambit in a Santa Claus hat, enables gentle drifting snow across your screen, and applies festive crimson and frosty white tournament board tiles.
          </p>

          <div className="flex items-center gap-3 mt-4">
            <Button
              variant={theme === 'christmas' ? 'primary' : 'secondary'}
              onClick={() => handleSelectTheme('christmas')}
              className={theme === 'christmas' ? '!bg-red-500 !text-white' : ''}
            >
              {theme === 'christmas' ? '✓ Christmas Active' : 'Activate Christmas Theme'}
            </Button>

            <button
              onClick={() => setSnowEnabled(!snowEnabled)}
              className="text-xs font-medium px-3 py-2 rounded-lg bg-[#2a2a2a] hover:bg-[#333] text-gray-200 transition-colors"
            >
              ❄️ Snow Effect: {snowEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Mini Christmas Board Illustration */}
        <div className="relative z-10 w-44 h-44 rounded-xl border-2 border-red-500/40 overflow-hidden grid grid-cols-4 grid-rows-4 shadow-xl flex-shrink-0">
          {[...Array(16)].map((_, i) => {
            const row = Math.floor(i / 4);
            const col = i % 4;
            const isLight = (row + col) % 2 === 0;
            return (
              <div
                key={i}
                className="w-full h-full flex items-center justify-center text-sm"
                style={{ backgroundColor: isLight ? '#e2e8f0' : '#881337' }}
              >
                {i === 5 && '🎅'}
                {i === 10 && '🎄'}
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Board Themes Gallery */}
      <div className="mt-10">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">
          All Available Board Themes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(Object.keys(BOARD_THEMES) as BoardThemeId[]).map((themeKey) => {
            const t = BOARD_THEMES[themeKey];
            const isSelected = theme === themeKey;

            return (
              <div
                key={t.id}
                onClick={() => handleSelectTheme(t.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-green-500/10 border-green-500 shadow-xl ring-1 ring-green-500/50'
                    : 'bg-[#1a1a1e] border-[#2a2a2a] hover:border-gray-600 hover:bg-[#202026]'
                }`}
              >
                <div>
                  {/* Mini Preview Grid (4x4) */}
                  <div className="w-full aspect-video rounded-xl overflow-hidden grid grid-cols-6 grid-rows-3 border border-black/40 mb-4 shadow-inner">
                    {[...Array(18)].map((_, i) => {
                      const row = Math.floor(i / 6);
                      const col = i % 6;
                      const isLight = (row + col) % 2 === 0;
                      return (
                        <div
                          key={i}
                          style={{ backgroundColor: isLight ? t.lightSquare : t.darkSquare }}
                        />
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-gray-100">{t.name}</h4>
                    {isSelected && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-500 text-neutral-900">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{t.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#2a2a2a] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full border border-black/30" style={{ backgroundColor: t.lightSquare }} />
                    <span className="w-3.5 h-3.5 rounded-full border border-black/30" style={{ backgroundColor: t.darkSquare }} />
                    <span className="text-[11px] text-gray-500 font-mono ml-1">Tiles</span>
                  </div>

                  <button
                    type="button"
                    className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-[#26262a] text-gray-300 hover:bg-[#333]'
                    }`}
                  >
                    {isSelected ? 'Applied' : 'Select'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
