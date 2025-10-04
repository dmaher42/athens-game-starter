import { Color, DirectionalLight, HemisphereLight, Vector3 } from 'three';

// Pre-create color instances so that we can reuse them inside the animation
// loop without generating new objects every frame.
const SUN_COLOR_DAWN = new Color('#ffb37f');
const SUN_COLOR_NOON = new Color('#ffffff');
const SUN_COLOR_DUSK = new Color('#ff9f76');

const SKY_COLOR_NIGHT = new Color('#0b1d51');
const SKY_COLOR_DAY = new Color('#bde0fe');
const GROUND_COLOR_NIGHT = new Color('#1f1f2e');
const GROUND_COLOR_DAY = new Color('#9d8189');

const scratchColor = new Color();
const scratchDirection = new Vector3();

// Helper to smoothly interpolate between two colors.
const lerpColor = (target, colorA, colorB, t) => {
  return target.copy(colorA).lerp(colorB, t);
};

export const createLighting = (scene) => {
  // A directional light works well for sunlight because it simulates an
  // infinitely distant light source with parallel rays.
  const sunLight = new DirectionalLight(0xffffff, 1.0);
  sunLight.castShadow = true;
  scene.add(sunLight);
  scene.add(sunLight.target);

  // The hemisphere light gives a soft ambient fill made from two colours:
  // one for the sky above and one for the ground below.
  const hemiLight = new HemisphereLight('#bde0fe', '#1f1f2e', 0.6);
  scene.add(hemiLight);

  return { sunLight, hemiLight };
};

export const updateLighting = (lights, sunDirection) => {
  if (!lights?.sunLight || !lights?.hemiLight) return;

  const { sunLight, hemiLight } = lights;

  // The lighting calculations work best with a normalised copy of the
  // direction so we never mutate the vector passed in by the caller.
  const normalizedDirection = scratchDirection.copy(sunDirection).normalize();

  // Position the directional light far away in the direction of the sun and
  // keep it looking at the origin. Multiplying by a large scalar gives us a
  // distant light source that still affects objects in the scene.
  sunLight.position.copy(normalizedDirection).multiplyScalar(100);
  sunLight.target.position.set(0, 0, 0);
  sunLight.target.updateMatrixWorld();

  // The vertical component of the direction tells us how high the sun is in
  // the sky. A value of 1 means straight overhead (midday) and 0 means the
  // sun is on the horizon.
  const elevation = Math.max(normalizedDirection.y, 0);

  // Blend the sunlight colour and intensity based on the elevation. Lower sun
  // angles feel warmer and softer while a high sun is brighter and cooler.
  const sunWarmth = 1 - elevation;
  const sunColor = lerpColor(scratchColor, SUN_COLOR_DAWN, SUN_COLOR_NOON, elevation)
    .lerp(SUN_COLOR_DUSK, sunWarmth * 0.5);
  sunLight.color.copy(sunColor);
  sunLight.intensity = 0.2 + elevation * 1.3;

  // Hemisphere light shifts between day and night palettes depending on how
  // much sky light we expect to bounce into the scene.
  const skyMix = elevation;
  lerpColor(hemiLight.color, SKY_COLOR_NIGHT, SKY_COLOR_DAY, skyMix);
  lerpColor(hemiLight.groundColor, GROUND_COLOR_NIGHT, GROUND_COLOR_DAY, skyMix);
  hemiLight.intensity = 0.3 + skyMix * 0.7;
};
