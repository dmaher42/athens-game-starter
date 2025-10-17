import * as THREE from 'three';
import { AGORA_CENTER_3D } from './locations.js';

function ensureVector3(value, fallback = new THREE.Vector3()) {
  if (value instanceof THREE.Vector3) {
    return value.clone();
  }
  if (value && typeof value === 'object') {
    return new THREE.Vector3(value.x ?? 0, value.y ?? 0, value.z ?? 0);
  }
  return fallback.clone();
}

function toColor(value, fallback = 0xffffff) {
  if (value instanceof THREE.Color) {
    return value.clone();
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return new THREE.Color(value);
  }
  return new THREE.Color(fallback);
}

function createZoneRing(innerRadius, outerRadius, color, options = {}) {
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, options.segments ?? 64);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({
    color: toColor(color),
    transparent: true,
    opacity: options.opacity ?? 0.35,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = options.name ?? 'PlanZone';
  mesh.userData.noCollision = true;
  return mesh;
}

function createZoneDisc(radius, color, options = {}) {
  const geometry = new THREE.CircleGeometry(radius, options.segments ?? 48);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({
    color: toColor(color),
    transparent: true,
    opacity: options.opacity ?? 0.3,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = options.name ?? 'PlanCore';
  mesh.userData.noCollision = true;
  return mesh;
}

function createCorridor(length, width, color, options = {}) {
  const height = options.height ?? 0.8;
  const geometry = new THREE.BoxGeometry(width, height, length);
  const material = new THREE.MeshStandardMaterial({
    color: toColor(color),
    transparent: true,
    opacity: options.opacity ?? 0.6,
    roughness: 0.85,
    metalness: 0.05,
    emissive: new THREE.Color(options.emissive ?? 0x000000),
    emissiveIntensity: options.emissiveIntensity ?? 0,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  mesh.userData.noCollision = true;
  mesh.name = options.name ?? 'PlanCorridor';
  return mesh;
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines;
}

function createBillboardTexture({ title, bodyLines, accentColor, backgroundColor }) {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const bg = toColor(backgroundColor ?? 0x101418);
  ctx.fillStyle = bg.getStyle();
  drawRoundedRect(ctx, 0, 0, width, height, 40);
  ctx.fill();

  const accent = toColor(accentColor ?? 0xffc107);
  ctx.fillStyle = accent.getStyle();
  drawRoundedRect(ctx, 0, 0, 96, height, 40);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 64px "Inter", "Helvetica Neue", Arial, sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText(title, 128, 48);

  ctx.font = '32px "Inter", "Helvetica Neue", Arial, sans-serif';
  const lineHeight = 44;
  let y = 140;
  const maxTextWidth = width - 180;
  for (const entry of bodyLines ?? []) {
    const wrapped = wrapLines(ctx, entry, maxTextWidth);
    for (const line of wrapped) {
      ctx.fillText(line, 128, y);
      y += lineHeight;
    }
    y += 12;
  }

  return new THREE.CanvasTexture(canvas);
}

function createBillboard({ title, bodyLines, accentColor, backgroundColor, width = 16, height = 8 }) {
  const texture = createBillboardTexture({ title, bodyLines, accentColor, backgroundColor });
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  panel.name = 'PlanBillboardPanel';

  const support = new THREE.Mesh(
    new THREE.CylinderGeometry(width * 0.05, width * 0.05, height * 0.6, 12),
    new THREE.MeshStandardMaterial({ color: 0x424242, roughness: 0.85 })
  );
  support.position.y = -height * 0.3;
  support.name = 'PlanBillboardSupport';

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(width * 0.22, width * 0.22, height * 0.15, 20),
    new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.9 })
  );
  base.position.y = -height * 0.6;
  base.name = 'PlanBillboardBase';

  const group = new THREE.Group();
  group.name = 'PlanBillboard';
  panel.position.y = height * 0.5;
  group.add(panel, support, base);
  group.userData.noCollision = true;
  return group;
}

function createGatewayMarker(color) {
  const material = new THREE.MeshStandardMaterial({
    color: toColor(color ?? 0x90caf9),
    emissive: new THREE.Color(0x13293d),
    emissiveIntensity: 0.45,
    transparent: true,
    opacity: 0.85,
    roughness: 0.4,
    metalness: 0.25,
  });
  const column = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 10, 24), material);
  column.name = 'GatewayColumn';
  column.castShadow = true;
  column.receiveShadow = true;
  column.userData.noCollision = true;

  const haloMaterial = new THREE.MeshBasicMaterial({
    color: material.color.clone(),
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
  });
  const halo = new THREE.Mesh(new THREE.CircleGeometry(6, 48), haloMaterial);
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = -5;
  halo.name = 'GatewayHalo';
  halo.userData.noCollision = true;

  const group = new THREE.Group();
  group.name = 'GatewayMarker';
  group.add(column, halo);
  return group;
}

export function createCityPlanImplementation(scene, options = {}) {
  const group = new THREE.Group();
  group.name = 'CityPlanImplementation';
  scene.add(group);

  const center = ensureVector3(options.center, ensureVector3(AGORA_CENTER_3D));
  const sampler =
    options.heightSampler ?? options.terrainSampler ?? options.terrain?.userData?.getHeightAt ?? null;
  const surfaceOffset = options.surfaceOffset ?? 0.4;

  const sample = (offsetX, offsetZ, fallback = 0) => {
    if (!sampler) {
      return center.y + surfaceOffset + fallback;
    }
    const sampled = sampler(center.x + offsetX, center.z + offsetZ);
    if (Number.isFinite(sampled)) {
      return sampled + surfaceOffset + fallback;
    }
    return center.y + surfaceOffset + fallback;
  };

  const civicCore = createZoneDisc(options.civicCoreRadius ?? 32, 0xffc046, {
    opacity: 0.28,
    name: 'CivicCoreOverlay',
  });
  civicCore.position.set(center.x, sample(0, 0), center.z);
  group.add(civicCore);

  const transitSpine = createCorridor(options.transitLength ?? 140, options.transitWidth ?? 8, 0xff7043, {
    name: 'TransitBackbone',
    opacity: 0.55,
    emissive: 0x784118,
    emissiveIntensity: 0.4,
  });
  transitSpine.position.set(center.x, sample(0, 0, 0), center.z);
  group.add(transitSpine);

  const innovation = createCorridor(options.innovationLength ?? 110, options.innovationWidth ?? 18, 0x42a5f5, {
    name: 'InnovationCorridor',
    opacity: 0.42,
  });
  innovation.position.set(center.x + (options.innovationOffsetX ?? 50), sample(0, 0, 0), center.z);
  innovation.rotation.y = options.innovationRotation ?? THREE.MathUtils.degToRad(12);
  group.add(innovation);

  const ringConfigs = [
    {
      name: 'NeighborhoodRingInner',
      inner: options.civicCoreRadius ?? 32,
      outer: options.neighborhoodInnerRadius ?? 58,
      color: 0x81c784,
      opacity: 0.22,
    },
    {
      name: 'NeighborhoodRingOuter',
      inner: options.neighborhoodInnerRadius ?? 58,
      outer: options.neighborhoodOuterRadius ?? 82,
      color: 0x4caf50,
      opacity: 0.18,
    },
    {
      name: 'GreenBlueBelt',
      inner: options.greenBeltInnerRadius ?? 86,
      outer: options.greenBeltOuterRadius ?? 120,
      color: 0x26c6da,
      opacity: 0.18,
    },
  ];

  for (const cfg of ringConfigs) {
    const ring = createZoneRing(cfg.inner, cfg.outer, cfg.color, {
      opacity: cfg.opacity,
      name: cfg.name,
    });
    ring.position.set(center.x, sample(0, 0), center.z);
    group.add(ring);
  }

  const gatewayRadius = options.gatewayRadius ?? 116;
  const gatewayColor = options.gatewayColor ?? 0x90caf9;
  const gatewayPoints = options.gatewayAngles ?? [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  for (const angle of gatewayPoints) {
    const marker = createGatewayMarker(gatewayColor);
    const x = center.x + Math.cos(angle) * gatewayRadius;
    const z = center.z + Math.sin(angle) * gatewayRadius;
    marker.position.set(x, sample(x - center.x, z - center.z, 0), z);
    marker.rotation.y = -angle + Math.PI / 2;
    group.add(marker);
  }

  const billboardData = [
    {
      title: 'Civic Core',
      body: [
        'Central intermodal hub with light-rail platforms, civic plaza, and cultural anchors.',
        'Flexible programming supports markets, festivals, and daily public life.',
      ],
      accent: 0xffc046,
      pos: new THREE.Vector3(center.x - 18, 0, center.z + 20),
    },
    {
      title: 'Innovation Corridor',
      body: [
        'Adaptive reuse of industrial parcels into research labs, incubators, and mixed housing.',
        'District energy spine delivers low-carbon heating, cooling, and logistics.',
      ],
      accent: 0x42a5f5,
      pos: new THREE.Vector3(center.x + 70, 0, center.z + 10),
    },
    {
      title: 'Neighborhood Rings',
      body: [
        'Concentric complete streets place schools, clinics, and grocers within a 5-minute walk.',
        'Traffic-calmed interiors feature community courtyards and stormwater gardens.',
      ],
      accent: 0x66bb6a,
      pos: new THREE.Vector3(center.x, 0, center.z - 60),
    },
    {
      title: 'Green & Blue Belt',
      body: [
        'Continuous parks stitch wetlands, riparian buffers, and cycling greenways.',
        'Nature-based infrastructure manages floods and expands biodiversity corridors.',
      ],
      accent: 0x26c6da,
      pos: new THREE.Vector3(center.x - 70, 0, center.z - 20),
    },
    {
      title: 'Gateway Districts',
      body: [
        'Mobility hubs welcome visitors with park-and-ride decks, EV charging, and bike share.',
        'Signature architecture and wayfinding announce arrival to the reimagined city.',
      ],
      accent: 0x90caf9,
      pos: new THREE.Vector3(center.x, 0, center.z + 110),
    },
  ];

  for (const entry of billboardData) {
    const board = createBillboard({
      title: entry.title,
      bodyLines: entry.body,
      accentColor: entry.accent,
      backgroundColor: 0x111418,
      width: 18,
      height: 9,
    });
    const targetY = sample(entry.pos.x - center.x, entry.pos.z - center.z, 0);
    board.position.set(entry.pos.x, targetY, entry.pos.z);
    board.lookAt(new THREE.Vector3(center.x, targetY, center.z));
    group.add(board);
  }

  group.userData = {
    ...group.userData,
    plan: {
      center,
      civicCoreRadius: options.civicCoreRadius ?? 32,
      neighborhoodInnerRadius: options.neighborhoodInnerRadius ?? 58,
      neighborhoodOuterRadius: options.neighborhoodOuterRadius ?? 82,
      greenBeltInnerRadius: options.greenBeltInnerRadius ?? 86,
      greenBeltOuterRadius: options.greenBeltOuterRadius ?? 120,
      gatewayRadius,
    },
  };

  return group;
}

export default createCityPlanImplementation;
