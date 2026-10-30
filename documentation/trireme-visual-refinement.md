# Boardable trireme visual refinement

The original harbour trireme is preserved. Its smooth presentation-hull function is now exported for reuse; a source-normalisation check confirms the harbour factory is otherwise byte-for-byte unchanged. The boardable ship owns a private geometry clone so scene disposal cannot affect harbour geometry.

The boardable vessel now has a smoothly swept 3.65 m hull below its unchanged 5.5 m rowing gallery, curved gunwales/wales and stern ornament, a shaped bronze ram, bow eyes, gallery crossbeams and exposed hull ribs. Weathered timber, staggered deck joints, curved linen panels/hems, rigging lashings, coiled line, a water jar and spare canvas give it working-vessel detail. No new crowd, physics props, sailing or game systems. The existing entry, deck heights, stair support, collision proxies, markers and route contract are unchanged. Waterline exclusion derives from the new hull; water correctly remains below the outriggers outside the narrower body.

CPU route/water checks pass. Full isolated in-game check passes actual E/button entry with the hoplite, upper circuit, both rowing bays and stairs, rowing E, exact return, frozen city updates/rendering/audio, repeated visits, load rejection/cancellation and saved activity/reward continuity. Final overview/interior/bow images and actual in-game captures were inspected. No native-window or FPS claims. Typecheck and production build pass.

Static visual budget: 86 to 109 mesh objects, 2 to 4 line objects, 7 to 9 unique materials; geometry triangles 1,644 to 6,108, instance-expanded triangles 13,136 to 20,448. These are model counts, not measured renderer draw calls. One shared 256 x 128 RGBA timber texture adds 131,072 base bytes plus mipmaps, disposed once on scene return. Detail has no per-frame callbacks. Source backups remain in task/trireme-stage1-backup.

Evidence: trireme-browser-check.json, trireme-model-check.json, trireme-water-check.json, trireme-polish-budget.json; trireme-bow.png is the final in-game sail/rigging view. The normal-material standalone captures predate only the final linen seam refinement; the actual in-game final view includes it. No site assets copied. This remains an Olympias-inspired game interpretation with safety rails, not an exact archaeological reconstruction.

Local preview is verified separately in trireme-polish-served.json and next-perf-preview.json. No public deployment was attempted. Existing user preview/tabs/other servers were preserved.
