import * as THREE from "three";
import {
  AEGEAN_OCEAN_BOUNDS,
  HARBOR_WATER_BOUNDS,
  HARBOR_WATER_EAST_LIMIT,
} from "../locations.js";

function seededRandom(seed) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function createShorelineDressing(scene, terrain, seaLevel) {
    const group = new THREE.Group();
    scene.add(group);

    const northLimit = HARBOR_WATER_BOUNDS.north;
    const southLimit = HARBOR_WATER_BOUNDS.south;
    const seaMouthWest = AEGEAN_OCEAN_BOUNDS.west + 6;
    const seaMouthEast = Math.min(AEGEAN_OCEAN_BOUNDS.west + 78, AEGEAN_OCEAN_BOUNDS.east - 30);
    const seaNorth = Math.max(AEGEAN_OCEAN_BOUNDS.north, AEGEAN_OCEAN_BOUNDS.south);
    const seaSouth = Math.min(AEGEAN_OCEAN_BOUNDS.north, AEGEAN_OCEAN_BOUNDS.south);

    const count = 58;
    const seed = 999;

    const rockGeo = new THREE.DodecahedronGeometry(1, 0);
    const rockMat = new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 0.9,
        fog: true
    });

    for (let i = 0; i < count; i++) {
        const shorelineBand = seededRandom(seed + i) > 0.42 ? "mouth" : "openSea";
        const side = seededRandom(seed + i * 2) > 0.5 ? 1 : -1;

        let x;
        let z;
        if (shorelineBand === "mouth") {
            z = side > 0
              ? northLimit + seededRandom(seed + i * 3) * 48
              : southLimit - seededRandom(seed + i * 3) * 44;
            x = HARBOR_WATER_EAST_LIMIT + 6 + seededRandom(seed + i * 4) * 42;
        } else {
            x = seaMouthWest + seededRandom(seed + i * 4) * (seaMouthEast - seaMouthWest);
            z = side > 0
              ? northLimit + 26 + seededRandom(seed + i * 5) * Math.max(12, seaNorth - northLimit - 34)
              : southLimit - 24 - seededRandom(seed + i * 5) * Math.max(12, southLimit - seaSouth - 26);
        }

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
                 mesh.position.y = h - scale * 0.34; // Embed slightly for a softer shoreline
             }
        }

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
    }

    return group;
}
