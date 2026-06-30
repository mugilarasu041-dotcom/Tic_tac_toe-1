import React from 'react';
import { GameMode, GameStats, GameTheme } from '../types';
import { RotateCcw, Award, Hand, Sparkles } from 'lucide-react';

interface GameScoreboardProps {
  stats: GameStats;
  mode: GameMode;
  theme: GameTheme;
  onResetStats: () => void;
  currentPlayer: 'X' | 'O';
  isGameOver: boolean;
}

export default function GameScoreboard({
  stats,
  mode,
  theme,
  onResetStats,
  currentPlayer,
  isGameOver
}: GameScoreboardProps) {
  const xLabel = mode === 'vs-ai' ? 'Player (X)' : 'Player X';
  const oLabel = mode === 'vs-ai' ? 'AI (O)' : 'Player O';

  const isXTurn = !isGameOver && currentPlayer === 'X';
  const isOTurn = !isGameOver && currentPlayer === 'O';

  return (
    <div className="flex flex-col gap-4">
      {/* Turn / Status banner */}
      <div className={`p-3.5 rounded-2xl flex items-center justify-between transition-all ${theme.cardBgClass}`}>
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isGameOver ? 'bg-amber-400' : 'bg-emerald-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${
              isGameOver ? 'bg-amber-500' : 'bg-emerald-500'
            }`}></span>
          </div>
          <span className="text-xs font-semibold tracking-wider uppercase opacity-80">
            {isGameOver ? 'Game Finished' : `${currentPlayer}'s active turn`}
          </span>
        </div>

        <button
          id="reset-scores-btn"
          onClick={onResetStats}
          title="Reset Scores"
          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 opacity-60 hover:opacity-100 transition-all cursor-pointer active:scale-90"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Scores */}
      <div className="grid grid-cols-3 gap-3">
        {/* X Score */}
        <div 
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
            isXTurn 
              ? 'ring-2 ring-emerald-500/40 border-emerald-500/40 bg-emerald-500/5' 
              : 'border-transparent bg-black/5 dark:bg-white/5'
          }`}
        >
          <span className={`text-[10px] font-bold tracking-wider uppercase opacity-65 mb-1 ${theme.xColorClass}`}>
            {xLabel}
          </span>
          <span className="text-2xl font-black tracking-tight">{stats.xWins}</span>
          {isXTurn && (
            <span className="text-[9px] font-medium text-emerald-500 mt-1 uppercase tracking-widest animate-pulse">
              thinking
            </span>
          )}
        </div>

        {/* Tie Score */}
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl border border-transparent bg-black/5 dark:bg-white/5">
          <span className="text-[10px] font-bold tracking-wider uppercase opacity-65 mb-1">
            Ties
          </span>
          <span className="text-2xl font-black tracking-tight">{stats.ties}</span>
        </div>

        {/* O Score */}
        <div 
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
            isOTurn 
              ? 'ring-2 ring-rose-500/40 border-rose-500/40 bg-rose-500/5' 
              : 'border-transparent bg-black/5 dark:bg-white/5'
          }`}
        >
          <span className={`text-[10px] font-bold tracking-wider uppercase opacity-65 mb-1 ${theme.oColorClass}`}>
            {oLabel}
          </span>
          <span className="text-2xl font-black tracking-tight">{stats.oWins}</span>
          {isOTurn && (
            <span className="text-[9px] font-medium text-rose-500 mt-1 uppercase tracking-widest animate-pulse">
              thinking
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
