import * as THREE from "three";
import { makeTreeMaterials } from "./materials.js";

const CYPRESS_TRUNK = new THREE.CylinderGeometry(0.3, 0.4, 1.5, 8);
CYPRESS_TRUNK.translate(0, 0.75, 0);

const CYPRESS_FOLIAGE = new THREE.ConeGeometry(1.2, 5, 8);
CYPRESS_FOLIAGE.translate(0, 2.5, 0);

const SHRUB_GEOMETRY = new THREE.IcosahedronGeometry(0.5, 0);
SHRUB_GEOMETRY.scale(1, 0.6, 1);
SHRUB_GEOMETRY.translate(0, 0.3, 0);

const OLIVE_TRUNK = new THREE.CylinderGeometry(0.25, 0.35, 1.5, 8);
OLIVE_TRUNK.translate(0, 0.75, 0);

const OLIVE_FOLIAGE = new THREE.IcosahedronGeometry(1.5, 0);
OLIVE_FOLIAGE.translate(0, 2.0, 0);

function createCypress(materials) {
  const group = new THREE.Group();

  const trunk = new THREE.Mesh(CYPRESS_TRUNK, materials.bark);
  group.add(trunk);

  const foliage = new THREE.Mesh(CYPRESS_FOLIAGE, materials.leafDark);
  group.add(foliage);

  group.scale.setScalar(THREE.MathUtils.randFloat(0.8, 1.2));
  return group;
}

function createOlive(materials) {
    const group = new THREE.Group();

    const trunk = new THREE.Mesh(OLIVE_TRUNK, materials.bark);
    trunk.rotation.y = Math.random() * Math.PI;
    group.add(trunk);

    const foliage = new THREE.Mesh(OLIVE_FOLIAGE, materials.leaf);
    foliage.rotation.y = Math.random() * Math.PI;
    foliage.rotation.z = THREE.MathUtils.randFloatSpread(0.2);
    group.add(foliage);

    group.scale.setScalar(THREE.MathUtils.randFloat(0.9, 1.3));
    return group;
}

function createShrub(materials) {
    const mesh = new THREE.Mesh(SHRUB_GEOMETRY, materials.leaf);
    mesh.scale.setScalar(THREE.MathUtils.randFloat(0.5, 1.0));
    mesh.rotation.y = Math.random() * Math.PI;
    return mesh;
}

function sampleHeight(terrain, x, z) {
    if (typeof terrain?.userData?.getHeightAt === 'function') {
        return terrain.userData.getHeightAt(x, z);
    }
    return null;
}

export function createVegetationSystem(scene, terrain, cityGroup) {
    if (!scene || !terrain) return;

    const materials = makeTreeMaterials(THREE);
    // Darker leaf for cypress
    materials.leafDark = materials.leaf.clone();
    materials.leafDark.color.setHex(0x1a2b1a);

    const vegetationGroup = new THREE.Group();
    vegetationGroup.name = "VegetationSystem";
    scene.add(vegetationGroup);

    // 1. Acropolis (Cypress around Temples)
    if (cityGroup) {
        cityGroup.traverse((obj) => {
            if (obj.userData?.type === 'temple' || obj.userData?.district === 'sacred') {
                // Place cypress around
                const count = Math.floor(Math.random() * 3) + 2;
                for (let i = 0; i < count; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = THREE.MathUtils.randFloat(8, 15);
                    const worldPos = new THREE.Vector3();
                    obj.getWorldPosition(worldPos);

                    const x = worldPos.x + Math.cos(angle) * dist;
                    const z = worldPos.z + Math.sin(angle) * dist;
                    const y = sampleHeight(terrain, x, z);

                    if (y !== null) {
                        const cypress = createCypress(materials);
                        cypress.position.set(x, y, z);
                        vegetationGroup.add(cypress);
                    }
                }
            } else if (obj.userData?.district === 'residential' || obj.userData?.type === 'plaza') {
                 // 2. Residential/Agora (Olive Trees)
                 if (Math.random() < 0.3) { // 30% chance per building/plaza
                    const worldPos = new THREE.Vector3();
                    obj.getWorldPosition(worldPos);

                    // Try to place near building but not inside
                    const angle = Math.random() * Math.PI * 2;
                    const dist = THREE.MathUtils.randFloat(6, 10);

                    const x = worldPos.x + Math.cos(angle) * dist;
                    const z = worldPos.z + Math.sin(angle) * dist;
                    const y = sampleHeight(terrain, x, z);

                     if (y !== null) {
                        const olive = createOlive(materials);
                        olive.position.set(x, y, z);
                        vegetationGroup.add(olive);
                    }
                 }
            }
        });
    }

    // 3. Terrain Shrubs on Slopes
    // We can sample terrain at random points
    const scatterCount = 400;

    for (let i = 0; i < scatterCount; i++) {
        const x = THREE.MathUtils.randFloatSpread(400); // Coverage
        const z = THREE.MathUtils.randFloatSpread(400);

        const y = sampleHeight(terrain, x, z);
        if (y === null || y < 1) continue; // Skip underwater or invalid

        // Estimate slope
        const step = 1.0;
        const h1 = sampleHeight(terrain, x + step, z);
        const h2 = sampleHeight(terrain, x - step, z);
        const h3 = sampleHeight(terrain, x, z + step);
        const h4 = sampleHeight(terrain, x, z - step);

        if (h1 === null || h2 === null || h3 === null || h4 === null) continue;

        const dzdx = (h1 - h2) / (2 * step);
        const dzdy = (h3 - h4) / (2 * step);
        const slope = Math.sqrt(dzdx * dzdx + dzdy * dzdy);

        // slope 1.0 is 45 degrees. 15 degrees is tan(15) ~= 0.26
        if (slope > 0.26) {
             const shrub = createShrub(materials);
             shrub.position.set(x, y, z);
             // Align to slope slightly? Simplified: just up
             vegetationGroup.add(shrub);
        }
    }

    return vegetationGroup;
}
