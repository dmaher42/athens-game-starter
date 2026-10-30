import type { Vector3 } from "three";

import { CITY_MAP_FEATURES, CITY_MAP_ROUTES } from "../world/cityMapData.js";
import { createHudPanel } from "./hudShared.js";
import { registerUIUpdate } from "./updateLoop.js";
import { registerPanel, unregisterPanel } from "./HudManager.js";
import "./hudTheme.css";

type Vector3Like = Pick<Vector3, "x" | "y" | "z">;

interface MiniMapPoint {
  readonly x: number;
  readonly z: number;
}

interface MiniMapBounds {
  readonly minX: number;
  readonly maxX: number;
  readonly minZ: number;
  readonly maxZ: number;
}

export interface MiniMapFeature {
  readonly id: string;
  readonly name: string;
  readonly position: MiniMapPoint;
  readonly type: "district" | "landmark" | "activity";
}

export interface MiniMapOptions {
  readonly getPosition?: () => Vector3Like | MiniMapPoint | null | undefined;
  readonly getDirection?: () => Vector3Like | MiniMapPoint | null | undefined;
  readonly features?: readonly MiniMapFeature[];
}

export interface MiniMapHandle {
  readonly rootElement: HTMLDivElement;
  dispose(): void;
  setSuspended(value: boolean): void;
}

function normalizePosition(position: unknown): MiniMapPoint | null {
  if (!position) return null;
  if (
    typeof (position as Vector3Like).x === "number" &&
    typeof (position as Vector3Like).z === "number"
  ) {
    const vec = position as Vector3Like;
    return { x: vec.x, z: vec.z };
  }
  if (Array.isArray(position) && position.length >= 3) {
    return { x: Number(position[0]) || 0, z: Number(position[2]) || 0 };
  }
  return null;
}

const DEFAULT_FEATURES: MiniMapFeature[] = CITY_MAP_FEATURES as MiniMapFeature[];

function worldToCanvas(
  point: MiniMapPoint | null,
  canvas: HTMLCanvasElement | null,
  bounds: MiniMapBounds | null,
): { x: number; y: number } | null {
  if (!point || !canvas || !bounds) return null;
  const { width, height } = canvas;
  const normX = (point.x - bounds.minX) / (bounds.maxX - bounds.minX || 1);
  const normZ = (point.z - bounds.minZ) / (bounds.maxZ - bounds.minZ || 1);
  return {
    x: normX * width,
    y: height - normZ * height,
  };
}

function computeBounds(features: readonly MiniMapFeature[]): MiniMapBounds {
  const points = [...features.map(f => f.position), ...CITY_MAP_ROUTES.flatMap(r => r.points)];
  const xs = points.map(p => p.x), zs = points.map(p => p.z);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  // Equal scale in both axes: directions and road shapes remain trustworthy.
  const half = Math.max(Math.max(...xs)-Math.min(...xs), Math.max(...zs)-Math.min(...zs), 80)/2 + 22;
  return {minX:cx-half,maxX:cx+half,minZ:cz-half,maxZ:cz+half};
}

function drawCompass(
  ctx: CanvasRenderingContext2D | null,
  direction: (Vector3Like | MiniMapPoint | null | undefined),
  width: number,
): void {
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

  const vec = direction as Vector3Like;
  const angle = Math.atan2(vec?.x || 0, vec?.z || 1);
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

function drawGrid(ctx: CanvasRenderingContext2D | null, canvas: HTMLCanvasElement): void {
  if (!ctx) return;
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

function drawStreets(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, bounds: MiniMapBounds): void {
  ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
  for (const route of CITY_MAP_ROUTES) {
    ctx.strokeStyle = route.type === "artery" ? "#baa984" : "#687979";
    ctx.lineWidth = route.type === "artery" ? 2.4 : 1.3;
    ctx.beginPath();
    route.points.forEach((p, i) => {const q=worldToCanvas(p,canvas,bounds)!; if(i)ctx.lineTo(q.x,q.y);else ctx.moveTo(q.x,q.y);});
    ctx.stroke();
  }
  ctx.restore();
}

function drawFeatures(
  ctx: CanvasRenderingContext2D | null,
  canvas: HTMLCanvasElement,
  features: readonly MiniMapFeature[],
  bounds: MiniMapBounds,
): void {
  if (!ctx) return;
  ctx.save();
  ctx.font = "10px ui-sans-serif";
  ctx.textBaseline = "top";
  const boxes: {x:number;y:number;w:number;h:number}[] = [];
  for (const feature of [...features].sort((a,b)=>Number(a.type==='district')-Number(b.type==='district'))) {
    const { position, name, type } = feature || {};
    const mapped = worldToCanvas(position, canvas, bounds);
    if (!mapped) continue;
    const color = type === "activity" ? "#e4be76" : type === "landmark" ? "#ded8c4" : "#81ac9b";
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(mapped.x, mapped.y, 2.5, 0, Math.PI * 2);
    ctx.fill();

    const label = String(name || "");
    if (label) {
      const textWidth = ctx.measureText(label).width;
      const padding = 4;
      const boxX = Math.min(canvas.width-textWidth-10,Math.max(2,mapped.x+6));
      let boxY = mapped.y - 10;
      const boxWidth = textWidth + padding * 2;
      const boxHeight = 14;
      const clear = [boxY,boxY+15,boxY-15,boxY+30].find(y=>y>=2&&y+14<canvas.height&&!boxes.some(b=>boxX<b.x+b.w&&boxX+boxWidth>b.x&&y<b.y+b.h&&y+14>b.y));
      if(clear===undefined)continue;
      boxY=clear; boxes.push({x:boxX,y:boxY,w:boxWidth,h:14});
      ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillText(label, boxX + padding, boxY + 2);
    }
  }
  ctx.restore();
}

function drawPlayer(
  ctx: CanvasRenderingContext2D | null,
  canvas: HTMLCanvasElement,
  position: MiniMapPoint | null,
  direction: Vector3Like | MiniMapPoint | null | undefined,
  bounds: MiniMapBounds,
): void {
  if (!ctx || !position) return;
  const mapped = worldToCanvas(position, canvas, bounds);
  if (!mapped) return;
  ctx.save();
  ctx.translate(mapped.x, mapped.y);
  const vec = direction as Vector3Like | undefined;
  const angle = Math.atan2(vec?.x || 0, vec?.z || 1);
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

function formatDistance(distanceMeters: number): string {
  if (!Number.isFinite(distanceMeters)) return "";
  const paces = distanceMeters / 0.75;
  if (paces < 1) return "<1 pace";
  if (paces < 10) return `${paces.toFixed(1)} paces`;
  return `${Math.round(paces)} paces`;
}

function updateLegend(
  listElement: HTMLUListElement,
  position: MiniMapPoint,
  features: readonly MiniMapFeature[],
): void {
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
    label.textContent = entry.type === "activity" ? "Visit" : entry.type === "landmark" ? "Landmark" : "District";
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

export function mountMiniMap(options: MiniMapOptions = {}): MiniMapHandle | null {
  if (typeof document === "undefined") return null;

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
  legend.innerHTML = `<h4>Nearby places</h4><p style="font-size:11px;margin:4px 0 8px;color:#bbb">Gold: activities / Ivory: landmarks / Green: courts</p>`;
  const list = document.createElement("ul");
  legend.appendChild(list);

  let wrap: HTMLDivElement | null = null;
  let isExpanded = false;
  const applyExpandedState = () => {
    const targetSize = isExpanded ? 360 : 220;
    legend.hidden = !isExpanded;
    canvas.width = targetSize;
    canvas.height = targetSize;
    if (wrap) {
      wrap.classList.toggle("mini-map-panel--expanded", isExpanded);
    }
  };

  const panel = createHudPanel({
    title: "Athens map",
    className: "mini-map-panel",
    initialCollapsed: true,
    collapseContent: false,
    toggleLabels: { collapsed: "Expand", expanded: "Collapse" },
    onToggle: (collapsed: boolean) => {
      isExpanded = !collapsed;
      applyExpandedState();
    },
  });

  const wrapElement = panel.root;
  wrap = wrapElement;
  panel.content.appendChild(canvas);
  panel.content.appendChild(legend);
  applyExpandedState();

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.warn("[MiniMap] unable to acquire 2D context");
    return null;
  }
  const bounds = computeBounds(features);

  let disposed = false;
  let lastLegendUpdate = 0;
  const legendInterval = 500; // ms
  let lastLegendKey = "";
  let lastDrawKey = "";

  const buildPositionKey = (
    position: MiniMapPoint | Vector3Like | null | undefined,
  ) => {
    if (!position) return "";
    return `${position.x.toFixed(1)}|${position.z.toFixed(1)}`;
  };

  let sceneSuspended=false;
  const loop = () => {
    if (disposed||sceneSuspended) return;
    try {
      const rawPosition = getPosition?.();
      const position = normalizePosition(rawPosition);
      const direction = getDirection?.();
      const drawKey = `${canvas.width}::${buildPositionKey(position)}::${buildPositionKey(direction)}`;

      if (drawKey !== lastDrawKey) {
        lastDrawKey = drawKey;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        bg.addColorStop(0, "#0b1728");
        bg.addColorStop(1, "#09101a");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawGrid(ctx, canvas);
        drawStreets(ctx, canvas, bounds);
        drawFeatures(ctx, canvas, features, bounds);

        if (position) {
          drawPlayer(ctx, canvas, position, direction, bounds);
        }
        drawCompass(ctx, direction, canvas.width);
      }

      if (position) {
        const now = performance.now?.() ?? Date.now();
        const legendKey = buildPositionKey(position);
        if (legendKey !== lastLegendKey && now - lastLegendUpdate > legendInterval) {
          updateLegend(list, position, features);
          lastLegendKey = legendKey;
          lastLegendUpdate = now;
        }
      }
    } catch (error) {
      console.warn("[MiniMap] update failed", error);
    }
  };
  const disposeUpdate = registerUIUpdate("miniMap", () => loop(), 8);

  registerPanel("miniMap", wrapElement, 3);

  const handle: MiniMapHandle = {
    rootElement: wrapElement,
    setSuspended(value:boolean){sceneSuspended=!!value;},
    dispose() {
      disposed = true;
      disposeUpdate();
      unregisterPanel("miniMap");
      wrapElement.remove();
    },
  };
  return handle;
}

export default mountMiniMap;
