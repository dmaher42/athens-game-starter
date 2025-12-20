import * as THREE from "three";

const GEOMETRY_SIZE = 4000; // Larger to fill the distance
const GEOMETRY_SEGMENTS = 128;
const CITY_RADIUS = 400; // Flat area for the city
const MAX_HEIGHT = 180; // Taller mountains

const abyssColor = new THREE.Color(0x0b1d3a); // Deep Water
const sandColor = new THREE.Color(0xcab89b);  // Beach
const baseColor = new THREE.Color(0x2f4a3a);  // Forest
const snowColor = new THREE.Color(0xffffff);  // Peaks

function sampleNoise(x, z) {
  // Composite noise for jagged rocks
  const waveA = Math.sin(x * 0.005) + Math.cos(z * 0.005);
  const waveB = Math.sin((x + z) * 0.01) * 0.5;
  const waveC = Math.sin((x - z) * 0.02) * 0.2;
  return (waveA + waveB + waveC + 2) * 0.25 * MAX_HEIGHT;
}

function bayMask(angle) {
  // We want an opening at North (Negative Z in 3D space)
  // In the Plane geometry (before rotation), Y is "Up", which becomes -Z after rotation.
  // So we target the angle PI/2.
  
  const targetAngle = Math.PI / 2; 
  
  // Calculate difference from the target angle
  let diff = Math.abs(angle - targetAngle);
  if (diff > Math.PI) diff = 2 * Math.PI - diff; // Handle wrap-around
  
  // If we are within 45 degrees (0.8 radians) of North, flatten it
  // Otherwise, smooth transition to full height
  if (diff < 0.8) {
      // Smooth step from 0 to 1
      const t = diff / 0.8;
      return t * t; 
  }
  return 1.0;
}

function assignVertexColor(target, height) {
  if (height < 2) {
    target.lerpColors(abyssColor, sandColor, Math.max(0, height) / 2);
  } else if (height < 60) {
    target.lerpColors(sandColor, baseColor, (height - 2) / 58);
  } else if (height < 120) {
    target.lerpColors(baseColor, snowColor, (height - 60) / 60);
  } else {
    target.copy(snowColor);
  }
}

export function createHorizon(scene) {
  const geometry = new THREE.PlaneGeometry(
    GEOMETRY_SIZE,
    GEOMETRY_SIZE,
    GEOMETRY_SEGMENTS,
    GEOMETRY_SEGMENTS
  );

  const positions = geometry.attributes.position;
  const vertexCount = positions.count;
  const colors = new Float32Array(vertexCount * 3);
  const workingColor = new THREE.Color();

  for (let i = 0; i < vertexCount; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i); // This becomes Z in world space
    const distance = Math.hypot(x, y);

    let height = -10; // Default deep underwater

    // Only raise mountains outside the city
    if (distance >= CITY_RADIUS) {
      const angle = Math.atan2(y, x);
      const mask = bayMask(angle);
      
      // Calculate noise height
      const noise = sampleNoise(x, y);
      
      // Apply mask: If mask is 0 (North), height stays low (-10). 
      // If mask is 1, height becomes noise.
      height = -10 + (noise + 10) * mask; 
    }

    positions.setZ(i, height); // Set Z because Plane is flat initially
    assignVertexColor(workingColor, height);
    workingColor.toArray(colors, i * 3);
  }

  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    flatShading: true,
    roughness: 1.0,
    fog: true, // Important for depth
  });

  const horizon = new THREE.Mesh(geometry, material);
  horizon.name = "HorizonMesh";
  horizon.rotation.x = -Math.PI / 2; // Rotate flat
  horizon.position.y = -2; // Just below sea level
  horizon.receiveShadow = true;

  if (scene) {
    scene.add(horizon);
  }

  return horizon;
}
