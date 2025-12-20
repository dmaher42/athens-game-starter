// src/world/buildingSpawner.js
import * as THREE from "three";
import { getSeaLevelY, HARBOR_WATER_EAST_LIMIT } from "./locations.js";

// Procedural generation logic only - GLB loading removed as per user request.

const ROUGHNESS_BASE_KEY = Symbol("buildingBaseRoughness");
const BUILDING_ROUGHNESS_VARIATION = 0.1;
const scratchBox = new THREE.Box3();
const scratchSize = new THREE.Vector3();
const scratchCenter = new THREE.Vector3();

const MATERIAL_BASE = {
  stone: { color: 0xded6c0, roughness: 0.9, metalness: 0.02 },
  marble: { color: 0xe7d7c1, roughness: 0.7, metalness: 0.05 },
  clay: { color: 0xc9a77c, roughness: 0.95, metalness: 0.0 },
  wood: { color: 0x8f6a4a, roughness: 0.85, metalness: 0.0 },
  roof: { color: 0x9a4631, roughness: 0.75, metalness: 0.0 },
  plaster: { color: 0xf3efe4, roughness: 0.9, metalness: 0.01 },
  paving: { color: 0xbdb6a2, roughness: 0.92, metalness: 0.02 },
  accent: { color: 0xb27c44, roughness: 0.8, metalness: 0.03 },
  trim: { color: 0xe2dac3, roughness: 0.8, metalness: 0.02 },
};

const MATERIAL_VARIANTS = {
  stone: [0xded6c0, 0xd2c2ab, 0xe2d9c6],
  marble: [0xe7d7c1, 0xf2e4cf, 0xdacad0],
  clay: [0xc9a77c, 0xc49a6d, 0xd0b18e],
  wood: [0x8f6a4a, 0x7a5a3f, 0x9e7650],
  roof: [0x9a4631, 0x8b3728, 0xaf4d2f],
  plaster: [0xf3efe4, 0xe9e2d4, 0xf8f2e7],
  paving: [0xbdb6a2, 0xa19886, 0xc8c1af],
  accent: [0xb27c44, 0xa66d38, 0xbd864d],
  trim: [0xe2dac3, 0xd7cdb5, 0xeae1cd],
};

function createMaterial(key, rng, overrides = {}) {
  const base = MATERIAL_BASE[key] || MATERIAL_BASE.stone;
  const variant = MATERIAL_VARIANTS[key];
  let color = Array.isArray(variant) && variant.length > 0 && typeof rng === "function"
    ? pick(variant, rng)
    : base.color;

  if (overrides.color !== undefined) {
      color = overrides.color;
      // We don't want to pass color in overrides to the constructor if we set it here,
      // but overrides spreads last so it handles itself.
      // However, we want to support color being passed as hex or string.
  }

  return new THREE.MeshStandardMaterial({ ...base, ...overrides, color });
}

function applyBuildingRoughnessVariance(root, rng) {
  if (!root) return;
  const random = typeof rng === "function" ? rng : Math.random;
  const delta = (random() - 0.5) * 2 * BUILDING_ROUGHNESS_VARIATION;
  if (Math.abs(delta) < 1e-4) return;

  const clamp = THREE.MathUtils.clamp;
  const updateMaterial = (material) => {
    if (!material || typeof material.roughness !== "number") return;
    if (!material.userData) material.userData = {};
    const base =
      typeof material.userData[ROUGHNESS_BASE_KEY] === "number"
        ? material.userData[ROUGHNESS_BASE_KEY]
        : material.roughness;
    material.userData[ROUGHNESS_BASE_KEY] = base;
    const next = clamp(base + delta, 0, 1);
    if (Math.abs(next - material.roughness) > 1e-4) {
      material.roughness = next;
      material.needsUpdate = true;
    }
  };

  root.traverse?.((child) => {
    if (!child?.isMesh) return;
    const { material } = child;
    if (Array.isArray(material)) {
      material.forEach(updateMaterial);
    } else {
      updateMaterial(material);
    }
  });
}

// Simple kit pieces
function makeBox(w, h, d, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}
function makeGableRoof(w, d, h = 1.2, rng, colorOverride = null) {
  const geom = new THREE.ConeGeometry(Math.max(w, d) * 0.62, h, 4);
  geom.rotateY(Math.PI / 4); // align to X/Z
  const matOpts = colorOverride ? { color: colorOverride } : {};
  const mesh = new THREE.Mesh(geom, createMaterial("roof", rng, matOpts));
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

function makeWindow(width, height, depth, rng) {
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    createMaterial("trim", rng, { metalness: 0.04, roughness: 0.85 })
  );
  frame.castShadow = true;
  const pane = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.7, height * 0.7, depth * 0.6),
    new THREE.MeshStandardMaterial({
      color: 0x6e8ca5,
      roughness: 0.05,
      metalness: 0.4,
      transparent: true,
      opacity: 0.6,
    })
  );
  pane.position.z = depth * 0.25;
  pane.userData = { ...pane.userData, isWindowPane: true };
  frame.add(pane);
  return frame;
}

function addWindowBand(group, opts) {
  const {
    count = 3,
    spacing = 2.2,
    height = 2.4,
    offsetY = 2.2,
    depth = 0.12,
    distance = 3,
    direction = "front",
    rng,
  } = opts;

  const windows = new THREE.Group();
  windows.position.y = offsetY;

  switch (direction) {
    case "back":
      windows.position.z = -distance;
      break;
    case "left":
      windows.position.x = -distance;
      windows.rotation.y = Math.PI / 2;
      break;
    case "right":
      windows.position.x = distance;
      windows.rotation.y = -Math.PI / 2;
      break;
    default:
      windows.position.z = distance;
      break;
  }

  for (let i = 0; i < count; i++) {
    const window = makeWindow(0.6, height * 0.35, depth, rng);
    window.position.x = (i - (count - 1) / 2) * spacing;
    windows.add(window);
  }

  windows.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  group.add(windows);
}

function addEntrySteps(group, width, rng) {
  const steps = new THREE.Group();
  steps.position.y = 0.15;
  const riserCount = 3 + Math.floor(rng() * 2);
  for (let i = 0; i < riserCount; i++) {
    const depth = 0.45;
    const height = 0.12;
    const tread = makeBox(width - i * 0.4, height, depth, createMaterial("stone", rng));
    tread.position.set(0, height * 0.5 + i * height, depth * (0.5 + i));
    steps.add(tread);
  }
  group.add(steps);
  return steps;
}

// Parametric “prefabs” (fast + zero textures). All return a Group.
export const Prefabs = {
  house({ w = 5, d = 7, h = 3.8, rng = Math.random, roofColor = null } = {}) {
    const g = new THREE.Group();
    g.name = "ProceduralHouse";

    const baseHeight = h * (0.65 + rng() * 0.2);
    const facadeMaterial = createMaterial(rng() < 0.35 ? "plaster" : "clay", rng);
    const base = makeBox(w, baseHeight, d, facadeMaterial);
    base.position.y = baseHeight * 0.5;
    g.add(base);

    if (rng() < 0.55) {
      const trim = makeBox(w * 1.04, 0.25, d * 1.04, createMaterial("trim", rng));
      trim.position.y = baseHeight + 0.12;
      g.add(trim);
    }

    const roofHeight = 0.9 + rng() * 0.6;
    const roof = makeGableRoof(w * (1.05 + rng() * 0.04), d * (1.05 + rng() * 0.04), roofHeight, rng, roofColor);
    roof.position.y = baseHeight + roofHeight * 0.5 + 0.1;
    g.add(roof);

    if (rng() < 0.45) {
      const annexW = w * (0.45 + rng() * 0.2);
      const annexD = d * (0.4 + rng() * 0.25);
      const annexH = baseHeight * (0.65 + rng() * 0.2);
      const annex = makeBox(annexW, annexH, annexD, createMaterial("clay", rng));
      annex.position.set((w * 0.5 - annexW * 0.5) * (rng() < 0.5 ? 1 : -1), annexH * 0.5, (d * 0.5 - annexD * 0.5) * (rng() < 0.5 ? 1 : -1));
      g.add(annex);
    }

    if (rng() < 0.6) {
      addWindowBand(g, {
        count: 3 + Math.floor(rng() * 2),
        spacing: w / (2.2 + rng()),
        distance: d * 0.5 + 0.35,
        rng,
      });
      addWindowBand(g, {
        count: 2 + Math.floor(rng() * 2),
        spacing: w / (2.5 + rng()),
        distance: d * 0.5 + 0.35,
        direction: "back",
        rng,
      });
      if (rng() < 0.5) {
        addWindowBand(g, {
          count: 2 + Math.floor(rng() * 2),
          spacing: d / (2.4 + rng()),
          distance: w * 0.5 + 0.35,
          direction: "left",
          rng,
        });
      }
    }

    if (rng() < 0.4) {
      const chimney = makeBox(0.6, roofHeight * 1.2, 0.6, createMaterial("stone", rng));
      chimney.position.set((w * 0.25) * (rng() < 0.5 ? -1 : 1), baseHeight + roofHeight, (d * 0.25) * (rng() < 0.5 ? -1 : 1));
      g.add(chimney);
    }

    const forecourt = new THREE.Mesh(
      new THREE.PlaneGeometry(w * 1.6, d * 1.8),
      createMaterial("paving", rng, { side: THREE.DoubleSide })
    );
    forecourt.rotation.x = -Math.PI / 2;
    forecourt.position.y = 0.01;
    forecourt.receiveShadow = true;
    g.add(forecourt);

    if (rng() < 0.7) {
      addEntrySteps(g, Math.min(w, d) * 0.8, rng);
    }

    return g;
  },
  courtyard({ rng = Math.random, roofColor = null, h = 4.4 } = {}) {
    const g = new THREE.Group();
    g.name = "ProceduralCourtyard";
    const scale = 0.8 + rng() * 0.3;
    // Scale h relative to 4.4 base
    const mainH = h * scale;
    const main = Prefabs.house({ w: 6 * scale, d: 7.5 * scale, h: mainH, rng, roofColor });
    g.add(main);

    const side = Prefabs.house({ w: 4.5 * scale, d: 5.2 * scale, h: mainH * 0.8, rng, roofColor });
    side.position.set(0, 0, -6 * scale);
    side.rotation.y = Math.PI / 2;
    g.add(side);

    const courtyardPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(9 * scale, 9 * scale),
      createMaterial("paving", rng, { side: THREE.DoubleSide })
    );
    courtyardPlane.rotation.x = -Math.PI / 2;
    courtyardPlane.position.set(0, 0.02, -3.4 * scale);
    courtyardPlane.receiveShadow = true;
    g.add(courtyardPlane);

    const planter = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1 * scale, 1.1 * scale, 0.6 * scale, 12),
      createMaterial("stone", rng)
    );
    planter.position.set(0, 0.3 * scale, -3.4 * scale);
    g.add(planter);

    const greenery = new THREE.Mesh(
      new THREE.SphereGeometry(1.2 * scale, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0x507a3a, roughness: 0.85 })
    );
    greenery.position.y = 1.2 * scale;
    planter.add(greenery);

    return g;
  },
  shop(opts) { return Prefabs.house({ ...opts, w: 6, d: 6, h: 3.4 }); },
  workshop(opts) { return Prefabs.house({ ...opts, w: 6, d: 8, h: 4.0 }); },
  warehouse({ w = 9, d = 12, h = 5.2, rng = Math.random, roofColor = null } = {}) {
    const g = new THREE.Group();
    g.name = "ProceduralWarehouse";
    const base = makeBox(w, h, d, createMaterial("wood", rng));
    base.position.y = h * 0.5; g.add(base);
    const roof = makeGableRoof(w * 1.05, d * 1.05, 1.4, rng, roofColor);
    roof.position.y = h + 0.7; g.add(roof);

    if (rng() < 0.5) {
      const loading = makeBox(w * 0.6, h * 0.5, 0.6, createMaterial("stone", rng));
      loading.position.set(0, h * 0.25, d * 0.5 + 0.3);
      g.add(loading);
    }

    const deck = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.2, d * 1.4), createMaterial("paving", rng));
    deck.rotation.x = -Math.PI / 2;
    deck.position.y = 0.01;
    deck.receiveShadow = true;
    g.add(deck);

    return g;
  },
  stoa({ w = 10, d = 6, h = 4.5, rng = Math.random, roofColor = null } = {}) {
    const g = new THREE.Group();
    g.name = "ProceduralStoa";
    const plinth = makeBox(w, 0.6, d, createMaterial("marble", rng));
    plinth.position.y = 0.3; g.add(plinth);
    const hall = makeBox(w * 0.96, h, d * 0.9, createMaterial("stone", rng));
    hall.position.y = h * 0.5 + 0.6; g.add(hall);
    const roof = makeGableRoof(w * 1.02, d * 1.02, 1.4, rng, roofColor);
    roof.position.y = 0.6 + h + 0.7; g.add(roof);

    const colCount = 6;
    const colGeom = new THREE.CylinderGeometry(0.35, 0.35, h, 20);
    const colMat = createMaterial("marble", rng, { metalness: 0.04 });
    for (let i = 0; i < colCount; i++) {
      const t = i / (colCount - 1);
      const x = THREE.MathUtils.lerp(-w * 0.45, w * 0.45, t);
      const columnFront = new THREE.Mesh(colGeom, colMat);
      columnFront.position.set(x, 0.6 + h * 0.5, d * 0.48);
      columnFront.castShadow = columnFront.receiveShadow = true;
      g.add(columnFront);

      const columnBack = columnFront.clone();
      columnBack.position.z = -d * 0.48;
      g.add(columnBack);
    }

    return g;
  },
  fountain() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.4, 20), createMaterial("marble", Math.random));
    base.position.y = 0.2; g.add(base);
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.5, 16), createMaterial("marble", Math.random));
    bowl.position.y = 0.7; g.add(bowl);
    return g;
  },
  plaza() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.0, 0.2, 24), createMaterial("paving", Math.random));
    base.position.y = 0.1; g.add(base);
    return g;
  },
  temple({ w = 12, d = 18, h = 6, rng = Math.random, roofColor = null } = {}) {
    const g = new THREE.Group();
    g.name = "ProceduralTemple";
    const stylobate = makeBox(w, 1.0, d, createMaterial("marble", rng));
    stylobate.position.y = 0.5; g.add(stylobate);
    const cella = makeBox(w * 0.7, h, d * 0.6, createMaterial("stone", rng));
    cella.position.y = 1.0 + h * 0.5; g.add(cella);
    const roof = makeGableRoof(w * 0.9, d * 0.9, 1.8, rng, roofColor);
    roof.position.y = 1.0 + h + 0.9; g.add(roof);

    const colGeom = new THREE.CylinderGeometry(0.45, 0.45, h * 0.9, 24);
    const colMat = createMaterial("marble", rng, { metalness: 0.03 });
    const perSide = 6;
    for (let i = 0; i < perSide; i++) {
      const t = i / (perSide - 1);
      const offsetX = THREE.MathUtils.lerp(-w * 0.45, w * 0.45, t);
      const columnFront = new THREE.Mesh(colGeom, colMat);
      columnFront.position.set(offsetX, 1.0 + (h * 0.45), d * 0.48);
      columnFront.castShadow = columnFront.receiveShadow = true;
      g.add(columnFront);

      const columnBack = columnFront.clone();
      columnBack.position.z = -d * 0.48;
      g.add(columnBack);
    }

    return g;
  },
  pier({ w = 3, d = 12, rng = Math.random } = {}) {
    const g = new THREE.Group();
    g.name = "ProceduralPier";
    const deck = makeBox(w, 0.4, d, createMaterial("wood", rng));
    deck.position.y = 0.2; g.add(deck);
    const pilingGeom = new THREE.CylinderGeometry(0.3, 0.3, 1.6, 10);
    const pilingMat = createMaterial("wood", rng, { color: 0x6d4c41 });
    const spacing = d / 4;
    for (let i = -1; i <= 1; i++) {
      for (let j = 0; j < 5; j++) {
        const pile = new THREE.Mesh(pilingGeom, pilingMat);
        pile.position.set(i * (w * 0.4), -0.6, -d * 0.5 + j * spacing);
        pile.castShadow = pile.receiveShadow = true;
        g.add(pile);
      }
    }
    return g;
  },
  market() { return Prefabs.shop({}); },
  monument() { return Prefabs.fountain(); }
};

// Map allowedTypes → prefab id (GLB fallback removed)
const TYPE_MAP = {
  house:     { prefab: "house" },
  shop:      { prefab: "shop" },
  workshop:  { prefab: "workshop" },
  warehouse: { prefab: "warehouse" },
  stoa:      { prefab: "stoa" },
  fountain:  { prefab: "fountain" },
  plaza:     { prefab: "plaza" },
  temple:    { prefab: "temple" },
  pier:      { prefab: "pier" },
  market:    { prefab: "market" },
  monument:  { prefab: "monument" },
  garden:    { prefab: "courtyard" },
};

function pick(arr, rnd) { return arr[Math.floor(rnd() * arr.length)]; }
function mulberry32(a) { return function() { let t=(a+=0x6D2B79F5); t=Math.imul(t^(t>>>15), t|1); t^=t+Math.imul(t^(t>>>7), t|61); return ((t^(t>>>14))>>>0)/4294967296; }; }

function hashCombine(a, b) {
  let h = Math.imul(a ^ b, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

function getPadSeed(pad, baseSeed = 0) {
  const lotId = pad?.userData?.lotId ?? pad?.userData?.id ?? pad?.name ?? 0;
  const pos = pad?.position || scratchCenter.setScalar(0);
  let seed = hashCombine(baseSeed >>> 0, Math.floor(pos.x * 1000));
  seed = hashCombine(seed, Math.floor(pos.z * 1000));

  if (typeof lotId === "string") {
    for (let i = 0; i < lotId.length; i++) {
      seed = hashCombine(seed, lotId.charCodeAt(i));
    }
  } else if (Number.isFinite(lotId)) {
    seed = hashCombine(seed, Math.floor(lotId));
  }

  return seed >>> 0;
}

/**
 * Replace or augment LotPads with buildings.
 * @param {THREE.Group} worldRoot - parent group (e.g., your "city" or "WorldRoot")
 * @param {object} options { seed, leavePadsVisible }
 */
export function spawnBuilding(options = {}) {
  const { district = 'residential', rng = Math.random, districtRules } = options;

  let allowed = ['house'];
  let roofColor = null;
  let courtyardChance = 0.35;

  if (districtRules) {
     // If explicit rule object provided (even if partial)
     if (Array.isArray(districtRules.allowedTypes) && districtRules.allowedTypes.length > 0) {
       allowed = districtRules.allowedTypes;
     }
     if (Array.isArray(districtRules.roofColors) && districtRules.roofColors.length > 0) {
       roofColor = pick(districtRules.roofColors, rng);
     }
     if (Number.isFinite(districtRules.courtyardChance)) {
       courtyardChance = districtRules.courtyardChance;
     }
  } else {
    // Legacy / Fallback mapping if no rule object passed
    if (district === 'sacred') {
      allowed = ['temple', 'monument', 'stoa'];
    } else if (district === 'commercial') {
      allowed = ['shop', 'market', 'fountain', 'stoa'];
    } else if (district === 'residential') {
      allowed = ['house', 'courtyard', 'workshop'];
    } else if (district === 'harbor') {
      allowed = ['warehouse', 'market', 'workshop'];
    }
  }

  const type = allowed[Math.floor(rng() * allowed.length)];
  const spawner = Prefabs[type] || Prefabs.house;

  // Override roof color in options if valid
  const spawnOpts = { rng, ...options };
  if (roofColor) spawnOpts.roofColor = roofColor;

  const building = spawner(spawnOpts);
  building.userData = { ...building.userData, district, type };
  return building;
}

export async function spawnBuildingsFromPads(worldRoot, options = {}) {
  const seed = Number.isFinite(options.seed) ? options.seed : 12345;
  const districtRules = options.districtRules || { districts: [] };
  const rng = mulberry32(seed);
  const glowRng = mulberry32(seed ^ 0x9e3779b9);
  const seaLevel = Number.isFinite(options.seaLevel)
    ? options.seaLevel
    : getSeaLevelY();

  // Find the group named "LotPads" that city.js created
  const padsGroup = worldRoot.getObjectByName("LotPads");
  if (!padsGroup) return { count: 0 };

  const buildingsGroup = new THREE.Group();
  buildingsGroup.name = "Buildings";
  worldRoot.add(buildingsGroup);

  const windowGlowRegistry = {
    candidates: [],
    ratio: THREE.MathUtils.clamp(0.1 + glowRng() * 0.1, 0.1, 0.2),
    color: 0xffbb66,
    intensity: 0.6,
    active: false,
  };
  buildingsGroup.userData = {
    ...buildingsGroup.userData,
    windowGlow: windowGlowRegistry,
  };

  let count = 0;

  for (const pad of padsGroup.children.slice()) {
    const padRng = mulberry32(getPadSeed(pad, seed) || seed);
    if (pad.blocked || pad.userData?.blocked) {
      // reserved by landmarks/plaza — skip building creation on this pad
      continue;
    }
    const districtId = pad.userData?.district || "default";

    // Find matching rule
    const rule = districtRules.districts.find(d => d.id === districtId) ||
                 districtRules.districts.find(d => d.id === 'default') || {};

    // Decide type
    const allowed = (Array.isArray(rule.allowedTypes) && rule.allowedTypes.length > 0)
        ? rule.allowedTypes
        : guessAllowedTypes(districtId);

    const typeKey = pick(allowed, rng);
    const map = TYPE_MAP[typeKey] || TYPE_MAP.house;

    // Prefab selection
    let built = null;
    let prefabKey = map.prefab;
    const courtyardChance = Number.isFinite(rule.courtyardChance) ? rule.courtyardChance : 0.35;

    if (prefabKey === "house" && rng() < courtyardChance) {
      prefabKey = "courtyard";
    }

    const prefab = Prefabs[prefabKey] || Prefabs.house;

    // Config extraction
    const roofColor = (Array.isArray(rule.roofColors) && rule.roofColors.length > 0)
        ? pick(rule.roofColors, rng)
        : null;

    // Height range
    let heightOverride = undefined;
    if (Array.isArray(rule.heightRange) && rule.heightRange.length === 2) {
       // Just pass it into options if prefabs support it,
       // or we can synthesize 'h' here.
       // Most prefabs accept 'h' as explicit height.
       const [minH, maxH] = rule.heightRange;
       if (minH > 0 && maxH >= minH) {
         heightOverride = minH + rng() * (maxH - minH);
       }
    }

    built = prefab({
        rng,
        district: districtId,
        roofColor,
        h: heightOverride
    });

    applyBuildingRoughnessVariance(built, rng);

    scratchBox.setFromObject(pad);
    scratchBox.getSize(scratchSize);
    scratchBox.getCenter(scratchCenter);

    const jitterScaleX = Number.isFinite(scratchSize.x) ? scratchSize.x * 0.15 : 0;
    const jitterScaleZ = Number.isFinite(scratchSize.z) ? scratchSize.z * 0.15 : 0;
    const jitterX = clamp((padRng() - 0.5) * 2 * jitterScaleX, -jitterScaleX, jitterScaleX);
    const jitterZ = clamp((padRng() - 0.5) * 2 * jitterScaleZ, -jitterScaleZ, jitterScaleZ);

    built.position.copy(pad.position);
    built.position.x += Number.isFinite(jitterX) ? jitterX : 0;
    built.position.z += Number.isFinite(jitterZ) ? jitterZ : 0;

    const scaleJitter = THREE.MathUtils.lerp(0.85, 1.15, padRng());
    built.scale.multiplyScalar(scaleJitter);

    if (districtId === "harbor") {
      const pierClearanceX = HARBOR_WATER_EAST_LIMIT + 3.25; // keep procedural lots off the physical pier deck
      if (Number.isFinite(pierClearanceX) && built.position.x < pierClearanceX) {
        built.position.x = pierClearanceX;
      }
    }

    if (typeKey === "pier") {
      const pier = built;
      const deckHeight = 1.4; // or whatever the project uses
      pier.position.y = seaLevel + deckHeight; // pier deck sits above current sea level.
    } else {
      built.position.y = Math.max(built.position.y, 0) + 0.01; // float slightly above ground to avoid z-fight
    }

    const explicitYaw = Number.isFinite(pad.userData?.yaw)
      ? pad.userData.yaw
      : Number.isFinite(pad.yaw)
        ? pad.yaw
        : null;
    const baseRotation = Number.isFinite(explicitYaw)
      ? explicitYaw
      : Number.isFinite(pad.userData?.baseRotation)
        ? pad.userData.baseRotation
        : pad.rotation?.y ?? 0;
    const rotationJitter = Number.isFinite(pad.userData?.rotationJitter)
      ? Math.max(0, pad.userData.rotationJitter)
      : THREE.MathUtils.degToRad(12);
    const jitter = rotationJitter > 0 ? THREE.MathUtils.lerp(-rotationJitter, rotationJitter, padRng()) : 0;
    built.rotation.y = baseRotation + jitter;
    built.userData = { ...built.userData, district: districtId, type: typeKey };
    buildingsGroup.add(built);
    count += 1;

    const candidatePanes = [];
    built.traverse((child) => {
      if (!child?.isMesh) return;
      const material = child.material;
      if (!child.userData?.isWindowPane || !material) return;
      const baseColor = material.emissive?.clone?.();
      candidatePanes.push({
        material,
        baseColor: baseColor || new THREE.Color(0x000000),
        baseIntensity:
          typeof material.emissiveIntensity === "number" ? material.emissiveIntensity : 1,
      });
    });

    if (candidatePanes.length > 0) {
      const shouldGlow = glowRng() <= windowGlowRegistry.ratio;
      windowGlowRegistry.candidates.push({
        panes: candidatePanes,
        shouldGlow,
        isActive: false,
      });
    }

    if (!options.leavePadsVisible) pad.visible = false;
  }

  if (
    windowGlowRegistry.candidates.length > 0 &&
    !windowGlowRegistry.candidates.some((candidate) => candidate.shouldGlow)
  ) {
    const index = Math.floor(glowRng() * windowGlowRegistry.candidates.length);
    const chosen = windowGlowRegistry.candidates[index] || windowGlowRegistry.candidates[0];
    if (chosen) chosen.shouldGlow = true;
  }

  return { count, group: buildingsGroup };
}

function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }

function guessAllowedTypes(districtId) {
  switch (districtId) {
    case "acropolis": return ["temple", "monument", "stoa", "plaza"];
    case "agora": return ["shop", "stoa", "fountain", "market", "house"];
    case "harbor": return ["warehouse", "pier", "market", "workshop"];
    case "residential": return ["house", "workshop", "garden", "shop"];
    default: return ["house", "shop", "workshop"];
  }
}
