import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

export async function loadHdriEnvironment(renderer, scene, url) {
  if (!renderer || !scene || !url) return null;

  let available = true;
  try {
    const response = await fetch(url, { method: "HEAD" });
    available = response.ok;
  } catch (error) {
    available = false;
  }

  if (!available) {
    console.warn("HDRI environment file not found — continuing without it");
    return null;
  }

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  return new Promise((resolve) => {
    new RGBELoader()
      .setDataType(THREE.UnsignedByteType)
      .load(
        url,
        (hdrEquirect) => {
          try {
            const envMap = pmrem.fromEquirectangular(hdrEquirect).texture;
            scene.environment = envMap;
            if (typeof hdrEquirect.dispose === "function") {
              hdrEquirect.dispose();
            }
            resolve(envMap);
          } catch (error) {
            console.warn("HDRI load skipped:", error);
            resolve(null);
          } finally {
            pmrem.dispose();
          }
        },
        undefined,
        (error) => {
          pmrem.dispose();
          console.warn("HDRI load skipped:", error);
          resolve(null);
        },
      );
  });
}

