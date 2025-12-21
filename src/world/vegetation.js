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

class InstanceBatch {
  constructor(geometry, material) {
    this.geometry = geometry;
    this.material = material;
    this.matrices = [];
  }

  add(matrix) {
    this.matrices.push(matrix.clone());
  }

  build(meshName) {
    if (this.matrices.length === 0) return null;
    const mesh = new THREE.InstancedMesh(this.geometry, this.material, this.matrices.length);
    mesh.name = meshName;
    mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    for (let i = 0; i < this.matrices.length; i++) {
      mesh.setMatrixAt(i, this.matrices[i]);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false; // Disable culling to avoid bounding sphere issues with scattered instances
    return mesh;
  }
}

const _dummy = new THREE.Object3D();

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
  materials.leafDark.color.setHex(0x1b3523);

  const vegetationGroup = new THREE.Group();
  vegetationGroup.name = "VegetationSystem";
  scene.add(vegetationGroup);

  const batches = {
    cypressTrunk: new InstanceBatch(CYPRESS_TRUNK, materials.bark),
    cypressFoliage: new InstanceBatch(CYPRESS_FOLIAGE, materials.leafDark),
    oliveTrunk: new InstanceBatch(OLIVE_TRUNK, materials.bark),
    oliveFoliage: new InstanceBatch(OLIVE_FOLIAGE, materials.leaf),
    shrub: new InstanceBatch(SHRUB_GEOMETRY, materials.leaf)
  };

  // 1. Acropolis (Cypress around Temples)
  if (cityGroup) {
    cityGroup.traverse((obj) => {
      if (obj.userData?.type === 'temple' || obj.userData?.district === 'sacred') {
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
            const scale = THREE.MathUtils.randFloat(0.8, 1.2);
            _dummy.position.set(x, y, z);
            _dummy.scale.setScalar(scale);
            _dummy.rotation.set(0, 0, 0);
            _dummy.updateMatrix();

            batches.cypressTrunk.add(_dummy.matrix);
            batches.cypressFoliage.add(_dummy.matrix);
          }
        }
      } else if (obj.userData?.district === 'residential' || obj.userData?.type === 'plaza') {
        // 2. Residential/Agora (Olive Trees)
        if (Math.random() < 0.3) {
          const worldPos = new THREE.Vector3();
          obj.getWorldPosition(worldPos);

          const angle = Math.random() * Math.PI * 2;
          const dist = THREE.MathUtils.randFloat(6, 10);

          const x = worldPos.x + Math.cos(angle) * dist;
          const z = worldPos.z + Math.sin(angle) * dist;
          const y = sampleHeight(terrain, x, z);

          if (y !== null) {
            const scale = THREE.MathUtils.randFloat(0.9, 1.3);

            // Trunk
            _dummy.position.set(x, y, z);
            _dummy.scale.setScalar(scale);
            _dummy.rotation.set(0, Math.random() * Math.PI, 0);
            _dummy.updateMatrix();
            batches.oliveTrunk.add(_dummy.matrix);

            // Foliage
            _dummy.rotation.set(
              0,
              Math.random() * Math.PI,
              THREE.MathUtils.randFloatSpread(0.2)
            );
            _dummy.updateMatrix();
            batches.oliveFoliage.add(_dummy.matrix);
          }
        }
      }
    });
  }

  // 3. Acropolis Context (Central Hill)
  const centralCount = 40;
  for (let i = 0; i < centralCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 80;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const y = sampleHeight(terrain, x, z);
    if (y !== null && y > 10) {
      const baseScale = THREE.MathUtils.randFloat(0.8, 1.2);
      const extraScale = THREE.MathUtils.randFloat(0.8, 1.4);
      const scale = baseScale * extraScale;

      _dummy.position.set(x, y, z);
      _dummy.scale.setScalar(scale);
      _dummy.rotation.set(0, 0, 0);
      _dummy.updateMatrix();

      batches.cypressTrunk.add(_dummy.matrix);
      batches.cypressFoliage.add(_dummy.matrix);
    }
  }

  // 4. Terrain Shrubs
  const scatterCount = 400;
  for (let i = 0; i < scatterCount; i++) {
    const x = THREE.MathUtils.randFloatSpread(400);
    const z = THREE.MathUtils.randFloatSpread(400);

    const y = sampleHeight(terrain, x, z);
    if (y === null || y < 1) continue;

    const step = 1.0;
    const h1 = sampleHeight(terrain, x + step, z);
    const h2 = sampleHeight(terrain, x - step, z);
    const h3 = sampleHeight(terrain, x, z + step);
    const h4 = sampleHeight(terrain, x, z - step);

    if (h1 === null || h2 === null || h3 === null || h4 === null) continue;

    const dzdx = (h1 - h2) / (2 * step);
    const dzdy = (h3 - h4) / (2 * step);
    const slope = Math.sqrt(dzdx * dzdx + dzdy * dzdy);

    if (slope > 0.26) {
      const scale = THREE.MathUtils.randFloat(0.5, 1.0);
      _dummy.position.set(x, y, z);
      _dummy.scale.setScalar(scale);
      _dummy.rotation.set(0, Math.random() * Math.PI, 0);
      _dummy.updateMatrix();

      batches.shrub.add(_dummy.matrix);
    }
  }

  const cypressTrunkMesh = batches.cypressTrunk.build("CypressTrunks");
  if (cypressTrunkMesh) vegetationGroup.add(cypressTrunkMesh);

  const cypressFoliageMesh = batches.cypressFoliage.build("CypressFoliage");
  if (cypressFoliageMesh) vegetationGroup.add(cypressFoliageMesh);

  const oliveTrunkMesh = batches.oliveTrunk.build("OliveTrunks");
  if (oliveTrunkMesh) vegetationGroup.add(oliveTrunkMesh);

  const oliveFoliageMesh = batches.oliveFoliage.build("OliveFoliage");
  if (oliveFoliageMesh) vegetationGroup.add(oliveFoliageMesh);

  const shrubMesh = batches.shrub.build("Shrubs");
  if (shrubMesh) vegetationGroup.add(shrubMesh);

  return vegetationGroup;
}
