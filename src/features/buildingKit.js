import * as THREE from "three";
import { createProceduralMarbleTextures } from "../main.js";

function createSolidDataTexture(color, { colorSpace = THREE.SRGBColorSpace } = {}) {
  const data = new Uint8Array(4);
  data[0] = (color >> 16) & 0xff;
  data[1] = (color >> 8) & 0xff;
  data[2] = color & 0xff;
  data[3] = 0xff;
  const texture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  texture.colorSpace = colorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

function ensureUv2Attribute(geometry) {
  if (!geometry) return geometry;
  const uv = geometry.getAttribute("uv");
  if (!uv) return geometry;
  if (!geometry.getAttribute("uv2")) {
    const uv2 = uv.clone();
    geometry.setAttribute("uv2", uv2);
  }
  return geometry;
}

function cloneTexture(texture, options = {}) {
  if (!texture) return null;
  if (typeof texture.clone === "function") {
    const cloned = texture.clone();
    cloned.needsUpdate = texture.needsUpdate;
    if (options.repeat) {
      cloned.repeat.copy(texture.repeat ?? new THREE.Vector2(1, 1));
    }
    cloned.wrapS = texture.wrapS;
    cloned.wrapT = texture.wrapT;
    cloned.offset.copy?.(texture.offset ?? new THREE.Vector2());
    cloned.center?.copy?.(texture.center ?? new THREE.Vector2());
    cloned.rotation = texture.rotation;
    cloned.colorSpace = texture.colorSpace;
    return cloned;
  }
  return texture;
}

export function makeMarbleMaterialSet() {
  const generated = createProceduralMarbleTextures?.();

  const fallback = {
    map: createSolidDataTexture(0xefecea, { colorSpace: THREE.SRGBColorSpace }),
    normalMap: createSolidDataTexture(0x8080ff, { colorSpace: THREE.LinearSRGBColorSpace }),
    roughnessMap: createSolidDataTexture(0xb3b3b3, { colorSpace: THREE.LinearSRGBColorSpace }),
    aoMap: createSolidDataTexture(0xe0e0e0, { colorSpace: THREE.LinearSRGBColorSpace }),
  };

  if (!generated || typeof generated !== "object") {
    return fallback;
  }

  return {
    map: generated.map || fallback.map,
    normalMap: generated.normalMap || fallback.normalMap,
    roughnessMap: generated.roughnessMap || fallback.roughnessMap,
    aoMap: generated.aoMap || fallback.aoMap,
  };
}

export function makePlasterMaterial({ color = 0xd8d1c4, roughness = 0.65 } = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.04,
  });
}

export function makeTerracottaMaterial({ color = 0xb96540 } = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.6,
    metalness: 0.08,
  });
}

export function makeColumn({
  height = 7,
  radiusTop = 0.7,
  radiusBottom = 0.75,
  radialSegments = 32,
  heightSegments = 1,
  material = null,
} = {}) {
  const marbleSet = makeMarbleMaterialSet();
  const columnMaterial =
    material ||
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.42,
      metalness: 0.08,
      map: cloneTexture(marbleSet.map, { repeat: true }),
      normalMap: cloneTexture(marbleSet.normalMap, { repeat: true }),
      roughnessMap: cloneTexture(marbleSet.roughnessMap, { repeat: true }),
      aoMap: cloneTexture(marbleSet.aoMap, { repeat: true }),
      clearcoat: 0.28,
      clearcoatRoughness: 0.5,
      envMapIntensity: 0.9,
    });

  const geometry = new THREE.CylinderGeometry(
    radiusTop,
    radiusBottom,
    height,
    radialSegments,
    heightSegments,
    false
  );
  geometry.translate(0, height / 2, 0);
  ensureUv2Attribute(geometry);

  const mesh = new THREE.Mesh(geometry, columnMaterial);
  mesh.name = "ProceduralColumn";
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = mesh.userData || {};
  mesh.userData.noCollision = false;
  return mesh;
}

export function makeStylobateSteps({
  width = 20,
  depth = 38,
  stepCount = 3,
  stepHeight = 0.35,
  stepInset = 0.6,
  material = null,
} = {}) {
  const group = new THREE.Group();
  group.name = "StylobateSteps";

  const marbleSet = makeMarbleMaterialSet();
  const stepMaterial =
    material ||
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.04,
      map: cloneTexture(marbleSet.map, { repeat: true }),
      normalMap: cloneTexture(marbleSet.normalMap, { repeat: true }),
      roughnessMap: cloneTexture(marbleSet.roughnessMap, { repeat: true }),
      aoMap: cloneTexture(marbleSet.aoMap, { repeat: true }),
      clearcoat: 0.18,
      clearcoatRoughness: 0.4,
      envMapIntensity: 0.85,
    });

  const clampedSteps = Math.max(1, Math.floor(stepCount));
  const safeInset = Math.max(0, stepInset);

  for (let i = 0; i < clampedSteps; i++) {
    const inset = (clampedSteps - 1 - i) * safeInset;
    const stepWidth = Math.max(0.5, width + inset * 2);
    const stepDepth = Math.max(0.5, depth + inset * 2);
    const geometry = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
    ensureUv2Attribute(geometry);
    const mesh = new THREE.Mesh(geometry, stepMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.y = stepHeight * (i + 0.5);
    mesh.userData = mesh.userData || {};
    mesh.userData.noCollision = false;
    mesh.name = `StylobateStep_${i}`;
    group.add(mesh);
  }

  return group;
}

export function makePediment({
  width = 20,
  depth = 1.6,
  height = 4.2,
  material = null,
} = {}) {
  const group = new THREE.Group();
  group.name = "TemplePediment";

  const marbleSet = makeMarbleMaterialSet();
  const pedimentMaterial =
    material ||
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.48,
      metalness: 0.05,
      map: cloneTexture(marbleSet.map, { repeat: true }),
      normalMap: cloneTexture(marbleSet.normalMap, { repeat: true }),
      roughnessMap: cloneTexture(marbleSet.roughnessMap, { repeat: true }),
      aoMap: cloneTexture(marbleSet.aoMap, { repeat: true }),
      clearcoat: 0.2,
      clearcoatRoughness: 0.45,
      envMapIntensity: 0.85,
    });

  const shape = new THREE.Shape();
  const halfWidth = width / 2;
  shape.moveTo(-halfWidth, 0);
  shape.lineTo(0, height);
  shape.lineTo(halfWidth, 0);
  shape.closePath();

  const extrude = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    steps: 1,
  });
  extrude.translate(0, 0, -depth / 2);
  ensureUv2Attribute(extrude);

  const mesh = new THREE.Mesh(extrude, pedimentMaterial);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = mesh.userData || {};
  mesh.userData.noCollision = false;
  group.add(mesh);

  return group;
}

function createRoofSide({ width, depth, height, material, flip = false }) {
  const halfDepth = depth / 2;
  const halfWidth = width / 2;
  const baseX = flip ? halfWidth : -halfWidth;
  const ridgeX = 0;

  const positions = new Float32Array([
    baseX,
    0,
    -halfDepth,
    baseX,
    0,
    halfDepth,
    ridgeX,
    height,
    halfDepth,
    ridgeX,
    height,
    -halfDepth,
  ]);

  const uvs = new Float32Array([
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    0,
  ]);

  const indices = flip ? [0, 2, 1, 0, 3, 2] : [0, 1, 2, 0, 2, 3];

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  ensureUv2Attribute(geometry);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  mesh.userData = mesh.userData || {};
  mesh.userData.noCollision = false;
  return mesh;
}

export function makeRoof({
  width = 20,
  depth = 38,
  height = 4,
  overhang = 1.4,
  material = null,
} = {}) {
  const group = new THREE.Group();
  group.name = "TempleRoof";

  const roofMaterial =
    material ||
    new THREE.MeshStandardMaterial({
      color: 0xc86f42,
      roughness: 0.62,
      metalness: 0.05,
    });

  const effectiveWidth = width + overhang * 2;
  const effectiveDepth = depth + overhang * 2;

  const left = createRoofSide({
    width: effectiveWidth,
    depth: effectiveDepth,
    height,
    material: roofMaterial,
    flip: false,
  });
  const right = createRoofSide({
    width: effectiveWidth,
    depth: effectiveDepth,
    height,
    material: roofMaterial,
    flip: true,
  });

  group.add(left);
  group.add(right);

  return group;
}

export function makeColonnadeInstanced({
  countX = 6,
  countZ = 12,
  spacingX = 4,
  spacingZ = 4.5,
  columnGeom = null,
  columnMat = null,
} = {}) {
  const needsSampleColumn = !(columnGeom instanceof THREE.BufferGeometry && columnMat);
  const baseColumn = needsSampleColumn ? makeColumn() : null;
  const geometry = columnGeom instanceof THREE.BufferGeometry ? columnGeom : baseColumn.geometry;
  const material = columnMat || baseColumn.material;

  ensureUv2Attribute(geometry);

  const perimeterCount =
    Math.max(0, countX) * 2 + Math.max(0, countZ - 2) * 2;
  const instanceCount = Math.max(1, perimeterCount);
  const instanced = new THREE.InstancedMesh(geometry, material, instanceCount);
  instanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  instanced.castShadow = true;
  instanced.receiveShadow = true;
  instanced.name = "TempleColonnade";
  instanced.userData = instanced.userData || {};
  instanced.userData.noCollision = false;

  const dummy = new THREE.Object3D();
  const halfSpanX = spacingX * Math.max(0, countX - 1) * 0.5;
  const halfSpanZ = spacingZ * Math.max(0, countZ - 1) * 0.5;
  let index = 0;

  const placeColumn = (x, z) => {
    dummy.position.set(x, 0, z);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    if (index < instanced.count) {
      instanced.setMatrixAt(index, dummy.matrix);
      index += 1;
    }
  };

  for (let ix = 0; ix < countX; ix++) {
    const x = -halfSpanX + ix * spacingX;
    placeColumn(x, -halfSpanZ);
    if (countZ > 1) {
      placeColumn(x, halfSpanZ);
    }
  }

  if (countZ > 2) {
    for (let iz = 1; iz < countZ - 1; iz++) {
      const z = -halfSpanZ + iz * spacingZ;
      placeColumn(-halfSpanX, z);
      if (countX > 1) {
        placeColumn(halfSpanX, z);
      }
    }
  }

  instanced.count = index;
  instanced.instanceMatrix.needsUpdate = true;

  return instanced;
}

export { ensureUv2Attribute };
