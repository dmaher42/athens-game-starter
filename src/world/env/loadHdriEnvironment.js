import * as THREE from 'three';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';

export async function loadHdriEnvironment({ renderer, scene, path }) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  return new Promise((resolve, reject) => {
    const loader = new HDRLoader();

    loader
      .setDataType(THREE.HalfFloatType)
      .load(
        path,
        (hdrTexture) => {
          if (!hdrTexture || !hdrTexture.image) {
            pmremGenerator.dispose();
            reject(new Error('Invalid HDR texture'));
            return;
          }

          if (!hdrTexture.image.data) {
            pmremGenerator.dispose();
            hdrTexture.dispose();
            reject(new Error('Invalid HDR texture'));
            return;
          }

          if (hdrTexture.type !== THREE.HalfFloatType && hdrTexture.type !== THREE.FloatType) {
            pmremGenerator.dispose();
            hdrTexture.dispose();
            reject(new Error('Unsupported HDR format'));
            return;
          }

          try {
            const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;
            scene.environment = envMap;
            hdrTexture.dispose();
            pmremGenerator.dispose();
            console.log('[HDRI] Environment map applied');
            resolve(envMap);
          } catch (err) {
            console.warn('[HDRI] Failed to apply environment. Falling back to default lighting.', err);
            hdrTexture.dispose();
            pmremGenerator.dispose();
            reject(new Error('Failed to generate HDR environment map'));
            return;
          }
        },
        undefined,
        (error) => {
          const message = error?.message || '';
          if (message.toLowerCase().includes('unsupported type')) {
            console.warn('[HDRI] Unsupported HDR type:', message);
            pmremGenerator.dispose();
            reject(new Error('Unsupported HDR format'));
            return;
          }

          console.warn('[HDRI] Load failed:', error);
          pmremGenerator.dispose();
          reject(new Error('Failed to load HDRI environment'));
        }
      );
  });
}
