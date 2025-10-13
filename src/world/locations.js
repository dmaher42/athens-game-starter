import * as THREE from "three";

const parseValidNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const EXISTING_SEA_LEVEL_Y = (() => {
  if (
    typeof globalThis !== "undefined" &&
    typeof globalThis.SEA_LEVEL_Y !== "undefined"
  ) {
    const override = parseValidNumber(globalThis.SEA_LEVEL_Y);
    if (typeof override !== "undefined") {
      return override;
    }
  }

  if (
    typeof globalThis !== "undefined" &&
    typeof globalThis.location === "object" &&
    globalThis.location !== null
  ) {
    const { search } = globalThis.location;

    if (typeof search === "string" && search.length > 0) {
      try {
        const params = new URLSearchParams(
          search.startsWith("?") ? search : `?${search}`
        );
        const paramValue = params.get("sea");
        const parsedParam = parseValidNumber(paramValue);

        if (typeof parsedParam !== "undefined") {
          return parsedParam;
        }
      } catch (error) {
        // Ignore malformed query strings or missing URLSearchParams
      }
    }
  }

  return undefined;
})();

export const SEA_LEVEL_Y =
  typeof EXISTING_SEA_LEVEL_Y !== "undefined" ? EXISTING_SEA_LEVEL_Y : 1.0; // keep existing if defined
// export const SEA_LEVEL_Y = -0.3; // uncomment to lower globally if shoreline splashes

// Key anchors (coastal → uphill)
export const HARBOR_CENTER_3D = new THREE.Vector3(-120, SEA_LEVEL_Y, 80);
export const AGORA_CENTER_3D = new THREE.Vector3(-80, 8, 40); // slightly higher than sea
export const ACROPOLIS_PEAK_3D = new THREE.Vector3(-40, 14, 10); // hill crown

// Zones
export const HARBOR_EXCLUDE_RADIUS = 110; // keep shoreline clear
export const AGORA_RADIUS = 22;
export const ACROPOLIS_RADIUS = 18;
// Expanded city footprint
export const CITY_AREA_RADIUS = 260; // expand urban plateau & HillCity sampling

// Placement safety
export const MIN_ABOVE_SEA = 2.0; // minimum building base above water
export const MAX_SLOPE_DELTA = 0.35; // 1m sample slope threshold

// Road
export const MAIN_ROAD_WIDTH = 3.2;

export const HARBOR_CENTER = new THREE.Vector2(-120, 80);
export const HARBOR_SEA_LEVEL = SEA_LEVEL_Y;

export const CITY_CHUNK_CENTER = new THREE.Vector3(-70, 0, 25);
export const CITY_CHUNK_SIZE = new THREE.Vector2(140, 110); // city grid footprint
export const CITY_SEED = 0x4d534349;

// Harbor water extents (limit the ocean to the bay only)
export const HARBOR_WATER_RADIUS = 70; // if using circular water

// Harbor water extents (rectangle) and seaward offset
export const HARBOR_WATER_SIZE = new THREE.Vector2(140, 120); // confine water footprint to the harbor basin
export const HARBOR_WATER_OFFSET = new THREE.Vector2(0, 0); // center the water plane on the harbor location
// Keep the harbor water strictly on the seaward (western) side of the pier
export const PIER_EDGE_OFFSET = 4.5; // distance from harbor center to pier edge
export const HARBOR_WATER_EAST_LIMIT =
  HARBOR_CENTER_3D.x - PIER_EDGE_OFFSET + 3; // align with western (seaward) edge of pier
// extend water slightly under pier for visual continuity
export const HARBOR_WATER_BACK = 0; // max inland distance allowed (in Z half-extent)

const HARBOR_WATER_HALF_WIDTH = 70; // meters west of the pier (keeps water inside the harbor)
const HARBOR_WATER_HALF_DEPTH = 60; // meters north/south from harbor center

export const HARBOR_WATER_BOUNDS = {
  west: HARBOR_CENTER_3D.x - HARBOR_WATER_HALF_WIDTH,
  east: HARBOR_WATER_EAST_LIMIT,
  north: HARBOR_CENTER_3D.z - HARBOR_WATER_HALF_DEPTH,
  south: HARBOR_CENTER_3D.z + HARBOR_WATER_HALF_DEPTH,
};

// Keep procedural buildings off the pier deck and pedestrian walkway.
const HARBOR_WALKWAY_EAST = HARBOR_CENTER_3D.x + 42;
const HARBOR_WALKWAY_HALF_WIDTH = 9;

export const HARBOR_SETBACKS = [
  {
    west: HARBOR_WATER_BOUNDS.west,
    east: HARBOR_WATER_EAST_LIMIT + 3,
    north: HARBOR_WATER_BOUNDS.north,
    south: HARBOR_WATER_BOUNDS.south,
  },
  {
    west: HARBOR_WATER_EAST_LIMIT + 3,
    east: HARBOR_WALKWAY_EAST,
    north: HARBOR_CENTER_3D.z - HARBOR_WALKWAY_HALF_WIDTH,
    south: HARBOR_CENTER_3D.z + HARBOR_WALKWAY_HALF_WIDTH,
  },
];

// Convenience centers
export const HARBOR_WATER_CENTER = new THREE.Vector3(
  HARBOR_CENTER_3D.x + HARBOR_WATER_OFFSET.x,
  SEA_LEVEL_Y,
  HARBOR_CENTER_3D.z + HARBOR_WATER_OFFSET.y
);
