import React from 'react';
import { GripHorizontal } from 'lucide-react';
import { DragControls } from 'motion/react';

interface HeaderProps {
  dragControls: DragControls;
}

export default function Header({ dragControls }: HeaderProps) {
  return (
    <div
      onPointerDown={(e) => dragControls.start(e)}
      className="flex items-start justify-between cursor-grab active:cursor-grabbing pb-1 border-b border-transparent hover:border-stone-200 transition-colors"
      title="Drag to move"
    >
      <div>
        <h1 className="text-lg font-semibold text-stone-800 tracking-tight mb-1">
          Voxel Editor
        </h1>
        <p className="text-xs text-stone-500">
          Build your 3D world block by block.
        </p>
      </div>
      <GripHorizontal className="text-stone-400 mt-1" size={20} />
    </div>
  );
}
