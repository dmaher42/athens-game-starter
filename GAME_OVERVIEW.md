# GAME_OVERVIEW.md

## 1. Project Summary
This is a solo-built, AI-assisted web game titled **Athens Walkable World**. It is designed to explore city layout, walkability, and grounded architectural illusions in a stylized coastal environment inspired by ancient Athens. It uses a Three.js-based rendering engine, deployed on GitHub Pages, with all assets and content delivered through the `docs/` folder.

The goal is to create a **visually coherent, walkable city** with a mix of procedural generation and landmark placement that adheres to natural urban growth patterns and avoids unrealistic terrain artifacts (e.g. bowl-shaped cities or steep walls).

## 2. Creator Profile
**Name:** Daniel Maher  
**Experience:** No formal coding skills. Relies on natural language prompts and guided AI support.  
**Tools:** IT-managed Chromebook. Cannot run local dev servers or terminal commands. Prefers web-only deployment and usage.

## 3. AI Responsibilities
Any AI assistant working on this project must:

- Ensure **there is only one build**, always deployed live via GitHub Pages.
- Always use `npm run build` and push to the `gh-pages` branch.
- Make **no assumptions** about command-line usage — automate and commit any changes.
- Write **detailed Codex prompts** that explain exactly what the AI should do step-by-step.
- Update this `.md` file whenever new systems, features, or assumptions are introduced.
- Ensure **graphic rendering, loading overlays**, and walkability are always functioning.
- Catch asset loading issues before they appear in the final render (especially `.glb` files).

## 4. Game Design Priorities
### City exploration pass (2026-10-25)
- The Agora is the starting gathering space, framed by five low shopfronts. Reserve full building footprints around it; roads meet the edges of one continuous court.
- An open eastern view and a broad street lead to shore steps and the harbour boardwalk. A narrower inland route reveals the taller temple landmark; western lanes retain smaller courts and ordinary buildings.
- Begin on foot, facing the waterfront. Movement follows the visible camera. Flight remains available with F.
- Environmental views carry navigation. The optional quest panel starts collapsed and coloured tour guides are hidden by default; discovery triggers still work.
- Extend the existing city plan, building prefabs and harbour connector. Preserve the normal Water shader, shoreline ownership and shared texture loading.
- This pass is being tested locally on a separate design branch. It is not a public release or a merge of PR #978. Historical deployment instructions below do not authorize publishing an unapproved design.

- The world is a **mainland coastal city**, not an island.
- Harbour is on the open sea; terrain rises inland toward hills or mountains.
- Walkability is prioritized — buildings and landmarks should always be reachable on foot.
- Use **fog, skybox, and horizon tricks** to reinforce the sense of depth and place.
- Avoid: radial bowls, abrupt terrain walls, or visual incoherence.
- Support **repeatable lighting presets** and **incremental layout improvements**.
- Always favor **natural, readable ground-level views**.

## 5. Rendering & Loading Notes
- All loading feedback should be visible in the UI, not just console logs.
- GLB loading should fallback gracefully if assets are missing.
- Do not use dev-only texture flags in production.
- Post-processing chain: `RenderPass → UnrealBloomPass → ColorGradePass` (bloom is disabled by default for performance)
- Renderer uses SRGB, ACES Filmic tone mapping, and fog settings are exposed via `scene.userData`.
- Performance is strictly managed: culling systems (`propCulling.js`, `buildingCulling.js`) are used to hide distant meshes and lower draw calls dynamically.

## 6. Asset Handling
- All assets must live under `/docs` to be picked up by GitHub Pages.
- If models or textures are missing, surface this in the loading screen.
- Asset probing must support HEAD/GET fallback to avoid false negatives.

## 7. Deployment Workflow
- Dev builds are removed — everything builds into `/docs`.
- GitHub Actions automatically deploys to the `gh-pages` branch.
- Verification scripts (`npm run verify`, `npm run typecheck`) are used before deployment.
- README or other reference files should be auto-updated when content changes.

## 8. How to Update This Document
If an AI assistant:
- Adds a new system (lighting, layout, UI changes, etc.)
- Introduces a new rule, behavior, or rendering strategy
- Changes the build/deployment process
- Or sees changes to the user’s ability or preferences

Then this `GAME_OVERVIEW.md` file must be updated in the same commit.

---
This is a live document and should always reflect the **actual working assumptions** of the Athens project. If in doubt, make it explicit here.
