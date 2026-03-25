import * as THREE from "three";
import {
  ACROPOLIS_PEAK_3D,
  AGORA_CENTER_3D,
  HARBOR_GROUND_HEIGHT,
  HARBOR_CENTER_3D,
} from "./locations.js";

const DISTRICT_MARKERS = [
  {
    id: "agora",
    label: "Agora",
    theme: "agora",
    accent: 0xd9a441,
    glow: 0xf5d37f,
    anchor: new THREE.Vector3(AGORA_CENTER_3D.x + 12, AGORA_CENTER_3D.y, AGORA_CENTER_3D.z - 10),
  },
  {
    id: "harbor",
    label: "Harbor Quarter",
    theme: "harbor",
    accent: 0x2b86a8,
    glow: 0x82d7f4,
    anchor: new THREE.Vector3(
      HARBOR_CENTER_3D.x - 18,
      HARBOR_CENTER_3D.y + HARBOR_GROUND_HEIGHT,
      HARBOR_CENTER_3D.z + 18,
    ),
  },
  {
    id: "acropolis",
    label: "Acropolis",
    theme: "acropolis",
    accent: 0xd7cab4,
    glow: 0xffe7b0,
    anchor: new THREE.Vector3(ACROPOLIS_PEAK_3D.x + 10, ACROPOLIS_PEAK_3D.y, ACROPOLIS_PEAK_3D.z - 8),
  },
];

const TOUR_STAGES = [
  {
    markerId: "harbor",
    radius: 18,
    objective:
      "You begin in the Agora. Follow the blue harbor marker downhill to the docks.",
    completion:
      "The harbor opens to the sea. Now climb toward the ivory Acropolis beacon above the city.",
  },
  {
    markerId: "acropolis",
    radius: 16,
    objective:
      "Climb from the harbor to the Acropolis and reach the ivory beacon above the city.",
    completion:
      "You crossed Athens from market to sea to summit. The short walking tour is complete.",
  },
];

function createBannerCloth(color, width = 1.2, height = 1.8) {
  const cloth = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({
      color,
      side: THREE.DoubleSide,
      roughness: 0.66,
      metalness: 0.04,
    }),
  );
  cloth.castShadow = true;
  cloth.userData = {
    ...(cloth.userData || {}),
    swaySpeed: THREE.MathUtils.randFloat(1.2, 1.8),
    swayAmount: THREE.MathUtils.randFloat(0.05, 0.12),
    baseRotationZ: 0,
  };
  return cloth;
}

function createCrate(color = 0x8b6947, size = 0.9) {
  const crate = new THREE.Mesh(
    new THREE.BoxGeometry(size, size * 0.62, size),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.82,
      metalness: 0.04,
    }),
  );
  crate.castShadow = true;
  crate.receiveShadow = true;
  return crate;
}

function createAmphora(color = 0xbd8769) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.6,
    metalness: 0.08,
  });
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.13, 0.72, 12),
    material,
  );
  body.position.y = 0.36;
  body.castShadow = true;
  group.add(body);

  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.22, 12),
    material,
  );
  neck.position.y = 0.82;
  neck.castShadow = true;
  group.add(neck);

  return group;
}

function createBrazier(accent, glow) {
  const group = new THREE.Group();
  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.14, 1.1, 10),
    new THREE.MeshStandardMaterial({ color: 0x4a4339, roughness: 0.7, metalness: 0.28 }),
  );
  stand.position.y = 0.55;
  stand.castShadow = true;
  group.add(stand);

  const bowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.25, 0.24, 12),
    new THREE.MeshStandardMaterial({ color: accent, roughness: 0.5, metalness: 0.16 }),
  );
  bowl.position.y = 1.16;
  bowl.castShadow = true;
  group.add(bowl);

  const flame = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.18, 0),
    new THREE.MeshStandardMaterial({
      color: glow,
      emissive: glow,
      emissiveIntensity: 0.85,
      roughness: 0.18,
      metalness: 0,
    }),
  );
  flame.position.y = 1.42;
  flame.userData = {
    ...(flame.userData || {}),
    pulseSpeed: THREE.MathUtils.randFloat(4.5, 6.2),
    pulseOffset: Math.random() * Math.PI * 2,
  };
  group.add(flame);

  return { group, flame };
}

function sampleGroundY(terrain, anchor) {
  const fallbackY = Number.isFinite(anchor?.y) ? anchor.y : 0;
  const sampler = terrain?.userData?.getHeightAt;
  if (typeof sampler === "function") {
    const sampled = sampler(anchor.x, anchor.z);
    if (Number.isFinite(sampled)) {
      return Math.max(sampled, fallbackY);
    }
  }
  return fallbackY;
}

function markNoCollision(object) {
  object.userData = object.userData || {};
  object.userData.noCollision = true;
  object.traverse?.((child) => {
    child.userData = child.userData || {};
    child.userData.noCollision = true;
  });
}

function createLabelSprite(text, accentColor) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new THREE.Sprite();
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(22, 18, 12, 0.82)";
  ctx.fillRect(20, 24, canvas.width - 40, canvas.height - 48);
  ctx.strokeStyle = `#${accentColor.toString(16).padStart(6, "0")}`;
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 24, canvas.width - 40, canvas.height - 48);
  ctx.fillStyle = "#f7f1e4";
  ctx.font = "600 52px Georgia";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(9.5, 3, 1);
  sprite.renderOrder = 4;
  return sprite;
}

function createBaseMarker(marker) {
  const group = new THREE.Group();
  group.name = `DemoMarker_${marker.id}`;

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.3, 1.55, 0.65, 18),
    new THREE.MeshStandardMaterial({
      color: 0xa79a84,
      roughness: 0.88,
      metalness: 0.02,
    }),
  );
  base.position.y = 0.325;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.55, 0.08, 10, 32),
    new THREE.MeshStandardMaterial({
      color: marker.accent,
      emissive: marker.glow,
      emissiveIntensity: 0.45,
      roughness: 0.3,
      metalness: 0.12,
    }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 1.3;
  ring.castShadow = true;
  group.add(ring);

  const label = createLabelSprite(marker.label, marker.accent);
  label.position.set(0, 5.8, 0);
  group.add(label);

  const focusLight = new THREE.PointLight(marker.glow, 0.9, 16, 2);
  focusLight.position.set(0, 3.4, 0);
  group.add(focusLight);

  group.userData = group.userData || {};
  group.userData.ring = ring;
  group.userData.label = label;
  group.userData.focusLight = focusLight;
  return group;
}

function addHarborDetails(group, marker) {
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.13, 5.4, 12),
    new THREE.MeshStandardMaterial({ color: 0x7c664f, roughness: 0.76 }),
  );
  mast.position.y = 3.0;
  mast.castShadow = true;
  group.add(mast);

  const sail = new THREE.Mesh(
    new THREE.PlaneGeometry(2.3, 2.9),
    new THREE.MeshStandardMaterial({
      color: marker.accent,
      side: THREE.DoubleSide,
      roughness: 0.62,
    }),
  );
  sail.position.set(0.95, 3.2, 0);
  sail.rotation.y = Math.PI / 2;
  sail.castShadow = true;
  group.add(sail);

  const counterSail = sail.clone();
  counterSail.position.x = -0.95;
  counterSail.rotation.y = -Math.PI / 2;
  group.add(counterSail);

  const dockCanopy = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.14, 1.8),
    new THREE.MeshStandardMaterial({
      color: 0xe2d4b0,
      roughness: 0.7,
      metalness: 0.04,
    }),
  );
  dockCanopy.position.set(0, 1.8, -1.6);
  dockCanopy.castShadow = true;
  group.add(dockCanopy);

  for (const offset of [
    [-1.6, 0, 1.5],
    [1.4, 0, 1.3],
    [-0.5, 0.32, 1.85],
  ]) {
    const crate = createCrate(0x8f6f4c, offset[1] > 0 ? 0.72 : 0.9);
    crate.position.set(offset[0], 0.32 + offset[1], offset[2]);
    crate.rotation.y = Math.random() * Math.PI * 2;
    group.add(crate);
  }

  const palmTrunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.14, 3.2, 10),
    new THREE.MeshStandardMaterial({ color: 0x7b6549, roughness: 0.82 }),
  );
  palmTrunk.position.set(2.3, 1.6, -1.6);
  palmTrunk.castShadow = true;
  group.add(palmTrunk);

  for (let i = 0; i < 5; i++) {
    const frond = new THREE.Mesh(
      new THREE.ConeGeometry(0.48, 1.35, 6, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x4f7e52, roughness: 0.74 }),
    );
    frond.position.set(2.3, 3.4, -1.6);
    frond.rotation.x = Math.PI / 2 + THREE.MathUtils.degToRad(THREE.MathUtils.randFloat(-20, 14));
    frond.rotation.y = (i / 5) * Math.PI * 2;
    frond.castShadow = true;
    group.add(frond);
  }
}

function addAgoraDetails(group, marker) {
  const poleGeometry = new THREE.CylinderGeometry(0.09, 0.09, 3.2, 10);
  const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x8c775f, roughness: 0.8 });
  const awningMaterial = new THREE.MeshStandardMaterial({
    color: marker.accent,
    side: THREE.DoubleSide,
    roughness: 0.58,
  });

  for (const x of [-1.35, 1.35]) {
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.set(x, 1.8, 0);
    pole.castShadow = true;
    group.add(pole);
  }

  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.16, 1.7),
    awningMaterial,
  );
  canopy.position.y = 3.3;
  canopy.castShadow = true;
  group.add(canopy);

  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 1.8),
    awningMaterial,
  );
  banner.position.set(0, 2.35, -0.92);
  banner.castShadow = true;
  group.add(banner);

  const sideBannerLeft = createBannerCloth(0xc66f2c, 0.9, 1.5);
  sideBannerLeft.position.set(-1.55, 2.2, 0.75);
  sideBannerLeft.rotation.y = Math.PI / 10;
  group.add(sideBannerLeft);

  const sideBannerRight = createBannerCloth(0xb8442f, 0.9, 1.5);
  sideBannerRight.position.set(1.55, 2.2, 0.75);
  sideBannerRight.rotation.y = -Math.PI / 10;
  group.add(sideBannerRight);

  const amphoraA = createAmphora(0xbe7d57);
  amphoraA.position.set(-1.3, 0.04, 1.35);
  group.add(amphoraA);

  const amphoraB = createAmphora(0xd19a6d);
  amphoraB.position.set(1.05, 0.04, 1.28);
  amphoraB.rotation.y = 0.45;
  group.add(amphoraB);

  const marketBench = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.18, 0.72),
    new THREE.MeshStandardMaterial({ color: 0x8c6945, roughness: 0.8, metalness: 0.04 }),
  );
  marketBench.position.set(0, 0.86, 1.45);
  marketBench.castShadow = true;
  group.add(marketBench);
}

function addAcropolisDetails(group, marker) {
  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.34, 4.3, 16),
    new THREE.MeshStandardMaterial({
      color: 0xded7c7,
      roughness: 0.46,
      metalness: 0.04,
    }),
  );
  column.position.y = 2.5;
  column.castShadow = true;
  group.add(column);

  const bowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 0.72, 0.45, 16),
    new THREE.MeshStandardMaterial({
      color: 0x8b745d,
      roughness: 0.58,
      metalness: 0.08,
    }),
  );
  bowl.position.y = 4.8;
  bowl.castShadow = true;
  group.add(bowl);

  const flame = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 18, 18),
    new THREE.MeshStandardMaterial({
      color: marker.glow,
      emissive: marker.glow,
      emissiveIntensity: 0.7,
      roughness: 0.2,
      metalness: 0.0,
    }),
  );
  flame.position.y = 5.1;
  group.add(flame);
  group.userData.flame = flame;

  for (const x of [-1.9, 1.9]) {
    const sideColumn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.19, 2.8, 14),
      new THREE.MeshStandardMaterial({
        color: 0xd8d0bf,
        roughness: 0.5,
        metalness: 0.03,
      }),
    );
    sideColumn.position.set(x, 1.55, 0.2);
    sideColumn.castShadow = true;
    group.add(sideColumn);
  }

  const leftBrazier = createBrazier(0x8f6d4f, marker.glow);
  leftBrazier.group.position.set(-2.5, 0, 1.4);
  group.add(leftBrazier.group);

  const rightBrazier = createBrazier(0x8f6d4f, marker.glow);
  rightBrazier.group.position.set(2.5, 0, 1.4);
  group.add(rightBrazier.group);

  group.userData.extraFlames = [leftBrazier.flame, rightBrazier.flame];
}

function createDistrictMarker(marker, terrain) {
  const group = createBaseMarker(marker);

  if (marker.theme === "harbor") {
    addHarborDetails(group, marker);
  } else if (marker.theme === "agora") {
    addAgoraDetails(group, marker);
  } else {
    addAcropolisDetails(group, marker);
  }

  group.position.copy(marker.anchor);
  group.position.y = sampleGroundY(terrain, marker.anchor) + 0.05;
  markNoCollision(group);
  return group;
}

export function createDemoTour(scene, { terrain, questManager } = {}) {
  const group = new THREE.Group();
  group.name = "DemoTour";

  const markers = new Map();
  for (const marker of DISTRICT_MARKERS) {
    const object = createDistrictMarker(marker, terrain);
    group.add(object);
    markers.set(marker.id, object);
  }

  scene.add(group);

  let currentStageIndex = 0;
  let completed = false;

  const setQuestObjective = (objective) => {
    if (!questManager) return;
    if (questManager.currentQuest?.status === "In Progress") {
      questManager.updateObjective(objective);
    } else {
      questManager.startQuest("A Short Walk Through Athens", objective);
    }
  };

  const setActiveMarker = () => {
    const activeStage = TOUR_STAGES[currentStageIndex];
    for (const marker of DISTRICT_MARKERS) {
      const object = markers.get(marker.id);
      if (!object) continue;

      const isActive = activeStage?.markerId === marker.id;
      const ring = object.userData?.ring;
      const label = object.userData?.label;
      const flame = object.userData?.flame;
      const focusLight = object.userData?.focusLight;

      object.userData.active = isActive;
      object.scale.setScalar(isActive ? 1.06 : 0.96);

      if (ring?.material) {
        ring.material.emissiveIntensity = isActive ? 1.15 : 0.35;
      }
      if (label?.material) {
        label.material.opacity = isActive ? 1 : 0.82;
      }
      if (flame?.material) {
        flame.material.emissiveIntensity = isActive ? 1.05 : 0.52;
      }
      if (focusLight) {
        focusLight.intensity = isActive ? 1.45 : 0.62;
        focusLight.distance = isActive ? 20 : 13;
      }
    }
  };

  setQuestObjective(TOUR_STAGES[0].objective);
  setActiveMarker();

  return {
    group,
    update(playerPosition, elapsed = 0) {
      for (const marker of DISTRICT_MARKERS) {
        const object = markers.get(marker.id);
        if (!object) continue;
        const ring = object.userData?.ring;
        if (ring) {
          ring.rotation.z = elapsed * 0.45;
          ring.position.y = 1.3 + Math.sin(elapsed * 1.8 + object.position.x * 0.01) * 0.08;
        }
        const label = object.userData?.label;
        if (label) {
          label.position.y = 5.8 + Math.sin(elapsed * 1.4 + object.position.z * 0.02) * 0.12;
        }
        if (object.userData?.flame) {
          object.userData.flame.scale.setScalar(0.92 + Math.sin(elapsed * 5.5) * 0.08);
        }
        if (Array.isArray(object.userData?.extraFlames)) {
          object.userData.extraFlames.forEach((extraFlame, index) => {
            extraFlame.scale.setScalar(
              0.88 + Math.sin(elapsed * (4.7 + index * 0.4) + index) * 0.09,
            );
          });
        }
        object.traverse((child) => {
          const sway = child.userData?.swayAmount;
          if (!sway) return;
          const speed = child.userData?.swaySpeed ?? 1;
          const baseRotationZ = child.userData?.baseRotationZ ?? 0;
          child.rotation.z =
            baseRotationZ +
            Math.sin(elapsed * speed + object.position.x * 0.01) * sway;
        });
      }

      if (!playerPosition || completed) {
        return;
      }

      const stage = TOUR_STAGES[currentStageIndex];
      if (!stage) {
        return;
      }

      const marker = DISTRICT_MARKERS.find((entry) => entry.id === stage.markerId);
      if (!marker) {
        return;
      }

      const target = markers.get(marker.id);
      if (!target) {
        return;
      }

      const horizontalDistance = Math.hypot(
        playerPosition.x - target.position.x,
        playerPosition.z - target.position.z,
      );

      if (horizontalDistance > stage.radius) {
        return;
      }

      currentStageIndex += 1;
      if (currentStageIndex >= TOUR_STAGES.length) {
        completed = true;
        questManager?.completeQuest?.();
        setActiveMarker();
        return;
      }

      setQuestObjective(stage.completion);
      setActiveMarker();
    },
  };
}

export default createDemoTour;
