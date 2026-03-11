import React from 'react';
import { clsx } from 'clsx';
import { Plus, X } from 'lucide-react';
import { COLORS } from '../../constants';
import { CustomColor } from '../../types';

interface ColorPickerProps {
  currentColor: string;
  setCurrentColor: (color: string) => void;
  customColors: CustomColor[];
  setCustomColors: (colors: CustomColor[]) => void;
}

export default function ColorPicker({
  currentColor,
  setCurrentColor,
  customColors,
  setCustomColors,
}: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
        Color
      </label>
      <div className="flex gap-2 flex-wrap">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setCurrentColor(c)}
            className={clsx(
              'w-8 h-8 rounded-full border-2 transition-transform hover:scale-110',
              currentColor === c
                ? 'border-blue-500 scale-110'
                : 'border-transparent shadow-sm',
            )}
            style={{ backgroundColor: c }}
            aria-label={`Select color ${c}`}
          />
        ))}
      </div>
      <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
        Custom
      </label>
      <div className="flex gap-2 flex-wrap">
        {customColors.map((c) => (
          <div key={c.id} className="relative group w-8 h-8">
            <div
              className={clsx(
                'relative w-8 h-8 rounded-full overflow-hidden border-2 transition-transform',
                currentColor === c.id
                  ? 'border-blue-500 scale-110'
                  : 'border-stone-200 shadow-sm hover:scale-110',
              )}
            >
              <input
                type="color"
                value={c.value}
                onChange={(e) => {
                  const newColors = customColors.map((cc) =>
                    cc.id === c.id ? { ...cc, value: e.target.value } : cc,
                  );
                  setCustomColors(newColors);
                }}
                onClick={() => setCurrentColor(c.id)}
                className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
                title="Custom color"
              />
            </div>
            <button
              onClick={() => {
                const newColors = customColors.filter((cc) => cc.id !== c.id);
                setCustomColors(newColors);
                if (currentColor === c.id) {
                  setCurrentColor(COLORS[0]);
                }
              }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md border border-stone-200 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-stone-50 z-10"
              title="Remove color"
            >
              <X size={12} className="text-stone-500" />
            </button>
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
  );
}
