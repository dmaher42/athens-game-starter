# Olive Court residential street pass

## Playable result

Follow the existing winding northern lane from Olive Court towards North Garden. Two retained houses now have clear small forecourts: a linen-shaded sitting yard at approximately (-117.42,156.85), and a herb-drying yard on the opposite side farther north at (-95.31,173.36). Low walls enclose each yard while a 2.1 metre opening aligns with the original doorway. Doors, shutters, repair patches and house geometry are reused; no new houses or streets were generated.

The sitting yard has a bench and a light cloth shade. The drying yard has five hanging herb bundles, a rack and folded linen. Small physical notices support E inspection without floating title boards. These two homes remain private scenery; the established enterable household in Olive Court remains the welcoming interior and keeps its saved activity.

The existing Garden keeper now walks from the garden along the canonical lane, enters the drying yard through its gate, pauses to check the bundles and returns. E conversation reflects the current duty. This replaces the keeper's former tiny local loop; the city still has seventeen existing NPC updaters. It uses the established waypoint/hold/conversation lifecycle, not a new citizen manager. There is no bespoke gardening animation, herb harvesting, reward or economy mechanic. NPC work phase resets with world reload as existing ambient routines do; existing saved quest/activity progress is unaffected.

## Authoritative ownership

- neighbourhoodLayout.js identifies the two existing olive-garden frontages and derives their forecourt points. It adds metadata, not another house-placement system.
- residentialFacades.js exports the shared doorway-offset helper used by the existing doors and the new gate/routine data. Door placement and gates therefore have one convention.
- residentialStreetPocket.js builds sampled low walls and bounded household details as children of the original buildings. The existing collider/interactor/batcher own their lifecycle. Purposeful small herb pieces are excluded from overlap cleanup, which otherwise removed them as redundant clutter.
- cityDailyRoutines.js defines the keeper's route using the existing tested olive-garden curve and explicit final gate turns. Application.ts assigns it only to the existing garden resident, preserving count, model, label and other residents/activities.
- cityGroundSurface.js v8 adds small feathered doorstep wear using the same forecourt data and existing terrain atlas. No new ground geometry, material plane or height sampler.

Complete pre-stage source snapshot: task/residential-street-backup/src. No save migration, irreversible purge, external asset or installation.

## Verification

Five focused existing layout/prefab/daily-round/shared-surface checks and production typecheck pass. Actual player-controller walking passes the affected Olive Court–garden lane, entry/inspection/exit at both forecourts, and the keeper's entire outward/return route with grounding assertions intact. The first proposed keeper shortcut hit a garden cypress; it was corrected to use the established lane rather than remove the tree or weaken checks.

The existing keeper reaches both garden and drying-rack duties through its actual updater. Both notice E interactions pass. The seeded complete trireme, Socrates, Agora, theatre, household and reward records stay byte-for-byte unchanged, with seventeen NPC updaters and one terrain. Native actual E at the working keeper shows the new dialogue; the final bench-mounted notice is also accessible. Normal native views inspect both house fronts, hanging bundles, keeper and the connected lane. No console errors.

A final camera-view CDP command timed out after executing; its outcome was reconciled by observing the resulting lane screenshot and reading back unchanged saves/seventeen NPCs. It was not repeated blindly. The preview HTTP check also returned slowly, but completed with the matching receipt below. No remaining uncertain operation from either.

Production build passes. Existing preview http://127.0.0.1:4177/athens-game-starter/ serves /athens-game-starter/assets/index-D_iNGIr8.js, HTTP 200/200, SHA256 4850d735011bd599e97c90c994357f1bfaad8148d423b8989f20e217f15b2da6, matching disk. Thirty previous hashed assets retained for already-open sessions. No persistent-server restart or public deployment. No broad suite or routine FPS benchmark was run.

Evidence: task/residential-street-check.json, residential-native-verification.json, residential-street-build.json, residential-street-served.json, residential-native-keeper-working.png, residential-native-keeper-dialogue.png and residential-native-lane.png. Local screenshots were inspected; no Library upload performed.

This completes a bounded residential street pass. It does not make every house enterable or simulate all households. Existing harbour, trireme, Parthenon, theatre, Agora, field walk and household activities remain with their existing owners.
