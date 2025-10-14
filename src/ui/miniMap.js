import {
  ACROPOLIS_PEAK_3D,
  AGORA_CENTER_3D,
  CITY_AREA_RADIUS,
  CITY_CHUNK_CENTER,
  HARBOR_CENTER_3D,
} from "../world/locations.js";
import { athensLayoutConfig } from "../config/athensLayoutConfig.js";
import { getUISlot } from "./uiRoot.js";

const STYLE_ID = "mini-map-style";

function ensureStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .mini-map-panel {
      display: grid;
      grid-template-columns: auto;
      grid-template-rows: auto auto;
      gap: 8px;
      width: 230px;
      color: #f5f5f5;
      font: 12px/1.35 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto;
      background: rgba(9, 12, 18, 0.72);
      border-radius: 12px;
      padding: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
      pointer-events: auto;
      backdrop-filter: blur(6px);
      transition: width 160ms ease, box-shadow 160ms ease;
    }
    .mini-map-panel--expanded {
      width: 360px;
      box-shadow: 0 18px 32px rgba(0, 0, 0, 0.55);
    }
    .mini-map__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .mini-map__title {
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-size: 11px;
      opacity: 0.85;
    }
    .mini-map__toggle {
      appearance: none;
      border: 0;
      border-radius: 999px;
      padding: 6px 10px;
      font-weight: 600;
      font-size: 11px;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      background: rgba(31, 135, 214, 0.18);
      color: #a8dfff;
      cursor: pointer;
      transition: background 120ms ease, color 120ms ease;
    }
    .mini-map__toggle:hover {
      background: rgba(31, 135, 214, 0.32);
      color: #e7f6ff;
    }
    .mini-map__canvas {
      width: 100%;
      height: auto;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(4, 7, 10, 0.85);
    }
    .mini-map__legend {
      background: rgba(0, 0, 0, 0.35);
      border-radius: 10px;
      padding: 10px 12px;
    }
    .mini-map__legend h4 {
      margin: 0 0 6px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      opacity: 0.7;
    }
    .mini-map__legend ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 4px;
    }
    .mini-map__legend li {
      display: flex;
      justify-content: space-between;
      gap: 6px;
      font-size: 11px;
      opacity: 0.85;
    }
    .mini-map__legend li span {
      opacity: 0.65;
      font-size: 10px;
      letter-spacing: 0.02em;
    }
    @media (max-width: 640px) {
      .mini-map-panel {
        width: min(100vw - 32px, 240px);
      }
      .mini-map-panel--expanded {
        width: min(100vw - 24px, 320px);
      }
    }
  `;
  document.head.appendChild(style);
}

function normalizePosition(position) {
  if (!position) return null;
  if (typeof position.x === "number" && typeof position.z === "number") {
    return { x: position.x, z: position.z };
  }
  if (Array.isArray(position) && position.length >= 3) {
    return { x: Number(position[0]) || 0, z: Number(position[2]) || 0 };
  }
  return null;
}

function buildLandmarkFeatures() {
  const features = [];
  const groups = athensLayoutConfig?.groups ?? [];
  for (const group of groups) {
    if (!group || !Array.isArray(group.landmarks)) continue;
    for (const landmark of group.landmarks) {
      if (!landmark) continue;
      const { enabled, name, id } = landmark;
      if (enabled === false) continue;
      const point = normalizePosition(landmark.placement?.position);
      if (!point) continue;
      features.push({
        id: `landmark:${id ?? name ?? features.length}`,
        name: String(name || id || "Landmark"),
        position: point,
        type: "landmark",
      });
    }
  }
  return features;
}

function buildDistrictFeatures() {
  const agora = normalizePosition(AGORA_CENTER_3D);
  const harbor = normalizePosition(HARBOR_CENTER_3D);
  const acropolis = normalizePosition(ACROPOLIS_PEAK_3D);
  const features = [];
  if (harbor) {
    features.push({
      id: "district:harbor",
      name: "Harbor District",
      position: harbor,
      type: "district",
    });
  }
  if (agora) {
    features.push({
      id: "district:agora",
      name: "Agora",
      position: agora,
      type: "district",
    });
    features.push({
      id: "district:civic-core",
      name: "Civic Core",
      position: { x: agora.x, z: agora.z + 20 },
      type: "district",
    });
    features.push({
      id: "district:innovation",
      name: "Innovation Corridor",
      position: { x: agora.x + 70, z: agora.z + 10 },
      type: "district",
    });
    features.push({
      id: "district:neighborhood",
      name: "Neighborhood Rings",
      position: { x: agora.x, z: agora.z - 60 },
      type: "district",
    });
    features.push({
      id: "district:green-belt",
      name: "Green & Blue Belt",
      position: { x: agora.x - 70, z: agora.z - 20 },
      type: "district",
    });
    features.push({
      id: "district:gateway",
      name: "Gateway Districts",
      position: { x: agora.x, z: agora.z + 110 },
      type: "district",
    });
  }
  if (acropolis) {
    features.push({
      id: "district:acropolis",
      name: "Acropolis Plateau",
      position: acropolis,
      type: "district",
    });
  }
  return features;
}

function combineFeatures() {
  const combined = [...buildDistrictFeatures(), ...buildLandmarkFeatures()];
  const seen = new Set();
  return combined.filter((feature) => {
    if (!feature?.id) return false;
    if (seen.has(feature.id)) return false;
    seen.add(feature.id);
    return true;
  });
}

const DEFAULT_FEATURES = combineFeatures();

function worldToCanvas(point, canvas, bounds) {
  if (!point || !canvas || !bounds) return null;
  const { width, height } = canvas;
  const normX = (point.x - bounds.minX) / (bounds.maxX - bounds.minX || 1);
  const normZ = (point.z - bounds.minZ) / (bounds.maxZ - bounds.minZ || 1);
  return {
    x: normX * width,
    y: height - normZ * height,
  };
}

function computeBounds(features) {
  const center = normalizePosition(CITY_CHUNK_CENTER) ?? { x: 0, z: 0 };
  const radius = Number.isFinite(CITY_AREA_RADIUS) ? CITY_AREA_RADIUS : 260;
  let minX = center.x - radius;
  let maxX = center.x + radius;
  let minZ = center.z - radius;
  let maxZ = center.z + radius;
  for (const feature of features) {
    const { position } = feature || {};
    if (!position) continue;
    if (typeof position.x === "number") {
      minX = Math.min(minX, position.x);
      maxX = Math.max(maxX, position.x);
    }
    if (typeof position.z === "number") {
      minZ = Math.min(minZ, position.z);
      maxZ = Math.max(maxZ, position.z);
    }
  }
  const padding = 20;
  return {
    minX: minX - padding,
    maxX: maxX + padding,
    minZ: minZ - padding,
    maxZ: maxZ + padding,
  };
}

function drawCompass(ctx, direction, width) {
  if (!ctx || !direction) return;
  const size = 48;
  const padding = 10;
  const cx = width - size / 2 - padding;
  const cy = size / 2 + padding;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
  ctx.stroke();

  const angle = Math.atan2(direction.x || 0, direction.z || 1);
  ctx.rotate(angle);
  ctx.fillStyle = "rgba(255, 99, 71, 0.9)";
  ctx.beginPath();
  ctx.moveTo(0, -(size / 2 - 4));
  ctx.lineTo(6, size / 2 - 8);
  ctx.lineTo(-6, size / 2 - 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.font = "10px ui-sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("N", 0, -(size / 2) + 8);
  ctx.fillText("S", 0, size / 2 - 8);
  ctx.fillText("E", size / 2 - 8, 0);
  ctx.fillText("W", -(size / 2) + 8, 0);
  ctx.restore();
}

function drawGrid(ctx, canvas) {
  if (!ctx || !canvas) return;
  const spacing = 36;
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
  ctx.lineWidth = 1;
  for (let x = spacing; x < canvas.width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, canvas.height);
    ctx.stroke();
  }
  for (let y = spacing; y < canvas.height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(canvas.width, y + 0.5);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFeatures(ctx, canvas, features, bounds) {
  if (!ctx || !canvas) return;
  ctx.save();
  ctx.font = "10px ui-sans-serif";
  ctx.textBaseline = "top";
  for (const feature of features) {
    const { position, name, type } = feature || {};
    const mapped = worldToCanvas(position, canvas, bounds);
    if (!mapped) continue;
    const color = type === "landmark" ? "#ffd166" : "#72e0ff";
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(mapped.x, mapped.y, type === "landmark" ? 3.5 : 2.5, 0, Math.PI * 2);
    ctx.fill();

    const label = String(name || "");
    if (label) {
      const textWidth = ctx.measureText(label).width;
      const padding = 4;
      const boxX = mapped.x + 6;
      const boxY = mapped.y - 10;
      const boxWidth = textWidth + padding * 2;
      const boxHeight = 14;
      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillText(label, boxX + padding, boxY + 2);
    }
  }
  ctx.restore();
}

function drawPlayer(ctx, canvas, position, direction, bounds) {
  if (!ctx || !canvas || !position) return;
  const mapped = worldToCanvas(position, canvas, bounds);
  if (!mapped) return;
  ctx.save();
  ctx.translate(mapped.x, mapped.y);
  const angle = Math.atan2(direction?.x || 0, direction?.z || 1);
  ctx.rotate(angle);
  ctx.fillStyle = "#ff9f1c";
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(7, 10);
  ctx.lineTo(-7, 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
}

function formatDistance(distanceMeters) {
  if (!Number.isFinite(distanceMeters)) return "";
  const paces = distanceMeters / 0.75;
  if (paces < 1) return "<1 pace";
  if (paces < 10) return `${paces.toFixed(1)} paces`;
  return `${Math.round(paces)} paces`;
}

function updateLegend(listElement, position, features) {
  if (!listElement || !position || !Array.isArray(features)) return;
  const items = features
    .map((feature) => {
      const dx = (feature?.position?.x ?? 0) - position.x;
      const dz = (feature?.position?.z ?? 0) - position.z;
      const distance = Math.hypot(dx, dz);
      return { ...feature, distance };
    })
    .filter((entry) => Number.isFinite(entry.distance))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  listElement.innerHTML = "";
  for (const entry of items) {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = entry.type === "landmark" ? "Landmark" : "District";
    const name = document.createElement("strong");
    name.textContent = entry.name;
    name.style.fontWeight = "600";
    name.style.letterSpacing = "0.02em";
    const distance = document.createElement("span");
    distance.textContent = formatDistance(entry.distance);
    li.appendChild(name);
    li.appendChild(distance);
    li.appendChild(label);
    label.style.marginLeft = "auto";
    listElement.appendChild(li);
  }
}

export function mountMiniMap(options = {}) {
  if (typeof document === "undefined") return null;
  ensureStyles();

  const {
    getPosition = () => null,
    getDirection = () => ({ x: 0, z: 1 }),
    features = DEFAULT_FEATURES,
  } = options;

  const canvas = document.createElement("canvas");
  canvas.width = 300;
  canvas.height = 300;
  canvas.className = "mini-map__canvas";
  const legend = document.createElement("div");
  legend.className = "mini-map__legend";
  legend.innerHTML = "<h4>Nearby</h4>";
  const list = document.createElement("ul");
  legend.appendChild(list);

  const wrap = document.createElement("div");
  wrap.className = "mini-map-panel";

  const header = document.createElement("div");
  header.className = "mini-map__header";
  const title = document.createElement("div");
  title.className = "mini-map__title";
  title.textContent = "City Mini Map";
  const toggle = document.createElement("button");
  toggle.className = "mini-map__toggle";
  toggle.type = "button";
  toggle.textContent = "Expand";
  header.appendChild(title);
  header.appendChild(toggle);

  wrap.appendChild(header);
  wrap.appendChild(canvas);
  wrap.appendChild(legend);

  const ctx = canvas.getContext("2d");
  const bounds = computeBounds(features);

  let isExpanded = false;
  const updateToggle = () => {
    toggle.textContent = isExpanded ? "Collapse" : "Expand";
    wrap.classList.toggle("mini-map-panel--expanded", isExpanded);
    const targetSize = isExpanded ? 360 : 260;
    canvas.width = targetSize;
    canvas.height = targetSize;
  };
  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    isExpanded = !isExpanded;
    updateToggle();
  });
  updateToggle();

  let rafId = 0;
  let disposed = false;
  let lastLegendUpdate = 0;
  const legendInterval = 500; // ms

  const loop = () => {
    if (disposed) return;
    try {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bg.addColorStop(0, "#0b1728");
      bg.addColorStop(1, "#09101a");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawGrid(ctx, canvas);
      drawFeatures(ctx, canvas, features, bounds);

      const position = getPosition?.();
      const direction = getDirection?.();
      if (position) {
        drawPlayer(ctx, canvas, position, direction, bounds);
        const now = performance.now?.() ?? Date.now();
        if (now - lastLegendUpdate > legendInterval) {
          updateLegend(list, position, features);
          lastLegendUpdate = now;
        }
      }
      drawCompass(ctx, direction, canvas.width);
    } catch (error) {
      console.warn("[MiniMap] update failed", error);
    }
    rafId = requestAnimationFrame(loop);
  };
  loop();

  const slot = getUISlot("topLeft");
  slot.appendChild(wrap);

  return {
    rootElement: wrap,
    dispose() {
      disposed = true;
      if (rafId) cancelAnimationFrame(rafId);
      wrap.remove();
    },
  };
}

export default mountMiniMap;
