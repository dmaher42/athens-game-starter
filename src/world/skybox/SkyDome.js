import * as THREE from "three";

export function createSkyDome(texture, radius = 2500) {
  const geo = new THREE.SphereGeometry(radius, 64, 32);

  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
    depthWrite: false,
  });

  const dome = new THREE.Mesh(geo, mat);
  dome.name = "SkyDome";
  dome.frustumCulled = false;
  dome.renderOrder = -1000;

  return dome;
}
