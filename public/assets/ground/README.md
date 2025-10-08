# Ground texture drop folder

Place your JPG (or PNG) files in this directory to have them picked up by the
custom terrain texturing system. Reference the filenames from
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
