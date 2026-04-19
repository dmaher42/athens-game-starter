import * as THREE from "three";

export class CollectiblesManager {
  constructor(scene, questManager = null) {
    this.scene = scene;
    this.questManager = questManager;
    this.items = [];
    this.score = 0;
    this.total = 0;
    this.typeScores = {}; // Track count per type
    this.onScoreChange = null;

    // Shared geometry/material for performance
    this.geometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 12);
    this.geometry.rotateZ(Math.PI / 2); // Lay flat like a scroll

    this.material = new THREE.MeshStandardMaterial({
      color: 0xffd700, // Gold
      roughness: 0.3,
      metalness: 0.6,
      emissive: 0xaa6c39,
      emissiveIntensity: 0.4,
    });

    // Wisdom Scroll material (more intense glow)
    this.wisdomMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff, // Cyan/Blue glow
      roughness: 0.1,
      metalness: 0.8,
      emissive: 0x0088cc,
      emissiveIntensity: 1.0,
    });

    // Paper part of the scroll (white ends)
    this.paperMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  }

  spawnAt(x, y, z, type = 'gold') {
    const group = new THREE.Group();
    group.position.set(x, y + 1.2, z); // Float 1.2m above ground

    // Select material based on type
    const mat = type === 'wisdom_scroll' ? this.wisdomMaterial : this.material;
    const scroll = new THREE.Mesh(this.geometry, mat);
    scroll.castShadow = true;
    group.add(scroll);

    // Add a simple point light to make it glow
    const lightColor = type === 'wisdom_scroll' ? 0x00ffff : 0xffaa00;
    const light = new THREE.PointLight(lightColor, 1.5, 4);
    light.position.y = 0.2;
    group.add(light);

    // Animation state
    group.userData = {
      baseY: group.position.y,
      phase: Math.random() * Math.PI * 2,
      collected: false,
      type: type
    };

    this.scene.add(group);
    this.items.push(group);
    this.total++;

    // Initialize type score if new
    if (!this.typeScores[type]) this.typeScores[type] = 0;
  }

  spawnRandomly(terrain, count, center, radius, type = 'gold') {
    const getHeight = terrain?.userData?.getHeightAt;
    if (!getHeight) return;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * radius; // Uniform distribution
      const x = center.x + Math.cos(angle) * dist;
      const z = center.z + Math.sin(angle) * dist;

      const y = getHeight(x, z);
      if (Number.isFinite(y) && y > 2.5) { // Don't spawn underwater
        this.spawnAt(x, y, z, type);
      }
    }
  }

  update(dt, playerPos) {
    const collectDistSq = 1.8 * 1.8; // Increased pickup radius

    for (const item of this.items) {
      if (item.userData.collected || !item.visible) continue;

      // Animate
      item.rotation.y += 2.0 * dt; // Spin
      item.userData.phase += 3.0 * dt;
      item.position.y = item.userData.baseY + Math.sin(item.userData.phase) * 0.25; // More bob

      // Collision Check
      if (playerPos) {
        const distSq = item.position.distanceToSquared(playerPos);
        if (distSq < collectDistSq) {
          this.collect(item);
        }
      }
    }
  }

  collect(item) {
    item.userData.collected = true;
    item.visible = false;
    
    const type = item.userData.type || 'gold';
    this.score++;
    this.typeScores[type] = (this.typeScores[type] || 0) + 1;

    if (this.onScoreChange) {
      this.onScoreChange(this.score, this.total, type, this.typeScores[type]);
    }
  }
}
