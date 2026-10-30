# Hoplite player v03

Daniel's latest downloaded `Hoplite_Player_v03.glb` is integrated through the existing `PlayerSystem` candidate list. SHA256: `08620456de08589a3a7bf5292b8e38c68ee3a2f593e603bd712ae21237dd1dfe`. The 2,393,912-byte asset has 60,785 triangles, 13 materials, one skin and Idle_Breathe, Walk and Run clips. Myrto, hero and capsule fallback assets remain available.

The body, excluding the tall spear, is fitted to the existing 1.8-metre capsule. Feet match the controller exactly at rest. The existing Character mapper handles Idle_Breathe/Walk/Run and crossfades; Jump uses Idle because no jump clip is supplied. No combat, equipment physics, save migration or new player manager was added. Source backup: task/hoplite-backup/PlayerSystem.js.

Focused isolated real-game checks pass: skinned deformation, actual W/Shift animation transitions, grounded movement, existing Agora E conversation/Escape, unchanged activity and reward records, reload preservation and blocked-hoplite-asset fallback to retained Myrto. The browser and temporary server exited normally. A deterministic real-controller 8.53-degree slope and two-metre clear-passage check passes. Shield/spear extend outside the unchanged collision capsule and may clip very close walls; no shield-blocking/combat behaviour is implied.

In-game front/back and interaction images were inspected. These use the game's automation preview presentation. Additional normal-material standalone front/back views were captured and inspected, confirming helmet, cloak, shield, spear, sandals and body proportions. These are not a native live-window lighting acceptance or FPS benchmark. Evidence: hoplite-smoke.json, hoplite-slope-check.json, hoplite-normal-front.png and hoplite-normal-back.png.

Typecheck passes. Production build and served hash are recorded in the final task result. Existing trireme changes remain included. No public deployment has been performed for this integration. User tabs, servers, saved work and settings were preserved; already-open tabs need a normal user refresh to load the new avatar.

Queued next: polish the docked trireme's materials, rigging and purposeful equipment under Daniel's latest feedback, preserving all validated routes and visit state transitions.
