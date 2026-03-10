import { BlockDef, Voxel } from './types';

export const LOCAL_STORAGE_KEY = 'voxel_editor_state';

export const initialVoxels: Voxel[] = [
  { id: '1', position: [0, 0, 0], color: '#ffffff' }
];

export const COLORS = [
  '#ffffff', '#ff4444', '#ffbb33', '#00C851', '#33b5e5', '#2BBBAD', '#4285F4', '#aa66cc', '#212121'
];

export const COLOR_NAMES: Record<string, string> = {
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

export const STANDARD_BLOCKS: BlockDef[] = [
  { id: '2x2x2', dims: [2, 2, 2], name: '2x2x2' },
  { id: '2x2x1', dims: [2, 2, 1], name: '2x2x1' },
  { id: '2x1x1', dims: [2, 1, 1], name: '2x1x1' },
  { id: '1x1x1', dims: [1, 1, 1], name: '1x1x1' },
];
