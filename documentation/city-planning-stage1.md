# Athens city-planning rebuild — first stage

Design frame: an Athens-inspired Hellenistic city, approximately 150–140 BC, with the current world scale compressed. +X is east, +Z north. Piraeus remains an explicitly compressed coastal district; it is not geographically adjacent to the Acropolis in real Athens. Reference imagery informs composition, not archaeological measurement or asset reuse.

## Whole-city plan
1. One irregular east–west sacred ridge, with the existing western gateway and sanctuary sequence. Preserve the Parthenon interior and smaller shrines as a coherent summit group. Exposed limestone flanks should contrast with retained architectural terraces.
2. Theatre of Dionysos beneath the southern flank, its seating rising north towards the hill and skene south. A connected craft/approach route supplies its rehearsal. Avoid Roman orchestra alterations or the later Odeon of Herodes Atticus in this Hellenistic setting.
3. Civic/commercial Agora northwest of the ridge, connected to the west ascent by a legible processional route. The current Agora is northeast; relocation must move its open court, stoas, actors, commission and Socrates together. This is planned, not claimed implemented in stage one.
4. Irregular residential blocks and shared courts north and west of the civic area; craft streets on their accessible edges. Retain the enterable household, daily rounds and serving/storage links. Reuse or remove anonymous lots rather than add another grid.
5. A separate readable harbour road, transitioning through storehouses/working courts. Keep ship boarding, activities and the repaired trireme mast bay. Countryside should emerge through fewer buildings, garden plots and paths rather than a hard rectangular city boundary.

## First stage implemented
- Replaced the rectangular sanctuary perimeter with an irregular ridge outline in acropolisLayout.js. The same polygon drives retaining walls, the original terrain height field, reservations and surface atlas. No extra ground mesh or height sampler.
- Added restrained rocky flank variation to the existing terrain profile and slope-aware limestone colour to its existing shader, preserving inherited shader hooks.
- Moved theatre orchestra from (-24,-150) to (-70,-147), beneath the ridge's southern flank. Existing seats, stage, rehearsal cues, performers, map and reservations derive from the same layout. Shortened/rerouted its existing western approach; no duplicate theatre or new quest state.
- Gateway, temple, Agora, home and harbour anchors intentionally unchanged in this stage. Future stages handle their wider relationship coherently, not independent hardcoded shifts.

Recoverable full source snapshot: executor task/planner-stage1-backup/src, plus package/progress/architecture files. No Git reset, permanent deletion or user save migration. Verification and build receipt will be appended after completion.

## Research basis and uncertainty
- ASCSA, About the Excavations: Agora as the centre of civic activity, not just one market building: https://www.ascsa.edu.gr/excavations/athenian-agora/about-the-excavations
- Acropolis Museum, Sanctuary and Theatre of Dionysos: theatre above the sanctuary; original drama context: https://www.theacropolismuseum.gr/en/sanctuaries/sanctuary-and-theatre-dionysos
- DIAZOMA, Dr Konstantinos Boletis, Ephorate of Antiquities: fourth-century all-stone radial cavea largely retained in Hellenistic times; skene rebuilt; later Roman interventions are distinct: https://diazoma.gr/en/theaters/theatre-of-dionysos/
This is a creative compressed layout; ridge outline, exact theatre dimensions and activity dialogue are authored, not a surveyed reconstruction. The supplied inspiration image itself was not materialized in this stage because its file identifier was not provided in the latest brief.

## Coordinated next stages
- Move the Agora as one functional ensemble towards approximately (-105,36), northwest of the sacred ridge. Rework its footprint against the existing western ascent before finalizing coordinates. Move/repurpose Potters' Court towards the western craft edge, approximately (-165,60), rather than overlap it with the market. Old Agora ground should become a smaller harbour-road junction, not a duplicate market and activity cast.
- Refit anonymous housing around those two destinations with short narrow lanes, shared courts and readable entrances, keeping Olive Court's enterable home and save identity. Retain the northern garden as the countryside transition. Avoid another evenly spaced city-wide grid.
- Reassess the harbour connector after the civic move. Keep harbour gameplay in place and explicitly retain the compressed geography, rather than pretend the real kilometres between Athens and Piraeus fit inside this map.
- Later increase the visual separation between natural rock and built terraces, reviewing each route and gateway datum together before any height change. Current plateau height remains deliberately unchanged in this first stage.

## Targeted validation so far
Actual controller passed sacred ascent, dedication access/E, western city-to-workshop route and revised theatre path. A workshop-edge obstruction from the first revised bend was resolved by keeping the existing first approach segment. The theatre entry check now walks farther into the parodos to remain within the unchanged 3.5 m interaction range; E opens the panel. Agora food inspection also remains accessible. Saved Agora, theatre, household and reward records are unchanged; there is exactly one terrain. Two new CPU regressions pass for irregular outline, protected anchors, southern theatre placement and map/path ownership. Final native attachment is unavailable; an earlier native aerial was inspected, and final isolated screenshots are pending. No routine performance test.

## Final local delivery
Production typecheck and build passed (exit0). Existing preview http://127.0.0.1:4177/athens-game-starter/ serves /athens-game-starter/assets/index-BazSpqs-.js; index and asset HTTP200, SHA256 616390d143b8bd345b28b27a13b472fff2b50032d817e54ffd00fba9591844ce, matching disk. Twelve previous hashed assets retained. No public deployment or persistent-server restart.
The final focused browser run passed theatre access, physical entry into interaction range, actual E rehearsal revisit, Agora food E and unchanged activity/reward records with one terrain and no page errors. Two CPU regressions passed. Earlier sacred ascent/dedication/western workshop route checks also passed.
Native south aerial inspected the new ridge/theatre relationship before the final cultural-slope reservation. Final native attachment failed; both isolated final-view attempts timed out at navigation, including explicit DOM readiness. No final images were produced. The last anonymous-infill removal and full near/player-level appearance therefore lack final rendered acceptance; do not claim comprehensive visual completion.
Only the positively identified temporary review server (PID23656/session30017) was stopped; isolated browser tests ran finally-close. The native review tab became unavailable to this session and later browser inventory was empty; no attempt was made to close ambiguous/user tabs. No user apps, servers or settings changed.
Next: restore reliable visual access to inspect the built ridge, cultural slope and theatre from player level. Then undertake the planned coordinated northwest Agora relocation and neighbourhood reorganisation; they are not implemented yet. Queued trireme crew/preparation work begins only after this city stage is safely accepted.

## Visual acceptance recovered
On the next continuation, the native browser successfully loaded the actual production preview4177 (same index-BazSpqs-.js build). Inspected normal-rendered south aerial, player-height western theatre approach and close southern ridge. Confirmed the final cultural-slope anonymous houses are absent, theatre/approach align, ridge/retaining edge is continuous and no rendering errors were reported. This supersedes the earlier final-visual blocker for these changed areas; it is not a claim that the entire future city rebuild is complete. A temporary camera-only inspection hook existed solely in the task-created tab10, which was closed afterwards, discarding it. No source or user-tab state was modified by that hook. Existing functional/typecheck/build/hash results remain applicable; no redundant test or benchmark run.
First city-planning stage is accepted locally. Next authorised work: queued trireme crew/voyage preparation, and subsequent coordinated Agora/neighbourhood stages in the master plan. No publication.
