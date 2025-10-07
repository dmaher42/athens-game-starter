import * as THREE from 'three';
import { AGORA_CENTER_3D } from './locations.js';

function createPavedStrip(width, depth, color) {
  const geometry = new THREE.PlaneGeometry(width, depth);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness: 0.05,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.userData.noCollision = true;
  return mesh;
}

function createGreenStrip(width, depth, color) {
  const geometry = new THREE.PlaneGeometry(width, depth);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 1,
    metalness: 0,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.userData.noCollision = true;
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

function createFountain() {
  const group = new THREE.Group();
  group.name = 'CityFountain';

  const basin = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5.6, 0.8, 40),
    new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.5 })
  );
  basin.receiveShadow = true;
  basin.castShadow = true;
  basin.position.y = 0.4;
  basin.userData.noCollision = false;
  group.add(basin);

  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(4.2, 4.2, 0.2, 32),
    new THREE.MeshStandardMaterial({
      color: 0x4fc3f7,
      transparent: true,
      opacity: 0.75,
      roughness: 0.1,
      metalness: 0.2,
    })
  );
  water.position.y = 0.6;
  water.receiveShadow = true;
  water.userData.noCollision = true;
  group.add(water);

  const obelisk = new THREE.Mesh(
    new THREE.ConeGeometry(1.1, 5.2, 4),
    new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.45 })
  );
  obelisk.castShadow = true;
  obelisk.position.y = 3.6;
  obelisk.userData.noCollision = false;
  group.add(obelisk);

  return group;
}

function createLampPost() {
  const group = new THREE.Group();
  group.name = 'CityLampPost';

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 3.4, 12),
    new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.7 })
  );
  pole.position.y = 1.7;
  pole.userData.noCollision = false;
  pole.castShadow = true;
  group.add(pole);

  const lampHousing = new THREE.Mesh(
    new THREE.ConeGeometry(0.45, 0.9, 12),
    new THREE.MeshStandardMaterial({ color: 0xfbc02d, emissive: new THREE.Color(0xf57f17), emissiveIntensity: 0.6 })
  );
  lampHousing.position.y = 3.5;
  lampHousing.userData.noCollision = false;
  lampHousing.castShadow = true;
  group.add(lampHousing);

  const bulb = new THREE.PointLight(0xfff5b5, 0.8, 16, 2);
  bulb.position.y = 3.5;
  group.add(bulb);

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
        return sampled - baseHeight;
      }
    }
    return fallback;
  };

  const promenade = createPavedStrip(promenadeWidth, plazaLength, 0xc3c2bb);
  promenade.receiveShadow = true;
  promenade.position.y = sampleLocalHeight(0, 0, promenade.position.y ?? 0);
  group.add(promenade);

  const greenLeft = createGreenStrip(greensWidth, plazaLength, 0x6b8a6f);
  greenLeft.position.x = -(promenadeWidth + greensWidth) / 2;
  greenLeft.position.y = sampleLocalHeight(greenLeft.position.x, 0, greenLeft.position.y ?? 0);
  group.add(greenLeft);

  const greenRight = greenLeft.clone();
  greenRight.position.x = (promenadeWidth + greensWidth) / 2;
  greenRight.position.y = sampleLocalHeight(greenRight.position.x, 0, greenRight.position.y ?? 0);
  group.add(greenRight);

  const plazaNorth = createPavedStrip(promenadeWidth + greensWidth * 2, 18, 0xbdb8ac);
  plazaNorth.position.z = plazaLength / 2 + 9;
  plazaNorth.position.y = sampleLocalHeight(0, plazaNorth.position.z, plazaNorth.position.y ?? 0);
  group.add(plazaNorth);

  const plazaSouth = plazaNorth.clone();
  plazaSouth.position.z = -(plazaLength / 2 + 9);
  plazaSouth.position.y = sampleLocalHeight(0, plazaSouth.position.z, plazaSouth.position.y ?? 0);
  group.add(plazaSouth);

  const fountain = createFountain();
  fountain.position.set(0, sampleLocalHeight(0, 0, fountain.position.y ?? 0), 0);
  group.add(fountain);

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
    const leftLamp = createLampPost();
    const leftX = -promenadeWidth / 2 + 1.2;
    leftLamp.position.set(leftX, sampleLocalHeight(leftX, offset, leftLamp.position.y ?? 0), offset);
    group.add(leftLamp);

    const rightLamp = createLampPost();
    const rightX = promenadeWidth / 2 - 1.2;
    const rightZ = offset + lampSpacing / 2;
    rightLamp.position.set(
      rightX,
      sampleLocalHeight(rightX, rightZ, rightLamp.position.y ?? 0),
      rightZ
    );
    group.add(rightLamp);
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
