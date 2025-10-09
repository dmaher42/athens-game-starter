import * as THREE from "three";
import { HARBOR_CENTER_3D } from "./locations.js";

const _postMatrix = new THREE.Matrix4();
const _postPosition = new THREE.Vector3();
const _postScale = new THREE.Vector3(1, 1, 1);
const _identityQuaternion = new THREE.Quaternion();

function enableShadows(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
}

function createWoodMaterial(color) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.75,
    metalness: 0.05,
  });
}

function accumulateEdgePosts(target, options) {
  const {
    width,
    length,
    spacing,
    offsetX = 0,
    offsetZ = 0,
    deckHeight,
    postHeight,
    inset = 0.6,
  } = options;

  const halfWidth = width / 2 - inset;
  const halfLength = length / 2 - inset;
  const baseY = deckHeight - postHeight;

  for (let z = -halfLength; z <= halfLength + 1e-3; z += spacing) {
    target.push({ x: offsetX - halfWidth, y: baseY, z: offsetZ + z });
    target.push({ x: offsetX + halfWidth, y: baseY, z: offsetZ + z });
  }
}

function buildPostMesh(name, positions, { height, radiusTop, radiusBottom, material }) {
  if (!positions || positions.length === 0) {
    return null;
  }

  const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 12);
  geometry.translate(0, height / 2, 0);

  const mesh = new THREE.InstancedMesh(geometry, material, positions.length);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  for (let i = 0; i < positions.length; i++) {
    const position = positions[i];
    _postPosition.set(position.x, position.y, position.z);
    _postMatrix.compose(_postPosition, _identityQuaternion, _postScale);
    mesh.setMatrixAt(i, _postMatrix);
  }

  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

export function createHarbor(scene, options = {}) {
  const center = options.center ? options.center.clone() : HARBOR_CENTER_3D.clone();
  const mainLength = options.mainLength ?? 70;
  const mainWidth = options.mainWidth ?? 9;
  const deckHeight = options.deckHeight ?? 1.4;
  const approachLength = options.approachLength ?? 32;
  const spurLength = options.spurLength ?? 24;
  const postSpacing = options.postSpacing ?? 6;

  const deckMaterial = createWoodMaterial(0x7b5b3f);
  const postMaterial = createWoodMaterial(0x4a3a27);
  const trimMaterial = new THREE.MeshStandardMaterial({
    color: 0xd9d1b3,
    roughness: 0.4,
    metalness: 0.1,
  });

  const harbor = new THREE.Group();
  harbor.name = "Harbor";
  harbor.position.copy(center);

  const mainDeck = new THREE.Mesh(new THREE.BoxGeometry(mainWidth, 0.6, mainLength), deckMaterial);
  mainDeck.position.y = deckHeight;
  enableShadows(mainDeck);
  harbor.add(mainDeck);

  const pierPostPositions = [];
  const pierPostHeight = deckHeight + 3;
  accumulateEdgePosts(pierPostPositions, {
    width: mainWidth,
    length: mainLength,
    spacing: postSpacing,
    deckHeight,
    postHeight: pierPostHeight,
  });
  accumulateEdgePosts(pierPostPositions, {
    width: mainWidth - 4,
    length: spurLength,
    spacing: postSpacing,
    deckHeight,
    postHeight: pierPostHeight,
    offsetX: -mainWidth / 2 + 1.2,
    offsetZ: spurLength / 2 + 2,
  });
  accumulateEdgePosts(pierPostPositions, {
    width: mainWidth - 4,
    length: spurLength,
    spacing: postSpacing,
    deckHeight,
    postHeight: pierPostHeight,
    offsetX: -mainWidth / 2 + 1.2,
    offsetZ: -(spurLength / 2 + 2),
  });

  const pierPosts = buildPostMesh("HarborPierPosts", pierPostPositions, {
    height: pierPostHeight,
    radiusTop: 0.45,
    radiusBottom: 0.55,
    material: postMaterial,
  });
  if (pierPosts) {
    harbor.add(pierPosts);
  }

  const approach = new THREE.Mesh(
    new THREE.BoxGeometry(approachLength, 0.5, mainWidth - 2),
    deckMaterial
  );
  approach.position.set(mainWidth / 2 + approachLength / 2, deckHeight, 0);
  enableShadows(approach);
  harbor.add(approach);

  const walkwayPostHeight = deckHeight + 3;
  const walkwayHalfWidth = (mainWidth - 2) / 2 - 0.6;
  const walkwayPosts = [];
  const walkwayBaseX = mainWidth / 2 + approachLength / 2;
  const walkwayBaseY = deckHeight - walkwayPostHeight;
  for (let x = -approachLength / 2; x <= approachLength / 2 + 1e-3; x += postSpacing) {
    walkwayPosts.push({ x: walkwayBaseX + x, y: walkwayBaseY, z: -walkwayHalfWidth });
    walkwayPosts.push({ x: walkwayBaseX + x, y: walkwayBaseY, z: walkwayHalfWidth });
  }
  const walkwayPostMesh = buildPostMesh("HarborWalkwayPosts", walkwayPosts, {
    height: walkwayPostHeight,
    radiusTop: 0.4,
    radiusBottom: 0.5,
    material: postMaterial,
  });
  if (walkwayPostMesh) {
    harbor.add(walkwayPostMesh);
  }

  const northSpur = new THREE.Mesh(new THREE.BoxGeometry(mainWidth - 4, 0.45, spurLength), deckMaterial);
  northSpur.position.set(-mainWidth / 2 + 1.2, deckHeight, spurLength / 2 + 2);
  enableShadows(northSpur);
  harbor.add(northSpur);

  const southSpur = northSpur.clone();
  southSpur.position.z = -(spurLength / 2 + 2);
  harbor.add(southSpur);

  const railingGeometry = new THREE.BoxGeometry(0.2, 1.1, mainLength);
  const railLeft = new THREE.Mesh(railingGeometry, trimMaterial);
  railLeft.position.set(-mainWidth / 2 + 0.6, deckHeight + 0.8, 0);
  enableShadows(railLeft);
  harbor.add(railLeft);

  const railRight = railLeft.clone();
  railRight.position.x = mainWidth / 2 - 0.6;
  harbor.add(railRight);

  const bollardGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.8, 16);
  const bollardMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d3035,
    roughness: 0.6,
    metalness: 0.4,
  });

  const bollardPositions = [
    new THREE.Vector3(-mainWidth / 2 + 1.3, deckHeight + 0.4, spurLength + 3),
    new THREE.Vector3(-mainWidth / 2 + 1.3, deckHeight + 0.4, -spurLength - 3),
    new THREE.Vector3(mainWidth / 2 - 1.3, deckHeight + 0.4, mainLength / 2 - 6),
    new THREE.Vector3(mainWidth / 2 - 1.3, deckHeight + 0.4, -mainLength / 2 + 6),
  ];

  for (const position of bollardPositions) {
    const bollard = new THREE.Mesh(bollardGeometry, bollardMaterial);
    bollard.position.copy(position);
    enableShadows(bollard);
    harbor.add(bollard);
  }

  const crateMaterial = createWoodMaterial(0x8f6b45);
  const crateA = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 2.4), crateMaterial);
  crateA.position.set(mainWidth / 2 - 2, deckHeight + 1.2, -mainLength / 4);
  enableShadows(crateA);
  harbor.add(crateA);

  const crateB = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), crateMaterial);
  crateB.position.set(mainWidth / 2 - 3.4, deckHeight + 0.8, -mainLength / 4 + 3);
  enableShadows(crateB);
  harbor.add(crateB);

  const crateC = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), crateMaterial);
  crateC.position.set(mainWidth / 2 - 2.4, deckHeight + 0.9, -mainLength / 4 - 2.4);
  enableShadows(crateC);
  harbor.add(crateC);

  const lamp = new THREE.Group();
  lamp.name = "HarborLamp";
  lamp.position.set(mainWidth / 2 + approachLength - 4, 0, 0);

  const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 4, 16), trimMaterial);
  lampPole.position.y = 2;
  lampPole.castShadow = true;
  lampPole.receiveShadow = false;
  lamp.add(lampPole);

  const lampArm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 1.6), trimMaterial);
  lampArm.position.set(0, 3.4, 0.6);
  enableShadows(lampArm);
  lamp.add(lampArm);

  const lampBulbMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: new THREE.Color(0xfff2c8),
    emissiveIntensity: 0,
  });
  const lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), lampBulbMaterial);
  lampBulb.position.set(0, 3.2, 1.2);
  lampBulb.castShadow = false;
  lamp.add(lampBulb);

  const lampLight = new THREE.PointLight(0xfff2c8, 0, 18, 2);
  lampLight.position.copy(lampBulb.position);
  lampLight.castShadow = false;
  lamp.add(lampLight);

  const lampState = {
    light: lampLight,
    material: lampBulbMaterial,
    baseIntensity: 1.4,
    overrideState: null,
  };

  lamp.userData.interactable = true;
  lamp.userData.highlightTarget = lampBulb;
  lamp.userData.light = lampLight;
  lamp.userData.onUse = () => {
    const state = lampState.overrideState;
    if (state === null) {
      lampState.overrideState = true;
    } else if (state === true) {
      lampState.overrideState = false;
    } else {
      lampState.overrideState = null;
    }
  };

  harbor.userData.lamp = lampState;

  harbor.add(lamp);

  harbor.userData.posts = {
    pier: pierPosts,
    walkway: walkwayPostMesh,
  };

  scene.add(harbor);
  return harbor;
}

export function updateHarborLighting(harbor, nightFactor = 0) {
  if (!harbor) return;
  const lampState = harbor.userData?.lamp;
  if (!lampState) return;

  const clamped = THREE.MathUtils.clamp(nightFactor, 0, 1);
  let intensity = THREE.MathUtils.lerp(0, lampState.baseIntensity, clamped);
  if (lampState.overrideState === true) {
    intensity = lampState.baseIntensity;
  } else if (lampState.overrideState === false) {
    intensity = 0;
  }

  lampState.light.intensity = intensity;

  if (lampState.material) {
    const normalized = lampState.baseIntensity > 0 ? intensity / lampState.baseIntensity : 0;
    lampState.material.emissiveIntensity = normalized > 0 ? 1.6 * normalized : 0;
  }
}
