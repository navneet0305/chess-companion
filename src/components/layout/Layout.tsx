import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import SnowEffect from './SnowEffect';
import { SettingsProvider } from '../../contexts/SettingsContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { CompanionProvider } from '../../contexts/CompanionContext';
import { AbilityProvider } from '../../contexts/AbilityContext';
import { PieceSkinProvider } from '../../contexts/PieceSkinContext';
import { EliminationProvider } from '../../contexts/EliminationContext';

export default function Layout() {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <CompanionProvider>
          <AbilityProvider>
            <PieceSkinProvider>
              <EliminationProvider>
                <div className="min-h-screen flex flex-col bg-[#0f0f0f] text-[#f5f5f5] relative overflow-x-clip">
                  {/* Drifting Snowflake Particles (Phase 5 Seasonal Theme) */}
                  <SnowEffect />

                  <Navigation />
                  <main className="flex-1 flex flex-col">
                    <Outlet />
                  </main>
                </div>
              </EliminationProvider>
            </PieceSkinProvider>
          </AbilityProvider>
        </CompanionProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}
