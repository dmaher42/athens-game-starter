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

function createBeachPatch(scaleX, scaleZ) {
    const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1.08, 0.12, 18),
        new THREE.MeshStandardMaterial({
            color: 0xc8bea8,
            roughness: 0.96,
            metalness: 0.02,
            fog: true,
        }),
    );
    mesh.scale.set(scaleX, 1, scaleZ);
    mesh.receiveShadow = true;
    mesh.castShadow = false;
    return mesh;
}

function createScrubTuft(scale = 1) {
    const tuft = new THREE.Mesh(
        new THREE.ConeGeometry(0.26, 0.78, 6),
        new THREE.MeshStandardMaterial({
            color: 0x5f7a46,
            roughness: 0.86,
            metalness: 0.02,
            fog: true,
        }),
    );
    tuft.scale.setScalar(scale);
    tuft.castShadow = true;
    tuft.receiveShadow = true;
    return tuft;
}

function createShoreCluster(x, z, terrain, seaLevel, seed) {
    if (!terrain?.userData?.getHeightAt) return null;
    const h = terrain.userData.getHeightAt(x, z);
    if (!Number.isFinite(h) || h <= seaLevel + 0.08 || h >= seaLevel + 1.7) return null;

    const group = new THREE.Group();
    group.name = "ShoreCluster";

    const patch = createBeachPatch(
        2.1 + seededRandom(seed + 1) * 2.6,
        1.4 + seededRandom(seed + 2) * 1.9,
    );
    patch.position.set(0, h + 0.05, 0);
    patch.rotation.y = seededRandom(seed + 3) * Math.PI;
    group.add(patch);

    for (let i = 0; i < 3; i++) {
        const tuft = createScrubTuft(0.8 + seededRandom(seed + 10 + i) * 0.55);
        const offsetX = (seededRandom(seed + 20 + i) * 2 - 1) * 1.8;
        const offsetZ = (seededRandom(seed + 30 + i) * 2 - 1) * 1.4;
        const tuftHeight = terrain.userData.getHeightAt(x + offsetX, z + offsetZ);
        if (!Number.isFinite(tuftHeight) || tuftHeight <= seaLevel + 0.12) continue;
        tuft.position.set(offsetX, tuftHeight + 0.2, offsetZ);
        tuft.rotation.y = seededRandom(seed + 40 + i) * Math.PI * 2;
        group.add(tuft);
    }

    group.position.set(x, 0, z);
    return group;
}

export function createShorelineDressing(scene, terrain, seaLevel) {
    const group = new THREE.Group();
    group.name = "ShorelineDressing";
    scene.add(group);

    const northLimit = HARBOR_WATER_BOUNDS.north;
    const southLimit = HARBOR_WATER_BOUNDS.south;
    const seaMouthWest = AEGEAN_OCEAN_BOUNDS.west + 6;
    const seaMouthEast = Math.min(AEGEAN_OCEAN_BOUNDS.west + 78, AEGEAN_OCEAN_BOUNDS.east - 30);
    const seaNorth = Math.max(AEGEAN_OCEAN_BOUNDS.north, AEGEAN_OCEAN_BOUNDS.south);
    const seaSouth = Math.min(AEGEAN_OCEAN_BOUNDS.north, AEGEAN_OCEAN_BOUNDS.south);

    const count = 0;
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

        const scale = 0.3 + seededRandom(seed + i * 4) * 0.55;

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
             if (Number.isFinite(h) && h <= seaLevel + 1.3) {
                 mesh.position.y = h - scale * 0.34; // Embed slightly for a softer shoreline
             } else {
                 continue;
             }
        }

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
    }

    const clusterCount = 8;
    for (let i = 0; i < clusterCount; i++) {
        const shorelineBand = seededRandom(seed + 200 + i) > 0.45 ? "mouth" : "openSea";
        const side = seededRandom(seed + 240 + i) > 0.5 ? 1 : -1;

        let x;
        let z;
        if (shorelineBand === "mouth") {
            x = HARBOR_WATER_EAST_LIMIT + 8 + seededRandom(seed + 260 + i) * 34;
            z = side > 0
              ? northLimit + 10 + seededRandom(seed + 280 + i) * 34
              : southLimit - 10 - seededRandom(seed + 280 + i) * 30;
        } else {
            x = seaMouthWest + 6 + seededRandom(seed + 300 + i) * (seaMouthEast - seaMouthWest - 12);
            z = side > 0
              ? northLimit + 38 + seededRandom(seed + 320 + i) * Math.max(10, seaNorth - northLimit - 46)
              : southLimit - 34 - seededRandom(seed + 320 + i) * Math.max(10, southLimit - seaSouth - 38);
        }

        const cluster = createShoreCluster(x, z, terrain, seaLevel, seed + 400 + i * 17);
        if (cluster) {
            group.add(cluster);
        }
    }

    return group;
}
