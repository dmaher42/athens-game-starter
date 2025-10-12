import * as THREE from "three";
import { makeTerracottaMaterial, makePlasterMaterial } from "./buildingKit.js";
import { applyTextureBudgetToObject } from "../utils/textureBudget.js";

function ensureUv2(geometry) {
  if (!geometry || geometry.getAttribute("uv2")) return geometry;
  const uv = geometry.getAttribute("uv");
  if (!uv) return geometry;
  geometry.setAttribute("uv2", uv.clone());
  return geometry;
}

export function buildHouseBlock({
  w = 6,
  d = 8,
  h = 4.5,
  roofPitch = 0.35,
  color = 0xd9d3c9,
} = {}) {
  const group = new THREE.Group();
  group.name = "ProceduralHouseBlock";

  const wallMaterial = makePlasterMaterial({ color });
  const roofMaterial = makeTerracottaMaterial({ color: 0xb35b37, roughness: 0.58 });
  roofMaterial.side = THREE.DoubleSide;

  const wallGeometry = new THREE.BoxGeometry(w, h, d);
  ensureUv2(wallGeometry);
  const walls = new THREE.Mesh(wallGeometry, wallMaterial);
  walls.position.y = h / 2;
  walls.castShadow = true;
  walls.receiveShadow = true;
  walls.userData = { ...walls.userData, noCollision: false };
  group.add(walls);

  const slopeHeight = Math.max(h * roofPitch, 0.5);
  const slopeLength = Math.sqrt((d / 2) * (d / 2) + slopeHeight * slopeHeight);
  const roofGeometry = new THREE.PlaneGeometry(w * 1.04, slopeLength, 2, 1);
  ensureUv2(roofGeometry);
  roofGeometry.rotateX(-Math.atan2(slopeHeight, d / 2));

  const roofLeft = new THREE.Mesh(roofGeometry, roofMaterial);
  roofLeft.position.set(0, h + slopeHeight / 2, 0);
  roofLeft.rotation.z = Math.PI;
  roofLeft.castShadow = true;
  roofLeft.receiveShadow = false;
  roofLeft.userData = { ...roofLeft.userData, noCollision: false };

  const roofRight = roofLeft.clone();
  roofRight.scale.z = -1;
  roofRight.rotation.z = 0;

  group.add(roofLeft);
  group.add(roofRight);

  applyTextureBudgetToObject(group, { safeMode: true });
  group.traverse?.((child) => {
    if (!child?.isMesh) return;
    child.castShadow = true;
    if (child.receiveShadow == null) child.receiveShadow = true;
    child.userData = child.userData || {};
    child.userData.noCollision = false;
  });

  return group;
}

export default { buildHouseBlock };
