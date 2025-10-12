import * as THREE from "three";
import {
  makeMarbleMaterialSet,
  makeColumn,
  makeStylobateSteps,
  makePediment,
  makeRoof,
  makeColonnadeInstanced,
  makeTerracottaMaterial,
  makePlasterMaterial,
} from "./buildingKit.js";
import { applyTextureBudgetToObject } from "../utils/textureBudget.js";

function cloneTextureSet(textures = {}) {
  const cloneSingle = (texture) => {
    if (!texture) return null;
    const cloned = texture.clone();
    cloned.needsUpdate = true;
    return cloned;
  };
  return {
    map: cloneSingle(textures.map),
    normalMap: cloneSingle(textures.normalMap),
    roughnessMap: cloneSingle(textures.roughnessMap),
    aoMap: cloneSingle(textures.aoMap),
  };
}

function createMarbleMaterial(baseSet) {
  return new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.08,
    roughness: 0.52,
    map: baseSet.map || null,
    normalMap: baseSet.normalMap || null,
    roughnessMap: baseSet.roughnessMap || null,
    aoMap: baseSet.aoMap || null,
  });
}

function applyShadowAndCollision(target, { cast = true, receive = true } = {}) {
  if (!target) return;
  target.traverse?.((child) => {
    if (!child?.isMesh) return;
    child.castShadow = cast;
    child.receiveShadow = receive;
    child.userData = child.userData || {};
    child.userData.noCollision = false;
  });
}

export function alignToGround(group, terrain, x, z, offset = 0) {
  if (!group || !terrain || typeof x !== "number" || typeof z !== "number") {
    return null;
  }
  const sampler = terrain?.userData?.getHeightAt;
  if (typeof sampler !== "function") return null;
  const height = sampler(x, z);
  if (!Number.isFinite(height)) return null;
  const targetY = height + offset;
  group.position.y = targetY;
  return targetY;
}

export function buildTemple(opts = {}) {
  const {
    width = 20,
    depth = 36,
    colX = 6,
    colZ = 13,
    scale = 1,
    order = "doric",
    materialPreset = "marble",
    stylobateHeight = 1.05,
  } = opts;

  const group = new THREE.Group();
  group.name = `ProceduralTemple_${order}`;
  group.scale.setScalar(scale);

  const marbleTextures = cloneTextureSet(makeMarbleMaterialSet());
  const columnMaterial = createMarbleMaterial(marbleTextures);
  const stylobateMaterial = columnMaterial.clone();
  const entablatureMaterial = columnMaterial.clone();
  const roofMaterial = makeTerracottaMaterial({ color: 0xb25b3c });
  const cellaMaterial = makePlasterMaterial({ color: 0xf3f0e9, roughness: 0.72 });

  const stylobate = makeStylobateSteps({
    width,
    depth,
    steps: 3,
    stepHeight: stylobateHeight / 3,
    stepInset: 0.6,
    material: stylobateMaterial,
  });
  group.add(stylobate);

  const columnHeight = opts.columnHeight ?? 8.5;
  const columnMesh = makeColumn({ height: columnHeight, material: columnMaterial });
  const columnGeometry = columnMesh.geometry;
  const columnMat = columnMesh.material;

  const spacingX = colX > 1 ? width / (colX - 1) : width;
  const spacingZ = colZ > 1 ? depth / (colZ - 1) : depth;
  const colonnade = makeColonnadeInstanced({
    countX: colX,
    countZ: colZ,
    spacingX,
    spacingZ,
    columnGeom: columnGeometry,
    columnMat,
    name: "TempleColonnade",
  });
  const colonnadeYOffset = stylobateHeight + columnHeight / 2;
  const dummy = new THREE.Object3D();
  for (let i = 0; i < colonnade.count; i += 1) {
    colonnade.getMatrixAt(i, dummy.matrix);
    dummy.position.setFromMatrixPosition(dummy.matrix);
    dummy.position.y = colonnadeYOffset;
    dummy.updateMatrix();
    colonnade.setMatrixAt(i, dummy.matrix);
  }
  colonnade.instanceMatrix.needsUpdate = true;
  colonnade.userData.noCollision = false;
  colonnade.castShadow = true;
  colonnade.receiveShadow = true;
  group.add(colonnade);

  const entablatureHeight = opts.entablatureHeight ?? 1.1;
  const entablature = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.6, entablatureHeight, depth + 0.6),
    entablatureMaterial
  );
  entablature.position.y = stylobateHeight + columnHeight + entablatureHeight / 2;
  entablature.name = "Entablature";
  group.add(entablature);

  const pedimentHeight = opts.pedimentHeight ?? 3.2;
  const pedimentDepth = opts.pedimentDepth ?? 1.2;
  const frontPediment = makePediment({ width: width + 0.8, depth: pedimentDepth, height: pedimentHeight, material: entablatureMaterial });
  frontPediment.position.set(0, entablature.position.y + entablatureHeight / 2, -depth / 2 - pedimentDepth / 2 + 0.3);
  const rearPediment = frontPediment.clone();
  rearPediment.position.z = depth / 2 + pedimentDepth / 2 - 0.3;
  rearPediment.rotation.y = Math.PI;
  group.add(frontPediment);
  group.add(rearPediment);

  const roof = makeRoof({ width: width + 1.2, depth: depth + 1.8, height: opts.roofHeight ?? 4.4, material: roofMaterial });
  roof.position.y = entablature.position.y + entablatureHeight / 2 + pedimentHeight * 0.85;
  group.add(roof);

  const cellaWidth = width * 0.6;
  const cellaDepth = depth * 0.55;
  const cellaHeight = columnHeight * 0.75;
  const cella = new THREE.Mesh(
    new THREE.BoxGeometry(cellaWidth, cellaHeight, cellaDepth),
    cellaMaterial
  );
  cella.position.y = stylobateHeight + cellaHeight / 2;
  cella.name = "Cella";
  group.add(cella);

  applyShadowAndCollision(group, { cast: true, receive: true });
  applyTextureBudgetToObject(group, { safeMode: true });

  group.userData = group.userData || {};
  group.userData.materialPreset = materialPreset;
  group.userData.isProceduralTemple = true;

  return group;
}

export default { buildTemple, alignToGround };
