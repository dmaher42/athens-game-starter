import * as THREE from "three";

const _point = new THREE.Vector3();
const _tangent = new THREE.Vector3();
const _side = new THREE.Vector3();
const _left = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

function createIndices(segmentCount, vertexStride) {
  const indexCount = segmentCount * 6;
  const IndexArray = vertexStride * (segmentCount + 1) > 65535 ? Uint32Array : Uint16Array;
  return new IndexArray(indexCount);
}

export function createRoad(parent, points, options = {}) {
  const controlPoints = points ?? options.points;
  if (!controlPoints || controlPoints.length < 2) {
    throw new Error("createRoad requires at least two control points");
  }

  const width = options.width ?? 4;
  const tension = options.tension ?? 0.5;
  const closed = Boolean(options.closed);
  const halfWidth = width / 2;

  const curve = new THREE.CatmullRomCurve3(controlPoints, closed, "centripetal", tension);
  const segmentCount = options.segments ?? Math.max(16, controlPoints.length * 8);

  const vertexCount = (segmentCount + 1) * 2;
  const positions = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices = createIndices(segmentCount, 2);

  let posOffset = 0;
  let uvOffset = 0;

  for (let i = 0; i <= segmentCount; i++) {
    const t = i / segmentCount;
    curve.getPointAt(t, _point);
    curve.getTangentAt(t, _tangent).normalize();

    _side.crossVectors(_up, _tangent);
    if (_side.lengthSq() < 1e-6) {
      _side.set(1, 0, 0);
    } else {
      _side.normalize();
    }

    _left.copy(_point).addScaledVector(_side, halfWidth);
    _right.copy(_point).addScaledVector(_side, -halfWidth);

    positions[posOffset++] = _left.x;
    positions[posOffset++] = _left.y;
    positions[posOffset++] = _left.z;
    positions[posOffset++] = _right.x;
    positions[posOffset++] = _right.y;
    positions[posOffset++] = _right.z;

    const v = t * (options.uvScale ?? 1);
    uvs[uvOffset++] = 0;
    uvs[uvOffset++] = v;
    uvs[uvOffset++] = 1;
    uvs[uvOffset++] = v;
  }

  let indexOffset = 0;
  for (let i = 0; i < segmentCount; i++) {
    const base = i * 2;
    indices[indexOffset++] = base;
    indices[indexOffset++] = base + 1;
    indices[indexOffset++] = base + 2;
    indices[indexOffset++] = base + 1;
    indices[indexOffset++] = base + 3;
    indices[indexOffset++] = base + 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: options.color ?? 0x393024,
    roughness: 0.95,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = options.name ?? "CityRoad";
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  mesh.userData.noCollision = options.noCollision ?? true;

  if (parent) {
    parent.add(mesh);
  }

  return mesh;
}
