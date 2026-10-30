# Hoplite v04 shield-carry integration

Daniel's downloaded Hoplite_Player_v04.glb is now the complete player rig and animation source. SHA256: 03113e5c4c9e1716a06a365115ee5f9338b49348ee71e447cc3afb26681aaa15. Size 2,393,888 bytes, 60,785 triangles, 13 materials, one skin, bundled Idle_Breathe/Walk/Run clips. Asset audit confirms a changed left-arm rest pose versus v03. No v03 clip reuse, retargeting or additional shield transform was introduced.

The existing PlayerSystem is the only loader owner; its first candidate and asset-specific fitting check now point at hoplite-v04.glb. Body-only 1.8 m fitting, foot offset, existing Character animation mapping/crossfades, controller/camera/physics and Myrto/legacy/capsule fallbacks are unchanged. v03 remains on disk for recoverability and already-open tabs. Backup: task/hoplite-v04-backup/PlayerSystem.js. The Parthenon and ship source work is untouched.

Focused acceptance passes:

- Actual response bytes match v04's hash, with no v03 asset requested in the new session.
- Body height/feet alignment, skinned walk deformation and actual W/Shift transitions select Walk, Run and Idle_Breathe while grounded.
- Existing Agora E/Escape interaction, activity/reward/quest continuity, reload persistence and missing-v04 fallback to Myrto pass. Temporary test browser/server exit normally.
- Existing controller passes the 8.53-degree slope and clear two-metre passage with v04; capsule radius stays 0.35 m. Equipment remains visual and can clip extremely close walls.
- Native in-app browser tab 5 loaded v04 with normal materials/postprocessing (no automation-preview conversion). Idle was inspected front-on and from the shield side. Native W and Shift+W were held through seven actual movement frames; both remained grounded, selecting Walk and Run respectively, moving approximately 1.00 m and 1.69 m in these bounded checks. These are functional observations, not FPS measurements. The sampled carry poses were inspected using normal camera orbit/zoom. The nearby yellow cylinder is a separate world mesh, not a detached part of the player. Only the newly created review tab was closed; the original public tab was untouched. All test-only state adjustments were discarded with that tab.
- Typecheck passes. Production build and exact served GLB/bundle hashes are recorded separately. Prior content-hashed assets are retained so existing user tabs keep resolving their original imports.

No combat or dedicated jump animation is supplied. No combat mechanics, shield collision, save migration or settings change was added. No routine benchmarks or broad suites. No public deployment has been performed. Existing apps, tabs, servers, settings and work were preserved.

Evidence: hoplite-v04-asset-audit.json, hoplite-v04-smoke.json, hoplite-v04-slope-check.json, hoplite-v04-build.json and hoplite-v04-served.json. Headless in-game captures use the automation presentation; native carry inspection is separately recorded above. Native raw-CDP key injection was unsupported, so actual input used the documented browser keypress API instead. No denied action was bypassed.

Future Parthenon reference supplied by Daniel: https://www.britishmuseum.org/blog/introduction-parthenon-and-its-sculptures returned HTTP 403 in the web tool. Its content has not been reviewed; do not claim otherwise. The existing YSMA/Acropolis Museum assessment remains authoritative pending access. No Parthenon modifications were made during this character pass.
