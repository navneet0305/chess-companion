import { useState, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import type { Square, Move, Color, PieceSymbol } from 'chess.js';
import type {
  GameState,
  GameStatus,
  GameResult,
  GameEndReason,
  PlayerColor,
  Difficulty,
} from '../types/chess';

interface GameConfig {
  playerColor?: PlayerColor;
  difficulty?: Difficulty;
  fen?: string;
}

function computeCapturedPieces(game: Chess): { w: PieceSymbol[]; b: PieceSymbol[] } {
  const starting: Record<Color, Record<PieceSymbol, number>> = {
    w: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
    b: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
  };
  const current: Record<Color, Record<PieceSymbol, number>> = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
  };

  const board = game.board();
  for (const row of board) {
    for (const square of row) {
      if (square) {
        current[square.color][square.type]++;
      }
    }
  }

  const captured: { w: PieceSymbol[]; b: PieceSymbol[] } = { w: [], b: [] };
  (['w', 'b'] as Color[]).forEach((color) => {
    (['p', 'n', 'b', 'r', 'q'] as PieceSymbol[]).forEach((type) => {
      const lost = Math.max(0, starting[color][type] - current[color][type]);
      for (let i = 0; i < lost; i++) {
        captured[color].push(type);
      }
    });
  });

  return captured;
}

function deriveGameOver(game: Chess): {
  isGameOver: boolean;
  result: GameResult;
  endReason: GameEndReason;
} {
  if (game.isCheckmate()) {
    return {
      isGameOver: true,
      result: game.turn() === 'w' ? 'black' : 'white',
      endReason: 'checkmate',
    };
  }
  if (game.isStalemate()) {
    return { isGameOver: true, result: 'draw', endReason: 'stalemate' };
  }
  if (game.isThreefoldRepetition()) {
    return { isGameOver: true, result: 'draw', endReason: 'threefold_repetition' };
  }
  if (game.isInsufficientMaterial()) {
    return { isGameOver: true, result: 'draw', endReason: 'insufficient_material' };
  }
  if (game.isDraw()) {
    // Covers 50-move rule and other draw conditions
    return { isGameOver: true, result: 'draw', endReason: 'fifty_moves' };
  }
  return { isGameOver: false, result: null, endReason: null };
}

function buildState(
  game: Chess,
  extras: {
    selectedSquare: Square | null;
    legalMoves: Square[];
    lastMove: { from: Square; to: Square } | null;
    status: GameStatus;
    result: GameResult;
    endReason: GameEndReason;
    playerColor: PlayerColor;
    difficulty: Difficulty;
    boardFlipped: boolean;
  },
): GameState {
  const history = game.history({ verbose: true });
  return {
    fen: game.fen(),
    turn: game.turn(),
    isCheck: game.isCheck(),
    isCheckmate: game.isCheckmate(),
    isStalemate: game.isStalemate(),
    isDraw: game.isDraw(),
    isGameOver: game.isGameOver(),
    moveHistory: history,
    capturedPieces: computeCapturedPieces(game),
    selectedSquare: extras.selectedSquare,
    legalMoves: extras.legalMoves,
    lastMove: extras.lastMove,
    status: extras.status,
    result: extras.result,
    endReason: extras.endReason,
    playerColor: extras.playerColor,
    difficulty: extras.difficulty,
    boardFlipped: extras.boardFlipped,
  };
}

export function useChessGame(initialConfig?: GameConfig) {
  const gameRef = useRef<Chess>(new Chess(initialConfig?.fen));

  const [gameState, setGameState] = useState<GameState>(() =>
    buildState(gameRef.current, {
      selectedSquare: null,
      legalMoves: [],
      lastMove: null,
      status: 'idle',
      result: null,
      endReason: null,
      playerColor: initialConfig?.playerColor ?? 'w',
      difficulty: initialConfig?.difficulty ?? 'intermediate',
      boardFlipped: (initialConfig?.playerColor ?? 'w') === 'b',
    }),
  );

  const updateState = useCallback(
    (
      overrides: Partial<{
        selectedSquare: Square | null;
        legalMoves: Square[];
        lastMove: { from: Square; to: Square } | null;
        status: GameStatus;
        result: GameResult;
        endReason: GameEndReason;
        playerColor: PlayerColor;
        difficulty: Difficulty;
        boardFlipped: boolean;
      }> = {},
    ) => {
      setGameState((prev) => {
        const game = gameRef.current;
        const gameOver = deriveGameOver(game);
        const status: GameStatus = gameOver.isGameOver
          ? 'ended'
          : overrides.status ?? prev.status;
        return buildState(game, {
          selectedSquare: overrides.selectedSquare ?? null,
          legalMoves: overrides.legalMoves ?? [],
          lastMove: overrides.lastMove ?? prev.lastMove,
          status,
          result: gameOver.isGameOver ? gameOver.result : (overrides.result ?? prev.result),
          endReason: gameOver.isGameOver
            ? gameOver.endReason
            : (overrides.endReason ?? prev.endReason),
          playerColor: overrides.playerColor ?? prev.playerColor,
          difficulty: overrides.difficulty ?? prev.difficulty,
          boardFlipped: overrides.boardFlipped ?? prev.boardFlipped,
        });
      });
    },
    [],
  );

  const makeMove = useCallback(
    (from: Square, to: Square, promotion?: PieceSymbol): Move | null => {
      const game = gameRef.current;
      try {
        const move = game.move({ from, to, promotion: promotion ?? 'q' });
        if (move) {
          updateState({ lastMove: { from: move.from as Square, to: move.to as Square }, status: 'playing' });
          return move;
        }
        return null;
      } catch {
        return null;
      }
    },
    [updateState],
  );

  const selectSquare = useCallback(
    (square: Square) => {
      const game = gameRef.current;
      const piece = game.get(square);

      // If a square is already selected, try to move there
      if (gameState.selectedSquare) {
        if (gameState.legalMoves.includes(square)) {
          // Check if promotion is needed
          const selectedPiece = game.get(gameState.selectedSquare);
          const isPromotion =
            selectedPiece?.type === 'p' &&
            ((selectedPiece.color === 'w' && square[1] === '8') ||
              (selectedPiece.color === 'b' && square[1] === '1'));
          makeMove(gameState.selectedSquare, square, isPromotion ? 'q' : undefined);
          return;
        }
        // Clicked on own piece — reselect
        if (piece && piece.color === game.turn()) {
          const moves = game.moves({ square, verbose: true });
          updateState({
            selectedSquare: square,
            legalMoves: moves.map((m) => m.to as Square),
            status: gameState.status,
          });
          return;
        }
        // Deselect
        updateState({ selectedSquare: null, legalMoves: [], status: gameState.status });
        return;
      }

      // No square selected yet — select own piece
      if (piece && piece.color === game.turn()) {
        const moves = game.moves({ square, verbose: true });
        updateState({
          selectedSquare: square,
          legalMoves: moves.map((m) => m.to as Square),
          status: gameState.status,
        });
      }
    },
    [gameState.selectedSquare, gameState.legalMoves, gameState.status, makeMove, updateState],
  );

  const undoMove = useCallback(() => {
    const game = gameRef.current;
    // Undo 2 moves (AI + player)
    game.undo();
    game.undo();
    updateState({ status: 'playing' });
  }, [updateState]);

  const resetGame = useCallback(
    (config?: GameConfig) => {
      const game = gameRef.current;
      if (config?.fen) {
        game.load(config.fen);
      } else {
        game.reset();
      }
      const playerColor = config?.playerColor ?? 'w';
      updateState({
        selectedSquare: null,
        legalMoves: [],
        lastMove: null,
        status: 'idle',
        result: null,
        endReason: null,
        playerColor,
        difficulty: config?.difficulty ?? 'intermediate',
        boardFlipped: playerColor === 'b',
      });
    },
    [updateState],
  );

  const flipBoard = useCallback(() => {
    updateState({ boardFlipped: !gameState.boardFlipped, status: gameState.status });
  }, [gameState.boardFlipped, gameState.status, updateState]);

  const resign = useCallback(() => {
    const result: GameResult = gameState.playerColor === 'w' ? 'black' : 'white';
    updateState({
      status: 'ended',
      result,
      endReason: 'resignation',
    });
  }, [gameState.playerColor, updateState]);

  const setMoveClassification = useCallback(
    (
      moveIndex: number,
      classification: import('../types/chess').MoveClassification,
      extra?: Partial<import('../types/chess').ClassifiedMove>,
    ) => {
      setGameState((prev) => {
        const historyCopy = [...prev.moveHistory];
        if (historyCopy[moveIndex]) {
          Object.assign(historyCopy[moveIndex], {
            classification,
            ...extra,
          });
        }
        return {
          ...prev,
          moveHistory: historyCopy,
        };
      });
    },
    [],
  );

  const syncGameState = useCallback(() => {
    updateState();
  }, [updateState]);

  return {
    ...gameState,
    game: gameRef.current,
    selectSquare,
    makeMove,
    undoMove,
    resetGame,
    flipBoard,
    resign,
    setMoveClassification,
    syncGameState,
  };
}
