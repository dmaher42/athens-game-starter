import { joinPath } from "../utils/baseUrl.js";
import {
  assert,
  deepFreeze,
  ensureArrayOfStrings,
  getRuntimeEnvironment,
  mergeDeep,
} from "./utils.js";

const DEFAULT_ASSET_CONFIG = {
  manifestProbes: ["audio/manifest.json", "models/npcs/manifest.json"],
  probeGlbCandidates: [
    "models/landmarks/poseidon_temple.glb",
    "models/landmarks/akropol.glb",
    "models/landmarks/aristotle_tomb.glb",
  ],
  quickChecks: [
    { label: "Audio Manifest", path: "audio/manifest.json" },
    { label: "Aristotle Tomb", candidateKey: "aristotle" },
    { label: "District Rules", path: "config/districts.json" },
    { label: "Water Normals", path: "textures/ground/water_normals.png" },
  ],
  candidates: {
    aristotle: [
      "models/buildings/aristotle_tomb.glb",
      "models/buildings/aristotle_tomb_in_macedonia_greece.glb",
      "models/landmarks/aristotle_tomb.glb",
      "models/landmarks/aristotle_tomb_in_macedonia_greece.glb",
      "aristotle_tomb_in_macedonia_greece.glb",
    ],
    poseidon: [
      "models/buildings/poseidon_temple.glb",
      "models/buildings/poseidon_temple_at_sounion_greece.glb",
      "models/landmarks/poseidon_temple.glb",
      "models/landmarks/poseidon_temple_at_sounion_greece.glb",
      "poseidon_temple_at_sounion_greece.glb",
    ],
    akropol: [
      "models/buildings/akropol.glb",
      "models/buildings/Akropol.glb",
      "models/landmarks/akropol.glb",
      "models/landmarks/Akropol.glb",
      "Akropol.glb",
    ],
  },
};

const ENVIRONMENT_OVERRIDES = {
  development: {
    quickChecks: [
      { label: "Audio Manifest", path: "audio/manifest.json" },
      { label: "Aristotle Tomb", candidateKey: "aristotle" },
      { label: "District Rules", path: "config/districts.json" },
      { label: "Water Normals", path: "textures/ground/water_normals.png" },
    ],
  },
};

function sanitizeCandidatePath(value) {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .replace(/^\/+/, "")
    .replace(/^public\//i, "")
    .replace(/^athens-game-starter\//i, "")
    .replace(/^\.\//, "");
}

function validateQuickChecks(config) {
  assert(Array.isArray(config.quickChecks), "quickChecks must be an array");
  for (const entry of config.quickChecks) {
    assert(entry && typeof entry === "object", "quick check entry must be object");
    assert(typeof entry.label === "string" && entry.label.trim() !== "", "quick check label required");
    assert(
      typeof entry.path === "string" || typeof entry.candidateKey === "string",
      "quick check must specify path or candidateKey",
    );
  }
}

function validateCandidates(map) {
  assert(map && typeof map === "object", "candidates must be an object map");
  for (const [key, list] of Object.entries(map)) {
    ensureArrayOfStrings(list, { allowEmpty: false, label: `candidates.${key}` });
  }
}

export function createAssetConfig(environment = getRuntimeEnvironment(), overrides = {}) {
  const envOverrides = ENVIRONMENT_OVERRIDES[environment] || {};
  const merged = mergeDeep({}, DEFAULT_ASSET_CONFIG, envOverrides, overrides);
  validateCandidates(merged.candidates);
  validateQuickChecks(merged);
  const frozen = deepFreeze(merged);
  return frozen;
}

export let assetConfig = createAssetConfig();

export function getAssetCandidates(key) {
  const list = assetConfig?.candidates?.[key];
  if (!Array.isArray(list)) return [];
  return list.map((item) => sanitizeCandidatePath(item)).filter(Boolean);
}

export function resolveAssetCandidates(key, { baseUrl, includeRelative = true } = {}) {
  const sanitized = getAssetCandidates(key);
  if (!baseUrl) {
    return includeRelative ? [...sanitized] : [];
  }
  const resolved = [];
  const seen = new Set();
  for (const entry of sanitized) {
    if (includeRelative && !seen.has(entry)) {
      seen.add(entry);
      resolved.push(entry);
    }
    const joined = joinPath(baseUrl, entry);
    if (!seen.has(joined)) {
      seen.add(joined);
      resolved.push(joined);
    }
  }
  return resolved;
}

export function resolveAssetPath(path, baseUrl) {
  const sanitized = sanitizeCandidatePath(path);
  if (!sanitized) return "";
  if (!baseUrl) return sanitized;
  return joinPath(baseUrl, sanitized);
}

export function getManifestProbes() {
  return [...(assetConfig.manifestProbes || [])];
}

export function getGlbProbeCandidates() {
  return [...(assetConfig.probeGlbCandidates || [])];
}

export function getQuickChecks() {
  return [...(assetConfig.quickChecks || [])];
}

if (import.meta.hot) {
  import.meta.hot.accept((mod) => {
    assetConfig = mod?.createAssetConfig
      ? mod.createAssetConfig(getRuntimeEnvironment())
      : createAssetConfig(getRuntimeEnvironment());
  });
}
