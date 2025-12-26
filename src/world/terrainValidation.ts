import { CITY_SLOPE_MAX } from "../config/terrainShape";

const CORE_DSEA_MIN = 0.15;
const CORE_DSEA_MAX = 0.55;

const DEFAULT_RESULT = {
  valid: false,
  failures: [],
  stats: {
    waterTouchesAllBorders: false,
    waterLoopSeparating: false,
    nonSeaBordersTouched: 0,
    cityCoreSlopeAverage: Number.POSITIVE_INFINITY,
  },
};

function getDistanceToSeaNormalized(x, z, seaSide, halfSize, size) {
  switch (seaSide) {
    case "west":
      return Math.min(Math.max((x + halfSize) / size, 0), 1);
    case "north":
      return Math.min(Math.max((z + halfSize) / size, 0), 1);
    case "south":
      return Math.min(Math.max((halfSize - z) / size, 0), 1);
    case "east":
    default:
      return Math.min(Math.max((halfSize - x) / size, 0), 1);
  }
}

function buildLandGrid(baseHeights, seaLevel) {
  const land = new Uint8Array(baseHeights.length);
  for (let i = 0; i < baseHeights.length; i++) {
    land[i] = baseHeights[i] >= seaLevel ? 1 : 0;
  }
  return land;
}

function floodFillComponents({
  grid,
  stride,
  targetValue,
}) {
  const total = grid.length;
  const componentIds = new Int32Array(total);
  componentIds.fill(-1);

  const sizes = [];
  const touches = [];
  let currentId = 0;

  const stack = [];

  for (let index = 0; index < total; index++) {
    if (grid[index] !== targetValue || componentIds[index] !== -1) continue;

    let size = 0;
    let touchesNorth = false;
    let touchesSouth = false;
    let touchesWest = false;
    let touchesEast = false;

    componentIds[index] = currentId;
    stack.push(index);

    while (stack.length > 0) {
      const current = stack.pop();
      size += 1;

      const x = current % stride;
      const z = Math.floor(current / stride);

      if (z === 0) touchesNorth = true;
      if (z === stride - 1) touchesSouth = true;
      if (x === 0) touchesWest = true;
      if (x === stride - 1) touchesEast = true;

      const neighbors = [
        current - 1,
        current + 1,
        current - stride,
        current + stride,
      ];

      for (const neighbor of neighbors) {
        if (neighbor < 0 || neighbor >= total) continue;
        if (grid[neighbor] !== targetValue) continue;
        if (componentIds[neighbor] !== -1) continue;
        const nx = neighbor % stride;
        const nz = Math.floor(neighbor / stride);
        if (Math.abs(nx - x) + Math.abs(nz - z) !== 1) continue;
        componentIds[neighbor] = currentId;
        stack.push(neighbor);
      }
    }

    sizes[currentId] = size;
    touches[currentId] = {
      north: touchesNorth,
      south: touchesSouth,
      west: touchesWest,
      east: touchesEast,
    };

    currentId += 1;
  }

  return { componentIds, sizes, touches };
}

function findLargestComponent(sizes) {
  let maxSize = -1;
  let maxId = -1;
  sizes.forEach((size, id) => {
    if (size > maxSize) {
      maxSize = size;
      maxId = id;
    }
  });
  return maxId;
}

function countNonSeaBordersTouched(touches, seaSide) {
  if (!touches) return 0;
  const borders = ["north", "south", "east", "west"];
  return borders.filter((border) => border !== seaSide && touches[border]).length;
}

function computeCityCoreSlopeAverage({
  baseHeights,
  size,
  segments,
  seaSide,
}) {
  const stride = segments + 1;
  const halfSize = size * 0.5;
  const cellSize = size / segments;

  let slopeSum = 0;
  let sampleCount = 0;

  for (let z = 1; z < stride - 1; z++) {
    const worldZ = (z / segments) * size - halfSize;
    for (let x = 1; x < stride - 1; x++) {
      const worldX = (x / segments) * size - halfSize;
      const dSea = getDistanceToSeaNormalized(
        worldX,
        worldZ,
        seaSide,
        halfSize,
        size,
      );

      if (dSea < CORE_DSEA_MIN || dSea > CORE_DSEA_MAX) continue;

      const idx = z * stride + x;
      const hL = baseHeights[idx - 1];
      const hR = baseHeights[idx + 1];
      const hD = baseHeights[idx - stride];
      const hU = baseHeights[idx + stride];

      const dx = (hR - hL) / (2 * cellSize);
      const dz = (hU - hD) / (2 * cellSize);
      const slope = Math.hypot(dx, dz);

      slopeSum += slope;
      sampleCount += 1;
    }
  }

  if (sampleCount === 0) {
    return Number.POSITIVE_INFINITY;
  }

  return slopeSum / sampleCount;
}

export function validateTerrain({
  baseHeights,
  segments,
  size,
  seaLevel,
  seaSide,
}) {
  if (!baseHeights || !Number.isFinite(segments) || !Number.isFinite(size)) {
    return { ...DEFAULT_RESULT, failures: ["missing-inputs"] };
  }

  const stride = segments + 1;
  const total = stride * stride;
  if (baseHeights.length !== total) {
    return { ...DEFAULT_RESULT, failures: ["invalid-grid"] };
  }

  const landGrid = buildLandGrid(baseHeights, seaLevel);
  const landComponents = floodFillComponents({
    grid: landGrid,
    stride,
    targetValue: 1,
  });
  const largestLandId = findLargestComponent(landComponents.sizes);

  if (largestLandId === -1) {
    return { ...DEFAULT_RESULT, failures: ["no-land"] };
  }

  const largestTouches = landComponents.touches[largestLandId];
  const nonSeaBordersTouched = countNonSeaBordersTouched(
    largestTouches,
    seaSide,
  );

  let waterOnNorth = false;
  let waterOnSouth = false;
  let waterOnWest = false;
  let waterOnEast = false;

  for (let x = 0; x < stride; x++) {
    if (landGrid[x] === 0) waterOnNorth = true;
    if (landGrid[(stride - 1) * stride + x] === 0) waterOnSouth = true;
  }

  for (let z = 0; z < stride; z++) {
    if (landGrid[z * stride] === 0) waterOnWest = true;
    if (landGrid[z * stride + (stride - 1)] === 0) waterOnEast = true;
  }

  const waterTouchesAllBorders =
    waterOnNorth && waterOnSouth && waterOnWest && waterOnEast;

  const waterGrid = new Uint8Array(total);
  for (let i = 0; i < total; i++) {
    waterGrid[i] = landGrid[i] === 1 ? 0 : 1;
  }

  const waterComponents = floodFillComponents({
    grid: waterGrid,
    stride,
    targetValue: 1,
  });

  const adjacentWaterComponents = new Set();
  for (let i = 0; i < total; i++) {
    if (landComponents.componentIds[i] !== largestLandId) continue;
    const x = i % stride;
    const z = Math.floor(i / stride);

    const neighbors = [
      { idx: i - 1, valid: x > 0 },
      { idx: i + 1, valid: x < stride - 1 },
      { idx: i - stride, valid: z > 0 },
      { idx: i + stride, valid: z < stride - 1 },
    ];

    for (const neighbor of neighbors) {
      if (!neighbor.valid) continue;
      if (waterGrid[neighbor.idx] !== 1) continue;
      const waterId = waterComponents.componentIds[neighbor.idx];
      if (waterId !== -1) {
        adjacentWaterComponents.add(waterId);
      }
    }
  }

  let waterLoopSeparating = false;
  if (adjacentWaterComponents.size === 1) {
    const [waterId] = adjacentWaterComponents;
    const waterTouches = waterComponents.touches[waterId];
    if (waterTouches) {
      waterLoopSeparating =
        !waterTouches.north &&
        !waterTouches.south &&
        !waterTouches.east &&
        !waterTouches.west;
    }
  }

  const cityCoreSlopeAverage = computeCityCoreSlopeAverage({
    baseHeights,
    size,
    segments,
    seaSide,
  });

  const failures = [];

  if (!(waterTouchesAllBorders || waterLoopSeparating)) {
    failures.push("water-border-coverage");
  }

  if (nonSeaBordersTouched < 2) {
    failures.push("landmass-border-coverage");
  }

  if (cityCoreSlopeAverage > CITY_SLOPE_MAX) {
    failures.push("city-core-slope");
  }

  return {
    valid: failures.length === 0,
    failures,
    stats: {
      waterTouchesAllBorders,
      waterLoopSeparating,
      nonSeaBordersTouched,
      cityCoreSlopeAverage,
    },
  };
}
