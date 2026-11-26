import { Chess, type Square, type PieceSymbol, type Color } from 'chess.js';
import type { AbilityTriggerEvent, PieceAbilityId, PlayerAbilitiesState } from '../types/abilities';
import { getAbilityConfig } from '../lib/abilitiesLibrary';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

/**
 * Web Audio API synthesizer for sci-fi laser, explosion, and superpower sound effects.
 */
class AbilitySoundSynthesizer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  play(type: 'laser' | 'explosion' | 'teleport' | 'shield' | 'shockwave') {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (type) {
      case 'laser': {
        // High-energy sci-fi laser sweep (1400Hz -> 180Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.22);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case 'explosion': {
        // Low rumble detonation with sub-bass punch
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.4);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
        break;
      }
      case 'shockwave': {
        // Deep resonant seismic boom
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }
      case 'teleport': {
        // Shimmering upward frequency chime
        const freqs = [520, 780, 1040, 1560];
        freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + i * 0.05);
          gain.gain.setValueAtTime(0.2, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.15);
        });
        break;
      }
      case 'shield': {
        // Resonant protective harmonic chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(528, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
    }
  }
}

export const abilitySounds = new AbilitySoundSynthesizer();

/**
 * Calculates all 4 diagonal line-of-sight rays from a given square.
 */
export function getDiagonalRays(sourceSquare: Square): Square[][] {
  const file = sourceSquare[0];
  const rank = parseInt(sourceSquare[1], 10);
  const fileIdx = FILES.indexOf(file);

  const directions = [
    [1, 1],   // Up-Right
    [-1, 1],  // Up-Left
    [1, -1],  // Down-Right
    [-1, -1], // Down-Left
  ];

  const rays: Square[][] = [];

  for (const [df, dr] of directions) {
    const ray: Square[] = [];
    let f = fileIdx + df;
    let r = rank + dr;

    while (f >= 0 && f < 8 && r >= 1 && r <= 8) {
      ray.push(`${FILES[f]}${r}` as Square);
      f += df;
      r += dr;
    }
    rays.push(ray);
  }

  return rays;
}

/**
 * Evaluates special piece abilities triggered by a move.
 */
export function evaluatePieceAbilities(params: {
  game: Chess;
  from: Square;
  to: Square;
  movingPiece: { type: PieceSymbol; color: Color };
  playerColor: Color;
  abilitiesState: PlayerAbilitiesState;
}): {
  event: AbilityTriggerEvent | null;
  newFen: string;
} {
  const { game, from, to, movingPiece, playerColor, abilitiesState } = params;

  if (!abilitiesState.enabled) {
    return { event: null, newFen: game.fen() };
  }

  const pieceAbilityId: PieceAbilityId | undefined = abilitiesState.abilities[movingPiece.type];
  if (!pieceAbilityId) {
    return { event: null, newFen: game.fen() };
  }

  const config = getAbilityConfig(pieceAbilityId);
  if (!config) {
    return { event: null, newFen: game.fen() };
  }

  // ─── 1. BISHOP DIAGONAL DEATH RAY (User's Exact Feature!) ───
  if (movingPiece.type === 'b' && pieceAbilityId === 'bishop_diagonal_laser') {
    const rays = getDiagonalRays(to);
    const destroyedSquares: Square[] = [];
    const targetSquares: Square[] = [];
    const opponentColor: Color = movingPiece.color === 'w' ? 'b' : 'w';

    for (const ray of rays) {
      for (const sq of ray) {
        targetSquares.push(sq);
        const pieceOnSq = game.get(sq);

        if (pieceOnSq) {
          if (pieceOnSq.color === opponentColor && pieceOnSq.type !== 'k') {
            // Destroy opponent piece caught in Bishop's diagonal!
            destroyedSquares.push(sq);
            game.remove(sq);
          }
          // Line of sight stops at first encountered piece
          break;
        }
      }
    }

    if (destroyedSquares.length > 0) {
      abilitySounds.play('laser');
      setTimeout(() => abilitySounds.play('explosion'), 120);

      const count = destroyedSquares.length;
      const message =
        count === 1
          ? `⚡ BISHOP DEATH RAY! Vaporized enemy piece at ${destroyedSquares.join(', ')}!`
          : `⚡ BISHOP MULTI-LASER STRIKE! Annihilated ${count} pieces along diagonals!`;

      return {
        event: {
          id: `ability_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          abilityId: 'bishop_diagonal_laser',
          pieceType: 'b',
          pieceColor: movingPiece.color,
          sourceSquare: to,
          targetSquares,
          destroyedSquares,
          vfx: 'laser_beam',
          message,
          timestamp: Date.now(),
        },
        newFen: game.fen(),
      };
    }
  }

  // ─── 2. KNIGHT METEOR SHOCKWAVE ───
  if (movingPiece.type === 'n' && pieceAbilityId === 'knight_shockwave') {
    const file = to[0];
    const rank = parseInt(to[1], 10);
    const fileIdx = FILES.indexOf(file);
    const opponentColor: Color = movingPiece.color === 'w' ? 'b' : 'w';

    const destroyedSquares: Square[] = [];
    const targetSquares: Square[] = [];

    // Check all 8 adjacent squares around the knight's landing site
    for (let df = -1; df <= 1; df++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (df === 0 && dr === 0) continue;
        const f = fileIdx + df;
        const r = rank + dr;
        if (f >= 0 && f < 8 && r >= 1 && r <= 8) {
          const adjSq = `${FILES[f]}${r}` as Square;
          targetSquares.push(adjSq);
          const adjPiece = game.get(adjSq);
          // Obliterates adjacent enemy pawns
          if (adjPiece && adjPiece.color === opponentColor && adjPiece.type === 'p') {
            destroyedSquares.push(adjSq);
            game.remove(adjSq);
          }
        }
      }
    }

    if (destroyedSquares.length > 0) {
      abilitySounds.play('shockwave');
      setTimeout(() => abilitySounds.play('explosion'), 100);

      return {
        event: {
          id: `ability_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          abilityId: 'knight_shockwave',
          pieceType: 'n',
          pieceColor: movingPiece.color,
          sourceSquare: to,
          targetSquares,
          destroyedSquares,
          vfx: 'shockwave_blast',
          message: `💥 METEOR STOMP! Shockwave obliterated enemy pawns at ${destroyedSquares.join(', ')}!`,
          timestamp: Date.now(),
        },
        newFen: game.fen(),
      };
    }
  }

  // ─── 3. ROOK BATTERING RAM / SIEGE CANNON ───
  if (movingPiece.type === 'r' && pieceAbilityId === 'rook_battering_ram') {
    // Check if the rook made a linear move of distance >= 3
    const fromF = FILES.indexOf(from[0]);
    const fromR = parseInt(from[1], 10);
    const toF = FILES.indexOf(to[0]);
    const toR = parseInt(to[1], 10);

    const dist = Math.max(Math.abs(fromF - toF), Math.abs(fromR - toR));
    if (dist >= 3) {
      abilitySounds.play('explosion');
      return {
        event: {
          id: `ability_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          abilityId: 'rook_battering_ram',
          pieceType: 'r',
          pieceColor: movingPiece.color,
          sourceSquare: to,
          targetSquares: [from, to],
          destroyedSquares: [],
          vfx: 'fire_explosion',
          message: `🚀 SIEGE CANNON! The Rook charged through with colossal battering ram force!`,
          timestamp: Date.now(),
        },
        newFen: game.fen(),
      };
    }
  }

  return { event: null, newFen: game.fen() };
}

/**
 * Checks if an opponent piece stepped into a player's Bishop diagonal line of sight.
 * If so, the Bishop's laser ray triggers and disintegrates the trespassing piece!
 */
export function checkEnemyEnteredBishopDiagonal(params: {
  game: Chess;
  enemyMoveTo: Square;
  playerColor: Color;
  abilitiesState: PlayerAbilitiesState;
}): AbilityTriggerEvent | null {
  const { game, enemyMoveTo, playerColor, abilitiesState } = params;

  if (!abilitiesState.enabled || abilitiesState.abilities.b !== 'bishop_diagonal_laser') {
    return null;
  }

  const board = game.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (piece && piece.type === 'b' && piece.color === playerColor) {
        const bishopSq = `${FILES[f]}${8 - r}` as Square;
        const rays = getDiagonalRays(bishopSq);

        for (const ray of rays) {
          const idx = ray.indexOf(enemyMoveTo);
          if (idx !== -1) {
            // Verify clear line-of-sight between bishop and trespassing enemy
            let blocked = false;
            for (let i = 0; i < idx; i++) {
              if (game.get(ray[i])) {
                blocked = true;
                break;
              }
            }

            if (!blocked) {
              const enemyPiece = game.get(enemyMoveTo);
              // Do not vaporize kings
              if (enemyPiece && enemyPiece.type !== 'k') {
                game.remove(enemyMoveTo);
                abilitySounds.play('laser');
                setTimeout(() => abilitySounds.play('explosion'), 120);

                return {
                  id: `ability_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                  abilityId: 'bishop_diagonal_laser',
                  pieceType: 'b',
                  pieceColor: playerColor,
                  sourceSquare: bishopSq,
                  targetSquares: ray.slice(0, idx + 1),
                  destroyedSquares: [enemyMoveTo],
                  vfx: 'laser_beam',
                  message: `⚡ BISHOP LASER DEFENSE! Opponent entered diagonal and was VAPORIZED at ${enemyMoveTo}!`,
                  timestamp: Date.now(),
                };
              }
            }
          }
        }
      }
    }
  }

  return null;
}

