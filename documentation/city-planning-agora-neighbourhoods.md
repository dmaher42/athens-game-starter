# Northwest Agora and connected neighbourhoods

This is the second recoverable city-planning stage, following the irregular Acropolis ridge and southern theatre. It is an authored, compressed Hellenistic-inspired Athens, not a surveyed reconstruction. Piraeus remains a compressed harbour district.

## Purpose and placement

- The Agora is the civic and commercial centre northwest of the sacred hill, centred at (-105,36). Its 44 by 28 metre open square is deliberately retained. Covered food, pottery and gathering frontages, goods, speakers and the existing A Place at the Table activity move together.
- The council porch faces the market from its east edge, at (-74,52). Socrates moves with the civic ensemble to (-122,43); his dialogue and saved encounter identity stay intact. His presence is the already-documented creative blend of periods.
- Potters' Court moves to (-165,66), on the western craft approach. Its workbench, resident, goods and optional work interaction derive from that court. The pottery-to-home lane leaves through the clear east entrance, avoiding the existing workbench.
- Trading Court moves to (-20,135), as the eastern neighbourhood destination. Its western stall sits in the northwest pocket rather than blocking the incoming lane.
- Olive Court, its enterable home at (-72,143), Weavers' Yard and North Garden retain their authored anchors. Six existing anonymous houses form the residential collector between the market and Olive Court. No new crowd or house generator is introduced.

## Authoritative owners

- src/world/cityCivicLayout.js owns the Agora anchor, offsets and common civic grading bounds. locations.js, terrain.js and the ground appearance atlas consume it.
- src/world/neighbourhoodLayout.js owns the five neighbourhoods, the existing nineteen street identities, market frontages, court furnishings and anonymous-infill consolidation. Street reservations now include the side lanes as well as the primary roads.
- src/world/cityPlan.js renders those contracts, existing frontages, court details and the household. Existing NPC, workshop and activity owners consume the resulting stations; they are not recreated in parallel.
- src/world/cityMapData.js derives labels, destinations and route curves from those same owners. No separate minimap coordinates were authored.
- src/world/acropolisLayout.js owns the coordinated sacred approach and western bypass. The initial bends now start at the relocated market; the gateway, temple and theatre anchors are preserved.
- src/materials/cityGroundSurface.js v6 moves civic wear with the market. Existing terrain and terrain-following road/court surfaces remain the only ground/support owners.

## Reversible cleanup

The complete pre-stage src tree is in task/agora-relocation-backup/src. Old anonymous grid plaza cells no longer render detached unexplained squares; the named Agora and neighbourhood courts remain. The anonymous building policy keeps infill near actual streets. Two measured overlapping anonymous lots (-4:4 and -5:3) are retired, alongside the previously retired -2:0. Two old ad hoc connector lots/walls are retired in favour of the canonical relocated street/court frontages. These changes do not remove named activities or alter activity, reward or save identifiers.

## Harbour junction correction

The existing twelve approach treads were positioned 0.15 metres above their intended top heights. Corrected the original tread placement and extended only the first tread one metre landward to meet the street. No second ramp, ground plane or water system was added. The final tread meets the original boardwalk datum. The walking check retains grounded/no-flight assertions after allowing a physical stair descent to settle; it does not demand grounding during the normal brief fall between descending steps.

## Scope and limits

No public deployment, settings changes, extra NPC count, external assets or routine performance benchmarks. City population remains seventeen existing updater-owned citizens; their established work rounds and conversations are reused. Existing trireme preparation remains moored, without a departure or distant-destination feature. This stage does not claim every possible off-route location was inspected.

## Historical design basis

ASCSA describes the Agora's mixed civic/commercial role: https://www.ascsa.edu.gr/excavations/athenian-agora/about-the-excavations . Theatre placement/period caveats remain in documentation/city-planning-stage1.md. The civic layout is a game design informed by those relationships, not a measured archaeological plan.

## Final local acceptance

Production typecheck and build pass. Existing preview http://127.0.0.1:4177/athens-game-starter/ serves /athens-game-starter/assets/index-Bf2Vef4Q.js, HTTP 200/200; SHA256 e2ff71661307edc3cffb22b7f98792684cf5fb80821e13f60bffa240e6d01f34 matches the production file. Eighteen previous hashed assets were retained for already-open tabs. No preview restart or public deployment.

All fourteen changed street routes passed actual capsule walking across the focused route runs. After fixing demonstrated workbench, column and stall conflicts, the final affected lanes passed without changing collision or grounding assertions. Both directions of the harbour stairs and courtyard-home entry/interior/exit passed. Six moved anonymous buildings materialised with no overlapping retained anonymous footprints. Five CPU layout/prefab/daily-life/surface checks pass. Existing four work rounds advance; Water carrier actual E passed. The seeded complete activity/reward record is unchanged by traversal.

Actual E/UI A Place at the Table playthrough passed both outcomes, informing/inspecting, changed plan, borrowed ware, packing, pause/resume, reload, delivery, outcome replacement, one-time reward, reactions and replay/reset. Existing harbour activity ownership and other saved activity records remain protected. Native Socrates E conversation at the new location passed. Native harbour approach, board-button entry and exact return (zero position error; identical activity records) passed; the existing ship was inspected with its original camera updater restored after the camera-only review fixture.

Normal native noon views inspected the market overview/player-height view, both gathering arrangements, pottery entrance, home and Trading Court. The gathering appearances were selected in a temporary visual fixture without saving; the complete real UI outcome/reward flow passed separately. Generic civic prefab marble maps caused the confirmed white/black speckling. The existing generic material factory now uses quiet shared mineral grain and matte limestone. Parthenon hero material ownership remains separate. Ground shader v6 has a modest warmer mineral tint; route wear follows the canonical relocated streets. No geometry, collision or NPC count added by these material changes.

Evidence in task: agora-relocation-walk-first-eleven.json, agora-relocation-walk-market-lanes.json, agora-relocation-walk-final.json, agora-relocation-activity-result.json, agora-relocation-native-integration.json, agora-relocation-build.json, agora-relocation-served.json and agora-relocation-source-changes.json. Local native screenshots have agora-relocation-native-* names. No Library upload was performed.

Coverage is focused on the changed areas, not an exhaustive world audit or new FPS claim. Broad full suites and routine benchmarks were intentionally not run. The more distant settlement and simple stylised citizens remain future polish opportunities; this acceptance does not imply a citywide life simulation. The visible former market site is a harbour road arrival, not a duplicated civic cast.
