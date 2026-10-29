# Current ship-water repair — 28 October 2026

The sea was rendering inside the boardable hulls through gaps around their narrower rectangular decks. The deck material is opaque. Independent geometry rays and normal-game ocean-on/off captures proved the cause; the user attachment itself could not be materialized because the official Windows helper lacks os.setxattr support. No screenshot claim relies on that attachment.

The existing single Ocean now uses world/shipWaterExclusion.js to derive triangle/sea intersection boundaries from the actual static merchant and trireme hulls, including their placed transforms. The shader rejects water only inside those measured interiors. Concave boundary detail is retained; only safe tiny convex ears may be removed to fit the96-edge budget. A5mm conservative boundary margin protects surrounding sea. There is no replacement ground/deck layer, new ocean, mesh, texture, light or collider. Ship geometry, material, deck height, boarding openings and exact collision hashes remain unchanged.

Masks are calculated once after the existing harbour has been placed while Ocean awaits its normal texture. The production smoke test explicitly checks both registered hull names/count. Future vessel/sea transforms must call configureShipWaterExclusions after updating matrices; there is no per-frame scene traversal. Uniform handles and shader cache key remain stable on refresh. GPU work is two bounding-box checks and, only within matching boat bounds, a capped96-segment point-in-polygon test. No native FPS gain or steady-play guarantee is claimed.

Final checks:46 Node tests, typecheck/build and all seven browser integration checks passed. GPU verification sampled49,868pixels across near/oblique/far and moved/rescaled-ship cases:0 geometry/pixel mismatches; all47,228outside-sea samples stayed pixel-identical. Programs12->12,0 compile/link calls on toggles/refresh; material version unchanged. Water remains one draw/8192triangles in the off/on fixture. Ship draw/triangle/texture/shadow budgets and collider hashes are byte-identical to the preceding deck-material pass. Legacy shoreline22260samples/0mismatch and auxiliary reflection policy pass. City walking12894frames, boarding/return2577frames, both ships grounded/on foot, activity evidence/hints/completion/reset/focus/quest restoration and pickup shader invariants pass. Seven actual normal-shader harbour/boarding/top/near/far captures were inspected; a standard browser client also completed on the small real-Water component and its screenshot/state were inspected. Component/software renders are not native performance measurements.

Normal preview4177 servesindex-B2ZaDDiJ.js, disk/served SHA2560de517bbc28fa7aa95242a71538ac11370a248a3767c706c4923f98863de0e0e match without restart. Repaired-view screenshotAthens-dry-ship-interior.png is saved to Library; exact IDs in task/water-library-deliverable.json. Local xattr tagging is unsupported, but that upload succeeded. Existing user apps/tabs/sign-ins/sync/unsaved work/servers/settings were preserved. Only confirmed owned test resources were closed. No publication.

Detailed task evidence:water-fix-completion.json,water-final-validation.json,water-final-gpu-report.json,water-final-smoke-guard.json,water-fixed-harbor-visual.json. Canonical repository source is authoritative; historical task drafts must not be reinstalled.

---

Earlier dated ship/deck records below are preserved as history.

# Current ship-decking checkpoint — 28 October 2026

Merchant and trireme decks now differ clearly from the jetty: one shared warm longitudinal-plank DataTexture, staggered butt joints, fine grain, restrained wear and dark edge framing. It replaces the material on the existing ShipDeck and EndPlatform meshes. The jetty, boarding ramps and fishing-skiff wood remain unchanged. Old deck line seams were removed. There is no overlay plane, added plank mesh, z-fighting layer or new collision system. Exact collision hashes, deck heights, gaps, activity targets and recent ship details are preserved.

The texture is generated once at256x256 RGBA,256KiB raw (~341KiB with mipmaps), shared by both ships, with no extra bump/roughness textures or per-frame update. Existing shadow flags remain; the distinct material separates the existing casting/receive-only groups. Relative to the preceding model upgrade, isolated batched merchant draw objects10→12 and shadow groups2→3; trireme14→16 and3→4. Triangles remain3,832/6,636; no additional rendered or collision geometry. The number/geometry of authored shadow casters is unchanged; the extra shadow draw group follows material separation. These budget counts do not establish native FPS.

Final typecheck/build and all42 Node tests passed, including exact collision hashes, visual boarding aperture, shared deck texture, unchanged support/jetty material and explicit render-cost limits. All six browser integration checks passed: smoke/no console/network errors; repeated pickup shader invariant; water22,260samples0mismatch; actual-terrain city walking12,894frames; activity evidence/hints/completion/reset/focus/quest restoration; boarding/return2,577frames with both ships grounded and on foot. Five normal-shader harbour images were inspected, including both deck-to-jetty transitions and near/far views. Standard browser client completed on the small real-asset fixture and its screenshot/state were inspected; no error report. It was not a movement or FPS measurement; full-game movement is covered by the integration routes.

Preview http://127.0.0.1:4177/athens-game-starter/ serves index-ByWuHb7N.js; served/disk SHA2560e7d9669d7cd2fc5d16a069ad0dbf8f6b2bea5acbffff8a8a0522f7269ef0833 matches. Existing previewPID44528 preserved without restart. Only owned temporary test resources closed. No publication, settings change or user-resource termination. No new external assets.

Screenshot Athens-distinct-ship-decking.png saved to Library; exact identity in task/deck-library-deliverable.json. Local Windows xattr tagging is unsupported; the Library upload succeeded. Task deck-final-validation.json,deck-final-preview.json,deck-harbor-visual.json and ship-upgrade-decking-budget.json retain detailed evidence. Ship-deck request complete; overall steady native FPS remains unverified.

---

The following records describe the earlier hull/rigging model pass; its no-new-texture statement and rendering budgets predate the deck material above.
# Ship presentation upgrade

The personal hobby world's existing procedural ship module remains the single owner: `src/world/harborShips.js`. `harbor.js` retains placement, sea-relative origins, moorings, boarding ramps and the existing harbour-wide static batching. No new loader, ship loop, texture, light, downloaded asset, animation or physics system was added. Fishing skiffs are unchanged.

The merchant gains a fuller curved hull and swept sheer/gunwales, raised stem and sternpost, a billowed panelled linen sail with sheets/braces/stays, a stern awning, windlass, mooring bitts and cargo lashings. The trireme keeps its narrow identity and72 instanced oars in three banks, with a shaped bronze ram, bow eyes, swept ends, an outrigger/gallery structure and ports, and a tied rolled linen sail. These are stylised interpretations, not surveyed reconstructions. The naval gallery rail/supports deliberately leave the original port boarding opening clear.

## Physics and rendering contract

`createShipHull` continues to make the original physical hull. Original hull, straight gunwales, naval ram and rolled-sail collision meshes retain their geometry/transforms and remain visible to `EnvironmentCollider`, with render layer mask0. Do not delete these as apparently unused geometry. They are deliberately separate from the richer `ShipVisualDetails` subtree, whose inherited `noCollision` excludes all cosmetic additions from physics. The original flat deck remains the physical support. Deck height1.7m and2.8m boarding apertures remain unchanged. Tests retain exact pre-upgrade collider hashes for both hero ships.

`presentationHull` caches the richer visual hull geometry. Fine fittings opt out of individual small-prop culling and enter existing static batches; normal render-time frustum culling remains. Shared palette materials, instanced cargo/oars/bitts/gallery parts and a single expanded standing-rigging line draw limit cost. Small trim, eyes and fittings receive shadows rather than casting separate fine-detail shadows. Original shadow-object budgets are unchanged.

Isolated ship counts after existing static batching (actual harbour-wide batching may combine more):

| Ship | Draw objects before → after | Triangles before → after | Shadow objects before → after |
|---|---:|---:|---:|
| Merchant |9 →10|1,536 →3,832|2 →2|
| Trireme |9 →14|3,420 →6,636|3 →3|
| Fishing skiff |4 →4|152 →152|2 →2|

Combined hero geometry rises by5,512 triangles and six draw objects in this isolated measurement. No new texture memory. New naval dark ports/pupils reuse the merchant hold's cached dark material. This budget is not an FPS measurement or proof of steady play. Prior native timing remains affected by memory/paging pressure; no quality setting or user resource was changed.

## References and provenance

- [Acropolis Museum: Lenormant relief](https://www.theacropolismuseum.gr/en/relief-depicting-trireme-lenormant-relief), late fifth-century BC: primary evidence for three oar rows; it does not supply every detail of this schematic model.
- [Institute of Nautical Archaeology: Kyrenia wreck](https://nauticalarch.org/projects/kyrenia-shipwreck-excavation/): a later Greek merchant hull/cargo comparison. INA dates the wreck295BC; this is not an exact fifth-century Athenian template.

All added geometry is generated by this project. No external models/images/textures were downloaded or copied; no new asset licence obligations. Sources informed the interpretation, not exact dimensions.

## Verification

Final typecheck, production build, all41 Node tests and all six browser integration checks passed. Actual-terrain city walking12893frames and boarding/return2577frames passed; activity evidence, wrong-answer hints, explanation, completion/reset, keyboard focus and quest restoration passed. Repeated scroll pickups retain2 shader programs with zero new compile/link calls. Water22260samples has zero shoreline mismatches. Current preview4177 serves index-B67ALavR.js, matching disk SHA256a559e5a53246576bcbc3e1d0d8242dc0fb45062398b69b04c3d08a6d469b2b71. Screenshot evidence remains in the task workspace, including four inspected normal-shader in-harbour views. Ship regressions cover readable identities, unchanged deck/ramp supports, byte-identical colliders, shared hulls, bounded draw/triangle/shadow cost and a clear naval gallery boarding aperture. Normal-shader merchant, trireme, boarding and distant-harbour captures were inspected, as were matched before/after asset views. The develop-web-game client completed the standard orbit/jump burst on the final preview, with inspected screenshot/state, grounded player and quest preserved; no error report. Its software-rendered timings are not native FPS evidence. The ship upgrade is complete; full-game performance acceptance remains separate.


