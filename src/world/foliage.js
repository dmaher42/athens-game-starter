import * as THREE from 'three';

/**
 * High-fidelity Mediterranean foliage models for Athens.
 * Uses MeshPhysicalMaterial to catch the sun-drenched atmosphere.
 */

/**
 * Creates a tall, slender Mediterranean Cypress tree.
 */
export function createCypressTree(options = {}) {
  const scale = options.scale || 1.0;
  const group = new THREE.Group();
  group.name = "CypressTree";

  // Trunk - dark, rough bark
  const trunkHeight = 1.0 * scale;
  const trunkGeom = new THREE.CylinderGeometry(0.12 * scale, 0.18 * scale, trunkHeight, 8);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x4a3c2b,
    roughness: 0.9,
    metalness: 0.05
  });
  const trunk = new THREE.Mesh(trunkGeom, trunkMat);
  trunk.position.y = trunkHeight * 0.5;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  trunk.userData.isFoliage = true;
  group.add(trunk);

  // Foliage - Tapered tiers for depth
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x1a3311,
    roughness: 0.8,
    metalness: 0.05
  });

  const tierCount = 4;
  for (let i = 0; i < tierCount; i++) {
    const progress = i / (tierCount - 1);
    const tierWidth = (0.6 - progress * 0.5) * scale;
    const tierHeight = (2.5 - progress * 1.5) * scale;
    
    const foliageGeom = new THREE.ConeGeometry(tierWidth, tierHeight, 8);
    // Slight random rotation for organic look
    foliageGeom.rotateY(i * 0.7);
    
    const foliage = new THREE.Mesh(foliageGeom, leafMat);
    foliage.position.y = trunkHeight + (i * 0.8 * scale) + (tierHeight * 0.4);
    foliage.castShadow = true;
    foliage.receiveShadow = true;
    foliage.userData.isFoliage = true;
    group.add(foliage);
  }

  return group;
}

/**
 * Creates a gnarled, silver-green Mediterranean Olive tree.
 */
export function createOliveTree(options = {}) {
  const scale = options.scale || 1.0;
  const group = new THREE.Group();
  group.name = "OliveTree";

  // Gnarled Trunk - multi-segment for "twisted" look
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x706150,
    roughness: 0.95,
    metalness: 0.02
  });

  const segmentCount = 3;
  let lastPos = new THREE.Vector3(0, 0, 0);
  for (let i = 0; i < segmentCount; i++) {
    const segHeight = 0.8 * scale;
    const segGeom = new THREE.CylinderGeometry(
      (0.25 - i * 0.05) * scale,
      (0.35 - i * 0.05) * scale,
      segHeight,
      7
    );
    
    const segment = new THREE.Mesh(segGeom, trunkMat);
    segment.position.copy(lastPos).add(new THREE.Vector3(0, segHeight * 0.5, 0));
    // Twist
    segment.rotation.set(
      (Math.random() - 0.5) * 0.3,
      Math.random() * Math.PI,
      (Math.random() - 0.5) * 0.3
    );
    
    segment.castShadow = true;
    segment.receiveShadow = true;
    segment.userData.isFoliage = true;
    group.add(segment);
    
    lastPos.add(new THREE.Vector3(0, segHeight * 0.8, 0));
  }

  // Canopy - Scattered "clouds" of foliage
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x7c8a6d, // Silver-green
    roughness: 0.85,
    metalness: 0.02
  });

  const canopyPoints = [
    { pos: [0, 2.5, 0], r: 1.2 },
    { pos: [0.8, 2.2, 0.5], r: 0.9 },
    { pos: [-0.7, 2.3, -0.6], r: 1.0 },
    { pos: [0.3, 2.8, -0.7], r: 0.8 },
    { pos: [-0.5, 2.1, 0.8], r: 0.7 },
  ];

  for (const pt of canopyPoints) {
    const crownGeom = new THREE.SphereGeometry(pt.r * scale, 8, 6);
    // Squash the spheres slightly
    crownGeom.scale(1.2, 0.7, 1.2);
    
    const crown = new THREE.Mesh(crownGeom, leafMat);
    crown.position.set(pt.pos[0] * scale, pt.pos[1] * scale, pt.pos[2] * scale);
    crown.castShadow = true;
    crown.receiveShadow = true;
    crown.userData.isFoliage = true;
    group.add(crown);
  }

  return group;
}

/**
 * Creates a majestic Mediterranean Stone Pine (Umbrella Pine).
 * Iconic wide, flat-topped canopy and tall, sturdy trunk.
 */
export function createStonePine(options = {}) {
  const scale = options.scale || 1.0;
  const group = new THREE.Group();
  group.name = "StonePine";

  // Sturdy Trunk
  const trunkHeight = 3.5 * scale;
  const trunkGeom = new THREE.CylinderGeometry(0.25 * scale, 0.45 * scale, trunkHeight, 10);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x5d4a37,
    roughness: 0.85,
  });
  const trunk = new THREE.Mesh(trunkGeom, trunkMat);
  trunk.position.y = trunkHeight * 0.5;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  // Wide, Flat Canopy (The "Umbrella")
  const leafMat = new THREE.MeshPhysicalMaterial({
    color: 0x223d11,
    roughness: 0.75,
    sheen: 0.6,
    sheenColor: 0x3d5c22,
  });

  const canopyWidth = 4.5 * scale;
  const canopyHeight = 1.2 * scale;
  const crownGeom = new THREE.SphereGeometry(canopyWidth * 0.5, 12, 8);
  crownGeom.scale(1.0, 0.4, 1.0); // Extreme squash for umbrella look
  
  const crown = new THREE.Mesh(crownGeom, leafMat);
  crown.position.y = trunkHeight + (canopyHeight * 0.2);
  crown.castShadow = true;
  crown.receiveShadow = true;
  crown.userData.isFoliage = true;
  group.add(crown);

  // Add a secondary smaller "mound" on top for organic variety
  const topMoundGeom = new THREE.SphereGeometry(canopyWidth * 0.3, 8, 6);
  topMoundGeom.scale(1.0, 0.3, 1.0);
  const topMound = new THREE.Mesh(topMoundGeom, leafMat);
  topMound.position.y = trunkHeight + (canopyHeight * 0.6);
  topMound.castShadow = true;
  group.add(topMound);

  return group;
}

/**
 * Creates a tall, shimmering Poplar tree.
 * Narrow but distinct from Cypress by its lighter, broader foliage clusters.
 */
export function createPoplar(options = {}) {
  const scale = options.scale || 1.0;
  const group = new THREE.Group();
  group.name = "Poplar";

  // Pale Trunk
  const trunkHeight = 4.0 * scale;
  const trunkGeom = new THREE.CylinderGeometry(0.12 * scale, 0.22 * scale, trunkHeight, 8);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0xc2c2b0, // Pale grey/cream
    roughness: 0.6,
  });
  const trunk = new THREE.Mesh(trunkGeom, trunkMat);
  trunk.position.y = trunkHeight * 0.5;
  group.add(trunk);

  // Vertical, shimmering canopy
  const leafMat = new THREE.MeshPhysicalMaterial({
    color: 0x4a6332,
    roughness: 0.4,
    sheen: 1.0,
    sheenColor: 0x98b070, // Silver-gold shimmer
  });

  const clusterCount = 6;
  for (let i = 0; i < clusterCount; i++) {
    const yOffset = (1.5 + i * 0.6) * scale;
    const clusterScale = (0.7 + Math.sin(i) * 0.2) * scale;
    const geom = new THREE.IcosahedronGeometry(clusterScale, 0);
    geom.scale(0.8, 1.4, 0.8); // Vertical stretched clusters
    
    const cluster = new THREE.Mesh(geom, leafMat);
    cluster.position.set(
      (Math.random() - 0.5) * 0.2 * scale,
      yOffset,
      (Math.random() - 0.5) * 0.2 * scale
    );
    cluster.rotation.y = Math.random() * Math.PI;
    cluster.castShadow = true;
    cluster.receiveShadow = true;
    group.add(cluster);
  }

  return group;
}

/**
 * Creates a low-poly Lavender bush.
 * Hemispherical mound with a purple floral sheen.
 */
export function createLavenderBush(options = {}) {
  const scale = options.scale || 1.0;
  const group = new THREE.Group();
  group.name = "LavenderBush";

  const leafMat = new THREE.MeshPhysicalMaterial({
    color: 0x2d451e, // Deep green base
    roughness: 0.8,
    sheen: 1.0,
    sheenColor: 0x9370db, // Purple blossom tint
  });

  const geom = new THREE.SphereGeometry(0.45 * scale, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.5);
  geom.scale(1.2, 0.8, 1.2);
  
  const bush = new THREE.Mesh(geom, leafMat);
  bush.castShadow = true;
  bush.receiveShadow = true;
  group.add(bush);

  return group;
}
