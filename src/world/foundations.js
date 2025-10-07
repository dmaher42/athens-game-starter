import * as THREE from "three";

export function addFoundationPad(scene, x, y, z, radius = 2.0, color = 0xbdb8ac) {
  const geo = new THREE.CylinderGeometry(radius, radius, 0.12, 24);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0 });
  mat.depthWrite = true;
  mat.transparent = false;
  const pad = new THREE.Mesh(geo, mat);
  pad.position.set(x, y + 0.06, z); // sit just above terrain
  pad.receiveShadow = true;
  pad.renderOrder = 2; // draw above terrain (and water)
  pad.name = "FoundationPad";
  pad.userData.noCollision = true;
  scene.add(pad);
  return pad;
}
