# Final Acceptance Checklist

- [x] Harbor sits at sea level and no buildings intersect the water; hill-city placement enforces a minimum height above the sea and avoids the harbor exclusion zone.
- [x] Building lots sample nearby terrain heights, reject steep slopes, and align footprints to the ground plane to prevent sinking.
- [x] The primary road ascends from the harbor through the agora to the acropolis using a single Catmull-Rom curve ribbon.
- [x] Agora and acropolis plazas are implemented as circular terraces with decorative instances.
- [x] Hill-city structures orient toward the main road, or downhill toward the harbor when distant, and preserve view corridors between the agora and harbor.
- [x] The environment collider is rebuilt once after static city elements are in place, ensuring buildings block the player. This wiring now lives in `src/main.ts` and `src/main.runtime.js`.
- [x] `npm run typecheck` completes successfully for the current mixed TS/JS codebase.
- [x] `npm run verify` builds the site, launches a preview server, and confirms the app loads successfully at the GitHub Pages base path.
