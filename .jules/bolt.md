# Bolt's Journal

## 2024-05-22 - [Grass Frustum Culling]
**Learning:** `src/world/grass.js` explicitly disables frustum culling (`frustumCulled = false`) for grass tiles. This is likely because the mesh is positioned at `(0,0,0)` while instances are offset in the vertex shader, but the bounding volumes are not updated to reflect the world position of the instances, causing premature culling if enabled.
**Action:** Update `populateTile` to calculate and set the correct `boundingSphere` and `boundingBox` for each tile's geometry based on its world position, then enable `frustumCulled = true`. This will allow the GPU to skip processing grass tiles that are outside the camera's view.
