# Trireme stage one acceptance

The original Olympias-inspired trireme is implemented in the existing ship pipeline. Board at the existing harbour trireme evidence marker: press E, then choose **Board the full-size trireme**. Explore the upper circuit and the two narrow rowing access bays. Return with the HUD button, stern E cue or Escape. No voyages or spacious cabins are implemented.

The isolated real-browser check passed actual E/button boarding, upper and lower traversal, exact city return, repeated entry/Escape, rejected module loading, cancelled loading and ignored late completion. Activity and reward records remained byte-for-byte unchanged. City frame count, NPC positions and daylight phase stayed frozen while ship frames advanced; only the ship scene was rendered. City assets stay resident in memory.

Two actual defects were corrected: stair crests needed exact wedge support and landings; the outward-facing hull shell needed a local double-sided timber material to display its interior. The latter adds no meshes or triangles. Final normal-material interior, bow and overview images were captured and inspected. Typecheck passed. Production build outcome is recorded separately.

Source owners: `src/world/triremeModel.js` owns geometry, dimensions and route contract; `triremeScene.js` owns the temporary scene, tight hull-waterline sea hole and existing interactor; `triremeVisit.js` owns reversible player/camera/physics/UI/audio transitions. Application's single frame callback skips city simulation and rendering aboard. No parallel quest/save/currency manager or persistent settings were added.

References: Hellenic Navy Olympias construction/history pages; user-supplied Osprey Athenian Trireme article and Wikipedia were reviewed. Osprey distinguishes a roughly 3.65 m hull beam from 5.45 m outriggers; this game uses a broader schematic hull and guarded walkways for traversal. The approximately 36.9 m length, 5.5 m gallery beam and 170 staggered rowing positions are inspired by Olympias, not an exact ancient plan. Warfare History Network returned HTTP 403; no claim of reviewing its text or the newly mentioned unattached image. No site assets were copied.

Evidence: `trireme-browser-check.json`, `trireme-model-check.json`, `trireme-water-check.json`, `trireme-final-visual.json`, and `trireme-final-{overview,interior,bow}.png` in this task workspace. No FPS or universal smoothness claim. Existing user tabs and servers were untouched. Publication must be independently verified before being described as live.
## Mast passage correction — 30 October 2026

The lower central aisle was 0.96 m wide, bounded by solid rails at x ±0.61 m. With the player's 0.35 m capsule radius, the solid central mast left no usable bypass. The original real-controller reproduction failed at x -0.235 while trying to reach x -0.78 beside the mast.

The existing crew floor is now one continuous polygon, flaring locally to a 2.8 m working bay and back to the narrow aisle. Existing rails follow that bay at ±1.3 m. Nearby lower-bank benches, footrests and their oars yield outward locally; all 170 rowing places remain. The mast and foremast remain solid and the upper decks, stairs, entry/return positions and scene/save ownership are unchanged. This is a gameplay accommodation in the existing Olympias-inspired interpretation, not a claim about an exact ancient mast-bay plan.

Verification: the new verification/trireme-mast.test.mjs exercises both bypass sides in both directions, upper circuit and both stair/bay returns, grounded at every route point. It also asserts the player cannot walk straight through the mast. The isolated browser test passed actual E boarding, all four mast traversals, rowing E interaction, upper/lower access, city suspension and exact return/save preservation with no browser errors. Native normal-material views were inspected both from the aisle and with the hoplite beside the mast. The standard short game-control client completed with screenshot/state and no error artifact; its software-rendered FPS is not a performance measurement. Production typecheck and build passed.

Local preview4177 returns HTTP200 and serves index-DTxpkHXP.js with SHA256 a10ce1535db483d88e8953185aeac4c78552b81a048c7970ffcd0d73c9405b8b, matching disk. The dynamic ship chunk is triremeScene-CPXqhVo2.js. No public deployment. Already-open game tabs retain their prior version until the user chooses to reload; previous hashed assets were preserved. No user server was restarted.

Source backup: executor task/trireme-mast-before.js. Focused evidence: task/trireme-mast-check.json, trireme-mast-browser.json, trireme-mast-served.json and inspected trireme-mast-passage.png. Temporary test resources only are cleaned up at completion.
