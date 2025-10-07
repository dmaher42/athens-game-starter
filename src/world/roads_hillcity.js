import * as THREE from 'three';
import { MAIN_ROAD_WIDTH, HARBOR_CENTER_3D, AGORA_CENTER_3D, ACROPOLIS_PEAK_3D } from './locations.js';

const _dummy = new THREE.Object3D();
const _up = new THREE.Vector3(0, 1, 0);
const _side = new THREE.Vector3();

export function createMainHillRoad(scene, terrain) {
  // Gentle S-curve from harbor → agora → acropolis
  const pts = [
    HARBOR_CENTER_3D.clone().add(new THREE.Vector3(8, 0, -10)),
    HARBOR_CENTER_3D.clone().lerp(AGORA_CENTER_3D, 0.4).add(new THREE.Vector3(-10, 2, 6)),
    AGORA_CENTER_3D.clone(),
    AGORA_CENTER_3D.clone().lerp(ACROPOLIS_PEAK_3D, 0.6).add(new THREE.Vector3(6, 2, -4)),
    ACROPOLIS_PEAK_3D.clone()
  ];
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.1);

  // Build a ribbon mesh that follows the curve (simple road surface)
  const segments = 180;
  const width = MAIN_ROAD_WIDTH;
  const geo = new THREE.PlaneGeometry(width, 1, 1, segments);
  const pos = geo.attributes.position;
  const tangent = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const heightSampler = terrain?.userData?.getHeightAt;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = curve.getPoint(t);
    const next = curve.getPoint(Math.min(1, t + 1 / segments));
    tangent.subVectors(next, p).normalize();
    const angle = Math.atan2(tangent.x, tangent.z);
    for (let j = 0; j < 2; j++) {
      const idx = (i * 2 + j) * 3;
      const side = j === 0 ? -0.5 : 0.5;
      dir.set(Math.sin(angle) * side * width, 0, Math.cos(angle) * side * width);
      const worldX = p.x + dir.x;
      const worldZ = p.z + dir.z;
      let worldY = p.y;
      if (typeof heightSampler === 'function') {
        const sampled = heightSampler(worldX, worldZ);
        worldY = Number.isFinite(sampled) ? sampled : worldY;
      }
      worldY += 0.03;
      pos.setXYZ(idx / 3, worldX, worldY, worldZ);
    }
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({ color: 0x575757, roughness: 1, metalness: 0, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 1;
  mesh.receiveShadow = true;
  mesh.name = 'MainHillRoad';

  const group = new THREE.Group();
  group.name = 'Roads';
  group.add(mesh);

  const lamps = createLamppostsAlongRoad({ curve, width });
  if (lamps) {
    group.add(lamps.group);
    group.userData.lampHeadMaterial = lamps.headMaterial;
  }

  scene.add(group);

  return { group, curve, mesh };
}

function createLamppostsAlongRoad({ curve, width }) {
  if (!curve) return null;

  const totalLength = curve.getLength();
  const spacing = 20;
  const count = Math.max(1, Math.floor(totalLength / spacing));
  if (!Number.isFinite(count) || count <= 0) {
    return null;
  }

  const group = new THREE.Group();
  group.name = 'HillRoadLampposts';

  const postGeometry = new THREE.CylinderGeometry(0.12, 0.14, 3, 10);
  postGeometry.translate(0, 1.5, 0);
  const headGeometry = new THREE.SphereGeometry(0.28, 16, 12);
  headGeometry.translate(0, 3.1, 0);

  const postMaterial = new THREE.MeshStandardMaterial({
    color: 0x4f473a,
    roughness: 0.85,
    metalness: 0.25,
  });
  const headMaterial = new THREE.MeshStandardMaterial({
    color: 0xffe9b0,
    emissive: new THREE.Color(0xffd18c),
    emissiveIntensity: 0,
  });
  headMaterial.toneMapped = false;

  const posts = new THREE.InstancedMesh(postGeometry, postMaterial, count);
  posts.castShadow = true;
  posts.receiveShadow = false;
  posts.name = 'HillRoadLampPosts';

  const heads = new THREE.InstancedMesh(headGeometry, headMaterial, count);
  heads.castShadow = false;
  heads.receiveShadow = false;
  heads.name = 'HillRoadLampHeads';

  const lateralOffset = width * 0.55;

  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const position = curve.getPoint(Math.min(1, Math.max(0, t)));
    const tangent = curve.getTangent(Math.min(1, Math.max(0, t))).normalize();
    _side.copy(_up).cross(tangent).normalize().multiplyScalar(lateralOffset);

    _dummy.position.copy(position).add(_side);
    _dummy.rotation.set(0, 0, 0);
    _dummy.updateMatrix();
    posts.setMatrixAt(i, _dummy.matrix);
    heads.setMatrixAt(i, _dummy.matrix);
  }

  posts.instanceMatrix.needsUpdate = true;
  heads.instanceMatrix.needsUpdate = true;

  group.add(posts);
  group.add(heads);

  return { group, headMaterial };
}

export function updateMainHillRoadLighting(roadGroup, nightFactor = 0) {
  if (!roadGroup) return;
  const material = roadGroup.userData?.lampHeadMaterial;
  if (!material) return;
  const clamped = THREE.MathUtils.clamp(nightFactor, 0, 1);
  material.emissiveIntensity = THREE.MathUtils.lerp(0.1, 1.4, clamped);
}
