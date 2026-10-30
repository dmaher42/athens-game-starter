# Socrates v02 (beard revision) — original stylised Blender NPC

Created for Daniel's Athens game. This is an original sculptural interpretation, not a scan or exact reconstruction of a historical person. No external artwork or mesh has been copied into the asset.

## Contents
- `Socrates_v01.blend`: editable Blender 4.3.2 source, material definitions, character collection, basic head-idle rig and separate render studio.
- `Socrates_v01.glb`: self-contained glTF 2.0 binary export. No external texture dependencies; solid PBR materials. The studio, floor and lights are excluded.
- `Socrates_full.png` and `Socrates_face.png`: rendered previews.
- `build_socrates.py`: reproducible authoring script.
- `glb_validation.json`: final GLB round-trip statistics.

## Design
Bald crown, receding side hair, broad short nose, full grey-brown beard, heavy eyelids and simple draped wool. Bare feet and a conversational raised hand. Clothing colour and pose are artistic choices, not documented measurements.

Museum reference descriptions:
- National Trust, portrait bust of Socrates: distinctive snub nose, beard and prominent eyes. https://www.nationaltrustcollections.org.uk/object/565221.1
- MFA Boston, Portrait Head of Socrates: receding hairline and thick beard. https://www.mfa.org/article/2021/portrait-head-of-socrates
- Cornell Cast Collection: Type B portraits derive from a lost fourth-century BCE statue made after Socrates' lifetime. https://digital.library.cornell.edu/catalog/ss%3A172717

## Import and scale
Blender uses metres and Z-up. Export uses standard glTF Y-up, feet at the origin. Approximate height: 1.65 m. In the Blender source the character faces -Y; glTF axis conversion is enabled. Verify facing against the application's own character convention before placement.

Use the `Socrates | export` collection only when re-exporting. The studio is not part of the game asset. Preserve the existing game entity identifier, dialogue trigger, collision and save schema when replacing its visual model.

## Animation and limitations
`Socrates_Listen_Idle` is a subtle four-second head motion. Body and clothing are a standing pose with rigid bone assignment. This is NOT a locomotion, facial-expression or combat-ready rig: walking, fingers, lip sync and cloth deformation need further rigging and animation. Arm/leg guide bones are retained for future authoring but do not imply tested full-body deformation.

The asset is intentionally stylised, with sculpted short overlapping hair and simple PBR materials rather than photoreal skin/hair textures. It has been visually inspected and re-imported from GLB into Blender, but has not yet been installed or tested inside the Athens game. No game files, dialogue, saves or server processes were changed by this asset task.

## Recommended game export
`Socrates_v01_game.glb` is the reduced geometry version intended for testing in the game. The higher-detail `Socrates_v01.glb` remains available as an alternative. `Socrates_game_preview.png` was rendered after importing the reduced GLB, rather than from the original authoring geometry. See `game_validation.json` for its exact triangle count.


## Beard revision
Replaced the detached oval beard with a surface fitted to the jaw and cheeks, graded root colour, fine cheek growth and short overlapping strands. The moustache now uses fine strands rather than two separate thick lobes. Existing pose, scale, materials elsewhere and head-idle are preserved. File basenames remain stable for replacements.
