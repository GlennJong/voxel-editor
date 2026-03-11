import React from 'react';
import { Undo, Redo, RotateCcw, Download } from 'lucide-react';
import { initialVoxels } from '../../constants';
import { Voxel } from '../../types';

interface ActionButtonsProps {
  undo: () => void;
  redo: () => void;
  reset: (val: Voxel[]) => void;
  exportData: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function ActionButtons({
  undo,
  redo,
  reset,
  exportData,
  canUndo,
  canRedo,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-2 shrink-0">
      <button
        onClick={undo}
        disabled={!canUndo}
        className="flex-1 flex items-center justify-center gap-1 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 disabled:opacity-40 disabled:hover:bg-stone-100 transition-colors text-sm font-medium"
        title="Undo"
      >
        <Undo size={16} />
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        className="flex-1 flex items-center justify-center gap-1 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 disabled:opacity-40 disabled:hover:bg-stone-100 transition-colors text-sm font-medium"
        title="Redo"
      >
        <Redo size={16} />
      </button>
      <button
        onClick={() => reset(initialVoxels)}
        className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
        title="Reset"
      >
        <RotateCcw size={16} />
      </button>
      <button
        onClick={exportData}
        className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
        title="Export"
      >
        <Download size={16} />
      </button>
    </div>
  );
}
