# Build Report

- Ran `npm ci` to install dependencies. The script generated the favicon asset during postinstall.
- Ran `npm run build` to produce the static site output under the `docs/` directory.

## Tooling Inventory (Stage 0)

### npm Scripts
- `dev` – starts the local Vite development server.
- `build` – builds the site and runs `ensure-three-bundled` and `sanitize-bare-import-text` post-build checks.
- `preview` – serves the production build with strict port usage.
- `typecheck` – runs `tsc` against `tsconfig.json` and now fails the pipeline when type errors are present.
- `generate:favicon` – regenerates favicon assets.
- `download:aristotle` – fetches the Aristotle tomb asset bundle.
- `download:draco` – retrieves the Draco decoder bundle.
- `postinstall` – downloads the Draco decoder and regenerates the favicon.

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
