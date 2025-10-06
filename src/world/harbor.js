import * as THREE from "three";
import { HARBOR_CENTER_3D, SEA_LEVEL } from "./locations.js";

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

function createCrate(size, material) {
  const geometry = new THREE.BoxGeometry(size, size, size);
  const crate = new THREE.Mesh(geometry, material);
  enableShadows(crate);
  return crate;
}

const _postDummy = new THREE.Object3D();

function createPostsMesh(postMaterial, positions, deckHeight) {
  if (positions.length === 0) {
    return null;
  }

  const postHeight = deckHeight + 3;
  const postGeometry = new THREE.CylinderGeometry(0.45, 0.55, postHeight, 12);
  const instanced = new THREE.InstancedMesh(postGeometry, postMaterial, positions.length);
  instanced.castShadow = true;
  instanced.receiveShadow = true;

  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];
    _postDummy.position.copy(pos);
    _postDummy.updateMatrix();
    instanced.setMatrixAt(i, _postDummy.matrix);
  }
  instanced.instanceMatrix.needsUpdate = true;
  instanced.name = "HarborPosts";
  return instanced;
}

export function createHarbor(scene, options = {}) {
  const center = options.center ? options.center.clone() : HARBOR_CENTER_3D.clone();
  if (!Number.isFinite(center.y)) {
    center.y = SEA_LEVEL;
  }
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

  const postPositions = [];

  const mainDeck = new THREE.Mesh(new THREE.BoxGeometry(mainWidth, 0.6, mainLength), deckMaterial);
  mainDeck.position.y = deckHeight;
  enableShadows(mainDeck);
  harbor.add(mainDeck);

  const postHeight = deckHeight + 3;
  const postBaseY = deckHeight - postHeight / 2;
  const halfMainWidth = mainWidth / 2 - 0.6;
  const halfMainLength = mainLength / 2 - 0.6;
  for (let z = -halfMainLength; z <= halfMainLength; z += postSpacing) {
    postPositions.push(new THREE.Vector3(-halfMainWidth, postBaseY, z));
    postPositions.push(new THREE.Vector3(halfMainWidth, postBaseY, z));
  }

  const approach = new THREE.Mesh(
    new THREE.BoxGeometry(approachLength, 0.5, mainWidth - 2),
    deckMaterial
  );
  approach.position.set(mainWidth / 2 + approachLength / 2, deckHeight, 0);
  enableShadows(approach);
  harbor.add(approach);

  const walkwayHalfWidth = (mainWidth - 2) / 2 - 0.6;
  const walkwayCenterX = mainWidth / 2 + approachLength / 2;
  for (let x = -approachLength / 2; x <= approachLength / 2; x += postSpacing) {
    const worldX = walkwayCenterX + x;
    postPositions.push(new THREE.Vector3(worldX, postBaseY, -walkwayHalfWidth));
    postPositions.push(new THREE.Vector3(worldX, postBaseY, walkwayHalfWidth));
  }

  const northSpur = new THREE.Mesh(new THREE.BoxGeometry(mainWidth - 4, 0.45, spurLength), deckMaterial);
  northSpur.position.set(-mainWidth / 2 + 1.2, deckHeight, spurLength / 2 + 2);
  enableShadows(northSpur);
  harbor.add(northSpur);

  const spurHalfWidth = (mainWidth - 4) / 2 - 0.6;
  const spurHalfLength = spurLength / 2 - 0.6;
  const spurOffsetX = -mainWidth / 2 + 1.2;
  const northOffsetZ = spurLength / 2 + 2;
  for (let z = -spurHalfLength; z <= spurHalfLength; z += postSpacing) {
    postPositions.push(
      new THREE.Vector3(spurOffsetX - spurHalfWidth, postBaseY, northOffsetZ + z)
    );
    postPositions.push(
      new THREE.Vector3(spurOffsetX + spurHalfWidth, postBaseY, northOffsetZ + z)
    );
  }

  const southSpur = northSpur.clone();
  southSpur.position.z = -(spurLength / 2 + 2);
  harbor.add(southSpur);

  const southOffsetZ = -(spurLength / 2 + 2);
  for (let z = -spurHalfLength; z <= spurHalfLength; z += postSpacing) {
    postPositions.push(
      new THREE.Vector3(spurOffsetX - spurHalfWidth, postBaseY, southOffsetZ + z)
    );
    postPositions.push(
      new THREE.Vector3(spurOffsetX + spurHalfWidth, postBaseY, southOffsetZ + z)
    );
  }

  const postsMesh = createPostsMesh(postMaterial, postPositions, deckHeight);
  if (postsMesh) {
    harbor.add(postsMesh);
  }

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
  const crateA = createCrate(2.4, crateMaterial);
  crateA.position.set(mainWidth / 2 - 2, deckHeight + 1.2, -mainLength / 4);
  harbor.add(crateA);

  const crateB = createCrate(1.6, crateMaterial);
  crateB.position.set(mainWidth / 2 - 3.4, deckHeight + 0.8, -mainLength / 4 + 3);
  harbor.add(crateB);

  const crateC = createCrate(1.8, crateMaterial);
  crateC.position.set(mainWidth / 2 - 2.4, deckHeight + 0.9, -mainLength / 4 - 2.4);
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
    emissiveIntensity: 1.6,
  });
  const lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), lampBulbMaterial);
  lampBulb.position.set(0, 3.2, 1.2);
  lampBulb.castShadow = false;
  lamp.add(lampBulb);

  const lampLight = new THREE.PointLight(0xfff2c8, 1.4, 18, 2);
  lampLight.position.copy(lampBulb.position);
  lampLight.castShadow = true;
  lamp.add(lampLight);

  lamp.userData.interactable = true;
  lamp.userData.highlightTarget = lampBulb;
  lamp.userData.light = lampLight;
  lamp.userData.onUse = (object) => {
    const light = object.userData.light;
    if (!light) return;
    const active = light.intensity > 0.1;
    light.intensity = active ? 0 : 1.4;
    lampBulbMaterial.emissiveIntensity = active ? 0 : 1.6;
  };

  harbor.add(lamp);

  scene.add(harbor);
  return harbor;
}
