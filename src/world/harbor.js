import { createMerchantShip, createTriremeShip, createFishingSkiff, createOffshoreGalley } from './harborShips.js';
import { batchStaticMeshes } from '../utils/staticRenderBatches.js';
import * as THREE from "three";
import { harborShoreX, harborCoastHeight } from "./harborCoast.js";
import { placeHarborOnLand, createCurvedHarborQuays, createHarborBoardingRamp } from "./harborPlacement.js";
import { IS_DEV } from "../utils/env.js";
import {
  HARBOR_WATER_BOUNDS,
  HARBOR_WATER_CENTER,
  HARBOR_WATER_EAST_LIMIT,
  getSeaLevelY,
  HARBOR_GROUND_HEIGHT,
  getCityGroundY,
  HARBOR_CENTER_3D,
  HARBOR_LAND_APPROACH_X,
} from "./locations.js";
import {
  findDockSlots,
  findRaisedPlatformSlots,
  snapToGridSlot,
  isInHarborZone,
  isRaisedPlatformZone,
  analyzeHarborZone,
  HARBOR_ZONE_CONFIG,
} from "./coastalZones.js";
import { makeAncientWoodMaterial, makeMonumentalStoneMaterial } from "./materials.js";

const DOCK_SECTION_LENGTH = 9.5;
const DOCK_SECTION_WIDTH = 5.8;
const DOCK_THICKNESS = 0.45;
const DOCK_POST_HEIGHT = 1.6;
const DOCK_GAP = 0.35;
const DOCK_LIFT = HARBOR_GROUND_HEIGHT; // Raised slightly more to clear water z-fighting
const QUAY_EDGE_X = 57;
const QUAY_SPAN_NORTH = -30;
const QUAY_SPAN_SOUTH = 34;
const waterTextureLoader = new THREE.TextureLoader();

let sharedShipWood = null;
let sharedQuayStone = null;
function getQuayStone() { if (!sharedQuayStone) { sharedQuayStone = makeMonumentalStoneMaterial(); sharedQuayStone.roughness = 0.98; sharedQuayStone.metalness = 0; sharedQuayStone.clearcoat = 0; sharedQuayStone.color.set(0xa5a69f); sharedQuayStone.userData.harborWarmth=.035; } return sharedQuayStone; }
function getShipWood() { return sharedShipWood ||= makeAncientWoodMaterial(); }

// Weathering is local to the pier: no global sunlight or ship-deck changes.
let sharedPierWood;
function getPierWood(){
 if(sharedPierWood)return sharedPierWood;
 const size=128,pixels=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const board=Math.floor(y/16),grain=2.4*Math.sin(y*1.2+Math.sin(x*.08))+.9*Math.sin(x*.17+y*.5),tone=((board*13)%11)-5,k=(y*size+x)*4;
  pixels[k]=Math.round(119+tone+grain);pixels[k+1]=Math.round(117+tone+grain);pixels[k+2]=Math.round(110+tone*.8+grain);pixels[k+3]=255;
 }
 const map=new THREE.DataTexture(pixels,size,size,THREE.RGBAFormat);map.name='SharedWeatheredPierGrain';map.colorSpace=THREE.SRGBColorSpace;map.generateMipmaps=true;map.minFilter=THREE.LinearMipmapLinearFilter;map.magFilter=THREE.LinearFilter;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=4;map.needsUpdate=true;
 sharedPierWood=new THREE.MeshStandardMaterial({map,roughness:.97,metalness:0,envMapIntensity:.2});sharedPierWood.name='WeatheredPierTimber';sharedPierWood.userData.harborWarmth=.025;return sharedPierWood;
}

const BOAT_STYLES = [
  { hull: 0x2f6e8d, accent: 0xe2a86a },
  { hull: 0x2a5879, accent: 0xd08b58 },
  { hull: 0x3a7aa1, accent: 0xe9b46d },
  { hull: 0x2e6f9d, accent: 0xffa040 }, // Added richer variant
  { hull: 0x247792, accent: 0xffb350 }, // Added richer variant
];

function enableShadows(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
}

let sharedDockMaterials = null;
const sharedDockDecks = new Map();
const sharedDockPosts = new THREE.CylinderGeometry(0.35, 0.42, DOCK_POST_HEIGHT + 3.2, 10);
function addHarborDeckJoints(harbor) {
  harbor.updateWorldMatrix(true, true);
  const inverse = harbor.matrixWorld.clone().invert(), vertices = [];
  harbor.traverse(deck => {
    if (!deck.isMesh || !['HarborPierDeck','HarborMerchantBoarding','HarborNavalBoarding'].includes(deck.name)) return;
    if (!deck.geometry.boundingBox) deck.geometry.computeBoundingBox();
    const bounds = deck.geometry.boundingBox, transform = inverse.clone().multiply(deck.matrixWorld);
    for (let x=bounds.min.x+0.72; x<bounds.max.x-0.15; x+=0.72) {
      for (const z of [bounds.min.z+0.06,bounds.max.z-0.06]) {
        const point = new THREE.Vector3(x,bounds.max.y+0.008,z).applyMatrix4(transform);
        vertices.push(point.x,point.y,point.z);
      }
    }
  });
  const joints = new THREE.LineSegments(
    new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(vertices,3)),
    new THREE.LineBasicMaterial({color:0x53534d,transparent:true,opacity:0.5,depthWrite:false}),
  );
  joints.name='HarborDeckJoints';joints.userData.noCollision=true;harbor.add(joints);
}
function createDockSection(seaLevel, { length = DOCK_SECTION_LENGTH, width = DOCK_SECTION_WIDTH } = {}) {
  if (!sharedDockMaterials) {
    const woodMaterial = getPierWood();
    const postMaterial = woodMaterial.clone();
    if (postMaterial.map) {
      postMaterial.map = postMaterial.map.clone();
      postMaterial.map.repeat.set(1, 2);
    }
    sharedDockMaterials = {woodMaterial, postMaterial};
  }
  const {woodMaterial, postMaterial} = sharedDockMaterials;
  const key = `${length}:${width}`;
  if (!sharedDockDecks.has(key)) sharedDockDecks.set(key, new THREE.BoxGeometry(length, DOCK_THICKNESS, width));
  const deck = new THREE.Mesh(sharedDockDecks.get(key), woodMaterial);
  deck.name = 'HarborPierDeck';
  deck.position.y = -HARBOR_GROUND_HEIGHT + DOCK_LIFT - DOCK_THICKNESS * 0.5;
  enableShadows(deck);
  const postGeometry = sharedDockPosts;

  const posts = new THREE.Group();
  const postY = -HARBOR_GROUND_HEIGHT + DOCK_LIFT - (DOCK_POST_HEIGHT + 3.2) * 0.5;
  const offsets = [
    [length * 0.5 - 0.9, width * 0.5 - 0.7],
    [-length * 0.5 + 0.9, width * 0.5 - 0.7],
    [length * 0.5 - 0.9, -width * 0.5 + 0.7],
    [-length * 0.5 + 0.9, -width * 0.5 + 0.7],
  ];
  for (const [x, z] of offsets) {
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.position.set(x, postY, z);
    post.userData.ignoreTerrainCollision = true;
    enableShadows(post);
    posts.add(post);
  }

  const section = new THREE.Group();
  section.name = "HarborDockSection";
  section.add(deck);
  section.add(posts);
  section.userData.length = length;
  section.userData.width = width;
  section.userData.seaLevel = seaLevel;
  return section;
}

function createPierLine(startX, z, sectionCount, seaLevel) {
  const pier = new THREE.Group();
  pier.name = "HarborPier";
  const sections = [];

  let cursorX = startX;
  for (let i = 0; i < sectionCount; i++) {
    const section = createDockSection(seaLevel);
    // Local Y relative to harbor group origin
    section.position.set(cursorX, 0, z);
    pier.add(section);
    sections.push(section);
    cursorX -= section.userData.length - DOCK_GAP;
  }

  return { pier, sections };
}

function createVerticalPierLine(x, startZ, sectionCount, seaLevel) {
  const pier = new THREE.Group();
  pier.name = "HarborPier";
  const sections = [];

  let cursorZ = startZ;
  for (let i = 0; i < sectionCount; i++) {
    const section = createDockSection(seaLevel);
    // Rotate 90 degrees for north-south orientation
    section.rotation.y = Math.PI / 2;
    section.position.set(x, 0, cursorZ);
    pier.add(section);
    sections.push(section);
    cursorZ -= section.userData.length - DOCK_GAP;
  }

  return { pier, sections };
}

function createFishingBoat(options) { return createFishingSkiff({ ...options, woodMaterial: getShipWood() }); }

function createHeroHarborShip(options) { return createMerchantShip({ ...options, woodMaterial: getShipWood() }); }

function createCrateCluster() {
  const group = new THREE.Group();
  group.name = "HarborCrateCluster";
  const geometry = new THREE.BoxGeometry(1.5, 1.2, 1.1);
  const material = new THREE.MeshStandardMaterial({
    color: 0x90785c,
    roughness: 0.6,
    metalness: 0.06,
  });

  const count = 3 + Math.floor(Math.random() * 2);
  for (let i = 0; i < count; i++) {
    const crate = new THREE.Mesh(geometry, material);
    crate.position.set(THREE.MathUtils.randFloatSpread(1.6), 0.6 + i * 0.4, THREE.MathUtils.randFloatSpread(1.4));
    enableShadows(crate);
    group.add(crate);
  }
  return group;
}

function createBarrelCluster() {
  const group = new THREE.Group();
  group.name = "HarborBarrels";
  const barrelGeometry = new THREE.CylinderGeometry(0.5, 0.55, 1.1, 12);
  const barrelMaterial = new THREE.MeshStandardMaterial({
    color: 0x6d4f3a,
    roughness: 0.58,
    metalness: 0.05,
  });

  const count = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < count; i++) {
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
    barrel.position.set(THREE.MathUtils.randFloatSpread(1.4), 0.55, THREE.MathUtils.randFloatSpread(1.2));
    enableShadows(barrel);
    group.add(barrel);
  }
  return group;
}

function createAmphoraStack(count = 4) {
  const group = new THREE.Group();
  group.name = "HarborAmphoraStack";
  const material = new THREE.MeshStandardMaterial({
    color: 0xb67a54,
    roughness: 0.66,
    metalness: 0.06,
  });

  for (let i = 0; i < count; i++) {
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.18, 0.82, 12),
      material,
    );
    body.position.set(
      THREE.MathUtils.randFloatSpread(1.2),
      0.42 + (i % 2) * 0.08,
      THREE.MathUtils.randFloatSpread(1.0),
    );
    enableShadows(body);
    group.add(body);
  }

  return group;
}

function createMarketStall({ width = 4.2, depth = 2.8, cloth = 0xc4683b } = {}) {
  const stall = new THREE.Group();
  stall.name = "HarborMarketStall";

  const postMaterial = new THREE.MeshStandardMaterial({
    color: 0x815f43,
    roughness: 0.8,
    metalness: 0.02,
  });
  const clothMaterial = new THREE.MeshStandardMaterial({
    color: cloth,
    side: THREE.DoubleSide,
    roughness: 0.88,
    metalness: 0.02,
  });

  const postOffsets = [
    [width * 0.5, depth * 0.5],
    [-width * 0.5, depth * 0.5],
    [width * 0.5, -depth * 0.5],
    [-width * 0.5, -depth * 0.5],
  ];
  postOffsets.forEach(([x, z]) => {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 2.1, 0.14),
      postMaterial,
    );
    post.position.set(x, 1.05, z);
    enableShadows(post);
    stall.add(post);
  });

  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.5, 0.16, depth + 0.5),
    clothMaterial,
  );
  canopy.position.y = 2.1;
  canopy.rotation.z = THREE.MathUtils.degToRad(1.5);
  enableShadows(canopy);
  stall.add(canopy);

  const counter = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.86, 0.36, depth * 0.56),
    new THREE.MeshStandardMaterial({ color: 0x9b744d, roughness: 0.76, metalness: 0.04 }),
  );
  counter.position.y = 0.8;
  enableShadows(counter);
  stall.add(counter);

  return stall;
}

function createHarborCrane() {
  const crane = new THREE.Group();
  crane.name = "HarborCrane";

  const timber = new THREE.MeshStandardMaterial({
    color: 0x7a5c3d,
    roughness: 0.82,
    metalness: 0.02,
  });
  const rope = new THREE.MeshStandardMaterial({
    color: 0xc3af8b,
    roughness: 0.92,
    metalness: 0,
  });

  const mast = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 6.2, 0.42),
    timber,
  );
  mast.position.y = 3.1;
  enableShadows(mast);
  crane.add(mast);

  const arm = new THREE.Mesh(
    new THREE.BoxGeometry(5.6, 0.32, 0.32),
    timber,
  );
  arm.position.set(2.1, 5.7, 0);
  arm.rotation.z = THREE.MathUtils.degToRad(-12);
  enableShadows(arm);
  crane.add(arm);

  const brace = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 4.2, 0.22),
    timber,
  );
  brace.position.set(1.3, 3.8, 0);
  brace.rotation.z = THREE.MathUtils.degToRad(32);
  enableShadows(brace);
  crane.add(brace);

  const line = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 3.4, 6),
    rope,
  );
  line.position.set(4.4, 4.15, 0);
  crane.add(line);

  const hookLoad = createCrateCluster();
  hookLoad.scale.setScalar(0.72);
  hookLoad.position.set(4.35, 2.3, 0);
  crane.add(hookLoad);

  return crane;
}

function createCurvedRope(start, end, { sag = 0.9, color = 0xbda27d, radius = 0.07 } = {}) {
  const points = [
    start.clone(),
    start.clone().lerp(end, 0.33).add(new THREE.Vector3(0, -sag, 0)),
    start.clone().lerp(end, 0.66).add(new THREE.Vector3(0, -sag * 0.85, 0)),
    end.clone(),
  ];
  const curve = new THREE.CatmullRomCurve3(points);
  const rope = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 12, radius, 6, false),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.96,
      metalness: 0,
    }),
  );
  enableShadows(rope);
  return rope;
}

function createRopeCoil({ radius = 0.52, turns = 3, color = 0xb49468 } = {}) {
  const points = [];
  for (let i = 0; i <= turns * 20; i++) {
    const t = i / (turns * 20);
    const angle = t * Math.PI * 2 * turns;
    const currentRadius = THREE.MathUtils.lerp(radius, radius * 0.58, t);
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * currentRadius,
        t * 0.02,
        Math.sin(angle) * currentRadius,
      ),
    );
  }
  const curve = new THREE.CatmullRomCurve3(points);
  const coil = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 40, 0.055, 6, false),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.95,
      metalness: 0,
    }),
  );
  enableShadows(coil);
  return coil;
}

function createNetBundle({ width = 1.9, depth = 1.3, color = 0x8aa0a2 } = {}) {
  const bundle = new THREE.Group();
  bundle.name = "HarborNetBundle";

  const net = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.26, depth),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.98,
      metalness: 0,
    }),
  );
  net.position.y = 0.16;
  enableShadows(net);
  bundle.add(net);

  for (const x of [-width * 0.22, width * 0.22]) {
    const float = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshStandardMaterial({
        color: 0xd5b17b,
        roughness: 0.76,
        metalness: 0.02,
      }),
    );
    float.position.set(x, 0.24, depth * 0.36);
    enableShadows(float);
    bundle.add(float);
  }

  return bundle;
}

function createGangplank({ length = 8.6, width = 1.55 } = {}) {
  const plank = new THREE.Group();
  plank.name = "HarborGangplank";

  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(length, 0.16, width),
    new THREE.MeshStandardMaterial({
      color: 0xb59670,
      roughness: 0.84,
      metalness: 0.02,
    }),
  );
  enableShadows(deck);
  plank.add(deck);

  for (const side of [-width * 0.43, width * 0.43]) {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(length, 0.08, 0.08),
      new THREE.MeshStandardMaterial({
        color: 0x7e674f,
        roughness: 0.82,
        metalness: 0.02,
      }),
    );
    rail.position.set(0, 0.55, side);
    enableShadows(rail);
    plank.add(rail);
  }

  return plank;
}

function createHarborWorker({ tunic = 0xc8b28e, accent = 0x7d4d35 } = {}) {
  const worker = new THREE.Group();
  worker.name = "HarborWorker";

  const skinMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4ad86,
    roughness: 0.88,
    metalness: 0,
  });
  const clothMaterial = new THREE.MeshStandardMaterial({
    color: tunic,
    roughness: 0.9,
    metalness: 0.02,
  });
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: accent,
    roughness: 0.82,
    metalness: 0.02,
  });

  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.34, 1.15, 10),
    clothMaterial,
  );
  torso.position.y = 1.35;
  enableShadows(torso);
  worker.add(torso);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 12),
    skinMaterial,
  );
  head.position.y = 2.15;
  enableShadows(head);
  worker.add(head);

  for (const side of [-0.12, 0.12]) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.09, 0.82, 8),
      accentMaterial,
    );
    leg.position.set(side, 0.45, 0);
    enableShadows(leg);
    worker.add(leg);
  }

  for (const side of [-0.32, 0.32]) {
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.07, 0.78, 8),
      skinMaterial,
    );
    arm.position.set(side, 1.34, 0);
    arm.rotation.z = side * THREE.MathUtils.degToRad(16);
    enableShadows(arm);
    worker.add(arm);
  }

  return worker;
}

function createWarehouseFrontage() {
  const frontage = new THREE.Group();
  frontage.name = "HarborWarehouseFrontage";

  const awningA = createMarketStall({ width: 5.8, depth: 2.4, cloth: 0xb7653e });
  awningA.position.set(76, 0, -10);
  frontage.add(awningA);

  const awningB = createMarketStall({ width: 5.2, depth: 2.4, cloth: 0xd8bb74 });
  awningB.position.set(90, 0, 8);
  frontage.add(awningB);

  const cargoA = createAmphoraStack(6);
  cargoA.position.set(72, 0.1, -3);
  frontage.add(cargoA);

  const cargoB = createCrateCluster();
  cargoB.scale.setScalar(1.15);
  cargoB.position.set(88, 0.1, 2);
  frontage.add(cargoB);

  const netBundle = createNetBundle({ width: 2.2, depth: 1.5 });
  netBundle.position.set(82, 0.02, 13);
  frontage.add(netBundle);

  const worker = createHarborWorker({ tunic: 0xc7b193, accent: 0x745843 });
  worker.position.set(83, 0, 5);
  worker.rotation.y = THREE.MathUtils.degToRad(205);
  frontage.add(worker);

  return frontage;
}

function createHeroShipMooring(ship) {
  const shipPosition = ship.position;
  const mooring = new THREE.Group(); mooring.name = 'HarborHeroShipMooring';
  ship.updateMatrix();
  const start = new THREE.Vector3(shipPosition.x, DOCK_LIFT - HARBOR_GROUND_HEIGHT, DOCK_SECTION_WIDTH / 2);
  const end = new THREE.Vector3(0, ship.userData.deckHeight, -2.1).applyMatrix4(ship.matrix);
  const plank = createHarborBoardingRamp(start, end, 2.4, getPierWood());
  plank.name = 'HarborMerchantBoarding'; mooring.add(plank);  for (const dx of [-5,5]) {
    mooring.add(createCurvedRope(new THREE.Vector3(shipPosition.x+dx,0.12,2.6), new THREE.Vector3(shipPosition.x+dx,0.7,shipPosition.z-2.5), {sag:0.18}));
  }
  const coil=createRopeCoil({radius:0.4}); coil.position.set(shipPosition.x-5,0.04,0.5); mooring.add(coil);
  return mooring;
}

function createQuayEdge() {
  const quay = new THREE.Group();
  quay.name = "HarborQuayEdge";

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x8e877d,
    roughness: 0.9,
    metalness: 0.02,
  });
  const copingMaterial = new THREE.MeshStandardMaterial({
    color: 0xbdb4a4,
    roughness: 0.76,
    metalness: 0.04,
  });
  const bollardMaterial = new THREE.MeshStandardMaterial({
    color: 0x4e463f,
    roughness: 0.64,
    metalness: 0.22,
  });
  const timberMaterial = new THREE.MeshStandardMaterial({
    color: 0x7c644a,
    roughness: 0.84,
    metalness: 0.02,
  });
  const localWaterEast = HARBOR_WATER_BOUNDS.east - HARBOR_CENTER_3D.x;
  const localWaterY = -HARBOR_GROUND_HEIGHT + 0.55;

  const segmentDepth = 10;
  for (let z = QUAY_SPAN_NORTH; z <= QUAY_SPAN_SOUTH; z += segmentDepth) {
    const remaining = Math.min(segmentDepth, QUAY_SPAN_SOUTH - z + 2);
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 2.6, remaining),
      wallMaterial,
    );
    wall.position.set(QUAY_EDGE_X, -0.95, z + remaining * 0.5 - 0.5);
    enableShadows(wall);
    quay.add(wall);

    const coping = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 0.34, remaining + 0.1),
      copingMaterial,
    );
    coping.position.set(QUAY_EDGE_X - 0.1, 0.42, z + remaining * 0.5 - 0.5);
    enableShadows(coping);
    quay.add(coping);
  }

  for (let z = QUAY_SPAN_NORTH + 4; z <= QUAY_SPAN_SOUTH - 2; z += 8) {
    const bollard = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.24, 0.55, 10),
      bollardMaterial,
    );
    bollard.position.set(QUAY_EDGE_X - 1.35, 0.55, z);
    enableShadows(bollard);
    quay.add(bollard);
  }

  for (const z of [-22, -6, 10, 24]) {
    const fender = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 1.45, 0.68),
      timberMaterial,
    );
    fender.position.set(QUAY_EDGE_X + 1.25, -0.35, z);
    enableShadows(fender);
    quay.add(fender);

    const waterPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.2, 1.7, 8),
      timberMaterial,
    );
    waterPost.position.set(localWaterEast - 10.5, localWaterY, z);
    enableShadows(waterPost);
    quay.add(waterPost);

    quay.add(
      createCurvedRope(
        new THREE.Vector3(QUAY_EDGE_X - 1.2, 0.6, z),
        new THREE.Vector3(localWaterEast - 10.5, localWaterY + 0.78, z),
        { sag: 0.75, radius: 0.06 },
      ),
    );
  }

  for (const z of [-18, 6, 24]) {
    const ladder = new THREE.Group();
    const railGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2.4, 6);
    const rungGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6);
    for (const side of [-0.35, 0.35]) {
      const rail = new THREE.Mesh(railGeometry, bollardMaterial);
      rail.position.set(QUAY_EDGE_X + 1.15, -0.6, z + side);
      enableShadows(rail);
      ladder.add(rail);
    }
    for (let i = 0; i < 5; i++) {
      const rung = new THREE.Mesh(rungGeometry, bollardMaterial);
      rung.rotation.z = Math.PI / 2;
      rung.position.set(QUAY_EDGE_X + 1.15, -1.45 + i * 0.42, z);
      enableShadows(rung);
      ladder.add(rung);
    }
    quay.add(ladder);
  }

  for (const [x, z, rotation] of [
    [QUAY_EDGE_X - 3.8, -16, 0.2],
    [QUAY_EDGE_X - 3.6, 5, -0.1],
    [QUAY_EDGE_X - 3.4, 22, 0.15],
  ]) {
    const coil = createRopeCoil();
    coil.position.set(x, 0.46, z);
    coil.rotation.y = rotation;
    quay.add(coil);
  }

  return quay;
}

function createQuayEndTransition(endZ, direction = 1) {
  const group = new THREE.Group();
  group.name = `HarborQuayTransition_${direction > 0 ? "south" : "north"}`;

  const rubbleMaterial = new THREE.MeshStandardMaterial({
    color: 0x8d8479,
    roughness: 0.92,
    metalness: 0.02,
  });
  const timberMaterial = new THREE.MeshStandardMaterial({
    color: 0x7a6248,
    roughness: 0.84,
    metalness: 0.02,
  });

  const embankment = new THREE.Mesh(
    new THREE.BoxGeometry(4.8, 0.42, 5.8),
    new THREE.MeshStandardMaterial({
      color: 0xb2a58f,
      roughness: 0.88,
      metalness: 0.03,
    }),
  );
  embankment.position.set(QUAY_EDGE_X - 2.9, -0.08, endZ + direction * 1.9);
  embankment.rotation.z = THREE.MathUtils.degToRad(-6);
  embankment.rotation.y = THREE.MathUtils.degToRad(direction * 6);
  enableShadows(embankment);
  group.add(embankment);

  const retainingStone = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 1.2, 4.8),
    rubbleMaterial,
  );
  retainingStone.position.set(QUAY_EDGE_X + 0.5, -0.34, endZ + direction * 0.9);
  retainingStone.rotation.y = THREE.MathUtils.degToRad(direction * 5);
  enableShadows(retainingStone);
  group.add(retainingStone);

  const mooringPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.2, 1.9, 8),
    timberMaterial,
  );
  mooringPost.position.set(QUAY_EDGE_X + 1.8, 0.25, endZ + direction * 6.1);
  enableShadows(mooringPost);
  group.add(mooringPost);

  return group;
}

function createHarborEdgeTransitions() {
  const group = new THREE.Group();
  group.name = "HarborEdgeTransitions";

  group.add(createQuayEndTransition(QUAY_SPAN_NORTH, -1));
  group.add(createQuayEndTransition(QUAY_SPAN_SOUTH, 1));

  return group;
}

function createHarborMouthMarkers() {
  const group = new THREE.Group();
  group.name = "HarborMouthMarkers";

  const markerMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8cfb8,
    roughness: 0.76,
    metalness: 0.04,
  });
  const beaconMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd79a,
    emissive: 0xffbf66,
    emissiveIntensity: 0.55,
    roughness: 0.32,
    metalness: 0.0,
  });

  const localWaterEast = HARBOR_WATER_EAST_LIMIT - HARBOR_CENTER_3D.x;
  for (const z of [-24, 24]) {
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.58, 5.4, 10),
      markerMaterial,
    );
    tower.position.set(localWaterEast - 6.5, 2.7, z);
    enableShadows(tower);
    group.add(tower);

    const beacon = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.58, 0),
      beaconMaterial,
    );
    beacon.position.set(localWaterEast - 6.5, 5.95, z);
    enableShadows(beacon);
    group.add(beacon);
  }

  return group;
}

function createHarborBreakwaters() {
  const group = new THREE.Group();
  group.name = "HarborBreakwaters";

  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0x8f877b,
    roughness: 0.92,
    metalness: 0.02,
  });
  const copingMaterial = new THREE.MeshStandardMaterial({
    color: 0xb9ae9c,
    roughness: 0.8,
    metalness: 0.03,
  });

  const localWaterEast = HARBOR_WATER_EAST_LIMIT - HARBOR_CENTER_3D.x;
  const createArm = (direction = 1) => {
    const arm = new THREE.Group();
    const zBase = direction * 70;
    const shore = harborShoreX(HARBOR_CENTER_3D.z + zBase) - HARBOR_CENTER_3D.x;
    const segments = [
      { x: shore - 2, z: zBase, len: 10, rot: direction * 0.04 },
      { x: shore + 7, z: zBase + direction * 1.8, len: 11, rot: direction * 0.1 },
      { x: shore + 17, z: zBase + direction * 4.2, len: 12, rot: direction * 0.18 },
    ];

    segments.forEach(({ x, z, len, rot }, index) => {
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(len, 4.2, 4.2),
        stoneMaterial,
      );
      base.position.set(x, -2.1, z);
      base.rotation.y = rot;
      enableShadows(base);
      arm.add(base);

      const coping = new THREE.Mesh(
        new THREE.BoxGeometry(len - 0.4, 0.28, 3.3),
        copingMaterial,
      );
      coping.position.set(x, 0.12, z);
      coping.rotation.y = rot;
      enableShadows(coping);
      arm.add(coping);

      if (index === segments.length - 1) {
        const beaconTower = new THREE.Mesh(
          new THREE.CylinderGeometry(0.58, 0.78, 3.8, 10),
          stoneMaterial,
        );
        beaconTower.position.set(x + Math.cos(rot) * 4.4, 1.25, z + Math.sin(rot) * 4.4);
        enableShadows(beaconTower);
        arm.add(beaconTower);

        const beacon = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.54, 0),
          new THREE.MeshStandardMaterial({
            color: 0xffd39a,
            emissive: 0xffbf66,
            emissiveIntensity: 0.48,
            roughness: 0.34,
            metalness: 0,
          }),
        );
        beacon.position.copy(beaconTower.position).add(new THREE.Vector3(0, 2.3, 0));
        enableShadows(beacon);
        arm.add(beacon);
      }
    });

    return arm;
  };

  group.add(createArm(-1));
  group.add(createArm(1));
  return group;
}

function createQuayForecourt() {
  const group = new THREE.Group();
  group.name = "HarborQuayForecourt";

  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0xa59a86,
    roughness: 0.9,
    metalness: 0.02,
  });
  const trimMaterial = new THREE.MeshStandardMaterial({
    color: 0xc0b39f,
    roughness: 0.82,
    metalness: 0.03,
  });

  const terrace = new THREE.Mesh(
    new THREE.BoxGeometry(10.5, 0.16, 6.2),
    stoneMaterial,
  );
  terrace.position.set(44.2, 0.04, 3.1);
  enableShadows(terrace);
  group.add(terrace);

  const eastLanding = new THREE.Mesh(
    new THREE.BoxGeometry(4.6, 0.1, 2.8),
    stoneMaterial,
  );
  eastLanding.position.set(49.2, -0.01, 1.8);
  enableShadows(eastLanding);
  group.add(eastLanding);

  const southLanding = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 0.1, 2.6),
    stoneMaterial,
  );
  southLanding.position.set(48.7, -0.01, 5.8);
  southLanding.rotation.y = THREE.MathUtils.degToRad(-8);
  enableShadows(southLanding);
  group.add(southLanding);

  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(9.8, 0.08, 0.55),
    trimMaterial,
  );
  trim.position.set(43.8, 0.12, 0.1);
  enableShadows(trim);
  group.add(trim);

  const cargoRows = [
    { x: 39.5, z: 0.2, item: () => createCrateCluster(), scale: 1.0 },
    { x: 45.8, z: 6.3, item: () => createAmphoraStack(6), scale: 0.95 },
    { x: 50.4, z: 0.7, item: () => createBarrelCluster(), scale: 0.9 },
    { x: 53.8, z: 5.9, item: () => createNetBundle({ width: 2.1, depth: 1.4 }), scale: 0.94 },
  ];
  cargoRows.forEach(({ x, z, item, scale }) => {
    const cargo = item();
    cargo.position.set(x - 1.2, 0.14, z - 0.8);
    cargo.scale.setScalar(scale);
    group.add(cargo);
  });

  for (const [x, z, rot] of [
    [38.2, -2.9, 4],
    [46.8, -2.8, -3],
    [54.4, -1.6, 6],
  ]) {
    const capstan = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.58, 0.9, 10),
      new THREE.MeshStandardMaterial({
        color: 0x5b5047,
        roughness: 0.68,
        metalness: 0.18,
      }),
    );
    capstan.position.set(x, 0.5, z);
    capstan.rotation.y = THREE.MathUtils.degToRad(rot);
    enableShadows(capstan);
    group.add(capstan);
  }

  return group;
}

function createHarborWorkZone() {
  const zone = new THREE.Group();
  zone.name = "HarborWorkZone";

  const cargoPiles = [
    { x: 46, z: -12, scale: 1.1 },
    { x: 52, z: 2, scale: 1.2 },
    { x: 58, z: 14, scale: 1.0 },
  ];
  cargoPiles.forEach(({ x, z, scale }) => {
    const cargo = Math.random() > 0.5 ? createCrateCluster() : createAmphoraStack(5);
    cargo.scale.setScalar(scale);
    cargo.position.set(x, 0.1, z);
    zone.add(cargo);
  });

  const crane = createHarborCrane();
  crane.position.set(30, 0, 12);
  zone.add(crane);

  const stallA = createMarketStall({ cloth: 0xca7146 });
  stallA.position.set(34, 0, -18);
  zone.add(stallA);

  const stallB = createMarketStall({ cloth: 0x2d768f });
  stallB.position.set(41, 0, -18);
  zone.add(stallB);

  const fishTables = new THREE.Group();
  fishTables.name = "HarborFishTables";
  for (let i = 0; i < 2; i++) {
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.18, 0.95),
      new THREE.MeshStandardMaterial({ color: 0xc9d2d7, roughness: 0.58, metalness: 0.08 }),
    );
    table.position.set(34 + i * 2.8, 0.92, -18.5);
    enableShadows(table);
    fishTables.add(table);
  }
  zone.add(fishTables);

  const fishNet = createNetBundle({ width: 2.3, depth: 1.4 });
  fishNet.position.set(31.5, 0.02, -14.8);
  zone.add(fishNet);

  const fishBasket = createBarrelCluster();
  fishBasket.scale.setScalar(0.72);
  fishBasket.position.set(38.4, 0.02, -14.2);
  zone.add(fishBasket);

  const workCrew = [
    { x: 31.4, z: 8.4, rot: 120, tunic: 0xceb48d, accent: 0x6a503d },
    { x: 37.8, z: -15.2, rot: 184, tunic: 0xa9b8bf, accent: 0x705742 },
    { x: 48.5, z: 1.8, rot: 258, tunic: 0xd2c09d, accent: 0x7a5d45 },
  ];
  workCrew.forEach(({ x, z, rot, tunic, accent }) => {
    const worker = createHarborWorker({ tunic, accent });
    worker.position.set(x, 0, z);
    worker.rotation.y = THREE.MathUtils.degToRad(rot);
    zone.add(worker);
  });

  return zone;
}

function scatterDockProps(target, dockSections, seaLevel) {
  if (!dockSections.length) return;
  for (const section of dockSections) {
    if (Math.random() < 0.4) continue;
    const prop = Math.random() > 0.5 ? createCrateCluster() : createBarrelCluster();
    const localX = THREE.MathUtils.randFloatSpread(section.userData.length * 0.6);
    const localZ = (Math.random() < 0.5 ? -1 : 1) * (section.userData.width / 2 - 0.85);
    // Y is local to harbor group: seaLevel is 0, add lift and thickness
    const localY = 0.025;
    prop.position.set(section.position.x + localX, localY, section.position.z + localZ);
    prop.userData.category = "harbor-prop-dock";
    target.add(prop);
  }
}

function scatterShoreProps(target, groundY) {
  const localWaterEast = HARBOR_WATER_BOUNDS.east - HARBOR_CENTER_3D.x;
  const localWaterNorth = HARBOR_WATER_BOUNDS.north - HARBOR_CENTER_3D.z;
  const localWaterSouth = HARBOR_WATER_BOUNDS.south - HARBOR_CENTER_3D.z;
  const scatterBounds = {
    west: localWaterEast + 4,
    east: localWaterEast + 10,
    north: Math.min(localWaterSouth, localWaterNorth) + 2,
    south: Math.max(localWaterSouth, localWaterNorth) - 2,
  };

  for (let i = 0; i < 4; i++) {
    const prop = Math.random() > 0.5 ? createCrateCluster() : createBarrelCluster();
    const x = THREE.MathUtils.randFloat(scatterBounds.west, scatterBounds.east);
    const z = THREE.MathUtils.randFloat(scatterBounds.north, scatterBounds.south);
    prop.position.set(x, 0.1, z);
    prop.userData.category = "harbor-prop-shore";
    target.add(prop);
  }
}

function createShed(size, groundY, position) {
  const shed = new THREE.Group();
  shed.name = "HarborWarehouse";

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(size.x, size.y, size.z),
    new THREE.MeshStandardMaterial({
      color: 0x7c756f, // Lighter, warmer stone/wood base
      roughness: 0.6,
      metalness: 0.1,
    }),
  );
  base.position.y = size.y * 0.5;
  enableShadows(base);
  shed.add(base);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(size.x + 0.6, 0.9, size.z + 0.6),
    new THREE.MeshStandardMaterial({
      color: 0xc45c3d, // Saturated reddish terracotta
      roughness: 0.5,
      metalness: 0.05,
    }),
  );
  roof.position.y = size.y + 0.45;
  enableShadows(roof);
  shed.add(roof);

  shed.position.copy(position);
  shed.position.y = groundY;
  return shed;
}

/**
 * Create a boardwalk/ramp connector from city level to harbor level
 * Bridges the city street and the harbour deck, in harbour-local coordinates.
 * @param {number} cityGroundY - The city ground elevation
 * @param {function(number, number): number} heightSampler - Shore terrain height
 * @returns {THREE.Group} Connector structure
 */
function createCityHarborConnector(cityGroundY, heightSampler) {
  const connector = new THREE.Group();
  connector.name = "CityHarborConnector";

  // Sea-level changes update the harbour anchor. Use its actual group origin,
  // rather than treating the nominal harbour ground height as the group Y.
  const groupY = HARBOR_CENTER_3D.y;
  const elevationDiff = cityGroundY - groupY;
  const endElevation = getSeaLevelY() + HARBOR_GROUND_HEIGHT - groupY;
  
  // Keep the connector on the harbor side so it reads as a destination ramp
  // instead of a silhouette slicing across the spawn view.
  const boardwalkStartX = HARBOR_LAND_APPROACH_X + 10 - HARBOR_CENTER_3D.x;
  const boardwalkLength = -boardwalkStartX;
  const boardwalkWidth = 6.4;
  const boardwalkThickness = 0.35;
  
  // Wood planks material
  const woodMaterial = getPierWood();

  // Main boardwalk deck segments with gradual slope
  const segmentCount = 7;
  const segmentLength = boardwalkLength / segmentCount;
  
  for (let i = 0; i < segmentCount; i++) {
    const t = i / segmentCount; // 0 to 1 from city to harbor
    const segmentElevation = THREE.MathUtils.lerp(elevationDiff, endElevation, t) - boardwalkThickness / 2;
    const nextT = (i + 1) / segmentCount;
    const nextElevation = THREE.MathUtils.lerp(elevationDiff, endElevation, nextT) - boardwalkThickness / 2;
    const avgElevation = (segmentElevation + nextElevation) / 2;
    
    // Calculate tilt angle for this segment
    const tiltAngle = Math.atan2(nextElevation - segmentElevation, segmentLength);
    
    const segment = new THREE.Mesh(
      new THREE.BoxGeometry(segmentLength, boardwalkThickness, boardwalkWidth),
      woodMaterial
    );
    
    // Position each segment
    const xPos = boardwalkStartX + (i * segmentLength) + (segmentLength / 2);
    segment.position.set(xPos, avgElevation, 0);
    segment.rotation.z = tiltAngle;
    segment.receiveShadow = true;
    segment.castShadow = true;
    
    connector.add(segment);
  }

  // Support posts under the boardwalk
  const postCount = 8;
  const postRadius = 0.22;
  const postMaterial = new THREE.MeshStandardMaterial({
    color: 0x6b5845,
    roughness: 0.82,
    metalness: 0.0,
  });

  for (let i = 0; i < postCount; i++) {
    const t = i / (postCount - 1);
    const xPos = boardwalkStartX + (t * boardwalkLength);
    const topElevation = THREE.MathUtils.lerp(elevationDiff, endElevation, t);
    const postHeight = topElevation + 2.5; // Extend down below surface
    
    // Create two posts on each side of the boardwalk
    [-boardwalkWidth / 3, boardwalkWidth / 3].forEach(zOffset => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(postRadius, postRadius * 1.1, postHeight, 8),
        postMaterial
      );
      post.position.set(xPos, topElevation - postHeight / 2, zOffset);
      post.receiveShadow = true;
      post.castShadow = true;
      connector.add(post);
    });
  }

  // Railings on both sides
  const railingHeight = 1.0;
  const railingRadius = 0.12;
  const railingMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b7355,
    roughness: 0.68,
    metalness: 0.0,
  });

  connector.userData.quayAccess = [];
  [-boardwalkWidth / 2, boardwalkWidth / 2].forEach(side => {
    // The existing guardrail must open where the new stone quay crosses it.
    // Keep the exposed boardwalk edges guarded; do not make rails non-solid.
    const accessX = harborShoreX(HARBOR_CENTER_3D.z + side) - 5 - HARBOR_CENTER_3D.x;
    const gateStart = THREE.MathUtils.clamp(accessX - 2.5, boardwalkStartX, 0);
    const gateEnd = THREE.MathUtils.clamp(accessX + 2.5, boardwalkStartX, 0);
    connector.userData.quayAccess.push({ z: HARBOR_CENTER_3D.z + side, west: gateStart + HARBOR_CENTER_3D.x, east: gateEnd + HARBOR_CENTER_3D.x });
    const deckY = x => THREE.MathUtils.lerp(elevationDiff, endElevation, (x - boardwalkStartX) / boardwalkLength);
    for (const [start, end] of [[boardwalkStartX, gateStart], [gateEnd, 0]]) {
      if (end - start < 0.1) continue;
      const curve = new THREE.LineCurve3(new THREE.Vector3(start, deckY(start) + railingHeight, side), new THREE.Vector3(end, deckY(end) + railingHeight, side));
      const railing = new THREE.Mesh(new THREE.TubeGeometry(curve, 1, railingRadius, 8, false), railingMaterial);
      railing.name = 'HarborConnectorRailing'; railing.userData.noCull = true;
      railing.receiveShadow = true; railing.castShadow = true; connector.add(railing);
    }
    for (const x of [gateStart, gateEnd]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, railingHeight, 8), railingMaterial);
      post.name = 'HarborQuayAccessPost'; post.userData.noCull = true;
      post.position.set(x, deckY(x) + railingHeight / 2, side); post.castShadow = true; post.receiveShadow = true; connector.add(post);
    }
  });
  // The dry street meets shallow stone steps, then the existing boardwalk.
  const footY = heightSampler?.(HARBOR_LAND_APPROACH_X, HARBOR_CENTER_3D.z) ?? getSeaLevelY();
  const steps = 12;
  for (let i = 0; i < steps; i++) {
    const topY = THREE.MathUtils.lerp(footY, cityGroundY, (i + 1) / steps);
    const height = topY - footY + 0.15;
    const landingExtension=i===0?1:0; // One landward landing on the existing first tread.
    const tread = new THREE.Mesh(new THREE.BoxGeometry(10 / steps + landingExtension, height, boardwalkWidth), new THREE.MeshStandardMaterial({ color: 0xbda987, roughness: 0.9 }));
    tread.name = 'HarborApproachStep';
    tread.position.set(HARBOR_LAND_APPROACH_X - HARBOR_CENTER_3D.x + (i + 0.5) * 10 / steps - landingExtension/2, footY - groupY + height / 2 - 0.15, 0);
    connector.add(tread);
  }
  connector.userData.landApproachX = HARBOR_LAND_APPROACH_X;

  const threshold = new THREE.Group();
  threshold.name = "HarborCityThreshold";

  const stallA = createMarketStall({ width: 4.8, depth: 2.6, cloth: 0xc77244 });
  stallA.position.set(-29, elevationDiff + 0.02, -5.8);
  stallA.rotation.y = THREE.MathUtils.degToRad(8);
  threshold.add(placeHarborOnLand(stallA, {x:7, z:2}, heightSampler));

  const stallB = createMarketStall({ width: 4.4, depth: 2.5, cloth: 0x2f7891 });
  stallB.position.set(-22, elevationDiff + 0.02, 6.2);
  stallB.rotation.y = THREE.MathUtils.degToRad(-10);
  threshold.add(placeHarborOnLand(stallB, {x:7, z:19}, heightSampler));

  const amphorae = createAmphoraStack(5);
  amphorae.position.set(-26, elevationDiff + 0.02, -8.8);
  threshold.add(placeHarborOnLand(amphorae, {x:5, z:0}, heightSampler));

  const cargo = createCrateCluster();
  cargo.position.set(-19.5, elevationDiff + 0.02, 8.7);
  cargo.scale.setScalar(0.9);
  threshold.add(placeHarborOnLand(cargo, {x:6, z:23}, heightSampler));

  const netBundle = createNetBundle({ width: 1.8, depth: 1.2, color: 0x8fa4a6 });
  netBundle.position.set(-31.5, elevationDiff + 0.06, 7.4);
  netBundle.rotation.y = THREE.MathUtils.degToRad(12);
  threshold.add(placeHarborOnLand(netBundle, {x:3, z:21}, heightSampler));

  const worker = createHarborWorker({ tunic: 0xc4ad8b, accent: 0x6f4f37 });
  worker.position.set(-24.5, elevationDiff + 0.02, 0.6);
  worker.rotation.y = THREE.MathUtils.degToRad(96);
  threshold.add(placeHarborOnLand(worker, {x:8, z:24}, heightSampler));

  connector.add(threshold);

  return connector;
}

function optimizeHarborShadowCost(harbor) {
  if (!harbor?.traverse) return;

  const receiveOnlyGroups = new Set([
    "HarborEdgeTransitions",
    "HarborMouthMarkers",
    "HarborBreakwaters",
    "HarborQuayForecourt",
    "HarborWorkZone",
    "HarborWarehouseFrontage",
    "HarborShorelineDressing",
  ]);

  const shouldReceiveOnly = (mesh) => {
    let current = mesh.parent ?? null;
    while (current) {
      if (receiveOnlyGroups.has(current.name)) {
        return true;
      }
      current = current.parent ?? null;
    }
    return false;
  };

  harbor.traverse((child) => {
    if (!child?.isMesh) return;
    if (shouldReceiveOnly(child)) {
      child.castShadow = false;
      child.receiveShadow = false;
    }
  });
}

/**
 * Creates a lighthouse on a raised platform.
 * Includes cylindrical stone tower with light chamber at top.
 */
function createLighthouse() {
  const lighthouse = new THREE.Group();

  // Base platform
  const baseGeometry = new THREE.CylinderGeometry(2.0, 2.2, 0.5, 8);
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x6b6b5a,
    roughness: 0.9,
    metalness: 0.0,
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = 0.25;
  base.castShadow = true;
  base.receiveShadow = true;
  lighthouse.add(base);

  // Tower (tapered cylinder)
  const towerGeometry = new THREE.CylinderGeometry(0.9, 1.2, 4.0, 12);
  const towerMaterial = new THREE.MeshStandardMaterial({
    color: 0x8a8a7a,
    roughness: 0.85,
    metalness: 0.0,
  });
  const tower = new THREE.Mesh(towerGeometry, towerMaterial);
  tower.position.y = 2.5;
  tower.castShadow = true;
  tower.receiveShadow = true;
  lighthouse.add(tower);

  // Light chamber (glass dome)
  const chamberGeometry = new THREE.CylinderGeometry(1.0, 1.0, 0.8, 12);
  const chamberMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffcc,
    roughness: 0.1,
    metalness: 0.3,
    emissive: 0xffff88,
    emissiveIntensity: 0.4,
  });
  const chamber = new THREE.Mesh(chamberGeometry, chamberMaterial);
  chamber.position.y = 5.0;
  chamber.castShadow = true;
  lighthouse.add(chamber);

  // Roof (cone)
  const roofGeometry = new THREE.ConeGeometry(1.1, 0.8, 12);
  const roofMaterial = new THREE.MeshStandardMaterial({
    color: 0xaa2222,
    roughness: 0.7,
    metalness: 0.2,
  });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = 5.8;
  roof.castShadow = true;
  lighthouse.add(roof);

  return lighthouse;
}

/**
 * Creates a schematic harbour lookout on the existing raised platform.
 * Uses a square stone tower and tiled roof, without an anachronistic clock face.
 */
function createWatchtower() {
  const watchtower = new THREE.Group();

  // Base platform
  const baseGeometry = new THREE.BoxGeometry(2.5, 0.5, 2.5);
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x6b6b5a,
    roughness: 0.9,
    metalness: 0.0,
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = 0.25;
  base.castShadow = true;
  base.receiveShadow = true;
  watchtower.add(base);

  // Tower (square)
  const towerGeometry = new THREE.BoxGeometry(1.8, 4.0, 1.8);
  const towerMaterial = new THREE.MeshStandardMaterial({
    color: 0x8a8a7a,
    roughness: 0.85,
    metalness: 0.0,
  });
  const tower = new THREE.Mesh(towerGeometry, towerMaterial);
  tower.position.y = 2.5;
  tower.castShadow = true;
  tower.receiveShadow = true;
  watchtower.add(tower);

  // Roof (pyramid)
  const roofGeometry = new THREE.ConeGeometry(1.4, 1.2, 4);
  const roofMaterial = new THREE.MeshStandardMaterial({
    color: 0xaa4422,
    roughness: 0.7,
    metalness: 0.2,
  });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = 5.1;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  watchtower.add(roof);

  return watchtower;
}

/**
 * Creates a high-fidelity Greek Trireme warship.
 * Features 3 banks of oars, a bronze ram, and a large decorative sail.
 */
function createTrireme(options) { return createTriremeShip({ ...options, woodMaterial: getShipWood() }); }

function createMaritimeStoa() {
  const stoa = new THREE.Group();
  stoa.name = "MaritimeStoa";

  const columnGeom = new THREE.CylinderGeometry(0.35, 0.35, 5, 12);
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xe8e4d9, roughness: 0.8 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xc45c3d, roughness: 0.6 });

  // Columns
  for (let i = 0; i < 10; i++) {
    const col = new THREE.Mesh(columnGeom, stoneMat);
    col.position.set(-18 + i * 4, 2.5, 0);
    enableShadows(col);
    stoa.add(col);
  }

  // Back wall
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(40, 5, 0.8),
    stoneMat
  );
  backWall.position.set(0, 2.5, -4);
  enableShadows(backWall);
  stoa.add(backWall);

  // Roof
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(42, 0.6, 6),
    roofMat
  );
  roof.position.set(0, 5, -1.8);
  roof.rotation.x = -0.15;
  enableShadows(roof);
  stoa.add(roof);

  return stoa;
}

/**
 * Creates a complete harbor with all features and props.
 * 
 * Harbor Features Created:
 * 1. Piers - Three rows of wooden docks (North, Center, South)
 *    - Each pier has multiple dock sections
 *    - Wooden posts for structural support
 * 2. Boats - Fishing boats moored at each pier
 *    - Hull, bow, cabin, and mast
 *    - Variety of colors from BOAT_STYLES
 * 3. Shoreline Dressing - Mooring posts along the waterfront
 * 4. Dock Props - Crates and barrels scattered on dock sections
 * 5. Shore Props - Crates and barrels on the shoreline
 * 6. Sheds/Warehouses - Two storage buildings with terracotta roofs
 * 7. City Connector - Wooden boardwalk ramp from city level to harbor level
 * 8. Lighthouse - Tall stone tower on raised platform (if available)
 * 9. Watchtower - Square tower with clock faces on raised platform (if available)
 * 
 * All elements are positioned relative to harborGroundY (seaLevel + HARBOR_GROUND_HEIGHT)
 * to ensure they sit above water level.
 * 
 * The harbor is positioned at the current HARBOR_CENTER_3D world anchor.
 * Terrain is flattened behind the harbor to create a smooth connection to the city.
 * The boardwalk connector provides a walkable route from city core (Y=2.5) to docks (Y=2).
 * 
 * @param {THREE.Scene} scene - The scene to add the harbor to
 * @returns {THREE.Group} The complete harbor group
 */
export function createHarbor(scene, options = {}) {
  const harbor = new THREE.Group();
  harbor.name = "Harbor";

  const seaLevel = getSeaLevelY();
  const harborGroundY = seaLevel + HARBOR_GROUND_HEIGHT;
  
  // Get terrain sampler if available
  const terrainSampler = options.terrain?.userData?.getHeightAt || 
                        options.terrainSampler ||
                        scene?.userData?.getHeightAt || ((x,z) => harborCoastHeight(x,z,seaLevel));

  if (IS_DEV) console.log('[Harbor] Creating coastal harbor with grid-aligned placement...');

  // Analyze harbor zone if terrain sampler available
  let dockSlots = [];
  let raisedSlots = [];
  
  if (terrainSampler) {
    const searchArea = {
      centerX: HARBOR_CENTER_3D.x,
      centerZ: HARBOR_CENTER_3D.z,
      width: 100,
      depth: 80,
    };

    const analysis = analyzeHarborZone(terrainSampler, searchArea);
    if (IS_DEV) console.log(`[Harbor] Zone analysis: ${analysis.dockSlots} dock slots, ${analysis.raisedSlots} raised platforms`);
    if (IS_DEV) console.log(`[Harbor] Coverage: ${analysis.dockCoverage.toFixed(1)}% dock, ${analysis.raisedCoverage.toFixed(1)}% raised`);
    
    dockSlots = analysis.bestDockPositions || [];
    raisedSlots = analysis.bestRaisedPositions || [];
  }

  harbor.add(createCurvedHarborQuays({ stoneMaterial: getQuayStone() }));
  harbor.add(placeHarborOnLand(createQuayForecourt(), {x: 43, z: 94}, terrainSampler));
  harbor.add(createHarborBreakwaters());

  // Use grid-aligned dock slots if available, otherwise fallback to default positions
  const piersGroup = new THREE.Group();
  piersGroup.name = "HarborPiers";
  const allSections = [];
  
  // Track pier positions for boat placement
  const pierPositions = [];

  // Piers begin on the curved bank and extend seaward; all deck tops
  // share the boardwalk/quay elevation, independent of absolute sea level.
  for (const z of [-18, 10, 42]) {
    const west = harborShoreX(z) - 12;
    const count = z === 10 ? 14 : 7;
    const east = west + (count - 1) * (DOCK_SECTION_LENGTH - DOCK_GAP);
    const localX = east - HARBOR_CENTER_3D.x, localZ = z - HARBOR_CENTER_3D.z;
    const {pier, sections} = createPierLine(localX, localZ, count, seaLevel);
    allSections.push(...sections); piersGroup.add(pier);
    pierPositions.push({ x: localX - 12, z: localZ });
  }
  
  harbor.add(piersGroup);

  const shorelineGroup = new THREE.Group();
  shorelineGroup.name = "HarborShorelineDressing";

  // Local coordinates relative to harbor group (positioned at HARBOR_CENTER_3D)
  const dressingZ = [
    -18,  // North
    -2,   // Center
    16,   // South
  ];

  for (let i = 0; i < dressingZ.length; i++) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.28, 2.4, 10),
      new THREE.MeshStandardMaterial({ color: 0x7a6248, roughness: 0.78 }),
    );
    const localWaterEast = HARBOR_WATER_EAST_LIMIT - HARBOR_CENTER_3D.x;
    const worldZ = [-90, 80, 115][i];
    post.position.set(harborShoreX(worldZ) - 8 - HARBOR_CENTER_3D.x, 1.2, worldZ - HARBOR_CENTER_3D.z);
    shorelineGroup.add(post);
  }

  harbor.add(shorelineGroup);

  const boatsGroup = new THREE.Group();
  boatsGroup.name = "HarborBoats";
  let boatStyleIndex = 0;
  for (const pierPos of pierPositions) {
    const style = BOAT_STYLES[boatStyleIndex % BOAT_STYLES.length];
    boatStyleIndex++;
    const boat = createFishingBoat({
      length: 11 + Math.random() * 2,
      width: 3.2 + Math.random() * 0.8,
      seaLevel,
      hull: style.hull,
      accent: style.accent,
    });
    const moorOffset = DOCK_SECTION_WIDTH * 0.5 + 1.2;
    // Boat Y position relative to group origin (group Y = harborGroundY = 2.0)
    // Water is at seaLevel (0), so relative to group it's at seaLevel - harborGroundY = -2.0
    boat.position.set(
      pierPos.x - DOCK_SECTION_LENGTH * 1.6, 
      -HARBOR_GROUND_HEIGHT,
      pierPos.z + (Math.random() > 0.5 ? moorOffset : -moorOffset)
    );
    boat.userData.category = "harbor-boat";
    boatsGroup.add(boat);
  }

  const heroStyle = BOAT_STYLES[(boatStyleIndex + 1) % BOAT_STYLES.length];
  const heroShip = createHeroHarborShip({
    seaLevel,
    hull: heroStyle.hull,
    accent: heroStyle.accent,
  });
  heroShip.scale.setScalar(1.16);
  heroShip.position.set(54, -HARBOR_GROUND_HEIGHT, 6);
  heroShip.rotation.y = -0.18;
  heroShip.userData.category = "harbor-hero-ship";
  boatsGroup.add(heroShip);

  harbor.add(boatsGroup);
  harbor.add(createHeroShipMooring(heroShip));

  const propsGroup = new THREE.Group();
  propsGroup.name = "HarborProps";
  scatterDockProps(propsGroup, allSections, seaLevel);
  const shoreProps = new THREE.Group();
  scatterShoreProps(shoreProps, harborGroundY);
  [...shoreProps.children].forEach((prop, i) => propsGroup.add(placeHarborOnLand(prop, {x:78, z:-112+i*7}, terrainSampler)));
  propsGroup.add(placeHarborOnLand(createHarborWorkZone(), {x:70, z:-83}, terrainSampler));
  harbor.add(propsGroup);

  // Sheds positioned in local coordinates
  const sheds = [
    createShed(new THREE.Vector3(18, 5.2, 12), 0, new THREE.Vector3(70 + 12, 0, -10)),
    createShed(new THREE.Vector3(22, 6, 14), 0, new THREE.Vector3(70 + 24, 0, 8)),
  ];
  sheds.forEach((shed, index) => harbor.add(placeHarborOnLand(shed, {x:86, z:index ? -115 : 108}, terrainSampler, {building:true})));
  harbor.add(placeHarborOnLand(createWarehouseFrontage(), {x:72, z:86}, terrainSampler));

  // Place lighthouse and watchtower on raised platforms if available
  if (raisedSlots.length >= 1) {
    // Sort raised slots by elevation (highest first)
    const sortedRaised = [...raisedSlots].sort((a, b) => b.elevation - a.elevation);
    
    // Place lighthouse on highest raised platform
    const lighthouseSlot = sortedRaised[0];
    const lighthouse = createLighthouse();
    // Convert world coords to local coords relative to harbor center
    const lighthouseLocalX = lighthouseSlot.x - HARBOR_CENTER_3D.x;
    const lighthouseLocalZ = lighthouseSlot.z - HARBOR_CENTER_3D.z;
    lighthouse.position.set(lighthouseLocalX, lighthouseSlot.elevation - harborGroundY, lighthouseLocalZ);
    lighthouse.userData.category = "harbor-lighthouse";
    harbor.add(placeHarborOnLand(lighthouse, {x:98, z:128}, terrainSampler, {building:true}));
    if (IS_DEV) console.log(`[Harbor] Lighthouse placed at (${lighthouseLocalX.toFixed(1)}, ${lighthouseSlot.elevation.toFixed(2)}, ${lighthouseLocalZ.toFixed(1)})`);

    // Place watchtower on second highest raised platform if available
    if (sortedRaised.length >= 2) {
      const watchtowerSlot = sortedRaised[1];
      const watchtower = createWatchtower();
      const watchtowerLocalX = watchtowerSlot.x - HARBOR_CENTER_3D.x;
      const watchtowerLocalZ = watchtowerSlot.z - HARBOR_CENTER_3D.z;
      watchtower.position.set(watchtowerLocalX, watchtowerSlot.elevation - harborGroundY, watchtowerLocalZ);
      watchtower.userData.category = "harbor-watchtower";
      harbor.add(placeHarborOnLand(watchtower, {x:60, z:-122}, terrainSampler, {building:true}));
      console.log(`[Harbor] Watchtower placed at (${watchtowerLocalX.toFixed(1)}, ${watchtowerSlot.elevation.toFixed(2)}, ${watchtowerLocalZ.toFixed(1)})`);
    }
  }

  // Add city-harbor connector boardwalk
  const cityGroundY = getCityGroundY();
  const connector = createCityHarborConnector(cityGroundY, terrainSampler);
  harbor.add(connector);

  // --- NEW: MARITIME LANDMARKS ---
  // Create a Maritime Stoa along the northern quay
  const stoa = createMaritimeStoa();
  harbor.add(placeHarborOnLand(stoa, {x:76, z:-72}, terrainSampler, {building:true}));

  // Create a Military Pier specifically for the Trireme
  const militaryPierX = harborShoreX(-38) + 42 - HARBOR_CENTER_3D.x;
  const militaryPierZ = -38 - HARBOR_CENTER_3D.z;
  const { pier: militaryPier } = createPierLine(militaryPierX, militaryPierZ, 6, seaLevel);
  harbor.add(militaryPier);

  const trireme = createTrireme({ seaLevel });
  trireme.position.set(militaryPierX - 10, -HARBOR_GROUND_HEIGHT, militaryPierZ + 6);
  trireme.rotation.y = -0.05;
  harbor.add(trireme);
  trireme.updateMatrix();
  const navalStart = new THREE.Vector3(trireme.position.x - 4, DOCK_LIFT - HARBOR_GROUND_HEIGHT, militaryPierZ + DOCK_SECTION_WIDTH / 2);
  const navalEnd = new THREE.Vector3(-4, trireme.userData.deckHeight, -1).applyMatrix4(trireme.matrix);
  const navalBoarding = createHarborBoardingRamp(navalStart, navalEnd, 2.0, getPierWood());
  navalBoarding.name = 'HarborNavalBoarding'; harbor.add(navalBoarding);
  // --- END NEW LANDMARKS ---

  // A static offshore vessel in the existing ship family. It never enters the
  // boarding registry, shoreline placement or two boardable-hull water masks.
  const offshoreGalley=createOffshoreGalley({woodMaterial:getShipWood()});
  offshoreGalley.position.set(210-HARBOR_CENTER_3D.x,-HARBOR_GROUND_HEIGHT,60-HARBOR_CENTER_3D.z);
  offshoreGalley.rotation.y=.65;harbor.add(offshoreGalley);

  // Position harbor group in world space
  harbor.position.copy(HARBOR_CENTER_3D);
  addHarborDeckJoints(harbor);
  optimizeHarborShadowCost(harbor);
  batchStaticMeshes(harbor);

  if (scene) {
    scene.add(harbor);
  }

  return harbor;
}

// The harbor is constructed synchronously. Cache its unique materials once;
// lighting changes only need a refresh when the night factor moves visibly.
const harborLightingCache = new WeakMap();
const harborWarmSunlight = new THREE.Color('#e3b07a');
const harborCoolAmbient = new THREE.Color('#d2d9e4');

export function updateHarborLighting(harbor, nightFactor = 0) {
  if (!harbor) return;
  const clampedNight = THREE.MathUtils.clamp(nightFactor ?? 0, 0, 1);
  let state = harborLightingCache.get(harbor);
  if (!state) {
    const materials = new Set();
    harbor.traverse(child => {
      if (!child.isMesh) return;
      for (const material of Array.isArray(child.material) ? child.material : [child.material]) {
        if (material?.isMaterial) materials.add(material);
      }
    });
    state = { materials: [...materials], lastNight: NaN };
    harborLightingCache.set(harbor, state);
  }
  // At most 0.1% of the day/night interpolation is deferred, with immediate
  // updates for preset changes. Avoid frame-rate-dependent timer behaviour.
  if (Math.abs(clampedNight - state.lastNight) < 0.001) return;
  state.lastNight = clampedNight;
  const daylight = 1 - clampedNight;
  for (const material of state.materials) {
    const data = material.userData;
    if (material.color && !data.baseColor) data.baseColor = material.color.clone();
    if (material.envMapIntensity !== undefined && data.baseEnvMapIntensity === undefined) {
      data.baseEnvMapIntensity = material.envMapIntensity ?? 1;
    }
    if (material.roughness !== undefined && data.baseRoughness === undefined) data.baseRoughness = material.roughness;
    if (material.color && data.baseColor) {
      material.color.copy(data.baseColor)
        .lerp(harborCoolAmbient, clampedNight * 0.2)
        .lerp(harborWarmSunlight, daylight * (data.harborWarmth ?? 0.18));
    }
    if (material.envMapIntensity !== undefined) {
      const baseEnv = data.baseEnvMapIntensity ?? 1;
      material.envMapIntensity = THREE.MathUtils.lerp(baseEnv * 1.25, baseEnv * 0.32, clampedNight);
    }
    if (material.roughness !== undefined) {
      const base = data.baseRoughness ?? material.roughness;
      material.roughness = THREE.MathUtils.lerp(
        Math.max(0.02, base - 0.08 * daylight), Math.min(1, base + 0.1 * clampedNight), clampedNight);
    }
  }
}
