import * as THREE from "three";
import {
  AGORA_CENTER_3D,
  HARBOR_CENTER_3D,
  getSeaLevelY,
  getHarborSeaLevel,
} from "./locations.js";

const HARBOR_RADIUS = 150;
const STREET_LEVEL_OFFSET = 2.5;
const SEABED_HEIGHT = -8.0;

function enableShadows(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
}

function buildQuay(centerToCity, harbor) {
  const quayLength = HARBOR_RADIUS * 1.6;
  const quayThickness = 6;
  const quayHeight = STREET_LEVEL_OFFSET - SEABED_HEIGHT;
  const tangent = new THREE.Vector2(-centerToCity.y, centerToCity.x);

  const quayGeometry = new THREE.BoxGeometry(quayLength, quayHeight, quayThickness);
  quayGeometry.translate(0, (STREET_LEVEL_OFFSET + SEABED_HEIGHT) / 2, 0);
  const quayMaterial = new THREE.MeshStandardMaterial({
    color: 0x6f7075,
    roughness: 0.45,
    metalness: 0.2,
  });

  const coastlinePoint = new THREE.Vector3(
    centerToCity.x * HARBOR_RADIUS,
    0,
    centerToCity.y * HARBOR_RADIUS,
  );

  const quay = new THREE.Mesh(quayGeometry, quayMaterial);
  quay.name = "HarborQuay";
  quay.position.copy(coastlinePoint);
  quay.rotation.y = Math.atan2(tangent.x, tangent.y);
  enableShadows(quay);
  harbor.add(quay);

  return { tangent, quayDepth: quayThickness, coastlinePoint, quayLength };
}

function addBollards(harbor, options) {
  const {
    deckCenter,
    deckDirection,
    deckPerp,
    deckLength,
    deckWidth,
    deckHeight,
  } = options;

  const bollardGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.7, 14);
  const bollardMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d3035,
    roughness: 0.6,
    metalness: 0.35,
  });

  const inset = deckWidth * 0.5 - 0.8;
  for (let f = 0; f <= deckLength; f += Math.max(8, deckLength / 6)) {
    const forward = deckDirection.clone().multiplyScalar(f - deckLength * 0.5);
    const left = deckPerp.clone().multiplyScalar(-inset);
    const right = deckPerp.clone().multiplyScalar(inset);
    for (const side of [left, right]) {
      const position = new THREE.Vector3().copy(deckCenter).add(forward).add(side);
      const bollard = new THREE.Mesh(bollardGeometry, bollardMaterial);
      bollard.position.set(position.x, deckHeight + 0.35, position.z);
      enableShadows(bollard);
      harbor.add(bollard);
    }
  }
}

function addPilings(harbor, options) {
  const {
    deckCenter,
    deckDirection,
    deckPerp,
    deckLength,
    deckWidth,
    deckHeight,
  } = options;

  const pilingHeight = deckHeight - SEABED_HEIGHT;
  const pilingGeometry = new THREE.CylinderGeometry(0.45, 0.55, pilingHeight, 12);
  const pilingMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a3a27,
    roughness: 0.78,
    metalness: 0.05,
  });

  const baseY = (deckHeight + SEABED_HEIGHT) / 2;
  const inset = deckWidth * 0.5 - 0.7;
  for (let f = 0; f <= deckLength; f += Math.max(6, deckLength / 7)) {
    const forward = deckDirection.clone().multiplyScalar(f - deckLength * 0.5);
    for (const side of [-inset, inset]) {
      const lateral = deckPerp.clone().multiplyScalar(side);
      const position = new THREE.Vector3()
        .copy(deckCenter)
        .add(forward)
        .add(lateral);
      const piling = new THREE.Mesh(pilingGeometry, pilingMaterial);
      piling.position.set(position.x, baseY, position.z);
      enableShadows(piling);
      harbor.add(piling);
    }
  }
}

function buildPier(harbor, config) {
  const {
    deckCenter,
    deckDirection,
    deckPerp,
    deckLength,
    deckWidth,
    deckHeight,
  } = config;

  const deckGeometry = new THREE.BoxGeometry(deckWidth, 0.6, deckLength);
  deckGeometry.translate(0, 0.3, 0);
  const deckMaterial = new THREE.MeshStandardMaterial({
    color: 0x7b5b3f,
    roughness: 0.75,
    metalness: 0.05,
  });

  const pier = new THREE.Mesh(deckGeometry, deckMaterial);
  pier.name = "HarborPier";
  pier.position.set(deckCenter.x, deckHeight, deckCenter.z);
  pier.rotation.y = Math.atan2(deckDirection.x, deckDirection.y);
  enableShadows(pier);
  harbor.add(pier);

  addPilings(harbor, config);
  addBollards(harbor, config);
}

function buildPiers(centerToCity, quayDetails, harbor, deckHeight) {
  const pierDirection = centerToCity.clone().multiplyScalar(-1);
  const pierPerp = new THREE.Vector2(-pierDirection.y, pierDirection.x);
  const pierLength = HARBOR_RADIUS * 0.6;
  const pierWidth = 6;
  const pierCount = 3;
  const spacing = quayDetails.quayLength / (pierCount + 1);
  const firstOffset = -quayDetails.quayLength / 2;

  for (let i = 0; i < pierCount; i++) {
    const offsetAlongQuay = firstOffset + (i + 1) * spacing;
    const alongQuay = quayDetails.tangent.clone().multiplyScalar(offsetAlongQuay);
    const pierBase = new THREE.Vector3()
      .copy(quayDetails.coastlinePoint)
      .add(new THREE.Vector3(alongQuay.x, deckHeight, alongQuay.y));
    const pierCenterOffset = pierDirection.clone().multiplyScalar(-(pierLength / 2 + quayDetails.quayDepth * 0.5));
    const deckCenter = pierBase.clone().add(new THREE.Vector3(pierCenterOffset.x, 0, pierCenterOffset.y));

    buildPier(harbor, {
      deckCenter,
      deckDirection: pierDirection,
      deckPerp: pierPerp,
      deckLength: pierLength,
      deckWidth: pierWidth,
      deckHeight,
    });
  }
}

export function createHarbor(scene, options = {}) {
  const harbor = new THREE.Group();
  harbor.name = "Harbor";

  const seaLevel = Number.isFinite(options.seaLevel)
    ? options.seaLevel
    : Number.isFinite(getSeaLevelY())
      ? getSeaLevelY()
      : getHarborSeaLevel();
  const streetLevel = seaLevel + STREET_LEVEL_OFFSET;

  const center = options.center ? options.center.clone() : HARBOR_CENTER_3D.clone();
  center.y = seaLevel;
  harbor.position.copy(center);

  const toCity = new THREE.Vector2(
    AGORA_CENTER_3D.x - center.x,
    AGORA_CENTER_3D.z - center.z,
  );
  if (toCity.lengthSq() === 0) {
    toCity.set(0, 1);
  }
  toCity.normalize();

  const quayDetails = buildQuay(toCity, harbor);
  buildPiers(toCity, quayDetails, harbor, streetLevel - center.y);

  if (scene) {
    scene.add(harbor);
  }

  return harbor;
}

export function updateHarborLighting() {}
