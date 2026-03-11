import React from 'react';
import { VoxelMode } from '../../types';

interface KeyboardShortcutsProps {
  mode: VoxelMode;
}

export default function KeyboardShortcuts({ mode }: KeyboardShortcutsProps) {
  return (
    <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs leading-relaxed shrink-0">
      {mode === 'cube' ? (
        <>
          <span className="font-semibold">Left Click:</span> Add block
          <br />
          <span className="font-semibold">Right/Shift Click:</span> Remove block
          <br />
          <span className="font-semibold">Drag:</span> Rotate camera
        </>
      ) : mode === 'color' ? (
        <>
          <span className="font-semibold">Left Click:</span> Paint block
          <br />
          <span className="font-semibold">Drag:</span> Rotate camera
        </>
      ) : (
        <>
          <span className="font-semibold">Parts List:</span> Shows the optimized
          blocks needed to build this model.
          <br />
          <span className="font-semibold">Drag:</span> Rotate camera
        </>
      )}
    </div>
  );
}
