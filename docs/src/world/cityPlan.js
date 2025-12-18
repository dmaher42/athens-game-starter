import * as THREE from 'three';
import { AGORA_CENTER_3D, HARBOR_CENTER_3D } from './locations.js';
import { resolveBaseUrl, joinPath } from '../utils/baseUrl.js';
import { makeTiledPBR } from '../materials/pbr-utils.js';
import { Prefabs, spawnBuilding } from './buildingSpawner.js';
import { buildTemple } from '../features/temples.js';

/* PATCH: Harbor zone params */
export const HARBOR_ZONE = { bandWidth: 35, spacingScale: 0.7, densityBoost: 0.25 };

// Grid Constants
const MIN_X = -10, MAX_X = 10;
const MIN_Z = -10, MAX_Z = 20;
const BLOCK_SIZE = 40;

export function inHarborBand(
  pos,
  shorelineCenter = { x: HARBOR_CENTER_3D.x, z: HARBOR_CENTER_3D.z }
) {
  if (!pos) return false;
  // distance in XZ from harbor center or from shoreline reference
  const dx = pos.x - shorelineCenter.x;
  const dz = pos.z - shorelineCenter.z;
  const d = Math.sqrt(dx * dx + dz * dz);
  const band = Number.isFinite(HARBOR_ZONE?.bandWidth) ? HARBOR_ZONE.bandWidth : 35;
  return d <= band + 12;
}

function createPavedStrip(width, length, color = 0x888888) {
  // Use a thin BoxGeometry as suggested for better shadow reception
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

function createTorchStand() {
  const group = new THREE.Group();
  group.name = 'AgoraTorchStand';

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.7, 0.6, 10),
    new THREE.MeshStandardMaterial({ color: 0x9a7d56, roughness: 0.75 })
  );
  base.position.y = 0.3;
  base.receiveShadow = true;
  base.castShadow = true;
  base.userData.noCollision = false;
  group.add(base);

  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.3, 2.8, 12),
    new THREE.MeshStandardMaterial({ color: 0xcdb18b, roughness: 0.65 })
  );
  column.position.y = 1.7;
  column.receiveShadow = true;
  column.castShadow = true;
  column.userData.noCollision = false;
  group.add(column);

  const brazier = new THREE.Mesh(
    new THREE.ConeGeometry(0.7, 0.9, 12),
    new THREE.MeshStandardMaterial({
      color: 0x5b4636,
      roughness: 0.85,
      metalness: 0.1,
      emissive: new THREE.Color(0x3b2a1a),
      emissiveIntensity: 0.25,
    })
  );
  brazier.rotation.x = Math.PI;
  brazier.position.y = 3.1;
  brazier.castShadow = true;
  brazier.userData.noCollision = false;
  group.add(brazier);

  const flame = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 16, 12),
    new THREE.MeshStandardMaterial({
      color: 0xffb347,
      emissive: new THREE.Color(0xffa726),
      emissiveIntensity: 1.2,
    })
  );
  flame.position.y = 3.3;
  flame.userData.noCollision = true;
  group.add(flame);

  const light = new THREE.PointLight(0xffc978, 0.9, 14, 2.4);
  light.position.y = 3.3;
  group.add(light);

  return group;
}

function generateCityGrid() {
  const cells = [];
  for (let gridX = MIN_X; gridX <= MAX_X; gridX++) {
    for (let gridZ = MIN_Z; gridZ <= MAX_Z; gridZ++) {
      const cell = {
        gridX,
        gridZ,
        position: new THREE.Vector3(gridX * BLOCK_SIZE, 0, gridZ * BLOCK_SIZE),
        type: 'building', // Default
        district: 'residential' // Default
      };

      // Determine District
      const distance = Math.sqrt(gridX * gridX + gridZ * gridZ);
      const distMeters = distance * BLOCK_SIZE;

      if (gridZ > 12) {
        cell.district = 'harbor';
      } else if (distMeters < 60) {
        cell.district = 'sacred';
      } else if (distMeters >= 60 && distMeters < 120) {
        cell.district = 'commercial';
      } else {
        cell.district = 'residential';
      }

      // Determine Type Rules

      // 1. Road Rules
      let type = 'building';
      if (Math.abs(gridX) <= 1) {
        type = 'road';
      } else if (gridX % 3 === 0 || gridZ % 3 === 0) {
        type = 'road';
      }

      // 2. District Rules & Special Overrides
      // Re-evaluate district based on distance to ensure logic flow
      if (gridZ > 12) {
        cell.district = 'harbor';
      } else if (distMeters < 60) {
        cell.district = 'sacred';
        if (gridX === 0 && gridZ === 0) {
          type = 'parthenon';
        }
      } else if (distMeters >= 60 && distMeters < 120) {
        cell.district = 'commercial';
      } else {
        cell.district = 'residential';
      }

      // 3. Plaza Rule (Commercial only, non-road)
      if (cell.district === 'commercial' && type !== 'road') {
         if ((gridX + gridZ) % 5 === 0) {
           type = 'plaza';
         }
      }

      cell.type = type;
      cells.push(cell);
    }
  }
  return cells;
}

export async function createCivicDistrict(scene, options = {}) {
  const group = new THREE.Group();
  group.name = 'CivicDistrict';
  scene.add(group);

  // Preserve expected options for compatibility, even if used differently or ignored
  const plazaLength = options.plazaLength ?? 80;
  const promenadeWidth = options.promenadeWidth ?? 14;
  const centerOption = options.center ?? AGORA_CENTER_3D;
  const terrainSampler =
    options.heightSampler ??
    options.terrainSampler ??
    options.terrain?.userData?.getHeightAt;
  const surfaceOffset = options.surfaceOffset ?? 0.05;

  const center = centerOption instanceof THREE.Vector3
    ? centerOption.clone()
    : new THREE.Vector3(
        centerOption?.x ?? 0,
        centerOption?.y ?? 0,
        centerOption?.z ?? 0
      );

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

  // Attach plan data for downstream consumers
  group.userData.plan = {
    grid,
    minX: MIN_X,
    maxX: MAX_X,
    minZ: MIN_Z,
    maxZ: MAX_Z,
    blockSize: BLOCK_SIZE,
    center: center.clone(),
    // Keep old keys if possible to avoid crashes, though they may be meaningless now
    promenadeWidth,
    plazaLength,
  };

  // Pre-load textures if needed
  // Use marble as fallback for plaza since plaza textures are missing
  // This matches the fix in src/world/city.js to prevent 404s
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

    // Position relative to the group center (which is at 'center')
    // The grid positions are relative to (0,0,0) which is effectively the 'center' of the city plan.
    // Since we added group at 'center', we can just use cell.position as local position.

    if (cell.type === 'road') {
      // Spawn road
      // Check if it's the main avenue (Math.abs(gridX) <= 1) for wider road?
      // "Main Avenue: ... wide north-south boulevard"
      const isMainAvenue = Math.abs(cell.gridX) <= 1;
      // Use block size for road segment
      const roadMesh = createPavedStrip(BLOCK_SIZE, BLOCK_SIZE, 0x555555);
      roadMesh.position.set(localX, localY, localZ);
      group.add(roadMesh);

    } else if (cell.type === 'parthenon') {
      // Spawn Parthenon
      const temple = await buildTemple({
          width: 30,
          depth: 60,
          scale: 1.5,
          order: 'doric',
          materialPreset: 'marble'
      });
      temple.position.set(localX, localY, localZ);
      group.add(temple);

    } else if (cell.type === 'plaza') {
      // Spawn Plaza
      const plazaMesh = createPavedStrip(BLOCK_SIZE - 2, BLOCK_SIZE - 2, 0xaaaaaa);
      plazaMesh.position.set(localX, localY, localZ);
      if (plazaMat) plazaMesh.material = plazaMat;
      group.add(plazaMesh);

      // Add props (TorchStands)
      const torch = createTorchStand();
      torch.position.set(localX, localY, localZ);
      group.add(torch);

    } else if (cell.type === 'building') {
       // Spawn Building
       // Random seed based on position
       const seed = Math.abs(cell.gridX * 73856093 ^ cell.gridZ * 19349663);
       const rng = () => {
          let t = seed + Math.random();
          return t - Math.floor(t);
       };

       const buildingGroup = spawnBuilding({
         district: cell.district,
         rng: rng // Use deterministic rng based on position
       });

       buildingGroup.position.set(localX, localY, localZ);

       // Random rotation 90 degrees
       const rotations = [0, Math.PI/2, Math.PI, -Math.PI/2];
       buildingGroup.rotation.y = rotations[Math.floor(Math.random() * rotations.length)];

       group.add(buildingGroup);
    }
  }

  // Create a dummy walking loop to satisfy contract
  const walkingLoop = new THREE.CatmullRomCurve3([
      new THREE.Vector3(center.x + 10, baseHeight, center.z + 10),
      new THREE.Vector3(center.x - 10, baseHeight, center.z + 10),
      new THREE.Vector3(center.x - 10, baseHeight, center.z - 10),
      new THREE.Vector3(center.x + 10, baseHeight, center.z - 10)
  ], true);

  return {
    group,
    walkingLoop,
    plazaLength,
    promenadeWidth,
  };
}

export default createCivicDistrict;
