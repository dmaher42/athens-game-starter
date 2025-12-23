import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

const FALLBACK_PRESETS = {
  blueHour: {
    sky: '#3b4f79',
    ground: '#b5763a',
    background: '#0f1a2b',
    intensity: 0.5,
  },
  brightNoon: {
    sky: '#bcd7ff',
    ground: '#e9d5b5',
    background: '#d8ecff',
    intensity: 0.8,
  },
  goldenHour: {
    sky: '#ffd9a3',
    ground: '#7a4b32',
    background: '#fff2d6',
    intensity: 0.65,
  },
  default: {
    sky: '#c3c8d1',
    ground: '#7a7d80',
    background: '#d6d9df',
    intensity: 0.55,
  },
};

function getFallbackPreset(path = '') {
  const lowerPath = path.toLowerCase();
  if (lowerPath.includes('blue') || lowerPath.includes('dusk')) {
    return FALLBACK_PRESETS.blueHour;
  }
  if (
    lowerPath.includes('noon') ||
    lowerPath.includes('midday') ||
    lowerPath.includes('day')
  ) {
    return FALLBACK_PRESETS.brightNoon;
  }
  if (
    lowerPath.includes('sunset') ||
    lowerPath.includes('golden') ||
    lowerPath.includes('dawn')
  ) {
    return FALLBACK_PRESETS.goldenHour;
  }
  return FALLBACK_PRESETS.default;
}

function removeFallbackEnvironment(scene) {
  const fallbackKey = 'fallbackHemisphereLight';
  const userData = scene?.userData;
  const hemiLight = userData?.[fallbackKey];
  if (hemiLight) {
    scene.remove(hemiLight);
  }
}

function applyFallbackEnvironment(scene, path) {
  const preset = getFallbackPreset(path);
  const fallbackKey = 'fallbackHemisphereLight';
  const userData = scene.userData || {};

  let hemiLight = userData[fallbackKey];
  if (!hemiLight) {
    hemiLight = new THREE.HemisphereLight(preset.sky, preset.ground, preset.intensity);
    hemiLight.name = fallbackKey;
    userData[fallbackKey] = hemiLight;
    scene.userData = userData;
    scene.add(hemiLight);
  } else {
    hemiLight.color.set(preset.sky);
    hemiLight.groundColor.set(preset.ground);
    hemiLight.intensity = preset.intensity;
    if (!scene.children.includes(hemiLight)) {
      scene.add(hemiLight);
    }
  }

  scene.environment = null;
  scene.background = new THREE.Color(preset.background);
  // Documented defaults: tuned per time-of-day preset to avoid pitch-black scenes when HDRI is unavailable.

  return hemiLight;
}

export async function loadHdriEnvironment({ renderer, scene, path }) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  return new Promise((resolve) => {
    const loader = new EXRLoader();
    const fallbackWarning = '[HDRI] HDRI file missing or unsupported: falling back to procedural sky';

    const handleFallback = (error, exrTexture) => {
      if (exrTexture) exrTexture.dispose();
      pmremGenerator.dispose();
      if (error) {
        console.warn('[HDRI] Load failed:', error);
      }
      console.warn(fallbackWarning);
      applyFallbackEnvironment(scene, path);
      resolve(null);
    };

    try {
      if (!path) {
        handleFallback(new Error('HDRI path missing'));
        return;
      }

      loader
        .setCrossOrigin('anonymous')
        // Use full float precision to avoid clamping bright HDR values to half-float range
        // which triggers THREE.DataUtils.toHalfFloat(): Value out of range warnings.
        .setDataType(THREE.FloatType)
        .load(
          path,
          (exrTexture) => {
            try {
              if (!exrTexture || !exrTexture.image || !exrTexture.image.data) {
                handleFallback(new Error('Invalid EXR texture'), exrTexture);
                return;
              }

              if (exrTexture.type !== THREE.HalfFloatType && exrTexture.type !== THREE.FloatType) {
                handleFallback(new Error('Unsupported EXR format'), exrTexture);
                return;
              }

              const envMap = pmremGenerator.fromEquirectangular(exrTexture).texture;
              removeFallbackEnvironment(scene);
              scene.environment = envMap;
              exrTexture.dispose();
              pmremGenerator.dispose();
              console.log('[HDRI] Environment map applied');
              resolve(envMap);
            } catch (err) {
              handleFallback(err, exrTexture);
            }
          },
          undefined,
          (error) => {
            const message = error?.message || '';
            if (message.toLowerCase().includes('unsupported type')) {
              handleFallback(new Error('Unsupported EXR format'));
              return;
            }

            handleFallback(error);
          }
        );
    } catch (error) {
      handleFallback(error);
    }
  });
}
