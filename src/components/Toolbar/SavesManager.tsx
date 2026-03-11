import React from 'react';
import { Save, Edit2 } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import Voxels from '../Voxels';
import { SavedProgress, CustomColor } from '../../types';

interface SavesManagerProps {
  savedProgresses: SavedProgress[];
  saveProgress: () => void;
  applyProgress: (progress: SavedProgress) => void;
  removeProgress: (id: string) => void;
  editingProgressId: string | null;
  setEditingProgressId: (id: string | null) => void;
  editingProgressName: string;
  setEditingProgressName: (name: string) => void;
  saveProgressName: (id: string) => void;
  customColors: CustomColor[];
}

export default function SavesManager({
  savedProgresses,
  saveProgress,
  applyProgress,
  removeProgress,
  editingProgressId,
  setEditingProgressId,
  editingProgressName,
  setEditingProgressName,
  saveProgressName,
  customColors,
}: SavesManagerProps) {
  return (
    <div className="space-y-4 overflow-y-auto pr-2 flex-1 min-h-0 custom-scrollbar">
      <button
        onClick={saveProgress}
        className="w-full flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
      >
        <Save size={16} /> Save Current Progress
      </button>
      <div className="space-y-4">
        {savedProgresses.length === 0 ? (
          <div className="text-sm text-stone-500 italic text-center py-4">
            No saved progress.
          </div>
        ) : (
          savedProgresses.map((progress) => (
            <div
              key={progress.id}
              className="flex flex-col gap-2 bg-stone-50 p-3 rounded-lg border border-stone-200 shadow-sm"
            >
              <div
                className="w-full h-32 bg-white rounded border border-stone-200 overflow-hidden relative cursor-pointer"
                onClick={() => applyProgress(progress)}
              >
                <Canvas flat>
                  <OrthographicCamera
                    makeDefault
                    position={[5, 5, 5]}
                    zoom={10}
                  />
                  <OrbitControls
                    enableRotate={false}
                    enablePan={false}
                    enableZoom={false}
                  />
                  <color attach="background" args={['#ffffff']} />
                  <ambientLight intensity={1.0} />
                  <directionalLight position={[10, 10, 10]} intensity={0.6} />
                  <directionalLight
                    position={[-10, -10, -10]}
                    intensity={0.4}
                  />

                  <Voxels
                    voxels={progress.voxels}
                    setVoxels={() => { }}
                    mode="cube"
                    currentColor="#000"
                    customColors={customColors}
                    interactive={false}
                  />
                </Canvas>
                <div className="absolute inset-0 hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                  <span className="bg-white/90 text-stone-800 text-xs font-bold px-2 py-1 rounded shadow-sm">
                    Click to Load
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-1">
                {editingProgressId === progress.id ? (
                  <input
                    type="text"
                    value={editingProgressName}
                    onChange={(e) => setEditingProgressName(e.target.value)}
                    onBlur={() => saveProgressName(progress.id)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && saveProgressName(progress.id)
                    }
                    className="text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded px-1.5 py-0.5 w-full mr-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                ) : (
                  <div
                    className="flex items-center gap-1.5 cursor-pointer group flex-1 min-w-0 mr-2"
                    onClick={() => {
                      setEditingProgressId(progress.id);
                      setEditingProgressName(progress.name);
                    }}
                    title="Click to edit name"
                  >
                    <span className="text-sm font-medium text-stone-700 truncate group-hover:text-blue-600 transition-colors">
                      {progress.name}
                    </span>
                    <Edit2
                      size={12}
                      className="text-stone-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    />
                  </div>
                )}
                <span className="text-xs text-stone-500 whitespace-nowrap shrink-0">
                  {progress.voxels.length} blocks
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => applyProgress(progress)}
                  className="flex-1 py-1.5 bg-stone-200 text-stone-700 rounded text-xs font-medium hover:bg-stone-300 transition-colors"
                >
                  Apply
                </button>
                <button
                  onClick={() => removeProgress(progress.id)}
                  className="flex-1 py-1.5 bg-red-50 text-red-600 rounded text-xs font-medium hover:bg-red-100 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
