import * as THREE from "three";
import { HARBOR_WATER_BOUNDS, HARBOR_WATER_EAST_LIMIT } from "../locations.js";

function seededRandom(seed) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function createShorelineDressing(scene, terrain, seaLevel) {
    const group = new THREE.Group();
    scene.add(group);

    // Bounds to scatter
    // We want the shoreline near the harbor.
    // HARBOR_WATER_EAST_LIMIT is the dock edge.
    // The "natural" shoreline is north and south of the harbor piers.

    const northLimit = HARBOR_WATER_BOUNDS.north;
    const southLimit = HARBOR_WATER_BOUNDS.south;
    const eastLimit = HARBOR_WATER_EAST_LIMIT + 20; // Inland a bit
    const westLimit = HARBOR_WATER_EAST_LIMIT - 5; // Into the water a bit?

    // Actually, we want to follow the coast line which might curve.
    // But for "harbor shoreline dressing", we can target the areas adjacent to the constructed harbor.

    const count = 40;
    const seed = 999;

    const rockGeo = new THREE.DodecahedronGeometry(1, 0);
    const rockMat = new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 0.9,
        fog: true
    });

    for (let i = 0; i < count; i++) {
        // Pick a side: North or South of the main harbor basin
        const side = seededRandom(seed + i) > 0.5 ? 1 : -1;

        let z;
        if (side > 0) {
            // South side
            z = southLimit + seededRandom(seed + i * 2) * 40;
        } else {
            // North side
            z = northLimit - seededRandom(seed + i * 2) * 40;
        }

        // X varies around the east limit
        const x = HARBOR_WATER_EAST_LIMIT + (seededRandom(seed + i * 3) - 0.2) * 20;

        const scale = 0.5 + seededRandom(seed + i * 4) * 1.5;

        const mesh = new THREE.Mesh(rockGeo, rockMat);
        mesh.position.set(x, seaLevel, z);
        mesh.scale.setScalar(scale);
        mesh.rotation.set(
            seededRandom(seed + i * 5) * Math.PI,
            seededRandom(seed + i * 6) * Math.PI,
            seededRandom(seed + i * 7) * Math.PI
        );

        // Snap to ground?
        // We want them embedded in the sand/water line.
        // If we have terrain sampler, we can adjust.
        if (terrain && terrain.userData.getHeightAt) {
             const h = terrain.userData.getHeightAt(x, z);
             if (h !== null) {
                 mesh.position.y = h - scale * 0.3; // Embed
             }
        }

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
    }

    return group;
}
