import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Edges, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';

interface BlockSnapshotProps {
  sizeStr: string;
  color: string;
}

export default function BlockSnapshot({ sizeStr, color }: BlockSnapshotProps) {
  const [x, y, z] = useMemo(() => {
    try {
      const parts = sizeStr.split('x').map((s) => parseFloat(s));
      if (parts.length === 3) return parts;
      return [1, 1, 1];
    } catch {
      return [1, 1, 1];
    }
  }, [sizeStr]);

  const maxDim = Math.max(x, y, z);
  const zoom = 20 / (maxDim * 0.6 + 1);

  return (
    <div className="w-12 h-12 bg-stone-100 rounded-md overflow-hidden border border-stone-200 shrink-0 relative">
      <Canvas frameloop="demand" flat>
        <ambientLight intensity={1.0} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />

        <OrthographicCamera
          makeDefault
          position={[10, 10, 10]}
          zoom={zoom * 2}
          near={-50}
          far={200}
          onUpdate={(c) => c.lookAt(0, 0, 0)}
        />

        <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[x, y, z]} />
          <meshStandardMaterial color={color} />
          <Edges color="black" threshold={15} scale={1.02} opacity={0.2} transparent />
        </mesh>
      </Canvas>
    </div>
  );
}

