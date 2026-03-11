import React, { useState, useCallback } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { Voxel, CustomColor, VoxelMode } from '../types';
import { resolveColor } from '../utils';

const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const edgesGeo = new THREE.EdgesGeometry(boxGeo, 15);

type VoxelsProps = {
  voxels: Voxel[];
  setVoxels: (v: Voxel[]) => void;
  mode: VoxelMode;
  currentColor: string;
  customColors: CustomColor[];
  interactive?: boolean;
};

export default function Voxels({
  voxels,
  setVoxels,
  mode,
  currentColor,
  customColors,
  interactive = true,
}: VoxelsProps) {
  const [hovered, setHovered] = useState<{
    position: [number, number, number];
    normal: [number, number, number];
    id: string;
  } | null>(null);

  const onPointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.intersections.length > 0) {
      // Find the first intersection that is a voxel
      const intersect = e.intersections.find((i) => i.object.userData.id);
      if (intersect) {
        const object = intersect.object;
        const normal = intersect.face?.normal;
        const id = object.userData.id;
        if (normal && id) {
          const pos = [object.position.x, object.position.y, object.position.z];
          const norm = [normal.x, normal.y, normal.z];

          setHovered((prev) => {
            if (
              prev &&
              prev.id === id &&
              prev.normal[0] === norm[0] &&
              prev.normal[1] === norm[1] &&
              prev.normal[2] === norm[2]
            ) {
              return prev;
            }
            return {
              position: pos as [number, number, number],
              normal: norm as [number, number, number],
              id,
            };
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

  const onClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (!hovered) return;

      if (mode === 'cube') {
        if (e.shiftKey || e.button === 2) {
          // Remove voxel (Shift+Click or Right Click)
          if (voxels.length > 1) {
            setVoxels(voxels.filter((v) => v.id !== hovered.id));
            setHovered(null);
          }
        } else {
          // Add voxel
          const newPos = [
            hovered.position[0] + hovered.normal[0],
            hovered.position[1] + hovered.normal[1],
            hovered.position[2] + hovered.normal[2],
          ] as [number, number, number];

          const exists = voxels.some(
            (v) =>
              v.position[0] === newPos[0] &&
              v.position[1] === newPos[1] &&
              v.position[2] === newPos[2],
          );
          if (!exists) {
            setVoxels([
              ...voxels,
              {
                id: Math.random().toString(36).slice(2),
                position: newPos,
                color: currentColor,
              },
            ]);
          }
        }
      } else if (mode === 'color') {
        // Change color
        const newVoxels = voxels.map((v) =>
          v.id === hovered.id ? { ...v, color: currentColor } : v,
        );
        setVoxels(newVoxels);
      }
    },
    [hovered, mode, voxels, currentColor, setVoxels],
  );

  const onContextMenu = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (!hovered) return;
      if (mode === 'cube') {
        if (voxels.length > 1) {
          setVoxels(voxels.filter((v) => v.id !== hovered.id));
          setHovered(null);
        }
      }
    },
    [hovered, mode, voxels, setVoxels],
  );

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
            hovered.position[2] + hovered.normal[2],
          ]}
          raycast={() => null}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color={resolveColor(currentColor, customColors)}
            opacity={0.5}
            transparent
            depthWrite={false}
          />
          <lineSegments geometry={edgesGeo}>
            <lineBasicMaterial color="#000" opacity={0.2} transparent />
          </lineSegments>
        </mesh>
      )}
      {interactive && mode === 'color' && hovered && (
        <mesh position={hovered.position} raycast={() => null}>
          <boxGeometry args={[1.05, 1.05, 1.05]} />
          <meshBasicMaterial
            color={resolveColor(currentColor, customColors)}
            opacity={0.3}
            transparent
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
