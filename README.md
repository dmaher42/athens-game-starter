# athens-game-starter

## Quick start

To run the project locally:

1. Install dependencies with `npm install`.
2. Start the Vite dev server with `npm run dev`.

The build step outputs self-contained static assets under `docs/`, suitable for
hosting on GitHub Pages or any static site provider.

> ℹ️ Run `npm run download:hero` to fetch a sample character into
> `public/models/character/hero.glb`. When the file is missing the app now spawns
> a simple fallback capsule so movement and interactions remain testable. The
> command accepts `--include-docs` when you also want the asset copied into a
> prebuilt `docs/` directory for GitHub Pages deployments.

> ⚠️ Opening `index.html` directly from the filesystem will not work. The source
> imports bare modules (such as `three`) and TypeScript entry points that must be
> processed by Vite before they can run in the browser.

### Downloading Aristotle's Tomb

The main scene now features Aristotle's Tomb from Sketchfab. Because the model
is distributed under a free license, you still need a Sketchfab API token to
pull the binary. Run the helper script and pass your token via the environment:

```bash
SKETCHFAB_TOKEN=<your token> npm run download:aristotle
```

The GLB is saved to `public/models/buildings/aristotle-tomb.glb`. If the file is
missing when the app boots the code falls back to the existing Akropol model,
so you can continue exploring even before fetching the new landmark.

## KTX2 textures

Models loaded through `GLTFLoader` expect textures in the KTX2 (Basis Universal)
format for optimal GPU upload and streaming performance. At runtime the
`KTX2Loader` automatically detects whether the current browser supports GPU
decoding. When decoding is unavailable, assets are transcoded on the fly and
fall back to standard uncompressed textures so the scene continues to render.

By default the loader pulls the Basis transcoder worker and WASM binary from the
[three.js CDN](https://unpkg.com/three@0.160.0/examples/jsm/libs/basis/). If you
prefer to host the decoder assets yourself you can either:

1. Download `basis_transcoder.js` and `basis_transcoder.wasm` from the same CDN
   and place them in `public/basis/`, then set the environment variable
   `VITE_BASIS_TRANSCODER_PATH=/basis/` when running the dev server or build.
2. Expose a global in your HTML before the app boots:

   ```html
   <script>
     window.__BASIS_TRANSCODER_PATH__ = "/path/to/basis/";
   </script>
   ```

Make sure the configured path ends with a trailing slash so the loader can find
both files.

### Converting textures

Two common workflows for preparing KTX2 textures are:

1. **Basis Universal CLI** – Convert source images directly:

   ```bash
   basisu -ktx2 -uastc_level 2 -y_flip -output texture.ktx2 texture.png
   ```

   Adjust compression flags to balance size and quality. The `-y_flip` flag is
   useful when your UVs expect the OpenGL texture origin.

2. **gltfpack** – Repack an existing glTF/GLB scene and transcode all embedded
   textures:

   ```bash
   gltfpack -i scene.gltf -o scene.glb -tc
   ```

   The `-tc` switch enables texture compression (KTX2 + Basis Universal) and
   will also generate mesh optimizations.

After conversion, ensure the resulting `.ktx2` files are referenced by your
glTF/glb assets before importing them into the project.

## Deployment — GitHub Pages

This project deploys automatically on push to `main` using GitHub Actions.

- Vite `base` is set to `/athens-game-starter/` in `vite.config.ts` (required for GH Pages).
- Workflow: `.github/workflows/deploy.yml` builds with Vite and publishes whichever output directory is produced
  (`dist/` or `docs/`) to GitHub Pages.
- SPA fallback: `404.html` is copied from `index.html` during the workflow to support deep links.

After the first successful run, the site will be available at:
`https://<your-username>.github.io/athens-game-starter/`

## Asset credits

- **Hero character** – [Soldier (glTF Sample Models)](https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0/Soldier) by [Khronos Group](https://www.khronos.org/), licensed under [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/).
