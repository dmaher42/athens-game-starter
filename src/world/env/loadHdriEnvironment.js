import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

export async function loadHdriEnvironment({ renderer, scene, path, onFallback }) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  return new Promise((resolve) => {
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
            onFallback?.();
            resolve(null);
            return;
          }

          if (!exrTexture.image.data) {
            console.warn(fallbackWarning);
            pmremGenerator.dispose();
            exrTexture.dispose();
            onFallback?.();
            resolve(null);
            return;
          }

          if (exrTexture.type !== THREE.HalfFloatType && exrTexture.type !== THREE.FloatType) {
            console.warn(fallbackWarning);
            pmremGenerator.dispose();
            exrTexture.dispose();
            onFallback?.();
            resolve(null);
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
            onFallback?.();
            resolve(null);
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
            onFallback?.();
            resolve(null);
            return;
          }

          console.warn(fallbackWarning);
          console.warn('[HDRI] Load failed:', error);
          pmremGenerator.dispose();
          onFallback?.();
          resolve(null);
        }
      );
  });
}
