import * as THREE from "three";
import { getSeaLevelY } from "./locations.js";

const QUAY_WIDTH = 260;
const QUAY_THICKNESS = 6.5;
const QUAY_DEPTH = 18;
const QUAY_Z = -46;

const PROMENADE_DEPTH = 12;
const PROMENADE_OFFSET = QUAY_Z + QUAY_DEPTH * 0.5 + PROMENADE_DEPTH * 0.5;

const PIER_DEFAULT_LENGTH = 70;
const PIER_DEFAULT_WIDTH = 7.5;

const SEABED_OFFSET = -12.5;

const PIER_CONFIGS = [
  { x: -112, length: 72, width: 8 },
  { x: -64, length: 68, width: 7.5 },
  { x: -14, length: 62, width: 7 },
  { x: 36, length: 70, width: 7.5 },
  { x: 86, length: 76, width: 8 },
];

function enableShadows(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
}

function createBollards(width, deckTop) {
  const bollardGroup = new THREE.Group();
  const bollardGeometry = new THREE.CylinderGeometry(0.45, 0.55, 0.8, 12);
  const bollardMaterial = new THREE.MeshStandardMaterial({
    color: 0x2f2f2f,
    metalness: 0.3,
    roughness: 0.4,
  });

  const step = 16;
  const startX = -width * 0.5 + 6;
  const endX = width * 0.5 - 6;
  for (let x = startX; x <= endX; x += step) {
    const bollard = new THREE.Mesh(bollardGeometry, bollardMaterial);
    bollard.position.set(x, deckTop + 0.4, QUAY_Z - QUAY_DEPTH * 0.5 + 0.6);
    bollard.name = "HarborBollard";
    enableShadows(bollard);
    bollardGroup.add(bollard);
  }

  return bollardGroup;
}

function createQuay(deckTop) {
  const geometry = new THREE.BoxGeometry(QUAY_WIDTH, QUAY_THICKNESS, QUAY_DEPTH);
  const material = new THREE.MeshStandardMaterial({
    color: 0x6f6d69,
    roughness: 0.65,
    metalness: 0.1,
  });

  const quay = new THREE.Mesh(geometry, material);
  quay.position.set(0, deckTop - QUAY_THICKNESS * 0.5, QUAY_Z);
  quay.name = "HarborQuay";
  enableShadows(quay);

  const edging = new THREE.Mesh(
    new THREE.BoxGeometry(QUAY_WIDTH + 6, 0.8, 2.6),
    new THREE.MeshStandardMaterial({ color: 0x49433d, roughness: 0.55 }),
  );
  edging.position.set(0, deckTop + 0.4, QUAY_Z - QUAY_DEPTH * 0.5 + 1.4);
  edging.name = "HarborQuayEdge";
  enableShadows(edging);
  quay.add(edging);

  const bollards = createBollards(QUAY_WIDTH, deckTop);
  quay.add(bollards);
  return quay;
}

function createPier(xOffset, deckTop, seabedY, { length, width } = {}) {
  const deckThickness = 0.8;
  const pierWidth = width ?? PIER_DEFAULT_WIDTH;
  const pierLength = length ?? PIER_DEFAULT_LENGTH;

  const geometry = new THREE.BoxGeometry(pierWidth, deckThickness, pierLength);
  const material = new THREE.MeshStandardMaterial({
    color: 0x7b5b3f,
    roughness: 0.75,
    metalness: 0.05,
  });

  const pierCenterZ = QUAY_Z - pierLength / 2 - QUAY_DEPTH / 2;
  const pier = new THREE.Mesh(geometry, material);
  pier.position.set(xOffset, deckTop - deckThickness / 2, pierCenterZ);
  pier.name = "HarborPier";
  enableShadows(pier);

  const pilings = new THREE.Group();
  const pilingRadiusTop = 0.45;
  const pilingRadiusBottom = 0.55;
  const pilingHeight = deckTop - seabedY + 0.2;
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
  const lateralOffset = pierWidth / 2 - 0.7;
  const longitudinalOffsets = [
    pierLength / 2 - 1.4,
    -pierLength / 2 + 1.4,
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

function createPromenade(deckTop) {
  const promenade = new THREE.Mesh(
    new THREE.BoxGeometry(QUAY_WIDTH * 1.05, 0.45, PROMENADE_DEPTH),
    new THREE.MeshStandardMaterial({
      color: 0x9a8f7a,
      roughness: 0.7,
      metalness: 0.05,
    }),
  );
  promenade.position.set(0, deckTop + 0.15, PROMENADE_OFFSET);
  promenade.name = "HarborPromenade";
  enableShadows(promenade);
  return promenade;
}

function createShed(size, deckTop, position) {
  const shed = new THREE.Group();
  shed.name = "HarborShed";

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(size.x, size.y, size.z),
    new THREE.MeshStandardMaterial({ color: 0x575046, roughness: 0.65 }),
  );
  base.position.y = size.y * 0.5;
  enableShadows(base);
  shed.add(base);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(size.x + 0.6, 0.9, size.z + 0.6),
    new THREE.MeshStandardMaterial({ color: 0x979797, roughness: 0.4, metalness: 0.2 }),
  );
  roof.position.y = size.y + 0.45;
  enableShadows(roof);
  shed.add(roof);

  shed.position.copy(position);
  shed.position.y = deckTop;
  return shed;
}

function createCrates(deckTop, position) {
  const group = new THREE.Group();
  group.name = "HarborCargo";

  const crateGeometry = new THREE.BoxGeometry(1.6, 1.4, 1.2);
  const crateMaterial = new THREE.MeshStandardMaterial({ color: 0x8a6a42, roughness: 0.7 });
  for (let i = 0; i < 4; i++) {
    const crate = new THREE.Mesh(crateGeometry, crateMaterial);
    crate.position.set(THREE.MathUtils.randFloatSpread(2.5), 0.7 + 0.8 * i * 0.25, THREE.MathUtils.randFloatSpread(2.0));
    enableShadows(crate);
    group.add(crate);
  }

  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.55, 1.4, 12),
    new THREE.MeshStandardMaterial({ color: 0x5e3c2b, roughness: 0.65 }),
  );
  barrel.position.set(1.6, 0.7, 0.2);
  enableShadows(barrel);
  group.add(barrel);

  group.position.copy(position);
  group.position.y = deckTop;
  return group;
}

function createBoat({ length = 12, width = 4, color = 0xf2efe5, accent = 0xc85a2e, seaLevel = 0 }) {
  const boat = new THREE.Group();
  boat.name = "HarborBoat";

  const hull = new THREE.Mesh(
    new THREE.BoxGeometry(length, 1.6, width),
    new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.1 }),
  );
  hull.position.y = 0.8;
  enableShadows(hull);
  boat.add(hull);

  const bow = new THREE.Mesh(
    new THREE.ConeGeometry(width * 0.55, 2.4, 12),
    new THREE.MeshStandardMaterial({ color: accent, roughness: 0.5, metalness: 0.1 }),
  );
  bow.rotation.z = Math.PI;
  bow.position.set(length * 0.5 - 1.2, 1.4, 0);
  enableShadows(bow);
  boat.add(bow);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(length * 0.28, 1.4, width * 0.6),
    new THREE.MeshStandardMaterial({ color: 0xf7f1d0, roughness: 0.3 }),
  );
  cabin.position.set(-length * 0.2, 1.9, 0);
  enableShadows(cabin);
  boat.add(cabin);

  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 4.5, 8),
    new THREE.MeshStandardMaterial({ color: 0xe6dfd7, roughness: 0.4 }),
  );
  mast.position.set(-length * 0.05, 3, 0);
  enableShadows(mast);
  boat.add(mast);

  boat.position.y = seaLevel + 0.4;
  return boat;
}

export function createHarbor(scene) {
  const harbor = new THREE.Group();
  harbor.name = "Harbor";

  const seaLevel = getSeaLevelY();
  const deckTop = seaLevel + 3.6;
  const seabedY = seaLevel + SEABED_OFFSET;

  const quay = createQuay(deckTop);
  harbor.add(quay);

  const promenade = createPromenade(deckTop);
  harbor.add(promenade);

  for (const config of PIER_CONFIGS) {
    const pier = createPier(config.x, deckTop, seabedY, config);
    harbor.add(pier);
  }

  const smallFingerPier = createPier(132, deckTop - 0.2, seabedY, {
    length: 34,
    width: 4.5,
  });
  smallFingerPier.position.z += 10;
  harbor.add(smallFingerPier);

  const sheds = [
    createShed(new THREE.Vector3(22, 6, 14), deckTop, new THREE.Vector3(-68, 0, QUAY_Z + 6)),
    createShed(new THREE.Vector3(18, 5.2, 12), deckTop, new THREE.Vector3(50, 0, QUAY_Z + 8)),
  ];
  sheds.forEach((shed) => harbor.add(shed));

  const cargoPiles = [
    createCrates(deckTop, new THREE.Vector3(-110, 0, QUAY_Z + 2)),
    createCrates(deckTop, new THREE.Vector3(6, 0, QUAY_Z + 10)),
    createCrates(deckTop, new THREE.Vector3(92, 0, PROMENADE_OFFSET + 2)),
  ];
  cargoPiles.forEach((cargo) => harbor.add(cargo));

  const boats = [
    { position: new THREE.Vector3(-112, seaLevel, QUAY_Z - 52), length: 13, width: 4.4 },
    { position: new THREE.Vector3(-62, seaLevel, QUAY_Z - 60), length: 12, width: 3.8 },
    { position: new THREE.Vector3(32, seaLevel, QUAY_Z - 55), length: 14, width: 4.6 },
    { position: new THREE.Vector3(130, seaLevel, QUAY_Z - 18), length: 10, width: 3.3 },
  ];

  for (const boatConfig of boats) {
    const boat = createBoat({
      length: boatConfig.length,
      width: boatConfig.width,
      seaLevel,
    });
    boat.position.x = boatConfig.position.x;
    boat.position.z = boatConfig.position.z;
    harbor.add(boat);
  }

  if (scene) {
    scene.add(harbor);
  }

  return harbor;
}

export function updateHarborLighting() {}
