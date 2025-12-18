import * as THREE from 'three';
import { AGORA_CENTER_3D, HARBOR_CENTER_3D } from './locations.js';
import { resolveBaseUrl, joinPath } from '../utils/baseUrl.js';
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
        type: 'building',
        district: 'residential'
      };

      const distance = Math.sqrt((gridX * BLOCK_SIZE) ** 2 + (gridZ * BLOCK_SIZE) ** 2);

      // District Logic (Radius)
      if (gridZ > 12) {
        cell.district = 'harbor';
      } else if (distance < 60) {
        cell.district = 'sacred';
      } else if (distance >= 60 && distance < 140) {
        // Corrected radius to 140 per user instructions (was 120 in my head/previous draft?)
        // Instructions: "Radius 60 - 140m: district: 'commercial'"
        cell.district = 'commercial';
      } else {
        cell.district = 'residential';
      }

      // Main Avenue Logic
      // "Main Avenue: Create a wide road (width 2 or 3 cells) running from the Harbor (High Z) straight to the Acropolis (0,0)."
      // Assuming Harbor is at +Z (High Z). The loop goes MIN_Z to MAX_Z.
      // So Avenue is around gridX = 0, maybe -1, 0, 1?
      // Let's say width 3: -1, 0, 1.
      if (Math.abs(gridX) <= 1) {
        cell.type = 'road';
      } else if (cell.district === 'sacred') {
          // In sacred district (Acropolis), maybe cleaner?
          // "If 'sacred': ONLY spawn createTemple or large monuments... Place the main Parthenon at (0,0)."
          if (gridX === 0 && gridZ === 0) {
              cell.type = 'parthenon';
          } else {
              // Maybe some paths or just open?
              // Let's leave as 'building' which will spawn temples/monuments via spawner.
              cell.type = 'building';
          }
      } else if (cell.district === 'commercial') {
          // Grid pattern roads in Agora?
          if (gridX % 3 === 0 || gridZ % 3 === 0) {
             cell.type = 'road';
          }
      } else {
          // Residential roads
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

    if (cell.type === 'road') {
      const isMainAvenue = Math.abs(cell.gridX) <= 1;
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
         rng: rng
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
