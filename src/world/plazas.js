import * as THREE from "three";
import {
  AGORA_CENTER_3D,
  AGORA_RADIUS,
  ACROPOLIS_PEAK_3D,
  ACROPOLIS_RADIUS,
} from "./locations.js";

const textureLoader = new THREE.TextureLoader();
let marbleTextures = null;

function loadMarbleTextures() {
  if (marbleTextures) return marbleTextures;
  
  const baseUrl = import.meta?.env?.BASE_URL ?? "/";
  
  const diffuse = textureLoader.load(`${baseUrl}textures/marble_albedo.jpg`);
  diffuse.wrapS = diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.colorSpace = THREE.SRGBColorSpace;
  
  const normal = textureLoader.load(`${baseUrl}textures/marble_normal-dx.jpg`);
  normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
  normal.colorSpace = THREE.NoColorSpace;
  
  const roughness = textureLoader.load(`${baseUrl}textures/marble_rough.jpg`);
  roughness.wrapS = roughness.wrapT = THREE.RepeatWrapping;
  roughness.colorSpace = THREE.NoColorSpace;
  
  const ao = textureLoader.load(`${baseUrl}textures/marble_ao.jpg`);
  ao.wrapS = ao.wrapT = THREE.RepeatWrapping;
  ao.colorSpace = THREE.NoColorSpace;
  
  marbleTextures = { diffuse, normal, roughness, ao };
  return marbleTextures;
}

function makeDisc(center, radius, color) {
  const geo = new THREE.CircleGeometry(radius, 48);
  
  // Add uv2 for AO map
  if (geo.attributes.uv && !geo.attributes.uv2) {
    geo.setAttribute('uv2', new THREE.BufferAttribute(
      new Float32Array(geo.attributes.uv.array), 2
    ));
  }
  
  const textures = loadMarbleTextures();
  
  // Calculate texture repeat based on radius for consistent scale
  const repeat = radius / 8; // Adjust scale factor as needed
  textures.diffuse.repeat.set(repeat, repeat);
  textures.normal.repeat.set(repeat, repeat);
  textures.roughness.repeat.set(repeat, repeat);
  textures.ao.repeat.set(repeat, repeat);
  
  const mat = new THREE.MeshStandardMaterial({
    map: textures.diffuse,
    normalMap: textures.normal,
    normalScale: new THREE.Vector2(0.3, 0.3),
    roughnessMap: textures.roughness,
    aoMap: textures.ao,
    aoMapIntensity: 0.4,
    color: color,
    roughness: 0.7,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });
  
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.copy(center);
  mesh.position.y += 0.05;
  mesh.renderOrder = 1;
  mesh.receiveShadow = true;
  mesh.name = "Plaza";
  return mesh;
}

export function createPlazas(scene) {
  const group = new THREE.Group();
  group.name = "Plazas";
  group.add(makeDisc(AGORA_CENTER_3D, AGORA_RADIUS, 0xe6e2d6));
  group.add(makeDisc(ACROPOLIS_PEAK_3D, ACROPOLIS_RADIUS, 0xede8dc));
  scene.add(group);
  return group;
}
