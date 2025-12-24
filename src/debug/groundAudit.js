import * as THREE from "three";

function isGroundy(obj) {
  const n = (obj?.name || "").toLowerCase();
  return (
    n.includes("terrain") ||
    n.includes("harbor") ||
    n.includes("ocean") ||
    n.includes("shore") ||
    n.includes("floorcap")
  );
}

function addOutline(scene, obj) {
  try {
    const geom = obj.geometry || obj?.mesh?.geometry;
    if (!geom || !geom.attributes?.position) return;
    const edges = new THREE.EdgesGeometry(geom, 30);
    const mat = new THREE.LineBasicMaterial({ color: 0xff3333 });
    const lines = new THREE.LineSegments(edges, mat);
    lines.name = `${obj.name || "Object"}-Outline`;
    lines.renderOrder = 9999;
    lines.frustumCulled = false;
    lines.userData.debugHelper = true;
    lines.position.copy(obj.position);
    lines.rotation.copy(obj.rotation);
    lines.scale.copy(obj.scale);
    scene.add(lines);
  } catch (e) {
    console.warn("[groundAudit] outline failed for", obj?.name, e);
  }
}

function enableWireframe(obj) {
  const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
  for (const m of mats) {
    if (!m || !m.isMaterial) continue;
    m.wireframe = true;
    m.depthTest = true;
    m.polygonOffset = true;
    m.polygonOffsetFactor = -1;
    m.polygonOffsetUnits = -1;
    m.needsUpdate = true;
  }
}

function logPositions(scene) {
  const rows = scene.children
    .filter(isGroundy)
    .map((obj) => ({ name: obj.name, y: obj.position?.y ?? 0 }));
  console.table(rows);
}

export function mountGroundAudit(scene) {
  if (!scene) return;
  // Clean old helpers
  scene.traverse((o) => {
    if (o.userData?.debugHelper) {
      o.parent?.remove(o);
    }
  });

  const targets = scene.children.filter(isGroundy);
  for (const t of targets) {
    addOutline(scene, t);
    enableWireframe(t);
    // Nudge transparent far ocean to avoid depth-sorting confusion in debug
    if (t.name === "FarOceanPlane" && t.material) {
      t.material.transparent = false;
      t.material.opacity = 1.0;
      t.material.depthWrite = true;
      t.material.needsUpdate = true;
      t.renderOrder = -10;
    }
  }

  logPositions(scene);

  // Expose quick toggle
  scene.userData.groundAudit = {
    refresh: () => mountGroundAudit(scene),
    disable: () => {
      scene.traverse((o) => {
        if (o.userData?.debugHelper) o.parent?.remove(o);
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) {
          if (m && m.isMaterial) m.wireframe = false;
        }
      });
    },
  };
}
