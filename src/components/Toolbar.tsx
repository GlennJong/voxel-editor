import React from 'react';
import { motion, useDragControls } from 'motion/react';
import { clsx } from 'clsx';
import { Undo, Redo, RotateCcw, Box, Palette, List, Plus, X, Download, Save, Edit2, GripHorizontal } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Voxel, CustomColor, BlockDef, SavedProgress, VoxelMode } from '../types';
import { COLORS, COLOR_NAMES, initialVoxels } from '../constants';
import Voxels from './Voxels';
import { resolveColor } from '../utils';

type ToolbarProps = {
  mode: VoxelMode;
  setMode: (mode: VoxelMode) => void;
  currentColor: string;
  setCurrentColor: (color: string) => void;
  customColors: CustomColor[];
  setCustomColors: (colors: CustomColor[]) => void;
  allBlocks: BlockDef[];
  selectedBlocks: string[];
  toggleBlock: (id: string) => void;
  removeCustomBlock: (id: string) => void;
  customDim: { x: number, y: number, z: number };
  setCustomDim: React.Dispatch<React.SetStateAction<{ x: number, y: number, z: number }>>;
  addCustomBlock: () => void;
  partsList: { colorId: string, size: string, count: number }[];
  savedProgresses: SavedProgress[];
  saveProgress: () => void;
  applyProgress: (progress: SavedProgress) => void;
  removeProgress: (id: string) => void;
  editingProgressId: string | null;
  setEditingProgressId: (id: string | null) => void;
  editingProgressName: string;
  setEditingProgressName: (name: string) => void;
  saveProgressName: (id: string) => void;
  undo: () => void;
  redo: () => void;
  reset: (val: Voxel[]) => void;
  exportData: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

export default function Toolbar({
  mode, setMode,
  currentColor, setCurrentColor,
  customColors, setCustomColors,
  allBlocks, selectedBlocks, toggleBlock, removeCustomBlock,
  customDim, setCustomDim, addCustomBlock,
  partsList,
  savedProgresses, saveProgress, applyProgress, removeProgress,
  editingProgressId, setEditingProgressId, editingProgressName, setEditingProgressName, saveProgressName,
  undo, redo, reset, exportData, canUndo, canRedo
}: ToolbarProps) {
  const dragControls = useDragControls();

  return (
    <motion.div 
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      className="absolute top-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-stone-200 flex flex-col gap-4 w-72 max-h-[90vh] overflow-hidden resize-x min-w-[280px] max-w-[500px]"
      style={{ touchAction: 'none' }}
    >
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className="flex items-start justify-between cursor-grab active:cursor-grabbing pb-1 border-b border-transparent hover:border-stone-200 transition-colors" 
        title="Drag to move"
      >
        <div>
          <h1 className="text-lg font-semibold text-stone-800 tracking-tight mb-1">Voxel Editor</h1>
          <p className="text-xs text-stone-500">Build your 3D world block by block.</p>
        </div>
        <GripHorizontal className="text-stone-400 mt-1" size={20} />
      </div>

      <div className="flex bg-stone-100 p-1 rounded-xl flex-shrink-0">
        <button 
          onClick={() => setMode('cube')} 
          className={clsx(
            "flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-medium transition-all", 
            mode === 'cube' ? 'bg-white text-blue-600 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          )}
        >
          <Box size={14} />
          Build
        </button>
        <button 
          onClick={() => setMode('color')} 
          className={clsx(
            "flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-medium transition-all", 
            mode === 'color' ? 'bg-white text-blue-600 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          )}
        >
          <Palette size={14} />
          Paint
        </button>
        <button 
          onClick={() => setMode('parts')} 
          className={clsx(
            "flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-medium transition-all", 
            mode === 'parts' ? 'bg-white text-blue-600 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          )}
        >
          <List size={14} />
          Parts
        </button>
        <button 
          onClick={() => setMode('saves')} 
          className={clsx(
            "flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-medium transition-all", 
            mode === 'saves' ? 'bg-white text-blue-600 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          )}
        >
          <Save size={14} />
          Saves
        </button>
      </div>
      
      {(mode === 'cube' || mode === 'color') && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c => (
              <button 
                key={c} 
                onClick={() => setCurrentColor(c)} 
                className={clsx(
                  "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110", 
                  currentColor === c ? 'border-blue-500 scale-110' : 'border-transparent shadow-sm'
                )} 
                style={{ backgroundColor: c }} 
                aria-label={`Select color ${c}`}
              />
            ))}
            
            {customColors.map(c => (
              <div 
                key={c.id}
                className={clsx(
                  "relative w-8 h-8 rounded-full overflow-hidden border-2 transition-transform", 
                  currentColor === c.id ? 'border-blue-500 scale-110' : 'border-stone-200 shadow-sm hover:scale-110'
                )}
              >
                <input 
                  type="color" 
                  value={c.value} 
                  onChange={e => {
                    const newColors = customColors.map(cc => cc.id === c.id ? { ...cc, value: e.target.value } : cc);
                    setCustomColors(newColors);
                  }} 
                  onClick={() => setCurrentColor(c.id)}
                  className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer" 
                  title="Custom color"
                />
              </div>
            ))}

            <button 
              onClick={() => {
                const newId = `custom-color-${Date.now()}`;
                setCustomColors([...customColors, { id: newId, value: '#cccccc' }]);
                setCurrentColor(newId);
              }}
              className="w-8 h-8 rounded-full border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 hover:text-stone-600 hover:border-stone-400 transition-colors"
              title="Add custom color"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}

      {mode === 'parts' && (
        <div className="space-y-4 overflow-y-auto pr-2 flex-1 min-h-0 custom-scrollbar">
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Available Blocks</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {allBlocks.map(b => (
                <div key={b.id} className="flex items-center bg-stone-50 rounded-md border border-stone-200 overflow-hidden">
                  <label className="flex items-center gap-1.5 text-sm text-stone-700 cursor-pointer px-2 py-1 hover:bg-stone-100 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={selectedBlocks.includes(b.id)} 
                      onChange={() => toggleBlock(b.id)}
                      className="rounded border-stone-300 text-blue-600 focus:ring-blue-500"
                    />
                    {b.name}
                  </label>
                  {b.isCustom && (
                    <button 
                      onClick={() => removeCustomBlock(b.id)}
                      className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors border-l border-stone-200"
                      title="Remove custom block"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-3 flex items-center gap-2 bg-stone-50 p-2 rounded-lg border border-stone-200">
              <div className="flex items-center gap-1 text-sm">
                <input type="number" min="1" max="10" value={customDim.x} onChange={e => setCustomDim(p => ({...p, x: Math.max(1, parseInt(e.target.value) || 1)}))} className="w-10 px-1 py-0.5 text-center border border-stone-300 rounded bg-white" />
                <span className="text-stone-400 text-xs">x</span>
                <input type="number" min="1" max="10" value={customDim.y} onChange={e => setCustomDim(p => ({...p, y: Math.max(1, parseInt(e.target.value) || 1)}))} className="w-10 px-1 py-0.5 text-center border border-stone-300 rounded bg-white" />
                <span className="text-stone-400 text-xs">x</span>
                <input type="number" min="1" max="10" value={customDim.z} onChange={e => setCustomDim(p => ({...p, z: Math.max(1, parseInt(e.target.value) || 1)}))} className="w-10 px-1 py-0.5 text-center border border-stone-300 rounded bg-white" />
              </div>
              <button 
                onClick={addCustomBlock}
                className="ml-auto flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-medium hover:bg-blue-100 transition-colors"
              >
                <Plus size={12} /> Add
              </button>
            </div>
          </div>
          
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Required Parts</label>
            <div className="flex flex-col gap-2 mt-2">
              {partsList.map((part, idx) => {
                const hexColor = resolveColor(part.colorId, customColors);
                const colorName = COLOR_NAMES[part.colorId] || hexColor;
                return (
                  <div key={idx} className="flex justify-between items-center bg-stone-50 p-2 rounded-lg border border-stone-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm shadow-sm border border-stone-200" style={{ backgroundColor: hexColor }} />
                      <span className="text-sm font-medium text-stone-700">{colorName} {part.size}</span>
                    </div>
                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-md">x{part.count}</span>
                  </div>
                );
              })}
              {partsList.length === 0 && (
                <div className="text-sm text-stone-500 italic">No parts needed.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {mode === 'saves' && (
        <div className="space-y-4 overflow-y-auto pr-2 flex-1 min-h-0 custom-scrollbar">
          <button
            onClick={saveProgress}
            className="w-full flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <Save size={16} /> Save Current Progress
          </button>
          <div className="space-y-4">
            {savedProgresses.length === 0 ? (
              <div className="text-sm text-stone-500 italic text-center py-4">No saved progress.</div>
            ) : (
              savedProgresses.map(progress => (
                <div key={progress.id} className="flex flex-col gap-2 bg-stone-50 p-3 rounded-lg border border-stone-200 shadow-sm">
                  <div className="w-full h-32 bg-white rounded border border-stone-200 overflow-hidden relative cursor-pointer" onClick={() => applyProgress(progress)}>
                    <Canvas>
                      <OrthographicCamera makeDefault position={[5, 5, 5]} zoom={10} />
                      <OrbitControls enableRotate={false} enablePan={false} enableZoom={false} />
                      <color attach="background" args={['#ffffff']} />
                      <ambientLight intensity={0.6} />
                      <directionalLight position={[10, 10, 10]} intensity={0.8} />
                      <directionalLight position={[-10, -10, -10]} intensity={0.3} />
                      
                      <Voxels
                        voxels={progress.voxels}
                        setVoxels={() => {}}
                        mode="cube"
                        currentColor="#000"
                        customColors={customColors}
                        interactive={false}
                      />
                    </Canvas>
                    <div className="absolute inset-0 hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                      <span className="bg-white/90 text-stone-800 text-xs font-bold px-2 py-1 rounded shadow-sm">Click to Load</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    {editingProgressId === progress.id ? (
                      <input
                        type="text"
                        value={editingProgressName}
                        onChange={(e) => setEditingProgressName(e.target.value)}
                        onBlur={() => saveProgressName(progress.id)}
                        onKeyDown={(e) => e.key === 'Enter' && saveProgressName(progress.id)}
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
                        <Edit2 size={12} className="text-stone-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
                      </div>
                    )}
                    <span className="text-xs text-stone-500 whitespace-nowrap flex-shrink-0">{progress.voxels.length} blocks</span>
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
      )}

      <div className="h-px bg-stone-200 w-full flex-shrink-0" />

      <div className="flex gap-2 flex-shrink-0">
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
      
      <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs leading-relaxed flex-shrink-0">
        {mode === 'cube' ? (
          <>
            <span className="font-semibold">Left Click:</span> Add block<br/>
            <span className="font-semibold">Right/Shift Click:</span> Remove block<br/>
            <span className="font-semibold">Drag:</span> Rotate camera
          </>
        ) : mode === 'color' ? (
          <>
            <span className="font-semibold">Left Click:</span> Paint block<br/>
            <span className="font-semibold">Drag:</span> Rotate camera
          </>
        ) : (
          <>
            <span className="font-semibold">Parts List:</span> Shows the optimized blocks needed to build this model.<br/>
            <span className="font-semibold">Drag:</span> Rotate camera
          </>
        )}
      </div>
    </motion.div>
  );
}
