# Ground texture drop folder

Place your JPG (or PNG) files in this directory to have them picked up by the
custom terrain texturing system. When you run `npm run build`, Vite copies the
same folder to `docs/textures/ground/` so GitHub Pages (or any static host)
serves the textures alongside the compiled site.

## Step-by-step: add a custom grass texture

1. **Prepare the texture file.** Export your grass artwork as a JPG (or PNG)
   file. Keep the resolution a power of two (e.g. 1024×1024 or 2048×2048) for
   best mip-mapping results.
2. **Copy it into the source folder.** Place the file in
   `public/textures/ground/` in your project workspace (this README is copied
   here during builds). Commit it if you want the texture to ship with the
   project.
3. **Reference it from the config.** Edit
   `src/world/groundTextureConfig.js` and point the base layer (or a detail
   layer) at your new filename, for example `textures/ground/your-grass.jpg`.
4. **Adjust coverage as needed.** Tweak the `repeat`, `strength`, `minHeight`,
   `maxHeight`, `fade`, and optional slope settings in the config to control
   how much of the mesh the layer covers.
5. **Restart or refresh the dev server.** The shader recompiles the next time
   the config changes; restarting `npm run dev` guarantees the new texture is
   loaded.
6. **Build for deployment.** Run `npm run build` when you are ready to publish;
   Vite copies everything to `docs/textures/ground/` for static hosting.

Reference the filenames from `src/world/groundTextureConfig.js` – for example:

```js
export const GROUND_TEXTURE_CONFIG = {
  base: {
    url: "textures/ground/grass.jpg",
    repeat: [48, 48],
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
