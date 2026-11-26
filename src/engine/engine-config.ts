import type { Difficulty } from '@/types/chess';

/**
 * UCI options sent to Stockfish for each difficulty level.
 */
export interface EngineConfig {
  /** Stockfish Skill Level (0–20) */
  skillLevel: number;
  /** Search depth limit */
  depth: number;
  /** Maximum move time in milliseconds */
  moveTime: number;
  /** Contempt value – higher values make the engine avoid draws */
  contempt: number;
  /** Number of threads (kept to 1 for browser WASM) */
  threads: number;
  /** Hash table size in MB */
  hash: number;
}

/**
 * Map each app difficulty to concrete Stockfish UCI settings.
 */
export const ENGINE_CONFIGS: Record<Difficulty, EngineConfig> = {
  beginner: {
    skillLevel: 0,
    depth: 1,
    moveTime: 100,
    contempt: 0,
    threads: 1,
    hash: 16,
  },
  easy: {
    skillLevel: 5,
    depth: 3,
    moveTime: 300,
    contempt: 0,
    threads: 1,
    hash: 16,
  },
  intermediate: {
    skillLevel: 10,
    depth: 8,
    moveTime: 500,
    contempt: 10,
    threads: 1,
    hash: 32,
  },
  advanced: {
    skillLevel: 15,
    depth: 12,
    moveTime: 1000,
    contempt: 20,
    threads: 1,
    hash: 64,
  },
  expert: {
    skillLevel: 20,
    depth: 18,
    moveTime: 2000,
    contempt: 25,
    threads: 1,
    hash: 128,
  },
  master: {
    skillLevel: 20,
    depth: 20,
    moveTime: 2200,
    contempt: 30,
    threads: 1,
    hash: 128,
  },
  grandmaster: {
    skillLevel: 20,
    depth: 22,
    moveTime: 2800,
    contempt: 35,
    threads: 1,
    hash: 128,
  },
  stockfish_max: {
    skillLevel: 20,
    depth: 25,
    moveTime: 3500,
    contempt: 40,
    threads: 1,
    hash: 256,
  },
};

/** Default difficulty when starting a new game. */
export const DEFAULT_DIFFICULTY: Difficulty = 'intermediate';

/**
 * Build the array of UCI `setoption` commands for a given difficulty.
 */
export function getUCIOptions(difficulty: Difficulty): string[] {
  const cfg = ENGINE_CONFIGS[difficulty];
  return [
    `setoption name Skill Level value ${cfg.skillLevel}`,
    `setoption name Threads value ${cfg.threads}`,
    `setoption name Hash value ${cfg.hash}`,
    `setoption name Contempt value ${cfg.contempt}`,
  ];
}

/**
 * Build the `go` command string for a given difficulty.
 */
export function getGoCommand(difficulty: Difficulty): string {
  const cfg = ENGINE_CONFIGS[difficulty];
  return `go depth ${cfg.depth} movetime ${cfg.moveTime}`;
}
