import { BlockDef, CustomColor, Voxel } from './types';
import { COLOR_NAMES } from './constants';

export function resolveColor(colorOrId: string, customColors: CustomColor[]) {
  if (colorOrId.startsWith('#')) return colorOrId;
  const custom = customColors.find((c) => c.id === colorOrId);
  return custom ? custom.value : '#ffffff';
}

export function getOrientations(dims: [number, number, number]) {
  const set = new Set<string>();
  const result: [number, number, number][] = [];
  const [x, y, z] = dims;
  const perms = [
    [x, y, z],
    [x, z, y],
    [y, x, z],
    [y, z, x],
    [z, x, y],
    [z, y, x],
  ];
  for (const p of perms) {
    const key = p.join(',');
    if (!set.has(key)) {
      set.add(key);
      result.push(p as [number, number, number]);
    }
  }
  return result;
}

export function calculateParts(
  voxels: Voxel[],
  allowedBlockIds: string[],
  allBlocks: BlockDef[],
) {
  const activeBlocks = allBlocks
    .filter((b) => allowedBlockIds.includes(b.id))
    .sort(
      (a, b) =>
        b.dims[0] * b.dims[1] * b.dims[2] - a.dims[0] * a.dims[1] * a.dims[2],
    );

  const parts: Record<
    string,
    { colorId: string; size: string; count: number }
  > = {};

  const byColor: Record<string, Set<string>> = {};
  for (const v of voxels) {
    if (!byColor[v.color]) byColor[v.color] = new Set();
    byColor[v.color].add(`${v.position[0]},${v.position[1]},${v.position[2]}`);
  }

  for (const colorId in byColor) {
    const V = byColor[colorId];

    while (V.size > 0) {
      let placed = false;

      for (const block of activeBlocks) {
        const orientations = getOrientations(
          block.dims as [number, number, number],
        );

        for (const orientation of orientations) {
          for (const anchorStr of V) {
            const [ax, ay, az] = anchorStr.split(',').map(Number);
            const [dx, dy, dz] = orientation;

            let canPlace = true;
            for (let i = 0; i < dx; i++) {
              for (let j = 0; j < dy; j++) {
                for (let k = 0; k < dz; k++) {
                  if (!V.has(`${ax + i},${ay + j},${az + k}`)) {
                    canPlace = false;
                    break;
                  }
                }
                if (!canPlace) break;
              }
              if (!canPlace) break;
            }

            if (canPlace) {
              for (let i = 0; i < dx; i++) {
                for (let j = 0; j < dy; j++) {
                  for (let k = 0; k < dz; k++) {
                    V.delete(`${ax + i},${ay + j},${az + k}`);
                  }
                }
              }

              const key = `${colorId}-${block.name}`;
              if (!parts[key])
                parts[key] = { colorId, size: block.name, count: 0 };
              parts[key].count++;

              placed = true;
              break;
            }
          }
          if (placed) break;
        }
        if (placed) break;
      }

      if (!placed) {
        const anchorStr = Array.from(V)[0];
        V.delete(anchorStr);
        const key = `${colorId}-1x1x1`;
        if (!parts[key]) parts[key] = { colorId, size: '1x1x1', count: 0 };
        parts[key].count++;
      }
    }
  }

  return Object.values(parts).sort((a, b) => {
    if (a.colorId !== b.colorId) return a.colorId.localeCompare(b.colorId);
    return b.size.localeCompare(a.size);
  });
}

export function exportToOBJ(voxels: Voxel[]) {
  let obj = '# Voxel Editor Export\n';
  let vOffset = 1;

  for (const voxel of voxels) {
    const [x, y, z] = voxel.position;
    const s = 0.5;
    obj += `v ${x - s} ${y - s} ${z - s}\n`;
    obj += `v ${x + s} ${y - s} ${z - s}\n`;
    obj += `v ${x - s} ${y + s} ${z - s}\n`;
    obj += `v ${x + s} ${y + s} ${z - s}\n`;
    obj += `v ${x - s} ${y - s} ${z + s}\n`;
    obj += `v ${x + s} ${y - s} ${z + s}\n`;
    obj += `v ${x - s} ${y + s} ${z + s}\n`;
    obj += `v ${x + s} ${y + s} ${z + s}\n`;

    obj += `f ${vOffset} ${vOffset + 2} ${vOffset + 3} ${vOffset + 1}\n`;
    obj += `f ${vOffset + 4} ${vOffset + 5} ${vOffset + 7} ${vOffset + 6}\n`;
    obj += `f ${vOffset} ${vOffset + 1} ${vOffset + 5} ${vOffset + 4}\n`;
    obj += `f ${vOffset + 2} ${vOffset + 6} ${vOffset + 7} ${vOffset + 3}\n`;
    obj += `f ${vOffset} ${vOffset + 4} ${vOffset + 6} ${vOffset + 2}\n`;
    obj += `f ${vOffset + 1} ${vOffset + 3} ${vOffset + 7} ${vOffset + 5}\n`;

    vOffset += 8;
  }

  return obj;
}

export function exportPartsList(
  partsList: { colorId: string; size: string; count: number }[],
  customColors: CustomColor[],
) {
  let csv = 'Color,Size,Count\n';
  for (const part of partsList) {
    const hexColor = resolveColor(part.colorId, customColors);
    const colorName = COLOR_NAMES[part.colorId] || hexColor;
    csv += `${colorName},${part.size},${part.count}\n`;
  }
  return csv;
}
