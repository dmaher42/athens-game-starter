import * as THREE from "three";
import { createProceduralMarbleTextures } from "../main.js";

function createSolidTexture(color, colorSpace = THREE.SRGBColorSpace) {
  const target = new THREE.Color(color);
  const data = new Uint8Array([
    Math.round(target.r * 255),
    Math.round(target.g * 255),
    Math.round(target.b * 255),
    255,
  ]);
  const texture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  texture.colorSpace = colorSpace;
  texture.needsUpdate = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function cloneTexture(texture) {
  if (!texture) return null;
  const cloned = texture.clone();
  if (cloned.image && texture.image && texture.image.data) {
    const source = texture.image.data;
    cloned.image = { ...texture.image, data: source.slice ? source.slice(0) : source };
  }
  cloned.needsUpdate = true;
  return cloned;
}

function ensureUv2(geometry) {
  if (!geometry || geometry.getAttribute("uv2")) {
    return geometry;
  }
  const uv = geometry.getAttribute("uv");
  if (!uv) return geometry;
  const uv2 = uv.clone();
  geometry.setAttribute("uv2", uv2);
  return geometry;
}

export function makeMarbleMaterialSet() {
  let textures = null;
  try {
    textures = createProceduralMarbleTextures?.();
  } catch (error) {
    console.warn("[buildingKit] Failed to create procedural marble textures", error);
  }

  if (!textures || !textures.map) {
    const fallback = {
      map: createSolidTexture(0xefecea, THREE.SRGBColorSpace),
      normalMap: createSolidTexture(0x8080ff, THREE.LinearSRGBColorSpace),
      roughnessMap: createSolidTexture(0xb3b3b3, THREE.LinearSRGBColorSpace),
      aoMap: createSolidTexture(0xe0e0e0, THREE.LinearSRGBColorSpace),
    };
    return fallback;
  }

  return {
    map: cloneTexture(textures.map) || createSolidTexture(0xefecea, THREE.SRGBColorSpace),
    normalMap:
      cloneTexture(textures.normalMap) || createSolidTexture(0x8080ff, THREE.LinearSRGBColorSpace),
    roughnessMap:
      cloneTexture(textures.roughnessMap) || createSolidTexture(0xb3b3b3, THREE.LinearSRGBColorSpace),
    aoMap: cloneTexture(textures.aoMap) || createSolidTexture(0xe0e0e0, THREE.LinearSRGBColorSpace),
  };
}

export function makePlasterMaterial(options = {}) {
  const material = new THREE.MeshStandardMaterial({
    color: 0xf5f0e6,
    roughness: 0.78,
    metalness: 0.04,
    ...options,
  });
  return material;
}

export function makeTerracottaMaterial(options = {}) {
  const material = new THREE.MeshStandardMaterial({
    color: 0xb45f3c,
    roughness: 0.65,
    metalness: 0.08,
    ...options,
  });
  return material;
}

export function makeColumn({
  height = 7,
  radiusTop = 0.62,
  radiusBottom = 0.68,
  radialSegments = 32,
  heightSegments = 1,
  material = null,
} = {}) {
  const columnGeometry = new THREE.CylinderGeometry(
    radiusTop,
    radiusBottom,
    height,
    radialSegments,
    heightSegments,
    false
  );
  ensureUv2(columnGeometry);
  const columnMaterial =
    material ||
    new THREE.MeshStandardMaterial({
      color: 0xf0ece4,
      roughness: 0.55,
      metalness: 0.08,
    });
  const mesh = new THREE.Mesh(columnGeometry, columnMaterial);
  mesh.name = "ProceduralColumn";
  return mesh;
}

export function makeStylobateSteps({
  width = 18,
  depth = 32,
  steps = 3,
  stepHeight = 0.35,
  stepInset = 0.6,
  material = null,
} = {}) {
  const group = new THREE.Group();
  group.name = "Stylobate";
  const baseMaterial =
    material ||
    new THREE.MeshStandardMaterial({
      color: 0xf3eee3,
      roughness: 0.6,
      metalness: 0.05,
    });

  for (let i = 0; i < steps; i += 1) {
    const level = steps - 1 - i;
    const stepWidth = width + stepInset * 2 * level;
    const stepDepth = depth + stepInset * 2 * level;
    const geometry = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
    ensureUv2(geometry);
    const mesh = new THREE.Mesh(geometry, baseMaterial);
    mesh.position.y = stepHeight * 0.5 + i * stepHeight;
    mesh.name = `StylobateStep${i}`;
    group.add(mesh);
  }

  group.userData.isStylobate = true;
  return group;
}

export function makePediment({
  width = 14,
  depth = 1.6,
  height = 3.2,
  material = null,
} = {}) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(width / 2, 0);
  shape.lineTo(0, height);
  shape.lineTo(-width / 2, 0);

  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  geometry.translate(0, 0, -depth / 2);
  ensureUv2(geometry);

  const pedimentMaterial =
    material ||
    new THREE.MeshStandardMaterial({
      color: 0xf4efe5,
      roughness: 0.55,
      metalness: 0.04,
    });

  const mesh = new THREE.Mesh(geometry, pedimentMaterial);
  mesh.name = "Pediment";
  return mesh;
}

export function makeRoof({
  width = 18,
  depth = 32,
  height = 4,
  material = null,
} = {}) {
  const shape = new THREE.Shape();
  shape.moveTo(-depth / 2, 0);
  shape.lineTo(depth / 2, 0);
  shape.lineTo(0, height);
  shape.lineTo(-depth / 2, 0);

  const geometry = new THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: false });
  geometry.translate(0, 0, -width / 2);
  geometry.rotateY(Math.PI / 2);
  ensureUv2(geometry);

  const roofMaterial =
    material ||
    new THREE.MeshStandardMaterial({
      color: 0xb35a36,
      roughness: 0.55,
      metalness: 0.12,
    });

  const mesh = new THREE.Mesh(geometry, roofMaterial);
  mesh.name = "TempleRoof";
  return mesh;
}

export function makeColonnadeInstanced({
  countX = 6,
  countZ = 13,
  spacingX = 4,
  spacingZ = 4,
  columnGeom,
  columnMat,
  name = "Colonnade",
} = {}) {
  if (!columnGeom || !columnMat) {
    throw new Error("makeColonnadeInstanced requires geometry and material");
  }

  ensureUv2(columnGeom);

  const perimeterCount =
    countX > 0 && countZ > 0
      ? countX * 2 + Math.max(0, countZ - 2) * 2
      : 0;
  const mesh = new THREE.InstancedMesh(columnGeom, columnMat, Math.max(perimeterCount, 1));
  mesh.name = name;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const widthSpan = countX > 1 ? spacingX * (countX - 1) : 0;
  const depthSpan = countZ > 1 ? spacingZ * (countZ - 1) : 0;
  const dummy = new THREE.Object3D();
  let index = 0;

  const placeColumn = (x, z) => {
    dummy.position.set(x, 0, z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
    index += 1;
  };

  for (let i = 0; i < countX; i += 1) {
    const x = -widthSpan / 2 + i * spacingX;
    placeColumn(x, -depthSpan / 2);
    if (perimeterCount > index) {
      placeColumn(x, depthSpan / 2);
    }
  }

  for (let j = 1; j < countZ - 1; j += 1) {
    const z = -depthSpan / 2 + j * spacingZ;
    placeColumn(-widthSpan / 2, z);
    if (perimeterCount > index) {
      placeColumn(widthSpan / 2, z);
    }
  }

  mesh.count = index;
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

export default {
  makeMarbleMaterialSet,
  makePlasterMaterial,
  makeTerracottaMaterial,
  makeColumn,
  makeStylobateSteps,
  makePediment,
  makeRoof,
  makeColonnadeInstanced,
};
