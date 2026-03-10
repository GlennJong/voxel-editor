/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Undo, Redo, RotateCcw, Box, Palette, List, Plus, X, Download, Save, Edit2, GripHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import * as THREE from 'three';
import { motion, useDragControls } from 'motion/react';

type Voxel = {
  id: string;
  position: [number, number, number];
  color: string;
};

type CustomColor = {
  id: string;
  value: string;
};

function resolveColor(colorOrId: string, customColors: CustomColor[]) {
  if (colorOrId.startsWith('#')) return colorOrId;
  const custom = customColors.find(c => c.id === colorOrId);
  return custom ? custom.value : '#ffffff';
}

const initialVoxels: Voxel[] = [
  { id: '1', position: [0, 0, 0], color: '#ffffff' }
];

type SavedProgress = {
  id: string;
  name: string;
  timestamp: number;
  voxels: Voxel[];
};

const LOCAL_STORAGE_KEY = 'voxel_editor_state';

function getInitialVoxels(): Voxel[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load from local storage', e);
  }
  return initialVoxels;
}

function useHistory<T>(initialState: T | (() => T)) {
  const [history, setHistory] = useState<T[]>(() => {
    const init = typeof initialState === 'function' ? (initialState as () => T)() : initialState;
    return [init];
  });
  const [index, setIndex] = useState(0);

  const state = history[index];

  const set = useCallback((newState: T) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, index + 1);
      newHistory.push(newState);
      return newHistory;
    });
    setIndex(prev => prev + 1);
  }, [index]);

  const undo = useCallback(() => {
    setIndex(prev => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setIndex(prev => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  const reset = useCallback((newState: T) => {
    setHistory([newState]);
    setIndex(0);
  }, []);

  return { state, set, undo, redo, reset, canUndo: index > 0, canRedo: index < history.length - 1 };
}

const COLORS = [
  '#ffffff', '#ff4444', '#ffbb33', '#00C851', '#33b5e5', '#2BBBAD', '#4285F4', '#aa66cc', '#212121'
];

const COLOR_NAMES: Record<string, string> = {
  '#ffffff': 'White',
  '#ff4444': 'Red',
  '#ffbb33': 'Orange',
  '#00C851': 'Green',
  '#33b5e5': 'Light Blue',
  '#2BBBAD': 'Cyan',
  '#4285F4': 'Blue',
  '#aa66cc': 'Purple',
  '#212121': 'Black'
};

type BlockDef = { id: string; dims: [number, number, number]; name: string; isCustom?: boolean };

const STANDARD_BLOCKS: BlockDef[] = [
  { id: '2x2x2', dims: [2, 2, 2], name: '2x2x2' },
  { id: '2x2x1', dims: [2, 2, 1], name: '2x2x1' },
  { id: '2x1x1', dims: [2, 1, 1], name: '2x1x1' },
  { id: '1x1x1', dims: [1, 1, 1], name: '1x1x1' },
];

const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const edgesGeo = new THREE.EdgesGeometry(boxGeo, 15);

function Voxels({ 
  voxels, 
  setVoxels, 
  mode, 
  currentColor,
  customColors,
  interactive = true
}: { 
  voxels: Voxel[], 
  setVoxels: (v: Voxel[]) => void, 
  mode: 'cube' | 'color' | 'parts' | 'saves', 
  currentColor: string,
  customColors: CustomColor[],
  interactive?: boolean
}) {
  const [hovered, setHovered] = useState<{ position: [number, number, number], normal: [number, number, number], id: string } | null>(null);

  const onPointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.intersections.length > 0) {
      // Find the first intersection that is a voxel
      const intersect = e.intersections.find(i => i.object.userData.id);
      if (intersect) {
        const object = intersect.object;
        const normal = intersect.face?.normal;
        const id = object.userData.id;
        if (normal && id) {
          const pos = [object.position.x, object.position.y, object.position.z];
          const norm = [normal.x, normal.y, normal.z];
          
          setHovered(prev => {
            if (prev && prev.id === id && prev.normal[0] === norm[0] && prev.normal[1] === norm[1] && prev.normal[2] === norm[2]) {
              return prev;
            }
            return { position: pos as [number, number, number], normal: norm as [number, number, number], id };
          });
          return;
        }
      }
    }
    setHovered(null);
  }, []);

  const onPointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(null);
  }, []);

  const onClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!hovered) return;

    if (mode === 'cube') {
      if (e.shiftKey || e.button === 2) {
        // Remove voxel (Shift+Click or Right Click)
        if (voxels.length > 1) {
          setVoxels(voxels.filter(v => v.id !== hovered.id));
          setHovered(null);
        }
      } else {
        // Add voxel
        const newPos = [
          hovered.position[0] + hovered.normal[0],
          hovered.position[1] + hovered.normal[1],
          hovered.position[2] + hovered.normal[2]
        ] as [number, number, number];
        
        const exists = voxels.some(v => v.position[0] === newPos[0] && v.position[1] === newPos[1] && v.position[2] === newPos[2]);
        if (!exists) {
          setVoxels([...voxels, { id: Math.random().toString(36).slice(2), position: newPos, color: currentColor }]);
        }
      }
    } else if (mode === 'color') {
      // Change color
      const newVoxels = voxels.map(v => v.id === hovered.id ? { ...v, color: currentColor } : v);
      setVoxels(newVoxels);
    }
  }, [hovered, mode, voxels, currentColor, setVoxels]);

  const onContextMenu = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!hovered) return;
    if (mode === 'cube') {
      if (voxels.length > 1) {
        setVoxels(voxels.filter(v => v.id !== hovered.id));
        setHovered(null);
      }
    }
  }, [hovered, mode, voxels, setVoxels]);

  return (
    <group
      onPointerMove={interactive ? onPointerMove : undefined}
      onPointerOut={interactive ? onPointerOut : undefined}
      onClick={interactive ? onClick : undefined}
      onContextMenu={interactive ? onContextMenu : undefined}
    >
      {voxels.map((v) => (
        <mesh key={v.id} position={v.position} userData={{ id: v.id }}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={resolveColor(v.color, customColors)} />
          <lineSegments geometry={edgesGeo}>
            <lineBasicMaterial color="#000" opacity={0.2} transparent />
          </lineSegments>
        </mesh>
      ))}
      {interactive && mode === 'cube' && hovered && (
        <mesh 
          position={[
            hovered.position[0] + hovered.normal[0],
            hovered.position[1] + hovered.normal[1],
            hovered.position[2] + hovered.normal[2]
          ]}
          raycast={() => null}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={resolveColor(currentColor, customColors)} opacity={0.5} transparent depthWrite={false} />
          <lineSegments geometry={edgesGeo}>
            <lineBasicMaterial color="#000" opacity={0.2} transparent />
          </lineSegments>
        </mesh>
      )}
      {interactive && mode === 'color' && hovered && (
        <mesh 
          position={hovered.position}
          raycast={() => null}
        >
          <boxGeometry args={[1.05, 1.05, 1.05]} />
          <meshBasicMaterial color={resolveColor(currentColor, customColors)} opacity={0.3} transparent depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

function PreviewCanvas({ voxels, position, title, zoom, customColors }: { voxels: Voxel[], position: [number, number, number], title: string, zoom: number, customColors: CustomColor[] }) {
  return (
    <div className="w-32 h-32 bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full bg-stone-100/90 backdrop-blur text-[10px] font-bold text-stone-600 text-center py-1 z-10 border-b border-stone-200">
        {title}
      </div>
      <div className="w-full h-full">
        <Canvas>
          <OrthographicCamera makeDefault position={position} zoom={zoom} />
          <OrbitControls enableRotate={false} enablePan={true} enableZoom={false} />
          <color attach="background" args={['#ffffff']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 10]} intensity={0.8} />
          <directionalLight position={[-10, -10, -10]} intensity={0.3} />
          
          <Voxels
            voxels={voxels}
            setVoxels={() => {}}
            mode="cube"
            currentColor="#000"
            customColors={customColors}
            interactive={false}
          />
        </Canvas>
      </div>
    </div>
  );
}

function getOrientations(dims: [number, number, number]) {
  const set = new Set<string>();
  const result: [number, number, number][] = [];
  const [x, y, z] = dims;
  const perms = [
    [x, y, z], [x, z, y],
    [y, x, z], [y, z, x],
    [z, x, y], [z, y, x]
  ];
  for (const p of perms) {
    const key = p.join(',');
    if (!set.has(key)) {
      set.add(key);
      result.push(p as [number, number, number]);
    }
  }
  return result;
}

function calculateParts(voxels: Voxel[], allowedBlockIds: string[], allBlocks: BlockDef[]) {
  const activeBlocks = allBlocks.filter(b => allowedBlockIds.includes(b.id))
                                      .sort((a, b) => (b.dims[0]*b.dims[1]*b.dims[2]) - (a.dims[0]*a.dims[1]*a.dims[2]));

  const parts: Record<string, { colorId: string, size: string, count: number }> = {};

  const byColor: Record<string, Set<string>> = {};
  for (const v of voxels) {
    if (!byColor[v.color]) byColor[v.color] = new Set();
    byColor[v.color].add(`${v.position[0]},${v.position[1]},${v.position[2]}`);
  }

  for (const colorId in byColor) {
    const V = byColor[colorId];
    
    while (V.size > 0) {
      let placed = false;
      
      for (const block of activeBlocks) {
        const orientations = getOrientations(block.dims as [number, number, number]);
        
        for (const orientation of orientations) {
          for (const anchorStr of V) {
            const [ax, ay, az] = anchorStr.split(',').map(Number);
            const [dx, dy, dz] = orientation;
            
            let canPlace = true;
            for (let i = 0; i < dx; i++) {
              for (let j = 0; j < dy; j++) {
                for (let k = 0; k < dz; k++) {
                  if (!V.has(`${ax + i},${ay + j},${az + k}`)) {
                    canPlace = false;
                    break;
                  }
                }
                if (!canPlace) break;
              }
              if (!canPlace) break;
            }
            
            if (canPlace) {
              for (let i = 0; i < dx; i++) {
                for (let j = 0; j < dy; j++) {
                  for (let k = 0; k < dz; k++) {
                    V.delete(`${ax + i},${ay + j},${az + k}`);
                  }
                }
              }
              
              const key = `${colorId}-${block.name}`;
              if (!parts[key]) parts[key] = { colorId, size: block.name, count: 0 };
              parts[key].count++;
              
              placed = true;
              break;
            }
          }
          if (placed) break;
        }
        if (placed) break;
      }
      
      if (!placed) {
        const anchorStr = Array.from(V)[0];
        V.delete(anchorStr);
        const key = `${colorId}-1x1x1`;
        if (!parts[key]) parts[key] = { colorId, size: '1x1x1', count: 0 };
        parts[key].count++;
      }
    }
  }
  
  return Object.values(parts).sort((a, b) => {
    if (a.colorId !== b.colorId) return a.colorId.localeCompare(b.colorId);
    return b.size.localeCompare(a.size);
  });
}

function exportToOBJ(voxels: Voxel[]) {
  let obj = "# Voxel Editor Export\n";
  let vOffset = 1;
  
  for (const voxel of voxels) {
    const [x, y, z] = voxel.position;
    const s = 0.5;
    obj += `v ${x-s} ${y-s} ${z-s}\n`;
    obj += `v ${x+s} ${y-s} ${z-s}\n`;
    obj += `v ${x-s} ${y+s} ${z-s}\n`;
    obj += `v ${x+s} ${y+s} ${z-s}\n`;
    obj += `v ${x-s} ${y-s} ${z+s}\n`;
    obj += `v ${x+s} ${y-s} ${z+s}\n`;
    obj += `v ${x-s} ${y+s} ${z+s}\n`;
    obj += `v ${x+s} ${y+s} ${z+s}\n`;

    obj += `f ${vOffset} ${vOffset+2} ${vOffset+3} ${vOffset+1}\n`;
    obj += `f ${vOffset+4} ${vOffset+5} ${vOffset+7} ${vOffset+6}\n`;
    obj += `f ${vOffset} ${vOffset+1} ${vOffset+5} ${vOffset+4}\n`;
    obj += `f ${vOffset+2} ${vOffset+6} ${vOffset+7} ${vOffset+3}\n`;
    obj += `f ${vOffset} ${vOffset+4} ${vOffset+6} ${vOffset+2}\n`;
    obj += `f ${vOffset+1} ${vOffset+3} ${vOffset+7} ${vOffset+5}\n`;
    
    vOffset += 8;
  }
  
  return obj;
}

function exportPartsList(partsList: { colorId: string, size: string, count: number }[], customColors: CustomColor[]) {
  let csv = "Color,Size,Count\n";
  for (const part of partsList) {
    const hexColor = resolveColor(part.colorId, customColors);
    const colorName = COLOR_NAMES[part.colorId] || hexColor;
    csv += `${colorName},${part.size},${part.count}\n`;
  }
  return csv;
}

export default function App() {
  const dragControls = useDragControls();
  const { state: voxels, set: setVoxels, undo, redo, reset, canUndo, canRedo } = useHistory<Voxel[]>(getInitialVoxels);
  const [mode, setMode] = useState<'cube' | 'color' | 'parts' | 'saves'>('cube');
  const [currentColor, setCurrentColor] = useState<string>('#4285F4');
  const [zoom, setZoom] = useState(15);
  const [customBlocks, setCustomBlocks] = useState<BlockDef[]>([]);
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>(['1x1x1', '2x1x1', '2x2x1']);
  const [customDim, setCustomDim] = useState({ x: 3, y: 1, z: 1 });

  const [customColors, setCustomColors] = useState<CustomColor[]>(() => {
    try {
      const saved = localStorage.getItem('voxel_editor_custom_colors');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [savedProgresses, setSavedProgresses] = useState<SavedProgress[]>(() => {
    try {
      const saved = localStorage.getItem('voxel_editor_saved_progresses');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [editingProgressId, setEditingProgressId] = useState<string | null>(null);
  const [editingProgressName, setEditingProgressName] = useState('');

  useEffect(() => {
    localStorage.setItem('voxel_editor_custom_colors', JSON.stringify(customColors));
  }, [customColors]);

  useEffect(() => {
    localStorage.setItem('voxel_editor_saved_progresses', JSON.stringify(savedProgresses));
  }, [savedProgresses]);

  const saveProgress = () => {
    const newProgress: SavedProgress = {
      id: `save-${Date.now()}`,
      name: `Save ${new Date().toLocaleString()}`,
      timestamp: Date.now(),
      voxels: [...voxels]
    };
    setSavedProgresses(prev => [newProgress, ...prev]);
  };

  const applyProgress = (progress: SavedProgress) => {
    reset(progress.voxels);
  };

  const removeProgress = (id: string) => {
    setSavedProgresses(prev => prev.filter(p => p.id !== id));
  };

  const saveProgressName = (id: string) => {
    if (editingProgressName.trim()) {
      setSavedProgresses(prev => prev.map(p => p.id === id ? { ...p, name: editingProgressName.trim() } : p));
    }
    setEditingProgressId(null);
  };

  const allBlocks = useMemo(() => [...STANDARD_BLOCKS, ...customBlocks], [customBlocks]);

  const toggleBlock = (id: string) => {
    setSelectedBlocks(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const addCustomBlock = () => {
    const dims = [customDim.x, customDim.y, customDim.z].sort((a, b) => b - a) as [number, number, number];
    const name = `${dims[0]}x${dims[1]}x${dims[2]}`;
    const id = `custom-${name}-${Date.now()}`;
    
    // Prevent duplicates
    if (allBlocks.some(b => b.name === name)) return;

    setCustomBlocks(prev => [...prev, { id, dims, name, isCustom: true }]);
    setSelectedBlocks(prev => [...prev, id]);
  };

  const removeCustomBlock = (id: string) => {
    setCustomBlocks(prev => prev.filter(b => b.id !== id));
    setSelectedBlocks(prev => prev.filter(b => b !== id));
  };

  const partsList = useMemo(() => calculateParts(voxels, selectedBlocks, allBlocks), [voxels, selectedBlocks, allBlocks]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(voxels));
  }, [voxels]);

  const exportData = () => {
    const objData = exportToOBJ(voxels);
    const objBlob = new Blob([objData], { type: 'text/plain' });
    const objUrl = URL.createObjectURL(objBlob);
    const objLink = document.createElement('a');
    objLink.href = objUrl;
    objLink.download = 'model.obj';
    objLink.click();
    URL.revokeObjectURL(objUrl);

    const csvData = exportPartsList(partsList, customColors);
    const csvBlob = new Blob([csvData], { type: 'text/csv' });
    const csvUrl = URL.createObjectURL(csvBlob);
    const csvLink = document.createElement('a');
    csvLink.href = csvUrl;
    csvLink.download = 'parts.csv';
    csvLink.click();
    URL.revokeObjectURL(csvUrl);
  };

  return (
    <div 
      className="w-full h-screen bg-stone-100 relative overflow-hidden font-sans"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <color attach="background" args={['#f5f5f4']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={0.8} castShadow />
        <directionalLight position={[-10, -10, -10]} intensity={0.3} />
        <OrbitControls 
          makeDefault 
          minDistance={2} 
          maxDistance={50} 
          onChange={(e) => {
            if (e?.target) {
              setZoom(130 / e.target.getDistance());
            }
          }}
        />
        
        <Voxels
          voxels={voxels}
          setVoxels={setVoxels}
          mode={mode}
          currentColor={currentColor}
          customColors={customColors}
          interactive={mode === 'cube' || mode === 'color'}
        />
      </Canvas>

      {/* Toolbar */}
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

      {/* Previews */}
      <div className="absolute bottom-6 right-6 flex gap-4 pointer-events-none">
        <div className="pointer-events-auto">
          <PreviewCanvas voxels={voxels} position={[20, 0, 0]} title="X-AXIS (RIGHT)" zoom={zoom} customColors={customColors} />
        </div>
        <div className="pointer-events-auto">
          <PreviewCanvas voxels={voxels} position={[0, 20, 0]} title="Y-AXIS (TOP)" zoom={zoom} customColors={customColors} />
        </div>
        <div className="pointer-events-auto">
          <PreviewCanvas voxels={voxels} position={[0, 0, 20]} title="Z-AXIS (FRONT)" zoom={zoom} customColors={customColors} />
        </div>
      </div>
    </div>
  );
}
