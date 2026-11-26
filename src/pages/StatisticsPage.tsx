'use client';

import React from 'react';
import { useCompanion } from '../contexts/CompanionContext';
import CompanionAvatar from '../components/companion/character/CompanionAvatar';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function StatisticsPage() {
  const { character, headwear, accessory, palette } = useCompanion();

  const stats = {
    ratingRapid: 1420,
    ratingBlitz: 1385,
    gamesPlayed: 48,
    wins: 28,
    losses: 15,
    draws: 5,
    winRate: 58,
    accuracyAvg: 82.4,
    companionLevel: 4,
    companionXp: 740,
    companionNextXp: 1000,
  };

  const achievements = [
    { id: '1', title: 'Queen Hunter', desc: 'Captured opponent Queen 10 times', icon: '👑', unlocked: true },
    { id: '2', title: 'Brilliant Mind', desc: 'Played a brilliant (!!) move', icon: '✨', unlocked: true },
    { id: '3', title: 'Bookworm', desc: 'Followed Grandmaster opening book for 8 moves', icon: '📖', unlocked: true },
    { id: '4', title: 'Speed Demon', desc: 'Won a game with over 5 minutes left on clock', icon: '⚡', unlocked: false },
  ];

  const recentGames = [
    { id: 'g1', opponent: 'Stockfish Intermediate', result: 'win', date: 'Today', moves: 32, accuracy: 88 },
    { id: 'g2', opponent: 'Stockfish Advanced', result: 'loss', date: 'Yesterday', moves: 44, accuracy: 76 },
    { id: 'g3', opponent: 'Stockfish Easy', result: 'win', date: 'Nov 20', moves: 21, accuracy: 94 },
    { id: 'g4', opponent: 'Stockfish Intermediate', result: 'draw', date: 'Nov 19', moves: 52, accuracy: 81 },
  ];

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#2a2a2a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <h1 className="text-2xl font-bold text-gray-100">Player Statistics & Progress</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-mono">
              PHASE 7 PROGRESSION
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Track your rating progression, game accuracy, companion bond, and match achievements.
          </p>
        </div>

        <Link to="/play">
          <Button variant="primary">Play Next Match</Button>
        </Link>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="p-4 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]">
          <span className="text-xs font-semibold text-gray-400">Rapid Rating</span>
          <div className="text-2xl font-bold text-gray-100 font-mono mt-1">{stats.ratingRapid}</div>
          <span className="text-[11px] text-green-400">▲ +35 this week</span>
        </div>

        <div className="p-4 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]">
          <span className="text-xs font-semibold text-gray-400">Win Rate</span>
          <div className="text-2xl font-bold text-green-400 font-mono mt-1">{stats.winRate}%</div>
          <span className="text-[11px] text-gray-400">{stats.wins}W / {stats.losses}L / {stats.draws}D</span>
        </div>

        <div className="p-4 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]">
          <span className="text-xs font-semibold text-gray-400">Avg Accuracy</span>
          <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">{stats.accuracyAvg}%</div>
          <span className="text-[11px] text-gray-400">High-tier precision</span>
        </div>

        <div className="p-4 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]">
          <span className="text-xs font-semibold text-gray-400">Total Games</span>
          <div className="text-2xl font-bold text-gray-100 font-mono mt-1">{stats.gamesPlayed}</div>
          <span className="text-[11px] text-gray-400">Matches recorded</span>
        </div>
      </div>

      {/* Companion Friendship & Level Progression */}
      <div className="mt-6 p-6 rounded-2xl border border-green-500/30 bg-gradient-to-r from-green-950/20 via-[#1a1a20] to-[#141418] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <CompanionAvatar
            state="happy"
            size={76}
            character={character}
            headwear={headwear}
            accessory={accessory}
            palette={palette}
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-100">Companion Bond: Level {stats.companionLevel}</h3>
              <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-bold">
                Tactical Ally
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Gambit learns your playing habits, provides personalized roasts and celebration lines as your bond increases!
            </p>
            {/* XP Bar */}
            <div className="w-full sm:w-64 mt-3">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>XP: {stats.companionXp} / {stats.companionNextXp}</span>
                <span>Level 5 Perk: Wizard Hat Unlock</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#242424] overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.companionXp / stats.companionNextXp) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <Link to="/companions">
          <Button variant="secondary" size="sm">
            Visit Studio 🎨
          </Button>
        </Link>
      </div>

      {/* Achievements & Match History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Achievements Column */}
        <div className="lg:col-span-5 p-4 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            🏆 Achievements
          </h3>
          <div className="space-y-2.5">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={`p-3 rounded-lg border flex items-center justify-between ${
                  a.unlocked
                    ? 'bg-[#202026] border-[#333]'
                    : 'bg-[#16161a] border-[#222] opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{a.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-gray-200">{a.title}</h4>
                    <p className="text-[11px] text-gray-400">{a.desc}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-green-400">
                  {a.unlocked ? '✓ Unlocked' : '🔒 Locked'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Matches Column */}
        <div className="lg:col-span-7 p-4 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              📜 Match History
            </h3>
            <Link to="/analysis" className="text-xs text-green-400 hover:underline">
              Analyze in Depth →
            </Link>
          </div>

          <div className="space-y-2">
            {recentGames.map((g) => (
              <div
                key={g.id}
                className="p-3 rounded-lg bg-[#202026] border border-[#2a2a2a] flex items-center justify-between hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      g.result === 'win'
                        ? 'bg-green-500/20 text-green-400'
                        : g.result === 'loss'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {g.result}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-gray-200">{g.opponent}</h4>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {g.moves} moves • Accuracy: {g.accuracy}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-gray-500">{g.date}</span>
                  <Link to="/analysis">
                    <button className="text-xs font-medium px-2 py-1 rounded bg-[#2a2a2a] hover:bg-[#333] text-gray-300">
                      Review
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
