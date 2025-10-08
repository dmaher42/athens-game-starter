# athens-game-starter

## Quick start

To run the project locally:

1. Install dependencies with `npm install`.
2. Start the Vite dev server with `npm run dev`.

The build step outputs self-contained static assets under `docs/`, suitable for
hosting on GitHub Pages or any static site provider.

> ℹ️ Drop a hero character model at `public/models/character/hero.glb` to see the
> fully animated avatar. When the file is missing the runtime first tries the
> bundled "Hooded Adventurer" sample before falling back to a simple capsule so
> movement and interactions remain testable. Large binary GLB assets are not
> tracked in this repository; download or supply your own models locally before
> building or deploying the project.

### Custom ground textures

Drop photographic ground tiles in `public/assets/ground/` and reference them
from `src/world/groundTextureConfig.js`. The runtime keeps the existing vertex
colors as a fallback, then layers your JPGs using height-aware masks so dirt can
fade into rocky cliffs or lush grass in lowlands. Update the config to tune
repeat counts, tint, blend mode (`"multiply"` or `"mix"`), and the height
interval where each texture appears. Refresh the dev server after editing the
config to trigger shader recompilation.

### Controls

- **W / A / S / D** (or arrow keys) – Move across the terrain.
- **Shift** – Sprint while grounded or flying.
- **Space** – Jump when on the ground; ascend while flying.
- **Ctrl** – Descend while flying.
- **F** – Toggle flight mode on or off.

### Verifying custom hero models without the CLI

If you do not have access to a local terminal you can still confirm the runtime
loads your custom `hero.glb`:

1. Use your file manager to copy the model to
   `public/models/character/hero.glb`. Keep the filename—`Character.ts` requests
   that exact path when the app starts.
2. Open the project folder in an editor with an integrated dev server (for
   example VS Code + the Vite extension) or upload the repository to a platform
   such as StackBlitz that can run Vite in the browser. Both options replicate
   the standard `npm run dev` workflow without relying on your own terminal.
3. Start the preview and watch the browser console. If the runtime cannot reach
   your file it logs a warning about the placeholder capsule; seeing the fully
   animated character without that warning confirms the GLB loaded correctly.
4. When preparing a production build, make sure the same file ends up at
   `docs/models/character/hero.glb` or an equivalent CDN bucket that your
   deployment workflow publishes alongside the static site.

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

The GLB is saved to `public/models/landmarks/aristotle_tomb.glb`. Because binary
assets are ignored by Git, keep the downloaded file outside of commits—your
deployment workflow should copy it into `public/` (and therefore `docs/`) at
build time. If the file is missing when the app boots the runtime now renders a
bundled placeholder glTF and, when that is not available, spawns a lightweight
procedural monument so you can continue exploring even before fetching the
premium asset.

### Sample landmark buildings

Two sample landmarks – `Akropol.glb` and
`poseidon_temple_at_sounion_greece.glb` – can be downloaded and placed in
`public/models/buildings/` to replace the Acropolis and seaside placeholders.
The runtime falls back to procedural stand-ins when the binaries are absent, so
you can continue iterating without committing large files. Swap the models (or
add your own landmarks) by dropping GLBs in `public/models/buildings/` and
updating the placement list in `src/main.js`.

## KTX2 textures

Models loaded through `GLTFLoader` expect textures in the KTX2 (Basis Universal)
format for optimal GPU upload and streaming performance. At runtime the
`KTX2Loader` automatically detects whether the current browser supports GPU
decoding. When decoding is unavailable, assets are transcoded on the fly and
fall back to standard uncompressed textures so the scene continues to render.

By default the loader pulls the Basis transcoder worker and WASM binary from the
[three.js CDN](https://unpkg.com/three@0.180.0/examples/jsm/libs/basis/). If you
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

- **Hero character** – [Robot Hero (Poly Pizza)](https://poly.pizza/m/y9KWOVG21R) by [Quaternius](https://poly.pizza/u/Quaternius), licensed under [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/).
