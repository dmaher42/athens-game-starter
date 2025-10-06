import * as THREE from "three";
import { HARBOR_CENTER_3D } from "./locations.js";

function enableShadows(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
}

function createSupportPost(material, height, radiusTop, radiusBottom) {
  const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 12);
  const post = new THREE.Mesh(geometry, material);
  enableShadows(post);
  return post;
}

function createWoodMaterial(color) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.75,
    metalness: 0.05,
  });
}

function populatePosts(group, options) {
  const {
    width,
    length,
    spacing,
    offsetX = 0,
    offsetZ = 0,
    deckHeight,
    postMaterial,
  } = options;

  const postHeight = deckHeight + 3;
  const halfWidth = width / 2 - 0.6;
  const halfLength = length / 2 - 0.6;

  for (let z = -halfLength; z <= halfLength; z += spacing) {
    const leftPost = createSupportPost(postMaterial, postHeight, 0.45, 0.55);
    leftPost.position.set(offsetX - halfWidth, deckHeight - postHeight / 2, offsetZ + z);
    group.add(leftPost);

    const rightPost = createSupportPost(postMaterial, postHeight, 0.45, 0.55);
    rightPost.position.set(offsetX + halfWidth, deckHeight - postHeight / 2, offsetZ + z);
    group.add(rightPost);
  }
}

function createCrate(size, material) {
  const geometry = new THREE.BoxGeometry(size, size, size);
  const crate = new THREE.Mesh(geometry, material);
  enableShadows(crate);
  return crate;
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

  populatePosts(harbor, {
    width: mainWidth,
    length: mainLength,
    spacing: postSpacing,
    deckHeight,
    postMaterial,
  });

  const approach = new THREE.Mesh(
    new THREE.BoxGeometry(approachLength, 0.5, mainWidth - 2),
    deckMaterial
  );
  approach.position.set(mainWidth / 2 + approachLength / 2, deckHeight, 0);
  enableShadows(approach);
  harbor.add(approach);

  const walkwaySupports = new THREE.Group();
  const walkwayHalfWidth = (mainWidth - 2) / 2 - 0.6;
  const walkwayPostHeight = deckHeight + 3;
  for (let x = -approachLength / 2; x <= approachLength / 2; x += postSpacing) {
    const left = createSupportPost(postMaterial, walkwayPostHeight, 0.4, 0.5);
    left.position.set(x, deckHeight - walkwayPostHeight / 2, -walkwayHalfWidth);
    walkwaySupports.add(left);

    const right = createSupportPost(postMaterial, walkwayPostHeight, 0.4, 0.5);
    right.position.set(x, deckHeight - walkwayPostHeight / 2, walkwayHalfWidth);
    walkwaySupports.add(right);
  }
  walkwaySupports.position.x = mainWidth / 2 + approachLength / 2;
  harbor.add(walkwaySupports);

  const northSpur = new THREE.Mesh(new THREE.BoxGeometry(mainWidth - 4, 0.45, spurLength), deckMaterial);
  northSpur.position.set(-mainWidth / 2 + 1.2, deckHeight, spurLength / 2 + 2);
  enableShadows(northSpur);
  harbor.add(northSpur);

  populatePosts(harbor, {
    width: mainWidth - 4,
    length: spurLength,
    spacing: postSpacing,
    offsetX: -mainWidth / 2 + 1.2,
    offsetZ: spurLength / 2 + 2,
    deckHeight,
    postMaterial,
  });

  const southSpur = northSpur.clone();
  southSpur.position.z = -(spurLength / 2 + 2);
  harbor.add(southSpur);

  populatePosts(harbor, {
    width: mainWidth - 4,
    length: spurLength,
    spacing: postSpacing,
    offsetX: -mainWidth / 2 + 1.2,
    offsetZ: -(spurLength / 2 + 2),
    deckHeight,
    postMaterial,
  });

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
