import React from 'react';
import { clsx } from 'clsx';
import { Box, Palette, List, Save, Eye } from 'lucide-react';
import { VoxelMode } from '../../types';

interface ModeSelectorProps {
  mode: VoxelMode;
  setMode: (mode: VoxelMode) => void;
}

export default function ModeSelector({ mode, setMode }: ModeSelectorProps) {
  return (
    <div className="flex bg-stone-100 p-1 rounded-xl shrink-0">
      <button
        onClick={() => setMode('cube')}
        className={clsx(
          'flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-medium transition-all',
          mode === 'cube'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-stone-600 hover:text-stone-900',
        )}
      >
        <Box size={14} />
      </button>
      <button
        onClick={() => setMode('color')}
        className={clsx(
          'flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-medium transition-all',
          mode === 'color'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-stone-600 hover:text-stone-900',
        )}
      >
        <Palette size={14} />
      </button>
      <button
        onClick={() => setMode('parts')}
        className={clsx(
          'flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-medium transition-all',
          mode === 'parts'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-stone-600 hover:text-stone-900',
        )}
      >
        <List size={14} />
      </button>
      <button
        onClick={() => setMode('saves')}
        className={clsx(
          'flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-medium transition-all',
          mode === 'saves'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-stone-600 hover:text-stone-900',
        )}
      >
        <Save size={14} />
      </button>
      <button
        onClick={() => setMode('preview')}
        className={clsx(
          'flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-medium transition-all',
          mode === 'preview'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-stone-600 hover:text-stone-900',
        )}
      >
        <Eye size={14} />
      </button>
    </div>
  );
}
