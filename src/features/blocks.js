import * as THREE from "three";
import { applyTextureBudgetToObject } from "../utils/textureBudget.js";
import { ensureUv2Attribute, makeRoof } from "./buildingKit.js";

function toThreeColor(value) {
  if (value instanceof THREE.Color) {
    return value.clone();
  }
  return new THREE.Color(value);
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
  group.userData = {
    ...(group.userData || {}),
    proceduralType: "houseBlock",
    noCollision: false,
  };

  const wallColor = toThreeColor(color);
  const baseGeometry = new THREE.BoxGeometry(w, h, d);
  ensureUv2Attribute(baseGeometry);
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: wallColor,
    roughness: 0.6,
    metalness: 0.05,
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = h / 2;
  base.castShadow = true;
  base.receiveShadow = true;
  base.userData = base.userData || {};
  base.userData.noCollision = false;
  group.add(base);

  const roofHeight = Math.max(0.6, Math.abs(h) * roofPitch);
  const roofColor = wallColor.clone();
  roofColor.offsetHSL(0, 0, -0.25);
  const roof = makeRoof({
    width: w,
    depth: d,
    height: roofHeight,
    overhang: Math.min(w, d) * 0.08,
    material: new THREE.MeshStandardMaterial({
      color: roofColor,
      roughness: 0.55,
      metalness: 0.08,
    }),
  });
  roof.position.y = h;
  roof.traverse?.((child) => {
    if (!child?.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = false;
    child.userData = child.userData || {};
    child.userData.noCollision = false;
  });
  group.add(roof);

  applyTextureBudgetToObject(group, { safeMode: true });

  return group;
}
