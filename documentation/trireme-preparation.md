# Ready the ship — crew and preparation

Board the existing trireme from its harbour interaction. On the stern deck, approach Captain Nikandros and press E. Begin preparation, secure the existing stern water jar, check the port sail fittings or speak to deckhand Damon, then agree the stroke at the lower rowing marker or with Lysias on the starboard gallery. Return to the captain to report readiness. Visible lashings and a pale stern signal mark the result. Prepare again resets this activity only. Escape closes the preparation panel first; outside it, Escape or Return to Athens leaves the ship.

Three people reuse the existing citizen/waypoint animation owner: stationary captain, tending/walking deckhand and walking/stationed stroke caller. Nearby work exchanges are captioned, not voiced audio. A lightweight illustrative distant harbour backdrop adds context; it is not another explorable city or an exact archaeological port model. Crew are nonblocking interaction characters, not a rowing/physics simulation. All 170 rowing places, preferred hull/sails/deck, mast bay, stairs and physical support geometry are unchanged. No new Blender assets or downloads.

## Ownership
- state/TriremePreparation.js stores validated task flags via the existing QuestManager activity record trireme-ready-the-ship. It never takes the city's active quest, creates a currency or grants repeat rewards.
- world/triremePreparation.js owns only the local crew, three preparation contacts, panel and visible readiness props. Existing sail/rowing cues and water jar are reused. Its update runs inside triremeVisit.update; no timer/render loop or whole-scene frame scan is added.
- triremeScene mounts/disposes that controller. Crew nodes are detached before disposing visit geometry because their cached materials/geometry belong to the existing citizen system and must survive return to the city. The visit's own new props are disposed normally.
- triremeVisit still suspends city updates/render/audio and restores exact player/camera/collider state. It passes the existing QuestManager, exposes preparation in its snapshot and closes the local panel before handling Escape as a return request.

Recoverable original Application/triremeScene/triremeVisit copies: executor task/trireme-crew-backup. City planning stage1, Parthenon, hoplite and mast fix remain intact.

## Verification
Three targeted CPU regressions pass: ordering/repeated completion and protected quest/reward ownership; save reconstruction/resume/reset; clearly labelled session-only fallback. Focused real-input browser flow passes actual E boarding and all task contacts, disabled premature report, movement held while panel open (within 1 cm capsule settling), keyboard focus, readiness props, moving crew, leave/reboard resume, UI reset, actual page reload and protected other saves. It also passes upper circuit, both rowing stairs, both mast bypass sides/directions, original rowing information, city suspension and exact return against the latest boarding point. No page errors.

Native normal rendering inspected crew, captain and readable panel, including real E, Escape-to-close and Return to Athens. Isolated overview/ship renders also inspected. No routine performance test or FPS claim. Typecheck and production build passed; 14 prior hashed assets retained for already-open tabs.

## Availability and limits
Local preview: http://127.0.0.1:4177/athens-game-starter/
Entry: /athens-game-starter/assets/index-B5QgPgmM.js
SHA256: 072f3fd2549f210330c4edcc4e1a884db4a5c162833c142e58d638c9c2498552
HTTP index and asset 200; hash matches disk. Dynamic ship chunk: triremeScene-hhhNFn8i.js. No public deployment or persistent-server restart.

This is a completed moored preparation slice. There is no departure/sea passage, navigation, combat, Sparta or Egypt destination yet. The separate departure scene is deferred rather than represented by a cosmetic moving background. Existing city remains resident but suspended, as before. Broader Agora relocation and neighbourhood rebuilding remain authorised, unfinished follow-on stages in city-planning-stage1.md.

Final cleanup: standard single-iteration web-game client stalled without artifacts and was cancelled (owned session33698 exited1); it is not a passing check. Focused full flow, CPU, native rendering, build and served-hash checks passed. Owned temporary server20772/session86275 closed; user preview4177 untouched. No benchmark. Next: coordinated Agora relocation and neighbourhoods remain authorised; no departure scene exists yet.
