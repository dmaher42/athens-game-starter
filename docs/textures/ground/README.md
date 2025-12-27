# Ground texture drop folder

The ground texturing system now expects shared textures to live under
`public/textures/` so they are available at runtime via
`${BASE_URL}textures/...`. When you run `npm run build`, Vite copies them into
`docs/textures/` for GitHub Pages (or any static host).

The bundled grass material expects the following files under
`public/textures/grass/`:

```
albedo.jpg
normal_dx.jpg
roughness.jpg
metallic.jpg
ao.jpg
height.jpg // used as a bump map
```

Three.js treats color textures as sRGB, while data maps (roughness, metalness,
height, AO) should remain in linear space. The config already applies the
correct color space when you follow the naming above.

```js
const textureUrl = (filename) =>
  `${import.meta.env.BASE_URL}textures/grass/${filename}`;

export const GROUND_TEXTURE_CONFIG = {
  base: {
    url: textureUrl("albedo.jpg"),
    normalUrl: textureUrl("normal_dx.jpg"),
    roughnessUrl: textureUrl("roughness.jpg"),
    metalnessUrl: textureUrl("metallic.jpg"),
    aoUrl: textureUrl("ao.jpg"),
    bumpUrl: textureUrl("height.jpg"),
    repeat: [18, 18],
  },
  details: [
    {
      url: textureUrl("rocky-strips.jpg"),
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

If you add a water normal map under `public/textures/water/` (for example
`normals.png` or `normals.jpg`), the harbor ocean helper will automatically try
to load it
before falling back to the built-in procedural normals. The lookup order is:

1. Any URL you pass to `createOcean(scene, { waterNormals: { ... } })`.
2. The files `normals.png`, `normals.jpg`, `shader.png`, or `step_sea.gif`
   in that folder.

Run `npm run build` (or restart `npm run dev`) after dropping in new images so
Vite copies them into `docs/textures/` for deployment.
