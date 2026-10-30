# City layout and daily life pass — 30 October 2026

## Implemented
- Reused six existing anonymous residential lots along the north residential collector, fitting each frontage to its actual depth. No new house generator or terrain layer.
- Moved North Garden from (-85, 250) to (-85, 210); both existing neighbourhood links and the derived map follow the same canonical coordinates.
- Removed obsolete detached Agora grid paving from rendering, preserving the intentional civic opening and terrain support.
- Quieter packed-earth photographic material, subtle shared limestone flags and less harsh courtyard plaster. Existing terrain atlas and material shader hooks remain authoritative; no geometry overlay or height changes.
- Four additional citizens use the existing crowd, waypoint, interaction and city-update owners: water carrier (Agora fountain to northern homes), pottery courier (potters to Agora), storehouse porter (storehouse to east Agora) and quay watch (harbour approach). They walk, pause, carry appropriate goods where applicable and offer original contextual E dialogue. They pause with the city when aboard the trireme.

## Ownership and preservation
neighbourhoodLayout.js owns district positions, links and six source-lot relocations. cityPlan.js places the retained buildings and records oriented footprints. roads-gravel.js owns street/court materials; cityGroundSurface.js owns terrain colour variation. cityDailyRoutines.js supplies routes and dialogue to Application's existing npcUpdaters and interactor. No new save manager, timers, currency or economy.

Original source backups are in the executor task's city-polish-backup directory. Existing home coordinates, quest anchors, Parthenon, ship scenes, v04 hoplite and activity/reward IDs remain unchanged.

## Verified
- Five targeted CPU tests passed (routine cycles/holds, canonical neighbourhood links/lot IDs, shared opaque textures and existing neighbourhood/home coverage).
- Production typecheck and build passed. New entry index-Dg9V8qXB.js, SHA256 100af4e0b29e308bad070c27ae605da25e228b757068aab50c5852d1011dd923. Eight previous hashed assets retained for already-open tabs.
- Actual controller walking passed north residential collector, Olive–Garden, Garden–Traders and all four citizen routes, retaining grounding assertions. Six relocated houses materialise with no oriented footprint overlap with retained generic lots.
- Four routines visibly advance; actual E opens water-carrier dialogue. Existing Socrates/Agora/theatre/home records and reward receipt stay unchanged; hoplite, one Athena, household/harbour activities and two hull water masks remain mounted.
- Native normal rendering inspected at Agora, matching aerial viewpoint, residential street level and closer Garden. The earlier sprite-raycast error was produced by a diagnostic raycast, not the feature playthrough; focused browser run reported no page errors.

## Limits and remaining checks
This is selective consolidation, not a full historical city reconstruction. Outer areas remain sparse. Work rounds are authored local routines, not a simulated economy or persistent daily schedule. No new Blender assets were needed and no FPS claims are made.
The required standard web-game client was attempted but its localhost navigation was denied by the sandbox (ERR_NETWORK_ACCESS_DENIED); it is not a passing check. The shell HTTP/hash check for port 4177 likewise returned EACCES, so the rebuilt disk output is confirmed but final served identity is not. No public deployment was performed. User tabs and persistent servers were not restarted.
