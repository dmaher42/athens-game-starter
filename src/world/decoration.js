import * as THREE from "three";
import { getSeaLevelY } from "./locations.js";
import { makeTreeMaterials } from "./materials.js";
import { disableFog } from "../utils/materialUtils.js";

const HARBOR_SCATTER_RADIUS = 5;
const BETWEEN_BUILDING_MAX_DISTANCE = 12;
const BETWEEN_BUILDING_MIN_DISTANCE = 4;

const _tempVecA = new THREE.Vector3();
const _tempVecB = new THREE.Vector3();
const _tempVecC = new THREE.Vector3();
const _tmpHsl = { h: 0, s: 0, l: 0 };

const OLIVE_TRUNK_GEOMETRY = new THREE.CylinderGeometry(0.18, 0.24, 1, 8);
OLIVE_TRUNK_GEOMETRY.translate(0, 0.5, 0);
const OLIVE_CANOPY_GEOMETRY = new THREE.IcosahedronGeometry(0.6, 1);

const PALM_TRUNK_GEOMETRY = new THREE.CylinderGeometry(0.12, 0.16, 1, 10);
PALM_TRUNK_GEOMETRY.translate(0, 0.5, 0);
const PALM_CROWN_GEOMETRY = new THREE.SphereGeometry(0.32, 12, 10);
const PALM_FROND_GEOMETRY = new THREE.ConeGeometry(0.7, 1.6, 6, 1, true);
PALM_FROND_GEOMETRY.rotateX(Math.PI / 2);
PALM_FROND_GEOMETRY.translate(0, 0, -0.8);

const POT_BODY_GEOMETRY = new THREE.CylinderGeometry(0.36, 0.28, 0.42, 12);
POT_BODY_GEOMETRY.translate(0, 0.21, 0);
const POT_RIM_GEOMETRY = new THREE.TorusGeometry(0.32, 0.04, 8, 16);
POT_RIM_GEOMETRY.rotateX(Math.PI / 2);
POT_RIM_GEOMETRY.translate(0, 0.42, 0);

const SMALL_CANOPY_GEOMETRY = new THREE.SphereGeometry(0.36, 14, 12);

const CRATE_GEOMETRY = new THREE.BoxGeometry(0.9, 0.6, 0.9);
CRATE_GEOMETRY.translate(0, 0.3, 0);

const UMBRELLA_POLE_GEOMETRY = new THREE.CylinderGeometry(0.04, 0.05, 1, 12);
UMBRELLA_POLE_GEOMETRY.translate(0, 0.5, 0);
const UMBRELLA_CANOPY_GEOMETRY = new THREE.CylinderGeometry(0, 1.2, 0.7, 12, 1, false);
UMBRELLA_CANOPY_GEOMETRY.translate(0, 0.35, 0);
const UMBRELLA_BASE_GEOMETRY = new THREE.CylinderGeometry(0.22, 0.26, 0.12, 12);
UMBRELLA_BASE_GEOMETRY.translate(0, 0.06, 0);

const AMPHORA_BODY = new THREE.CylinderGeometry(0.2, 0.1, 0.8, 12);
AMPHORA_BODY.translate(0, 0.4, 0);
const AMPHORA_NECK = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 12);
AMPHORA_NECK.translate(0, 0.95, 0);
const AMPHORA_RIM = new THREE.TorusGeometry(0.08, 0.02, 8, 16);
AMPHORA_RIM.rotateX(Math.PI / 2);
AMPHORA_RIM.translate(0, 1.1, 0);

let potMaterial = null;
let amphoraMaterial = null;
let crateMaterial = null;
let umbrellaPoleMaterial = null;
let umbrellaCanopyBase = null;

function shouldPlace() {
  const threshold = THREE.MathUtils.randFloat(0.1, 0.2);
  return Math.random() < threshold;
}

function sampleHeight(terrain, x, z, fallback = getSeaLevelY()) {
  const sampler = terrain?.userData?.getHeightAt;
  if (typeof sampler === "function") {
    const h = sampler(x, z);
    if (Number.isFinite(h)) {
      return h;
    }
  }
  return fallback;
}

function jitterMaterialColor(material, variance = 0.05) {
  if (!material || !material.color) return;
  material.color.getHSL(_tmpHsl);
  const jitter = THREE.MathUtils.randFloatSpread(variance);
  _tmpHsl.l = THREE.MathUtils.clamp(_tmpHsl.l + jitter, 0, 1);
  material.color.setHSL(_tmpHsl.h, _tmpHsl.s, _tmpHsl.l);
}

function markNoCollision(object) {
  object.userData = object.userData || {};
  object.userData.noCollision = true;
  object.traverse?.((child) => {
    if (!child) return;
    child.userData = child.userData || {};
    child.userData.noCollision = true;
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return object;
}

function createOliveTree(baseMaterials) {
  const group = new THREE.Group();
  group.name = "OliveTree";

  const trunkMaterial = baseMaterials.bark.clone();
  jitterMaterialColor(trunkMaterial, 0.04);
  const trunk = new THREE.Mesh(OLIVE_TRUNK_GEOMETRY, trunkMaterial);
  const trunkHeight = THREE.MathUtils.randFloat(2.2, 3.0);
  trunk.scale.set(1, trunkHeight, 1);
  group.add(trunk);

  const canopyMaterial = baseMaterials.leaf.clone();
  jitterMaterialColor(canopyMaterial, 0.06);
  const canopy = new THREE.Mesh(OLIVE_CANOPY_GEOMETRY, canopyMaterial);
  const canopyScale = THREE.MathUtils.randFloat(1.1, 1.6);
  canopy.scale.setScalar(canopyScale);
  canopy.position.y = trunkHeight + canopyScale * 0.55;
  canopy.rotation.y = Math.random() * Math.PI * 2;
  group.add(canopy);

  if (Math.random() > 0.45) {
    const sideMaterial = baseMaterials.leaf.clone();
    jitterMaterialColor(sideMaterial, 0.05);
    const sideCanopy = new THREE.Mesh(OLIVE_CANOPY_GEOMETRY, sideMaterial);
    const sideScale = canopyScale * THREE.MathUtils.randFloat(0.55, 0.75);
    sideCanopy.scale.setScalar(sideScale);
    sideCanopy.position.set(
      THREE.MathUtils.randFloatSpread(canopyScale * 0.8),
      trunkHeight + sideScale * 0.6,
      THREE.MathUtils.randFloatSpread(canopyScale * 0.8)
    );
    sideCanopy.rotation.y = Math.random() * Math.PI * 2;
    group.add(sideCanopy);
  }

  return disableFog(markNoCollision(group));
}

function createPalmTree(baseMaterials) {
  const group = new THREE.Group();
  group.name = "PalmTree";

  const trunkMaterial = baseMaterials.bark.clone();
  jitterMaterialColor(trunkMaterial, 0.03);
  const trunk = new THREE.Mesh(PALM_TRUNK_GEOMETRY, trunkMaterial);
  const trunkHeight = THREE.MathUtils.randFloat(3.4, 4.4);
  trunk.scale.set(1, trunkHeight, 1);
  trunk.rotation.z = THREE.MathUtils.degToRad(THREE.MathUtils.randFloatSpread(3));
  group.add(trunk);

  const crownMaterial = baseMaterials.leaf.clone();
  jitterMaterialColor(crownMaterial, 0.04);
  const crown = new THREE.Mesh(PALM_CROWN_GEOMETRY, crownMaterial);
  const crownScale = THREE.MathUtils.randFloat(0.9, 1.2);
  crown.scale.setScalar(crownScale);
  crown.position.y = trunkHeight + 0.35 * crownScale;
  group.add(crown);

  const frondCount = 6;
  for (let i = 0; i < frondCount; i++) {
    const frondMaterial = crownMaterial.clone();
    jitterMaterialColor(frondMaterial, 0.03);
    const frond = new THREE.Mesh(PALM_FROND_GEOMETRY, frondMaterial);
    frond.position.y = trunkHeight + 0.12;
    frond.rotation.y = (i / frondCount) * Math.PI * 2 + THREE.MathUtils.randFloatSpread(0.2);
    frond.rotation.z = THREE.MathUtils.degToRad(THREE.MathUtils.lerp(-18, -32, Math.random()));
    group.add(frond);
  }

  return disableFog(markNoCollision(group));
}

function getPotMaterial() {
  if (!potMaterial) {
    potMaterial = new THREE.MeshStandardMaterial({
      color: 0xa97858,
      roughness: 0.85,
      metalness: 0.12,
      fog: false,
    });
  }
  return potMaterial;
}

function createPottedPlant(baseMaterials) {
  const group = new THREE.Group();
  group.name = "PottedPlant";

  const pot = new THREE.Mesh(POT_BODY_GEOMETRY, getPotMaterial().clone());
  jitterMaterialColor(pot.material, 0.05);
  group.add(pot);

  const rim = new THREE.Mesh(POT_RIM_GEOMETRY, pot.material);
  group.add(rim);

  const stemMaterial = baseMaterials.bark.clone();
  jitterMaterialColor(stemMaterial, 0.02);
  const stem = new THREE.Mesh(OLIVE_TRUNK_GEOMETRY, stemMaterial);
  const stemHeight = THREE.MathUtils.randFloat(0.6, 0.9);
  stem.scale.set(0.18, stemHeight, 0.18);
  group.add(stem);

  const canopyMaterial = baseMaterials.leaf.clone();
  jitterMaterialColor(canopyMaterial, 0.06);
  const canopy = new THREE.Mesh(SMALL_CANOPY_GEOMETRY, canopyMaterial);
  const canopyScale = THREE.MathUtils.randFloat(0.8, 1.1);
  canopy.scale.setScalar(canopyScale);
  canopy.position.y = stemHeight + 0.32;
  group.add(canopy);

  return disableFog(markNoCollision(group));
}

function getCrateMaterial() {
  if (!crateMaterial) {
    crateMaterial = new THREE.MeshStandardMaterial({
      color: 0x8d6b45,
      roughness: 0.8,
      metalness: 0.05,
      fog: false,
    });
  }
  return crateMaterial;
}

function createCrateStack() {
  const group = new THREE.Group();
  group.name = "HarborCrates";

  const baseMaterial = getCrateMaterial().clone();
  jitterMaterialColor(baseMaterial, 0.04);
  const base = new THREE.Mesh(CRATE_GEOMETRY, baseMaterial);
  base.rotation.y = Math.random() * Math.PI * 2;
  group.add(base);

  if (Math.random() > 0.65) {
    const topMaterial = baseMaterial.clone();
    jitterMaterialColor(topMaterial, 0.04);
    const top = new THREE.Mesh(CRATE_GEOMETRY, topMaterial);
    top.scale.setScalar(THREE.MathUtils.randFloat(0.75, 0.95));
    top.position.y = 0.6;
    top.rotation.y = Math.random() * Math.PI * 2;
    group.add(top);
  }

  return disableFog(markNoCollision(group));
}

function getUmbrellaPoleMaterial() {
  if (!umbrellaPoleMaterial) {
    umbrellaPoleMaterial = new THREE.MeshStandardMaterial({
      color: 0xcfc6bb,
      roughness: 0.6,
      metalness: 0.2,
      fog: false,
    });
  }
  return umbrellaPoleMaterial;
}

function getUmbrellaCanopyMaterial() {
  if (!umbrellaCanopyBase) {
    umbrellaCanopyBase = new THREE.MeshPhysicalMaterial({
      color: 0xdad3c6,
      roughness: 0.85,
      metalness: 0.05,
      clearcoat: 0.08,
      clearcoatRoughness: 0.7,
      fog: false,
    });
  }
  return umbrellaCanopyBase;
}

function createUmbrella() {
  const group = new THREE.Group();
  group.name = "MarketUmbrella";

  const base = new THREE.Mesh(UMBRELLA_BASE_GEOMETRY, getUmbrellaPoleMaterial().clone());
  group.add(base);

  const poleMaterial = getUmbrellaPoleMaterial().clone();
  const pole = new THREE.Mesh(UMBRELLA_POLE_GEOMETRY, poleMaterial);
  const poleHeight = THREE.MathUtils.randFloat(1.6, 2.1);
  pole.scale.set(1, poleHeight, 1);
  group.add(pole);

  const canopyMaterial = getUmbrellaCanopyMaterial().clone();
  jitterMaterialColor(canopyMaterial, 0.08);
  const canopy = new THREE.Mesh(UMBRELLA_CANOPY_GEOMETRY, canopyMaterial);
  const canopyScale = THREE.MathUtils.randFloat(0.9, 1.15);
  canopy.scale.set(canopyScale, 1, canopyScale);
  canopy.position.y = poleHeight;
  canopy.rotation.y = Math.random() * Math.PI * 2;
  group.add(canopy);

  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), poleMaterial.clone());
  finial.position.y = poleHeight + 0.38;
  group.add(finial);

  return disableFog(markNoCollision(group));
}

function getAmphoraMaterial() {
  if (!amphoraMaterial) {
    amphoraMaterial = new THREE.MeshStandardMaterial({
      color: 0xc98d72,
      roughness: 0.6,
      metalness: 0.1,
      fog: false,
    });
  }
  return amphoraMaterial;
}

function createAmphoraStack() {
  const group = new THREE.Group();
  group.name = "AmphoraStack";
  const count = Math.floor(THREE.MathUtils.randFloat(3, 5));
  const mat = getAmphoraMaterial().clone();
  jitterMaterialColor(mat, 0.08);

  for (let i = 0; i < count; i++) {
     const mesh = new THREE.Mesh(AMPHORA_BODY, mat);
     const neck = new THREE.Mesh(AMPHORA_NECK, mat);
     const rim = new THREE.Mesh(AMPHORA_RIM, mat);
     mesh.add(neck);
     mesh.add(rim);

     const scale = THREE.MathUtils.randFloat(0.8, 1.1);
     mesh.scale.setScalar(scale);

     mesh.position.set(
       THREE.MathUtils.randFloatSpread(0.8),
       0,
       THREE.MathUtils.randFloatSpread(0.8)
     );
     mesh.rotation.z = THREE.MathUtils.randFloatSpread(0.3);
     group.add(mesh);
  }
  return disableFog(markNoCollision(group));
}

function createTorch() {
  const group = new THREE.Group();
  group.name = "SacredTorch";

  // Brazier stand
  const stand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.2, 1.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.4, fog: false })
  );
  stand.position.y = 0.6;
  group.add(stand);

  const bowl = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 0.3, 8, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.6, roughness: 0.7, fog: false })
  );
  bowl.position.y = 1.35;
  bowl.rotation.x = Math.PI;
  group.add(bowl);

  // Flame light
  const light = new THREE.PointLight(0xffaa00, 2, 8, 2);
  light.position.y = 1.5;
  group.add(light);

  // Simple flame mesh
  const flame = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.15, 0),
      new THREE.MeshBasicMaterial({ color: 0xff4400 })
  );
  flame.position.y = 1.4;
  flame.userData.pulse = Math.random() * 10;
  flame.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
      const time = performance.now() * 0.005;
      const s = 1.0 + Math.sin(time + flame.userData.pulse) * 0.2;
      flame.scale.setScalar(s);
  };
  group.add(flame);

  return disableFog(markNoCollision(group));
}

function pickHarborPrefab(treeMaterials) {
  const roll = Math.random();
  if (roll < 0.4) return createOliveTree(treeMaterials);
  if (roll < 0.65) return createPalmTree(treeMaterials);
  if (roll < 0.82) return createPottedPlant(treeMaterials);
  if (roll < 0.93) return createCrateStack();
  return createUmbrella();
}

function pickAlleyPrefab(treeMaterials, districtType) {
  if (districtType === 'commercial') {
     if (Math.random() < 0.4) return createAmphoraStack();
     return createCrateStack();
  }
  if (districtType === 'sacred') {
     return createTorch();
  }

  const roll = Math.random();
  if (roll < 0.5) return createPottedPlant(treeMaterials);
  if (roll < 0.75) return createCrateStack();
  if (roll < 0.9) return createUmbrella();
  return createOliveTree(treeMaterials);
}

function scatterAroundHarbor(group, options) {
  const { center, terrain, treeMaterials } = options;
  const resolvedSeaLevel = Number.isFinite(options?.seaLevel)
    ? options.seaLevel
    : getSeaLevelY();
  if (!center) return;

  const attempts = options.attempts ?? 28;
  for (let i = 0; i < attempts; i++) {
    if (!shouldPlace()) continue;
    const radius = Math.random() * HARBOR_SCATTER_RADIUS;
    const theta = Math.random() * Math.PI * 2;
    const x = center.x + Math.cos(theta) * radius;
    const z = center.z + Math.sin(theta) * radius;
    const ground = sampleHeight(terrain, x, z, center.y ?? resolvedSeaLevel);
    if (!Number.isFinite(ground) || ground < resolvedSeaLevel - 0.05) continue;

    const object = pickHarborPrefab(treeMaterials);
    object.position.set(x, ground + 0.02, z);
    object.rotation.y = Math.random() * Math.PI * 2;
    object.userData = { ...object.userData, category: "harbor-decoration" };
    group.add(object);
  }
}

function collectBuildingWorldPositions(buildingGroup) {
  const results = [];
  if (!buildingGroup) return results;

  buildingGroup.traverse((child) => {
    if (!child?.isObject3D || child === buildingGroup) return;
    if (!child.visible) return;
    if (!child.isMesh && child.children?.length === 0) return;
    child.getWorldPosition(_tempVecA);
    results.push({ node: child, position: _tempVecA.clone() });
  });

  return results;
}

function scatterBetweenBuildings(group, options) {
  const { buildingGroup, terrain, treeMaterials } = options;
  const resolvedSeaLevel = Number.isFinite(options?.seaLevel)
    ? options.seaLevel
    : getSeaLevelY();
  if (!buildingGroup) return;

  const positions = collectBuildingWorldPositions(buildingGroup);
  if (positions.length < 2) return;

  const usedPairs = new Set();

  for (let i = 0; i < positions.length; i++) {
    const current = positions[i];
    let nearestIndex = -1;
    let nearestDistance = Infinity;

    for (let j = 0; j < positions.length; j++) {
      if (i === j) continue;
      const other = positions[j];
      const distance = current.position.distanceTo(other.position);
      if (distance < BETWEEN_BUILDING_MIN_DISTANCE) continue;
      if (distance > BETWEEN_BUILDING_MAX_DISTANCE) continue;
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = j;
      }
    }

    if (nearestIndex === -1 || !Number.isFinite(nearestDistance)) continue;

    const pairKey = i < nearestIndex ? `${i}:${nearestIndex}` : `${nearestIndex}:${i}`;
    if (usedPairs.has(pairKey)) continue;
    usedPairs.add(pairKey);

    if (!shouldPlace()) continue;

    const other = positions[nearestIndex];
    _tempVecA.copy(current.position);
    _tempVecB.copy(other.position);
    _tempVecC.addVectors(_tempVecA, _tempVecB).multiplyScalar(0.5);

    const direction = _tempVecB.clone().sub(_tempVecA);
    if (direction.lengthSq() > 0.0001) {
      direction.normalize();
      const perpendicular = _tempVecC
        .clone()
        .set(-direction.z, 0, direction.x)
        .multiplyScalar(THREE.MathUtils.randFloatSpread(0.9));
      _tempVecC.add(perpendicular);
    }

    const ground = sampleHeight(terrain, _tempVecC.x, _tempVecC.z, resolvedSeaLevel);
    if (!Number.isFinite(ground) || ground < resolvedSeaLevel - 0.05) continue;

    // Determine district type from nearest building if possible
    let districtType = 'residential';
    if (current.node.userData?.district) districtType = current.node.userData.district;

    const object = pickAlleyPrefab(treeMaterials, districtType);
    object.position.set(_tempVecC.x, ground + 0.015, _tempVecC.z);
    object.rotation.y = Math.random() * Math.PI * 2;
    object.userData = { ...object.userData, category: "alley-decoration" };
    group.add(object);
  }
}

export function createHarborDecorations(parent, options = {}) {
  if (!parent) return null;

  const group = new THREE.Group();
  group.name = "HarborDecorations";
  group.userData.noCollision = true;
  parent.add(group);

  const treeMaterials = makeTreeMaterials(THREE);

  const seaLevel = Number.isFinite(options?.seaLevel)
    ? options.seaLevel
    : getSeaLevelY();

  scatterAroundHarbor(group, {
    center: options.harborPlazaCenter || options.center || options.harborCity?.userData?.pierPlazaCenter,
    terrain: options.terrain ?? null,
    attempts: options.harborAttempts,
    treeMaterials,
    seaLevel,
  });

  const buildingGroup = options.buildingsGroup || options.harborCity?.userData?.buildingsGroup || null;
  scatterBetweenBuildings(group, {
    buildingGroup,
    terrain: options.terrain ?? null,
    treeMaterials,
    seaLevel,
  });

  if (group.children.length === 0) {
    parent.remove(group);
    return null;
  }

  return group;
}
