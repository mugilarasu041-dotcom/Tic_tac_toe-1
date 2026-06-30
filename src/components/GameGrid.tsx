import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BoardState, Player, GridSize, GameTheme } from '../types';

interface GameGridProps {
  board: BoardState;
  size: GridSize;
  theme: GameTheme;
  winningLine: number[] | null;
  onCellClick: (index: number) => void;
  disabled: boolean;
}

export default function GameGrid({
  board,
  size,
  theme,
  winningLine,
  onCellClick,
  disabled
}: GameGridProps) {
  
  // Stagger configurations for initial grid draw
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: 'spring', stiffness: 260, damping: 20 }
    },
  };

  return (
    <div className="w-full max-w-[400px] mx-auto aspect-square flex items-center justify-center">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={`${size}-${theme.id}`} // Re-render grid container with spring when size or theme changes
        className={`w-full h-full p-2.5 rounded-3xl grid gap-2.5 shadow-inner select-none ${theme.gridBgClass}`}
        style={{
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
        }}
      >
        {board.map((cellValue, idx) => {
          const isWinningCell = winningLine?.includes(idx);
          const isOccupied = cellValue !== null;
          
          return (
            <motion.button
              key={idx}
              variants={itemVariants}
              id={`cell-${idx}`}
              onClick={() => !isOccupied && !disabled && onCellClick(idx)}
              disabled={isOccupied || disabled}
              aria-label={`Cell number ${idx + 1}, currently ${cellValue || 'empty'}`}
              className={`relative flex items-center justify-center aspect-square rounded-2xl border text-center font-bold text-4xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 transition-all cursor-pointer ${
                theme.cellClass
              } ${
                isWinningCell 
                  ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/25 border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-[1.03] z-10' 
                  : ''
              }`}
              whileHover={!isOccupied && !disabled ? { scale: 1.03, y: -1 } : {}}
              whileTap={!isOccupied && !disabled ? { scale: 0.95 } : {}}
            >
              <AnimatePresence mode="wait">
                {cellValue === 'X' && (
                  <motion.svg
                    key="svg-x"
                    className={`w-[60%] h-[60%] ${theme.xColorClass}`}
                    viewBox="0 0 100 100"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="none"
                  >
                    {/* First line of X */}
                    <motion.path
                      d="M 20,20 L 80,80"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      exit={{ pathLength: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    />
                    {/* Second line of X */}
                    <motion.path
                      d="M 80,20 L 20,80"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      exit={{ pathLength: 0 }}
                      transition={{ duration: 0.2, delay: 0.1, ease: 'easeOut' }}
                    />
                  </motion.svg>
                )}

                {cellValue === 'O' && (
                  <motion.svg
                    key="svg-o"
                    className={`w-[58%] h-[58%] ${theme.oColorClass}`}
                    viewBox="0 0 100 100"
                    stroke="currentColor"
                    strokeWidth="11"
                    strokeLinecap="round"
                    fill="none"
                  >
                    {/* Circle drawing O */}
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="34"
                      initial={{ pathLength: 0, rotate: -90 }}
                      animate={{ pathLength: 1, rotate: -90 }}
                      exit={{ pathLength: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    />
                  </motion.svg>
                )}
              </AnimatePresence>

              {/* Decorative winner particle effect inside winning cells */}
              {isWinningCell && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.9, 1.1, 0.9] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                  className="absolute inset-2 border-2 border-dashed border-emerald-400/40 rounded-xl pointer-events-none"
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
