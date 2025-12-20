import * as THREE from "three";
import { getSeaLevelY } from "./locations.js";

const QUAY_WIDTH = 400;
const QUAY_HEIGHT = 6;
const QUAY_DEPTH = 8;
const QUAY_Z = -50;
const QUAY_Y = 1.0;

const PIER_LENGTH = 40;
const PIER_WIDTH = 6;
const PIER_COUNT = 3;

const SEABED_OFFSET = -12;

function enableShadows(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
}

function createQuay() {
  const geometry = new THREE.BoxGeometry(QUAY_WIDTH, QUAY_HEIGHT, QUAY_DEPTH);
  const material = new THREE.MeshStandardMaterial({
    color: 0x4a4c50,
    roughness: 0.5,
    metalness: 0.1,
  });

  const quay = new THREE.Mesh(geometry, material);
  quay.position.set(0, QUAY_Y, QUAY_Z);
  quay.name = "HarborQuay";
  enableShadows(quay);
  return quay;
}

function createPier(xOffset, deckTop, seabedY) {
  const deckThickness = 0.8;
  const geometry = new THREE.BoxGeometry(PIER_WIDTH, deckThickness, PIER_LENGTH);
  const material = new THREE.MeshStandardMaterial({
    color: 0x7b5b3f,
    roughness: 0.75,
    metalness: 0.05,
  });

  const pierCenterZ = QUAY_Z - PIER_LENGTH / 2 - QUAY_DEPTH / 2;
  const pier = new THREE.Mesh(geometry, material);
  pier.position.set(xOffset, deckTop - deckThickness / 2, pierCenterZ);
  pier.name = "HarborPier";
  enableShadows(pier);

  const pilings = new THREE.Group();
  const pilingRadiusTop = 0.45;
  const pilingRadiusBottom = 0.55;
  const pilingHeight = deckTop - seabedY;
  const pilingGeometry = new THREE.CylinderGeometry(
    pilingRadiusTop,
    pilingRadiusBottom,
    pilingHeight,
    12,
  );
  const pilingMaterial = new THREE.MeshStandardMaterial({
    color: 0x5a4430,
    roughness: 0.8,
    metalness: 0.05,
  });

  const pileY = (deckTop + seabedY) / 2;
  const lateralOffset = PIER_WIDTH / 2 - 0.7;
  const longitudinalOffsets = [
    PIER_LENGTH / 2 - 1.0,
    -PIER_LENGTH / 2 + 1.0,
  ];

  for (const zOffset of longitudinalOffsets) {
    for (const xDir of [-1, 1]) {
      const pile = new THREE.Mesh(pilingGeometry, pilingMaterial);
      pile.position.set(
        xOffset + lateralOffset * xDir,
        pileY,
        pierCenterZ + zOffset,
      );
      pile.name = "HarborPiling";
      enableShadows(pile);
      pilings.add(pile);
    }
  }

  const pierGroup = new THREE.Group();
  pierGroup.add(pier);
  pierGroup.add(pilings);
  return pierGroup;
}

export function createHarbor(scene) {
  const harbor = new THREE.Group();
  harbor.name = "Harbor";

  const seaLevel = getSeaLevelY();
  const deckTop = seaLevel + 4.0;
  const seabedY = seaLevel + SEABED_OFFSET;

  const quay = createQuay();
  harbor.add(quay);

  const spacing = QUAY_WIDTH / (PIER_COUNT + 1);
  for (let i = 0; i < PIER_COUNT; i++) {
    const xOffset = -QUAY_WIDTH / 2 + spacing * (i + 1);
    const pier = createPier(xOffset, deckTop, seabedY);
    harbor.add(pier);
  }

  if (scene) {
    scene.add(harbor);
  }

  return harbor;
}

export function updateHarborLighting() {}
