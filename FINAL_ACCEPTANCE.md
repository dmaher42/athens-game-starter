# Final Acceptance Checklist

- [x] Harbor sits at sea level and no buildings intersect the water; hill-city placement enforces a minimum height above the sea and avoids the harbor exclusion zone. 【F:src/world/locations.js†L10-L26】【F:src/world/city.js†L303-L343】
- [x] Building lots sample nearby terrain heights, reject steep slopes, and align footprints to the ground plane to prevent sinking. 【F:src/world/city.js†L44-L143】
- [x] The primary road ascends from the harbor through the agora to the acropolis using a single Catmull-Rom curve ribbon. 【F:src/world/roads_hillcity.js†L8-L61】
- [x] Agora and acropolis plazas are implemented as circular terraces with decorative instances. 【F:src/world/plazas.js†L4-L106】
- [x] Hill-city structures orient toward the main road (or downhill toward the harbor when distant) and preserve view corridors between the agora and harbor. 【F:src/world/city.js†L280-L467】
- [x] The environment collider is rebuilt once after static city elements (roads, plazas, hill city, civic fixtures) are in place, ensuring buildings block the player. 【F:src/main.js†L200-L313】
- [x] `npm run build` completes successfully. 【040dfa†L1-L10】
