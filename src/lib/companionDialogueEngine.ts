import type { Personality, AnimationState } from '../types/companion';
import type { CharacterBase } from '../contexts/CompanionContext';
import {
  COMPANION_DIALOGUES,
  type ChessEvent,
  type DialogueEntry,
} from './dialogueLibrary';

export interface DialogueContext {
  character?: CharacterBase;
  moveSan?: string;
  capturedPieceName?: string;
  moveNumber?: number;
  evalScore?: number; // centipawns from White's perspective
  playerColor?: 'w' | 'b';
  bestMove?: string | null;
  isCheck?: boolean;
}

// Session-wide anti-repetition memory
const globalRecentHistory: string[] = [];
const usedByBucket = new Map<string, Set<string>>();

function pickNonRepeating(bucketKey: string, pool: DialogueEntry[]): DialogueEntry {
  let used = usedByBucket.get(bucketKey);
  if (!used) {
    used = new Set<string>();
    usedByBucket.set(bucketKey, used);
  }

  let candidates = pool.filter(
    (item) => !used!.has(item.text) && !globalRecentHistory.includes(item.text)
  );

  // If all lines in this bucket were used, reset the bucket while still avoiding the last 12 global lines
  if (candidates.length === 0) {
    used.clear();
    candidates = pool.filter((item) => !globalRecentHistory.includes(item.text));
  }

  if (candidates.length === 0) {
    candidates = pool;
  }

  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  used.add(chosen.text);
  globalRecentHistory.push(chosen.text);
  if (globalRecentHistory.length > 25) {
    globalRecentHistory.shift();
  }

  return chosen;
}

// Character-specific anime flavor lines layered on top of personality pools
const CHARACTER_BONUS_LINES: Partial<
  Record<CharacterBase, Partial<Record<ChessEvent, DialogueEntry[]>>>
> = {
  bruno: {
    start: [
      { text: "Ah, another masterpiece in the making! Try not to embarrass my turtleneck.", animation: 'confident' },
      { text: "Magnificent! Let us paint pure chaos across these 64 squares!", animation: 'excited' },
    ],
    brilliant: [
      { text: "BRAVO! *kisses fingertips* That move belongs in the Louvre!", animation: 'celebrating' },
      { text: "Mamma mia! Even I dropped my monocle watching that brilliance!", animation: 'shocked' },
    ],
    blunder: [
      { text: "OH THE HORROR! My mustache is curling in pure tragedy!", animation: 'facepalm' },
      { text: "Excuse me, was that a chess move or modern interpretive comedy?!", animation: 'shocked' },
    ],
    capture_queen: [
      { text: "THE QUEEN HAS LEFT THE OPERA! Absolute standing ovation!", animation: 'celebrating' },
    ],
    lost_queen: [
      { text: "NOT THE QUEEN! Somebody play the sad violin right now!", animation: 'facepalm' },
    ],
    interaction_click: [
      { text: "Yes, yes, admire the mustache — now calculate before Stockfish eats us!", animation: 'confident' },
      { text: "I'm not saying we're losing, I'm just saying my turtleneck is sweating.", animation: 'nervous' },
      { text: "Remember: confidence is 90% posture and 10% not hanging your Rook!", animation: 'happy' },
      { text: "Ooh, a poke! Careful, you'll smudge my theatrical dignity!", animation: 'shocked' },
    ],
  },
  luffy: {
    start: [
      { text: "Shishishi! Let's set sail and smash their king into the Grand Line!", animation: 'excited' },
      { text: "I'm gonna be the Pirate King of Chess! First move, let's go!", animation: 'confident' },
    ],
    brilliant: [
      { text: "SUGOI!! That move hit harder than a Gomu Gomu no Red Hawk!", animation: 'celebrating' },
      { text: "Gear 5 tactics right there! Even Shanks would grin at that!", animation: 'excited' },
    ],
    good_move: [
      { text: "Ooh, clean punch! Keep marching forward!", animation: 'happy' },
      { text: "Nice! That feels like we're gaining wind in our sails!", animation: 'confident' },
    ],
    capture: [
      { text: "YOINK! That piece is mine now — feels like grabbing extra meat!", animation: 'happy' },
      { text: "Gomu Gomu no Snatch! Right off the board!", animation: 'excited' },
    ],
    capture_queen: [
      { text: "BOOM! Their Queen just got launched off the island!", animation: 'celebrating' },
    ],
    blunder: [
      { text: "WHOA! Hey, did we just walk straight into a Sea King's mouth?!", animation: 'shocked' },
      { text: "Ouch! Even my rubber body felt that blunder!", animation: 'facepalm' },
    ],
    check: [
      { text: "CHECK! Nowhere to run now, Mr. Enemy King!", animation: 'excited' },
    ],
    interaction_click: [
      { text: "Shishishi! Don't poke my straw hat, focus on the attack!", animation: 'happy' },
      { text: "Hey, if we win this fast, we're celebrating with a giant feast!", animation: 'excited' },
      { text: "Trust your gut! Sometimes the wildest attack wins the whole sea!", animation: 'confident' },
    ],
  },
  zoro: {
    start: [
      { text: "Three-Sword Style is ready. Don't hesitate on the first cut.", animation: 'confident' },
      { text: "Keep your eyes sharp. One slip and we cut them down.", animation: 'idle' },
    ],
    brilliant: [
      { text: "Hmph. A clean, lethal cut. Like slicing straight through steel.", animation: 'confident' },
      { text: "Santoryu mastery! They didn't even see the blade move.", animation: 'excited' },
    ],
    good_move: [
      { text: "Solid stance. Hold the center line.", animation: 'confident' },
      { text: "Steady blade, steady mind. Keep pressing.", animation: 'happy' },
    ],
    capture: [
      { text: "Sliced clean in two. Next target.", animation: 'confident' },
      { text: "Onigiri! Another piece falls to the blade.", animation: 'happy' },
    ],
    blunder: [
      { text: "Tch! You dropped your guard completely. Recover your stance!", animation: 'disappointed' },
      { text: "Did you get lost on the board?! Protect your pieces!", animation: 'facepalm' },
    ],
    interaction_click: [
      { text: "I'm not lost on the board... the squares just moved!", animation: 'confident' },
      { text: "Stop tapping me and sharpen your calculation.", animation: 'idle' },
      { text: "A true swordsman never fears a sharp tactical exchange.", animation: 'excited' },
    ],
  },
  gojo: {
    start: [
      { text: "Relax. Between the two of us, we're the strongest on this board.", animation: 'confident' },
      { text: "Six Eyes online. Every variation is already crystal clear.", animation: 'idle' },
    ],
    brilliant: [
      { text: "Hollow Purple! You just erased their entire defensive plan!", animation: 'celebrating' },
      { text: "Throughout heaven and earth, that move alone is the honored one.", animation: 'excited' },
    ],
    good_move: [
      { text: "Effortless. Their pieces can't even touch our Infinity.", animation: 'confident' },
      { text: "Clean geometry. You're controlling space like a Domain Expansion.", animation: 'happy' },
    ],
    capture: [
      { text: "Deleted. Didn't even need Limitless for that one.", animation: 'happy' },
      { text: "Cursed Technique Lapse: Blue — pulled that piece right into our pocket!", animation: 'excited' },
    ],
    blunder: [
      { text: "Whoa, hold on — even my Infinity couldn't block that self-inflicted wound!", animation: 'shocked' },
      { text: "Okay, let's pretend that was a tactical domain bait...", animation: 'nervous' },
    ],
    interaction_click: [
      { text: "Would Stockfish beat us? Nah, we'd win.", animation: 'confident' },
      { text: "Need a Six Eyes scan? Look for checks, captures, and forcing lines!", animation: 'thinking' },
      { text: "Careful poking me — you might get caught in Infinite Void!", animation: 'happy' },
    ],
  },
};

/**
 * Generates dynamic, move-specific comments so the companion references
 * the exact move, piece, and board evaluation instead of repeating static lines.
 */
function buildDynamicMoveLines(
  event: ChessEvent,
  ctx?: DialogueContext
): DialogueEntry[] {
  if (!ctx) return [];
  const lines: DialogueEntry[] = [];
  const { moveSan, capturedPieceName, moveNumber } = ctx;

  if (moveSan && event === 'good_move') {
    lines.push(
      { text: `${moveSan} — clean, purposeful, and keeps the pieces coordinated.`, animation: 'happy' },
      { text: `Playing ${moveSan} on move ${moveNumber || ''} gives us real breathing room!`, animation: 'confident' },
      { text: `${moveSan} looks sharp! Let's see how the engine answers that.`, animation: 'thinking' }
    );
  }

  if (capturedPieceName && event === 'capture') {
    lines.push(
      { text: `Nice! Grabbing their ${capturedPieceName} with ${moveSan || 'that strike'} tilts the balance!`, animation: 'happy' },
      { text: `Goodbye, enemy ${capturedPieceName}! Clean trade.`, animation: 'confident' }
    );
  }

  if (moveSan && event === 'check') {
    lines.push(
      { text: `${moveSan}! Keep that enemy King dancing under pressure!`, animation: 'excited' }
    );
  }

  if (moveSan && event === 'blunder') {
    lines.push(
      { text: `Yikes... ${moveSan} just opened the door wide for Stockfish!`, animation: 'shocked' }
    );
  }

  return lines;
}

/**
 * Picks a fresh, non-repeating dialogue line combining personality,
 * character flavor, and live move context.
 */
export function getContextualDialogue(
  personality: Personality,
  event: ChessEvent,
  ctx?: DialogueContext
): DialogueEntry {
  const basePool =
    COMPANION_DIALOGUES[personality]?.[event] ||
    COMPANION_DIALOGUES.roaster[event] ||
    COMPANION_DIALOGUES.roaster.good_move;

  const charBonus =
    (ctx?.character && CHARACTER_BONUS_LINES[ctx.character]?.[event]) || [];

  const dynamicLines = buildDynamicMoveLines(event, ctx);

  const combinedPool = [...charBonus, ...dynamicLines, ...basePool];
  const bucketKey = `${ctx?.character || 'default'}:${personality}:${event}`;

  return pickNonRepeating(bucketKey, combinedPool);
}

/**
 * Companion only speaks aloud when truly required (major turning points,
 * end of game, or direct user interaction). On normal moves, he reacts
 * silently with animated body gestures and facial expressions!
 */
export function shouldSpeakForEvent(
  event: ChessEvent,
  msSinceLastSpoken: number
): boolean {
  // Always speak on game-ending or direct interaction events
  if (['victory', 'defeat', 'draw', 'interaction_click'].includes(event)) {
    return msSinceLastSpoken > 800;
  }

  // Only speak on huge turning points (Queen captures, Brilliants, Blunders) with a generous cooldown
  if (['capture_queen', 'lost_queen', 'brilliant', 'blunder'].includes(event)) {
    return msSinceLastSpoken > 14000;
  }

  // All routine moves, normal captures, checks, castling, start, idle:
  // React silently with expressive body gestures instead of talking!
  return false;
}

const SILENT_GESTURES: Record<
  'positive' | 'negative' | 'thinking' | 'alert',
  { text: string; animation: AnimationState }[]
> = {
  positive: [
    { text: '*twirls mustache with a smug nod*', animation: 'happy' },
    { text: '*gives a theatrical slow clap*', animation: 'confident' },
    { text: '*fist-bumps the air silently*', animation: 'excited' },
    { text: '*winks and adjusts turtleneck*', animation: 'confident' },
    { text: '*nods approvingly with a dramatic grin*', animation: 'happy' },
  ],
  negative: [
    { text: '*gasps and clutches turtleneck in horror*', animation: 'facepalm' },
    { text: '*winces dramatically and shakes head*', animation: 'disappointed' },
    { text: '*raises one eyebrow nervously*', animation: 'nervous' },
    { text: '*covers eyes peeking through fingers*', animation: 'facepalm' },
  ],
  thinking: [
    { text: '*strokes mustache, squinting at the board*', animation: 'thinking' },
    { text: '*taps chin thoughtfully*', animation: 'idle' },
  ],
  alert: [
    { text: '*leans forward with wide eyes!*', animation: 'shocked' },
    { text: '*points dramatically at the enemy king!*', animation: 'excited' },
  ],
};

export function getSilentGesture(event: ChessEvent): DialogueEntry {
  let category: keyof typeof SILENT_GESTURES = 'thinking';
  if (['good_move', 'capture', 'castling', 'capture_major'].includes(event)) {
    category = 'positive';
  } else if (['blunder', 'hanging_piece', 'lost_material', 'missed_opportunity'].includes(event)) {
    category = 'negative';
  } else if (event === 'check') {
    category = 'alert';
  }
  const pool = SILENT_GESTURES[category];
  return pickNonRepeating(`gesture:${category}`, pool);
}

/**
 * Interactive button responses (Hint, Board Vibe, Hype) tailored to live board state.
 */
export function getInteractiveActionDialogue(
  action: 'hint' | 'vibe' | 'hype',
  personality: Personality,
  ctx: DialogueContext
): DialogueEntry {
  const char = ctx.character || 'luffy';
  const playerIsWhite = (ctx.playerColor || 'w') === 'w';
  const rawScore = ctx.evalScore ?? 0;
  const playerAdvantageCp = playerIsWhite ? rawScore : -rawScore;
  const pawns = (playerAdvantageCp / 100).toFixed(1);

  if (action === 'hint') {
    const best = ctx.bestMove;
    if (best && best.length >= 4) {
      const from = best.slice(0, 2);
      const to = best.slice(2, 4);
      const hintPool: DialogueEntry[] = [
        {
          text:
            char === 'gojo'
              ? `Six Eyes spotted it: moving ${from} to ${to} crushes their counterplay!`
              : char === 'zoro'
              ? `Look at ${from} to ${to}. That's the sharpest blade on the board.`
              : `Ooh! Try moving ${from} to ${to}! Looks like a super fun attack!`,
          animation: 'thinking',
        },
        {
          text: `Psst — ${from} → ${to} looks like the strongest continuation right now!`,
          animation: 'confident',
        },
      ];
      return pickNonRepeating(`interactive:hint:${best}`, hintPool);
    }
    return {
      text: "Develop your minor pieces, castle early, and watch those open diagonals!",
      animation: 'thinking',
    };
  }

  if (action === 'vibe') {
    if (playerAdvantageCp >= 180) {
      return pickNonRepeating('interactive:vibe:win', [
        { text: `We're up +${pawns}! Stay sharp and convert this cleanly — don't get sloppy!`, animation: 'celebrating' },
        { text: `Eval is +${pawns} in our favor! Time to trade down or hunt their King!`, animation: 'confident' },
      ]);
    }
    if (playerAdvantageCp <= -180) {
      return pickNonRepeating('interactive:vibe:lose', [
        { text: `We're down (${pawns}), so let's complicate the board and set tactical traps!`, animation: 'nervous' },
        { text: `Tough spot (${pawns}), but one sharp counterattack flips everything!`, animation: 'thinking' },
      ]);
    }
    return pickNonRepeating('interactive:vibe:even', [
      { text: `Dead even (${pawns})! Whoever controls the center and out-calculates next wins.`, animation: 'idle' },
      { text: `Balanced position (${pawns}). Look for active outposts and weak enemy pawns!`, animation: 'thinking' },
    ]);
  }

  // 'hype'
  return getContextualDialogue(personality, 'interaction_click', ctx);
}
