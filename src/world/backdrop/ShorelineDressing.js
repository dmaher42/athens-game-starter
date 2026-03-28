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

    const northLimit = Math.max(HARBOR_WATER_BOUNDS.north, HARBOR_WATER_BOUNDS.south);
    const southLimit = Math.min(HARBOR_WATER_BOUNDS.north, HARBOR_WATER_BOUNDS.south);
    const seaMouthWest = AEGEAN_OCEAN_BOUNDS.west + 28;
    const seaMouthEast = Math.min(AEGEAN_OCEAN_BOUNDS.west + 124, AEGEAN_OCEAN_BOUNDS.east - 40);
    const seaNorth = Math.max(AEGEAN_OCEAN_BOUNDS.north, AEGEAN_OCEAN_BOUNDS.south);
    const seaSouth = Math.min(AEGEAN_OCEAN_BOUNDS.north, AEGEAN_OCEAN_BOUNDS.south);

    const seed = 999;
    const clusterCount = 5;
    for (let i = 0; i < clusterCount; i++) {
        const side = seededRandom(seed + 240 + i) > 0.5 ? 1 : -1;

        const x = Math.max(
            HARBOR_WATER_EAST_LIMIT + 20,
            seaMouthWest + 6 + seededRandom(seed + 300 + i) * (seaMouthEast - seaMouthWest - 12),
        );
        const z = side > 0
          ? northLimit + 34 + seededRandom(seed + 320 + i) * Math.max(10, seaNorth - northLimit - 42)
          : southLimit - 34 - seededRandom(seed + 320 + i) * Math.max(10, southLimit - seaSouth - 42);

        const cluster = createShoreCluster(x, z, terrain, seaLevel, seed + 400 + i * 17);
        if (cluster) {
            group.add(cluster);
        }
    }

    return group;
}
