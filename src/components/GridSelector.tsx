import React from 'react';
import { GridSize } from '../types';
import { Grid, HelpCircle } from 'lucide-react';

interface GridSelectorProps {
  currentSize: GridSize;
  onSelectSize: (size: GridSize) => void;
}

export default function GridSelector({ currentSize, onSelectSize }: GridSelectorProps) {
  const sizes: GridSize[] = [3, 4, 5];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1 text-sm font-semibold opacity-85">
        <Grid id="grid-icon" className="w-4 h-4 text-inherit" />
        <span>Grid Layout Size</span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {sizes.map((size) => {
          const isActive = size === currentSize;
          return (
            <button
              key={size}
              id={`grid-size-${size}`}
              onClick={() => onSelectSize(size)}
              className={`flex flex-col items-center justify-center gap-2.5 p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer active:scale-95 ${
                isActive
                  ? 'border-current bg-white/10 font-bold scale-[1.02]'
                  : 'border-transparent bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              {/* Dot preview representation of the grid */}
              <div 
                className="grid gap-0.5" 
                style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: size * size }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive 
                        ? 'bg-current opacity-90' 
                        : 'bg-current opacity-40'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold tracking-wide">
                {size} × {size}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
