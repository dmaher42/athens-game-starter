import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export async function loadHdriEnvironment({ renderer, scene, path }) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  return new Promise((resolve, reject) => {
    const loader = new RGBELoader();

    loader
      .setDataType(THREE.UnsignedByteType)
      .load(
        path,
        (hdrTexture) => {
          if (!hdrTexture || !hdrTexture.image || !hdrTexture.image.data) {
            pmremGenerator.dispose();
            reject(new Error('Invalid HDR texture'));
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
            reject(error);
            return;
          }

          console.warn('[HDRI] Load failed:', error);
          pmremGenerator.dispose();
          reject(new Error('Failed to load HDRI environment'));
        }
      );
  });
}
