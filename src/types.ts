export type Player = 'X' | 'O';
export type CellValue = Player | null;
export type BoardState = CellValue[];

export type GameMode = 'vs-ai' | 'vs-human';
export type AIDifficulty = 'easy' | 'medium' | 'hard';
export type GridSize = 3 | 4 | 5;

export interface GameTheme {
  id: string;
  name: string;
  bgClass: string;
  cardBgClass: string;
  gridBgClass: string;
  cellClass: string;
  textClass: string;
  primaryColor: string; // Tailwinds colors or hex codes
  xColorClass: string;
  oColorClass: string;
  accentClass: string;
  gridLineClass: string;
}

export interface GameStats {
  xWins: number;
  oWins: number;
  ties: number;
}

export interface MoveRecord {
  player: Player;
  cellIndex: number;
  timestamp: number;
}
