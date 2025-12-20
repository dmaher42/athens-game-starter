import * as THREE from "three";

export async function loadEquirectangularSkybox(renderer, scene, url) {
  if (!scene || !url) return null;
  const loader = new THREE.TextureLoader();

  const texture = await loader.loadAsync(url);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;

  scene.background = texture;
  scene.environment = texture;

  return texture;
}

export function disposeSkybox(scene) {
  if (!scene) return;
  const { background, environment } = scene;

  const disposeTexture = (tex) => {
    if (tex && typeof tex.dispose === "function") {
      tex.dispose();
    }
  };

  disposeTexture(background);
  if (environment && environment !== background) {
    disposeTexture(environment);
  }

  if (scene.background === background) {
    scene.background = null;
  }
  if (scene.environment === environment) {
    scene.environment = null;
  }
}

