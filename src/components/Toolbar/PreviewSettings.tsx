import React from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';

export type PreviewState = {
  right: boolean;
  left: boolean;
  top: boolean;
  bottom: boolean;
  front: boolean;
  back: boolean;
};

interface PreviewSettingsProps {
  previewState: PreviewState;
  setPreviewState: React.Dispatch<React.SetStateAction<PreviewState>>;
}

export default function PreviewSettings({
  previewState,
  setPreviewState,
}: PreviewSettingsProps) {
  const toggle = (key: keyof PreviewState) => {
    setPreviewState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const labels: Record<keyof PreviewState, string> = {
    right: 'Right (X+)',
    left: 'Left (X-)',
    top: 'Top (Y+)',
    bottom: 'Bottom (Y-)',
    front: 'Front (Z+)',
    back: 'Back (Z-)',
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
        Active Previews
      </label>
      <div className="flex flex-col gap-2 bg-stone-50 p-2 rounded-lg border border-stone-200">
        {(Object.keys(previewState) as Array<keyof PreviewState>).map((key) => (
          <div
            key={key}
            className="flex items-center justify-between cursor-pointer hover:bg-stone-100 p-1 rounded transition-colors"
            onClick={() => toggle(key)}
          >
            <span className="text-sm font-medium text-stone-700">
              {labels[key]}
            </span>
            <button
              className={`transition-colors ${previewState[key] ? 'text-blue-600' : 'text-stone-300'
                }`}
            >
              {previewState[key] ? (
                <ToggleRight size={24} />
              ) : (
                <ToggleLeft size={24} />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
