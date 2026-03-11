import React from 'react';
import { clsx } from 'clsx';
import { Plus, X } from 'lucide-react';
import { BlockDef, CustomColor } from '../../types';
import { COLOR_NAMES } from '../../constants';
import { resolveColor } from '../../utils';
import BlockSnapshot from './BlockSnapshot';

interface PartsListProps {
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
  customColors: CustomColor[];
}

export default function PartsList({
  allBlocks,
  selectedBlocks,
  toggleBlock,
  removeCustomBlock,
  customDim,
  setCustomDim,
  addCustomBlock,
  partsList,
  customColors,
}: PartsListProps) {
  return (
    <div className="space-y-4 overflow-y-auto pr-2 flex-1 min-h-0 custom-scrollbar">
      <div>
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
          Available Blocks
        </label>
        <div className="flex flex-wrap gap-2 mt-2">
          {allBlocks.map((b) => (
            <div
              key={b.id}
              className="flex items-center bg-stone-50 rounded-md border border-stone-200 overflow-hidden"
            >
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
            <input
              type="number"
              min="1"
              max="10"
              value={customDim.x}
              onChange={(e) =>
                setCustomDim((p) => ({
                  ...p,
                  x: Math.max(1, parseInt(e.target.value) || 1),
                }))
              }
              className="w-10 px-1 py-0.5 text-center border border-stone-300 rounded bg-white"
            />
            <span className="text-stone-400 text-xs">x</span>
            <input
              type="number"
              min="1"
              max="10"
              value={customDim.y}
              onChange={(e) =>
                setCustomDim((p) => ({
                  ...p,
                  y: Math.max(1, parseInt(e.target.value) || 1),
                }))
              }
              className="w-10 px-1 py-0.5 text-center border border-stone-300 rounded bg-white"
            />
            <span className="text-stone-400 text-xs">x</span>
            <input
              type="number"
              min="1"
              max="10"
              value={customDim.z}
              onChange={(e) =>
                setCustomDim((p) => ({
                  ...p,
                  z: Math.max(1, parseInt(e.target.value) || 1),
                }))
              }
              className="w-10 px-1 py-0.5 text-center border border-stone-300 rounded bg-white"
            />
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
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
          Required Parts
        </label>
        <div className="flex flex-col gap-2 mt-2">
          {partsList.map((part, idx) => {
            const hexColor = resolveColor(part.colorId, customColors);
            const colorName = COLOR_NAMES[part.colorId] || hexColor;
            return (
              <div
                key={idx}
                className="flex justify-between items-center bg-stone-50 p-2 rounded-lg border border-stone-200"
              >
                <div className="flex items-center gap-3">
                  <BlockSnapshot sizeStr={part.size} color={hexColor} />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-stone-700">
                      {colorName}
                    </span>
                    <span className="text-xs text-stone-500 font-mono">
                      {part.size}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
                  x{part.count}
                </span>
              </div>
            );
          })}
          {partsList.length === 0 && (
            <div className="text-sm text-stone-500 italic">
              No parts needed.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
