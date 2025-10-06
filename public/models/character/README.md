# Hero Character Asset

The runtime expects a GLB named `hero.glb` in this folder. When you add or update
the model, run `npm run build` so the asset is copied into
`docs/models/character/hero.glb` for GitHub Pages. The repository now tracks that
specific output so deployments served straight from the `docs/` folder (such as
GitHub Pages) can fetch it. Remember to commit the generated file alongside your
source asset.
