import {
  BackSide,
  Color,
  Mesh,
  ShaderMaterial,
  SphereGeometry
} from 'three';

// Predefine key colors for the different phases of a day cycle.
// These colors are mixed together in the shader so the sky smoothly
// transitions between dawn, day, dusk, and night.
const DAWN_COLOR = new Color('#f9d29d');
const DAY_COLOR = new Color('#87ceeb');
const DUSK_COLOR = new Color('#f28482');
const NIGHT_COLOR = new Color('#0b1d51');

// Helper to convert Three.js Color objects into the format GLSL expects.
const toVec3 = (color) => color.toArray();

export const createSky = (scene) => {
  // Build a sphere that will completely surround the rest of the scene.
  // Because we only want to see the inside of the sphere (like standing
  // inside of a planetarium dome) we render the back side of the faces.
  const geometry = new SphereGeometry(500, 32, 32);

  const skyMaterial = new ShaderMaterial({
    side: BackSide,
    uniforms: {
      timeOfDay: { value: 0 }
    },
    vertexShader: `
      void main() {
        // For a sky dome we simply push the vertices through the normal
        // model-view-projection pipeline without any deformation.
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float timeOfDay; // Ranges from 0.0 to 1.0 over the course of a day

      // Predefined colors for the sky phases
      const vec3 dawnColor = vec3(${toVec3(DAWN_COLOR).join(', ')});
      const vec3 dayColor = vec3(${toVec3(DAY_COLOR).join(', ')});
      const vec3 duskColor = vec3(${toVec3(DUSK_COLOR).join(', ')});
      const vec3 nightColor = vec3(${toVec3(NIGHT_COLOR).join(', ')});

      // Helper: perform a smooth interpolation between colors around
      // evenly spaced time checkpoints.
      vec3 getSkyColor(float t) {
        // Define quarter points for dawn (0.0), day (0.25), dusk (0.5),
        // and night (0.75). The cycle wraps back to dawn at 1.0.
        if (t < 0.25) {
          float localT = smoothstep(0.0, 0.25, t);
          return mix(dawnColor, dayColor, localT);
        } else if (t < 0.5) {
          float localT = smoothstep(0.25, 0.5, t);
          return mix(dayColor, duskColor, localT);
        } else if (t < 0.75) {
          float localT = smoothstep(0.5, 0.75, t);
          return mix(duskColor, nightColor, localT);
        }

        float localT = smoothstep(0.75, 1.0, t);
        return mix(nightColor, dawnColor, localT);
      }

      void main() {
        // We could use the world position to add vertical gradients later,
        // but for now we simply return the color for the current time.
        gl_FragColor = vec4(getSkyColor(timeOfDay), 1.0);
      }
    `
  });

  const skyDome = new Mesh(geometry, skyMaterial);
  scene.add(skyDome);

  return {
    dome: skyDome,
    material: skyMaterial
  };
};

export const updateSky = (skyObject, timeOfDay) => {
  if (!skyObject?.material) return;

  // Wrap the time value so callers can freely increase it past 1.0.
  const normalizedTime = ((timeOfDay % 1) + 1) % 1;
  skyObject.material.uniforms.timeOfDay.value = normalizedTime;
};
