import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

export async function loadHdriEnvironment({ renderer, scene, path }) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  return new Promise((resolve, reject) => {
    const loader = new EXRLoader();

    loader
      .setCrossOrigin('anonymous')
      .setDataType(THREE.HalfFloatType)
      .load(
        path,
        (exrTexture) => {
          if (!exrTexture || !exrTexture.image) {
            pmremGenerator.dispose();
            reject(new Error('Invalid EXR texture'));
            return;
          }

          if (!exrTexture.image.data) {
            pmremGenerator.dispose();
            exrTexture.dispose();
            reject(new Error('Invalid EXR texture'));
            return;
          }

          if (exrTexture.type !== THREE.HalfFloatType && exrTexture.type !== THREE.FloatType) {
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
            console.warn('[HDRI] Unsupported EXR type:', message);
            pmremGenerator.dispose();
            reject(new Error('Unsupported EXR format'));
            return;
          }

          console.warn('[HDRI] Load failed:', error);
          pmremGenerator.dispose();
          reject(new Error('Failed to load HDRI environment'));
        }
      );
  });
}
