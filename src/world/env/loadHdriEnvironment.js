import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

export async function loadHdriEnvironment({ renderer, scene, path }) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  return new Promise((resolve, reject) => {
    const loader = new EXRLoader();
    const fallbackWarning = '[HDRI] HDRI file missing or unsupported: falling back to procedural sky';

    loader
      .setCrossOrigin('anonymous')
      // Use full float precision to avoid clamping bright HDR values to half-float range
      // which triggers THREE.DataUtils.toHalfFloat(): Value out of range warnings.
      .setDataType(THREE.FloatType)
      .load(
        path,
        (exrTexture) => {
          if (!exrTexture || !exrTexture.image) {
            console.warn(fallbackWarning);
            pmremGenerator.dispose();
            reject(new Error('Invalid EXR texture'));
            return;
          }

          if (!exrTexture.image.data) {
            console.warn(fallbackWarning);
            pmremGenerator.dispose();
            exrTexture.dispose();
            reject(new Error('Invalid EXR texture'));
            return;
          }

          if (exrTexture.type !== THREE.HalfFloatType && exrTexture.type !== THREE.FloatType) {
            console.warn(fallbackWarning);
            pmremGenerator.dispose();
            exrTexture.dispose();
            reject(new Error('Unsupported EXR format'));
            return;
          }

          try {
            const envMap = pmremGenerator.fromEquirectangular(exrTexture).texture;
            scene.environment = envMap;
            exrTexture.dispose();
            pmremGenerator.dispose();
            console.log('[HDRI] Environment map applied');
            resolve(envMap);
          } catch (err) {
            console.warn('[HDRI] Failed to apply environment. Falling back to default lighting.', err);
            exrTexture.dispose();
            pmremGenerator.dispose();
            reject(new Error('Failed to generate HDR environment map'));
            return;
          }
        },
        undefined,
        (error) => {
          const message = error?.message || '';
          if (message.toLowerCase().includes('unsupported type')) {
            console.warn(fallbackWarning);
            console.warn('[HDRI] Unsupported EXR type:', message);
            pmremGenerator.dispose();
            reject(new Error('Unsupported EXR format'));
            return;
          }

          console.warn(fallbackWarning);
          console.warn('[HDRI] Load failed:', error);
          pmremGenerator.dispose();
          reject(new Error('Failed to load HDRI environment'));
        }
      );
  });
}
