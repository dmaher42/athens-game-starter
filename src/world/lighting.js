import { DirectionalLight, HemisphereLight, Color, FogExp2, MathUtils, Vector3 } from 'three';
import { DEFAULT_LIGHTING_CONFIG } from '../config/LightingConfig.js';
import { updateSky } from './sky.js';

const SKY_COLOR_DAY = 0x87CEEB;
const GROUND_COLOR_DAY = 0x8d7e71; // Warm Earth
const SUN_COLOR = 0xfffaf0;
const MOON_COLOR = 0x223344;
const FOG_COLOR_DAY = 0xeecfa1;
const FOG_COLOR_NIGHT = 0x050510;

let sunLight;
let ambientLight;
let moonLight;
let sceneRef;
let currentPresetName = 'noon';

export function createLighting(scene, config = DEFAULT_LIGHTING_CONFIG) {
  sceneRef = scene;
  ambientLight = new HemisphereLight(SKY_COLOR_DAY, GROUND_COLOR_DAY, 0.6);
  scene.add(ambientLight);

  sunLight = new DirectionalLight(SUN_COLOR, 1.2);
  sunLight.position.set(50, 100, 50);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(4096, 4096);
  sunLight.shadow.bias = -0.0005;
  sunLight.shadow.normalBias = 0.05;
  scene.add(sunLight);

  moonLight = new DirectionalLight(MOON_COLOR, 0.0);
  moonLight.position.set(-50, 100, -50);
  moonLight.castShadow = true;
  scene.add(moonLight);

  scene.fog = new FogExp2(FOG_COLOR_DAY, 0.0025);
  return { sunLight, ambientLight, moonLight };
}

export function updateLighting(scene, timeOfDay, config = DEFAULT_LIGHTING_CONFIG) {
  // Guard clause: Return safe defaults if lights aren't initialized
  if (!sunLight || !ambientLight) {
    return { dayFactor: 1, nightFactor: 0 };
  }

  let activePreset = 'noon';
  let minDiff = 100;
  for (const [key, preset] of Object.entries(config.presets)) {
    const diff = Math.abs(preset.phase - timeOfDay);
    if (diff < minDiff) {
      minDiff = diff;
      activePreset = key;
    }
  }

  if (activePreset !== currentPresetName) {
    currentPresetName = activePreset;
    if (typeof updateSky === 'function') updateSky(scene, activePreset);
  }

  const dayFactor = Math.max(0, Math.sin(timeOfDay * Math.PI));
  const nightFactor = 1.0 - dayFactor;

  const r = 100;
  const sunX = Math.cos(timeOfDay * Math.PI * 2 + Math.PI / 2) * r;
  const sunY = Math.sin(timeOfDay * Math.PI * 2 + Math.PI / 2) * r;

  sunLight.position.set(sunX, sunY, 50);
  sunLight.updateMatrixWorld();
  sunLight.intensity = MathUtils.lerp(0, 1.3, dayFactor);

  if (dayFactor < 0.1) {
    moonLight.intensity = MathUtils.lerp(moonLight.intensity, 0.5, 0.05);
    ambientLight.intensity = MathUtils.lerp(ambientLight.intensity, 0.4, 0.05);
    ambientLight.groundColor.setHex(0x111122);
    ambientLight.color.setHex(0x223355);
    scene.fog.color.setHex(FOG_COLOR_NIGHT);
  } else {
    moonLight.intensity = MathUtils.lerp(moonLight.intensity, 0.0, 0.1);
    const targetAmbient = MathUtils.lerp(0.4, 0.8, dayFactor);
    ambientLight.intensity = MathUtils.lerp(ambientLight.intensity, targetAmbient, 0.05);
    ambientLight.groundColor.setHex(GROUND_COLOR_DAY);
    ambientLight.color.setHex(SKY_COLOR_DAY);
    scene.fog.color.setHex(FOG_COLOR_DAY);
  }

  return { dayFactor, nightFactor };
}
