import * as THREE from "three";

const GEOMETRY_SIZE = 2400;
const GEOMETRY_SEGMENTS = 128;
const CITY_RADIUS = 300;
const MAX_HEIGHT = 120;

const abyssColor = new THREE.Color(0x0b1d3a);
const sandColor = new THREE.Color(0xcab89b);
const baseColor = new THREE.Color(0x2f4a3a);
const snowColor = new THREE.Color(0xffffff);

function sampleNoise(x, z) {
  const waveA = Math.sin(x * 0.01) + Math.cos(z * 0.02);
  const waveB = Math.sin((x + z) * 0.005) * 0.6;
  const waveC = Math.cos((x - z) * 0.01) * 0.4;
  const combined = waveA + waveB + waveC;
  return (combined * 0.5 + 1) * (MAX_HEIGHT * 0.5);
}

function bayMask(angle) {
  const normalized = THREE.MathUtils.clamp((angle + Math.PI / 2) / Math.PI, 0, 1);
  return normalized * normalized;
}

function assignVertexColor(target, height) {
  if (height < 2) {
    target.lerpColors(abyssColor, sandColor, Math.max(0, height) / 2);
  } else if (height < 40) {
    target.lerpColors(sandColor, baseColor, (height - 2) / 38);
  } else if (height < 80) {
    target.lerpColors(baseColor, snowColor, (height - 40) / 40);
  } else {
    target.copy(snowColor);
  }
}

export function createHorizon(scene) {
  const geometry = new THREE.PlaneGeometry(
    GEOMETRY_SIZE,
    GEOMETRY_SIZE,
    GEOMETRY_SEGMENTS,
    GEOMETRY_SEGMENTS,
  );

  const positions = geometry.attributes.position;
  const vertexCount = positions.count;
  const colors = new Float32Array(vertexCount * 3);
  const workingColor = new THREE.Color();

  for (let i = 0; i < vertexCount; i++) {
    const x = positions.getX(i);
    const z = positions.getY(i);
    const distance = Math.sqrt(x * x + z * z);

    let height = 0;
    if (distance >= CITY_RADIUS) {
      const angle = Math.atan2(z, x);
      const mask = bayMask(angle);
      height = sampleNoise(x, z) * mask;
    }

    positions.setZ(i, height);
    assignVertexColor(workingColor, height);
    workingColor.toArray(colors, i * 3);
  }

  positions.needsUpdate = true;
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    flatShading: true,
    fog: true,
  });

  const horizon = new THREE.Mesh(geometry, material);
  horizon.rotation.x = -Math.PI / 2;
  horizon.position.y = -5;
  horizon.receiveShadow = true;

  if (scene?.add) {
    scene.add(horizon);
  }

  return horizon;
}
