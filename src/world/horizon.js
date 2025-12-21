import * as THREE from "three";
import { getSeaLevelY } from "./seaLevelState.js";

const GEOMETRY_SIZE = 7200; // Larger to fill the distance
const GEOMETRY_SEGMENTS = 128;
const CITY_RADIUS = 400; // Flat area for the city
const MAX_HEIGHT = 12; // Low rolling land silhouette

const abyssColor = new THREE.Color(0x0b1d3a); // Deep Water
const sandColor = new THREE.Color(0xcab89b);  // Beach
const baseColor = new THREE.Color(0x2f4a3a);  // Forest

function sampleNoise(x, z) {
  // Composite noise for distant, gentle landforms
  const waveA = Math.sin(x * 0.0016) * 0.6 + Math.cos(z * 0.0016) * 0.6;
  const waveB = Math.sin((x + z) * 0.0009) * 0.35;
  const waveC = Math.sin((x - z) * 0.0006) * 0.2;
  return (waveA + waveB + waveC + 1.3) * 0.45 * MAX_HEIGHT;
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
  const shallowBlend = Math.max(0, height);

  if (height < 1) {
    target.lerpColors(abyssColor, sandColor, shallowBlend);
  } else if (height < 6) {
    target.lerpColors(sandColor, baseColor, (height - 1) / 5);
  } else {
    target.copy(baseColor);
  }
}

export function createHorizon(scene) {
  const seaLevel = getSeaLevelY();

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

    let height = -8; // Default shallow water below sea level

    // Only raise distant land outside the city
    if (distance >= CITY_RADIUS) {
      const angle = Math.atan2(y, x);
      const mask = bayMask(angle);
      
      // Calculate noise height
      const noise = sampleNoise(x, y);

      // Apply mask: If mask is 0 (North), height stays low below sea level.
      // If mask is 1, height becomes noise.
      height = -8 + (noise + 8) * mask;
    }

    const maxHeight = seaLevel + 12;
    height = Math.min(height, maxHeight);

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
    transparent: true,
    depthWrite: false,
  });

  const fadeHeight = 12;

  material.onBeforeCompile = (shader) => {
    shader.uniforms.seaLevel = { value: seaLevel };
    shader.uniforms.fadeHeight = { value: fadeHeight };

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\n varying float vWorldY;"
      )
      .replace(
        "#include <fog_vertex>",
        "vWorldY = (modelMatrix * vec4(position, 1.0)).y;\n#include <fog_vertex>"
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\n varying float vWorldY;\n uniform float seaLevel;\n uniform float fadeHeight;"
      )
      .replace(
        "gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
        [
          "float heightT = clamp((vWorldY - seaLevel) / fadeHeight, 0.0, 1.0);",
          "float alphaFade = mix(1.0, 0.35, heightT);",
          "float darkness = mix(0.82, 1.0, heightT);",
          "vec3 finalColor = outgoingLight * darkness;",
          "gl_FragColor = vec4(finalColor, diffuseColor.a * alphaFade);",
        ].join("\n")
      );
  };

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
