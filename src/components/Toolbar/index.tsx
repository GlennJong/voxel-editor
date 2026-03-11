import React from 'react';
import { motion, useDragControls } from 'motion/react';
import {
  Voxel,
  CustomColor,
  BlockDef,
  SavedProgress,
  VoxelMode,
} from '../../types';
import Header from './Header';
import ModeSelector from './ModeSelector';
import ColorPicker from './ColorPicker';
import PartsList from './PartsList';
import SavesManager from './SavesManager';
import PreviewSettings, { PreviewState } from './PreviewSettings';
import ActionButtons from './ActionButtons';
import KeyboardShortcuts from './KeyboardShortcuts';

export type ToolbarProps = {
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
  customDim: { x: number; y: number; z: number };
  setCustomDim: React.Dispatch<
    React.SetStateAction<{ x: number; y: number; z: number }>
  >;
  addCustomBlock: () => void;
  partsList: { colorId: string; size: string; count: number }[];
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
  previewState: PreviewState;
  setPreviewState: React.Dispatch<React.SetStateAction<PreviewState>>;
};

export default function Toolbar({
  mode,
  setMode,
  currentColor,
  setCurrentColor,
  customColors,
  setCustomColors,
  allBlocks,
  selectedBlocks,
  toggleBlock,
  removeCustomBlock,
  customDim,
  setCustomDim,
  addCustomBlock,
  partsList,
  savedProgresses,
  saveProgress,
  applyProgress,
  removeProgress,
  editingProgressId,
  setEditingProgressId,
  editingProgressName,
  setEditingProgressName,
  saveProgressName,
  undo,
  redo,
  reset,
  exportData,
  canUndo,
  canRedo,
  previewState,
  setPreviewState,
}: ToolbarProps) {
  const dragControls = useDragControls();

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      className="absolute top-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-stone-200 flex flex-col gap-4 w-72 max-h-[90vh] overflow-hidden resize min-w-70 max-w-125"
      style={{ touchAction: 'none' }}
    >
      <Header dragControls={dragControls} />

      <ModeSelector mode={mode} setMode={setMode} />

      {(mode === 'cube' || mode === 'color') && (
        <ColorPicker
          currentColor={currentColor}
          setCurrentColor={setCurrentColor}
          customColors={customColors}
          setCustomColors={setCustomColors}
        />
      )}

      {mode === 'parts' && (
        <PartsList
          allBlocks={allBlocks}
          selectedBlocks={selectedBlocks}
          toggleBlock={toggleBlock}
          removeCustomBlock={removeCustomBlock}
          customDim={customDim}
          setCustomDim={setCustomDim}
          addCustomBlock={addCustomBlock}
          partsList={partsList}
          customColors={customColors}
        />
      )}

      {mode === 'saves' && (
        <SavesManager
          savedProgresses={savedProgresses}
          saveProgress={saveProgress}
          applyProgress={applyProgress}
          removeProgress={removeProgress}
          editingProgressId={editingProgressId}
          setEditingProgressId={setEditingProgressId}
          editingProgressName={editingProgressName}
          setEditingProgressName={setEditingProgressName}
          saveProgressName={saveProgressName}
          customColors={customColors}
        />
      )}

      {mode === 'preview' && (
        <PreviewSettings
          previewState={previewState}
          setPreviewState={setPreviewState}
        />
      )}

      <div className="h-px bg-stone-200 w-full shrink-0" />

      <ActionButtons
        undo={undo}
        redo={redo}
        reset={reset}
        exportData={exportData}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <KeyboardShortcuts mode={mode} />
    </motion.div>
  );
}
