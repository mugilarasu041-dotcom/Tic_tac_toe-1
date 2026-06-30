import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GridSize, 
  GameMode, 
  AIDifficulty, 
  GameTheme, 
  BoardState, 
  Player, 
  GameStats, 
  MoveRecord 
} from './types';
import { GAME_THEMES } from './themes';
import { checkWinner, getAIMove } from './utils/gameLogic';

// Component imports
import ThemeSelector from './components/ThemeSelector';
import GridSelector from './components/GridSelector';
import GameScoreboard from './components/GameScoreboard';
import GameGrid from './components/GameGrid';

// Icon imports
import { 
  Sparkles, 
  Users, 
  Monitor, 
  Play, 
  HelpCircle, 
  ListOrdered, 
  Trash2,
  Trophy,
  RefreshCw,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Helpers for localStorage statistics
const getStatsKey = (size: GridSize, mode: GameMode) => `ttt_stats_${size}_${mode}`;

const loadStats = (size: GridSize, mode: GameMode): GameStats => {
  const key = getStatsKey(size, mode);
  const data = localStorage.getItem(key);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Error parsing stats', e);
    }
  }
  return { xWins: 0, oWins: 0, ties: 0 };
};

const saveStats = (size: GridSize, mode: GameMode, stats: GameStats) => {
  const key = getStatsKey(size, mode);
  localStorage.setItem(key, JSON.stringify(stats));
};

export default function App() {
  // Game Setup States
  const [gridSize, setGridSize] = useState<GridSize>(3);
  const [gameMode, setGameMode] = useState<GameMode>('vs-ai');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('hard');
  const [currentTheme, setCurrentTheme] = useState<GameTheme>(GAME_THEMES[0]);
  
  // Board State
  const [board, setBoard] = useState<BoardState>(() => Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | 'Tie' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  
  // Stats and Move History
  const [stats, setStats] = useState<GameStats>(() => loadStats(3, 'vs-ai'));
  const [history, setHistory] = useState<MoveRecord[]>([]);
  
  // UI States
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showMoveLogs, setShowMoveLogs] = useState(false);

  // Restart individual board
  const resetBoard = (size: GridSize = gridSize) => {
    setBoard(Array(size * size).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine(null);
    setHistory([]);
    setIsAiThinking(false);
  };

  // Sync stats when grid size or mode changes
  const handleGridSizeChange = (newSize: GridSize) => {
    setGridSize(newSize);
    setStats(loadStats(newSize, gameMode));
    resetBoard(newSize);
  };

  const handleGameModeChange = (newMode: GameMode) => {
    setGameMode(newMode);
    setStats(loadStats(gridSize, newMode));
    resetBoard(gridSize);
  };

  const handleResetAllStats = () => {
    if (window.confirm('Are you sure you want to reset all wins/ties for this specific setup?')) {
      const emptyStats = { xWins: 0, oWins: 0, ties: 0 };
      setStats(emptyStats);
      saveStats(gridSize, gameMode, emptyStats);
    }
  };

  // Make human move
  const handleCellClick = (index: number) => {
    if (board[index] !== null || winner || isAiThinking) return;
    
    // In vs-ai mode, only let X move (human is always X)
    if (gameMode === 'vs-ai' && currentPlayer !== 'X') return;

    makeMove(index, currentPlayer);
  };

  // Master move action
  const makeMove = (index: number, player: Player) => {
    const newBoard = [...board];
    newBoard[index] = player;
    setBoard(newBoard);

    // Record the move
    const record: MoveRecord = {
      player,
      cellIndex: index,
      timestamp: Date.now()
    };
    setHistory((prev) => [...prev, record]);

    // Check game condition
    const check = checkWinner(newBoard, gridSize);
    if (check.winner) {
      setWinner(check.winner);
      setWinningLine(check.winningLine);

      // Increment stats
      const nextStats = { ...stats };
      if (check.winner === 'X') nextStats.xWins++;
      else if (check.winner === 'O') nextStats.oWins++;
      else if (check.winner === 'Tie') nextStats.ties++;
      
      setStats(nextStats);
      saveStats(gridSize, gameMode, nextStats);
    } else {
      // Toggle player
      setCurrentPlayer(player === 'X' ? 'O' : 'X');
    }
  };

  // AI turn triggering
  useEffect(() => {
    if (gameMode !== 'vs-ai' || currentPlayer !== 'O' || winner || isAiThinking) return;

    setIsAiThinking(true);
    
    // Simulate a highly polished "thinking" delay for realism
    const delayMs = difficulty === 'easy' ? 450 : difficulty === 'medium' ? 700 : 900;
    
    const timer = setTimeout(() => {
      const aiMove = getAIMove(board, gridSize, 'O', difficulty);
      if (aiMove !== -1) {
        makeMove(aiMove, 'O');
      }
      setIsAiThinking(false);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [board, currentPlayer, gameMode, gridSize, difficulty, winner]);

  // Visual helper translations for grid coordinate log
  const getCellNotation = (index: number) => {
    const row = Math.floor(index / gridSize) + 1;
    const col = (index % gridSize) + 1;
    return `Row ${row}, Col ${col}`;
  };

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-start py-8 px-4 transition-all duration-300 ${currentTheme.bgClass}`}>
      
      {/* Outer Card Container */}
      <div className={`w-full max-w-xl p-5 md:p-7 rounded-3xl transition-all duration-300 ${currentTheme.cardBgClass}`}>
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b pb-4 mb-5 border-black/5 dark:border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-1.5">
                <span className={currentTheme.xColorClass}>X</span>
                <span className="opacity-40">-</span>
                <span className={currentTheme.oColorClass}>O</span>
                <span className="ml-1 text-lg font-bold">Tic-Tac-Toe</span>
              </h1>
              <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
                Offline
              </span>
            </div>
            <p className="text-xs opacity-75 mt-0.5">Tactile multi-size grid with strategic local AI</p>
          </div>

          <button
            id="how-to-play-toggle"
            onClick={() => setShowHowToPlay(!showHowToPlay)}
            className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="How to Play"
          >
            <HelpCircle className="w-4 h-4 opacity-80" />
          </button>
        </div>

        {/* HOW TO PLAY ACCORDION */}
        <AnimatePresence>
          {showHowToPlay && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5"
            >
              <div className="p-4 text-xs space-y-2.5 leading-relaxed">
                <p className="font-bold text-sm">💡 Quick Guidelines:</p>
                <ul className="list-disc list-inside space-y-1 opacity-90">
                  <li>
                    <span className="font-semibold">3 × 3 Grid</span>: Connect <span className="font-semibold">3</span> in a row to win.
                  </li>
                  <li>
                    <span className="font-semibold">4 × 4 Grid</span>: Connect <span className="font-semibold">4</span> in a row to win.
                  </li>
                  <li>
                    <span className="font-semibold">5 × 5 Grid</span>: Connect <span className="font-semibold">5</span> in a row to win.
                  </li>
                  <li>Select <span className="font-semibold">vs Computer AI</span> to play solo, or <span className="font-semibold">Local 2-Player</span> to pass the device back and forth.</li>
                  <li>Change themes dynamically below to fit your visual mood.</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PRIMARY SETUP CONTROLS */}
        <div className="space-y-4 mb-5">
          {/* Game Mode Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-2xl">
            <button
              id="mode-vs-ai"
              onClick={() => handleGameModeChange('vs-ai')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                gameMode === 'vs-ai'
                  ? 'bg-white dark:bg-slate-800 shadow-sm font-bold scale-[1.01]'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>vs Computer AI</span>
            </button>
            <button
              id="mode-vs-human"
              onClick={() => handleGameModeChange('vs-human')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                gameMode === 'vs-human'
                  ? 'bg-white dark:bg-slate-800 shadow-sm font-bold scale-[1.01]'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Local 2-Player</span>
            </button>
          </div>

          {/* AI Difficulty Selector (Visible only in AI mode) */}
          <AnimatePresence>
            {gameMode === 'vs-ai' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden flex items-center justify-between p-1 border border-black/5 dark:border-white/5 rounded-2xl"
              >
                <span className="text-xs font-semibold pl-2.5 opacity-80">AI Difficulty:</span>
                <div className="flex gap-1">
                  {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((level) => (
                    <button
                      key={level}
                      id={`diff-${level}`}
                      onClick={() => setDifficulty(level)}
                      className={`px-3 py-1.5 text-xs font-semibold capitalize rounded-xl transition-all cursor-pointer ${
                        difficulty === level
                          ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* GAME PLAY AREA */}
        <div className="space-y-6">
          {/* Scoreboard */}
          <GameScoreboard
            stats={stats}
            mode={gameMode}
            theme={currentTheme}
            onResetStats={handleResetAllStats}
            currentPlayer={currentPlayer}
            isGameOver={!!winner}
          />

          {/* Active Grid */}
          <GameGrid
            board={board}
            size={gridSize}
            theme={currentTheme}
            winningLine={winningLine}
            onCellClick={handleCellClick}
            disabled={!!winner || (gameMode === 'vs-ai' && currentPlayer === 'O' && isAiThinking)}
          />

          {/* GAME FINISHED / NOTIFICATION OVERLAY BANNER */}
          <AnimatePresence mode="wait">
            {winner && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${currentTheme.cardBgClass} shadow-md`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-xl">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider">
                      {winner === 'Tie' ? '🤝 Splendid Tie!' : `👑 Victory for ${winner}!`}
                    </h3>
                    <p className="text-xs opacity-75 mt-0.5">
                      {winner === 'Tie' 
                        ? 'No spaces remaining. Perfect defense by both sides.' 
                        : gameMode === 'vs-ai' && winner === 'O' 
                          ? 'The computer outsmarted you. Try a different strategy!'
                          : gameMode === 'vs-ai' && winner === 'X'
                            ? 'Excellent tactical play. You defeated the AI!'
                            : `Player ${winner} dominated the board.`
                      }
                    </p>
                  </div>
                </div>

                <button
                  id="play-again-btn"
                  onClick={() => resetBoard(gridSize)}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all ${currentTheme.accentClass}`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Play Again</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dynamic AI Thinking overlay notification block */}
          <AnimatePresence>
            {!winner && isAiThinking && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="flex items-center justify-center gap-2 text-xs opacity-70"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-inherit" />
                <span>AI is calculating optimal pathways...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM CONFIGURATION DRAWER / SETTINGS */}
        <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 space-y-6">
          {/* Custom Settings Pill Toggles */}
          <GridSelector currentSize={gridSize} onSelectSize={handleGridSizeChange} />

          <ThemeSelector currentTheme={currentTheme} onSelectTheme={setCurrentTheme} />

          {/* MOVE LOGS SECTION */}
          {history.length > 0 && (
            <div className="border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden">
              <button
                id="toggle-move-logs"
                onClick={() => setShowMoveLogs(!showMoveLogs)}
                className="w-full flex items-center justify-between p-3.5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-semibold opacity-85">
                  <ListOrdered className="w-3.5 h-3.5 text-inherit" />
                  <span>Match Move Coordinates ({history.length})</span>
                </div>
                {showMoveLogs ? <ChevronUp className="w-3.5 h-3.5 opacity-60" /> : <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
              </button>

              <AnimatePresence>
                {showMoveLogs && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-black/5 dark:border-white/5"
                  >
                    <div className="p-3 bg-black/[0.01] dark:bg-white/[0.01] max-h-40 overflow-y-auto space-y-1.5 scrollbar-thin">
                      {history.map((record, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between text-[11px] py-1 px-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded"
                        >
                          <span className="opacity-60 font-mono">#{index + 1}</span>
                          <span className="font-bold flex items-center gap-1">
                            Player{' '}
                            <span className={record.player === 'X' ? currentTheme.xColorClass : currentTheme.oColorClass}>
                              {record.player}
                            </span>
                          </span>
                          <span className="opacity-80 font-mono">{getCellNotation(record.cellIndex)}</span>
                          <span className="text-[9px] opacity-45">
                            {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

      </div>

      {/* FOOTER */}
      <footer className="mt-8 text-[10px] font-mono opacity-50 text-center tracking-wider max-w-sm">
        TIC-TAC-TOE GAME ENGINE V1.2 • OFFLINE ACTIVE • ZERO NETWORK REQUESTS
      </footer>
    </div>
  );
}
