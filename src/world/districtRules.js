import { resolveBaseUrl, joinPath } from "../utils/baseUrl.js";

/** Load district rules from /config/districts.json with safe fallbacks. */
export async function loadDistrictRules(baseUrl = "") {
  const resolvedBase = typeof baseUrl === "string" && baseUrl.length > 0 ? baseUrl : resolveBaseUrl();
  const url = joinPath(resolvedBase, "config/districts.json");

  try {
    const res = await fetch(url, { method: "GET", cache: "no-cache" });
    if (res.ok) {
      const json = await res.json();
      return normalizeRules(json);
    }
  } catch {}
  // Minimal fallback (keeps city rendering even if file missing)
  return normalizeRules({
    seed: 1337,
    districts: [
      {
        id: "default",
        heightRange: [-999, 999],
        buildingDensity: "medium",
        minSeparation: 16,
        allowedTypes: ["house", "shop"],
        road: { width: 3.2, color: 0x333333 },
      },
    ],
    densitySpacingMeters: { high: 11, medium: 16, low: 22 },
    maxSlopeDeltaPerLot: 2.0,
    roadSetbackMeters: 4,
  });
}

function normalizeRules(cfg) {
  const toColor = (v) => (typeof v === "number" ? v : 0x333333);
  const defaultSpacing = { high: 11, medium: 16, low: 22 };
  for (const d of cfg.districts || []) {
    d.heightRange = Array.isArray(d.heightRange) ? d.heightRange : [-999, 999];
    d.allowedTypes = Array.isArray(d.allowedTypes) ? d.allowedTypes : ["house"];
    d.minSeparation = Number.isFinite(d.minSeparation) ? d.minSeparation : 0;
    d.road = d.road || {};
    d.road.width = Number.isFinite(d.road.width) ? d.road.width : 3.2;
    d.road.color = toColor(d.road.color);
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
