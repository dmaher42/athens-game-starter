import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const EPSILON = 1e-6;

export class EnvironmentCollider {
  constructor() {
    const material = new THREE.MeshBasicMaterial({
      visible: false,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
      color: 0x00ff99,
    });

    this.mesh = new THREE.Mesh(new THREE.BufferGeometry(), material);
    this.mesh.name = 'EnvironmentCollider';
    this.mesh.frustumCulled = false;
    this.mesh.matrixAutoUpdate = false;
    this.mesh.userData.noCollision = true;

    this.positionAttr = null;
    this.indexAttr = null;
    this.capsuleBox = new THREE.Box3();
    this.triangleBox = new THREE.Box3();
    this.triangle = new THREE.Triangle();
    this.plane = new THREE.Plane();
    this.capsuleSegment = new THREE.Line3();

    this.tmpVec0 = new THREE.Vector3();
    this.tmpVec1 = new THREE.Vector3();
    this.tmpVec2 = new THREE.Vector3();
    this.tmpVec3 = new THREE.Vector3();
    this.tmpVec4 = new THREE.Vector3();
    this.tmpVec5 = new THREE.Vector3();
    this.tmpVec6 = new THREE.Vector3();
    this.tmpVec7 = new THREE.Vector3();
    this.tmpVec8 = new THREE.Vector3();
    this.tmpVec9 = new THREE.Vector3();
    this.tmpNormal = new THREE.Vector3();
    this.segPoint = new THREE.Vector3();
    this.triPoint = new THREE.Vector3();
  }

  /**
   * @param {THREE.Object3D} root
   * @param {{ debug?: boolean }} [opts]
   */
  fromStaticScene(root, opts = {}) {
    const geometries = [];
    root.updateWorldMatrix(true, true);

    const material = this.mesh.material;
    material.visible = !!opts.debug;

    root.traverse((child) => {
      if (!child.isMesh) return;
      if (child === this.mesh) return;

      const mesh = child;
      if (mesh.userData?.noCollision === true) return;
      const geometry = mesh.geometry;
      if (!geometry || !geometry.attributes.position) return;
      if (!mesh.visible) return;

      const cloned = geometry.clone();

      Object.keys(cloned.attributes).forEach((attrName) => {
        if (attrName !== 'position') {
          cloned.deleteAttribute(attrName);
        }
      });

      cloned.applyMatrix4(mesh.matrixWorld);
      geometries.push(cloned);
    });

    let merged;
    if (geometries.length > 0) {
      const combined = mergeGeometries(geometries, false);
      merged = combined ?? new THREE.BufferGeometry();
    } else {
      merged = new THREE.BufferGeometry();
    }

    geometries.forEach((geom) => geom.dispose());

    const oldGeometry = this.mesh.geometry;
    if (oldGeometry) oldGeometry.dispose();

    this.mesh.geometry = merged;
    merged.computeBoundingBox();
    merged.computeBoundingSphere();

    this.positionAttr = merged.getAttribute('position');
    this.indexAttr = merged.getIndex();
  }

  /**
   * @param {import('three/examples/jsm/math/Capsule.js').Capsule} capsule
   * @returns {{ normal: THREE.Vector3, depth: number } | null}
   */
  capsuleIntersect(capsule) {
    const geometry = this.mesh.geometry;
    const position = this.positionAttr;
    if (!geometry || !position || position.count === 0) return null;

    const boundingBox = geometry.boundingBox;
    if (!boundingBox) return null;

    this.capsuleSegment.set(capsule.start, capsule.end);
    this.capsuleBox.makeEmpty();
    this.capsuleBox.expandByPoint(capsule.start);
    this.capsuleBox.expandByPoint(capsule.end);
    this.capsuleBox.min.addScalar(-capsule.radius);
    this.capsuleBox.max.addScalar(capsule.radius);

    if (!boundingBox.intersectsBox(this.capsuleBox)) return null;

    let bestDepth = 0;
    let bestNormal = null;

    const index = this.indexAttr;

    const checkTriangle = (aIndex, bIndex, cIndex) => {
      this.tmpVec0.fromBufferAttribute(position, aIndex);
      this.tmpVec1.fromBufferAttribute(position, bIndex);
      this.tmpVec2.fromBufferAttribute(position, cIndex);

      this.triangleBox.makeEmpty();
      this.triangleBox.expandByPoint(this.tmpVec0);
      this.triangleBox.expandByPoint(this.tmpVec1);
      this.triangleBox.expandByPoint(this.tmpVec2);
      this.triangleBox.min.addScalar(-capsule.radius);
      this.triangleBox.max.addScalar(capsule.radius);

      if (!this.triangleBox.intersectsBox(this.capsuleBox)) {
        return;
      }

      this.triangle.set(this.tmpVec0, this.tmpVec1, this.tmpVec2);

      const distance = this.closestPointsSegmentTriangle(
        this.capsuleSegment,
        this.triangle,
        this.segPoint,
        this.triPoint
      );

      if (distance === null) return;

      if (distance < capsule.radius - EPSILON) {
        const depth = capsule.radius - distance;
        if (depth > bestDepth) {
          bestDepth = depth;

          this.tmpNormal.subVectors(this.segPoint, this.triPoint);
          if (this.tmpNormal.lengthSq() < EPSILON) {
            this.triangle.getNormal(this.tmpNormal);
          } else {
            this.tmpNormal.normalize();
          }

          bestNormal = this.tmpVec3.copy(this.tmpNormal);
        }
      }
    };

    if (index) {
      for (let i = 0; i < index.count; i += 3) {
        checkTriangle(index.getX(i), index.getX(i + 1), index.getX(i + 2));
      }
    } else {
      for (let i = 0; i < position.count; i += 3) {
        checkTriangle(i, i + 1, i + 2);
      }
    }

    if (!bestNormal) return null;

    return {
      normal: bestNormal.clone(),
      depth: bestDepth,
    };
  }

  closestPointsSegmentTriangle(segment, triangle, segPoint, triPoint) {
    const a = triangle.a;
    const b = triangle.b;
    const c = triangle.c;

    this.tmpVec4.subVectors(b, a);
    this.tmpVec5.subVectors(c, a);
    const normal = this.tmpVec6.copy(this.tmpVec4).cross(this.tmpVec5);
    if (normal.lengthSq() < EPSILON) {
      return null;
    }

    this.plane.setFromCoplanarPoints(a, b, c);

    const startDist = this.plane.distanceToPoint(segment.start);
    const endDist = this.plane.distanceToPoint(segment.end);

    const dir = this.tmpVec7.subVectors(segment.end, segment.start);

    if (Math.abs(startDist - endDist) > EPSILON) {
      const t = startDist / (startDist - endDist);
      if (t >= 0 && t <= 1) {
        segPoint.copy(dir).multiplyScalar(t).add(segment.start);
        if (triangle.containsPoint(segPoint)) {
          triPoint.copy(segPoint);
          return 0;
        }
      }
    }

    let bestDistance = Infinity;

    triangle.closestPointToPoint(segment.start, this.tmpVec8);
    let dist = this.tmpVec8.distanceTo(segment.start);
    if (dist < bestDistance) {
      bestDistance = dist;
      segPoint.copy(segment.start);
      triPoint.copy(this.tmpVec8);
    }

    triangle.closestPointToPoint(segment.end, this.tmpVec8);
    dist = this.tmpVec8.distanceTo(segment.end);
    if (dist < bestDistance) {
      bestDistance = dist;
      segPoint.copy(segment.end);
      triPoint.copy(this.tmpVec8);
    }

    bestDistance = this.testEdgeDistance(
      segment,
      a,
      b,
      bestDistance,
      segPoint,
      triPoint
    );

    bestDistance = this.testEdgeDistance(
      segment,
      b,
      c,
      bestDistance,
      segPoint,
      triPoint
    );

    bestDistance = this.testEdgeDistance(
      segment,
      c,
      a,
      bestDistance,
      segPoint,
      triPoint
    );

    return bestDistance;
  }

  testEdgeDistance(segment, edgeStart, edgeEnd, currentBest, segPoint, triPoint) {
    const dist = this.closestPointsSegmentSegment(
      segment.start,
      segment.end,
      edgeStart,
      edgeEnd,
      this.tmpVec8,
      this.tmpVec9
    );

    if (dist < currentBest) {
      currentBest = dist;
      segPoint.copy(this.tmpVec8);
      triPoint.copy(this.tmpVec9);
    }

    return currentBest;
  }

  closestPointsSegmentSegment(p1, q1, p2, q2, target1, target2) {
    const d1 = this.tmpVec4.subVectors(q1, p1);
    const d2 = this.tmpVec5.subVectors(q2, p2);
    const r = this.tmpVec6.subVectors(p1, p2);
    const a = d1.dot(d1);
    const e = d2.dot(d2);
    const f = d2.dot(r);
    const EPS = EPSILON;

    let s = 0;
    let t = 0;

    if (a <= EPS && e <= EPS) {
      target1.copy(p1);
      target2.copy(p2);
      return target1.distanceTo(target2);
    }

    if (a <= EPS) {
      s = 0;
      t = THREE.MathUtils.clamp(f / e, 0, 1);
    } else {
      const c = d1.dot(r);
      if (e <= EPS) {
        t = 0;
        s = THREE.MathUtils.clamp(-c / a, 0, 1);
      } else {
        const b = d1.dot(d2);
        const denom = a * e - b * b;
        if (denom !== 0) {
          s = THREE.MathUtils.clamp((b * f - c * e) / denom, 0, 1);
        } else {
          s = 0;
        }
        t = (b * s + f) / e;

        if (t < 0) {
          t = 0;
          s = THREE.MathUtils.clamp(-c / a, 0, 1);
        } else if (t > 1) {
          t = 1;
          s = THREE.MathUtils.clamp((b - c) / a, 0, 1);
        }
      }
    }

    target1.copy(d1).multiplyScalar(s).add(p1);
    target2.copy(d2).multiplyScalar(t).add(p2);
    return target1.distanceTo(target2);
  }
}

export default EnvironmentCollider;
