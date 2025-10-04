import { Sky } from 'three/examples/jsm/objects/Sky.js';

// The Sky helper from Three.js ships with a rich atmospheric scattering
// shader. We only need to instantiate it once, configure the uniforms,
// and add it to the scene.
export const createSky = (scene) => {
  const sky = new Sky();

  // The sky needs to be scaled up dramatically so that it surrounds the
  // entire world. The helper conveniently exposes a setScalar method for
  // uniform scaling.
  sky.scale.setScalar(450000);
  scene.add(sky);

  // These values control how light scatters through the atmosphere.
  // Feel free to tweak them to taste if you want a hazier or crisper look.
  const uniforms = sky.material.uniforms;
  uniforms.turbidity.value = 10;
  uniforms.rayleigh.value = 2;
  uniforms.mieCoefficient.value = 0.005;
  uniforms.mieDirectionalG.value = 0.8;

  // The sun position uniform is what ultimately determines the color of the
  // sky gradient. We initialise it to a sensible default pointing straight up.
  uniforms.sunPosition.value.set(0, 1, 0);

  return sky;
};

// Update the sun position used by the atmospheric shader. The helper expects
// a world-space position, so we simply copy over the provided direction.
export const updateSky = (sky, sunDirection) => {
  if (!sky?.material?.uniforms?.sunPosition) return;

  // Normalise a copy to avoid mutating the original vector passed in.
  const sunPosition = sky.material.uniforms.sunPosition.value;
  sunPosition.copy(sunDirection).normalize();
};
