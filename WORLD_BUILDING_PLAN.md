# First city-structure pass

Athens is Daniel's personal hobby world. Exploration, atmosphere and enjoyable movement lead; this is a compressed fictionalised city inspired by Greece, not a classroom/device requirement or exact historical map.

## Existing ownership

neighbourhoodLayout.js owns authored quarters, Agora frontages and all nineteen existing street control-point sets. cityPlan.js remains the sole city placement/street renderer. Terrain, harbour/water, landmarks, pickups, input, objectives and saves keep their existing owners. No extra ground, district renderer or per-frame system.

## Bounded changes

- Agora: preserve its 44 by 28m square at x[-52,-8],z[6,34], five existing stoas, exits and landmark views. Reposition the existing fountain/banner arrangement to the southwest and existing olive to the southeast to clear the demonstrated workshop exit obstruction.
- Workshops: west x[-145,-65],z[-95,70], joining Potters' Court and Weavers' Yard. Existing lots increasingly choose workshop/shop prefabs.
- Homes: x[-115,20],z[55,170], blending to the workshop streets through smooth spatial weights and the existing seeded prefab picker. Preserve courts, rewards and cross routes.
- Harbour to hill: retain the existing harbour-Agora and sacred approach curves/landmarks. Broad7m market approach gently narrows to6.4m;5m sacred way tapers to3.8m. Existing west residential corridor renders4.4->3.4m; back lanes3.2m. Original clearance reservations stay unchanged.
- No asset download is needed: existing orange-roof/plaster houses, workshops, stoas, vegetation and modest court props provide this first pass. Do not import whole packs or start citizen simulation.

## Budget and checks

Baseline on the same flat-terrain Node placement fixture:19 street ribbons,22,664 road triangles,185 eligible building lots. Preserve road count/centreline controls and lot reservations; add0 lights and0 NPCs/loops. Full city mesh/triangle budget may grow at most5%, preferably decrease. No new texture or external asset memory. Keep historical original snapshot in task/worldbuilding-baseline-sources.json.

Node checks cover exact route continuity and original endpoints, taper widths, clear Agora/precincts, deterministic blended recipes, existing mesh/collision paths and geometry budgets. Typecheck/build are allowed. Browser permission was explicitly resumed; completed checks and remaining performance/preview limits are recorded below. Preserve user apps,tabs,progress,settings and active servers; no publication.

## Verified district acceptance — 28 October 2026

38 Node tests, typecheck and the local production build passed. After explicit permission resumed isolated browser tests, all six production checks passed: smoke, actual-terrain neighbourhood walking (12,893 frames), harbour activity keyboard/reset/quest restoration, harbour boarding/return (2,593 frames), repeated scroll pickups (zero additional shader compiles), and water shoreline/reflection coverage (22,260 samples, zero mismatches). The smoke test retains seven neighbourhood links AND exactly nineteen canonical street IDs.

Normal-shader Agora, workshops, residential, sacred-near, distant-city and actual Night-profile images were inspected. The test camera was raised above a foreground workshop roof; the first supposed night phase .82 was Golden Hour, so the corrected test explicitly uses the existing Night profile. No product lighting change was made. PageUp zoom was exercised. No external assets were adopted. Harbour, terrain, water, movement, quests and the scroll fix remain unchanged by the two-module district pass.

### Native frame-pacing evidence and limits

All six native cases completed their fixed-distance outward/return routes without abort or browser errors, at1366x768 on Intel Arc, normal composer, phase.4. Source snapshots are c8f7226c before and62509892 after (149 modules, only cityPlan.js/neighbourhoodLayout.js differ).

| Route/run | Layout | FPS | p95 ms | p99 ms | Frames >100ms |
|---|---|---:|---:|---:|---:|
| district 1 | after | 25.89 | 99.9 | 183.3 | 57 |
| pier 1 | after | 19.26 | 173.7 | 283.5 | 33 |
| pier 2 | after | 38.04 | 50.7 | 133.3 | 10 |
| district 1 | before | 31.33 | 66.6 | 116.5 | 20 |
| pier 1 | before | 48.55 | 33.4 | 50.4 | 4 |
| pier 2 | before | 30.23 | 77.9 | 215.1 | 17 |

Pier pair1 had an extra agent-created fixture game tab open and is excluded from performance conclusions. That exact tab was subsequently identified by URL62760, closed under the test-resource permission and verified absent. Pair2 and residential cases still had substantial memory/paging pressure: measured available memory159–834MB, pages-input up to37,985/sec. The unchanged pier baseline varied48.55 to30.23FPS; results cannot establish a causal speed gain or regression. The updated residential run also had worse frame tails. Smooth/steady-play performance is NOT accepted or promised. No user apps were closed, no memory relief or settings changes performed. A quiet, sufficiently provisioned comparison is still required; any user-resource changes need explicit approval. See task/worldbuilding-final-report.json and worldbuilding-native-pressure.ndjson for raw evidence, routes, positions and hashes.

### Build, preview and cleanup

Local docs build remains index-DH8Ofxte.js, SHA256171c13fb777e646154d8ef302516582158a42676e483a0d0052fb7706c716ac2. Final preview read returned ECONNREFUSED on127.0.0.1:4177; process13152 and the listener are absent. This task did not stop that preview. Consequently the CURRENT served hash is unverified; the earlier disk/served match is historical evidence, not a current availability claim. No existing server was restarted or replaced.

All isolated headed test browsers closed in finally. Confirmed own fixture PID31476 ports62759/62760 was closed gracefully through its original stdin session after testing; no unrelated process was terminated. No publication/push/deployment. Functional/visual district checks are complete; current-preview restoration/hash and reliable performance acceptance remain the explicit blockers.


Preview restored at user request on2026-10-28T01:44UTC: documented Vite preview command on free127.0.0.1:4177, PID44528. HTTP200 and served/disk index-DH8Ofxte.js SHA256171c13fb777e646154d8ef302516582158a42676e483a0d0052fb7706c716ac2 match. Preserve this normal preview; it is not a disposable test fixture. No heavy benchmark launched: current available RAM1366-1402MB and paging up to7196/sec; previous isolated game launches needed roughly2GB additional headroom. Steady-play acceptance remains unresolved. No user resources stopped or settings changed.


## City consolidation - 29 October 2026
Actual generated world: anonymous infill133 ->35, with98 unserved lots reversibly retired and4 existing buildings turned/pulled toward their authored streets. All26 street frontages,19 court frontages,5 Agora frontages and unique landmarks remain. neighbourhoodLayout.js owns CITY_INFILL_CONSOLIDATION (38m maximum anonymous-infill street distance and four explicit lot moves); cityPlan.js applies it before batching/collision capture and records plan.infillConsolidation. Do not reintroduce a separate outer grid or remove authored activity buildings with this policy. Exact recoverable manifest: verification/fixtures/city-consolidation-2026-10-29.json; source backups and complete evidence: task/city-consolidation-completion.md. All four changed street routes passed real-controller grounded checks; existing activity/reward records preserved. Typecheck/build and2 focused regression files passed. Native residential/Trading Court views inspected. Map routes and destination anchors unchanged. No FPS benchmarks, new crowd/state systems or save migration.

## Practical court edges - 29 October 2026
Olive Court now has a household wash/drying edge at(-91.5,126); Trading Court has a stoa-aligned packing bench and loaded sled at(74.8,151). COURT_STREET_LIFE in neighbourhoodLayout.js owns transforms; cityPlan.js places them and queues two existing-interactor inspection targets. courtStreetLife.js is static shared geometry, not a new simulation/state manager. Existing trade stoas receive an optional shared limestone material through the original prefab API; other defaults are unchanged. Budget52 source meshes/2020 triangles before batching,0 new lights/NPCs/loops. Targeted approaches, repeated E, home-gate return and activity/reward preservation passed; native player-level views inspected; typecheck/build passed. Exact task evidence and recovery: street-life-completion.md. Keep remaining world work purposeful; do not restore unserved infill or claim these static details constitute animated daily life.

## Residential facades - 29 October 2026
Existing house/rowhouse prefabs now use3 stable variations, quieter shared128x128 plaster grain, timber shutters, offset/centred plank doors, jambs/lintels, low stone socles and selected repair/pot details. Actual city49 homes:16/23/10 across variants. residentialFacades.js is a static detail/material helper called by buildingSpawner.js, not another building placer. Original solid cores/footprints, one house RNG draw and zero rowhouse RNG draws are preserved. New facade details are non-colliding; courtyard-house interior remains separate/unchanged. Detail budget147-232triangles per style before normal batching,0 new lights/NPCs/update loops. Focused geometry/core/RNG/navigation/E/save checks, native representative views,typecheck/build passed. Final task checkpoint residential-facade-completion.md includes recovery source and limits. Regular houses remain closed scenery; do not advertise newly enterable rooms.
