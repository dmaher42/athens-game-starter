import * as THREE from "three";
import {
  MAIN_ROAD_WIDTH,
  HARBOR_CENTER_3D,
  AGORA_CENTER_3D,
  ACROPOLIS_PEAK_3D,
} from "./locations.js";

// scene + terrain required so we can drape to ground
export function createMainHillRoad(scene, terrain) {
  // Gentle S-curve from harbor → agora → acropolis
  const pts = [
    HARBOR_CENTER_3D.clone().add(new THREE.Vector3(8, 0, -10)),
    HARBOR_CENTER_3D.clone()
      .lerp(AGORA_CENTER_3D, 0.4)
      .add(new THREE.Vector3(-10, 2, 6)),
    AGORA_CENTER_3D.clone(),
    AGORA_CENTER_3D.clone()
      .lerp(ACROPOLIS_PEAK_3D, 0.6)
      .add(new THREE.Vector3(6, 2, -4)),
    ACROPOLIS_PEAK_3D.clone(),
  ];
  const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.1);

  // Road ribbon geometry in WORLD space (XZ follows curve; Y sampled from terrain)
  const segments = 180;
  const width = MAIN_ROAD_WIDTH;
  const geo = new THREE.PlaneGeometry(width, 1, 1, segments);
  const pos = geo.attributes.position;
  const tangent = new THREE.Vector3();
  const dir = new THREE.Vector3();

  // helper for height sampling
  const getH = terrain?.userData?.getHeightAt?.bind(terrain?.userData);

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = curve.getPoint(t);
    const next = curve.getPoint(Math.min(1, t + 1 / segments));
    tangent.subVectors(next, p).normalize();
    const angle = Math.atan2(tangent.x, tangent.z);
    for (let j = 0; j < 2; j++) {
      const vertexIndex = i * 2 + j;
      const side = j === 0 ? -0.5 : 0.5;
      dir.set(Math.sin(angle) * side * width, 0, Math.cos(angle) * side * width);
      const x = p.x + dir.x;
      const z = p.z + dir.z;
      let y = getH ? getH(x, z) : p.y;
      if (!Number.isFinite(y)) y = p.y;
      y += 0.03; // small lift to avoid z-fighting with ground
      pos.setXYZ(vertexIndex, x, y, z);
    }
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    color: 0x575757,
    roughness: 1,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  // DO NOT rotate the mesh; vertices are already in world-space
  mesh.renderOrder = 1; // win depth vs semi-transparent water
  mesh.receiveShadow = true;
  mesh.name = "MainHillRoad";

  const group = new THREE.Group();
  group.name = "Roads";
  group.add(mesh);
  scene.add(group);

  return { group, curve, mesh };
}

export function updateMainHillRoadLighting() {}
