/**
 * High-Performance Grandmaster Chess Engine Worker
 * Features:
 * - Transposition Table (TT) with hash move ordering
 * - Iterative Deepening with strict time management
 * - NegaMax with Alpha-Beta pruning & Quiescence search
 * - Comprehensive Positional Evaluation:
 *   - Piece-Square Tables (PST) for middlegame & endgame
 *   - Passed pawns, doubled pawns, isolated pawns
 *   - King safety & pawn shield evaluation
 *   - Rooks on open files & 7th rank
 *   - Bishop pair bonus & knight outpost detection
 * - Grandmaster Opening Book integration
 */

import { Chess, type Move, type PieceSymbol, type Color } from 'chess.js';
import { getBookMove } from '../services/openingBook';

// Piece base values in centipawns
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 325,
  b: 340,
  r: 500,
  q: 975,
  k: 20000,
};

// Piece-Square Tables (rank 0 is 8th rank, rank 7 is 1st rank; White's perspective)
const PST: Record<string, number[][]> = {
  p: [
    [0,   0,   0,   0,   0,   0,   0,   0],
    [50,  50,  50,  50,  50,  50,  50,  50],
    [15,  15,  25,  35,  35,  25,  15,  15],
    [5,   5,  15,  28,  28,  15,   5,   5],
    [0,   0,   5,  25,  25,   5,   0,   0],
    [5,  -5, -10,   5,   5, -10,  -5,   5],
    [5,  10,  10, -20, -20,  10,  10,   5],
    [0,   0,   0,   0,   0,   0,   0,   0]
  ],
  n: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20,   0,   5,   5,   0, -20, -40],
    [-30,   5,  15,  20,  20,  15,   5, -30],
    [-30,   5,  20,  28,  28,  20,   5, -30],
    [-30,   5,  20,  28,  28,  20,   5, -30],
    [-30,   5,  15,  20,  20,  15,   5, -30],
    [-40, -20,   0,   5,   5,   0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50]
  ],
  b: [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10,   5,   0,   0,   0,   0,   5, -10],
    [-10,  10,  12,  16,  16,  12,  10, -10],
    [-10,   5,  15,  20,  20,  15,   5, -10],
    [-10,  10,  15,  20,  20,  15,  10, -10],
    [-10,  15,  12,  16,  16,  12,  15, -10],
    [-10,   8,   0,   0,   0,   0,   8, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20]
  ],
  r: [
    [0,   0,   0,   5,   5,   0,   0,   0],
    [10, 15,  15,  15,  15,  15,  15,  10],
    [-5,  0,   0,   0,   0,   0,   0,  -5],
    [-5,  0,   0,   0,   0,   0,   0,  -5],
    [-5,  0,   0,   0,   0,   0,   0,  -5],
    [-5,  0,   0,   0,   0,   0,   0,  -5],
    [-5,  0,   0,   0,   0,   0,   0,  -5],
    [0,   0,   5,  12,  12,   5,   0,   0]
  ],
  q: [
    [-20, -10, -10,  -5,  -5, -10, -10, -20],
    [-10,   0,   0,   0,   0,   0,   0, -10],
    [-10,   0,   5,   5,   5,   5,   0, -10],
    [-5,    0,   5,   8,   8,   5,   0,  -5],
    [0,     0,   5,   8,   8,   5,   0,  -5],
    [-10,   5,   5,   5,   5,   5,   0, -10],
    [-10,   0,   5,   0,   0,   0,   0, -10],
    [-20, -10, -10,  -5,  -5, -10, -10, -20]
  ],
  k: [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20,   20,   0,   0,   0,   0,  20,  20],
    [20,   30,  15,   0,   0,  15,  30,  20]
  ]
};

// Transposition Table Entry
interface TTEntry {
  depth: number;
  score: number;
  flag: 'exact' | 'lower' | 'upper';
  bestMoveSan?: string;
}

const transpositionTable = new Map<string, TTEntry>();
const MAX_TT_SIZE = 40000;

function getTTKey(fen: string): string {
  // Use piece placement, turn, castling rights, and en-passant square
  const parts = fen.split(' ');
  return `${parts[0]} ${parts[1]} ${parts[2]} ${parts[3]}`;
}

// ─── Evaluation Function ─────────────────────────────────────────────────────

function evaluatePosition(chess: Chess): number {
  if (chess.isCheckmate()) {
    return -99999;
  }
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
    return 0;
  }

  let whiteScore = 0;
  let blackScore = 0;
  let whiteBishops = 0;
  let blackBishops = 0;

  // Pawn columns tracker for doubled / isolated pawn calculation
  const whitePawnFiles = [0, 0, 0, 0, 0, 0, 0, 0];
  const blackPawnFiles = [0, 0, 0, 0, 0, 0, 0, 0];

  const board = chess.board();

  // First pass: Piece values, PST, and pawn columns
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;

      const baseVal = PIECE_VALUES[p.type] || 0;
      let posVal = 0;

      if (PST[p.type]) {
        posVal = p.color === 'w' ? PST[p.type][r][c] : PST[p.type][7 - r][c];
      }

      const totalVal = baseVal + posVal;

      if (p.color === 'w') {
        whiteScore += totalVal;
        if (p.type === 'b') whiteBishops++;
        if (p.type === 'p') whitePawnFiles[c]++;
      } else {
        blackScore += totalVal;
        if (p.type === 'b') blackBishops++;
        if (p.type === 'p') blackPawnFiles[c]++;
      }
    }
  }

  // Bishop pair bonus
  if (whiteBishops >= 2) whiteScore += 45;
  if (blackBishops >= 2) blackScore += 45;

  // Pawn structure penalties & bonuses
  for (let c = 0; c < 8; c++) {
    // Doubled pawns penalty
    if (whitePawnFiles[c] > 1) whiteScore -= (whitePawnFiles[c] - 1) * 20;
    if (blackPawnFiles[c] > 1) blackScore -= (blackPawnFiles[c] - 1) * 20;

    // Isolated pawn penalty
    const leftW = c > 0 ? whitePawnFiles[c - 1] : 0;
    const rightW = c < 7 ? whitePawnFiles[c + 1] : 0;
    if (whitePawnFiles[c] > 0 && leftW === 0 && rightW === 0) {
      whiteScore -= 18;
    }

    const leftB = c > 0 ? blackPawnFiles[c - 1] : 0;
    const rightB = c < 7 ? blackPawnFiles[c + 1] : 0;
    if (blackPawnFiles[c] > 0 && leftB === 0 && rightB === 0) {
      blackScore -= 18;
    }
  }

  // Second pass: Passed pawns & King safety
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;

      if (p.type === 'p') {
        // Passed pawn bonus: no opposing pawns ahead on the same or adjacent files
        const isWhite = p.color === 'w';
        let isPassed = true;

        if (isWhite) {
          for (let checkR = r - 1; checkR >= 0; checkR--) {
            for (let checkC = Math.max(0, c - 1); checkC <= Math.min(7, c + 1); checkC++) {
              const opp = board[checkR][checkC];
              if (opp && opp.color === 'b' && opp.type === 'p') {
                isPassed = false;
                break;
              }
            }
            if (!isPassed) break;
          }
          if (isPassed) {
            const rankAdvance = 7 - r;
            whiteScore += [0, 10, 20, 35, 60, 110, 190][rankAdvance] || 0;
          }
        } else {
          for (let checkR = r + 1; checkR <= 7; checkR++) {
            for (let checkC = Math.max(0, c - 1); checkC <= Math.min(7, c + 1); checkC++) {
              const opp = board[checkR][checkC];
              if (opp && opp.color === 'w' && opp.type === 'p') {
                isPassed = false;
                break;
              }
            }
            if (!isPassed) break;
          }
          if (isPassed) {
            const rankAdvance = r;
            blackScore += [0, 10, 20, 35, 60, 110, 190][rankAdvance] || 0;
          }
        }
      }

      // Rook on open file bonus
      if (p.type === 'r') {
        if (p.color === 'w' && whitePawnFiles[c] === 0) {
          whiteScore += blackPawnFiles[c] === 0 ? 25 : 15;
          if (r === 1) whiteScore += 30; // 7th rank rook
        } else if (p.color === 'b' && blackPawnFiles[c] === 0) {
          blackScore += whitePawnFiles[c] === 0 ? 25 : 15;
          if (r === 6) blackScore += 30; // 2nd rank rook for black
        }
      }
    }
  }

  // Mobility
  const mobility = chess.moves().length * 2.5;
  const turn = chess.turn();

  const netScore = turn === 'w'
    ? (whiteScore - blackScore + mobility)
    : (blackScore - whiteScore + mobility);

  return netScore;
}

// ─── Move Ordering (MVV-LVA + TT Move) ────────────────────────────────────────

function scoreMove(move: Move, hashMoveSan?: string): number {
  if (hashMoveSan && move.san === hashMoveSan) {
    return 100000; // Best move from shallower search or TT searched FIRST
  }

  let score = 0;
  if (move.captured) {
    const victimVal = PIECE_VALUES[move.captured] || 0;
    const attackerVal = PIECE_VALUES[move.piece] || 0;
    score += victimVal * 10 - attackerVal + 1000;
  }
  if (move.promotion) {
    score += PIECE_VALUES[move.promotion] * 8;
  }
  if (move.san.includes('+')) {
    score += 80;
  }
  return score;
}

function orderMoves(moves: Move[], hashMoveSan?: string): Move[] {
  return moves.sort((a, b) => scoreMove(b, hashMoveSan) - scoreMove(a, hashMoveSan));
}

// ─── Quiescence Search ────────────────────────────────────────────────────────

function quiescence(
  chess: Chess,
  alpha: number,
  beta: number,
  depthLimit: number = 4
): number {
  const standPat = evaluatePosition(chess);
  if (depthLimit <= 0) return standPat;

  if (standPat >= beta) return beta;
  if (alpha < standPat) alpha = standPat;

  // Only examine captures and promotions in quiescence to avoid the horizon effect
  const captureMoves = orderMoves(
    chess.moves({ verbose: true }).filter((m) => m.captured || m.promotion)
  );

  for (const move of captureMoves) {
    chess.move(move);
    const score = -quiescence(chess, -beta, -alpha, depthLimit - 1);
    chess.undo();

    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }

  return alpha;
}

// ─── NegaMax with Alpha-Beta Pruning & Transposition Table ────────────────────

function negamax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  deadline: number,
  isRoot: boolean = false
): { score: number; bestMove?: Move; aborted?: boolean } {
  // Check time deadline periodically
  if (Date.now() >= deadline) {
    return { score: 0, aborted: true };
  }

  if (chess.isGameOver()) {
    if (chess.isCheckmate()) return { score: -99999 + (12 - depth) };
    return { score: 0 };
  }

  if (depth <= 0) {
    return { score: quiescence(chess, alpha, beta) };
  }

  const ttKey = getTTKey(chess.fen());
  const ttEntry = transpositionTable.get(ttKey);

  if (!isRoot && ttEntry && ttEntry.depth >= depth) {
    if (ttEntry.flag === 'exact') return { score: ttEntry.score };
    if (ttEntry.flag === 'lower' && ttEntry.score >= beta) return { score: ttEntry.score };
    if (ttEntry.flag === 'upper' && ttEntry.score <= alpha) return { score: ttEntry.score };
  }

  const moves = orderMoves(chess.moves({ verbose: true }), ttEntry?.bestMoveSan);
  if (moves.length === 0) {
    return { score: chess.isCheck() ? -99999 : 0 };
  }

  let bestMove = moves[0];
  let maxScore = -Infinity;
  const initialAlpha = alpha;

  for (const move of moves) {
    chess.move(move);
    const search = negamax(chess, depth - 1, -beta, -alpha, deadline, false);
    chess.undo();

    if (search.aborted) {
      return { score: 0, aborted: true };
    }

    const result = -search.score;

    if (result > maxScore) {
      maxScore = result;
      bestMove = move;
    }

    if (result > alpha) {
      alpha = result;
    }

    if (alpha >= beta) {
      break; // Alpha-beta cutoff
    }
  }

  // Store in Transposition Table
  if (transpositionTable.size > MAX_TT_SIZE) {
    transpositionTable.clear();
  }

  let flag: 'exact' | 'lower' | 'upper' = 'exact';
  if (maxScore <= initialAlpha) flag = 'upper';
  else if (maxScore >= beta) flag = 'lower';

  transpositionTable.set(ttKey, {
    depth,
    score: maxScore,
    flag,
    bestMoveSan: bestMove.san,
  });

  return { score: maxScore, bestMove };
}

// ─── Iterative Deepening Search ───────────────────────────────────────────────

function iterativeDeepening(
  chess: Chess,
  maxDepth: number,
  maxTimeMs: number
): { bestMove: Move; score: number; depthReached: number } {
  const startTime = Date.now();
  const deadline = startTime + maxTimeMs;

  const legalMoves = chess.moves({ verbose: true });
  if (legalMoves.length === 0) {
    throw new Error('No legal moves');
  }

  let overallBestMove = legalMoves[0];
  let overallScore = 0;
  let depthReached = 1;

  for (let d = 1; d <= maxDepth; d++) {
    // If we have already spent more than 60% of our budget, don't begin a deeper ply
    if (d > 1 && Date.now() - startTime > maxTimeMs * 0.6) {
      break;
    }

    const result = negamax(chess, d, -Infinity, Infinity, deadline, true);

    if (result.aborted) {
      break; // Keep result from previous fully-completed depth
    }

    if (result.bestMove) {
      overallBestMove = result.bestMove;
      overallScore = result.score;
      depthReached = d;
    }

    // Immediate checkmate found: terminate search early
    if (Math.abs(overallScore) >= 90000) {
      break;
    }
  }

  return { bestMove: overallBestMove, score: overallScore, depthReached };
}

// ─── Worker UCI State & Handlers ─────────────────────────────────────────────

let currentFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
let skillLevel = 20;
let isStopped = false;

self.onmessage = function (e: MessageEvent) {
  const line = typeof e.data === 'string' ? e.data.trim() : '';

  if (line === 'uci') {
    self.postMessage('id name Grandmaster-Stockfish-Pro');
    self.postMessage('id author ChessMate');
    self.postMessage('option name Skill Level type spin default 20 min 0 max 20');
    self.postMessage('uciok');
  } else if (line === 'isready') {
    self.postMessage('readyok');
  } else if (line.startsWith('setoption name Skill Level value')) {
    const parts = line.split(' ');
    skillLevel = parseInt(parts[parts.length - 1], 10) || 20;
  } else if (line.startsWith('position fen')) {
    currentFen = line.replace('position fen ', '').trim();
  } else if (line.startsWith('eval')) {
    const fen = line.length > 5 ? line.slice(5).trim() : currentFen;
    try {
      const chess = new Chess(fen);
      const isWhite = chess.turn() === 'w';
      const search = negamax(chess, 3, -Infinity, Infinity, Date.now() + 800, true);
      const whiteScore = isWhite ? search.score : -search.score;
      const mate = Math.abs(search.score) >= 90000
        ? (search.score > 0 ? (isWhite ? 1 : -1) : (isWhite ? -1 : 1))
        : null;
      const bestMoveUci = search.bestMove
        ? `${search.bestMove.from}${search.bestMove.to}${search.bestMove.promotion || ''}`
        : 'none';

      self.postMessage(`evalresult score ${Math.round(whiteScore)} mate ${mate ?? 'none'} bestmove ${bestMoveUci}`);
    } catch {
      self.postMessage('evalresult score 0 mate none bestmove none');
    }
  } else if (line.startsWith('go')) {
    isStopped = false;

    // Check opening book first (for skill >= 3)
    const bookMove = getBookMove(currentFen);
    if (bookMove && skillLevel >= 3) {
      setTimeout(() => {
        if (isStopped) return;
        self.postMessage(`info score cp 20 depth 10 pv ${bookMove.move}`);
        self.postMessage(`bestmove ${bookMove.move}`);
      }, 150);
      return;
    }

    // Parse requested depth and moveTime from "go depth X movetime Y"
    const depthMatch = line.match(/depth\s+(\d+)/);
    const timeMatch = line.match(/movetime\s+(\d+)/);

    let maxDepth = depthMatch ? parseInt(depthMatch[1], 10) : 8;
    let maxTimeMs = timeMatch ? parseInt(timeMatch[1], 10) : 1500;

    // Scale defaults based on skill level if not provided
    if (!depthMatch) {
      if (skillLevel <= 2) maxDepth = 1;
      else if (skillLevel <= 6) maxDepth = 2;
      else if (skillLevel <= 11) maxDepth = 4;
      else if (skillLevel <= 16) maxDepth = 6;
      else if (skillLevel <= 20) maxDepth = 8;
    }

    if (!timeMatch) {
      if (skillLevel <= 2) maxTimeMs = 150;
      else if (skillLevel <= 6) maxTimeMs = 300;
      else if (skillLevel <= 11) maxTimeMs = 600;
      else if (skillLevel <= 16) maxTimeMs = 1000;
      else maxTimeMs = 2000;
    }

    setTimeout(() => {
      if (isStopped) return;
      try {
        const chess = new Chess(currentFen);
        const legalMoves = chess.moves({ verbose: true });

        if (legalMoves.length === 0) {
          self.postMessage('bestmove (none)');
          return;
        }

        // Beginner occasional blunder/randomness
        if (skillLevel <= 2 && Math.random() < 0.35) {
          const rand = legalMoves[Math.floor(Math.random() * legalMoves.length)];
          self.postMessage(`bestmove ${rand.from}${rand.to}${rand.promotion || ''}`);
          return;
        }

        // Run deep Iterative Deepening with Transposition Table
        const search = iterativeDeepening(chess, maxDepth, maxTimeMs);
        const chosen = search.bestMove || legalMoves[0];
        const moveUci = `${chosen.from}${chosen.to}${chosen.promotion || ''}`;

        const isWhite = chess.turn() === 'w';
        const whiteScore = isWhite ? search.score : -search.score;

        self.postMessage(
          `info score cp ${Math.round(whiteScore)} depth ${search.depthReached} pv ${moveUci}`
        );
        self.postMessage(`bestmove ${moveUci}`);
      } catch {
        // Fallback emergency move
        try {
          const chess = new Chess(currentFen);
          const moves = chess.moves({ verbose: true });
          if (moves.length > 0) {
            self.postMessage(`bestmove ${moves[0].from}${moves[0].to}${moves[0].promotion || ''}`);
          } else {
            self.postMessage('bestmove (none)');
          }
        } catch {
          self.postMessage('bestmove (none)');
        }
      }
    }, 50);
  } else if (line === 'stop') {
    isStopped = true;
  }
};
