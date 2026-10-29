# Hellenistic Acropolis assets

These two GLBs were originally authored in Blender for Daniel's Athens project.
They came from the user-supplied `Propylaea_Hellenistic_Blender_Asset_v01.zip`.
No meshes, textures or watermarked artwork were copied from Ancient Athens 3D.
Research illustrations were visual references only. The editable Blender source,
original render previews and source notes are retained in the task authoring files,
outside this public web-asset directory. No bundled Python script was executed
during game integration.

| Runtime file | Original filename | SHA256 |
| --- | --- | --- |
| propylaia-v1.glb | propylaea_hellenistic_v01.glb | 055d145dce58771b7bd0c37a04b1ba384f5be7df6c82c899821516ff87709859 |
| propylaia-collision-v1.glb | propylaea_collision_v01.glb | 8a40266ffecac970640a549d94e4700636178e83dcb3dade725a54beb45efa5d |

Exported geometry remains in metres, +X east/through the gateway, +Y up and -Z
north in the asset's convention. The compressed game uses a uniform placement
scale of 0.65, with no additional Blender up-axis rotation. Source geometry is not
modified. The source's 2.4m threshold rise consequently becomes 1.56 game units.
Placement, approach and reservation live in `src/world/acropolisLayout.js`.
Loading, collision-proxy visibility and atomic fallback live in
`src/world/propylaeaIntegration.js`; there is no second gateway owner.

The original template is preloaded alongside existing terrain/city startup, then
cloned for installation. The original procedural gateway and central fallback ramp
remain visible/collidable unless both supplied GLBs successfully load. Imported
visual geometry does not become the physics collider; the simplified proxy does.

The Parthenon and sanctuary are a compressed Hellenistic-inspired interpretation,
approximately 150–140 BC, retaining older Classical monuments. The gateway itself
is a fifth-century building still in use, not a building invented in the Hellenistic
period. Wing proportions, complete paint scheme, threshold rise and detailed
reconstructions remain interpretive. Official architectural reference:
https://www.ysma.gr/en/monuments/propylaia/

Source geometry counts: visual model: 90,280 triangles, 34 material primitives, 8 materials,
no external image dependencies; collision: 1,884 triangles. These counts are not an
FPS measurement or a promise about performance on every computer.
