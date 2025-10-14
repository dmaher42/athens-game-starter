# Ground texture drop folder

Place your JPG (or PNG) files in this directory to have them picked up by the
custom terrain texturing system. When you run `npm run build`, Vite copies the
same folder to `docs/textures/ground/` so GitHub Pages (or any static host)
serves the textures alongside the compiled site. Reference the filenames from
`src/world/groundTextureConfig.js` – for example, the bundled grass material
expects the following files:

```
grass-albedo.jpg
grass-normal-dx.jpg
grass-roughness.jpg
grass-metallic.jpg
grass-ao.jpg
grass-height.jpg // used as a bump map
```

Three.js treats color textures as sRGB, while data maps (roughness, metalness,
height, AO) should remain in linear space. The config already applies the
correct color space when you follow the naming above.

```js
export const GROUND_TEXTURE_CONFIG = {
  base: {
    url: "textures/ground/grass-albedo.jpg",
    normalUrl: "textures/ground/grass-normal-dx.jpg",
    roughnessUrl: "textures/ground/grass-roughness.jpg",
    metalnessUrl: "textures/ground/grass-metallic.jpg",
    aoUrl: "textures/ground/grass-ao.jpg",
    bumpUrl: "textures/ground/grass-height.jpg",
    repeat: [18, 18],
  },
  details: [
    {
      url: "textures/ground/rocky-strips.jpg",
      repeat: [96, 96],
      strength: 0.5,
      minHeight: 5,
      maxHeight: 45,
      fade: 6,
      mode: "multiply",
    },
  ],
};
```

Restart or refresh the dev server after editing the config to ensure Three.js
recompiles the material shader.

## Harbor water normal maps

If you add a water normal map here (for example `water_normals.png` or
`water_normals.jpg`), the harbor ocean helper will automatically try to load it
before falling back to the built-in procedural normals. The lookup order is:

1. Any URL you pass to `createOcean(scene, { waterNormals: { ... } })`.
2. The files `water_normals.png`, `water_normals.jpg`, `shader.png`, or `step_sea.gif`
   in this folder.

Run `npm run build` (or restart `npm run dev`) after dropping in new images so
Vite copies them into `docs/textures/ground/` for deployment.
