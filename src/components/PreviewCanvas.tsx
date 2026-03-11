import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { CustomColor, Voxel } from '../types';
import Voxels from './Voxels';

type PreviewCanvasProps = {
  voxels: Voxel[];
  position: [number, number, number];
  title: string;
  zoom: number;
  customColors: CustomColor[];
};

export default function PreviewCanvas({
  voxels,
  position,
  title,
  zoom,
  customColors,
}: PreviewCanvasProps) {
  return (
    <div className="w-32 h-32 bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full bg-stone-100/90 backdrop-blur text-[10px] font-bold text-stone-600 text-center py-1 z-10 border-b border-stone-200">
        {title}
      </div>
      <div className="w-full h-full">
        <Canvas flat>
          <OrthographicCamera makeDefault position={position} zoom={zoom} />
          <OrbitControls
            enableRotate={false}
            enablePan={true}
            enableZoom={false}
          />
          <color attach="background" args={['#ffffff']} />
          <ambientLight intensity={1.0} />
          <directionalLight position={[10, 10, 10]} intensity={0.6} />
          <directionalLight position={[-10, -10, -10]} intensity={0.4} />

          <Voxels
            voxels={voxels}
            setVoxels={() => { }}
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
