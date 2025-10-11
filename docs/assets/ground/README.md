# Ground texture drop folder

Place your JPG (or PNG) files in this directory to have them picked up by the
custom terrain texturing system. When you run `npm run build`, Vite copies the
same folder to `docs/assets/ground/` so GitHub Pages (or any static host) serves
the textures alongside the compiled site. Reference the filenames from
`src/world/groundTextureConfig.js` – for example:

```js
export const GROUND_TEXTURE_CONFIG = {
  base: {
    url: "/assets/ground/grass.jpg",
    repeat: [48, 48],
  },
  details: [
    {
      url: "/assets/ground/rocky-strips.jpg",
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
`waternormals.jpg`), the harbor ocean helper will automatically try to load it
before falling back to the built-in procedural normals. The lookup order is:

1. Any URL you pass to `createOcean(scene, { waterNormals: { ... } })`.
2. The files `water_normals.png`, `waternormals.jpg`, `shader.png`, or `step_sea.gif`
   in this folder.

Run `npm run build` (or restart `npm run dev`) after dropping in new images so
Vite copies them into `docs/assets/ground/` for deployment.
