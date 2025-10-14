# Missing Asset Upload Checklist

The runtime references several 3D models and texture sets that are not currently present in `public/` (and therefore also absent from the mirrored `docs/` directory). Uploading the files below will remove console warnings and unlock the scripted landmark placements.

## Landmark GLBs (src/config/athensLayoutConfig.js)

| Expected location | Landmark / usage |
| --- | --- |
| `public/models/landmarks/erechtheion.glb` | Erechtheion on the Acropolis plateau. |
| `public/models/landmarks/temple_athena_nike.glb` | Temple of Athena Nike overlooking the Propylaea. |
| `public/models/landmarks/propylaea.glb` | Propylaea gateway at the Acropolis entrance. |
| `public/models/landmarks/brauronia.glb` | Sanctuary of Artemis Brauronia along the south flank. |
| `public/models/landmarks/athena_promachos.glb` | Athena Promachos statue near the Acropolis summit. |
| `public/models/landmarks/theatre_dionysus.glb` | Theatre of Dionysus on the southern slope. |
| `public/models/landmarks/odeon_herodes_atticus.glb` | Odeon of Herodes Atticus amphitheatre. |
| `public/models/landmarks/asclepieion.glb` | Sanctuary of Asclepius healing complex. |
| `public/models/landmarks/stoa_eumenes.glb` | Stoa of Eumenes connecting the slope venues. |
| `public/models/landmarks/temple_hephaestus.glb` | Temple of Hephaestus bordering the Agora. |
| `public/models/landmarks/stoa_attalos.glb` | Stoa of Attalos along the Agora. |
| `public/models/landmarks/bouleuterion.glb` | Bouleuterion council house. |
| `public/models/landmarks/tholos.glb` | Tholos headquarters of the prytaneis. |
| `public/models/landmarks/eponymous_heroes.glb` | Monument of the Eponymous Heroes. |
| `public/models/landmarks/royal_stoa.glb` | Royal Stoa law court. |
| `public/models/landmarks/harbor_lighthouse.glb` | Harbor lighthouse guiding ships past the breakwater. |
| `public/models/landmarks/pharos_lighthouse.glb` | Alternate lighthouse mesh compatible with the harbor beacon placement. |
| `public/models/landmarks/harbor_clocktower.glb` | Harbor chapel & clocktower overlooking departures. |
| `public/models/landmarks/harbor_chapel.glb` | Alternate chapel mesh for the waterfront bell tower placement. |
| `public/models/landmarks/harbor_plaza_statue.glb` | Harbor plaza statue celebrating sailors and merchants. |
| `public/models/landmarks/plaza_hero_statue.glb` | Alternate hero statue usable at the harbor plaza placement. |
| `public/models/landmarks/pier_warehouse_row.glb` | Row of warehouses lining the harbor pier. |
| `public/models/landmarks/harbor_warehouse_row.glb` | Alternate warehouse row mesh compatible with the pier placement. |
| `public/models/landmarks/temple_olympian_zeus.glb` | Temple of Olympian Zeus southeast of the Acropolis. |
| `public/models/landmarks/panathenaic_stadium.glb` | Panathenaic Stadium athletics venue. |
| `public/models/landmarks/academy_plato.glb` | Academy of Plato grove. |
| `public/models/landmarks/kerameikos.glb` | Kerameikos & Dipylon Gate district. |
| `public/models/landmarks/monument.glb` | Monument prefab used by the procedural building spawner. |

> ℹ️ The Aristotle tomb GLB bundled in the repo is misspelled as `aristotle_tome.glb`. Rename it to `public/models/landmarks/aristotle_tomb.glb` (and mirror under `docs/`) so the loader finds it via the standard candidate list in `src/main.js`.

## Building, Harbor, and Prop Prefabs (src/world/buildingSpawner.js)

| Expected location | Procedural prefab |
| --- | --- |
| `public/models/buildings/Akropol.glb` | Parthenon shell fallback for plateau monuments. |
| `public/models/buildings/aristotle_tomb.glb` | Legacy building version of Aristotle's Tomb. |
| `public/models/buildings/poseidon_temple.glb` | Poseidon temple shell used by fallback logic. |
| `public/models/buildings/poseidon_temple_at_sounion_greece.glb` | Alternate Poseidon temple mesh referenced by fallbacks. |
| `public/models/buildings/shop.glb` | Shop prefab for Agora stalls. |
| `public/models/buildings/workshop.glb` | Workshop prefab for artisan districts. |
| `public/models/buildings/warehouse.glb` | Warehouse prefab for harbor districts. |
| `public/models/harbor/pier.glb` | Harbor pier model for waterfront lots. |
| `public/models/props/fountain.glb` | Fountain used by monument prefabs. |
| `public/models/props/market_stall.glb` | Market stall prop for Agora pads. |
| `public/models/props/plaza.glb` | Plaza prop for civic pads. |

## Texture Sets

| Directory | Expected contents |
| --- | --- |
| `public/textures/aristotle_tomb/` | PBR textures (`basecolor`, `normal`, `roughness`, `ao`) consumed by `makeMarblePBR` in `src/features/aristotle-texture.js`. |
| `public/textures/gravel/` | PBR textures (`basecolor`, `normal`, `roughness`, `ao`) required by `makeTiledPBR` in `src/features/roads-gravel.js` for road materials. |

Ensure every uploaded asset is duplicated under `docs/` so the GitHub Pages build can serve identical files.
