'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Chess, type Square } from 'chess.js';
import ChessBoard from '../components/chess/ChessBoard';
import { EvaluationBar } from '../components/chess/EvaluationBar';
import CompanionAvatar from '../components/companion/character/CompanionAvatar';
import { useCompanion } from '../contexts/CompanionContext';
import { useStockfish } from '../hooks/useStockfish';
import { companionVoice } from '../services/voiceService';
import type { EvaluationData, MoveClassification } from '../types/chess';
import { CLASSIFICATION_BADGES } from '../services/moveClassifier';
import Button from '../components/ui/Button';

interface MoveNode {
  san: string;
  from: Square;
  to: Square;
  fen: string;
  score: number;
  classification: MoveClassification;
  bestMove?: string;
  explanation?: string;
}

// Sample famous game: Kasparov vs Topalov (Immortal Game 1999) initial tactical sequence
const SAMPLE_GAME_MOVES = [
  { san: 'e4', from: 'e2', to: 'e4', score: 20, classification: 'best', explanation: 'Controls central squares and opens lines for queen and bishop.' },
  { san: 'd6', from: 'd7', to: 'd6', score: 25, classification: 'good', explanation: 'Pirc Defense, hypermodern strategy inviting white to seize center.' },
  { san: 'd4', from: 'd2', to: 'd4', score: 35, classification: 'best', explanation: 'Occupies the dual center squares with pawn superiority.' },
  { san: 'Nf6', from: 'g8', to: 'f6', score: 30, classification: 'best', explanation: 'Attacks e4 pawn and develops kingside minor piece.' },
  { san: 'Nc3', from: 'b1', to: 'c3', score: 35, classification: 'best', explanation: 'Defends e4 pawn with natural piece development.' },
  { san: 'g6', from: 'g7', to: 'g6', score: 30, classification: 'good', explanation: 'Prepares kingside fianchetto to challenge the long diagonal.' },
  { san: 'Be3', from: 'c1', to: 'e3', score: 40, classification: 'excellent', explanation: 'Develops bishop preparing potential queenside castling and kingside pawn storm.' },
  { san: 'Bg7', from: 'f8', to: 'g7', score: 35, classification: 'best', explanation: 'Fianchetto completed. Eyes the center.' },
  { san: 'Qd2', from: 'd1', to: 'd2', score: 45, classification: 'best', explanation: 'Forms battery with dark-squared bishop aiming at h6.' },
  { san: 'c6', from: 'c7', to: 'c6', score: 40, classification: 'good', explanation: 'Prepares b5 queenside expansion.' },
  { san: 'f3', from: 'f2', to: 'f3', score: 50, classification: 'excellent', explanation: 'Solidifies e4 pawn, blunts g7 bishop diagonal.' },
  { san: 'b5', from: 'b7', to: 'b5', score: 45, classification: 'good', explanation: 'Aggressive queenside flank counterplay.' },
  { san: 'Nge2', from: 'g1', to: 'e2', score: 55, classification: 'excellent', explanation: 'Flexible development without obstructing f3 pawn.' },
  { san: 'Nbd7', from: 'b8', to: 'd7', score: 50, classification: 'good', explanation: 'Develops remaining knight toward c5.' },
  { san: 'Bh6', from: 'e3', to: 'h6', score: 75, classification: 'brilliant', explanation: 'Immediate exchange of dark-squared defensive defender!' },
  { san: 'Bxh6', from: 'g7', to: 'h6', score: 80, classification: 'best', explanation: 'Forced capture.' },
  { san: 'Qxh6', from: 'd2', to: 'h6', score: 90, classification: 'best', explanation: 'Queen infiltrates black kingside.' },
  { san: 'Bb7', from: 'c8', to: 'b7', score: 110, classification: 'inaccuracy', explanation: 'Passive square for the bishop, a6 or e5 was preferable.' },
];

export default function AnalysisPage() {
  const { character, headwear, accessory, palette, personality } = useCompanion();
  const { evaluatePosition, isReady: isEngineReady } = useStockfish();

  // Moves list for analysis
  const [moves, setMoves] = useState<MoveNode[]>(() => {
    const tempGame = new Chess();
    return SAMPLE_GAME_MOVES.map((m) => {
      tempGame.move({ from: m.from as Square, to: m.to as Square });
      return {
        san: m.san,
        from: m.from as Square,
        to: m.to as Square,
        fen: tempGame.fen(),
        score: m.score,
        classification: m.classification as MoveClassification,
        explanation: m.explanation,
      };
    });
  });

  const [currentStep, setCurrentStep] = useState<number>(moves.length - 1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [boardFlipped, setBoardFlipped] = useState<boolean>(false);

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<
    { sender: 'user' | 'gambit'; text: string; time: string }[]
  >([
    {
      sender: 'gambit',
      text: "Welcome to the Analysis Room! Ask me anything about this game, move inaccuracies, or tactical concepts.",
      time: 'Just now',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isGambitTyping, setIsGambitTyping] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Current active game state
  const currentMove = moves[currentStep];
  const currentFen = currentMove?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const currentEvaluation: EvaluationData = {
    score: currentMove?.score ?? 0,
    mate: null,
  };

  // Auto-play through moves
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= moves.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlaying, moves.length]);

  // Classification summary statistics
  const summaryStats = useMemo(() => {
    const counts: Record<MoveClassification, number> = {
      brilliant: 0,
      best: 0,
      excellent: 0,
      good: 0,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0,
      missed_win: 0,
    };
    moves.forEach((m) => {
      if (counts[m.classification] !== undefined) {
        counts[m.classification]++;
      }
    });

    const total = moves.length;
    const positive = counts.brilliant + counts.best + counts.excellent + counts.good;
    const accuracy = total > 0 ? Math.round((positive / total) * 100) : 85;

    return { counts, accuracy };
  }, [moves]);

  // AI Chat Handler
  const handleAskGambit = (promptText?: string) => {
    const q = promptText || inputQuestion.trim();
    if (!q) return;

    const userMsg = { sender: 'user' as const, text: q, time: 'Now' };
    setChatMessages((prev) => [...prev, userMsg]);
    if (!promptText) setInputQuestion('');

    setIsGambitTyping(true);

    setTimeout(() => {
      let reply = '';
      const moveName = currentMove ? currentMove.san : 'this position';
      const score = currentMove ? (currentMove.score / 100).toFixed(1) : '0.0';

      if (q.toLowerCase().includes('blunder') || q.toLowerCase().includes('mistake')) {
        reply = `In move ${currentStep + 1} (${moveName}), the evaluation shifted by ${score} pawns. The critical issue was piece vulnerability and lack of king shelter.`;
      } else if (q.toLowerCase().includes('best move') || q.toLowerCase().includes('better')) {
        reply = `At this position (${moveName}), the engine favors central control. Consolidating the kingside while restraining opponent pawns gives the most persistent edge.`;
      } else if (q.toLowerCase().includes('plan')) {
        reply = `The plan here is simple: control the open files, trade down while up material, and don't allow counter-tactics against your king!`;
      } else {
        reply = currentMove?.explanation
          ? `Regarding ${moveName}: ${currentMove.explanation} Overall eval sits at +${score}.`
          : `We have a solid position here at +${score}. Keep piece harmony high!`;
      }

      setChatMessages((prev) => [...prev, { sender: 'gambit', text: reply, time: 'Just now' }]);
      setIsGambitTyping(false);

      // Speak reply in companion voice
      companionVoice.speak(reply, personality);

      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 700);
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#2a2a2a] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            <h1 className="text-2xl font-bold text-gray-100">Analysis & AI Review</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono">
              PHASE 6 DEEP ENGINE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Move-by-move evaluation graph, tactical breakdown, and interactive AI coaching.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setBoardFlipped(!boardFlipped)}
          >
            🔄 Flip Board
          </Button>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
        {/* Left: Interactive Chessboard & Move Bar */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-[560px]">
            <ChessBoard
              fen={currentFen}
              selectedSquare={null}
              legalMoves={[]}
              lastMove={currentMove ? { from: currentMove.from, to: currentMove.to } : null}
              isCheck={false}
              turn="w"
              boardFlipped={boardFlipped}
              evaluation={currentEvaluation}
              onSquareClick={() => {}}
            />

            {/* Move Playback Controls */}
            <div className="flex items-center justify-between mt-4 p-3 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentStep(0)}
                  disabled={currentStep === 0}
                  className="px-2.5 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2e2e2e] disabled:opacity-30 text-xs font-bold text-gray-300"
                  title="First Move"
                >
                  ⏮
                </button>
                <button
                  onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                  className="px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2e2e2e] disabled:opacity-30 text-xs font-bold text-gray-300"
                  title="Previous Move"
                >
                  ◀
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs font-bold"
                  title="Auto-play"
                >
                  {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
                <button
                  onClick={() => setCurrentStep((prev) => Math.min(moves.length - 1, prev + 1))}
                  disabled={currentStep >= moves.length - 1}
                  className="px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2e2e2e] disabled:opacity-30 text-xs font-bold text-gray-300"
                  title="Next Move"
                >
                  ▶
                </button>
                <button
                  onClick={() => setCurrentStep(moves.length - 1)}
                  disabled={currentStep >= moves.length - 1}
                  className="px-2.5 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2e2e2e] disabled:opacity-30 text-xs font-bold text-gray-300"
                  title="Latest Move"
                >
                  ⏭
                </button>
              </div>

              <div className="text-xs font-mono text-gray-300">
                Move {currentStep + 1} of {moves.length}
                {currentMove && (
                  <span className="ml-2 px-2 py-0.5 rounded bg-[#242424] text-green-400 font-bold">
                    {currentMove.san}
                  </span>
                )}
              </div>
            </div>

            {/* Move Explanation Card */}
            {currentMove && (
              <div className="mt-3 p-3.5 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] flex items-start gap-3">
                <div
                  className="px-2 py-1 rounded text-xs font-bold flex-shrink-0"
                  style={{
                    backgroundColor: CLASSIFICATION_BADGES[currentMove.classification].bg,
                    color: CLASSIFICATION_BADGES[currentMove.classification].color,
                  }}
                >
                  {CLASSIFICATION_BADGES[currentMove.classification].symbol} {CLASSIFICATION_BADGES[currentMove.classification].label}
                </div>
                <div className="text-xs text-gray-300 leading-relaxed">
                  {currentMove.explanation || 'Solid developmental move maintaining positional tension.'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Evaluation Graph, Move Table, & AI Conversation */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* 1. Interactive Evaluation Graph */}
          <div className="p-4 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                📈 Evaluation Curve
              </span>
              <span className="text-xs font-mono font-bold text-green-400">
                Accuracy: {summaryStats.accuracy}%
              </span>
            </div>

            {/* SVG Centipawn Chart */}
            <div className="w-full h-24 relative bg-[#141416] rounded-lg border border-[#242424] overflow-hidden flex items-center">
              <div className="absolute inset-x-0 top-1/2 border-b border-gray-700/40 border-dashed" />
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 50">
                <defs>
                  <linearGradient id="evalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Curve path */}
                <path
                  d={moves
                    .map((m, i) => {
                      const x = (i / (moves.length - 1 || 1)) * 100;
                      // Clamped score from -300 to +300 mapped to 50 to 0
                      const clamped = Math.max(-300, Math.min(300, m.score));
                      const y = 25 - (clamped / 300) * 22;
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                />

                {/* Current step marker indicator */}
                {moves.length > 0 && (
                  <circle
                    cx={(currentStep / (moves.length - 1 || 1)) * 100}
                    cy={25 - (Math.max(-300, Math.min(300, currentMove?.score || 0)) / 300) * 22}
                    r="3.5"
                    fill="#ffffff"
                    stroke="#22c55e"
                    strokeWidth="2"
                  />
                )}
              </svg>
            </div>
          </div>

          {/* 2. Move Classification Stats Badges */}
          <div className="p-3.5 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
              Move Classifications
            </span>
            <div className="grid grid-cols-4 gap-2">
              {(['brilliant', 'best', 'excellent', 'good'] as MoveClassification[]).map((c) => (
                <div
                  key={c}
                  className="p-2 rounded-lg text-center"
                  style={{ backgroundColor: CLASSIFICATION_BADGES[c].bg }}
                >
                  <div className="text-xs font-bold" style={{ color: CLASSIFICATION_BADGES[c].color }}>
                    {CLASSIFICATION_BADGES[c].symbol} {summaryStats.counts[c]}
                  </div>
                  <div className="text-[10px] text-gray-400 capitalize">{c}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Interactive AI Analysis Chat with Gambit */}
          <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] flex flex-col h-[340px]">
            {/* Chat Header */}
            <div className="p-3 border-b border-[#2a2a2a] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CompanionAvatar
                  state={isGambitTyping ? 'thinking' : 'idle'}
                  size={28}
                  character={character}
                  headwear={headwear}
                  accessory={accessory}
                  palette={palette}
                />
                <span className="text-xs font-bold text-gray-200">
                  Ask Gambit (AI Coach)
                </span>
              </div>
              <span className="text-[10px] text-green-400 font-mono">ONLINE</span>
            </div>

            {/* Chat Messages Log */}
            <div ref={chatScrollRef} className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-green-500/20 text-green-200 border border-green-500/30'
                        : 'bg-[#22272e] text-gray-200 border border-[#2e3742]'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isGambitTyping && (
                <div className="text-xs text-gray-400 italic flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce delay-75" />
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce delay-150" />
                  <span>Gambit is calculating...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="px-3 py-1.5 border-t border-[#2a2a2a] flex gap-1.5 overflow-x-auto scrollbar-none">
              {[
                'Why was this move good?',
                'What was the best move here?',
                'What is the strategic plan?',
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskGambit(p)}
                  className="text-[10px] whitespace-nowrap px-2 py-0.5 rounded bg-[#242424] hover:bg-[#2c2c2c] text-gray-300 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskGambit();
              }}
              className="p-2.5 border-t border-[#2a2a2a] flex gap-2"
            >
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder="Ask about this position or move..."
                className="flex-1 bg-[#121316] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-green-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-400 text-neutral-900 font-bold text-xs transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
