import { BoardState, Player, GridSize, AIDifficulty } from '../types';

/**
 * Dynamically computes all winning line indices (rows, columns, and diagonals) for a given grid size.
 */
export function getWinningLines(size: GridSize): number[][] {
  const lines: number[][] = [];
  
  // Rows
  for (let r = 0; r < size; r++) {
    const row: number[] = [];
    for (let c = 0; c < size; c++) {
      row.push(r * size + c);
    }
    lines.push(row);
  }
  
  // Columns
  for (let c = 0; c < size; c++) {
    const col: number[] = [];
    for (let r = 0; r < size; r++) {
      col.push(r * size + c);
    }
    lines.push(col);
  }
  
  // Diagonals
  const diag1: number[] = [];
  const diag2: number[] = [];
  for (let i = 0; i < size; i++) {
    diag1.push(i * size + i);
    diag2.push(i * size + (size - 1 - i));
  }
  lines.push(diag1);
  lines.push(diag2);
  
  return lines;
}

/**
 * Checks if there is a winner, a tie, or if the game is still active.
 */
export function checkWinner(board: BoardState, size: GridSize): { winner: Player | 'Tie' | null; winningLine: number[] | null } {
  const lines = getWinningLines(size);
  
  for (const line of lines) {
    const firstVal = board[line[0]];
    if (firstVal && line.every(idx => board[idx] === firstVal)) {
      return { winner: firstVal, winningLine: line };
    }
  }
  
  if (board.every(cell => cell !== null)) {
    return { winner: 'Tie', winningLine: null };
  }
  
  return { winner: null, winningLine: null };
}

/**
 * Returns cells in order of priority (centers first)
 */
function getCenterCells(size: GridSize): number[] {
  if (size === 3) return [4];
  if (size === 4) return [5, 6, 9, 10];
  if (size === 5) return [12, 6, 8, 16, 18, 7, 11, 13, 17];
  return [];
}

/**
 * Heuristically evaluates a board state from the AI's perspective.
 * Positive is good for AI, negative is good for opponent.
 */
function evaluateBoard(board: BoardState, size: GridSize, aiPlayer: Player): number {
  const opponent = aiPlayer === 'X' ? 'O' : 'X';
  const lines = getWinningLines(size);
  let score = 0;

  for (const line of lines) {
    let aiCount = 0;
    let oppCount = 0;
    for (const idx of line) {
      if (board[idx] === aiPlayer) aiCount++;
      else if (board[idx] === opponent) oppCount++;
    }

    if (aiCount === size) return 100000;
    if (oppCount === size) return -100000;

    // Award exponential points for unblocked consecutive sequences
    if (aiCount > 0 && oppCount === 0) {
      score += Math.pow(10, aiCount);
    } else if (oppCount > 0 && aiCount === 0) {
      // Slightly higher weight to blocking opponent's building lines
      score -= Math.pow(10, oppCount) * 1.3;
    }
  }

  // Centrality weights
  const centerCells = getCenterCells(size);
  for (const idx of centerCells) {
    if (board[idx] === aiPlayer) score += 8;
    else if (board[idx] === opponent) score -= 8;
  }

  return score;
}

/**
 * Minimax algorithm with Alpha-Beta pruning
 */
function minimax(
  board: BoardState,
  size: GridSize,
  depth: number,
  alpha: number,
  beta: number,
  isMax: boolean,
  aiPlayer: Player,
  maxDepth: number
): number {
  const opponent = aiPlayer === 'X' ? 'O' : 'X';
  const winnerCheck = checkWinner(board, size);
  
  if (winnerCheck.winner === aiPlayer) return 100000 - depth;
  if (winnerCheck.winner === opponent) return -100000 + depth;
  if (winnerCheck.winner === 'Tie') return 0;
  
  if (depth >= maxDepth) {
    return evaluateBoard(board, size, aiPlayer);
  }
  
  const availableMoves = board.map((v, i) => v === null ? i : null).filter((v): v is number => v !== null);
  
  // Sort moves heuristically (centers first) to maximize alpha-beta cuts
  const centerCells = getCenterCells(size);
  availableMoves.sort((a, b) => {
    const aCenter = centerCells.includes(a) ? 0 : 1;
    const bCenter = centerCells.includes(b) ? 0 : 1;
    if (aCenter !== bCenter) return aCenter - bCenter;
    
    // Sort by physical distance to absolute center of board
    const ar = Math.floor(a / size);
    const ac = a % size;
    const br = Math.floor(b / size);
    const bc = b % size;
    const mid = (size - 1) / 2;
    const distA = Math.abs(ar - mid) + Math.abs(ac - mid);
    const distB = Math.abs(br - mid) + Math.abs(bc - mid);
    return distA - distB;
  });

  if (isMax) {
    let maxEval = -Infinity;
    for (const move of availableMoves) {
      board[move] = aiPlayer;
      const score = minimax(board, size, depth + 1, alpha, beta, false, aiPlayer, maxDepth);
      board[move] = null;
      maxEval = Math.max(maxEval, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of availableMoves) {
      board[move] = opponent;
      const score = minimax(board, size, depth + 1, alpha, beta, true, aiPlayer, maxDepth);
      board[move] = null;
      minEval = Math.min(minEval, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Calculates the next move for the AI.
 */
export function getAIMove(board: BoardState, size: GridSize, aiPlayer: Player, difficulty: AIDifficulty): number {
  const availableMoves = board.map((v, i) => v === null ? i : null).filter((v): v is number => v !== null);
  if (availableMoves.length === 0) return -1;

  const opponent = aiPlayer === 'X' ? 'O' : 'X';

  // 1. Easy Mode: Completely random picker with short delay simulation (handled in component)
  if (difficulty === 'easy') {
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }

  // 2. Medium Mode: 40% random, 60% smart (or block/win checking)
  if (difficulty === 'medium') {
    const shouldPlayRandom = Math.random() < 0.35;
    if (shouldPlayRandom) {
      const randomIndex = Math.floor(Math.random() * availableMoves.length);
      return availableMoves[randomIndex];
    }
    // Otherwise falls through to smart checks
  }

  // 3. Win Checker (Always do this for medium and hard): If there is a winning move, take it immediately
  for (const move of availableMoves) {
    board[move] = aiPlayer;
    const isWin = checkWinner(board, size).winner === aiPlayer;
    board[move] = null;
    if (isWin) return move;
  }

  // 4. Block Checker (Always do this for medium and hard): If opponent is about to win, block them
  for (const move of availableMoves) {
    board[move] = opponent;
    const isOpponentWin = checkWinner(board, size).winner === opponent;
    board[move] = null;
    if (isOpponentWin) return move;
  }

  // If medium mode and we got past immediate win/blocks, 50% chance to just pick a reasonable move or center
  if (difficulty === 'medium') {
    const centers = getCenterCells(size);
    const availableCenters = centers.filter(idx => board[idx] === null);
    if (availableCenters.length > 0 && Math.random() < 0.7) {
      return availableCenters[Math.floor(Math.random() * availableCenters.length)];
    }
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }

  // 5. Hard Mode: In-depth search (unbeatable for 3x3, master-level heuristic for 4x4 and 5x5)
  // Depth limit: size 3 -> 9 (perfect), size 4 -> 4, size 5 -> 3
  const maxDepth = size === 3 ? 9 : size === 4 ? 4 : 3;

  let bestScore = -Infinity;
  let bestMoves: number[] = [];

  // Sort available moves heuristically to check best branches first
  const centerCells = getCenterCells(size);
  availableMoves.sort((a, b) => {
    const aCenter = centerCells.includes(a) ? 0 : 1;
    const bCenter = centerCells.includes(b) ? 0 : 1;
    if (aCenter !== bCenter) return aCenter - bCenter;
    return 0;
  });

  for (const move of availableMoves) {
    board[move] = aiPlayer;
    // Minimize opponent's chance
    const score = minimax(board, size, 0, -Infinity, Infinity, false, aiPlayer, maxDepth);
    board[move] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }

  // If multiple equally good moves, pick a random one among them for variety
  const randomIndex = Math.floor(Math.random() * bestMoves.length);
  return bestMoves[randomIndex];
}
