import * as THREE from "three";

const UP = new THREE.Vector3(0, 1, 0);
const _point = new THREE.Vector3();
const _tangent = new THREE.Vector3();
const _binormal = new THREE.Vector3();
const _side = new THREE.Vector3();

export function createRoad(scene, controlPoints, options = {}) {
  if (!scene || !controlPoints || controlPoints.length < 2) {
    return null;
  }

  const curve = new THREE.CatmullRomCurve3(controlPoints, false, "catmullrom", options.tension ?? 0.5);
  const segments = Math.max(options.segments ?? controlPoints.length * 16, 8);
  const width = options.width ?? 2.2;
  const thickness = options.thickness ?? 0.2;

  const vertexCount = segments * 2;
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices = new Uint32Array((segments - 1) * 6);

  for (let i = 0; i < segments; i++) {
    const t = i / (segments - 1);
    curve.getPoint(t, _point);
    curve.getTangent(t, _tangent).normalize();

    _binormal.crossVectors(UP, _tangent);
    if (_binormal.lengthSq() < 1e-6) {
      _binormal.set(1, 0, 0);
    } else {
      _binormal.normalize();
    }

    const halfWidth = width * 0.5;
    _side.copy(_binormal).multiplyScalar(halfWidth);

    const leftIndex = i * 2;
    const rightIndex = leftIndex + 1;

    positions[leftIndex * 3 + 0] = _point.x + _side.x;
    positions[leftIndex * 3 + 1] = _point.y + thickness;
    positions[leftIndex * 3 + 2] = _point.z + _side.z;

    positions[rightIndex * 3 + 0] = _point.x - _side.x;
    positions[rightIndex * 3 + 1] = _point.y + thickness;
    positions[rightIndex * 3 + 2] = _point.z - _side.z;

    normals[leftIndex * 3 + 0] = 0;
    normals[leftIndex * 3 + 1] = 1;
    normals[leftIndex * 3 + 2] = 0;
    normals[rightIndex * 3 + 0] = 0;
    normals[rightIndex * 3 + 1] = 1;
    normals[rightIndex * 3 + 2] = 0;

    const v = t * (options.uvScale ?? 4);
    uvs[leftIndex * 2 + 0] = 0;
    uvs[leftIndex * 2 + 1] = v;
    uvs[rightIndex * 2 + 0] = 1;
    uvs[rightIndex * 2 + 1] = v;
  }

  for (let i = 0; i < segments - 1; i++) {
    const i2 = i * 2;
    const base = i * 6;
    indices[base + 0] = i2;
    indices[base + 1] = i2 + 1;
    indices[base + 2] = i2 + 2;
    indices[base + 3] = i2 + 1;
    indices[base + 4] = i2 + 3;
    indices[base + 5] = i2 + 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: options.color ?? 0x4d4335,
    roughness: 0.95,
    metalness: 0.05,
  });

  const road = new THREE.Mesh(geometry, material);
  road.name = options.name ?? "HarborRoad";
  road.receiveShadow = true;
  road.castShadow = false;
  road.userData.noCollision = options.noCollision ?? false;

  scene.add(road);

  return { mesh: road, curve };
}
