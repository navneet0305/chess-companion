/**
 * Grandmaster Opening Book
 * Provides diverse, high-quality opening moves for White and Black.
 */

export interface OpeningMove {
  move: string; // UCI format e.g. "e2e4"
  san: string;  // SAN format e.g. "e4"
  weight: number; // Selection probability weight
  openingName: string;
}

// Map from FEN prefix (board placement + turn) to candidate book moves
export const OPENING_BOOK: Record<string, OpeningMove[]> = {
  // Initial starting position (White to move)
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w': [
    { move: 'e2e4', san: 'e4', weight: 45, openingName: "King's Pawn Opening" },
    { move: 'd2d4', san: 'd4', weight: 35, openingName: "Queen's Pawn Opening" },
    { move: 'c2c4', san: 'c4', weight: 12, openingName: 'English Opening' },
    { move: 'g1f3', san: 'Nf3', weight: 8, openingName: 'Réti Opening' },
  ],

  // 1. e4 responses (Black to move)
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b': [
    { move: 'e7e5', san: 'e5', weight: 40, openingName: 'Open Game' },
    { move: 'c7c5', san: 'c5', weight: 35, openingName: 'Sicilian Defense' },
    { move: 'e7e6', san: 'e6', weight: 15, openingName: 'French Defense' },
    { move: 'c7c6', san: 'c6', weight: 10, openingName: 'Caro-Kann Defense' },
  ],

  // 1. d4 responses (Black to move)
  'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b': [
    { move: 'g8f6', san: 'Nf6', weight: 45, openingName: 'Indian Defense' },
    { move: 'd7d5', san: 'd5', weight: 40, openingName: "Queen's Pawn Game" },
    { move: 'e7e6', san: 'e6', weight: 10, openingName: 'Horwitz Defense' },
    { move: 'f7f5', san: 'f5', weight: 5, openingName: 'Dutch Defense' },
  ],

  // 1. e4 e5 (White to move)
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w': [
    { move: 'g1f3', san: 'Nf3', weight: 70, openingName: "King's Knight Opening" },
    { move: 'f1c4', san: 'Bc4', weight: 15, openingName: "Bishop's Opening" },
    { move: 'b1c3', san: 'Nc3', weight: 10, openingName: 'Vienna Game' },
    { move: 'd2d4', san: 'd4', weight: 5, openingName: 'Center Game' },
  ],

  // 1. e4 e5 2. Nf3 (Black to move)
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b': [
    { move: 'b8c6', san: 'Nc6', weight: 70, openingName: 'Normal Defense' },
    { move: 'g8f6', san: 'Nf6', weight: 20, openingName: "Petrov's Defense" },
    { move: 'd7d6', san: 'd6', weight: 10, openingName: 'Philidor Defense' },
  ],

  // 1. e4 e5 2. Nf3 Nc6 (White to move)
  'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w': [
    { move: 'f1b5', san: 'Bb5', weight: 50, openingName: 'Ruy Lopez (Spanish Opening)' },
    { move: 'f1c4', san: 'Bc4', weight: 35, openingName: 'Italian Game' },
    { move: 'd2d4', san: 'd4', weight: 15, openingName: 'Scotch Game' },
  ],

  // 1. e4 c5 (Sicilian Defense - White to move)
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w': [
    { move: 'g1f3', san: 'Nf3', weight: 75, openingName: 'Open Sicilian Preparation' },
    { move: 'b1c3', san: 'Nc3', weight: 15, openingName: 'Closed Sicilian' },
    { move: 'c2c3', san: 'c3', weight: 10, openingName: 'Alapin Sicilian' },
  ],

  // 1. e4 c5 2. Nf3 (Black to move)
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b': [
    { move: 'd7d6', san: 'd6', weight: 45, openingName: 'Sicilian: Najdorf / Dragon Prep' },
    { move: 'b8c6', san: 'Nc6', weight: 35, openingName: 'Sicilian: Classical / Sveshnikov' },
    { move: 'e7e6', san: 'e6', weight: 20, openingName: 'Sicilian: French Variation' },
  ],

  // 1. d4 d5 (White to move)
  'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w': [
    { move: 'c2c4', san: 'c4', weight: 75, openingName: "Queen's Gambit" },
    { move: 'g1f3', san: 'Nf3', weight: 15, openingName: 'Queen Pawn Game' },
    { move: 'c1f4', san: 'Bf4', weight: 10, openingName: 'London System' },
  ],

  // 1. d4 d5 2. c4 (Queen's Gambit - Black to move)
  'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b': [
    { move: 'e7e6', san: 'e6', weight: 55, openingName: "Queen's Gambit Declined" },
    { move: 'c7c6', san: 'c6', weight: 30, openingName: 'Slav Defense' },
    { move: 'd5c4', san: 'dxc4', weight: 15, openingName: "Queen's Gambit Accepted" },
  ],

  // 1. d4 Nf6 (White to move)
  'rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w': [
    { move: 'c2c4', san: 'c4', weight: 70, openingName: 'Indian Defense Main Line' },
    { move: 'g1f3', san: 'Nf3', weight: 20, openingName: 'Knight Attack' },
    { move: 'c1f4', san: 'Bf4', weight: 10, openingName: 'London System' },
  ],

  // 1. d4 Nf6 2. c4 (Black to move)
  'rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b': [
    { move: 'e7e6', san: 'e6', weight: 45, openingName: 'Nimzo / Bogo / Queen Indian' },
    { move: 'g7g6', san: 'g6', weight: 40, openingName: "King's Indian / Grünfeld" },
    { move: 'c7c5', san: 'c5', weight: 15, openingName: 'Benoni Defense' },
  ],
};

/**
 * Find an opening book move for the given FEN.
 * Returns null if out of book.
 */
export function getBookMove(fen: string): OpeningMove | null {
  const parts = fen.split(' ');
  const key = `${parts[0]} ${parts[1]}`;

  const candidates = OPENING_BOOK[key];
  if (!candidates || candidates.length === 0) return null;

  // Weighted random selection
  const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
  let randomVal = Math.random() * totalWeight;

  for (const candidate of candidates) {
    randomVal -= candidate.weight;
    if (randomVal <= 0) {
      return candidate;
    }
  }

  return candidates[0];
}
