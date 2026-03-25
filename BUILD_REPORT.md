# Build Report

- Ran `npm ci` to install dependencies.
- Ran `npm run typecheck` to validate the current mixed TypeScript/JavaScript codebase.
- Ran `npm run verify` to build the site, start a local preview server, and confirm the app loads under the GitHub Pages base path.

## Tooling Inventory (Stage 0)

### npm Scripts
- `dev` - starts the local Vite development server on port `8000`.
- `start` - matches the `dev` workflow for local development.
- `build` - builds the site and runs the post-build asset sanitation scripts.
- `build:analyze` - builds with the debug-oriented analyze mode and updates `docs/stats.html`.
- `preview` - serves the production build on localhost with strict port usage.
- `typecheck` - runs `tsc --noEmit`.
- `verify` - runs the production build and then browser-verifies the GitHub Pages build via Playwright.
- `deploy` - aliases `npm run build`.

### Dependencies
- `three`
- `three-mesh-bvh`
- `tslib`

### Dev Dependencies
- `vite`
- `typescript`
- `@types/node`
- `@types/three`
- `@types/web`
- `playwright`
- `@playwright/test`
- `rollup-plugin-visualizer`
