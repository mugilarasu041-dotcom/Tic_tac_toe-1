import React from 'react';
import { GameTheme } from '../types';
import { GAME_THEMES } from '../themes';
import { Palette, Sparkles } from 'lucide-react';

interface ThemeSelectorProps {
  currentTheme: GameTheme;
  onSelectTheme: (theme: GameTheme) => void;
}

export default function ThemeSelector({ currentTheme, onSelectTheme }: ThemeSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1 text-sm font-semibold opacity-85">
        <Palette id="palette-icon" className="w-4 h-4 text-inherit" />
        <span>Select Visual Theme</span>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {GAME_THEMES.map((theme) => {
          const isActive = theme.id === currentTheme.id;
          return (
            <button
              key={theme.id}
              id={`theme-btn-${theme.id}`}
              onClick={() => onSelectTheme(theme)}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 border cursor-pointer active:scale-95 ${
                isActive
                  ? 'border-current bg-white/10 shadow-sm font-bold scale-[1.02]'
                  : 'border-transparent bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              {/* Colored Dot Indicator */}
              <div className="flex gap-1 items-center">
                <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-black ${theme.xColorClass}`}>
                  X
                </span>
                <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-black ${theme.oColorClass}`}>
                  O
                </span>
              </div>
              <span>{theme.name}</span>
              {isActive && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
