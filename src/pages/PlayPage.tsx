'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Square, PieceSymbol, Color } from 'chess.js';
import ChessBoard from '../components/chess/ChessBoard';
import type { BoardWalkEvent } from '../components/chess/BoardCompanionWalker3D';
import PlayerCard from '../components/chess/PlayerCard';
import GameControls from '../components/chess/GameControls';
import GameStatus from '../components/chess/GameStatus';
import MoveHistory from '../components/chess/MoveHistory';
import PromotionDialog from '../components/chess/PromotionDialog';
import CompanionFloatingPresence from '../components/companion/CompanionFloatingPresence';
import CompanionSidebarControls from '../components/companion/CompanionSidebarControls';
import {
  useCompanionController,
  type CompanionEventPayload,
} from '../hooks/useCompanionController';
import type { DialogueContext } from '../lib/companionDialogueEngine';
import NewGameDialog, { NewGameConfig } from '../components/game-setup/NewGameDialog';
import Button from '../components/ui/Button';
import { useChessGame } from '../hooks/useChessGame';
import { useStockfish } from '../hooks/useStockfish';
import { useChessClock } from '../hooks/useChessClock';
import { useSounds } from '../hooks/useSounds';
import { DIFFICULTY_CONFIG, TIME_CONTROLS, Difficulty } from '../types/chess';
import type { Personality } from '../types/companion';
import { getMaterialBalance } from '../lib/chess-utils';
import { detectChessEvent } from '../services/eventDetector';
import { classifyMove } from '../services/moveClassifier';
import { usePieceAbilities } from '../contexts/AbilityContext';
import { useEliminationFx } from '../contexts/EliminationContext';
import { evaluatePieceAbilities, checkEnemyEnteredBishopDiagonal } from '../services/abilityEngine';
import PieceCustomizerModal from '../components/abilities/PieceCustomizerModal';
import { Chess } from 'chess.js';
import type { ChessEvent } from '../lib/dialogueLibrary';

export default function PlayPage() {
  const [isNewGameOpen, setIsNewGameOpen] = useState(false);
  const [isAbilitiesModalOpen, setIsAbilitiesModalOpen] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('intermediate');
  const [companionPersonality, setCompanionPersonality] = useState<Personality>('roaster');
  const [latestEvent, setLatestEvent] = useState<CompanionEventPayload | null>(null);
  const [promotionPending, setPromotionPending] = useState<{
    from: Square;
    to: Square;
    color: Color;
  } | null>(null);

  // Piece Superpower Abilities Hook
  const { abilitiesEnabled, abilities, triggerAbilityEvent } = usePieceAbilities();

  // Capture Elimination FX Hook
  const { eliminationEnabled, toggleEliminationEnabled, triggerElimination } = useEliminationFx();

  // 3D Board Companion Walker state (Bruno walks onto board to move/take pieces)
  const [boardWalkerEnabled, setBoardWalkerEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('chessmate_board_walker_enabled');
      if (saved !== null) return JSON.parse(saved) === true;
    } catch {}
    return true;
  });
  const [boardWalkEvent, setBoardWalkEvent] = useState<BoardWalkEvent | null>(null);
  const [hiddenSquare, setHiddenSquare] = useState<Square | null>(null);
  const [isWalkInProgress, setIsWalkInProgress] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('chessmate_board_walker_enabled', JSON.stringify(boardWalkerEnabled));
    } catch {}
  }, [boardWalkerEnabled]);

  const triggerCompanionEvent = useCallback((event: ChessEvent, context?: DialogueContext) => {
    setLatestEvent({ id: Date.now() + Math.random(), event, context });
  }, []);

  // Sound effects
  const { playMoveSound } = useSounds();

  // Chess Game State
  const {
    fen,
    turn,
    isCheck,
    isCheckmate,
    isStalemate,
    isDraw,
    isGameOver,
    moveHistory,
    capturedPieces,
    selectedSquare,
    legalMoves,
    lastMove,
    status,
    result,
    endReason,
    playerColor,
    boardFlipped,
    game,
    selectSquare,
    makeMove,
    undoMove,
    resetGame,
    flipBoard,
    resign,
    setMoveClassification,
    syncGameState,
  } = useChessGame({
    playerColor: 'w',
    difficulty: 'intermediate',
  });

  // Stockfish Engine Hook
  const {
    isReady: isEngineReady,
    isThinking: isEngineThinking,
    currentEval,
    getBestMove,
    evaluatePosition,
    setDifficulty,
    initialize: initEngine,
  } = useStockfish();

  // Dual Clocks (Default 10 min, 0 inc)
  const [activeTimeControl, setActiveTimeControl] = useState(TIME_CONTROLS[6]);
  const clock = useChessClock(activeTimeControl.time, activeTimeControl.increment);
  const isUnlimitedTime = activeTimeControl.time === 0;
  const isBoardWalkerActive = boardWalkerEnabled && isUnlimitedTime;

  const companion = useCompanionController({
    status,
    isThinking: isEngineThinking,
    latestEvent,
    liveContext: {
      evalScore: currentEval.score,
      bestMove: currentEval.bestMove,
      playerColor,
      moveNumber: Math.ceil(moveHistory.length / 2),
      isCheck,
    },
    personality: companionPersonality,
    onPersonalityChange: setCompanionPersonality,
  });

  const currentEvalRef = useRef(currentEval);
  useEffect(() => {
    currentEvalRef.current = currentEval;
  }, [currentEval]);

  // Initial evaluation on mount / engine ready
  useEffect(() => {
    if (isEngineReady) {
      evaluatePosition(game.fen());
    }
  }, [isEngineReady, evaluatePosition, game]);

  // Handle move evaluation & companion reaction dispatch
  const processMoveAnalysis = useCallback(
    async (move: import('chess.js').Move, fenBefore: string, isPlayerMove: boolean, moveIndex: number) => {
      const evalBefore = currentEvalRef.current;
      const gameBefore = new Chess(fenBefore);

      // Evaluate new board position
      const evalAfter = await evaluatePosition(game.fen());
      const bestMove = evalBefore.bestMove || null;

      // Classify the move
      const result = classifyMove(move, gameBefore, evalBefore, evalAfter, bestMove);
      setMoveClassification(moveIndex, result.classification, {
        centipawnLoss: result.centipawnLoss,
        evalBefore: result.evalBefore,
        evalAfter: result.evalAfter,
      });

      const pieceNames: Record<string, string> = {
        p: 'Pawn',
        n: 'Knight',
        b: 'Bishop',
        r: 'Rook',
        q: 'Queen',
        k: 'King',
      };
      const moveCtx: DialogueContext = {
        moveSan: move.san,
        capturedPieceName: move.captured ? pieceNames[move.captured] : undefined,
        moveNumber: Math.ceil((moveIndex + 1) / 2),
      };

      // Priority Companion Reactions
      if (isPlayerMove) {
        if (result.classification === 'brilliant') {
          triggerCompanionEvent('brilliant', moveCtx);
          return;
        }
        if (result.classification === 'blunder') {
          triggerCompanionEvent('blunder', moveCtx);
          return;
        }
        if (result.tacticalEvent === 'hanging_piece') {
          triggerCompanionEvent('hanging_piece', moveCtx);
          return;
        }
        if (result.classification === 'missed_win') {
          triggerCompanionEvent('missed_opportunity', moveCtx);
          return;
        }
      } else {
        // AI move
        if (result.classification === 'blunder') {
          triggerCompanionEvent('opponent_blunder', moveCtx);
          return;
        }
      }

      // Fallback to rule-based event detector
      const ev = detectChessEvent(move, game, isPlayerMove);
      triggerCompanionEvent(ev.event, moveCtx);
    },
    [evaluatePosition, game, setMoveClassification, triggerCompanionEvent],
  );

  const executeMoveWithOptionalWalk = useCallback(
    (params: {
      from: Square;
      to: Square;
      promotion?: PieceSymbol;
      isPlayerMove: boolean;
    }): boolean => {
      const { from, to, promotion, isPlayerMove } = params;

      // Validate move legality before starting walk animation
      const probe = new Chess(game.fen());
      let validMove: import('chess.js').Move | null = null;
      try {
        validMove = probe.move({ from, to, promotion: promotion ?? 'q' });
      } catch {
        return false;
      }
      if (!validMove) return false;

      const commitMove = () => {
        setHiddenSquare(null);
        const fenBefore = game.fen();
        const moveIdx = game.history().length;
        const movingPiece = game.get(from);
        const move = makeMove(from, to, promotion);
        if (move) {
          playMoveSound(move);
          if (move.captured) {
            triggerElimination(move);
          }

          if (abilitiesEnabled && movingPiece) {
            if (isPlayerMove) {
              const outcome = evaluatePieceAbilities({
                game,
                from: move.from,
                to: move.to,
                movingPiece,
                playerColor,
                abilitiesState: { enabled: abilitiesEnabled, abilities },
              });
              if (outcome.event) {
                triggerAbilityEvent(outcome.event);
                syncGameState();
                triggerCompanionEvent('brilliant');
              }
            } else {
              const bishopEvent = checkEnemyEnteredBishopDiagonal({
                game,
                enemyMoveTo: move.to,
                playerColor,
                abilitiesState: { enabled: abilitiesEnabled, abilities },
              });
              if (bishopEvent) {
                triggerAbilityEvent(bishopEvent);
                syncGameState();
                triggerCompanionEvent('opponent_blunder');
              }
            }
          }

          processMoveAnalysis(move, fenBefore, isPlayerMove, moveIdx);
          if (activeTimeControl.time > 0) {
            if (isPlayerMove && !clock.isRunning) {
              clock.start(playerColor);
            } else {
              clock.switchClock();
            }
          }
        }
      };

      // Board Walker ONLY runs when there is NO time bound (Unlimited) & Board Walker is ON
      const shouldWalk =
        isBoardWalkerActive && (Boolean(validMove.captured) || !isPlayerMove);

      if (!shouldWalk) {
        commitMove();
        return true;
      }

      // Lock board so the piece stays at fromSquare until Bruno emerges from top box,
      // picks it up, carries it to toSquare, and sets it down!
      setIsWalkInProgress(true);
      setBoardWalkEvent({
        id: `walk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        fromSquare: from,
        toSquare: to,
        pieceType: validMove.piece,
        pieceColor: validMove.color,
        capturedType: validMove.captured,
        capturedColor: validMove.captured ? (validMove.color === 'w' ? 'b' : 'w') : undefined,
        onPickup: () => {
          setHiddenSquare(from);
        },
        onCommitMove: () => {
          commitMove();
        },
        onComplete: () => {
          setHiddenSquare(null);
          setIsWalkInProgress(false);
        },
      });
      return true;
    },
    [
      game,
      makeMove,
      playMoveSound,
      triggerElimination,
      abilitiesEnabled,
      abilities,
      playerColor,
      triggerAbilityEvent,
      syncGameState,
      triggerCompanionEvent,
      processMoveAnalysis,
      activeTimeControl.time,
      clock,
      isBoardWalkerActive,
    ]
  );

  // Initialize engine on mount
  useEffect(() => {
    initEngine();
  }, [initEngine]);

  // Handle Timeout
  useEffect(() => {
    if (clock.isTimeout && !isGameOver) {
      if (clock.activeColor === playerColor) {
        resign();
      }
    }
  }, [clock.isTimeout, isGameOver, clock.activeColor, playerColor, resign]);

  // Trigger AI move when it's AI's turn
  const aiThinkingRef = useRef(false);

  useEffect(() => {
    if (isGameOver || status === 'ended' || isWalkInProgress) return;

    const isAiTurn = turn !== playerColor;

    if (isAiTurn && !aiThinkingRef.current && isEngineReady) {
      aiThinkingRef.current = true;
      const config = DIFFICULTY_CONFIG[currentDifficulty];

      // Request best move from engine
      getBestMove(fen, config.depth, config.moveTime).then((moveStr) => {
        aiThinkingRef.current = false;
        if (!moveStr || moveStr === '(none)') {
          const legal = game.moves({ verbose: true });
          if (legal.length > 0 && !game.isGameOver()) {
            const fallbackMove = legal[0];
            executeMoveWithOptionalWalk({
              from: fallbackMove.from,
              to: fallbackMove.to,
              promotion: fallbackMove.promotion,
              isPlayerMove: false,
            });
          }
          return;
        }

        const from = moveStr.slice(0, 2) as Square;
        const to = moveStr.slice(2, 4) as Square;
        const promotion = (moveStr[4] as PieceSymbol) || undefined;
        executeMoveWithOptionalWalk({
          from,
          to,
          promotion,
          isPlayerMove: false,
        });
      });
    }
  }, [
    fen,
    turn,
    playerColor,
    isGameOver,
    status,
    isWalkInProgress,
    isEngineReady,
    currentDifficulty,
    getBestMove,
    game,
    executeMoveWithOptionalWalk,
  ]);

  // Handle Square Clicks with Promotion Dialog Support
  const handleSquareClick = useCallback(
    (square: Square) => {
      if (isGameOver || turn !== playerColor || isEngineThinking || isWalkInProgress) return;

      if (selectedSquare) {
        const piece = game.get(selectedSquare);
        const isPromo =
          piece?.type === 'p' &&
          piece.color === playerColor &&
          ((playerColor === 'w' && square[1] === '8') ||
            (playerColor === 'b' && square[1] === '1')) &&
          legalMoves.includes(square);

        if (isPromo) {
          setPromotionPending({ from: selectedSquare, to: square, color: playerColor });
          return;
        }

        const moved = executeMoveWithOptionalWalk({
          from: selectedSquare,
          to: square,
          isPlayerMove: true,
        });
        if (moved) return;
      }

      selectSquare(square);
    },
    [
      selectedSquare,
      legalMoves,
      game,
      playerColor,
      isGameOver,
      turn,
      isEngineThinking,
      isWalkInProgress,
      selectSquare,
      executeMoveWithOptionalWalk,
    ]
  );

  // Handle Drag & Drop Moves
  const handleMoveDrop = useCallback(
    (from: Square, to: Square) => {
      if (isGameOver || turn !== playerColor || isEngineThinking || isWalkInProgress) return;

      const piece = game.get(from);
      const isPromo =
        piece?.type === 'p' &&
        piece.color === playerColor &&
        ((playerColor === 'w' && to[1] === '8') || (playerColor === 'b' && to[1] === '1'));

      if (isPromo) {
        setPromotionPending({ from, to, color: playerColor });
        return;
      }

      executeMoveWithOptionalWalk({
        from,
        to,
        isPlayerMove: true,
      });
    },
    [
      isGameOver,
      turn,
      playerColor,
      isEngineThinking,
      isWalkInProgress,
      game,
      executeMoveWithOptionalWalk,
    ]
  );

  // Confirm promotion piece
  const handlePromotionSelect = (piece: PieceSymbol) => {
    if (!promotionPending) return;
    const { from, to } = promotionPending;
    setPromotionPending(null);

    executeMoveWithOptionalWalk({
      from,
      to,
      promotion: piece,
      isPlayerMove: true,
    });
  };

  // Start New Game Handler
  const handleStartNewGame = (config: NewGameConfig) => {
    setIsWalkInProgress(false);
    setHiddenSquare(null);
    setBoardWalkEvent(null);
    setCurrentDifficulty(config.difficulty);
    setDifficulty(config.difficulty);
    setActiveTimeControl(config.timeControl);

    // Reset game logic
    resetGame({
      playerColor: config.playerColor,
      difficulty: config.difficulty,
    });

    // Reset clock
    clock.reset(config.timeControl.time);
    if (config.timeControl.time > 0) {
      clock.start('w');
    }

    triggerCompanionEvent('start');
  };

  // AI Opponent details
  const aiInfo = DIFFICULTY_CONFIG[currentDifficulty];
  const materialBal = getMaterialBalance(capturedPieces);

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
      {/* Promotion Dialog Modal */}
      <PromotionDialog
        isOpen={promotionPending !== null}
        color={promotionPending?.color ?? 'w'}
        onSelect={handlePromotionSelect}
        onCancel={() => setPromotionPending(null)}
      />

      {/* New Game Dialog Modal */}
      <NewGameDialog
        isOpen={isNewGameOpen}
        onClose={() => setIsNewGameOpen(false)}
        onStartGame={handleStartNewGame}
        initialDifficulty={currentDifficulty}
        initialTimeControl={activeTimeControl}
        initialPlayerColor={playerColor}
      />

      {/* Piece Superpower Customizer Modal */}
      <PieceCustomizerModal
        isOpen={isAbilitiesModalOpen}
        onClose={() => setIsAbilitiesModalOpen(false)}
      />

      {/* Main Gameplay Screen Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Move History (Desktop) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-4">
          <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a] mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Match Details
              </span>
              <GameStatus
                status={status}
                isCheck={isCheck}
                isCheckmate={isCheckmate}
                isStalemate={isStalemate}
                isDraw={isDraw}
                endReason={endReason}
              />
            </div>

            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex justify-between items-center">
                <span>Opponent:</span>
                <span className="font-semibold text-gray-200">
                  Stockfish
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Difficulty / Elo:</span>
                <select
                  value={currentDifficulty}
                  onChange={(e) => {
                    const val = e.target.value as Difficulty;
                    setCurrentDifficulty(val);
                    setDifficulty(val);
                  }}
                  className="bg-[#242424] border border-[#3a3a3a] text-xs font-semibold text-green-400 rounded px-2 py-1 focus:outline-none focus:border-green-500 cursor-pointer"
                >
                  {Object.entries(DIFFICULTY_CONFIG).map(([k, cfg]) => (
                    <option key={k} value={k}>
                      {cfg.label} ({cfg.elo})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span>Time Control:</span>
                <select
                  value={activeTimeControl.name}
                  onChange={(e) => {
                    const tc = TIME_CONTROLS.find((t) => t.name === e.target.value);
                    if (tc) {
                      setActiveTimeControl(tc);
                      clock.reset(tc.time);
                    }
                  }}
                  className="bg-[#242424] border border-[#3a3a3a] text-xs font-semibold text-gray-200 rounded px-2 py-1 focus:outline-none focus:border-green-500 cursor-pointer"
                >
                  {TIME_CONTROLS.map((tc) => (
                    <option key={tc.name} value={tc.name}>
                      {tc.name === 'Unlimited' ? '∞ Unlimited (3D Walk)' : tc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between">
                <span>Moves Played:</span>
                <span className="font-mono text-gray-200">
                  {Math.ceil(moveHistory.length / 2)}
                </span>
              </div>
            </div>
          </div>

          <MoveHistory
            moves={moveHistory}
            currentMoveIndex={moveHistory.length - 1}
          />
        </div>

        {/* Center: Unframed Companion Stage & Clean Chessboard (no engine bar) */}
        <div className="lg:col-span-6 flex flex-col items-center">
          {/* Opponent Card (Top) */}
          <div className="w-full max-w-[560px] mb-2">
            <PlayerCard
              name={`Stockfish ${aiInfo.label}`}
              subtitle={`Engine ${aiInfo.elo}`}
              isActive={turn !== playerColor && !isGameOver}
              capturedPieces={capturedPieces}
              perspective={playerColor === 'w' ? 'b' : 'w'}
              time={activeTimeControl.time > 0 ? (playerColor === 'w' ? clock.blackTime : clock.whiteTime) : undefined}
              isAI={true}
            />
          </div>

          {/* Piece Customization & Powers Banner */}
          <div className="w-full max-w-[560px] mb-1.5 flex flex-wrap items-center justify-between gap-2 px-1">
            <button
              onClick={() => setIsAbilitiesModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-cyan-950/80 border border-purple-500/50 hover:border-cyan-400 text-xs font-medium text-purple-200 hover:text-white transition shadow-sm group"
            >
              <span className="text-amber-400 text-sm animate-pulse">✨</span>
              <span className="font-semibold text-gray-200">Custom Pieces:</span>
              <span className="text-cyan-300 font-bold">
                One-Eyed Bishop 👁️
              </span>
              <span className="text-gray-500">|</span>
              <span className={abilitiesEnabled ? "text-emerald-400 font-bold" : "text-gray-400"}>
                {abilitiesEnabled ? "⚡ Powers Active" : "Powers Off"}
              </span>
              <span className="text-[11px] text-cyan-300 group-hover:text-cyan-100 underline decoration-cyan-400/60 ml-1">
                Customize ⚙️
              </span>
            </button>

            <button
              type="button"
              onClick={toggleEliminationEnabled}
              title="Toggle unique capture elimination animations & sounds (Pawn Sword Slash, Bishop Pistol Shot, etc.)"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition shadow-sm ${
                eliminationEnabled
                  ? 'bg-rose-950/70 border-rose-500/50 text-rose-200 hover:border-rose-400 hover:text-white'
                  : 'bg-[#1c1d22] border-[#333] text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>{eliminationEnabled ? '⚔️' : '🚫'}</span>
              <span>Elimination FX:</span>
              <span className={eliminationEnabled ? 'text-amber-300' : 'text-gray-500'}>
                {eliminationEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isUnlimitedTime) {
                  const unlimitedTc = TIME_CONTROLS.find((t) => t.time === 0) || TIME_CONTROLS[9];
                  setActiveTimeControl(unlimitedTc);
                  clock.reset(0);
                  setBoardWalkerEnabled(true);
                } else {
                  setBoardWalkerEnabled((prev) => !prev);
                }
              }}
              title="3D Bruno walks out from the top of the board to physically move & take pieces (only active when there is NO time limit / Unlimited)"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition shadow-sm ${
                isBoardWalkerActive
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200 hover:border-emerald-400 hover:text-white'
                  : !isUnlimitedTime
                  ? 'bg-amber-950/50 border-amber-500/40 text-amber-200 hover:border-amber-400'
                  : 'bg-[#1c1d22] border-[#333] text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>{isBoardWalkerActive ? '🚶' : '⏳'}</span>
              <span>Board Walker:</span>
              <span
                className={
                  isBoardWalkerActive
                    ? 'text-emerald-300'
                    : !isUnlimitedTime
                    ? 'text-amber-300'
                    : 'text-gray-500'
                }
              >
                {!isUnlimitedTime ? 'Timed Off (Go ∞)' : boardWalkerEnabled ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          {/* Unframed AI Companion & Floating Speech Bubble directly above the board */}
          <div className="w-full max-w-[560px] relative z-40 overflow-visible">
            <CompanionFloatingPresence
              animationState={companion.animationState}
              activeSkit={companion.activeSkit}
              freeRoam={companion.freeRoam}
              isSpeaking={companion.isSpeaking}
              isGestureOnly={companion.isGestureOnly}
              currentText={companion.currentText}
              character={companion.character}
              characterName={companion.characterName}
              headwear={companion.headwear}
              accessory={companion.accessory}
              palette={companion.palette}
              onCompanionClick={companion.handleCompanionClick}
            />
          </div>

          {/* Clean Chessboard (engine evaluation bar removed) */}
          <div className="w-full max-w-[560px] relative z-10">
            <ChessBoard
              fen={fen}
              selectedSquare={selectedSquare}
              legalMoves={legalMoves}
              lastMove={lastMove}
              isCheck={isCheck}
              turn={turn}
              boardFlipped={boardFlipped}
              boardWalkEvent={boardWalkEvent}
              hiddenSquare={hiddenSquare}
              onSquareClick={handleSquareClick}
              onMoveDrop={handleMoveDrop}
            />
          </div>

          {/* Player Card (Bottom) */}
          <div className="w-full max-w-[560px] mt-2">
            <PlayerCard
              name="You"
              subtitle={playerColor === 'w' ? 'Playing as White' : 'Playing as Black'}
              isActive={turn === playerColor && !isGameOver}
              capturedPieces={capturedPieces}
              perspective={playerColor}
              time={activeTimeControl.time > 0 ? (playerColor === 'w' ? clock.whiteTime : clock.blackTime) : undefined}
              isAI={false}
            />
          </div>

          {/* Game Controls Bar */}
          <div className="w-full max-w-[560px] mt-3">
            <GameControls
              onNewGame={() => setIsNewGameOpen(true)}
              onUndo={undoMove}
              onFlipBoard={flipBoard}
              onResign={resign}
              canUndo={moveHistory.length >= 2 && !isGameOver}
              isGameOver={isGameOver}
            />
          </div>

          {/* Game Over Banner */}
          {isGameOver && (
            <div className="w-full max-w-[560px] mt-4 p-4 rounded-xl border border-green-500/30 bg-green-950/20 text-center animate-fade-in">
              <h3 className="text-base font-bold text-gray-100">
                {result === 'draw'
                  ? 'Game Drawn!'
                  : result === (playerColor === 'w' ? 'white' : 'black')
                  ? '🎉 Victory! You won the game!'
                  : 'Defeat. Stockfish won.'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Reason: {endReason ? endReason.replace('_', ' ') : 'game ended'}
              </p>
              <div className="flex justify-center gap-3 mt-3">
                <Button size="sm" variant="primary" onClick={() => setIsNewGameOpen(true)}>
                  Play Again
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Companion Options, Material Advantage & Quick Settings */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Status on mobile */}
          <div className="flex lg:hidden items-center justify-between p-3 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]">
            <span className="text-xs font-semibold text-gray-400">Status</span>
            <GameStatus
              status={status}
              isCheck={isCheck}
              isCheckmate={isCheckmate}
              isStalemate={isStalemate}
              isDraw={isDraw}
              endReason={endReason}
            />
          </div>

          {/* Companion Interactive Controls & Voice / Personality / Match Bets */}
          <CompanionSidebarControls
            characterName={companion.characterName}
            characterTitle={companion.characterTitle}
            mood={companion.mood}
            personality={companion.personality}
            isVoiceMuted={companion.isVoiceMuted}
            freeRoam={companion.freeRoam}
            activeBet={companion.activeBet}
            voiceSettings={companion.voiceSettings}
            onToggleVoiceMuted={companion.toggleVoiceMuted}
            onSelectPersonality={companion.handleSelectPersonality}
            onInteractiveAction={companion.handleInteractiveAction}
            onToggleFreeRoam={companion.toggleFreeRoam}
            onVoiceSettingChange={companion.handleVoiceSettingChange}
            onTestVoice={() =>
              companion.speakLine(
                `Hey! This is ${companion.characterName} checking in with my realistic voice! Let's crush this match!`,
                companion.personality
              )
            }
            onRunDare={companion.handleRunDare}
            onNextBet={companion.handleNextBet}
          />

          {/* Material Advantage Card */}
          <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Material Balance
            </h4>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300">White vs Black:</span>
              <span
                className={`font-mono font-bold ${
                  materialBal > 0
                    ? 'text-green-400'
                    : materialBal < 0
                    ? 'text-red-400'
                    : 'text-gray-400'
                }`}
              >
                {materialBal > 0 ? `+${materialBal} White` : materialBal < 0 ? `+${Math.abs(materialBal)} Black` : 'Even'}
              </span>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Quick Actions
            </h4>
            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-start bg-gradient-to-r from-purple-700 via-indigo-600 to-cyan-700 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold border border-cyan-400/40 shadow-sm"
                onClick={() => setIsAbilitiesModalOpen(true)}
              >
                <span className="mr-2">✨</span> Customize Pieces & Powers
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-between"
                onClick={toggleEliminationEnabled}
              >
                <span>
                  <span className="mr-2">⚔️</span> Elimination FX
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    eliminationEnabled
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {eliminationEnabled ? 'ON' : 'OFF'}
                </span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-between"
                onClick={() => {
                  if (!isUnlimitedTime) {
                    const unlimitedTc = TIME_CONTROLS.find((t) => t.time === 0) || TIME_CONTROLS[9];
                    setActiveTimeControl(unlimitedTc);
                    clock.reset(0);
                    setBoardWalkerEnabled(true);
                  } else {
                    setBoardWalkerEnabled((prev) => !prev);
                  }
                }}
              >
                <span>
                  <span className="mr-2">🚶</span> 3D Board Walker
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isBoardWalkerActive
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : !isUnlimitedTime
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {!isUnlimitedTime ? 'Unlimited Only' : boardWalkerEnabled ? 'ON' : 'OFF'}
                </span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start"
                onClick={() => setIsNewGameOpen(true)}
              >
                <span className="mr-2">⚙️</span> Change Difficulty / Time
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start"
                onClick={flipBoard}
              >
                <span className="mr-2">🔄</span> Flip Board View
              </Button>
            </div>
          </div>

          {/* Mobile Move History */}
          <div className="lg:hidden">
            <MoveHistory
              moves={moveHistory}
              currentMoveIndex={moveHistory.length - 1}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
