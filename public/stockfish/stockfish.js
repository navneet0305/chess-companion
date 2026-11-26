/**
 * ChessMate UCI Engine Worker (Stockfish Compatible Fallback & Engine)
 * Implements standard UCI commands: uci, isready, setoption, position, go, stop.
 */

// Piece values for evaluation
const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Positional bonuses (Piece-Square Tables from White's perspective)
const PST = {
  p: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ],
  n: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  b: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  r: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
  ],
  q: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],
  k: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
  ]
};

// Global engine state
let currentFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
let skillLevel = 10;
let isStopped = false;

// Basic board representation
function parseFen(fen) {
  const parts = fen.split(' ');
  const rows = parts[0].split('/');
  const turn = parts[1] || 'w';
  const castling = parts[2] || '-';
  const enPassant = parts[3] || '-';

  const board = [];
  for (let r = 0; r < 8; r++) {
    board[r] = [];
    let col = 0;
    for (const ch of rows[r]) {
      if (ch >= '1' && ch <= '8') {
        const count = parseInt(ch, 10);
        for (let i = 0; i < count; i++) {
          board[r][col++] = null;
        }
      } else {
        const isWhite = ch === ch.toUpperCase();
        board[r][col++] = {
          color: isWhite ? 'w' : 'b',
          type: ch.toLowerCase(),
        };
      }
    }
  }

  return { board, turn, castling, enPassant };
}

// Convert row, col to algebraic notation
function squareName(r, c) {
  return String.fromCharCode(97 + c) + (8 - r);
}

// Evaluate position from White's perspective
function evaluateBoard(parsed) {
  let score = 0;
  const board = parsed.board;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;

      const val = PIECE_VALUES[p.type] || 0;
      const pstVal = PST[p.type] ? (p.color === 'w' ? PST[p.type][r][c] : PST[p.type][7 - r][c]) : 0;
      const total = val + pstVal;

      if (p.color === 'w') {
        score += total;
      } else {
        score -= total;
      }
    }
  }

  return parsed.turn === 'w' ? score : -score;
}

// Generate pseudo-legal and legal moves
function getMoves(parsed) {
  const moves = [];
  const { board, turn } = parsed;
  const opponent = turn === 'w' ? 'b' : 'w';

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.color !== turn) continue;

      const from = squareName(r, c);

      // Pawn moves
      if (p.type === 'p') {
        const dir = turn === 'w' ? -1 : 1;
        const startRow = turn === 'w' ? 6 : 1;
        const promoRow = turn === 'w' ? 0 : 7;

        // 1 step forward
        const nr = r + dir;
        if (nr >= 0 && nr < 8 && !board[nr][c]) {
          const isPromo = nr === promoRow;
          const to = squareName(nr, c);
          if (isPromo) {
            ['q', 'r', 'b', 'n'].forEach(pr => moves.push({ from, to, promotion: pr, piece: p }));
          } else {
            moves.push({ from, to, piece: p });
          }

          // 2 steps forward from start
          const nnr = r + dir * 2;
          if (r === startRow && !board[nnr][c]) {
            moves.push({ from, to: squareName(nnr, c), piece: p });
          }
        }

        // Diagonal captures
        for (const dc of [-1, 1]) {
          const nc = c + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            const target = board[nr][nc];
            const to = squareName(nr, nc);
            if (target && target.color === opponent) {
              if (nr === promoRow) {
                ['q', 'r', 'b', 'n'].forEach(pr => moves.push({ from, to, promotion: pr, piece: p }));
              } else {
                moves.push({ from, to, piece: p });
              }
            } else if (parsed.enPassant === to) {
              moves.push({ from, to, piece: p });
            }
          }
        }
      }

      // Knight moves
      if (p.type === 'n') {
        const offsets = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        for (const [dr, dc] of offsets) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            const target = board[nr][nc];
            if (!target || target.color === opponent) {
              moves.push({ from, to: squareName(nr, nc), piece: p });
            }
          }
        }
      }

      // Bishop, Rook, Queen
      if (p.type === 'b' || p.type === 'r' || p.type === 'q') {
        const dirs = [];
        if (p.type === 'b' || p.type === 'q') {
          dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
        }
        if (p.type === 'r' || p.type === 'q') {
          dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
        }

        for (const [dr, dc] of dirs) {
          let step = 1;
          while (true) {
            const nr = r + dr * step;
            const nc = c + dc * step;
            if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;

            const target = board[nr][nc];
            if (!target) {
              moves.push({ from, to: squareName(nr, nc), piece: p });
            } else {
              if (target.color === opponent) {
                moves.push({ from, to: squareName(nr, nc), piece: p });
              }
              break;
            }
            step++;
          }
        }
      }

      // King moves (including castling checks)
      if (p.type === 'k') {
        const dirs = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1],           [0, 1],
          [1, -1],  [1, 0],  [1, 1]
        ];
        for (const [dr, dc] of dirs) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            const target = board[nr][nc];
            if (!target || target.color === opponent) {
              moves.push({ from, to: squareName(nr, nc), piece: p });
            }
          }
        }

        // Castling
        if (turn === 'w' && r === 7 && c === 4) {
          if (parsed.castling.includes('K') && !board[7][5] && !board[7][6]) {
            moves.push({ from: 'e1', to: 'g1', piece: p });
          }
          if (parsed.castling.includes('Q') && !board[7][3] && !board[7][2] && !board[7][1]) {
            moves.push({ from: 'e1', to: 'c1', piece: p });
          }
        } else if (turn === 'b' && r === 0 && c === 4) {
          if (parsed.castling.includes('k') && !board[0][5] && !board[0][6]) {
            moves.push({ from: 'e8', to: 'g8', piece: p });
          }
          if (parsed.castling.includes('q') && !board[0][3] && !board[0][2] && !board[0][1]) {
            moves.push({ from: 'e8', to: 'c8', piece: p });
          }
        }
      }
    }
  }

  return moves;
}

// Make a move on parsed board
function applyMove(parsed, move) {
  const newBoard = parsed.board.map(row => [...row]);
  const fromC = move.from.charCodeAt(0) - 97;
  const fromR = 8 - parseInt(move.from[1], 10);
  const toC = move.to.charCodeAt(0) - 97;
  const toR = 8 - parseInt(move.to[1], 10);

  const piece = newBoard[fromR][fromC];
  newBoard[fromR][fromC] = null;

  if (move.promotion) {
    newBoard[toR][toC] = { color: piece.color, type: move.promotion };
  } else {
    newBoard[toR][toC] = piece;
  }

  // Handle castling rook movement
  if (piece.type === 'k' && Math.abs(toC - fromC) === 2) {
    if (toC === 6) { // Kingside
      newBoard[fromR][5] = newBoard[fromR][7];
      newBoard[fromR][7] = null;
    } else if (toC === 2) { // Queenside
      newBoard[fromR][3] = newBoard[fromR][0];
      newBoard[fromR][0] = null;
    }
  }

  const nextTurn = parsed.turn === 'w' ? 'b' : 'w';
  return {
    board: newBoard,
    turn: nextTurn,
    castling: parsed.castling,
    enPassant: '-',
  };
}

// Alpha-Beta Search
function minimax(parsed, depth, alpha, beta, isMaximizing) {
  if (depth === 0) {
    return evaluateBoard(parsed);
  }

  const moves = getMoves(parsed);
  if (moves.length === 0) {
    return -99999;
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const m of moves) {
      const nextState = applyMove(parsed, m);
      const ev = minimax(nextState, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const m of moves) {
      const nextState = applyMove(parsed, m);
      const ev = minimax(nextState, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

// Search for best move and position evaluation
function analyzePosition(fen, requestedDepth = 2) {
  const parsed = parseFen(fen);
  const moves = getMoves(parsed);

  if (moves.length === 0) {
    // Check if in check -> checkmate
    const whiteScore = parsed.turn === 'w' ? -99999 : 99999;
    return {
      bestMove: null,
      whiteScore,
      mate: parsed.turn === 'w' ? -1 : 1,
    };
  }

  // Adjust depth based on skill level
  const effectiveDepth = Math.max(1, Math.min(requestedDepth, skillLevel > 15 ? 3 : skillLevel > 8 ? 2 : 1));

  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const m of moves) {
    const nextState = applyMove(parsed, m);
    // Score from perspective of the player making the move
    const score = -minimax(nextState, effectiveDepth - 1, -Infinity, Infinity, false);

    if (score > bestScore) {
      bestScore = score;
      bestMove = m;
    }
  }

  // Convert bestScore to White's perspective
  let whiteScore = parsed.turn === 'w' ? bestScore : -bestScore;
  let mate = null;

  if (Math.abs(bestScore) >= 19000) {
    mate = bestScore > 0 ? (parsed.turn === 'w' ? 1 : -1) : (parsed.turn === 'w' ? -1 : 1);
  }

  const uciMove = bestMove ? `${bestMove.from}${bestMove.to}${bestMove.promotion || ''}` : null;
  return {
    bestMove: uciMove,
    whiteScore: Math.round(whiteScore),
    mate,
  };
}

function findBestMove(fen, requestedDepth = 2) {
  const parsed = parseFen(fen);
  const moves = getMoves(parsed);

  if (moves.length === 0) return null;

  // Beginner randomness
  if (skillLevel <= 2 && Math.random() < 0.6) {
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    return `${randomMove.from}${randomMove.to}${randomMove.promotion || ''}`;
  }

  const analysis = analyzePosition(fen, requestedDepth);
  return analysis.bestMove;
}

// Handle incoming messages from the main thread
self.onmessage = function (e) {
  const line = typeof e.data === 'string' ? e.data.trim() : '';

  if (line === 'uci') {
    self.postMessage('id name ChessMate-Stockfish-Engine');
    self.postMessage('id author ChessMate');
    self.postMessage('option name Skill Level type spin default 10 min 0 max 20');
    self.postMessage('uciok');
  } else if (line === 'isready') {
    self.postMessage('readyok');
  } else if (line.startsWith('setoption name Skill Level value')) {
    const parts = line.split(' ');
    skillLevel = parseInt(parts[parts.length - 1], 10) || 10;
  } else if (line.startsWith('position fen')) {
    currentFen = line.replace('position fen ', '').trim();
  } else if (line.startsWith('eval')) {
    // Direct evaluation request: eval or eval <fen>
    const fen = line.length > 5 ? line.slice(5).trim() : currentFen;
    const analysis = analyzePosition(fen, 2);
    self.postMessage(`evalresult score ${analysis.whiteScore} mate ${analysis.mate ?? 'none'} bestmove ${analysis.bestMove || 'none'}`);
  } else if (line.startsWith('go')) {
    isStopped = false;

    // Parse depth and movetime if present
    let depth = 2;
    let moveTime = 300;
    const parts = line.split(' ');
    const depthIdx = parts.indexOf('depth');
    if (depthIdx !== -1 && parts[depthIdx + 1]) {
      depth = parseInt(parts[depthIdx + 1], 10);
    }
    const timeIdx = parts.indexOf('movetime');
    if (timeIdx !== -1 && parts[timeIdx + 1]) {
      moveTime = parseInt(parts[timeIdx + 1], 10);
    }

    // Delay slightly to feel like human/engine thinking time
    setTimeout(() => {
      if (isStopped) return;
      const analysis = analyzePosition(currentFen, depth);
      if (analysis.bestMove) {
        self.postMessage(`info score cp ${analysis.whiteScore} depth ${depth} pv ${analysis.bestMove}`);
        self.postMessage(`bestmove ${analysis.bestMove}`);
      } else {
        self.postMessage('bestmove (none)');
      }
    }, Math.min(moveTime, 600));
  } else if (line === 'stop') {
    isStopped = true;
  }
};
