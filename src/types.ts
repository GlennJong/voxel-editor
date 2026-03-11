export type Voxel = {
  id: string;
  position: [number, number, number];
  color: string;
};

export type CustomColor = {
  id: string;
  value: string;
};

export type SavedProgress = {
  id: string;
  name: string;
  timestamp: number;
  voxels: Voxel[];
};

export type BlockDef = {
  id: string;
  dims: [number, number, number];
  name: string;
  isCustom?: boolean;
};

export type VoxelMode = 'cube' | 'color' | 'parts' | 'saves' | 'preview';
