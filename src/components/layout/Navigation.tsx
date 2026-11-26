import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import { useBoardTheme } from '../../contexts/ThemeContext';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { soundEnabled, toggleSounds } = useSettings();
  const { theme } = useBoardTheme();

  const navItems = [
    { name: 'Play', path: '/' },
    { name: 'Analysis', path: '/analysis' },
    { name: theme === 'christmas' ? 'Themes 🎄' : 'Themes', path: '/themes' },
    { name: 'Companions', path: '/companions' },
    { name: 'Statistics', path: '/statistics' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#2a2a2a] bg-[#0f0f0f]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-8">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 18h14" />
                <path d="M19 18l1-11-4 4-4-7-4 7-4-4 1 11" />
              </svg>
            </div>
            <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
              Chess<span className="text-green-400">Mate</span>
            </span>
          </NavLink>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#242424] text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a]'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSounds}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-[#242424] transition-colors"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            aria-label={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </button>

          {/* User Profile Avatar */}
          <NavLink to="/statistics" className="flex items-center gap-2 pl-2 border-l border-[#2a2a2a]">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 p-0.5 flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center text-[11px] font-bold text-green-400">
                P1
              </div>
            </div>
          </NavLink>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-[#242424]"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#2a2a2a] bg-[#141416] px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-xs font-semibold ${
                  isActive ? 'bg-[#242424] text-white' : 'text-gray-400 hover:text-white'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
