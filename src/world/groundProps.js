import * as THREE from "three";
import { getSeaLevelY } from "./locations.js";

const ROCK_GEOMETRY = new THREE.DodecahedronGeometry(0.25, 0);
const GRASS_GEOMETRY = new THREE.ConeGeometry(0.15, 0.6, 6);
const BUSH_GEOMETRY = new THREE.IcosahedronGeometry(0.35, 0);

const propMaterials = {
  rock: new THREE.MeshStandardMaterial({ color: "#6f6b62", roughness: 0.95 }),
  grass: new THREE.MeshStandardMaterial({ color: "#4f7a3a", roughness: 0.8 }),
  bush: new THREE.MeshStandardMaterial({ color: "#3c5d2c", roughness: 0.82 }),
};

export const GROUND_PROP_TYPES = ["rock", "grass-tuft", "bush"];

function pickPropType() {
  const r = Math.random();
  if (r < 0.4) return "rock";
  if (r < 0.75) return "grass-tuft";
  return "bush";
}

function createPropMesh(type) {
  switch (type) {
    case "rock": {
      const mesh = new THREE.Mesh(ROCK_GEOMETRY, propMaterials.rock);
      mesh.scale.setScalar(THREE.MathUtils.randFloat(0.8, 1.8));
      mesh.rotation.set(
        THREE.MathUtils.randFloatSpread(0.2),
        Math.random() * Math.PI * 2,
        THREE.MathUtils.randFloatSpread(0.2),
      );
      return mesh;
    }
    case "grass-tuft": {
      const mesh = new THREE.Mesh(GRASS_GEOMETRY, propMaterials.grass);
      mesh.scale.setScalar(THREE.MathUtils.randFloat(0.7, 1.4));
      mesh.rotation.y = Math.random() * Math.PI * 2;
      return mesh;
    }
    case "bush":
    default: {
      const mesh = new THREE.Mesh(BUSH_GEOMETRY, propMaterials.bush);
      mesh.scale.setScalar(THREE.MathUtils.randFloat(1.0, 1.6));
      mesh.rotation.y = Math.random() * Math.PI * 2;
      return mesh;
    }
  }
}

function distanceToCurve(curve, x, z, samples = 120) {
  if (!curve?.getPoint) return Infinity;
  let best = Infinity;
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const p = curve.getPoint(t);
    const dx = p.x - x;
    const dz = p.z - z;
    const d = Math.hypot(dx, dz);
    if (d < best) best = d;
  }
  return best;
}

function isInsideBuilding(x, z, placements, padding = 1.2) {
  if (!Array.isArray(placements)) return false;
  for (const placement of placements) {
    const radius = Math.max(
      padding,
      Math.hypot(placement?.width ?? 1, placement?.depth ?? 1) * 0.6,
    );
    const dx = (placement?.x ?? 0) - x;
    const dz = (placement?.z ?? 0) - z;
    if (dx * dx + dz * dz <= radius * radius) {
      return true;
    }
  }
  return false;
}

export function scatterGroundProps(scene, terrain, options = {}) {
  if (!scene || !terrain) return null;

  const count = options.count ?? 520;
  const seaLevel = Number.isFinite(options?.seaLevel)
    ? options.seaLevel
    : getSeaLevelY();
  const placements = options.buildingPlacements || [];
  const roadCurves = Array.isArray(options.roadCurves) ? options.roadCurves : [];
  const mainRoadCurve = options.mainRoadCurve ?? null;
  const roadPadding = options.roadPadding ?? 2.8;
  const terrainSize = terrain.geometry?.userData?.size ?? 500;
  const half = terrainSize * 0.5;

  const group = new THREE.Group();
  group.name = "GroundProps";
  scene.add(group);

  const sampleHeight = terrain?.userData?.getHeightAt?.bind(terrain?.userData);

  let placed = 0;
  let attempts = 0;
  const maxAttempts = count * 5;

  while (placed < count && attempts < maxAttempts) {
    attempts++;
    const x = THREE.MathUtils.randFloatSpread(terrainSize * 0.92);
    const z = THREE.MathUtils.randFloatSpread(terrainSize * 0.92);
    if (Math.abs(x) > half || Math.abs(z) > half) continue;

    const height = sampleHeight ? sampleHeight(x, z) : null;
    if (!Number.isFinite(height) || height <= seaLevel) continue;

    if (isInsideBuilding(x, z, placements)) continue;

    const nearMainRoad = mainRoadCurve
      ? distanceToCurve(mainRoadCurve, x, z, 180) <= roadPadding
      : false;
    if (nearMainRoad) continue;

    let nearSecondaryRoad = false;
    for (const curve of roadCurves) {
      const d = distanceToCurve(curve, x, z, 80);
      if (d <= roadPadding) {
        nearSecondaryRoad = true;
        break;
      }
    }
    if (nearSecondaryRoad) continue;

    const propType = pickPropType();
    const mesh = createPropMesh(propType);
    mesh.position.set(x, height + 0.02, z);
    group.add(mesh);
    placed++;
  }

  if (group.children.length === 0) {
    scene.remove(group);
    return null;
  }

  return group;
}
