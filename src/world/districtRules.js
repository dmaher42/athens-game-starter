/** Load district rules from /config/districts.json with safe fallbacks. */
export async function loadDistrictRules(baseUrl = "") {
  const candidates = [];
  if (baseUrl && typeof baseUrl === "string") {
    candidates.push(`${baseUrl}config/districts.json`);
  }
  candidates.push("/config/districts.json");

  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (res.ok) {
        const json = await res.json();
        return normalizeRules(json);
      }
    } catch {}
  }
  // Minimal fallback (keeps city rendering even if file missing)
  return normalizeRules({
    seed: 1337,
    districts: [
      {
        id: "default",
        heightRange: [-999, 999],
        buildingDensity: "medium",
        allowedTypes: ["house", "shop"],
        road: { width: 3.2, color: 0x333333 },
      },
    ],
    densityToLotSpacing: { high: 7, medium: 11, low: 16 },
    maxSlopeDeltaPerLot: 2.0
  });
}

function normalizeRules(cfg) {
  const toColor = (v) => (typeof v === "number" ? v : 0x333333);
  for (const d of cfg.districts || []) {
    d.heightRange = Array.isArray(d.heightRange) ? d.heightRange : [-999, 999];
    d.allowedTypes = Array.isArray(d.allowedTypes) ? d.allowedTypes : ["house"];
    d.road = d.road || {};
    d.road.width = Number.isFinite(d.road.width) ? d.road.width : 3.2;
    d.road.color = toColor(d.road.color);
  }
  cfg.densityToLotSpacing = cfg.densityToLotSpacing || { high: 7, medium: 11, low: 16 };
  cfg.maxSlopeDeltaPerLot = Number.isFinite(cfg.maxSlopeDeltaPerLot) ? cfg.maxSlopeDeltaPerLot : 2.0;
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
  return rules.densityToLotSpacing?.[density] ?? 12;
}
