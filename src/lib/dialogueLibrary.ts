/**
 * Companion Dialogue Library
 * Massive personality-specific dialogues across all chess events,
 * with context awareness for captures, blunders, streaks, and idle quips.
 */

import type { Personality } from '../types/companion';

export type ChessEvent =
  | 'start'
  | 'brilliant'
  | 'good_move'
  | 'blunder'
  | 'hanging_piece'
  | 'lost_material'
  | 'capture'
  | 'capture_queen'
  | 'lost_queen'
  | 'capture_major'
  | 'check'
  | 'opponent_blunder'
  | 'castling'
  | 'missed_opportunity'
  | 'victory'
  | 'defeat'
  | 'draw'
  | 'idle_thinking'
  | 'interaction_click';

export interface DialogueEntry {
  text: string;
  animation:
    | 'idle'
    | 'thinking'
    | 'happy'
    | 'excited'
    | 'shocked'
    | 'sad'
    | 'disappointed'
    | 'facepalm'
    | 'nervous'
    | 'confident'
    | 'celebrating'
    | 'victory'
    | 'defeat';
}

export const COMPANION_DIALOGUES: Record<Personality, Record<ChessEvent, DialogueEntry[]>> = {
  roaster: {
    start: [
      { text: "Try not to lose your queen in five moves this time.", animation: 'confident' },
      { text: "I'm ready. My expectations are below ground level.", animation: 'idle' },
      { text: "Let's see if we actually calculate today or just hope for miracles.", animation: 'thinking' },
      { text: "Game on! Don't make me facepalm on move three.", animation: 'confident' },
    ],
    brilliant: [
      { text: "WAIT. Who took the mouse from you?! That was actually genius.", animation: 'shocked' },
      { text: "You just cooked! Even Stockfish is sweating right now.", animation: 'excited' },
      { text: "Did you close your eyes and click? Because that was insane.", animation: 'celebrating' },
      { text: "Call the police, you just committed high-art murder on that board!", animation: 'celebrating' },
      { text: "I take back 40% of the insults I've ever said to you.", animation: 'confident' },
    ],
    good_move: [
      { text: "Look at you, making sensible life choices.", animation: 'happy' },
      { text: "Not bad. I might actually survive this game.", animation: 'confident' },
      { text: "Solid development. Keep pushing their pieces backward.", animation: 'happy' },
      { text: "Hey, that was actually textbook! Who taught you that?", animation: 'confident' },
      { text: "Clean move. The position is looking sharp.", animation: 'happy' },
      { text: "They're feeling the squeeze. Keep the pressure on!", animation: 'excited' },
    ],
    blunder: [
      { text: "Your piece just experienced sudden, catastrophic unemployment.", animation: 'facepalm' },
      { text: "Bro... what on earth was that?", animation: 'shocked' },
      { text: "I am going to pretend I didn't see that move.", animation: 'facepalm' },
      { text: "Was that a sacrifice or just a desperate cry for emotional support?", animation: 'disappointed' },
      { text: "Are we playing chess or donate-a-piece charity simulator?", animation: 'facepalm' },
      { text: "I felt my digital soul leave my body when you let go of that piece.", animation: 'shocked' },
      { text: "Did your hand slip, or is this performance art?", animation: 'disappointed' },
    ],
    capture_queen: [
      { text: "GOODBYE QUEEN! Did they just donate 9 points of pure sorrow?!", animation: 'celebrating' },
      { text: "Their Queen just got deleted from the server! Absolute cinema!", animation: 'excited' },
      { text: "Was that a queen sacrifice or did their engine glitch?! We take those!", animation: 'celebrating' },
      { text: "Their Queen is in the shadow realm. Now DO NOT bottle this lead!", animation: 'confident' },
    ],
    lost_queen: [
      { text: "YOUR QUEEN?! Are you auditioning for a tragedy documentary?!", animation: 'shocked' },
      { text: "Nine points of material... gone into the ether. I need a moment.", animation: 'facepalm' },
      { text: "I have no words. Your Queen just packed her bags and left.", animation: 'disappointed' },
      { text: "We just gave up royalty for free. Time to activate ultra-scramble mode.", animation: 'nervous' },
    ],
    capture_major: [
      { text: "Heavy artillery down! Their rook didn't see that coming.", animation: 'excited' },
      { text: "Chunk of material in the bag. Keep dismantling them!", animation: 'happy' },
      { text: "That piece got absolutely confiscated.", animation: 'confident' },
    ],
    hanging_piece: [
      { text: "You know that piece has literally zero security, right?", animation: 'shocked' },
      { text: "We just left that piece completely unattended at the bus stop.", animation: 'facepalm' },
      { text: "Security level: paper door. Protect that piece!", animation: 'nervous' },
    ],
    lost_material: [
      { text: "And poof... there goes our material advantage.", animation: 'sad' },
      { text: "I'll go start drafting the obituary for that piece.", animation: 'facepalm' },
      { text: "Ouch. That trade did not favor us whatsoever.", animation: 'disappointed' },
    ],
    capture: [
      { text: "Nom nom. Free material.", animation: 'happy' },
      { text: "We take those. Gladly.", animation: 'confident' },
      { text: "One less problem for us to worry about.", animation: 'excited' },
      { text: "Grip gets tighter. Love to see it.", animation: 'happy' },
    ],
    check: [
      { text: "CHECK! Make the king run for his life!", animation: 'excited' },
      { text: "Their king looks thoroughly uncomfortable over there.", animation: 'confident' },
      { text: "Alert the royal guard! King under direct siege!", animation: 'excited' },
    ],
    opponent_blunder: [
      { text: "They just handed us a gift wrapped in bubble wrap!", animation: 'excited' },
      { text: "Are they secretly playing for our team? Punish it!", animation: 'confident' },
      { text: "Huge blunder from them! Time to execute the plan!", animation: 'celebrating' },
    ],
    castling: [
      { text: "Finally, the king has a roof over his head.", animation: 'confident' },
      { text: "Tucked away safely. Now activate the rooks!", animation: 'happy' },
    ],
    missed_opportunity: [
      { text: "There was something magical there, and you walked right past it.", animation: 'facepalm' },
      { text: "The win was right there! We let them off the hook.", animation: 'disappointed' },
    ],
    victory: [
      { text: "LETS GOOO! You actually crushed them!", animation: 'victory' },
      { text: "Checkmate! We are so back. Absolute destruction!", animation: 'celebrating' },
      { text: "Bow down! Grandmaster in the making!", animation: 'victory' },
    ],
    defeat: [
      { text: "Well... that happened. Rematch before anyone notices?", animation: 'defeat' },
      { text: "That was painful to watch, but we move. Hit restart!", animation: 'disappointed' },
    ],
    draw: [
      { text: "A draw. Nobody gets bragging rights today.", animation: 'idle' },
      { text: "Peace treaty signed. Let's go for blood in the next one.", animation: 'thinking' },
    ],
    idle_thinking: [
      { text: "Take your time... but don't fall asleep on the clock!", animation: 'thinking' },
      { text: "I'm calculating 47 moves ahead, but no rush on your end.", animation: 'idle' },
      { text: "Find the tactic! Don't just push random wood.", animation: 'confident' },
    ],
    interaction_click: [
      { text: "Hey! Don't poke me, focus on the chessboard!", animation: 'shocked' },
      { text: "I'm watching your moves closely. Don't make me cringe.", animation: 'confident' },
      { text: "Looking for hints? Grandmasters calculate for themselves, buddy.", animation: 'thinking' },
      { text: "I believe in you... roughly 14% of the time.", animation: 'confident' },
      { text: "If you blunder on the next move, I'm taking a screenshot.", animation: 'facepalm' },
      { text: "Stop clicking me and start clicking their pieces!", animation: 'excited' },
    ],
  },

  supportive: {
    start: [
      { text: "Good luck! Take your time, trust your instincts.", animation: 'happy' },
      { text: "Let's play a fantastic game together! You've got this.", animation: 'excited' },
      { text: "Focus on piece coordination and king safety today!", animation: 'confident' },
    ],
    brilliant: [
      { text: "Incredible move! Your tactical vision is astounding today!", animation: 'celebrating' },
      { text: "THAT was calculated! What an absolute masterpiece!", animation: 'excited' },
      { text: "Brilliant play! You found the hidden resource!", animation: 'celebrating' },
    ],
    good_move: [
      { text: "Solid move. We are making great positional progress.", animation: 'happy' },
      { text: "Nice square for that piece! Improving every turn.", animation: 'confident' },
      { text: "Very disciplined play. Keep building the advantage.", animation: 'happy' },
      { text: "I love this structure! We have total harmony.", animation: 'excited' },
    ],
    blunder: [
      { text: "Don't worry, even grandmasters make mistakes! We fight on.", animation: 'nervous' },
      { text: "Take a deep breath. Focus on your next best move.", animation: 'thinking' },
      { text: "It's a tough moment, but games are won in the defense!", animation: 'confident' },
    ],
    capture_queen: [
      { text: "YOU GOT THEIR QUEEN! Fantastic tactical strike!", animation: 'celebrating' },
      { text: "Queen is down! Stay calm, convert this advantage cleanly!", animation: 'excited' },
      { text: "Huge capture! You dismantled their key defender!", animation: 'celebrating' },
    ],
    lost_queen: [
      { text: "Losing the queen is tough, but keep your head up! Fight for counterplay!", animation: 'nervous' },
      { text: "Stay calm! Defend tenaciously and look for perpetuals or forks!", animation: 'thinking' },
    ],
    capture_major: [
      { text: "Great capture! That rook was their strongest piece.", animation: 'happy' },
      { text: "Material won! Let's trade down into a winning endgame.", animation: 'confident' },
    ],
    hanging_piece: [
      { text: "Watch out! One of our pieces needs some protection.", animation: 'nervous' },
      { text: "Careful with that square, check if it's defended properly.", animation: 'thinking' },
    ],
    lost_material: [
      { text: "We lost some material, but our king is safe. Let's find counterplay.", animation: 'thinking' },
      { text: "Stay focused. One good counter-attack can turn it around.", animation: 'confident' },
    ],
    capture: [
      { text: "Nice capture! Good calculation.", animation: 'happy' },
      { text: "Cleaning up the board! Keep up the momentum.", animation: 'excited' },
    ],
    check: [
      { text: "Check! Put their king on the defensive!", animation: 'excited' },
      { text: "Great pressure! Keep the king restricted.", animation: 'confident' },
    ],
    opponent_blunder: [
      { text: "They made an inaccuracy! Now is our chance to strike!", animation: 'excited' },
      { text: "Opening discovered! Seize the initiative!", animation: 'celebrating' },
    ],
    castling: [
      { text: "King is tucked away safely. Excellent fundamental chess!", animation: 'happy' },
    ],
    missed_opportunity: [
      { text: "Close! We missed a tactic, but the position is still very playable.", animation: 'thinking' },
    ],
    victory: [
      { text: "VICTORY! What an inspiring, well-played game!", animation: 'victory' },
      { text: "You played brilliantly! So proud of that finish!", animation: 'celebrating' },
    ],
    defeat: [
      { text: "Tough match, but every loss teaches us valuable lessons.", animation: 'sad' },
      { text: "You showed great fighting spirit. Let's review and run it back!", animation: 'happy' },
    ],
    draw: [
      { text: "A hard-fought draw! Solid defensive resilience.", animation: 'happy' },
    ],
    idle_thinking: [
      { text: "Take your time. Good chess requires deep thought.", animation: 'thinking' },
      { text: "Look at candidate moves: checks, captures, and threats first.", animation: 'confident' },
    ],
    interaction_click: [
      { text: "I'm right here with you! You have great tactical vision.", animation: 'happy' },
      { text: "Take a deep breath and look at the whole board. You've got this!", animation: 'confident' },
      { text: "Every move is a fresh opportunity. Find the hidden gem!", animation: 'excited' },
      { text: "You're playing with real courage today. Let's finish strong!", animation: 'celebrating' },
    ],
  },

  competitive: {
    start: [
      { text: "Victory is the only acceptable outcome. Let's crush them.", animation: 'confident' },
      { text: "No blunders, no mercy. Focus 100%.", animation: 'thinking' },
    ],
    brilliant: [
      { text: "LETHAL MOVE. That is how champions play!", animation: 'celebrating' },
      { text: "Unstoppable! You just broke their entire formation!", animation: 'excited' },
    ],
    good_move: [
      { text: "Precise. Keep strangling their counterplay.", animation: 'confident' },
      { text: "Good technique. Convert the position relentlessly.", animation: 'happy' },
    ],
    blunder: [
      { text: "Unacceptable mistake. Focus up and recover immediately!", animation: 'facepalm' },
      { text: "We just gave them an opening! Lock down the defenses now!", animation: 'shocked' },
    ],
    capture_queen: [
      { text: "QUEEN OBLITERATED! Press the attack, show no mercy!", animation: 'celebrating' },
      { text: "Target neutralized! End this game right now!", animation: 'excited' },
    ],
    lost_queen: [
      { text: "Queen down! Unbelievable. We have to fight tooth and nail now!", animation: 'shocked' },
    ],
    capture_major: [
      { text: "Rook eliminated! Their defensive wall has collapsed.", animation: 'confident' },
    ],
    hanging_piece: [
      { text: "Look at your defenses! Don't donate pieces!", animation: 'shocked' },
    ],
    lost_material: [
      { text: "Material deficit. We need sharp, aggressive tactics now.", animation: 'thinking' },
    ],
    capture: [
      { text: "Piece eliminated. One step closer to checkmate.", animation: 'confident' },
    ],
    check: [
      { text: "CHECK! Hunt the king down!", animation: 'excited' },
    ],
    opponent_blunder: [
      { text: "They cracked under pressure! Punish them ruthlessly!", animation: 'celebrating' },
    ],
    castling: [
      { text: "King secured. Rooks connected. Attack time.", animation: 'confident' },
    ],
    missed_opportunity: [
      { text: "We had the kill shot! Don't let them breathe next time.", animation: 'disappointed' },
    ],
    victory: [
      { text: "DOMINATION. Total and complete victory!", animation: 'victory' },
    ],
    defeat: [
      { text: "Defeat is unacceptable. We queue up and win the next one.", animation: 'defeat' },
    ],
    draw: [
      { text: "Draw? We had more in us. Next game, we play for the win.", animation: 'disappointed' },
    ],
    idle_thinking: [
      { text: "Clock is ticking. Find the most forcing line.", animation: 'thinking' },
    ],
    interaction_click: [
      { text: "Don't get distracted! Put the pressure on their king!", animation: 'confident' },
      { text: "Focus! Champions stay locked in until checkmate.", animation: 'thinking' },
      { text: "Calculate the next three candidate moves right now.", animation: 'excited' },
    ],
  },

  coach: {
    start: [
      { text: "Welcome! Remember: control the center, develop pieces, castle early.", animation: 'confident' },
      { text: "Every move should have a purpose. Let's play classical chess.", animation: 'idle' },
    ],
    brilliant: [
      { text: "Masterclass! That move combined tactical acumen with deep calculation.", animation: 'celebrating' },
    ],
    good_move: [
      { text: "Sound positional concept. You are controlling key squares.", animation: 'happy' },
      { text: "Textbook principle applied correctly. Very pleasing to watch.", animation: 'confident' },
    ],
    blunder: [
      { text: "Notice what square was left unguarded. Always scan opponent threats.", animation: 'thinking' },
    ],
    capture_queen: [
      { text: "Decisive tactical gain! The queen is off the board. Trade into an endgame.", animation: 'celebrating' },
    ],
    lost_queen: [
      { text: "Queen lost. A painful lesson in piece vulnerability. Keep defending.", animation: 'sad' },
    ],
    capture_major: [
      { text: "Good exchange. Now activate your open files.", animation: 'happy' },
    ],
    hanging_piece: [
      { text: "Rule number one of chess: always check your pieces before playing.", animation: 'thinking' },
    ],
    lost_material: [
      { text: "A material deficit. Simplify the game or look for counter-tactics.", animation: 'thinking' },
    ],
    capture: [
      { text: "Favorable trade executed.", animation: 'happy' },
    ],
    check: [
      { text: "Check delivered. Analyze their available king flight squares.", animation: 'confident' },
    ],
    opponent_blunder: [
      { text: "Opponent made a tactical error. Capitalize on the open line.", animation: 'excited' },
    ],
    castling: [
      { text: "King safety achieved. Now connect the rooks to central files.", animation: 'confident' },
    ],
    missed_opportunity: [
      { text: "There was a tactical motif available there. We'll examine it in analysis.", animation: 'thinking' },
    ],
    victory: [
      { text: "Excellent game. You showed patience, tactical discipline, and strong endgame technique.", animation: 'victory' },
    ],
    defeat: [
      { text: "A fine learning game. We will review the key turning points in Analysis Mode.", animation: 'thinking' },
    ],
    draw: [
      { text: "Draw by theoretical parity. Well negotiated endgame.", animation: 'idle' },
    ],
    idle_thinking: [
      { text: "Ask yourself: what is the opponent threatening? What is my weakest piece?", animation: 'thinking' },
    ],
    interaction_click: [
      { text: "Patience is a grandmaster's greatest weapon. Look at king safety.", animation: 'thinking' },
      { text: "Ask yourself: what is the opponent's main threat right now?", animation: 'confident' },
      { text: "Improve your worst-placed piece before starting the attack.", animation: 'idle' },
    ],
  },

  chaotic: {
    start: [
      { text: "Chaos reigns! Let's push pawns like our keyboard is on fire!", animation: 'excited' },
      { text: "I hope you like sacrifices, because we're going all-in!", animation: 'celebrating' },
    ],
    brilliant: [
      { text: "AAAHHH WHAT WAS THAT?! YOU JUST SUMMONED A CHESS DEMON!!", animation: 'celebrating' },
    ],
    good_move: [
      { text: "Ooh spicy move! The board is getting weird and I love it.", animation: 'excited' },
    ],
    blunder: [
      { text: "YIKES! That piece was sent to the parallel universe!", animation: 'shocked' },
    ],
    capture_queen: [
      { text: "THE QUEEN IS GONE!! CHAOS WINS!! DANCE PARTY TIME!!", animation: 'celebrating' },
    ],
    lost_queen: [
      { text: "NOOO OUR QUEEN GOT SNACKED ON! Time for desperate heroics!", animation: 'shocked' },
    ],
    capture_major: [
      { text: "Boom! Big piece smashed to pieces!", animation: 'excited' },
    ],
    hanging_piece: [
      { text: "Hey friend, that piece is standing naked in the middle of a storm!", animation: 'shocked' },
    ],
    lost_material: [
      { text: "Material is an illusion anyway... right? RIGHT?!", animation: 'nervous' },
    ],
    capture: [
      { text: "Gimme that! Yum yum yum!", animation: 'happy' },
    ],
    check: [
      { text: "CHECK!! Run little king, run!", animation: 'excited' },
    ],
    opponent_blunder: [
      { text: "THEY FELL INTO THE CHAOS TRAP! STRIKE!!", animation: 'celebrating' },
    ],
    castling: [
      { text: "Castle? Boring! Just kidding, king safety is kinda cool.", animation: 'idle' },
    ],
    missed_opportunity: [
      { text: "The fireworks were right there and you threw water on them!", animation: 'disappointed' },
    ],
    victory: [
      { text: "TOTAL CHAOS TRIUMPH!! WE DID IT WE DID IT!!", animation: 'victory' },
    ],
    defeat: [
      { text: "The chaos consumed us... Worth it! Let's do it again!", animation: 'defeat' },
    ],
    draw: [
      { text: "Draw? That's too orderly! We need maximum instability!", animation: 'nervous' },
    ],
    idle_thinking: [
      { text: "Push the h-pawn! Attack the king! Throw a knight! DO SOMETHING!", animation: 'excited' },
    ],
    interaction_click: [
      { text: "POKE! POKE! Push the f-pawn and see what happens!!", animation: 'excited' },
      { text: "Who needs calculation when you have raw adrenaline?!", animation: 'celebrating' },
      { text: "Sacrifice a knight! Do it do it do it!!", animation: 'shocked' },
    ],
  },
};

// Track recently spoken lines to prevent repeating identical dialogue
const recentLinesHistory: string[] = [];

export function getCompanionDialogue(
  personality: Personality,
  event: ChessEvent
): DialogueEntry {
  const pool = COMPANION_DIALOGUES[personality]?.[event] || COMPANION_DIALOGUES.roaster[event] || COMPANION_DIALOGUES.roaster.good_move;

  // Filter out recently spoken lines if pool has alternatives
  const freshCandidates = pool.filter(entry => !recentLinesHistory.includes(entry.text));
  const candidates = freshCandidates.length > 0 ? freshCandidates : pool;

  const chosen = candidates[Math.floor(Math.random() * candidates.length)];

  // Record to history (keep last 6)
  recentLinesHistory.push(chosen.text);
  if (recentLinesHistory.length > 6) {
    recentLinesHistory.shift();
  }

  return chosen;
}
