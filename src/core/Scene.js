import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { createColorGradePass } from "../world/colorGradingPass.js";

export const WORLD_ROOT_NAME = "WorldRoot";

export function configureRendererShadows(renderer) {
  if (!renderer) return;

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  if (renderer.shadowMap) {
    renderer.shadowMap.autoUpdate = true;
    renderer.shadowMap.needsUpdate = true;
  }
}

export function createRenderer({ antialias = true } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.useLegacyLights = false;
  renderer.localClippingEnabled = true;
  configureRendererShadows(renderer);
  return renderer;
}

export function createSceneContext({
  renderer,
  baseUrl,
  worldRootName = WORLD_ROOT_NAME,
  onFogChange,
} = {}) {
  const scene = new THREE.Scene();
  scene.userData = scene.userData || {};
  scene.userData.renderer = renderer;
  scene.userData.baseUrl = baseUrl;

  const fogState = {
    color: new THREE.Color(0xbfd5ff),
    near: 300,
    far: 1950,
    density: 0.0002,
  };

  const createSceneFog = () => {
    // Distance-weighted fog keeps the town readable while still blending the horizon.
    return new THREE.Fog(fogState.color.clone(), fogState.near, fogState.far);
  };

  let fogEnabled = false;

  const syncFogState = () => {
    if (typeof onFogChange === "function") {
      onFogChange(fogEnabled, scene);
    }
  };

  const setFogOptions = ({ color, density, near, far } = {}) => {
    if (color) {
      fogState.color.copy(color instanceof THREE.Color ? color : new THREE.Color(color));
    }
    if (Number.isFinite(near)) {
      fogState.near = Math.max(0, near);
    }
    if (Number.isFinite(far)) {
      fogState.far = Math.max(fogState.near + 10, far);
    }

    // Allow legacy density-driven calls by converting to a distant falloff.
    if (Number.isFinite(density)) {
      fogState.density = Math.max(0, density);
      const suggestedFar = THREE.MathUtils.clamp(1 / Math.max(density, 1e-6), 400, 2600);
      fogState.far = Math.max(fogState.near + 80, suggestedFar);
    }

    if (scene.fog) {
      scene.fog.color.copy(fogState.color);
      if (scene.fog.isFog) {
        scene.fog.near = fogState.near;
        scene.fog.far = fogState.far;
      } else if (scene.fog.isFogExp2) {
        scene.fog.density = fogState.density;
      }
    }
  };

  const setFogEnabled = (enabled = true) => {
    const next = Boolean(enabled);
    if (fogEnabled === next && !!scene.fog === next) {
      syncFogState();
      return;
    }
    fogEnabled = next;
    scene.fog = fogEnabled ? createSceneFog() : null;
    syncFogState();
  };

  const toggleFog = () => {
    setFogEnabled(!fogEnabled);
  };

  scene.userData.setFogOptions = setFogOptions;
  scene.userData.getFogOptions = () => ({
    color: fogState.color.clone(),
    density: fogState.density,
    near: fogState.near,
    far: fogState.far,
  });

  const disposeMaterial = (material) => {
    if (!material) return;
    const materials = Array.isArray(material) ? material : [material];
    for (const mat of materials) {
      if (!mat) continue;
      for (const value of Object.values(mat)) {
        if (value && value.isTexture && typeof value.dispose === "function") {
          value.dispose();
        }
      }
      if (typeof mat.dispose === "function") {
        mat.dispose();
      }
    }
  };

  const disposeObject = (object) => {
    if (!object) return;
    object.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry && typeof child.geometry.dispose === "function") {
          child.geometry.dispose();
        }
        disposeMaterial(child.material);
      }
    });
  };

  const disposeGroupChildren = (group) => {
    if (!group) return;
    const children = [...group.children];
    for (const child of children) {
      disposeObject(child);
      group.remove(child);
    }
  };

  const refreshWorldRoot = () => {
    const existing =
      scene.userData?.worldRoot ?? scene.getObjectByName(worldRootName);
    if (existing) {
      disposeGroupChildren(existing);
      existing.parent?.remove(existing);
    }

    const root = new THREE.Group();
    root.name = worldRootName;
    root.userData = root.userData || {};
    root.userData.renderer = scene.userData?.renderer || null;
    if (typeof scene.userData?.baseUrl === "string") {
      root.userData.baseUrl = scene.userData.baseUrl;
    } else {
      delete root.userData.baseUrl;
    }
    scene.add(root);
    scene.userData.worldRoot = root;
    return root;
  };

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2000,
  );

  const composer = new EffectComposer(renderer);
  const composerPixelRatio =
    renderer?.getPixelRatio?.() ?? window.devicePixelRatio ?? 1;
  composer.setPixelRatio(composerPixelRatio);
  composer.setSize(window.innerWidth, window.innerHeight);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.3,
    0.6,
    0.85,
  );
  bloomPass.enabled = true;
  composer.addPass(bloomPass);
  const colorGradePass = createColorGradePass();
  composer.addPass(colorGradePass);

  const renderFrame = () => {
    if (composer) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
  };

  camera.near = 0.1;
  camera.far = 5000;
  camera.updateProjectionMatrix();
  camera.position.set(0, 5, 10);

  setFogEnabled(true);

  return {
    scene,
    camera,
    composer,
    bloomPass,
    colorGradePass,
    renderFrame,
    refreshWorldRoot,
    setFogEnabled,
    toggleFog,
  };
}
