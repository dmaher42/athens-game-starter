import { DirectionalLight, HemisphereLight, Color, FogExp2, MathUtils, Vector3 } from 'three';
import { DEFAULT_LIGHTING_CONFIG } from '../config/LightingConfig.js';
import { updateSky } from './sky.js';

// Configuration constants - TWEAK THESE FOR "GREEK" FEEL
const SKY_COLOR_DAY = 0x87CEEB; // Soft Blue
const GROUND_COLOR_DAY = 0x8d7e71; // Warm Earth (Fixes Blue Shadows)
const SUN_COLOR = 0xfffaf0; // Warm White Sun
const MOON_COLOR = 0x223344; // Deep Blue-Grey Moon
const FOG_COLOR_DAY = 0xeecfa1; // Warm Haze (Greek Summer)
const FOG_COLOR_NIGHT = 0x050510; // Deep Navy Night

let sunLight;
let ambientLight;
let moonLight;
let sceneRef;
let currentPresetName = null;

export function createLighting(scene, config = DEFAULT_LIGHTING_CONFIG) {
    sceneRef = scene;

    // 1. Hemisphere Light (Ambient) - Fixes Blue Shadows
    ambientLight = new HemisphereLight(SKY_COLOR_DAY, GROUND_COLOR_DAY, 0.6);
    scene.add(ambientLight);

    // 2. Sun Light (Directional)
    sunLight = new DirectionalLight(SUN_COLOR, 1.2);
    sunLight.position.set(50, 100, 50);
    sunLight.castShadow = true;

    // High Quality Shadows
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    sunLight.shadow.bias = -0.0005; // Fix shadow acne
    sunLight.shadow.normalBias = 0.05; // Fix self-shadowing
    sunLight.shadow.radius = 2; // Soft edges

    scene.add(sunLight);

    // 3. Moon Light (Directional) - Fixes Black Night
    moonLight = new DirectionalLight(MOON_COLOR, 0.0);
    moonLight.position.set(-50, 100, -50);
    moonLight.castShadow = true; // Moon shadows!
    // Share shadow properties or set simpler ones for performance
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.camera.far = 500;
    moonLight.shadow.bias = -0.0005;

    scene.add(moonLight);

    // 4. Fog
    scene.fog = new FogExp2(FOG_COLOR_DAY, 0.0025); // Reduced density for clarity

    return { sunLight, ambientLight, moonLight };
}

export function updateLighting(scene, timeOfDay, config = DEFAULT_LIGHTING_CONFIG) {
    if (!sunLight || !ambientLight) return;

    // Find the current preset based on phase
    let activePreset = 'noon';
    let minDiff = 100;

    // Simple phase matching
    for (const [key, preset] of Object.entries(config.presets)) {
        const diff = Math.abs(preset.phase - timeOfDay);
        if (diff < minDiff) {
            minDiff = diff;
            activePreset = key;
        }
    }

    // Handle Skybox switching if preset changed
    if (activePreset !== currentPresetName) {
        currentPresetName = activePreset;
        console.log(`[Lighting] Switching to preset: ${activePreset}`);
        if (typeof updateSky === 'function') {
            updateSky(scene, activePreset);
        }
    }

    // Calculate generic Day/Night factor (0 to 1)
    // Noon = 1, Night = 0
    const dayFactor = Math.max(0, Math.sin(timeOfDay * Math.PI));

    // --- Dynamic Lighting Logic ---

    // 1. Sun Movement
    const r = 100;
    const sunX = Math.cos(timeOfDay * Math.PI * 2 + Math.PI / 2) * r;
    const sunY = Math.sin(timeOfDay * Math.PI * 2 + Math.PI / 2) * r;
    sunLight.position.set(sunX, sunY, 50);
    sunLight.updateMatrixWorld();

    // 2. Sun Intensity
    // Peak at noon, off at night
    sunLight.intensity = MathUtils.lerp(0, 1.3, dayFactor);

    // 3. Moon Logic (Fixes Dark Night)
    if (dayFactor < 0.1) {
        // It's Night
        moonLight.intensity = MathUtils.lerp(moonLight.intensity, 0.5, 0.05);
        ambientLight.intensity = MathUtils.lerp(ambientLight.intensity, 0.4, 0.05); // Minimum brightness

        // Night Fog/Ambient Colors
        ambientLight.groundColor.setHex(0x111122); // Cool dark ground at night
        ambientLight.color.setHex(0x223355); // Cool night sky light
        if (scene.fog) scene.fog.color.setHex(FOG_COLOR_NIGHT);
    } else {
        // It's Day
        moonLight.intensity = MathUtils.lerp(moonLight.intensity, 0.0, 0.1);

        // Day Fog/Ambient Colors
        // Lerp ambient intensity between 0.4 (dawn/dusk) and 0.8 (noon)
        const targetAmbient = MathUtils.lerp(0.4, 0.8, dayFactor);
        ambientLight.intensity = MathUtils.lerp(ambientLight.intensity, targetAmbient, 0.05);
        ambientLight.groundColor.setHex(GROUND_COLOR_DAY);
        ambientLight.color.setHex(SKY_COLOR_DAY);

        // Warm fog for day
        if (scene.fog) scene.fog.color.setHex(FOG_COLOR_DAY);
    }
}
