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
  accentColor = 0x1e6fa3,
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

  const accent = toThreeColor(accentColor);
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: accent,
    roughness: 0.48,
    metalness: 0.08,
  });

  const accentHsl = { h: 0, s: 0, l: 0 };
  accent.getHSL(accentHsl);
  const shuttersColor = accent.clone();
  shuttersColor.setHSL(
    accentHsl.h,
    THREE.MathUtils.clamp(accentHsl.s * 0.95, 0, 1),
    Math.min(1, accentHsl.l + 0.08)
  );
  const shuttersMaterial = new THREE.MeshStandardMaterial({
    color: shuttersColor,
    roughness: 0.5,
    metalness: 0.1,
  });

  const doorWidth = Math.min(Math.max(w * 0.3, 0.8), 1.4);
  const doorHeight = Math.min(Math.max(h * 0.5, 1.6), Math.max(2.1, h * 0.6));
  const doorDepth = Math.min(0.2, Math.max(Math.min(w, d) * 0.06, 0.08));
  const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, doorDepth);

  const shutterWidth = Math.min(Math.max(w * 0.16, 0.35), 0.6);
  const shutterHeight = Math.min(Math.max(h * 0.38, 1.1), Math.max(1.6, h * 0.45));
  const shutterDepth = Math.min(0.16, Math.max(Math.min(w, d) * 0.05, 0.06));
  const shutterGeometry = new THREE.BoxGeometry(shutterWidth, shutterHeight, shutterDepth);

  const shutterOffsetX = doorWidth * 0.65 + shutterWidth * 0.6;
  const doorFacadeZ = d / 2 - doorDepth / 2 - 0.02;
  const shutterFacadeZ = d / 2 - shutterDepth / 2 - 0.015;
  const shutterY = Math.min(h - shutterHeight / 2 - 0.25, Math.max(doorHeight + shutterHeight * 0.25, h * 0.62));

  const addFacadeDetails = (sign) => {
    const door = new THREE.Mesh(doorGeometry, accentMaterial);
    door.position.set(0, doorHeight / 2, sign * doorFacadeZ);
    door.castShadow = true;
    door.receiveShadow = false;
    group.add(door);

    for (const signX of [-1, 1]) {
      const shutter = new THREE.Mesh(shutterGeometry, shuttersMaterial);
      shutter.position.set(signX * shutterOffsetX, shutterY, sign * shutterFacadeZ);
      shutter.castShadow = true;
      shutter.receiveShadow = false;
      group.add(shutter);
    }
  };

  addFacadeDetails(1);
  addFacadeDetails(-1);

  applyTextureBudgetToObject(group, { safeMode: true });

  return group;
}
