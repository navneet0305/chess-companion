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
  movedPiece?: string;
  capturedPieceName?: string;
  moveNumber?: number;
  isPlayerMove?: boolean;
  evalScore?: number; // centipawns from White's perspective
  playerColor?: 'w' | 'b';
  bestMove?: string | null;
  isCheck?: boolean;
}

// Track which signature story script lines already played in the current match
const usedScriptBeats = new Set<string>();

export function clearScriptBeatMemory() {
  usedScriptBeats.clear();
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
      { text: "Headphones on, crown floating — let's wreck this board! What opening are we cooking?", animation: 'confident' },
      { text: "Alright partner, it's you, me, and the purple kicks against Stockfish. Ready?", animation: 'excited' },
      { text: "Beats queued up, smirk locked in — don't leave me hanging on move four!", animation: 'happy' },
    ],
    brilliant: [
      { text: "YO!! Wait, did you actually calculate that or are we just flexing with the crown on?!", animation: 'celebrating' },
      { text: "Clean! Even my purple headphones just shook from that brilliance! Keep going!", animation: 'shocked' },
    ],
    good_move: [
      { text: "Ooh, now that actually had swagger behind it! What are we targeting next?", animation: 'happy' },
      { text: "Look at us cruising! Keep tightening the pressure on their squares.", animation: 'confident' },
      { text: "Not bad at all — solid move, zero panic.", animation: 'happy' },
    ],
    capture: [
      { text: "Yoink! Clean snag — are we hunting their King next or stacking more material?", animation: 'happy' },
      { text: "That's one less defender in our way. Feel the beat dropping in our favor?", animation: 'confident' },
    ],
    check: [
      { text: "CHECK! Look at their King scrambling — think we can keep the combo rolling?", animation: 'excited' },
    ],
    castling: [
      { text: "King tucked in nice and safe! Time to wake those rooks up, yeah?", animation: 'confident' },
    ],
    opponent_blunder: [
      { text: "Wait a second — did Stockfish just hand us a freebie?! Tell me you see it!", animation: 'excited' },
    ],
    hanging_piece: [
      { text: "Psst — quick check, is that piece defended or are we donating to charity?", animation: 'nervous' },
    ],
    missed_opportunity: [
      { text: "Oof, we had a real knockout punch right there! Catch it next turn, okay?", animation: 'facepalm' },
    ],
    idle_thinking: [
      { text: "So what's the grand plan here? Don't tell me you're vibing without calculating...", animation: 'thinking' },
      { text: "I'm listening — deep tactics in the works or just admiring the purple sneakers?", animation: 'idle' },
      { text: "Take your time, partner. Smooth moves beat fast blunders every day!", animation: 'confident' },
    ],
    blunder: [
      { text: "YIKES! Even my floating crown tilted sideways on that one! How do we recover?", animation: 'facepalm' },
      { text: "Hold up, was that a spicy gambit or did your finger slip?! Be honest with me!", animation: 'shocked' },
    ],
    capture_queen: [
      { text: "THE QUEEN IS GONE! Tell me you're feeling unstoppable right now!", animation: 'celebrating' },
    ],
    lost_queen: [
      { text: "NOT THE QUEEN! Okay, stay cool — we've still got chaos mode left!", animation: 'facepalm' },
    ],
    interaction_click: [
      { text: "Hey! Don't poke the ears — check the board before Stockfish sneaks up on us!", animation: 'confident' },
      { text: "Wait, you tapping for hype or hiding a sneaky sacrifice?", animation: 'happy' },
      { text: "Crown's floating, music's bumping — let's find the sharpest move on the board!", animation: 'excited' },
      { text: "Careful poking me — you might knock my headphones crooked!", animation: 'shocked' },
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

function tryPickBrunoScriptBeat(
  event: ChessEvent,
  ctx?: DialogueContext
): DialogueEntry | null {
  const char = ctx?.character || 'bruno';
  if (char !== 'bruno' && char !== 'mateo' && char !== 'oscar') return null;

  const claim = (key: string, entry: DialogueEntry): DialogueEntry | null => {
    if (usedScriptBeats.has(key)) return null;
    usedScriptBeats.add(key);
    return entry;
  };

  if (event === 'start') {
    return claim('start', {
      text: 'Ah yes. Chess. A game of intelligence, patience, and apparently moving pieces wherever you feel like it.',
      animation: 'confident',
    });
  }

  if (event === 'victory') {
    return claim('victory', {
      text: "AND THAT'S CHECKMATE! Beautiful. Absolutely calculated. Ignore the previous 37 questionable decisions.",
      animation: 'victory',
    });
  }

  if (event === 'defeat' || event === 'draw') {
    return claim('game_end', {
      text: "Chess is about learning from your mistakes. Which is good, because we made a lot of them. Run it back. I wasn't emotionally prepared for that one.",
      animation: 'sad',
    });
  }

  if (event === 'brilliant') {
    return claim('brilliant', {
      text: "NO WAY. YOU ACTUALLY FOUND IT?! Quick, don't think too much. You might undo it.",
      animation: 'celebrating',
    });
  }

  if (event === 'lost_queen' || ((event === 'blunder' || event === 'hanging_piece') && ctx?.movedPiece === 'q')) {
    return claim('hang_queen', {
      text: "Your queen is gone. She didn't resign. She just left. Honestly, understandable.",
      animation: 'facepalm',
    });
  }

  if (event === 'blunder' || event === 'lost_material') {
    return claim('blunder', {
      text: '... Well. That piece had a family.',
      animation: 'shocked',
    });
  }

  if (event === 'opponent_blunder') {
    return claim('opponent_blunder', {
      text: 'Oh, they messed up. They messed up so badly I almost feel responsible for noticing.',
      animation: 'excited',
    });
  }

  if (event === 'check' && ctx?.isPlayerMove === false) {
    return claim('player_checked', {
      text: 'CHECK! Your king is currently experiencing a situation.',
      animation: 'nervous',
    });
  }

  if (ctx?.isPlayerMove && ctx?.moveNumber === 1) {
    return claim('first_move', {
      text: 'Okayyy... a move has been made. Was it theory? Was it strategy? We may never know.',
      animation: 'thinking',
    });
  }

  if (ctx?.isPlayerMove === false && ['good_move', 'castling'].includes(event)) {
    const oppDev = claim('opp_develop', {
      text: "Oh, they're developing. Fancy word for moving a horse and hoping for the best.",
      animation: 'idle',
    });
    if (oppDev) return oppDev;
  }

  const playerIsWhite = (ctx?.playerColor || 'w') === 'w';
  const advCp = ctx?.evalScore !== undefined ? (playerIsWhite ? ctx.evalScore : -ctx.evalScore) : 0;

  if (advCp >= 180) {
    const winningLine = claim('winning', {
      text: 'We are winning. I repeat, WE are winning. Please do not do anything creative.',
      animation: 'excited',
    });
    if (winningLine) return winningLine;
  }

  if (advCp <= -180) {
    const losingLine = claim('losing', {
      text: 'So the plan is simple. We pretend this was a practice game.',
      animation: 'nervous',
    });
    if (losingLine) return losingLine;
  }

  if (ctx?.isPlayerMove && event === 'good_move') {
    return claim('good_move', {
      text: 'WAIT. Hold on. That was actually good. Who gave you permission to think?',
      animation: 'happy',
    });
  }

  return null;
}

/**
 * Picks a fresh, non-repeating dialogue line combining scripted signature beats,
 * personality pools, character flavor, and live move context.
 */
export function getContextualDialogue(
  personality: Personality,
  event: ChessEvent,
  ctx?: DialogueContext
): DialogueEntry {
  const scripted = tryPickBrunoScriptBeat(event, ctx);
  if (scripted) {
    return scripted;
  }

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
 * - Always speaks on start/end/direct interaction, opening beats, and major turning points
 * - Speaks conversationally on captures, checks, and routine turns without talking over every single ply
 * - Mixes spoken banter with silent animated gestures so he feels natural and alive
 */
export function shouldSpeakForEvent(
  event: ChessEvent,
  msSinceLastSpoken: number,
  ctx?: DialogueContext
): boolean {
  // Always speak on game start/end, opening move, opponent's first development, or user taps
  if (['start', 'victory', 'defeat', 'draw', 'interaction_click', 'idle_thinking'].includes(event)) {
    return msSinceLastSpoken > 600;
  }
  if (ctx?.moveNumber === 1 && !usedScriptBeats.has('first_move')) {
    return true;
  }
  if (ctx?.isPlayerMove === false && !usedScriptBeats.has('opp_develop') && ['good_move', 'castling'].includes(event)) {
    return msSinceLastSpoken > 1500;
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
    return msSinceLastSpoken > 2500;
  }

  // Normal captures & castling: usually speaks conversationally (~75%) unless spoken very recently
  if (['capture', 'castling'].includes(event)) {
    if (msSinceLastSpoken > 9000) return true;
    return msSinceLastSpoken > 4200 && Math.random() < 0.75;
  }

  // Routine moves: speak about half the time once cooled down (and guarantee if quiet > 11s)
  if (msSinceLastSpoken > 11000) return true;
  return msSinceLastSpoken > 5000 && Math.random() < 0.55;
}

const SILENT_GESTURES: Record<
  'positive' | 'negative' | 'thinking' | 'alert',
  { text: string; animation: AnimationState }[]
> = {
  positive: [
    { text: '*hits a cool finger-gun point with a smug grin*', animation: 'happy' },
    { text: '*bobs headphones to a silent beat*', animation: 'confident' },
    { text: '*fist-bumps the air silently*', animation: 'excited' },
    { text: '*flashes a confident smirk with a wink*', animation: 'confident' },
    { text: '*nods approvingly while his golden crown sparkles*', animation: 'happy' },
  ],
  negative: [
    { text: '*drops jaw and covers eyes under headphones*', animation: 'facepalm' },
    { text: '*winces dramatically and shakes head*', animation: 'disappointed' },
    { text: '*peeks half-lidded nervously at the board*', animation: 'nervous' },
    { text: '*taps purple sneaker anxiously*', animation: 'facepalm' },
  ],
  thinking: [
    { text: '*tilts headphones and squints at the board*', animation: 'thinking' },
    { text: '*taps chin thoughtfully*', animation: 'idle' },
  ],
  alert: [
    { text: '*opens eyes wide with crown spinning!*', animation: 'shocked' },
    { text: '*points finger-gun right at the enemy king!*', animation: 'excited' },
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
        { text: 'We are winning. I repeat, WE are winning. Please do not do anything creative.', animation: 'celebrating' },
        { text: `Eval is +${pawns} in our favor! Time to trade down or hunt their King cleanly!`, animation: 'confident' },
      ]);
    }
    if (playerAdvantageCp <= -180) {
      return pickNonRepeating('interactive:vibe:lose', [
        { text: 'So the plan is simple. We pretend this was a practice game.', animation: 'nervous' },
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
