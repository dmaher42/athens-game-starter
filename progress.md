Original prompt: once complete start and finish the 5 most important issues

- 2026-03-25: Repaired the repo verification workflow so it builds, launches a Vite preview server on a free localhost port, and checks the GitHub Pages base path in Playwright.
- 2026-03-25: Added `typecheck`, `preview`, `build:analyze`, and `verify` npm scripts; CI now uses `npm ci` and runs `typecheck` plus `verify` before deploy.
- 2026-03-25: Updated TypeScript config to allow the existing mixed TypeScript/JavaScript codebase to typecheck without placeholder module shims.
- 2026-03-25: Split release vs analyze build behavior so normal deploys use minification, treeshaking, and no sourcemaps, while analyze mode keeps the heavier debug settings.
- 2026-03-25: Synced the stale project docs with the current scripts and verification flow.
- 2026-03-25: Verified `npm run typecheck` and `npm run verify` both pass. Remaining notable risk: the production bundle is still over Vite's 500 kB warning threshold and could use chunking later.
- 2026-03-26: Updated the lockfile to pull in fixed versions of Vite, Rollup, minimatch, ajv, and lodash. `npm audit` now reports 0 vulnerabilities.
- 2026-03-26: Adjusted Vite manual chunking so Three.js and BVH code ship in dedicated vendor chunks. The build now emits a smaller app chunk and no longer produces chunk-size or circular-chunk warnings during `npm run verify`.
- 2026-03-26: Started the first demo content pass with a guided walking tour, district beacons for Agora/Harbor/Acropolis, and extra hero temple placements for the Agora and Acropolis.
- 2026-03-26: Verified the first demo pass with `npm run typecheck`, `npm run verify`, and browser inspection. Headless screenshots still mostly show HUD overlays, so future visual reviews may need headed capture or in-app debug camera framing.
- 2026-03-26: Started the second demo pass by strengthening each destination marker into a fuller arrival set piece with themed props and local light accents. Harbor is now the strongest active stop, while Agora and Acropolis read more distinctly on arrival.
- 2026-03-26: Verified the second pass with `npm run typecheck`, `npm run verify`, and browser inspection of quest state plus district marker composition counts.
