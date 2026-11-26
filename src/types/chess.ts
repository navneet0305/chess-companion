import type { Chess, Square, Move, Color, PieceSymbol } from 'chess.js';

export type PlayerColor = 'w' | 'b';
export type Difficulty =
  | 'beginner'
  | 'easy'
  | 'intermediate'
  | 'advanced'
  | 'expert'
  | 'master'
  | 'grandmaster'
  | 'stockfish_max';
export type TimeControl = { name: string; time: number; increment: number; category: string };
export type GameStatus = 'idle' | 'playing' | 'paused' | 'ended';
export type GameResult = 'white' | 'black' | 'draw' | null;
export type GameEndReason =
  | 'checkmate'
  | 'stalemate'
  | 'resignation'
  | 'timeout'
  | 'draw_agreement'
  | 'threefold_repetition'
  | 'fifty_moves'
  | 'insufficient_material'
  | null;

export type MoveClassification =
  | 'brilliant'
  | 'best'
  | 'excellent'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'
  | 'missed_win';

export interface EvaluationData {
  score: number; // in centipawns from White's perspective (+100 = +1.0 for White)
  mate: number | null; // e.g. +2 = White mate in 2, -1 = Black mate in 1
  bestMove?: string | null;
  depth?: number;
}

export interface ClassifiedMove extends Move {
  classification?: MoveClassification;
  evalBefore?: number;
  evalAfter?: number;
  centipawnLoss?: number;
}

export interface GameState {
  fen: string;
  turn: Color;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isGameOver: boolean;
  moveHistory: ClassifiedMove[];
  capturedPieces: { w: PieceSymbol[]; b: PieceSymbol[] };
  selectedSquare: Square | null;
  legalMoves: Square[];
  lastMove: { from: Square; to: Square } | null;
  status: GameStatus;
  result: GameResult;
  endReason: GameEndReason;
  playerColor: PlayerColor;
  difficulty: Difficulty;
  boardFlipped: boolean;
}

export interface TimeState {
  whiteTime: number;
  blackTime: number;
  isRunning: boolean;
  activeColor: Color | null;
}

export const TIME_CONTROLS: TimeControl[] = [
  { name: '1+0', time: 60, increment: 0, category: 'Bullet' },
  { name: '2+1', time: 120, increment: 1, category: 'Bullet' },
  { name: '3+0', time: 180, increment: 0, category: 'Blitz' },
  { name: '3+2', time: 180, increment: 2, category: 'Blitz' },
  { name: '5+0', time: 300, increment: 0, category: 'Blitz' },
  { name: '5+3', time: 300, increment: 3, category: 'Blitz' },
  { name: '10+0', time: 600, increment: 0, category: 'Rapid' },
  { name: '10+5', time: 600, increment: 5, category: 'Rapid' },
  { name: '15+10', time: 900, increment: 10, category: 'Rapid' },
  { name: 'Unlimited', time: 0, increment: 0, category: 'Unlimited' },
];

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; description: string; skill: number; depth: number; moveTime: number; elo: string }
> = {
  beginner:      { label: 'Beginner',         description: 'Learning the basics',                 skill: 0,  depth: 1,  moveTime: 100,  elo: '~400'  },
  easy:          { label: 'Easy',             description: 'Casual play',                         skill: 5,  depth: 2,  moveTime: 250,  elo: '~800'  },
  intermediate:  { label: 'Intermediate',     description: 'Club player challenge',               skill: 10, depth: 4,  moveTime: 450,  elo: '~1400' },
  advanced:      { label: 'Advanced',         description: 'Strong tournament player',            skill: 15, depth: 6,  moveTime: 750,  elo: '~1800' },
  expert:        { label: 'Expert',           description: 'Candidate Master (sharp tactics)',    skill: 20, depth: 7,  moveTime: 1200, elo: '~2200' },
  master:        { label: 'Master',           description: 'FIDE Master (ruthless positional play)', skill: 20, depth: 8, moveTime: 1600, elo: '~2500' },
  grandmaster:   { label: 'Grandmaster',      description: 'World Class GM (deep calculation)',  skill: 20, depth: 10, moveTime: 2200, elo: '~2850' },
  stockfish_max: { label: 'Stockfish MAX ⚡', description: 'God Mode: Maximum depth & refutations', skill: 20, depth: 12, moveTime: 3200, elo: '3500+' },
};
