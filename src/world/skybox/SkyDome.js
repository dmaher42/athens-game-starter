import * as THREE from "three";

export function createSkyDome(texture, radius = 2000) {
  if (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
  }

  const geometry = new THREE.SphereGeometry(radius, 64, 32);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
    depthWrite: false,
  });

  return new THREE.Mesh(geometry, material);
}
