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
  isPlayerMove?: boolean;
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
      { text: "Ah, another masterpiece in the making! What opening are we cooking up today?", animation: 'confident' },
      { text: "Alright partner, it's you and me against the machine. Ready when you are!", animation: 'excited' },
      { text: "Let's paint some chaos across these 64 squares — don't leave me hanging on move four!", animation: 'happy' },
    ],
    brilliant: [
      { text: "BRAVO! Wait, did you actually calculate that, or are we just vibing at Grandmaster level?!", animation: 'celebrating' },
      { text: "Mamma mia! Even I dropped my monocle watching that brilliance! Keep going!", animation: 'shocked' },
    ],
    good_move: [
      { text: "Ooh, now that actually had a plan behind it! What are we targeting next?", animation: 'happy' },
      { text: "Look at us looking respectable! Keep tightening the screws on them.", animation: 'confident' },
      { text: "Not bad at all — my mustache approves of that square.", animation: 'happy' },
    ],
    capture: [
      { text: "Yoink! Clean snag — are we hunting their King next or picking off more pawns?", animation: 'happy' },
      { text: "That's one less defender in our way. Feel the momentum shifting?", animation: 'confident' },
    ],
    check: [
      { text: "CHECK! Look at their King scrambling — think we can keep the attack rolling?", animation: 'excited' },
    ],
    castling: [
      { text: "King tucked in safe and cozy! Now let's wake those rooks up, yeah?", animation: 'confident' },
    ],
    opponent_blunder: [
      { text: "Wait a second — did Stockfish just gift us that?! Tell me you see the punishment!", animation: 'excited' },
    ],
    hanging_piece: [
      { text: "Psst — quick sanity check, is that piece defended or are we donating to charity?", animation: 'nervous' },
    ],
    missed_opportunity: [
      { text: "Oof, we had a real knockout punch right there! Catch it next turn, okay?", animation: 'facepalm' },
    ],
    idle_thinking: [
      { text: "So what's the grand plan here? Don't tell me you're improvising again...", animation: 'thinking' },
      { text: "I'm listening — you thinking deep tactics or staring at their knight like me?", animation: 'idle' },
      { text: "Take your time, partner. Good moves beat fast blunders every day of the week!", animation: 'confident' },
    ],
    blunder: [
      { text: "OH THE HORROR! My mustache is curling in pure tragedy! How do we wiggle out of this?", animation: 'facepalm' },
      { text: "Excuse me, was that a tactical gamble or did your finger slip?! Be honest with me!", animation: 'shocked' },
    ],
    capture_queen: [
      { text: "THE QUEEN HAS LEFT THE OPERA! Tell me you're feeling unstoppable right now!", animation: 'celebrating' },
    ],
    lost_queen: [
      { text: "NOT THE QUEEN! Okay, deep breaths — we can still swindle a draw or miracle!", animation: 'facepalm' },
    ],
    interaction_click: [
      { text: "Yes, yes, admire the mustache — now tell me your next idea before Stockfish eats us!", animation: 'confident' },
      { text: "I'm not saying we're in trouble, I'm just saying my turtleneck is sweating.", animation: 'nervous' },
      { text: "Between us, confidence is 90% posture and 10% not hanging your Rook!", animation: 'happy' },
      { text: "Hey! Careful poking the maestro — we've got a game to win here!", animation: 'shocked' },
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
 * Generates conversational, move-specific comments that distinguish the player's
 * moves from Stockfish's replies, referencing exact moves, pieces, and eval state.
 */
function buildDynamicMoveLines(
  event: ChessEvent,
  ctx?: DialogueContext
): DialogueEntry[] {
  if (!ctx) return [];
  const lines: DialogueEntry[] = [];
  const { moveSan, capturedPieceName, moveNumber, isPlayerMove, evalScore, playerColor } = ctx;
  const playerIsWhite = (playerColor || 'w') === 'w';
  const advCp = evalScore !== undefined ? (playerIsWhite ? evalScore : -evalScore) : 0;

  if (moveSan && event === 'good_move') {
    if (isPlayerMove === false) {
      lines.push(
        { text: `Hmm, Stockfish just went ${moveSan}. What do you think — ignore it or counter right back?`, animation: 'thinking' },
        { text: `Okay, they played ${moveSan}. Notice anything sneaky they're trying to set up?`, animation: 'idle' },
        { text: `${moveSan} from the engine... alright, your turn! Where are we putting pressure next?`, animation: 'confident' }
      );
    } else {
      lines.push(
        { text: `${moveSan} — clean and purposeful! Feeling good about this setup?`, animation: 'happy' },
        { text: `Playing ${moveSan} on move ${moveNumber || ''} gives us real room to work with!`, animation: 'confident' },
        { text: `${moveSan} looks sharp! Let's see how Stockfish tries to answer that.`, animation: 'thinking' }
      );
      if (advCp >= 160) {
        lines.push({
          text: `We're clearly ahead after ${moveSan} — stay patient and don't give them cheap counterplay!`,
          animation: 'confident',
        });
      } else if (advCp <= -160) {
        lines.push({
          text: `Things are spicy after ${moveSan} — let's keep creating problems for them!`,
          animation: 'nervous',
        });
      }
    }
  }

  if (capturedPieceName && event === 'capture') {
    if (isPlayerMove === false) {
      lines.push(
        { text: `Hey! Stockfish took our ${capturedPieceName} with ${moveSan || 'that strike'} — are we trading back?`, animation: 'shocked' },
        { text: `There goes our ${capturedPieceName}. No worries, make sure the recapture works for us!`, animation: 'thinking' }
      );
    } else {
      lines.push(
        { text: `Nice! Grabbing their ${capturedPieceName} with ${moveSan || 'that move'} feels great — keep pressing?`, animation: 'happy' },
        { text: `Goodbye, enemy ${capturedPieceName}! That opens up the board nicely for us.`, animation: 'confident' }
      );
    }
  }

  if (moveSan && event === 'check') {
    lines.push(
      isPlayerMove === false
        ? { text: `Whoa, ${moveSan} puts us in check! Step somewhere safe and keep cool.`, animation: 'nervous' }
        : { text: `${moveSan}! Check! Look at that enemy King sweating — can we follow up?`, animation: 'excited' }
    );
  }

  if (moveSan && event === 'blunder') {
    lines.push(
      { text: `Wait... ${moveSan} might let Stockfish in! Take a breath, let's see how we defend.`, animation: 'shocked' }
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
 * Balanced conversational cadence:
 * - Always speaks on start/end/direct interaction and major turning points
 * - Speaks conversationally on many captures, checks, and routine turns without talking over every single ply
 * - Mixes spoken banter with silent animated gestures so he feels natural and alive
 */
export function shouldSpeakForEvent(
  event: ChessEvent,
  msSinceLastSpoken: number
): boolean {
  // Always speak on game start/end or direct user interaction
  if (['start', 'victory', 'defeat', 'draw', 'interaction_click', 'idle_thinking'].includes(event)) {
    return msSinceLastSpoken > 800;
  }

  // High-priority turning points & tactical moments: speak reliably with brief cooldown
  if (
    [
      'capture_queen',
      'lost_queen',
      'capture_major',
      'brilliant',
      'blunder',
      'opponent_blunder',
      'check',
      'hanging_piece',
      'lost_material',
      'missed_opportunity',
    ].includes(event)
  ) {
    return msSinceLastSpoken > 3200;
  }

  // Normal captures & castling: usually speaks conversationally (~75%) unless spoken very recently
  if (['capture', 'castling'].includes(event)) {
    if (msSinceLastSpoken > 9000) return true;
    return msSinceLastSpoken > 4500 && Math.random() < 0.75;
  }

  // Routine moves: speak about half the time once cooled down (and guarantee if quiet > 11s)
  if (msSinceLastSpoken > 11000) return true;
  return msSinceLastSpoken > 5500 && Math.random() < 0.5;
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
