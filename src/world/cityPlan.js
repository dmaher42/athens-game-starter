import * as THREE from 'three';
import { AGORA_CENTER_3D, HARBOR_CENTER_3D, HARBOR_SETBACKS, CITY_CENTER_ORIGIN, getCityGroundY } from './locations.js';
import { resolveBaseUrl, joinPath } from '../utils/baseUrl.js';
import { Prefabs, spawnBuilding } from './buildingSpawner.js';
import { buildTemple } from '../features/temples.js';
import { loadDistrictRules } from './districtRules.js';

/* PATCH: Harbor zone params */
export const HARBOR_ZONE = { bandWidth: 35, spacingScale: 0.7, densityBoost: 0.25 };

// Grid Constants
const MIN_X = -10, MAX_X = 10;
const MIN_Z = -10, MAX_Z = 20;
const BLOCK_SIZE = 48; // Increased from 40 for better district spacing (~20% increase)

export function inHarborBand(
  pos,
  shorelineCenter = { x: HARBOR_CENTER_3D.x, z: HARBOR_CENTER_3D.z }
) {
  if (!pos) return false;
  // Directional Logic: Harbor is East (+X)
  // Treat tiles east of the harbor center (minus a small setback) as harbor frontage.
  const harborStartX = shorelineCenter.x - HARBOR_ZONE.bandWidth;
  return pos.x >= harborStartX;
}

function createPavedStrip(width, length, color = 0x888888) {
  const geometry = new THREE.BoxGeometry(width, 0.1, length);
  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.8,
    metalness: 0.1
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  return mesh;
}

function generateCityGrid() {
  const cells = [];
  for (let gridX = MIN_X; gridX <= MAX_X; gridX++) {
    for (let gridZ = MIN_Z; gridZ <= MAX_Z; gridZ++) {
      const cell = {
        gridX,
        gridZ,
        // Use CITY_CENTER_ORIGIN as the base, then offset by grid position
        position: new THREE.Vector3(
          CITY_CENTER_ORIGIN.x + (gridX * BLOCK_SIZE),
          getCityGroundY(), // Use dynamic city ground height
          CITY_CENTER_ORIGIN.z + (gridZ * BLOCK_SIZE)
        ),
        type: 'building',
        district: 'residential'
      };

      const distance = Math.sqrt((gridX * BLOCK_SIZE) ** 2 + (gridZ * BLOCK_SIZE) ** 2);

      // District Logic (Directional + Radial)

      const worldX = cell.position.x;

      // Harbor: East side (High X)
      const harborThresholdX = HARBOR_CENTER_3D.x - BLOCK_SIZE * 1.5;
      if (worldX >= harborThresholdX) {
        cell.district = 'harbor';
      } else if (distance < 60) {
        cell.district = 'sacred';
      } else if (distance >= 60 && distance < 140) {
        cell.district = 'commercial';
      } else {
        cell.district = 'residential';
      }

      // Main Avenue: Runs East-West (Constant Z, varying X)
      // "Update the 'main avenue' rule so it runs from harbour (east) toward inland (west)."
      // Harbor is at +X. Inland is -X.
      // Avenue runs along the X-axis (Z ~= 0).
      // Grid normalized: Roads run N/S (varying Z) or E/W (varying X)
      if (Math.abs(gridZ) <= 1) {
        cell.type = 'road'; // Main E-W avenue
      } else if (gridX === 0 && cell.district !== 'sacred') {
        cell.type = 'road'; // Central N-S boulevard
      } else if (cell.district === 'sacred') {
          if (gridX === 0 && gridZ === 0) {
              cell.type = 'parthenon';
          } else {
              cell.type = 'building';
          }
      } else if (cell.district === 'commercial') {
          if (gridX % 3 === 0 || gridZ % 3 === 0) {
             cell.type = 'road';
          }
      } else {
          if (gridX % 3 === 0 || gridZ % 3 === 0) {
             cell.type = 'road';
          }
      }

      cells.push(cell);
    }
  }
  return cells;
}

export async function createCivicDistrict(scene, options = {}) {
  const group = new THREE.Group();
  group.name = 'CivicDistrict';
  scene.add(group);

  // Load district rules
  const districtRules = await loadDistrictRules();

  const centerOption = options.center ?? AGORA_CENTER_3D;
  const terrainSampler =
    options.heightSampler ??
    options.terrainSampler ??
    options.terrain?.userData?.getHeightAt;
  const surfaceOffset = options.surfaceOffset ?? 0.05;

  const center = centerOption instanceof THREE.Vector3
    ? centerOption.clone()
    : new THREE.Vector3(centerOption?.x ?? 0, centerOption?.y ?? 0, centerOption?.z ?? 0);

  let baseHeight = Number.isFinite(center.y) ? center.y : 0;
  if (typeof terrainSampler === 'function') {
    const sampled = terrainSampler(center.x, center.z);
    if (Number.isFinite(sampled)) {
      baseHeight = sampled;
    }
  }

  group.position.set(center.x, baseHeight, center.z);

  const sampleLocalHeight = (offsetX = 0, offsetZ = 0, fallback = 0) => {
    if (typeof terrainSampler === 'function') {
      const worldX = center.x + offsetX;
      const worldZ = center.z + offsetZ;
      const sampled = terrainSampler(worldX, worldZ);
      if (Number.isFinite(sampled)) {
        return sampled - baseHeight + surfaceOffset;
      }
    }
    return fallback + surfaceOffset;
  };

  const grid = generateCityGrid();

  group.userData.plan = {
    grid,
    minX: MIN_X,
    maxX: MAX_X,
    minZ: MIN_Z,
    maxZ: MAX_Z,
    blockSize: BLOCK_SIZE,
    center: center.clone()
  };

  // Pre-load textures for roads/plazas
  const tl = new THREE.TextureLoader();
  const baseUrl = typeof scene?.userData?.baseUrl === "string" ? scene.userData.baseUrl : "";
  let plazaMat;
  try {
      const baseMap = await tl.loadAsync(joinPath(baseUrl || "/", "textures/marble_base.jpg"));
      baseMap.wrapS = baseMap.wrapT = THREE.RepeatWrapping;
      baseMap.repeat.set(4, 4);
      baseMap.colorSpace = THREE.SRGBColorSpace;

      const normalMap = await tl.loadAsync(joinPath(baseUrl || "/", "textures/marble_normal-dx.jpg"));
      normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
      normalMap.repeat.set(4, 4);

      plazaMat = new THREE.MeshStandardMaterial({
          map: baseMap,
          normalMap: normalMap,
          roughness: 1,
          metalness: 0,
          polygonOffset: true,
          polygonOffsetFactor: -1,
          polygonOffsetUnits: -1
      });
  } catch (e) {
      console.warn("Failed to load plaza textures (marble fallback)", e);
  }

  for (const cell of grid) {
    const localX = cell.position.x;
    const localZ = cell.position.z;
    const localY = sampleLocalHeight(localX, localZ, 0);

    // Compute world-space position to respect harbor exclusions
    const worldX = center.x + localX;
    const worldZ = center.z + localZ;
    const isInSetback = HARBOR_SETBACKS?.some?.((r) => {
      return (
        worldX >= r.west && worldX <= r.east &&
        worldZ >= r.north && worldZ <= r.south
      );
    });
    if (isInSetback) {
      continue; // Skip placing any city element inside harbor/walkway setbacks
    }

    if (cell.type === 'road') {
      // Avenue is now East-West (gridZ approx 0)
      const isMainAvenue = Math.abs(cell.gridZ) <= 1;
      const roadMesh = createPavedStrip(BLOCK_SIZE, BLOCK_SIZE, isMainAvenue ? 0x887766 : 0x666666);
      roadMesh.position.set(localX, localY, localZ);
      group.add(roadMesh);
    } else if (cell.type === 'parthenon') {
      const temple = await buildTemple({
          width: 30,
          depth: 60,
          scale: 1.5,
          order: 'doric',
          materialPreset: 'marble'
      });
      temple.position.set(localX, localY, localZ);
      // Rotate if needed? Default is probably aligned to Z.
      group.add(temple);
    } else if (cell.type === 'plaza') {
      const plazaMesh = createPavedStrip(BLOCK_SIZE - 2, BLOCK_SIZE - 2, 0xaaaaaa);
      plazaMesh.position.set(localX, localY, localZ);
      if (plazaMat) plazaMesh.material = plazaMat;
      group.add(plazaMesh);
    } else if (cell.type === 'building') {
       // Deterministic RNG
       const seed = Math.abs(cell.gridX * 73856093 ^ cell.gridZ * 19349663);
       const rng = () => {
          let t = seed + Math.sin(seed * 12.9898) * 43758.5453;
          return t - Math.floor(t);
       };

       const buildingGroup = spawnBuilding({
         district: cell.district,
         rng: rng,
         districtRules
       });

       if (buildingGroup) {
           buildingGroup.position.set(localX, localY, localZ);
           // Random 90 degree rotation
           const rot = Math.floor(rng() * 4) * (Math.PI / 2);
           buildingGroup.rotation.y = rot;
           group.add(buildingGroup);
       }
    }
  }

  const walkingLoop = new THREE.CatmullRomCurve3([
      new THREE.Vector3(center.x + 10, baseHeight, center.z + 10),
      new THREE.Vector3(center.x - 10, baseHeight, center.z + 10),
      new THREE.Vector3(center.x - 10, baseHeight, center.z - 10),
      new THREE.Vector3(center.x + 10, baseHeight, center.z - 10)
  ], true);

  return {
    group,
    walkingLoop,
    plazaLength: 80, // Legacy support
    promenadeWidth: 14 // Legacy support
  };
}

export default createCivicDistrict;
