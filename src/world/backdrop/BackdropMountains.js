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
    this.createMountains();
    this.createMainlandExtension();
  }

  createMountains() {
    const count = 120; // Number of peaks
    const minRadius = 1100;
    const maxRadius = 1800;

    // Geometry for peaks - simple tetrahedrons or cones
    // We use a few variations
    const geoms = [
      new THREE.ConeGeometry(1, 1, 4, 1, true), // simple pyramid
      new THREE.ConeGeometry(1, 1, 3, 1, true), // 3-sided
    ];

    // Align base to 0 (default Cone is centered at height/2)
    geoms.forEach(g => {
        g.translate(0, 0.5, 0);
        g.computeVertexNormals();
    });

    // Material
    // Use a basic material with fog to blend into the sky
    // Color should be darkish/silhouetted or distant land color
    const material = new THREE.MeshBasicMaterial({
      color: 0x5a6a7a, // Blends with horizon/fog
      fog: true,
      side: THREE.DoubleSide
    });

    // We will use InstancedMesh for performance if possible, but standard mesh is fine for 120 items.
    // Let's use individual meshes to allow non-uniform scaling easily, or merge geometry.
    // Merging is better for draw calls.

    const mountainGeoms = [];

    // Direction logic:
    // Harbor is West. Land is East.
    // We want mountains in the North, East, South sectors.
    // Open sea is West.

    // Angle 0 is East (+X).
    // Angle PI/2 is South (+Z).
    // Angle -PI/2 is North (-Z).
    // Angle PI is West (-X).

    // We want to avoid the sector around PI (West).
    // Let's say we place mountains from -120 deg to +120 deg (roughly 240 degree coverage).
    // Converting to radians: -2.1 to +2.1.

    for (let i = 0; i < count; i++) {
      const t = seededRandom(this.seed + i);
      const t2 = seededRandom(this.seed + i + 1000);

      // Random angle in the "Inland" sector
      // Bias towards East (0)
      const angleRange = Math.PI * 1.3; // +/- 117 degrees
      const angle = (t - 0.5) * angleRange;

      const distT = t2 * t2; // bias towards inner or outer?
      // Let's just uniform
      const radius = minRadius + t2 * (maxRadius - minRadius);

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const scaleW = 150 + seededRandom(this.seed + i * 2) * 300;
      const scaleH = 100 + seededRandom(this.seed + i * 3) * 400; // varied height

      // Create a clone of a random geometry
      const geomIdx = Math.floor(seededRandom(this.seed + i * 4) * geoms.length);
      const geom = geoms[geomIdx].clone();

      geom.scale(scaleW, scaleH, scaleW);
      geom.rotateY(seededRandom(this.seed + i * 5) * Math.PI * 2);
      geom.translate(x, this.seaLevel - 10, z); // Sink slightly

      mountainGeoms.push(geom);
    }

    // Also add "hills" closer in to bridge the gap?
    // The gap is handled by createMainlandExtension, but some visual hills help.

    if (mountainGeoms.length > 0) {
        // Use BufferGeometryUtils if available, or just manually merge?
        // Since I don't want to import heavy utils if not needed, I'll just use a group of meshes
        // or a single merged geometry if I can easily do it.
        // Actually, let's just use InstancedMesh?
        // But scale is non-uniform. InstancedMesh supports matrix.

        const instancedMesh = new THREE.InstancedMesh(geoms[0], material, count); // Simplifying to one geom for now
        // Actually mixing geom types in InstancedMesh is hard.
        // Let's just stick to individual meshes for simplicity, 120 draw calls is nothing.
        // Or merge manually.

        // I'll merge manually into one buffer geometry for best practice.
        // But Three.js core doesn't export mergeBufferGeometries directly anymore in some versions?
        // It's in examples/jsm/utils/BufferGeometryUtils.js.
        // I'll assume I can't easily import it without checking if it's bundled.
        // So I'll just use a group of Meshes.

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
      // Create a flat(ish) mesh to cover the water in the inland direction.
      // Radius from ~200 (end of terrain) to ~2200 (beyond mountains).
      // Sector: East.

      // Extended inland mass to block horizon gaps
      const innerRadius = 180;
      const outerRadius = 2400;
      const thetaStart = -Math.PI / 1.35; // Wider start (approx -133 deg)
      const thetaLength = Math.PI * 1.5;  // Wider arc (approx 270 deg)

      const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 32, 8, thetaStart, thetaLength);

      // Perturb heights slightly to avoid z-fighting with distant water/fog
      // Modify Z (which becomes Y after rotation) to create a rise
      const pos = geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i); // Y in RingGeometry corresponds to Z in world space (before rotation)
        const r = Math.hypot(x, y);

        // Slight rise at distance to block horizon
        // We modify the Z attribute (which is 0 for a flat ring) to create height relative to the ring plane.
        const rise = (r - innerRadius) * 0.025;
        pos.setZ(i, rise);
      }

      // Rotate to flat (X-axis rotation maps XY plane to XZ plane, and Z axis to -Y axis)
      // Actually, rotateX(-PI/2):
      // y' = y*cos - z*sin = 0 - z*(-1) = z
      // z' = y*sin + z*cos = y*(-1) + 0 = -y
      // So Ring(x, y, z_height) -> World(x, z_height, -y)
      // This means our 'rise' (set in Z) becomes World Y (Height). This is correct.
      geometry.rotateX(-Math.PI / 2);

      // Vertex colors or texture?
      // Need to match terrain. Terrain uses vertex colors (sand/grass).
      // I'll use a color that matches the "dry land" look.

      const material = new THREE.MeshBasicMaterial({
          color: 0x5b6055, // Darkish dry grass/ground
          side: THREE.FrontSide,
          fog: true
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(AGORA_CENTER_3D.x, this.seaLevel - 0.5, AGORA_CENTER_3D.z);
      mesh.receiveShadow = true;

      this.group.add(mesh);
  }
}
