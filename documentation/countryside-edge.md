# Northern residential-to-countryside transition

## What changed

North Garden remains at (-85,210), with its keeper, reward and existing links to Olive Court and Trading Court. Its two anonymous north-row frontages are omitted, leaving three side frontages and a clear opening towards the working land. The enterable home and all activity/save identifiers stay unchanged.

A narrow worn walk leads north from the garden, passes beside an olive grove and enters a small cereal plot through an open wall gap. It ends in a clear central passage, with planted rows on either side and a safe return. The plot is approximately 46 by 35 metres, irregular rather than another rectangular paving pad. Six olive trees, existing foliage assets, and low sampled stone walls make a modest rural edge. No new arbitrary houses, city district generator or ground mesh was added.

Follow North Garden on the map, then the path towards **Field walk**. At the field entrance press E beside **GARDEN AND FIELD WALK** for a brief explanation relating local plots to the grain arriving by harbour. This is optional environmental context, not a harvesting/economy quest. No reward, inventory, currency, NPC or save system was added. The landscape is an authored compressed Hellenistic-inspired setting, not an exact reconstruction of agriculture or coastline.

## Ownership

- src/world/countrysideLayout.js owns the plot, grove, field-wall gaps, crop rows, trail and reserved anonymous-infill area.
- src/world/countrysideEdge.js builds static details through the existing city group, terrain sampler, collision and interactor lifecycle. Walls use the normal city batcher; crops remain two instanced meshes. Only the six new trees' eighteen small trunk segments opt out of distance detail culling to remain visible with their crowns; global settings are unchanged.
- src/world/neighbourhoodLayout.js keeps the existing nineteen streets and named court anchors, protects field/grove space from anonymous infill and opens the northern garden row. The keeper's existing conversation mentions the rural walk.
- src/materials/cityGroundSurface.js v7 paints restrained cultivation and path wear in the same existing terrain atlas. No support height or second field surface is introduced.
- src/world/cityMapData.js derives the new trail and short destination label from the same data, not separately maintained map coordinates.

The complete pre-stage src snapshot is task/countryside-edge-backup/src. No irreversible purge or save migration occurred.

## Demonstrated rendering correction

Native inspection found the old poolMaterialsAndMerge function baked an InstancedMesh's base geometry without its instances. It now preserves instanced and skinned meshes for their existing renderer. The focused verification/countryside-instancing.test.mjs confirms instance count, per-instance transform, parent/world transform, bounds and noCollision survive while ordinary walls still merge with their shadow policy. The same safeguard already existed in a different static batching helper; the active city batcher now handles this correctly too.

Final crop budget: 900 stems plus 900 ears, two instanced draw meshes and 21,600 crop triangles, with no update callback, dynamic light or physics crop body. There are six shared-template olive trees and 79 short ordinary wall segments, merged by existing batching. These are geometry counts, not an FPS measurement or a claim that the whole addition costs only two draws.

## Focused verification

- Five existing neighbourhood/prefab/daily-round/shared-surface CPU checks pass.
- The new instancing regression passes with its portable repository imports.
- Actual capsule traversal passes Olive Court to North Garden, Garden to Trading Court, field walk and return; grounding/no-flight assertions retained.
- Actual E opens the field explanation; the seeded trireme, Socrates, Agora, theatre, household and reward records remain byte-for-byte unchanged. There are still seventeen existing city NPC updaters, one field root and one terrain.
- After the final denser crop arrangement, native actual-controller passage through the field entrance passes both directions, grounded, with identical saved records and both 900-instance meshes present.
- Normal native noon views inspected the field at walking height, grove grounding/trunks, garden opening and wide transition. Final native view confirms eighteen grove trunk segments remain visible at garden distance; no console errors. Camera-only inspection overrides existed only in owned temporary tabs and were discarded when those tabs closed.
- Production typecheck and final build pass. Existing preview http://127.0.0.1:4177/athens-game-starter/ serves /athens-game-starter/assets/index-BBntyWu6.js, HTTP 200/200, SHA256 aa1091a305715fbe5b84b0286d4bd2c85f0c8bf8520304b3cbce0d1c9ac2808b, matching disk. Twenty-six earlier hashed assets were retained for open sessions. No persistent-server restart or public deployment.

Evidence in task: countryside-edge-walk.json; countryside-final-native-gate.json; countryside-edge-build.json; countryside-edge-served.json; countryside-native-delivery.png; countryside-native-field-final.png; countryside-native-grove-final.png. The final delivery image includes the shorter Field walk map label and completed grove silhouette. No Library upload was performed.

No routine benchmarks, broad regression campaign, external assets or software installation. Existing harbour, ships, Parthenon, theatre, Agora and household gameplay were preserved rather than reimplemented. This is a completed northern-edge polish stage, not a complete countryside simulator; wider coastal/background transitions remain possible future work.

