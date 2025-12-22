import * as THREE from 'three';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';

export async function loadHdriEnvironment({ renderer, scene, path }) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  return new Promise((resolve, reject) => {
    new RGBELoader()
      .setDataType(THREE.UnsignedByteType)
      .load(
        path,
        (hdrTexture) => {
          try {
            const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;
            scene.environment = envMap;
            hdrTexture.dispose();
            pmremGenerator.dispose();
            console.log('[HDRI] Environment map applied');
            resolve(envMap);
          } catch (err) {
            console.warn('[HDRI] Failed to apply environment:', err);
            pmremGenerator.dispose();
            reject(err);
          }
        },
        undefined,
        (error) => {
          console.warn('[HDRI] Load failed:', error);
          pmremGenerator.dispose();
          reject(error);
        }
      },
      undefined,
      (error) => {
        console.warn('[HDRI] Load failed:', error);
        reject(error);
      },
    );
  });
}
