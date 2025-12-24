import {
  resolveBaseUrl,
  joinPath,
  REPO_BASE_PATH,
} from "../utils/baseUrl.js";
import { athensLayoutConfig } from "../config/athensLayoutConfig.js";

// Helper requested by user to simplify path resolution
const baseUrl = (path) => joinPath(resolveBaseUrl(), path);

export function buildDistrictRuleUrlCandidates(resolvedBase) {
  const urls = new Set();
  const push = (value) => {
    if (!value || urls.has(value)) return;
    urls.add(value);
  };
  const pushJoined = (base, rel) => {
    if (!base) return;
    push(joinPath(base, rel));
  };

  // Priority #1: Ensure the repo base (resolvedBase) is used first
  push(baseUrl("config/districts.json"));
  pushJoined(resolvedBase, "config/districts.json");

  if (REPO_BASE_PATH && (!resolvedBase || !resolvedBase.includes(REPO_BASE_PATH))) {
    pushJoined(REPO_BASE_PATH, "config/districts.json");
  }

  if (typeof window !== "undefined" && window.location) {
    const { pathname, hostname } = window.location;

    if (REPO_BASE_PATH && pathname && pathname.includes(REPO_BASE_PATH)) {
      const idx = pathname.indexOf(REPO_BASE_PATH);
      const repoBase = pathname.slice(0, idx + REPO_BASE_PATH.length);
      pushJoined(repoBase, "config/districts.json");
    }

    const isLocalhost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "" ||
      hostname === "[::1]";

    if (isLocalhost) {
      push("/public/config/districts.json");
    }
  } else {
    push("/public/config/districts.json");
  }

  return Array.from(urls);
}

/** Load district rules from /config/districts.json with safe fallbacks. */
export async function loadDistrictRules(baseUrlStr = "") {
  const resolvedBase =
    typeof baseUrlStr === "string" && baseUrlStr.length > 0 ? baseUrlStr : resolveBaseUrl();

  const tried = [];
  for (const url of buildDistrictRuleUrlCandidates(resolvedBase)) {
    tried.push(url);
    try {
      const res = await fetch(url, { method: "GET", cache: "no-cache" });
      if (res.ok) {
        const json = await res.json();
        return normalizeRules(json);
      }
    } catch (err) {
      // Ignore individual fetch failures and continue trying other fallbacks.
      if (typeof console !== "undefined" && typeof console.debug === "function") {
        console.debug("[district-rules] fetch failed", { url, err });
      }
    }
  }
  if (typeof console !== "undefined" && typeof console.warn === "function") {
    console.warn("[district-rules] failed to load", tried);
  }
  const fallbackRules = athensLayoutConfig?.districtRules
    ? JSON.parse(JSON.stringify(athensLayoutConfig.districtRules))
    : null;
  if (fallbackRules) {
    return normalizeRules(fallbackRules);
  }
  // Minimal fallback (keeps city rendering even if file missing)
  return normalizeRules({
    seed: 1337,
    districts: [
      {
        id: "default",
        heightRange: [-999, 999],
        buildingDensity: "medium",
        minSeparation: 24,
        allowedTypes: ["house", "shop"],
        road: { width: 3.2, color: 0x333333 },
      },
    ],
    densitySpacingMeters: { high: 14, medium: 24, low: 32 },
    maxSlopeDeltaPerLot: 2.0,
    roadSetbackMeters: 4,
  });
}

function normalizeRules(cfg) {
  const toColor = (v) => (typeof v === "number" ? v : 0x333333);
  const defaultSpacing = { high: 14, medium: 20, low: 28 };
  for (const d of cfg.districts || []) {
    d.heightRange = Array.isArray(d.heightRange) ? d.heightRange : [-999, 999];
    d.allowedTypes = Array.isArray(d.allowedTypes) ? d.allowedTypes : ["house"];
    d.minSeparation = Number.isFinite(d.minSeparation) ? d.minSeparation : 0;
    d.road = d.road || {};
    d.road.width = Number.isFinite(d.road.width) ? d.road.width : 3.2;
    d.road.color = toColor(d.road.color);
    d.roofColors = Array.isArray(d.roofColors) ? d.roofColors : [];
    d.courtyardChance = Number.isFinite(d.courtyardChance) ? d.courtyardChance : 0;
  }
  const spacingSource = cfg.densitySpacingMeters || cfg.densityToLotSpacing || {};
  cfg.densitySpacingMeters = {
    high: Number.isFinite(spacingSource.high) ? spacingSource.high : defaultSpacing.high,
    medium: Number.isFinite(spacingSource.medium) ? spacingSource.medium : defaultSpacing.medium,
    low: Number.isFinite(spacingSource.low) ? spacingSource.low : defaultSpacing.low,
  };
  cfg.densityToLotSpacing = cfg.densitySpacingMeters;
  cfg.maxSlopeDeltaPerLot = Number.isFinite(cfg.maxSlopeDeltaPerLot) ? cfg.maxSlopeDeltaPerLot : 2.0;
  cfg.roadSetbackMeters = Number.isFinite(cfg.roadSetbackMeters) ? cfg.roadSetbackMeters : 4;
  return cfg;
}

/** Pick a district for a given world (x,z) by sampling height from terrain. */
export function resolveDistrictAt(terrain, rules, x, z, fallback = "default") {
  const getH = terrain?.userData?.getHeightAt;
  const h = typeof getH === "function" ? getH(x, z) : null;
  if (!Number.isFinite(h)) return rules.districts.find(d => d.id === fallback) || rules.districts[0];

  for (const d of rules.districts) {
    const [minH, maxH] = d.heightRange;
    if (h >= minH && h <= maxH) return d;
  }
  return rules.districts.find(d => d.id === fallback) || rules.districts[0];
}

/** Convert density → nominal lot spacing (in world units). */
export function spacingForDensity(rules, density) {
  return rules.densitySpacingMeters?.[density] ?? rules.densityToLotSpacing?.[density] ?? 12;
}
