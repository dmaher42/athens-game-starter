import { AmbientLight, Color, DirectionalLight, HemisphereLight } from 'three';

export const createLighting = (scene) => {
  // Directional light acts like the sun, shining from a distant point.
  const sunLight = new DirectionalLight(0xffffff, 1.0);
  sunLight.position.set(0, 10, 0);
  sunLight.castShadow = true;
  scene.add(sunLight);

  // Hemisphere light blends a sky color and a ground color to simulate
  // ambient light bouncing from the environment.
  const hemiLight = new HemisphereLight('#bcdffb', '#2f2f2f', 0.6);
  scene.add(hemiLight);

  // A subtle ambient light keeps the darkest shadows from becoming pure black.
  const ambientLight = new AmbientLight('#ffffff', 0.15);
  scene.add(ambientLight);

  // The DirectionalLight has a target object that determines which point it
  // shines toward. We add it to the scene so Three.js updates it correctly.
  scene.add(sunLight.target);

  return { sunLight, ambientLight, hemiLight };
};

export const updateLighting = (lights, timeOfDay) => {
  if (!lights?.sunLight) return;

  const { sunLight, hemiLight, ambientLight } = lights;

  // Normalize the time value so 0.0-1.0 loops smoothly even if the caller
  // passes values outside that range.
  const normalizedTime = ((timeOfDay % 1) + 1) % 1;

  // Map the time of day to an angle in radians. 0.0 is dawn on the horizon,
  // 0.5 is directly overhead (noon), and 1.0 loops back to dawn.
  const sunAngle = normalizedTime * Math.PI * 2.0;

  // Use the angle to move the sun around a large circle in the sky.
  const radius = 50;
  const x = Math.cos(sunAngle) * radius;
  const y = Math.sin(sunAngle) * radius;
  const z = Math.sin(sunAngle * 0.5) * radius; // Slight variation for depth.
  sunLight.position.set(x, y, z);
  sunLight.target.position.set(0, 0, 0);
  sunLight.target.updateMatrixWorld();

  // Define colors for different times of day.
  const dawnColor = new Color('#ffd6a5');
  const dayColor = new Color('#ffffff');
  const duskColor = new Color('#ffafcc');
  const nightColor = new Color('#6272a4');

  // Helper to blend between two colors and intensities.
  const blend = (startColor, endColor, startIntensity, endIntensity, t) => ({
    color: startColor.clone().lerp(endColor, t),
    intensity: startIntensity + (endIntensity - startIntensity) * t
  });

  let sunSettings;
  if (normalizedTime < 0.25) {
    const t = normalizedTime / 0.25;
    sunSettings = blend(dawnColor, dayColor, 0.6, 1.2, t);
  } else if (normalizedTime < 0.5) {
    const t = (normalizedTime - 0.25) / 0.25;
    sunSettings = blend(dayColor, duskColor, 1.2, 0.8, t);
  } else if (normalizedTime < 0.75) {
    const t = (normalizedTime - 0.5) / 0.25;
    sunSettings = blend(duskColor, nightColor, 0.8, 0.2, t);
  } else {
    const t = (normalizedTime - 0.75) / 0.25;
    sunSettings = blend(nightColor, dawnColor, 0.2, 0.6, t);
  }

  sunLight.color.copy(sunSettings.color);
  sunLight.intensity = sunSettings.intensity;

  // Adjust the hemisphere light to match the sun's phase.
  const skyDay = new Color('#bde0fe');
  const skyNight = new Color('#0b1d51');
  const groundDay = new Color('#9d8189');
  const groundNight = new Color('#1f1f2e');

  const ambientFactor = Math.max(0.05, Math.sin(normalizedTime * Math.PI));
  hemiLight.color.copy(skyNight.clone().lerp(skyDay, ambientFactor));
  hemiLight.groundColor.copy(groundNight.clone().lerp(groundDay, ambientFactor));
  hemiLight.intensity = 0.3 + ambientFactor * 0.7;

  if (ambientLight) {
    ambientLight.intensity = 0.1 + ambientFactor * 0.2;
    ambientLight.color.copy(nightColor.clone().lerp(dayColor, ambientFactor));
  }
};
