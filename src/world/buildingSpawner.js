// src/world/buildingSpawner.js
import * as THREE from "three";
import { resolveBaseUrl, joinPath } from "../utils/baseUrl.js";

const glbAvailability = new Map();
const onceFlags = new Set();

function once(key, fn) {
  if (onceFlags.has(key)) return;
  onceFlags.add(key);
  try {
    fn();
  } catch (error) {
    console.warn("[buildingSpawner] once handler failed", error);
  }
}

async function headOk(url) {
  if (!url) return false;
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (!res.ok) return false;
    const contentType = res.headers.get("content-type") || "";
    return !contentType.toLowerCase().includes("text/html");
  } catch {
    return false;
  }
}

async function ensureBuildingGlb(relativePath, typeKey, baseUrl) {
  const key = relativePath;
  if (glbAvailability.has(key)) {
    return glbAvailability.get(key);
  }

  const canonical = joinPath(baseUrl, relativePath);
  const exists = await headOk(canonical);
  glbAvailability.set(key, exists);

  return exists;
}

// Optional: if your repo already has a safe GLB loader, plug it here.
// Otherwise this shim returns null so we fall back to parametric meshes.
async function tryLoadGLB(urls) {
  const candidates = Array.isArray(urls)
    ? urls.filter((value) => typeof value === "string" && value.length > 0)
    : typeof urls === "string" && urls.length > 0
    ? [urls]
    : [];

  if (!candidates.length) return null;

  let loader = null;
  const baseUrl = resolveBaseUrl();
  for (const url of candidates) {
    try {
      if (!loader) {
        // Lazy import to avoid bundling issues if loader doesn't exist
        const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
        loader = new GLTFLoader();
      }

      const resolved = /^(?:[a-z]+:)?\/\//i.test(url)
        ? url
        : joinPath(baseUrl, url.replace(/^\/+/, ""));

      const glb = await new Promise((resolve, reject) => {
        loader.load(resolved, (gltf) => resolve(gltf.scene || gltf.scenes?.[0] || null), undefined, reject);
      });

      if (glb) {
        return glb;
      }
    } catch (error) {
      if (typeof console !== "undefined" && console.debug) {
        console.debug("[buildingSpawner] Failed to load GLB candidate", url, error);
      }
    }
  }

  return null;
}

// Minimal, safe materials (no maps) to avoid texture-unit overflow on Chromebook
const MAT = {
  stone: new THREE.MeshStandardMaterial({ color: 0xded6c0, roughness: 0.9, metalness: 0.02 }),
  marble: new THREE.MeshStandardMaterial({ color: 0xe7d7c1, roughness: 0.7, metalness: 0.05 }),
  clay: new THREE.MeshStandardMaterial({ color: 0xc9a77c, roughness: 0.95, metalness: 0.0 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x8f6a4a, roughness: 0.85, metalness: 0.0 }),
  roof: new THREE.MeshStandardMaterial({ color: 0x9a4631, roughness: 0.75, metalness: 0.0 }),
};

// Simple kit pieces
function makeBox(w, h, d, material) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.castShadow = m.receiveShadow = true;
  return m;
}
function makeGableRoof(w, d, h = 1.2) {
  const geom = new THREE.ConeGeometry(Math.max(w, d) * 0.62, h, 4);
  geom.rotateY(Math.PI / 4); // align to X/Z
  const mesh = new THREE.Mesh(geom, MAT.roof);
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

// Parametric “prefabs” (fast + zero textures). All return a Group.
const Prefabs = {
  house({ w = 5, d = 7, h = 3.8 } = {}) {
    const g = new THREE.Group();
    const base = makeBox(w, h, d, MAT.clay);
    base.position.y = h * 0.5;
    g.add(base);
    const roof = makeGableRoof(w * 1.02, d * 1.02, 1.0 + 0.3 * Math.random());
    roof.position.y = h + roof.geometry.parameters.height * 0.5;
    g.add(roof);
    return g;
  },
  shop(opts) { return Prefabs.house({ ...opts, w: 6, d: 6, h: 3.4 }); },
  workshop(opts) { return Prefabs.house({ ...opts, w: 6, d: 8, h: 4.0 }); },
  warehouse({ w = 9, d = 12, h = 5.2 } = {}) {
    const g = new THREE.Group();
    const base = makeBox(w, h, d, MAT.wood);
    base.position.y = h * 0.5; g.add(base);
    const roof = makeGableRoof(w * 1.05, d * 1.05, 1.4);
    roof.position.y = h + 0.7; g.add(roof);
    return g;
  },
  stoa({ w = 10, d = 6, h = 4.5 } = {}) {
    const g = new THREE.Group();
    const plinth = makeBox(w, 0.6, d, MAT.stone); plinth.position.y = 0.3; g.add(plinth);
    const hall = makeBox(w * 0.96, h, d * 0.9, MAT.stone); hall.position.y = h * 0.5 + 0.6; g.add(hall);
    const roof = makeGableRoof(w * 1.02, d * 1.02, 1.4); roof.position.y = 0.6 + h + 0.7; g.add(roof);
    return g;
  },
  fountain() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.4, 20), MAT.marble);
    base.position.y = 0.2; g.add(base);
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.5, 16), MAT.marble);
    bowl.position.y = 0.7; g.add(bowl);
    return g;
  },
  plaza() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.0, 0.2, 24), MAT.stone);
    base.position.y = 0.1; g.add(base);
    return g;
  },
  temple({ w = 12, d = 18, h = 6 } = {}) {
    const g = new THREE.Group();
    const stylobate = makeBox(w, 1.0, d, MAT.marble); stylobate.position.y = 0.5; g.add(stylobate);
    const cella = makeBox(w * 0.7, h, d * 0.6, MAT.marble); cella.position.y = 1.0 + h * 0.5; g.add(cella);
    const roof = makeGableRoof(w * 0.9, d * 0.9, 1.8); roof.position.y = 1.0 + h + 0.9; g.add(roof);
    return g;
  },
  pier({ w = 3, d = 12 } = {}) {
    const g = new THREE.Group();
    const deck = makeBox(w, 0.4, d, MAT.wood); deck.position.y = 0.2; g.add(deck);
    return g;
  },
  market() { return Prefabs.shop({}); },
  monument() { return Prefabs.fountain(); }
};

// Map allowedTypes → prefab id and optional GLB path
const TYPE_MAP = {
  house:     { prefab: "house",     glb: "models/buildings/house.glb" },
  shop:      { prefab: "shop",      glb: "models/buildings/shop.glb" },
  workshop:  { prefab: "workshop",  glb: "models/buildings/workshop.glb" },
  warehouse: { prefab: "warehouse", glb: "models/buildings/warehouse.glb" },
  stoa:      { prefab: "stoa",      glb: "models/landmarks/stoa_attalos.glb" },
  fountain:  { prefab: "fountain",  glb: "models/props/fountain.glb" },
  plaza:     { prefab: "plaza",     glb: "models/props/plaza.glb" },
  temple:    { prefab: "temple",    glb: "models/landmarks/temple_hephaestus.glb" },
  pier:      { prefab: "pier",      glb: "models/harbor/pier.glb" },
  market:    { prefab: "market",    glb: "models/props/market_stall.glb" },
  monument:  { prefab: "monument",  glb: "models/landmarks/monument.glb" },
};

function pick(arr, rnd) { return arr[Math.floor(rnd() * arr.length)]; }
function mulberry32(a) { return function() { let t=(a+=0x6D2B79F5); t=Math.imul(t^(t>>>15), t|1); t^=t+Math.imul(t^(t>>>7), t|61); return ((t^(t>>>14))>>>0)/4294967296; }; }

/**
 * Replace or augment LotPads with buildings.
 * @param {THREE.Group} worldRoot - parent group (e.g., your "city" or "WorldRoot")
 * @param {object} options { seed, leavePadsVisible }
 */
export async function spawnBuildingsFromPads(worldRoot, options = {}) {
  const seed = Number.isFinite(options.seed) ? options.seed : 12345;
  const rng = mulberry32(seed);

  // Find the group named "LotPads" that city.js created
  const padsGroup = worldRoot.getObjectByName("LotPads");
  if (!padsGroup) return { count: 0 };

  const buildingsGroup = new THREE.Group();
  buildingsGroup.name = "Buildings";
  worldRoot.add(buildingsGroup);

  let count = 0;

  for (const pad of padsGroup.children.slice()) {
    const districtId = pad.userData?.district || "default";
    // Decide a type — ideally you stashed allowedTypes on the pad; if not, pick by districtId heuristic
    const allowedGuess = guessAllowedTypes(districtId);
    const typeKey = pick(allowedGuess, rng);
    const map = TYPE_MAP[typeKey] || TYPE_MAP.house;

    // 1) Try GLB (if present in public/…)
    let built = null;
    if (map.glb) {
      const baseUrl = resolveBaseUrl();
      const trimmedGlb = typeof map.glb === "string" ? map.glb.trim() : "";

      if (trimmedGlb.length > 0) {
        const relativePath = trimmedGlb.replace(/^\/+/, "");
        const candidateUrls = Array.from(
          new Set(
            [joinPath(baseUrl, relativePath), relativePath].filter(Boolean)
          )
        );

        if (relativePath.startsWith("models/buildings/")) {
          const exists = await ensureBuildingGlb(relativePath, typeKey, baseUrl);
          if (!exists) {
            once("buildings-missing", () =>
              console.warn("[buildings] Skipping prototypes (no GLBs found under models/buildings/)")
            );
            if (!options.leavePadsVisible) pad.visible = false;
            continue;
          }
        }

        const glb = await tryLoadGLB(candidateUrls);
        if (glb) {
          built = glb;
          // Normalize scale so GLBs feel consistent
          const box = new THREE.Box3().setFromObject(glb);
          const size = new THREE.Vector3(); box.getSize(size);
          const targetY = clamp(size.y, 3.5, 8.0);
          const scale = targetY > 0 ? (targetY / size.y) : 1.0;
          glb.scale.setScalar(scale);
        }
      }
    }

    // 2) Fallback to a parametric prefab (always works)
    if (!built) {
      const prefab = Prefabs[map.prefab] || Prefabs.house;
      built = prefab({});
    }

    built.position.copy(pad.position);
    built.position.y = Math.max(built.position.y, 0) + 0.01; // float slightly above ground to avoid z-fight
    built.rotation.y = pad.rotation.y + (rng() - 0.5) * 0.5;
    built.userData = { ...built.userData, district: districtId, type: typeKey };
    buildingsGroup.add(built);
    count += 1;

    if (!options.leavePadsVisible) pad.visible = false;
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
