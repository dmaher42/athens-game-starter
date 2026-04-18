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
  group.add(trunk);

  // Foliage - Tapered tiers for depth
  const leafMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a3311,
    roughness: 0.7,
    sheen: 0.5,
    sheenColor: 0x2e4d1a,
    flatShading: false
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
    group.add(segment);
    
    lastPos.add(new THREE.Vector3(0, segHeight * 0.8, 0));
  }

  // Canopy - Scattered "clouds" of foliage
  const leafMat = new THREE.MeshPhysicalMaterial({
    color: 0x7c8a6d, // Silver-green
    roughness: 0.8,
    sheen: 1.0,
    sheenColor: 0xa8bca0, // Bright silver sheen
    metalness: 0.0
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
    group.add(crown);
  }

  return group;
}
