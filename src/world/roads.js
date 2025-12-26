import * as THREE from "three";
import { joinPath, resolveBaseUrl } from "../utils/baseUrl.js";
import { RENDER_LAYERS } from "./renderLayers.js";

const _point = new THREE.Vector3();
const _tangent = new THREE.Vector3();
const _side = new THREE.Vector3();
const _left = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

const _roadTileKeys = new Set();
const _textureLoader = new THREE.TextureLoader();

// Cached road textures for performance
let _roadDiffuse = null;
let _roadNormal = null;
let _roadARM = null;

function loadRoadTextures() {
  if (_roadDiffuse) return; // Already loaded
  
  const baseUrl = resolveBaseUrl();
  
  // Use gravelly sand for packed earth road appearance
  _roadDiffuse = _textureLoader.load(
    joinPath(baseUrl, "textures/gravelly_sand/gravelly_sand_diff_1k.jpg"),
  );
  _roadDiffuse.wrapS = _roadDiffuse.wrapT = THREE.RepeatWrapping;
  _roadDiffuse.repeat.set(4, 1); // Stretch along road length
  _roadDiffuse.colorSpace = THREE.SRGBColorSpace;
  
  _roadNormal = _textureLoader.load(
    joinPath(baseUrl, "textures/gravelly_sand/gravelly_sand_nor_gl_1k.jpg"),
  );
  _roadNormal.wrapS = _roadNormal.wrapT = THREE.RepeatWrapping;
  _roadNormal.repeat.set(4, 1);
  _roadNormal.colorSpace = THREE.NoColorSpace;
  
  _roadARM = _textureLoader.load(
    joinPath(baseUrl, "textures/gravelly_sand/gravelly_sand_arm_1k.jpg"),
  );
  _roadARM.wrapS = _roadARM.wrapT = THREE.RepeatWrapping;
  _roadARM.repeat.set(4, 1);
  _roadARM.colorSpace = THREE.NoColorSpace;
}

function gridKey(gx, gz) {
  return `${Math.round(gx)}|${Math.round(gz)}`;
}

function resolveGridCoordinates(cell) {
  if (!cell) return null;
  if (Array.isArray(cell) && cell.length >= 2) {
    const [gx, gz] = cell;
    if (Number.isFinite(gx) && Number.isFinite(gz)) {
      return { gx, gz };
    }
    return null;
  }

  const maybeGX = Number.isFinite(cell.gx) ? cell.gx : Number.isFinite(cell.x) ? cell.x : null;
  const maybeGZ = Number.isFinite(cell.gz)
    ? cell.gz
    : Number.isFinite(cell.z)
      ? cell.z
      : Number.isFinite(cell.y)
        ? cell.y
        : null;

  if (maybeGX == null || maybeGZ == null) {
    return null;
  }

  return { gx: maybeGX, gz: maybeGZ };
}

function createIndices(segmentCount, vertexStride) {
  const indexCount = segmentCount * 6;
  const IndexArray = vertexStride * (segmentCount + 1) > 65535 ? Uint32Array : Uint16Array;
  return new IndexArray(indexCount);
}

export function createRoad(parent, points, options = {}) {
  const controlPoints = points ?? options.points;
  if (!controlPoints || controlPoints.length < 2) {
    throw new Error("createRoad requires at least two control points");
  }

  const gridCells = Array.isArray(options.gridCells)
    ? options.gridCells
    : options.gridCell
      ? [options.gridCell]
      : options.grid
        ? [options.grid]
        : options.gridPosition
          ? [options.gridPosition]
          : null;

  if (gridCells && gridCells.length > 0) {
    let hasFreshCell = false;
    for (const cell of gridCells) {
      const coords = resolveGridCoordinates(cell);
      if (!coords) continue;
      const key = gridKey(coords.gx, coords.gz);
      if (_roadTileKeys.has(key)) continue;
      _roadTileKeys.add(key);
      hasFreshCell = true;
    }
    if (!hasFreshCell) {
      return null;
    }
  }

  const width = options.width ?? 4;
  const tension = options.tension ?? 0.5;
  const closed = Boolean(options.closed);
  const halfWidth = width / 2;

  const curve = new THREE.CatmullRomCurve3(controlPoints, closed, "centripetal", tension);
  const segmentCount = options.segments ?? Math.max(16, controlPoints.length * 8);

  const vertexCount = (segmentCount + 1) * 2;
  const positions = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices = createIndices(segmentCount, 2);

  let posOffset = 0;
  let uvOffset = 0;

  // Add a small Y offset to prevent roads from being buried or z-fighting
  const yOffset = options.yOffset ?? 0.2;

  for (let i = 0; i <= segmentCount; i++) {
    const t = i / segmentCount;
    curve.getPointAt(t, _point);
    curve.getTangentAt(t, _tangent).normalize();

    _side.crossVectors(_up, _tangent);
    if (_side.lengthSq() < 1e-6) {
      _side.set(1, 0, 0);
    } else {
      _side.normalize();
    }

    _left.copy(_point).addScaledVector(_side, halfWidth);
    _right.copy(_point).addScaledVector(_side, -halfWidth);

    // Apply the Y offset here
    positions[posOffset++] = _left.x;
    positions[posOffset++] = _left.y + yOffset;
    positions[posOffset++] = _left.z;
    positions[posOffset++] = _right.x;
    positions[posOffset++] = _right.y + yOffset;
    positions[posOffset++] = _right.z;

    const v = t * (options.uvScale ?? 1);
    uvs[uvOffset++] = 0;
    uvs[uvOffset++] = v;
    uvs[uvOffset++] = 1;
    uvs[uvOffset++] = v;
  }

  let indexOffset = 0;
  for (let i = 0; i < segmentCount; i++) {
    const base = i * 2;
    indices[indexOffset++] = base;
    indices[indexOffset++] = base + 1;
    indices[indexOffset++] = base + 2;
    indices[indexOffset++] = base + 1;
    indices[indexOffset++] = base + 3;
    indices[indexOffset++] = base + 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  // Add uv2 for aoMap
  geometry.setAttribute("uv2", new THREE.BufferAttribute(new Float32Array(uvs), 2));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();

  // Load road textures
  loadRoadTextures();

  const material = new THREE.MeshStandardMaterial({
    map: _roadDiffuse,
    normalMap: _roadNormal,
    normalScale: new THREE.Vector2(0.4, 0.4),
    aoMap: _roadARM,
    roughnessMap: _roadARM,
    aoMapIntensity: 0.5,
    color: 0xb8a890, // Slight warm tint for packed earth
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
  material.polygonOffset = true;
  material.polygonOffsetFactor = -2;
  material.polygonOffsetUnits = -2;

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = options.name ?? "CityRoad";
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  mesh.userData.noCollision = options.noCollision ?? true;
  mesh.position.y += 0.015;
  mesh.renderOrder = RENDER_LAYERS.DETAIL;

  if (parent) {
    parent.add(mesh);
  }

  return mesh;
}
