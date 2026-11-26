import type { ChessEvent } from './dialogueLibrary';

export type CompanionSkitId =
  | 'none'
  | 'eat_mustache'
  | 'turtle_hide'
  | 'espresso_balance'
  | 'sunglasses_flex'
  | 'victory_spin'
  | 'facepalm_dramatic'
  | 'sweat_nervous';

export interface CompanionBet {
  id: string;
  title: string;
  icon: string;
  betPrompt: string;
  triggerEvents: ChessEvent[];
  minAdvantageCp?: number;
  maxAdvantageCp?: number;
  skit: CompanionSkitId;
  payoffLine: string;
  durationMs: number;
}

export const MATCH_BETS: CompanionBet[] = [
  {
    id: 'mustache_bet',
    title: 'The Mustache Bet',
    icon: '🥸',
    betPrompt: "Bet: If you actually win this game, I'll peel off my mustache and EAT it!",
    triggerEvents: ['victory'],
    skit: 'eat_mustache',
    payoffLine: "NO WAY!! A deal's a deal... *peels mustache* CHOMP CHOMP... needs hot sauce!",
    durationMs: 5200,
  },
  {
    id: 'espresso_queen_bet',
    title: 'Espresso Nose Dare',
    icon: '☕',
    betPrompt: "Bet: Take their Queen and I'll balance an espresso cup on my nose!",
    triggerEvents: ['capture_queen'],
    skit: 'espresso_balance',
    payoffLine: "YOU SNATCHED THE QUEEN?! Hold everything—look at this nose balance!!",
    durationMs: 4800,
  },
  {
    id: 'turtle_blunder_bet',
    title: 'Turtleneck Turtle',
    icon: '🐢',
    betPrompt: "Bet: Lose your Queen or blunder huge and I'm retreating into my turtleneck!",
    triggerEvents: ['lost_queen'],
    skit: 'turtle_hide',
    payoffLine: "Nope! I didn't see that! I live inside my sweater collar now. Goodbye!",
    durationMs: 4500,
  },
  {
    id: 'shades_genius_bet',
    title: 'Grandmaster Shades',
    icon: '🕶️',
    betPrompt: "Bet: Play a Brilliant move (!!) and I'll break out the golden shades!",
    triggerEvents: ['brilliant'],
    skit: 'sunglasses_flex',
    payoffLine: "OH YEAH! Brilliant move! Too bright in here for mortal eyes!",
    durationMs: 4500,
  },
];

export function pickRandomMatchBet(excludeId?: string): CompanionBet {
  const pool = excludeId ? MATCH_BETS.filter((b) => b.id !== excludeId) : MATCH_BETS;
  return pool[Math.floor(Math.random() * pool.length)] || MATCH_BETS[0];
}

export function getSkitForCondition(params: {
  event?: ChessEvent;
  isCheck?: boolean;
  evalAdvantageCp?: number;
  activeBet: CompanionBet;
}): { skit: CompanionSkitId; payoffLine?: string; betTriggered?: boolean; durationMs: number } {
  const { event, isCheck, evalAdvantageCp = 0, activeBet } = params;

  // 1. Check if active bet's condition was met!
  if (event && activeBet.triggerEvents.includes(event)) {
    return {
      skit: activeBet.skit,
      payoffLine: activeBet.payoffLine,
      betTriggered: true,
      durationMs: activeBet.durationMs,
    };
  }

  // 2. Check other dramatic conditions
  if (event === 'victory') {
    return {
      skit: 'eat_mustache',
      payoffLine: "WAIT WE WON?! Okay... *rips off mustache* ...CHOMP! Tastes like victory and wax!",
      durationMs: 5200,
    };
  }
  if (event === 'capture_queen') {
    return { skit: 'victory_spin', durationMs: 3200 };
  }
  if (event === 'brilliant') {
    return { skit: 'sunglasses_flex', durationMs: 3600 };
  }
  if (event === 'blunder' || event === 'lost_queen') {
    return { skit: 'facepalm_dramatic', durationMs: 3000 };
  }
  if (isCheck || evalAdvantageCp <= -280) {
    return { skit: 'sweat_nervous', durationMs: 3000 };
  }
  if (evalAdvantageCp >= 320) {
    return { skit: 'sunglasses_flex', durationMs: 3000 };
  }

  return { skit: 'none', durationMs: 0 };
}
