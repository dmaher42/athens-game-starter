import * as THREE from "three";
import { getSeaLevelY } from "./seaLevelState.js";

const DEFAULT_FLOOR_DEPTH = 80;
const DEFAULT_WORLD_RADIUS = 2000;
const FLOOR_COLOR = new THREE.Color(0x05070b);

function ensureArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function createWorldFloorCap(scene, options = {}) {
  const seaLevel = Number.isFinite(options.seaLevel)
    ? options.seaLevel
    : getSeaLevelY();
  const depth = Number.isFinite(options.depth)
    ? options.depth
    : DEFAULT_FLOOR_DEPTH;
  const radius = Math.max(options.radius ?? DEFAULT_WORLD_RADIUS, 400);

  const geometry = new THREE.CircleGeometry(radius, 64);
  const material = new THREE.MeshBasicMaterial({
    color: FLOOR_COLOR,
    side: THREE.DoubleSide,
    depthWrite: true,
    transparent: true,
    opacity: 0.95,
    fog: true,
  });

  const cap = new THREE.Mesh(geometry, material);
  cap.name = "WorldFloorCap";
  cap.rotation.x = -Math.PI / 2;
  cap.position.y = seaLevel - depth;
  cap.renderOrder = -10;

  scene?.add(cap);
  return cap;
}

export function applyKillPlane(renderer, height) {
  const seaLevel = getSeaLevelY();
  const killHeight = Number.isFinite(height) ? height : seaLevel - 60;
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -killHeight);

  if (renderer) {
    const existing = ensureArray(renderer.clippingPlanes);
    const nextPlanes = [plane, ...existing.filter((p) => p !== plane)];
    renderer.clippingPlanes = nextPlanes;
    renderer.localClippingEnabled = true;
  }

  return plane;
}
