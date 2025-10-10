# Notes on dragonir/3d Ocean Water Implementation

## Overview
The [`Ocean` container](https://github.com/dragonir/3d/tree/master/src/containers/Ocean) in dragonir/3d builds an animated seascape with Three.js. The water surface is generated with the `Water` helper from `three/examples`, which wraps a render-to-texture pipeline for dynamic reflections and refractions. A large plane geometry acts as the ocean mesh, and its material uniforms drive the animated waves, reflections, and lighting.

## Key Components
- **Geometry & Material**: A `THREE.PlaneGeometry` with the `Water` material creates the water surface. The configuration specifies a tiling normal map (`waterNormals`), texture resolution, and distortion scale to control wave detail.
- **Normal Map Setup**: The normal texture loads with `THREE.TextureLoader` and enables `RepeatWrapping` on both axes so the pattern tiles seamlessly over the large plane.
- **Lighting Integration**: The material consumes a `sunDirection` vector, `sunColor`, and `waterColor`. A directional sun vector is computed from spherical coordinates and normalized into the uniform, allowing the shader to produce specular highlights that respond to the animated sun position.
- **Fog Awareness**: The `fog` flag is wired to the scene’s fog setting so the water automatically respects global atmospheric blending if fog is enabled.

## Animation Loop
Each frame, the renderer increments `water.material.uniforms['time']`, which drives the Water shader’s Gerstner-like wave function and reflection updates. Because the helper internally uses a framebuffer ping-pong, advancing `time` smoothly animates ripples and caustics without custom shader code.

## Environment & Reflections
- **Sky Dome**: A `Sky` object from `three/examples` surrounds the scene, with turbidity and Rayleigh/Mie coefficients tuned for a bright coastal environment.
- **PMREM Environment Map**: `THREE.PMREMGenerator` converts the procedural sky into an environment texture assigned to `scene.environment`. The water shader samples this texture for physically-based reflections, so the ocean mirrors the sky and sun colors.

## Supporting Details
- Camera controls rely on `OrbitControls` for smooth user navigation while clamping zoom and polar angles to keep the horizon framed.
- Additional atmosphere like lens flare, animated birds via `GLTFLoader`, and tweened camera paths enrich the scene but are decoupled from the core water effect. These demonstrate how the ocean integrates with other scene elements without bespoke coupling.

## Implementation Steps to Recreate the Effect
1. **Set up the water surface**: Import the `Water` helper from `three/examples`, build a wide `THREE.PlaneGeometry`, and instantiate the helper so the mesh is driven by the render-to-texture reflections and refractions pipeline.
2. **Load the tiled normal map**: Fetch the provided `waterNormals` texture (or your own) with `THREE.TextureLoader`, then assign `RepeatWrapping` on both `wrapS` and `wrapT` to ensure the pattern tiles seamlessly.
3. **Configure lighting uniforms**: Calculate a normalized `sunDirection` vector (for example from azimuth/elevation angles), and push it, along with your desired `sunColor` and `waterColor`, into the water material uniforms so highlights respond to the sun.
4. **Respect global fog**: Wire the material’s `fog` flag to your scene configuration (`fog: scene.fog !== undefined`) so the surface blends naturally with atmospheric effects.
5. **Advance time every frame**: In the animation loop, increment `water.material.uniforms.time.value` to keep the Gerstner-wave animation and framebuffer reflections in motion.
6. **Add sky lighting**: Surround the scene with the `Sky` helper, tune its scattering parameters, and feed its environment map (via `THREE.PMREMGenerator`) into `scene.environment` so the ocean reflects the sky accurately.
7. **Integrate with scene controls**: Layer on optional helpers such as `OrbitControls`, lens flare, and animated props while keeping them decoupled from the water surface to maintain modularity.
