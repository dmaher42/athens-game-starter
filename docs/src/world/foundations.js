import * as THREE from "three";

export function addFoundationPad(
  scene,
  x,
  y,
  z,
  radius = 2.0,
  materialOrColor = 0xbdb8ac
) {
  const geo = new THREE.CylinderGeometry(radius, radius, 0.12, 24);
  const material =
    materialOrColor && typeof materialOrColor === "object" && materialOrColor.isMaterial
      ? materialOrColor
      : new THREE.MeshStandardMaterial({
          color: materialOrColor ?? 0xbdb8ac,
          roughness: 0.95,
          metalness: 0,
        });
  material.depthWrite = true;
  material.transparent = false;
  const pad = new THREE.Mesh(geo, material);
  pad.position.set(x, y + 0.06, z); // sit just above terrain
  pad.receiveShadow = true;
  pad.renderOrder = 2; // draw above terrain (and water)
  pad.name = "FoundationPad";
  pad.userData.noCollision = true;
  scene.add(pad);
  return pad;
}
