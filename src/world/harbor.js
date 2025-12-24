import * as THREE from "three";
import { getGravellySandMaterial } from "../materials/gravellySandMaterial.js";
import {
  HARBOR_WATER_BOUNDS,
  HARBOR_WATER_CENTER,
  HARBOR_WATER_EAST_LIMIT,
  getSeaLevelY,
} from "./locations.js";

const DOCK_SECTION_LENGTH = 9.5;
const DOCK_SECTION_WIDTH = 5.8;
const DOCK_THICKNESS = 0.45;
const DOCK_POST_HEIGHT = 1.6;
const DOCK_GAP = 0.35;
const HARBOR_GROUND_HEIGHT = 2.5;
const DOCK_LIFT = 1.2; // Raise docks above water for better visibility
const waterTextureLoader = new THREE.TextureLoader();

const BOAT_STYLES = [
  { hull: 0x2f6e8d, accent: 0xe2a86a },
  { hull: 0x2a5879, accent: 0xd08b58 },
  { hull: 0x3a7aa1, accent: 0xe9b46d },
  { hull: 0x2e6f9d, accent: 0xffa040 }, // Added richer variant
  { hull: 0x247792, accent: 0xffb350 }, // Added richer variant
];

function enableShadows(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
}

function createReflectiveWaterMaterial() {
  // Use a physical material to pick up scene reflections and soft wave normals.
  const normalMap = waterTextureLoader.load(
    "textures/ground/water_normals.png",
    (tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(6, 6);
      if ("colorSpace" in tex && THREE.LinearSRGBColorSpace !== undefined) {
        tex.colorSpace = THREE.LinearSRGBColorSpace;
      }
    },
  );

  return new THREE.MeshPhysicalMaterial({
    color: "#406080",
    transparent: true,
    opacity: 0.8,
    metalness: 0.5,
    roughness: 0.3,
    envMapIntensity: 1.0,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
    normalMap,
    normalScale: new THREE.Vector2(0.45, 0.45),
  });
}

function createHarborWaterPlane(seaLevel) {
  const padding = 8;
  const width = Math.abs(HARBOR_WATER_BOUNDS.east - HARBOR_WATER_BOUNDS.west) + padding * 2;
  const depth = Math.abs(HARBOR_WATER_BOUNDS.south - HARBOR_WATER_BOUNDS.north) + padding * 2;
  const geometry = new THREE.PlaneGeometry(width, depth, 12, 12);
  const material = createReflectiveWaterMaterial();

  const water = new THREE.Mesh(geometry, material);
  water.rotation.x = -Math.PI / 2;
  water.position.set(HARBOR_WATER_CENTER.x, seaLevel, HARBOR_WATER_CENTER.z);
  water.name = "HarborLowPolyWater";
  water.userData.isWater = true;
  water.userData.seaLevel = seaLevel;
  water.receiveShadow = false;
  return water;
}

function createHarborPad(harborGroundY) {
  const paddingX = 25;
  const paddingZ = 22;
  const width =
    HARBOR_WATER_BOUNDS.east - HARBOR_WATER_BOUNDS.west + paddingX * 2;
  const depth =
    HARBOR_WATER_BOUNDS.south - HARBOR_WATER_BOUNDS.north + paddingZ * 2;
  const geometry = new THREE.PlaneGeometry(width, depth, 1, 1);
  if (geometry.attributes.uv && !geometry.attributes.uv2) {
    geometry.setAttribute(
      "uv2",
      new THREE.BufferAttribute(
        new Float32Array(geometry.attributes.uv.array),
        2,
      ),
    );
  }
  const pad = new THREE.Mesh(geometry, getGravellySandMaterial());
  pad.name = "HarborPad";
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(
    (HARBOR_WATER_BOUNDS.west + HARBOR_WATER_BOUNDS.east) * 0.5,
    harborGroundY + 0.12, // lift above terrain to avoid burying/z-fighting
    (HARBOR_WATER_BOUNDS.north + HARBOR_WATER_BOUNDS.south) * 0.5,
  );
  pad.receiveShadow = true;
  pad.renderOrder = 2;
  return pad;
}

function createDockSection(seaLevel, { length = DOCK_SECTION_LENGTH, width = DOCK_SECTION_WIDTH } = {}) {
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(length, DOCK_THICKNESS, width),
    new THREE.MeshStandardMaterial({
      color: 0xbfa48a, // Lighter, more sunlit wood
      roughness: 0.65,
      metalness: 0.04,
    }),
  );
  deck.position.y = seaLevel + DOCK_LIFT - DOCK_THICKNESS * 0.5;
  enableShadows(deck);

  const postMaterial = new THREE.MeshStandardMaterial({
    color: 0x7a6248,
    roughness: 0.78,
    metalness: 0.05,
  });
  const postGeometry = new THREE.CylinderGeometry(0.35, 0.42, DOCK_POST_HEIGHT + 0.6, 10);

  const posts = new THREE.Group();
  const postY = seaLevel + DOCK_LIFT - (DOCK_POST_HEIGHT + 0.6) * 0.5;
  const offsets = [
    [length * 0.5 - 0.9, width * 0.5 - 0.7],
    [-length * 0.5 + 0.9, width * 0.5 - 0.7],
    [length * 0.5 - 0.9, -width * 0.5 + 0.7],
    [-length * 0.5 + 0.9, -width * 0.5 + 0.7],
  ];
  for (const [x, z] of offsets) {
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.position.set(x, postY, z);
    post.userData.ignoreTerrainCollision = true;
    enableShadows(post);
    posts.add(post);
  }

  const section = new THREE.Group();
  section.name = "HarborDockSection";
  section.add(deck);
  section.add(posts);
  section.userData.length = length;
  section.userData.width = width;
  section.userData.seaLevel = seaLevel;
  return section;
}

function createPierLine(startX, z, sectionCount, seaLevel) {
  const pier = new THREE.Group();
  pier.name = "HarborPier";
  const sections = [];

  let cursorX = startX;
  for (let i = 0; i < sectionCount; i++) {
    const section = createDockSection(seaLevel);
    section.position.set(cursorX, seaLevel, z);
    pier.add(section);
    sections.push(section);
    cursorX -= section.userData.length - DOCK_GAP;
  }

  return { pier, sections };
}

function createFishingBoat({ length = 10, width = 3.4, seaLevel = 0, hull = 0x2f6bb4, accent = 0xf2a541 }) {
  const boat = new THREE.Group();
  boat.name = "HarborBoat";

  const hullMesh = new THREE.Mesh(
    new THREE.BoxGeometry(length, 1.1, width),
    new THREE.MeshStandardMaterial({ color: hull, roughness: 0.42, metalness: 0.15 }),
  );
  hullMesh.position.y = seaLevel + 0.55;
  enableShadows(hullMesh);
  boat.add(hullMesh);

  const bow = new THREE.Mesh(
    new THREE.ConeGeometry(width * 0.55, 1.6, 10),
    new THREE.MeshStandardMaterial({ color: accent, roughness: 0.46, metalness: 0.12 }),
  );
  bow.rotation.z = Math.PI;
  bow.position.set(length * 0.5 - 1.0, seaLevel + 1.15, 0);
  enableShadows(bow);
  boat.add(bow);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(length * 0.28, 1.0, width * 0.6),
    new THREE.MeshStandardMaterial({ color: 0xf7f1d0, roughness: 0.35 }),
  );
  cabin.position.set(-length * 0.18, seaLevel + 1.35, 0);
  enableShadows(cabin);
  boat.add(cabin);

  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 3.0, 8),
    new THREE.MeshStandardMaterial({ color: 0xe6dfd7, roughness: 0.4 }),
  );
  mast.position.set(-length * 0.05, seaLevel + 2.2, 0);
  enableShadows(mast);
  boat.add(mast);

  return boat;
}

function createCrateCluster() {
  const group = new THREE.Group();
  group.name = "HarborCrateCluster";
  const geometry = new THREE.BoxGeometry(1.5, 1.2, 1.1);
  const material = new THREE.MeshStandardMaterial({
    color: 0x90785c,
    roughness: 0.6,
    metalness: 0.06,
  });

  const count = 3 + Math.floor(Math.random() * 2);
  for (let i = 0; i < count; i++) {
    const crate = new THREE.Mesh(geometry, material);
    crate.position.set(THREE.MathUtils.randFloatSpread(1.6), 0.6 + i * 0.4, THREE.MathUtils.randFloatSpread(1.4));
    enableShadows(crate);
    group.add(crate);
  }
  return group;
}

function createBarrelCluster() {
  const group = new THREE.Group();
  group.name = "HarborBarrels";
  const barrelGeometry = new THREE.CylinderGeometry(0.5, 0.55, 1.1, 12);
  const barrelMaterial = new THREE.MeshStandardMaterial({
    color: 0x6d4f3a,
    roughness: 0.58,
    metalness: 0.05,
  });

  const count = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < count; i++) {
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
    barrel.position.set(THREE.MathUtils.randFloatSpread(1.4), 0.55, THREE.MathUtils.randFloatSpread(1.2));
    enableShadows(barrel);
    group.add(barrel);
  }
  return group;
}

function scatterDockProps(target, dockSections, seaLevel) {
  if (!dockSections.length) return;
  for (const section of dockSections) {
    if (Math.random() < 0.4) continue;
    const prop = Math.random() > 0.5 ? createCrateCluster() : createBarrelCluster();
    const localX = THREE.MathUtils.randFloatSpread(section.userData.length * 0.6);
    const localZ = THREE.MathUtils.randFloatSpread(section.userData.width * 0.5);
    prop.position.set(section.position.x + localX, seaLevel + DOCK_THICKNESS * 0.5 + 0.02, section.position.z + localZ);
    prop.userData.category = "harbor-prop-dock";
    target.add(prop);
  }
}

function scatterShoreProps(target, groundY) {
  const scatterBounds = {
    west: HARBOR_WATER_EAST_LIMIT + 2,
    east: HARBOR_WATER_EAST_LIMIT + 28,
    north: HARBOR_WATER_BOUNDS.north - 6,
    south: HARBOR_WATER_BOUNDS.south + 6,
  };

  for (let i = 0; i < 8; i++) {
    const prop = Math.random() > 0.5 ? createCrateCluster() : createBarrelCluster();
    const x = THREE.MathUtils.randFloat(scatterBounds.west, scatterBounds.east);
    const z = THREE.MathUtils.randFloat(scatterBounds.north, scatterBounds.south);
    prop.position.set(x, groundY, z);
    prop.userData.category = "harbor-prop-shore";
    target.add(prop);
  }
}

function createShed(size, groundY, position) {
  const shed = new THREE.Group();
  shed.name = "HarborWarehouse";

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(size.x, size.y, size.z),
    new THREE.MeshStandardMaterial({
      color: 0x7c756f, // Lighter, warmer stone/wood base
      roughness: 0.6,
      metalness: 0.1,
    }),
  );
  base.position.y = size.y * 0.5;
  enableShadows(base);
  shed.add(base);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(size.x + 0.6, 0.9, size.z + 0.6),
    new THREE.MeshStandardMaterial({
      color: 0xc45c3d, // Saturated reddish terracotta
      roughness: 0.5,
      metalness: 0.05,
    }),
  );
  roof.position.y = size.y + 0.45;
  enableShadows(roof);
  shed.add(roof);

  shed.position.copy(position);
  shed.position.y = groundY;
  return shed;
}

export function createHarbor(scene) {
  const harbor = new THREE.Group();
  harbor.name = "Harbor";

  const seaLevel = getSeaLevelY();
  const harborGroundY = seaLevel + HARBOR_GROUND_HEIGHT;

  const harborPad = createHarborPad(harborGroundY);
  harbor.add(harborPad);

  const waterPlane = createHarborWaterPlane(seaLevel);
  harbor.add(waterPlane);

  const pierStartX = HARBOR_WATER_EAST_LIMIT + 1.1;
  const pierRows = [
    { z: HARBOR_WATER_CENTER.z - 18, sections: 4 },
    { z: HARBOR_WATER_CENTER.z - 2, sections: 5 },
    { z: HARBOR_WATER_CENTER.z + 16, sections: 4 },
  ];

  const piersGroup = new THREE.Group();
  piersGroup.name = "HarborPiers";
  const allSections = [];
  for (const row of pierRows) {
    const { pier, sections } = createPierLine(pierStartX, row.z, row.sections, seaLevel);
    allSections.push(...sections);
    piersGroup.add(pier);
  }
  harbor.add(piersGroup);

  const shorelineGroup = new THREE.Group();
  shorelineGroup.name = "HarborShorelineDressing";

  const dressingZ = [
    HARBOR_WATER_CENTER.z - 18,
    HARBOR_WATER_CENTER.z - 2,
    HARBOR_WATER_CENTER.z + 16,
  ];

  for (let i = 0; i < dressingZ.length; i++) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.28, 2.4, 10),
      new THREE.MeshStandardMaterial({ color: 0x7a6248, roughness: 0.78 }),
    );
    post.position.set(
      HARBOR_WATER_EAST_LIMIT + 4.0,
      harborGroundY + 1.2,
      dressingZ[i],
    );
    shorelineGroup.add(post);
  }

  harbor.add(shorelineGroup);

  const boatsGroup = new THREE.Group();
  boatsGroup.name = "HarborBoats";
  let boatStyleIndex = 0;
  for (const row of pierRows) {
    const style = BOAT_STYLES[boatStyleIndex % BOAT_STYLES.length];
    boatStyleIndex++;
    const boat = createFishingBoat({
      length: 11 + Math.random() * 2,
      width: 3.2 + Math.random() * 0.8,
      seaLevel,
      hull: style.hull,
      accent: style.accent,
    });
    const moorOffset = DOCK_SECTION_WIDTH * 0.5 + 1.2;
    boat.position.set(pierStartX - DOCK_SECTION_LENGTH * 1.6, seaLevel, row.z + (Math.random() > 0.5 ? moorOffset : -moorOffset));
    boat.userData.category = "harbor-boat";
    boatsGroup.add(boat);
  }
  harbor.add(boatsGroup);

  const propsGroup = new THREE.Group();
  propsGroup.name = "HarborProps";
  scatterDockProps(propsGroup, allSections, seaLevel);
  scatterShoreProps(propsGroup, harborGroundY);
  harbor.add(propsGroup);

  const sheds = [
    createShed(new THREE.Vector3(18, 5.2, 12), harborGroundY, new THREE.Vector3(HARBOR_WATER_EAST_LIMIT + 12, 0, HARBOR_WATER_CENTER.z - 10)),
    createShed(new THREE.Vector3(22, 6, 14), harborGroundY, new THREE.Vector3(HARBOR_WATER_EAST_LIMIT + 24, 0, HARBOR_WATER_CENTER.z + 8)),
  ];
  sheds.forEach((shed) => harbor.add(shed));

  if (scene) {
    scene.add(harbor);
  }

  return harbor;
}

export function updateHarborLighting(harbor, nightFactor = 0) {
  if (!harbor) return;

  const clampedNight = THREE.MathUtils.clamp(nightFactor ?? 0, 0, 1);
  const daylight = 1 - clampedNight;
  const warmSunlight = new THREE.Color("#e3b07a");
  const coolAmbient = new THREE.Color("#d2d9e4");

  harbor.traverse((child) => {
    if (!child.isMesh) return;
    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    for (const material of materials) {
      if (!material || !material.isMaterial) continue;

      material.userData = material.userData || {};

      if (material.color && !material.userData.baseColor) {
        material.userData.baseColor = material.color.clone();
      }
      if (
        material.envMapIntensity !== undefined &&
        material.userData.baseEnvMapIntensity === undefined
      ) {
        material.userData.baseEnvMapIntensity = material.envMapIntensity ?? 1;
      }
      if (
        material.roughness !== undefined &&
        material.userData.baseRoughness === undefined
      ) {
        material.userData.baseRoughness = material.roughness;
      }

      if (material.color && material.userData.baseColor) {
        const cooled = material.userData.baseColor
          .clone()
          .lerp(coolAmbient, clampedNight * 0.2);
        material.color.copy(cooled.lerp(warmSunlight, daylight * 0.18));
      }

      if (material.envMapIntensity !== undefined) {
        const baseEnv = material.userData.baseEnvMapIntensity ?? 1;
        const dayReflect = baseEnv * 1.25;
        const nightReflect = baseEnv * 0.32;
        material.envMapIntensity = THREE.MathUtils.lerp(
          dayReflect,
          nightReflect,
          clampedNight,
        );
      }

      if (material.roughness !== undefined) {
        const baseRoughness = material.userData.baseRoughness ?? material.roughness;
        const dayRoughness = Math.max(0.02, baseRoughness - 0.08 * daylight);
        const nightRoughness = Math.min(1, baseRoughness + 0.1 * clampedNight);
        material.roughness = THREE.MathUtils.lerp(
          dayRoughness,
          nightRoughness,
          clampedNight,
        );
      }
    }
  });
}
