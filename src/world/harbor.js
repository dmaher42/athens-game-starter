import * as THREE from "three";
import { IS_DEV } from "../utils/env.js";
import {
  HARBOR_WATER_BOUNDS,
  HARBOR_WATER_CENTER,
  HARBOR_WATER_EAST_LIMIT,
  getSeaLevelY,
  HARBOR_GROUND_HEIGHT,
  getCityGroundY,
  HARBOR_CENTER_3D,
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
import { RENDER_LAYERS } from "./renderLayers.js";
import { joinPath, resolveBaseUrl } from "../utils/baseUrl.js";

const DOCK_SECTION_LENGTH = 9.5;
const DOCK_SECTION_WIDTH = 5.8;
const DOCK_THICKNESS = 0.45;
const DOCK_POST_HEIGHT = 1.6;
const DOCK_GAP = 0.35;
const DOCK_LIFT = 1.2; // Raise docks above water for better visibility
const waterTextureLoader = new THREE.TextureLoader();

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

function createReflectiveWaterMaterial() {
  // Use a physical material to pick up scene reflections and soft wave normals.
  const normalMap = waterTextureLoader.load(
    "textures/ground/water_normals.png",
    (tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(6, 6);
      if ("colorSpace" in tex && THREE.LinearSRGBColorSpace !== undefined) {
        tex.colorSpace = THREE.LinearSRGBColorSpace;
      }
    },
  );

  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x00CED1), // Mediterranean turquoise
    transparent: true,
    opacity: 0.5,
    metalness: 0.05,
    roughness: 0.25,
    transmission: 0.95,
    envMapIntensity: 1.2,
    normalMap,
    normalScale: new THREE.Vector2(0.3, 0.3), // Subtler waves
  });
}

function createHarborWaterPlane(seaLevel) {
  // Massive water expanse extending eastward
  const width = 800;
  // Extended depth to create proper north-south shoreline (was 120, now 400)
  const depth = 400;
  const geometry = new THREE.PlaneGeometry(width, depth, 32, 32);
  const material = createReflectiveWaterMaterial();

  const water = new THREE.Mesh(geometry, material);
  water.rotation.x = -Math.PI / 2;
  // Position relative to harbor group origin (0,0,0) since group is repositioned
  // Harbor group positioned at HARBOR_CENTER_3D (120, harborGroundY, 80) in world space
  // Shift water eastward (+400 X) so it only appears in front/east, not behind/west
  // Local Y position ensures water sits at seaLevel in world coordinates:
  // World Y = harborGroundY + (seaLevel - HARBOR_GROUND_HEIGHT) = seaLevel
  water.position.set(400, seaLevel - HARBOR_GROUND_HEIGHT, 0);
  water.name = "HarborLowPolyWater";
  water.userData.isWater = true;
  water.userData.seaLevel = seaLevel;
  water.receiveShadow = false;
  // Transparent harbor water renders before opaque pad via renderOrder
  water.renderOrder = RENDER_LAYERS.WATER;
  return water;
}

function createHarborPad(harborGroundY) {
  // Small harbor island pad - 60x60 brown square
  const width = 60;
  const depth = 60;
  const geometry = new THREE.PlaneGeometry(width, depth, 1, 1);
  if (geometry.attributes.uv && !geometry.attributes.uv2) {
    geometry.setAttribute(
      "uv2",
      new THREE.BufferAttribute(
        new Float32Array(geometry.attributes.uv.array),
        2,
      ),
    );
  }
  
  // Create material matching terrain texture for seamless appearance underwater
  const textureLoader = new THREE.TextureLoader();
  const baseUrl = resolveBaseUrl();
  
  const sandDiffuse = textureLoader.load(
    joinPath(baseUrl, "textures/gravelly_sand/gravelly_sand_diff_1k.jpg"),
  );
  sandDiffuse.wrapS = sandDiffuse.wrapT = THREE.RepeatWrapping;
  sandDiffuse.repeat.set(28, 24); // Match terrain repeat scale
  sandDiffuse.colorSpace = THREE.SRGBColorSpace;
  
  const sandNormal = textureLoader.load(
    joinPath(baseUrl, "textures/gravelly_sand/gravelly_sand_nor_gl_1k.jpg"),
  );
  sandNormal.wrapS = sandNormal.wrapT = THREE.RepeatWrapping;
  sandNormal.repeat.set(28, 24); // Match terrain repeat scale
  sandNormal.colorSpace = THREE.NoColorSpace;
  
  const sandARM = textureLoader.load(
    joinPath(baseUrl, "textures/gravelly_sand/gravelly_sand_arm_1k.jpg"),
  );
  sandARM.wrapS = sandARM.wrapT = THREE.RepeatWrapping;
  sandARM.repeat.set(28, 24); // Match terrain repeat scale
  sandARM.colorSpace = THREE.NoColorSpace;
  
  const padMaterial = new THREE.MeshStandardMaterial({
    map: sandDiffuse,
    color: 0xffffff,
    roughness: 0.8,
    metalness: 0.0,
    normalMap: sandNormal,
    normalScale: new THREE.Vector2(0.5, 0.5),
    aoMap: sandARM,
    roughnessMap: sandARM,
    aoMapIntensity: 0.6,
  });
  
  const pad = new THREE.Mesh(geometry, padMaterial);
  pad.name = "HarborPad";
  pad.rotation.x = -Math.PI / 2;
  // Position relative to harbor group origin (0,0,0)
  // Group is positioned at HARBOR_CENTER_3D (120, harborGroundY, 80) in world space
  pad.position.set(
    0,
    0.12, // lift above water plane for z-fighting prevention
    0,
  );
  pad.receiveShadow = true;
  pad.renderOrder = RENDER_LAYERS.DETAIL;
  return pad;
}

function createDockSection(seaLevel, { length = DOCK_SECTION_LENGTH, width = DOCK_SECTION_WIDTH } = {}) {
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(length, DOCK_THICKNESS, width),
    new THREE.MeshStandardMaterial({
      color: 0xbfa48a, // Lighter, more sunlit wood
      roughness: 0.65,
      metalness: 0.04,
    }),
  );
  // Local Y relative to harbor group (group Y = harborGroundY)
  deck.position.y = (seaLevel - HARBOR_GROUND_HEIGHT) + DOCK_LIFT - DOCK_THICKNESS * 0.5;
  enableShadows(deck);

  const postMaterial = new THREE.MeshStandardMaterial({
    color: 0x7a6248,
    roughness: 0.78,
    metalness: 0.05,
  });
  const postGeometry = new THREE.CylinderGeometry(0.35, 0.42, DOCK_POST_HEIGHT + 0.6, 10);

  const posts = new THREE.Group();
  const postY = (seaLevel - HARBOR_GROUND_HEIGHT) + DOCK_LIFT - (DOCK_POST_HEIGHT + 0.6) * 0.5;
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
    section.position.set(cursorX, seaLevel - HARBOR_GROUND_HEIGHT, z);
    pier.add(section);
    sections.push(section);
    cursorX -= section.userData.length - DOCK_GAP;
  }

  return { pier, sections };
}

function createFishingBoat({ length = 10, width = 3.4, seaLevel = 0, hull = 0x2f6bb4, accent = 0xf2a541 }) {
  const boat = new THREE.Group();
  boat.name = "HarborBoat";

  const hullMesh = new THREE.Mesh(
    new THREE.BoxGeometry(length, 1.1, width),
    new THREE.MeshStandardMaterial({ color: hull, roughness: 0.42, metalness: 0.15 }),
  );
  // Local offsets relative to boat origin (will be positioned relative to harbor group)
  hullMesh.position.y = 0.55;
  enableShadows(hullMesh);
  boat.add(hullMesh);

  const bow = new THREE.Mesh(
    new THREE.ConeGeometry(width * 0.55, 1.6, 10),
    new THREE.MeshStandardMaterial({ color: accent, roughness: 0.46, metalness: 0.12 }),
  );
  bow.rotation.z = Math.PI;
  bow.position.set(length * 0.5 - 1.0, 1.15, 0);
  enableShadows(bow);
  boat.add(bow);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(length * 0.28, 1.0, width * 0.6),
    new THREE.MeshStandardMaterial({ color: 0xf7f1d0, roughness: 0.35 }),
  );
  cabin.position.set(-length * 0.18, 1.35, 0);
  enableShadows(cabin);
  boat.add(cabin);

  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 3.0, 8),
    new THREE.MeshStandardMaterial({ color: 0xe6dfd7, roughness: 0.4 }),
  );
  mast.position.set(-length * 0.05, 2.2, 0);
  enableShadows(mast);
  boat.add(mast);

  return boat;
}

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

function scatterDockProps(target, dockSections, seaLevel) {
  if (!dockSections.length) return;
  for (const section of dockSections) {
    if (Math.random() < 0.4) continue;
    const prop = Math.random() > 0.5 ? createCrateCluster() : createBarrelCluster();
    const localX = THREE.MathUtils.randFloatSpread(section.userData.length * 0.6);
    const localZ = THREE.MathUtils.randFloatSpread(section.userData.width * 0.5);
    // Y is local to harbor group: seaLevel is 0, add lift and thickness
    const localY = (seaLevel - HARBOR_GROUND_HEIGHT) + DOCK_LIFT + DOCK_THICKNESS * 0.5 + 0.15;
    prop.position.set(section.position.x + localX, localY, section.position.z + localZ);
    prop.userData.category = "harbor-prop-dock";
    target.add(prop);
  }
}

function scatterShoreProps(target, groundY) {
  // Local coordinates relative to harbor group center
  // HARBOR_WATER_EAST_LIMIT = 190, HARBOR_CENTER = 120, so local = 70
  const scatterBounds = {
    west: 70 + 2,   // Local coordinates
    east: 70 + 28,
    north: -60 - 6, // HARBOR_WATER_HALF_DEPTH = 60
    south: 60 + 6,
  };

  for (let i = 0; i < 8; i++) {
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
 * Bridges the elevation gap from getCityGroundY() to harborGroundY
 * @param {number} cityGroundY - The city ground elevation
 * @param {number} harborGroundY - The harbor ground elevation
 * @returns {THREE.Group} Connector structure
 */
function createCityHarborConnector(cityGroundY, harborGroundY) {
  const connector = new THREE.Group();
  connector.name = "CityHarborConnector";

  // Calculate elevation difference
  const elevationDiff = cityGroundY - harborGroundY;
  
  // Boardwalk extends from city edge (around X=60) toward harbor
  // In local harbor coordinates: cityX - harborX = 0 - 120 = -120
  const boardwalkLength = 70; // Length toward city (west)
  const boardwalkWidth = 8;   // Width for comfortable walkway
  const boardwalkThickness = 0.35;
  
  // Wood planks material
  const woodMaterial = new THREE.MeshStandardMaterial({
    color: 0xa89075,
    roughness: 0.75,
    metalness: 0.02,
  });

  // Main boardwalk deck segments with gradual slope
  const segmentCount = 7;
  const segmentLength = boardwalkLength / segmentCount;
  
  for (let i = 0; i < segmentCount; i++) {
    const t = i / (segmentCount - 1); // 0 to 1 from harbor to city
    const segmentElevation = THREE.MathUtils.lerp(0, elevationDiff, t);
    const nextT = (i + 1) / (segmentCount - 1);
    const nextElevation = THREE.MathUtils.lerp(0, elevationDiff, nextT);
    const avgElevation = (segmentElevation + nextElevation) / 2;
    
    // Calculate tilt angle for this segment
    const tiltAngle = Math.atan2(nextElevation - segmentElevation, segmentLength);
    
    const segment = new THREE.Mesh(
      new THREE.BoxGeometry(segmentLength, boardwalkThickness, boardwalkWidth),
      woodMaterial
    );
    
    // Position each segment
    const xPos = -70 + (i * segmentLength) + (segmentLength / 2);
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
    const xPos = -70 + (t * boardwalkLength);
    const topElevation = THREE.MathUtils.lerp(0, elevationDiff, t);
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

  [-boardwalkWidth / 2, boardwalkWidth / 2].forEach(side => {
    const railingPoints = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const xPos = -70 + (t * boardwalkLength);
      const yPos = THREE.MathUtils.lerp(0, elevationDiff, t) + railingHeight;
      railingPoints.push(new THREE.Vector3(xPos, yPos, side));
    }
    
    const railingCurve = new THREE.CatmullRomCurve3(railingPoints);
    const railingGeometry = new THREE.TubeGeometry(railingCurve, 32, railingRadius, 8, false);
    const railing = new THREE.Mesh(railingGeometry, railingMaterial);
    railing.receiveShadow = true;
    railing.castShadow = true;
    connector.add(railing);
  });

  return connector;
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
 * Creates a clocktower on a raised platform.
 * Includes square tower with clock faces and peaked roof.
 */
function createClocktower() {
  const clocktower = new THREE.Group();

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
  clocktower.add(base);

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
  clocktower.add(tower);

  // Clock faces (four sides)
  const clockFaceGeometry = new THREE.CircleGeometry(0.5, 16);
  const clockFaceMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.1,
  });
  
  const clockPositions = [
    { x: 0, z: 0.91, rotY: 0 },      // Front
    { x: 0.91, z: 0, rotY: Math.PI/2 }, // Right
    { x: 0, z: -0.91, rotY: Math.PI },  // Back
    { x: -0.91, z: 0, rotY: -Math.PI/2 } // Left
  ];

  clockPositions.forEach(pos => {
    const face = new THREE.Mesh(clockFaceGeometry, clockFaceMaterial);
    face.position.set(pos.x, 3.8, pos.z);
    face.rotation.y = pos.rotY;
    clocktower.add(face);
  });

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
  clocktower.add(roof);

  return clocktower;
}

/**
 * Creates a complete harbor with all features and props.
 * 
 * Harbor Features Created:
 * 1. Harbor Pad - Ground plane with sand texture
 * 2. Water Plane - Reflective water surface extending eastward
 * 3. Piers - Three rows of wooden docks (North, Center, South)
 *    - Each pier has multiple dock sections
 *    - Wooden posts for structural support
 * 4. Boats - Fishing boats moored at each pier
 *    - Hull, bow, cabin, and mast
 *    - Variety of colors from BOAT_STYLES
 * 5. Shoreline Dressing - Mooring posts along the waterfront
 * 6. Dock Props - Crates and barrels scattered on dock sections
 * 7. Shore Props - Crates and barrels on the shoreline
 * 8. Sheds/Warehouses - Two storage buildings with terracotta roofs
 * 9. City Connector - Wooden boardwalk ramp from city level to harbor level
 * 10. Lighthouse - Tall stone tower on raised platform (if available)
 * 11. Clocktower - Square tower with clock faces on raised platform (if available)
 * 
 * All elements are positioned relative to harborGroundY (seaLevel + HARBOR_GROUND_HEIGHT)
 * to ensure they sit above water level.
 * 
 * The harbor is positioned at HARBOR_CENTER_3D (120, harborGroundY, 80).
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
                        scene?.userData?.getHeightAt;

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

  const harborPad = createHarborPad(harborGroundY);
  harbor.add(harborPad);

  const waterPlane = createHarborWaterPlane(seaLevel);
  harbor.add(waterPlane);

  // Use grid-aligned dock slots if available, otherwise fallback to default positions
  const piersGroup = new THREE.Group();
  piersGroup.name = "HarborPiers";
  const allSections = [];
  
  // Track pier positions for boat placement
  const pierPositions = [];

  if (dockSlots.length >= 3) {
    // Place piers in best grid-aligned slots
    if (IS_DEV) console.log(`[Harbor] Placing piers in ${Math.min(3, dockSlots.length)} grid-aligned slots`);
    
    for (let i = 0; i < Math.min(3, dockSlots.length); i++) {
      const slot = dockSlots[i];
      // Convert world coordinates to local harbor coordinates
      const localX = slot.x - HARBOR_CENTER_3D.x;
      const localZ = slot.z - HARBOR_CENTER_3D.z;
      
      const sections = 4 + Math.floor(Math.random() * 2);
      const { pier, sections: pierSections } = createPierLine(localX, localZ, sections, seaLevel);
      allSections.push(...pierSections);
      piersGroup.add(pier);
      
      // Store pier position for boat placement
      pierPositions.push({ x: localX, z: localZ });
    }
  } else {
    // Fallback to default pier positions
    if (IS_DEV) console.log('[Harbor] Using default pier positions (no terrain sampler)');
    const pierStartX = 70 + 1.1;
    const pierRows = [
      { z: -18, sections: 4 },
      { z: -2, sections: 5 },
      { z: 16, sections: 4 },
    ];

    for (const row of pierRows) {
      const { pier, sections } = createPierLine(pierStartX, row.z, row.sections, seaLevel);
      allSections.push(...sections);
      piersGroup.add(pier);
      
      // Store pier position for boat placement
      pierPositions.push({ x: pierStartX, z: row.z });
    }
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
    // Local X = HARBOR_WATER_EAST_LIMIT - HARBOR_CENTER_3D.x = 190 - 120 = 70
    post.position.set(
      70 + 4.0,
      1.2,
      dressingZ[i],
    );
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
      seaLevel - HARBOR_GROUND_HEIGHT, 
      pierPos.z + (Math.random() > 0.5 ? moorOffset : -moorOffset)
    );
    boat.userData.category = "harbor-boat";
    boatsGroup.add(boat);
  }
  harbor.add(boatsGroup);

  const propsGroup = new THREE.Group();
  propsGroup.name = "HarborProps";
  scatterDockProps(propsGroup, allSections, seaLevel);
  scatterShoreProps(propsGroup, harborGroundY);
  harbor.add(propsGroup);

  // Sheds positioned in local coordinates
  const sheds = [
    createShed(new THREE.Vector3(18, 5.2, 12), 0, new THREE.Vector3(70 + 12, 0, -10)),
    createShed(new THREE.Vector3(22, 6, 14), 0, new THREE.Vector3(70 + 24, 0, 8)),
  ];
  sheds.forEach((shed) => harbor.add(shed));

  // Place lighthouse and clocktower on raised platforms if available
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
    harbor.add(lighthouse);
    if (IS_DEV) console.log(`[Harbor] Lighthouse placed at (${lighthouseLocalX.toFixed(1)}, ${lighthouseSlot.elevation.toFixed(2)}, ${lighthouseLocalZ.toFixed(1)})`);

    // Place clocktower on second highest raised platform if available
    if (sortedRaised.length >= 2) {
      const clocktowerSlot = sortedRaised[1];
      const clocktower = createClocktower();
      const clocktowerLocalX = clocktowerSlot.x - HARBOR_CENTER_3D.x;
      const clocktowerLocalZ = clocktowerSlot.z - HARBOR_CENTER_3D.z;
      clocktower.position.set(clocktowerLocalX, clocktowerSlot.elevation - harborGroundY, clocktowerLocalZ);
      clocktower.userData.category = "harbor-clocktower";
      harbor.add(clocktower);
      console.log(`[Harbor] Clocktower placed at (${clocktowerLocalX.toFixed(1)}, ${clocktowerSlot.elevation.toFixed(2)}, ${clocktowerLocalZ.toFixed(1)})`);
    }
  }

  // Add city-harbor connector boardwalk
  const cityGroundY = getCityGroundY();
  const connector = createCityHarborConnector(cityGroundY, harborGroundY);
  harbor.add(connector);

  // Position harbor group in world space
  // The harbor center should be at HARBOR_CENTER_3D (120, seaLevel, 80)
  // But we offset by (-50, 0, -100) to move it west and north
  // Final position: (120-50=70, harborGroundY, 80-100=-20)
  harbor.position.set(120, harborGroundY, 80);

  if (scene) {
    scene.add(harbor);
  }

  return harbor;
}

export function updateHarborLighting(harbor, nightFactor = 0) {
  if (!harbor) return;

  const clampedNight = THREE.MathUtils.clamp(nightFactor ?? 0, 0, 1);
  const daylight = 1 - clampedNight;
  const warmSunlight = new THREE.Color("#e3b07a");
  const coolAmbient = new THREE.Color("#d2d9e4");

  harbor.traverse((child) => {
    if (!child.isMesh) return;
    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    for (const material of materials) {
      if (!material || !material.isMaterial) continue;

      material.userData = material.userData || {};

      if (material.color && !material.userData.baseColor) {
        material.userData.baseColor = material.color.clone();
      }
      if (
        material.envMapIntensity !== undefined &&
        material.userData.baseEnvMapIntensity === undefined
      ) {
        material.userData.baseEnvMapIntensity = material.envMapIntensity ?? 1;
      }
      if (
        material.roughness !== undefined &&
        material.userData.baseRoughness === undefined
      ) {
        material.userData.baseRoughness = material.roughness;
      }

      if (material.color && material.userData.baseColor) {
        const cooled = material.userData.baseColor
          .clone()
          .lerp(coolAmbient, clampedNight * 0.2);
        material.color.copy(cooled.lerp(warmSunlight, daylight * 0.18));
      }

      if (material.envMapIntensity !== undefined) {
        const baseEnv = material.userData.baseEnvMapIntensity ?? 1;
        const dayReflect = baseEnv * 1.25;
        const nightReflect = baseEnv * 0.32;
        material.envMapIntensity = THREE.MathUtils.lerp(
          dayReflect,
          nightReflect,
          clampedNight,
        );
      }

      if (material.roughness !== undefined) {
        const baseRoughness = material.userData.baseRoughness ?? material.roughness;
        const dayRoughness = Math.max(0.02, baseRoughness - 0.08 * daylight);
        const nightRoughness = Math.min(1, baseRoughness + 0.1 * clampedNight);
        material.roughness = THREE.MathUtils.lerp(
          dayRoughness,
          nightRoughness,
          clampedNight,
        );
      }
    }
  });
}
