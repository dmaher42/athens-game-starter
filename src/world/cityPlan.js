import * as THREE from 'three';
import { AGORA_CENTER_3D } from './locations.js';

function toColor(value) {
  return value instanceof THREE.Color ? value.clone() : new THREE.Color(value);
}

function makeGravelTexture(width, depth, baseColor, speckColors = [], density = 0.045) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');

  const base = toColor(baseColor);
  context.fillStyle = base.getStyle();
  context.fillRect(0, 0, size, size);

  const palette = speckColors.length
    ? speckColors.map((entry) => toColor(entry))
    : [
        base.clone().lerp(new THREE.Color(0xffffff), 0.2),
        base.clone().lerp(new THREE.Color(0x000000), 0.25),
      ];

  const speckCount = Math.floor(size * size * density);
  for (let i = 0; i < speckCount; i++) {
    const tint = palette[i % palette.length];
    context.fillStyle = tint.getStyle();
    context.globalAlpha = 0.35 + Math.random() * 0.4;
    const radius = 0.3 + Math.random() * 2.2;
    const x = Math.random() * size;
    const y = Math.random() * size;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  context.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  const repeatX = Math.max(1, Math.round(width / 6));
  const repeatZ = Math.max(1, Math.round(depth / 6));
  texture.repeat.set(repeatX, repeatZ);
  texture.needsUpdate = true;
  return texture;
}

function createPavedStrip(width, depth, color) {
  const geometry = new THREE.PlaneGeometry(width, depth);
  geometry.rotateX(-Math.PI / 2);
  const texture = makeGravelTexture(width, depth, color);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.92,
    metalness: 0.03,
    map: texture,
  });
  // Keep the civic paving from z-fighting with the terrain.
  material.polygonOffset = true;
  material.polygonOffsetFactor = -1;
  material.polygonOffsetUnits = -1;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.renderOrder = 2;
  return mesh;
}

function createGreenStrip(width, depth, color) {
  const geometry = new THREE.PlaneGeometry(width, depth);
  geometry.rotateX(-Math.PI / 2);
  const texture = makeGravelTexture(
    width,
    depth,
    color,
    [
      toColor(color).clone().lerp(new THREE.Color(0xffffff), 0.15),
      toColor(color).clone().lerp(new THREE.Color(0x3d2b1f), 0.45),
    ],
    0.06
  );
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.98,
    metalness: 0.02,
    map: texture,
  });
  // Nudge greenswards above the ground so they do not flicker.
  material.polygonOffset = true;
  material.polygonOffsetFactor = -1;
  material.polygonOffsetUnits = -1;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.renderOrder = 2;
  return mesh;
}

function createCivicBuilding(options) {
  const {
    footprint = new THREE.Vector2(10, 14),
    height = 6,
    color = 0xe7d7c1,
    accentColor = 0xd8c3a5,
    roofColor = 0xb89b7f,
  } = options ?? {};

  const group = new THREE.Group();
  group.name = 'CivicBuilding';

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(footprint.x, height * 0.6, footprint.y),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.7,
      metalness: 0.05,
    })
  );
  base.castShadow = true;
  base.receiveShadow = true;
  base.position.y = height * 0.3;
  base.userData.noCollision = false;
  group.add(base);

  const columnMaterial = new THREE.MeshStandardMaterial({
    color: accentColor,
    roughness: 0.6,
    metalness: 0.05,
  });
  const columnGeometry = new THREE.CylinderGeometry(0.35, 0.35, height * 0.6, 16);
  const halfX = footprint.x * 0.5 - 0.8;
  const halfZ = footprint.y * 0.5 - 0.8;
  const columnCount = 4;
  for (let i = 0; i < columnCount; i++) {
    const t = i / (columnCount - 1);
    const columnFront = new THREE.Mesh(columnGeometry, columnMaterial);
    columnFront.position.set(THREE.MathUtils.lerp(-halfX, halfX, t), height * 0.3, halfZ);
    columnFront.castShadow = true;
    columnFront.userData.noCollision = false;
    group.add(columnFront);

    const columnBack = columnFront.clone();
    columnBack.position.z = -halfZ;
    group.add(columnBack);
  }

  const pediment = new THREE.Mesh(
    new THREE.ConeGeometry(footprint.x * 0.6, height * 0.4, 4),
    new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.55 })
  );
  pediment.rotation.y = Math.PI * 0.25;
  pediment.position.y = height * 0.8;
  pediment.castShadow = true;
  pediment.userData.noCollision = false;
  group.add(pediment);

  const roof = new THREE.Mesh(
    new THREE.CylinderGeometry(footprint.x * 0.55, footprint.x * 0.55, height * 0.25, 6),
    new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.6 })
  );
  roof.rotation.x = Math.PI / 2;
  roof.position.y = height * 0.95;
  roof.castShadow = true;
  roof.userData.noCollision = false;
  group.add(roof);

  return group;
}

function createHermaShrine() {
  const group = new THREE.Group();
  group.name = 'AgoraHermaShrine';

  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(4.8, 5.4, 1.2, 36),
    new THREE.MeshStandardMaterial({ color: 0xcbb69a, roughness: 0.7 })
  );
  plinth.receiveShadow = true;
  plinth.castShadow = true;
  plinth.position.y = 0.6;
  plinth.userData.noCollision = false;
  group.add(plinth);

  const altarTop = new THREE.Mesh(
    new THREE.CylinderGeometry(3.8, 3.9, 0.6, 24),
    new THREE.MeshStandardMaterial({ color: 0xe2d2b5, roughness: 0.55 })
  );
  altarTop.position.y = 1.2;
  altarTop.receiveShadow = true;
  altarTop.castShadow = true;
  altarTop.userData.noCollision = false;
  group.add(altarTop);

  const hermaBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 2.6, 1.4),
    new THREE.MeshStandardMaterial({ color: 0xd8c3a5, roughness: 0.6 })
  );
  hermaBase.position.y = 2.9;
  hermaBase.castShadow = true;
  hermaBase.userData.noCollision = false;
  group.add(hermaBase);

  const bust = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 24, 16),
    new THREE.MeshStandardMaterial({ color: 0xf0e6d2, roughness: 0.45 })
  );
  bust.position.y = 4.2;
  bust.castShadow = true;
  bust.userData.noCollision = false;
  group.add(bust);

  return group;
}

function createTorchStand() {
  const group = new THREE.Group();
  group.name = 'AgoraTorchStand';

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.7, 0.6, 10),
    new THREE.MeshStandardMaterial({ color: 0x9a7d56, roughness: 0.75 })
  );
  base.position.y = 0.3;
  base.receiveShadow = true;
  base.castShadow = true;
  base.userData.noCollision = false;
  group.add(base);

  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.3, 2.8, 12),
    new THREE.MeshStandardMaterial({ color: 0xcdb18b, roughness: 0.65 })
  );
  column.position.y = 1.7;
  column.receiveShadow = true;
  column.castShadow = true;
  column.userData.noCollision = false;
  group.add(column);

  const brazier = new THREE.Mesh(
    new THREE.ConeGeometry(0.7, 0.9, 12),
    new THREE.MeshStandardMaterial({
      color: 0x5b4636,
      roughness: 0.85,
      metalness: 0.1,
      emissive: new THREE.Color(0x3b2a1a),
      emissiveIntensity: 0.25,
    })
  );
  brazier.rotation.x = Math.PI;
  brazier.position.y = 3.1;
  brazier.castShadow = true;
  brazier.userData.noCollision = false;
  group.add(brazier);

  const flame = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 16, 12),
    new THREE.MeshStandardMaterial({
      color: 0xffb347,
      emissive: new THREE.Color(0xffa726),
      emissiveIntensity: 1.2,
    })
  );
  flame.position.y = 3.3;
  flame.userData.noCollision = true;
  group.add(flame);

  const light = new THREE.PointLight(0xffc978, 0.9, 14, 2.4);
  light.position.y = 3.3;
  group.add(light);

  return group;
}

export function createCivicDistrict(scene, options = {}) {
  const group = new THREE.Group();
  group.name = 'CivicDistrict';
  scene.add(group);

  const plazaLength = options.plazaLength ?? 80;
  const promenadeWidth = options.promenadeWidth ?? 14;
  const greensWidth = options.greensWidth ?? 10;
  const centerOption = options.center ?? AGORA_CENTER_3D;
  const terrainSampler =
    options.heightSampler ??
    options.terrainSampler ??
    options.terrain?.userData?.getHeightAt;

  const surfaceOffset = options.surfaceOffset ?? 0.05;

  const center = centerOption instanceof THREE.Vector3
    ? centerOption.clone()
    : new THREE.Vector3(
        centerOption?.x ?? 0,
        centerOption?.y ?? 0,
        centerOption?.z ?? 0
      );
  let baseHeight = Number.isFinite(center.y) ? center.y : 0;
  if (typeof terrainSampler === 'function') {
    const sampled = terrainSampler(center.x, center.z);
    if (Number.isFinite(sampled)) {
      baseHeight = sampled;
    }
  }

  group.position.set(center.x, baseHeight, center.z);

  const sampleLocalHeight = (offsetX = 0, offsetZ = 0, fallback = 0) => {
    if (typeof terrainSampler === 'function') {
      const worldX = center.x + offsetX;
      const worldZ = center.z + offsetZ;
      const sampled = terrainSampler(worldX, worldZ);
      if (Number.isFinite(sampled)) {
        return sampled - baseHeight + surfaceOffset;
      }
    }
    return fallback + surfaceOffset;
  };

  const promenade = createPavedStrip(promenadeWidth, plazaLength, 0xc6b293);
  promenade.receiveShadow = true;
  promenade.position.y = sampleLocalHeight(0, 0, promenade.position.y ?? 0);
  group.add(promenade);

  const greenLeft = createGreenStrip(greensWidth, plazaLength, 0xb39a78);
  greenLeft.position.x = -(promenadeWidth + greensWidth) / 2;
  greenLeft.position.y = sampleLocalHeight(greenLeft.position.x, 0, greenLeft.position.y ?? 0);
  group.add(greenLeft);

  const greenRight = greenLeft.clone();
  greenRight.position.x = (promenadeWidth + greensWidth) / 2;
  greenRight.position.y = sampleLocalHeight(greenRight.position.x, 0, 0);
  group.add(greenRight);

  const plazaNorth = createPavedStrip(
    promenadeWidth + greensWidth * 2,
    18,
    0xd3c6ad
  );
  plazaNorth.position.z = plazaLength / 2 + 9;
  plazaNorth.position.y = sampleLocalHeight(0, plazaNorth.position.z, plazaNorth.position.y ?? 0);
  group.add(plazaNorth);

  const plazaSouth = plazaNorth.clone();
  plazaSouth.position.z = -(plazaLength / 2 + 9);
  plazaSouth.position.y = sampleLocalHeight(0, plazaSouth.position.z, 0);
  group.add(plazaSouth);

  const shrine = createHermaShrine();
  shrine.position.set(0, sampleLocalHeight(0, 0, shrine.position.y ?? 0), 0);
  group.add(shrine);

  const buildingConfigs = [
    { position: new THREE.Vector3(-18, 0, -24), rotation: Math.PI / 2 },
    { position: new THREE.Vector3(-18, 0, -8), rotation: Math.PI / 2 },
    { position: new THREE.Vector3(-18, 0, 8), rotation: Math.PI / 2 },
    { position: new THREE.Vector3(-18, 0, 24), rotation: Math.PI / 2 },
    { position: new THREE.Vector3(18, 0, -24), rotation: -Math.PI / 2 },
    { position: new THREE.Vector3(18, 0, -8), rotation: -Math.PI / 2 },
    { position: new THREE.Vector3(18, 0, 8), rotation: -Math.PI / 2 },
    { position: new THREE.Vector3(18, 0, 24), rotation: -Math.PI / 2 },
  ];

  const palette = [
    { color: 0xe8dcc7, accent: 0xd7c3a5, roof: 0xb89b7f },
    { color: 0xe3d5ca, accent: 0xd2bba0, roof: 0xa97c50 },
    { color: 0xe6dfd0, accent: 0xdcc4a3, roof: 0xb5926d },
  ];

  for (let i = 0; i < buildingConfigs.length; i++) {
    const cfg = buildingConfigs[i];
    const paletteEntry = palette[i % palette.length];
    const building = createCivicBuilding({
      footprint: new THREE.Vector2(10, 14),
      height: 6.5,
      color: paletteEntry.color,
      accentColor: paletteEntry.accent,
      roofColor: paletteEntry.roof,
    });
    const localHeight = sampleLocalHeight(cfg.position.x, cfg.position.z, cfg.position.y ?? 0);
    building.position.set(cfg.position.x, localHeight, cfg.position.z);
    building.rotation.y = cfg.rotation;
    group.add(building);
  }

  const lampSpacing = 12;
  const lampCount = Math.floor(plazaLength / lampSpacing);
  for (let i = 0; i <= lampCount; i++) {
    const offset = -plazaLength / 2 + i * lampSpacing;
    const leftTorch = createTorchStand();
    const leftX = -promenadeWidth / 2 + 1.2;
    leftTorch.position.set(leftX, sampleLocalHeight(leftX, offset, leftTorch.position.y ?? 0), offset);
    group.add(leftTorch);

    const rightTorch = createTorchStand();
    const rightX = promenadeWidth / 2 - 1.2;
    const rightZ = offset + lampSpacing / 2;
    rightTorch.position.set(
      rightX,
      sampleLocalHeight(rightX, rightZ, rightTorch.position.y ?? 0),
      rightZ
    );
    group.add(rightTorch);
  }

  const curvePoints = [
    new THREE.Vector3(
      -promenadeWidth * 0.35,
      sampleLocalHeight(-promenadeWidth * 0.35, -plazaLength / 2 - 6, 0),
      -plazaLength / 2 - 6
    ),
    new THREE.Vector3(
      -promenadeWidth * 0.35,
      sampleLocalHeight(-promenadeWidth * 0.35, plazaLength / 2 + 6, 0),
      plazaLength / 2 + 6
    ),
    new THREE.Vector3(
      promenadeWidth * 0.35,
      sampleLocalHeight(promenadeWidth * 0.35, plazaLength / 2 + 6, 0),
      plazaLength / 2 + 6
    ),
    new THREE.Vector3(
      promenadeWidth * 0.35,
      sampleLocalHeight(promenadeWidth * 0.35, -plazaLength / 2 - 6, 0),
      -plazaLength / 2 - 6
    ),
  ];
  const walkingLoop = new THREE.CatmullRomCurve3(curvePoints, true, 'catmullrom', 0.1);

  return {
    group,
    walkingLoop,
    plazaLength,
    promenadeWidth,
  };
}

export default createCivicDistrict;
