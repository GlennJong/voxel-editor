/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { BlockDef, Voxel, CustomColor, SavedProgress, VoxelMode } from './types';
import { STANDARD_BLOCKS, initialVoxels, LOCAL_STORAGE_KEY } from './constants';
import { calculateParts, exportToOBJ, exportPartsList } from './utils';
import { useHistory } from './hooks/useHistory';
import Voxels from './components/Voxels';
import PreviewCanvas from './components/PreviewCanvas';
import Toolbar from './components/Toolbar';

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

export default function App() {
  const { state: voxels, set: setVoxels, undo, redo, reset, canUndo, canRedo } = useHistory<Voxel[]>(getInitialVoxels);
  const [mode, setMode] = useState<VoxelMode>('cube');
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

      <Toolbar
        mode={mode}
        setMode={setMode}
        currentColor={currentColor}
        setCurrentColor={setCurrentColor}
        customColors={customColors}
        setCustomColors={setCustomColors}
        allBlocks={allBlocks}
        selectedBlocks={selectedBlocks}
        toggleBlock={toggleBlock}
        removeCustomBlock={removeCustomBlock}
        customDim={customDim}
        setCustomDim={setCustomDim}
        addCustomBlock={addCustomBlock}
        partsList={partsList}
        savedProgresses={savedProgresses}
        saveProgress={saveProgress}
        applyProgress={applyProgress}
        removeProgress={removeProgress}
        editingProgressId={editingProgressId}
        setEditingProgressId={setEditingProgressId}
        editingProgressName={editingProgressName}
        setEditingProgressName={setEditingProgressName}
        saveProgressName={saveProgressName}
        undo={undo}
        redo={redo}
        reset={reset}
        exportData={exportData}
        canUndo={canUndo}
        canRedo={canRedo}
      />

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
