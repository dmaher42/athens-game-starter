# Hero Character Asset

The runtime expects a GLB named `hero.glb` in this folder. When you add or update
the model, run `npm run build` so the asset is copied into
`docs/models/character/hero.glb` for GitHub Pages. The repository now tracks that
specific output so deployments served straight from the `docs/` folder (such as
GitHub Pages) can fetch it. Remember to commit the generated file alongside your
source asset.


The city presentation update keeps the original hero mesh, skeleton and animation
buffer. `node scripts/style-hero.mjs` applies the linen/teal/indigo cloth palette
in the GLB material table without changing skin, hair, face, rig or animation.
The script is idempotent; the character verification test pins the original binary
buffer. Citizen models are authored in `src/world/npcs.js`, with cached facial
geometry, role materials, animated shoulder/hip pivots and distant LODs.
