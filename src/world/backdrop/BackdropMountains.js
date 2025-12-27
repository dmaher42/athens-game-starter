import * as THREE from "three";
import { AGORA_CENTER_3D, HARBOR_CENTER_3D } from "../locations.js";

// Deterministic RNG for consistent mountain placement
function seededRandom(seed) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export class BackdropMountains {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.seaLevel = options.seaLevel || 0;
    this.seed = options.seed || 12345;
    this.group = new THREE.Group();
    this.scene.add(this.group);
  }

  create() {
    // Enable procedural peak mesh generation to provide distant landmarks on the mainland side.
    this.createMountains();
    // Enable mainland extension ring to ensure the world is not an island.
    this.createMainlandExtension();
  }

  createMountains() {
    const count = 120; // Number of peaks
    const minRadius = 1100;
    const maxRadius = 1800;

    // Geometry for peaks - simple tetrahedrons or cones
    const geoms = [
      new THREE.ConeGeometry(1, 1, 4, 1, true), // simple pyramid
      new THREE.ConeGeometry(1, 1, 3, 1, true), // 3-sided
    ];

    // Align base to 0 (default Cone is centered at height/2)
    geoms.forEach(g => {
        g.translate(0, 0.5, 0);
        g.computeVertexNormals();
    });

    const material = new THREE.MeshBasicMaterial({
      color: 0x5a6a7a, // Blends with horizon/fog
      fog: true,
      side: THREE.DoubleSide
    });

    const mountainGeoms = [];

    // Direction logic: Concentrate in West (-X). Remove from East (+X).
    for (let i = 0; i < count; i++) {
      const t = seededRandom(this.seed + i);
      const t2 = seededRandom(this.seed + i + 1000);

      // Coverage: roughly 270 degrees centered on West (PI)
      // Range: PI - 135deg to PI + 135deg -> 45deg to 315deg
      // East gap: -45 to +45

      const coverage = Math.PI * 1.5;
      const startAngle = Math.PI - coverage * 0.5;
      const angle = startAngle + t * coverage;

      const radius = minRadius + t2 * (maxRadius - minRadius);

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const scaleW = 150 + seededRandom(this.seed + i * 2) * 300;
      const scaleH = 100 + seededRandom(this.seed + i * 3) * 300;

      const geomIdx = Math.floor(seededRandom(this.seed + i * 4) * geoms.length);
      const geom = geoms[geomIdx].clone();

      geom.scale(scaleW, scaleH, scaleW);
      geom.rotateY(seededRandom(this.seed + i * 5) * Math.PI * 2);
      geom.translate(x, this.seaLevel - 20, z);

      mountainGeoms.push(geom);
    }

    if (mountainGeoms.length > 0) {
        mountainGeoms.forEach(g => {
             const m = new THREE.Mesh(g, material);
             m.castShadow = false;
             m.receiveShadow = false;
             m.matrixAutoUpdate = false;
             m.updateMatrix();
             this.group.add(m);
        });
    }
  }

  createMainlandExtension() {
      // Create a full ring to act as skirt, but modulate height based on sector.
      // Inner radius matches roughly half the terrain size (1200) with overlap.
      const innerRadius = 1100;
      const outerRadius = 4500;
      // Full circle to ensure no gaps at sector boundaries
      const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 64, 8);

      const pos = geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const r = Math.hypot(x, y);

        // RingGeometry is XY plane.
        // angle 0 is East (+X).
        const angle = Math.atan2(y, x);

        // Determine sector
        // We want West (PI) to be land (Positive Height / Rise)
        // We want East (0) to be seabed (Negative Height / Sink)

        // Normalize Eastness: 1 at East, -1 at West
        const eastness = Math.cos(angle);

        // Base rise calculation for land
        // At West: (r - innerRadius) * 0.04 -> rises to ~80m

        let height = 0;

        // Smooth transition from Land (West) to Seabed (East)
        // Let's use smoothstep.
        // If cos(angle) < -0.2 (West-ish), it's Land.
        // If cos(angle) > 0.2 (East-ish), it's Sea.

        const landFactor = 1.0 - smoothstep(-0.2, 0.4, eastness);
        // 1.0 at West, 0.0 at East.

        // Land Profile: Rise
        const landHeight = (r - innerRadius) * 0.04;

        // Sea Profile: Drop (Seabed Skirt)
        // Drop quickly near inner radius, then flatten?
        // Or just linear drop.
        const seaHeight = -25.0 - (r - innerRadius) * 0.02;

        // Blend
        height = THREE.MathUtils.lerp(seaHeight, landHeight, landFactor);

        pos.setZ(i, height);
      }

      geometry.rotateX(-Math.PI / 2);

      const material = new THREE.MeshBasicMaterial({
          color: 0x5b6055,
          side: THREE.FrontSide,
          fog: true
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(AGORA_CENTER_3D.x, this.seaLevel - 0.5, AGORA_CENTER_3D.z);
      mesh.receiveShadow = true;

      this.group.add(mesh);
  }
}

// Helper needed because smoothstep isn't in JS math
function smoothstep(min, max, value) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}
