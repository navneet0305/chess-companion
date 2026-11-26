import type { ChessEvent } from './dialogueLibrary';

export type CompanionSkitId =
  | 'none'
  | 'crown_flex'
  | 'eat_mustache'
  | 'headphone_jam'
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
    id: 'crown_bet',
    title: 'The Crown Drop',
    icon: '👑',
    betPrompt: "Bet: Beat Stockfish and I'll drop the golden crown onto my headphones and spin!",
    triggerEvents: ['victory'],
    skit: 'crown_flex',
    payoffLine: "CHECKMATE!! Drop the crown!! Long live the king of these 64 squares!",
    durationMs: 5000,
  },
  {
    id: 'headphone_queen_bet',
    title: 'DJ Beat Drop',
    icon: '🎧',
    betPrompt: "Bet: Snatch their Queen and I'll crank the headphones to 11 and jam out!",
    triggerEvents: ['capture_queen'],
    skit: 'headphone_jam',
    payoffLine: "THE QUEEN IS GONE?! Cue the bass drop — let's dance on the board!",
    durationMs: 4600,
  },
  {
    id: 'espresso_dare',
    title: 'Headphone Espresso Balance',
    icon: '☕',
    betPrompt: "Bet: Lose a Queen or blunder big and I'm tucking straight into my sneakers!",
    triggerEvents: ['lost_queen'],
    skit: 'turtle_hide',
    payoffLine: "Nope, didn't see that! Hiding inside my purple sneakers now, wake me up later!",
    durationMs: 4200,
  },
  {
    id: 'shades_genius_bet',
    title: 'Limitless Shades',
    icon: '🕶️',
    betPrompt: "Bet: Play a Brilliant move (!!) and I'll slide on the golden shades!",
    triggerEvents: ['brilliant'],
    skit: 'sunglasses_flex',
    payoffLine: "OH YEAH!! Brilliant move! Too bright in here for mortal eyes!",
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

  if (event && activeBet.triggerEvents.includes(event)) {
    return {
      skit: activeBet.skit,
      payoffLine: activeBet.payoffLine,
      betTriggered: true,
      durationMs: activeBet.durationMs,
    };
  }

  if (event === 'victory') {
    return {
      skit: 'crown_flex',
      payoffLine: "WE WON?! Put the golden crown straight on my head — absolute royalty!",
      durationMs: 5000,
    };
  }
  if (event === 'capture_queen') {
    return { skit: 'headphone_jam', durationMs: 3600 };
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
    return { skit: 'crown_flex', durationMs: 3200 };
  }

  return { skit: 'none', durationMs: 0 };
}
