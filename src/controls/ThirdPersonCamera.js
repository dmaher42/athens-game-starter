import * as THREE from "three";

const DEFAULT_OFFSET = new THREE.Vector3(0, 2.2, -4.5);
const DEFAULT_TARGET_OFFSET = new THREE.Vector3(0, 1.2, 0);
const DEFAULT_MIN_PITCH = THREE.MathUtils.degToRad(-25);
const DEFAULT_MAX_PITCH = THREE.MathUtils.degToRad(65);
const DEFAULT_COLLISION_OFFSET = 0.25;
const DEFAULT_FOLLOW_LERP = 0.12;
const DEFAULT_ROTATION_LERP = 0.15;
const DEFAULT_YAW_SENSITIVITY = 0.0024;
const DEFAULT_PITCH_SENSITIVITY = 0.0021;
const TAU = Math.PI * 2;

const _tmpOffset = new THREE.Vector3();
const _tmpDirection = new THREE.Vector3();
const _tmpTarget = new THREE.Vector3();
const _tmpCollision = new THREE.Vector3();
const _tmpLookAt = new THREE.Vector3();

function wrapAngle(angle) {
  return THREE.MathUtils.euclideanModulo(angle + Math.PI, TAU) - Math.PI;
}

function lerpAngle(current, target, t) {
  if (t >= 1) return wrapAngle(target);
  const delta = wrapAngle(target - current);
  return wrapAngle(current + delta * t);
}

function isObject3D(value) {
  return value && typeof value === "object" && value.isObject3D === true;
}

/**
 * Third-person orbital camera with obstacle avoidance.
 */
export class ThirdPersonCamera {
  /**
   * @param {THREE.Camera} camera
   * @param {THREE.Object3D | null} targetObject
   * @param {{
   *   offset?: THREE.Vector3,
   *   targetOffset?: THREE.Vector3,
   *   minPitch?: number,
   *   maxPitch?: number,
   *   collisionOffset?: number,
   *   followLerp?: number,
   *   rotationLerp?: number,
   *   yawSensitivity?: number,
   *   pitchSensitivity?: number,
   *   solids?: THREE.Object3D[],
   *   enabled?: boolean,
   * }} [options]
   */
  constructor(camera, targetObject, options = {}) {
    this.camera = camera;
    this.targetObject = targetObject ?? null;

    this.offset = (options.offset ?? DEFAULT_OFFSET).clone();
    this.targetOffset = (options.targetOffset ?? DEFAULT_TARGET_OFFSET).clone();

    this.followLerp = options.followLerp ?? DEFAULT_FOLLOW_LERP;
    this.rotationLerp = options.rotationLerp ?? DEFAULT_ROTATION_LERP;
    this.yawSensitivity = options.yawSensitivity ?? DEFAULT_YAW_SENSITIVITY;
    this.pitchSensitivity = options.pitchSensitivity ?? DEFAULT_PITCH_SENSITIVITY;

    this.minPitch = options.minPitch ?? DEFAULT_MIN_PITCH;
    this.maxPitch = options.maxPitch ?? DEFAULT_MAX_PITCH;
    this.collisionOffset = options.collisionOffset ?? DEFAULT_COLLISION_OFFSET;

    this.distance = Math.max(0.1, this.offset.length());

    const clampedY = THREE.MathUtils.clamp(this.offset.y / this.distance, -1, 1);
    this.basePitch = Math.asin(clampedY);
    this.baseYaw = Math.atan2(this.offset.x, -this.offset.z);

    this.targetYaw = wrapAngle(this.baseYaw);
    this.targetPitch = THREE.MathUtils.clamp(this.basePitch, this.minPitch, this.maxPitch);
    this.currentYaw = this.targetYaw;
    this.currentPitch = this.targetPitch;

    this.smoothedPosition = new THREE.Vector3();
    this.desiredPosition = new THREE.Vector3();
    this.lookTarget = new THREE.Vector3();

    this.raycaster = new THREE.Raycaster();
    this.intersections = [];

    this.solids = Array.isArray(options.solids)
      ? options.solids.filter(isObject3D)
      : [];

    this.enabled = false;
    this.needsImmediateSnap = false;
    this.warnedMissingTarget = false;
    this.disposed = false;

    const initialEnabled = options.enabled ?? true;
    if (initialEnabled) {
      this.setEnabled(true);
      if (this.camera) {
        this.smoothedPosition.copy(this.camera.position);
      }
    }
  }

  /**
   * @returns {number}
   */
  getYaw() {
    return this.currentYaw;
  }

  /**
   * @returns {number}
   */
  getPitch() {
    return this.currentPitch;
  }

  /**
   * @returns {number}
   */
  getTargetYaw() {
    return this.targetYaw;
  }

  /**
   * @returns {number}
   */
  getTargetPitch() {
    return this.targetPitch;
  }

  /**
   * @param {number} yaw
   * @param {number} pitch
   * @param {{ snap?: boolean }} [opts]
   */
  setAngles(yaw, pitch, opts = {}) {
    if (!Number.isFinite(yaw) || !Number.isFinite(pitch)) return;
    const snap = opts.snap ?? true;

    this.targetYaw = wrapAngle(yaw);
    this.targetPitch = THREE.MathUtils.clamp(pitch, this.minPitch, this.maxPitch);

    if (snap) {
      this.currentYaw = this.targetYaw;
      this.currentPitch = this.targetPitch;
      this.needsImmediateSnap = true;
    }
  }

  /**
   * @param {boolean} value
   */
  setEnabled(value) {
    const nextEnabled = !!value && !this.disposed;
    if (nextEnabled === this.enabled) return;

    this.enabled = nextEnabled;
    if (this.enabled) {
      this.needsImmediateSnap = true;
      this.warnedMissingTarget = false;
    }
  }

  /**
   * Update camera position and orientation.
   * @param {number} dt
   */
  update(dt) {
    if (!this.enabled || this.disposed) return;
    if (!this.camera) return;

    const target = this.targetObject;
    if (!isObject3D(target)) {
      if (!this.warnedMissingTarget) {
        console.warn("[ThirdPersonCamera] Missing target object; update skipped.");
        this.warnedMissingTarget = true;
      }
      return;
    }

    target.updateWorldMatrix(true, false);
    target.getWorldPosition(_tmpTarget);
    _tmpTarget.add(this.targetOffset);

    this.targetPitch = THREE.MathUtils.clamp(this.targetPitch, this.minPitch, this.maxPitch);

    const dtSafe = Number.isFinite(dt) ? Math.max(0, dt) : 0;
    const rotationAlpha = dtSafe > 0
      ? 1 - Math.pow(1 - this.rotationLerp, dtSafe * 60)
      : this.rotationLerp;
    const followAlpha = dtSafe > 0
      ? 1 - Math.pow(1 - this.followLerp, dtSafe * 60)
      : this.followLerp;

    const clampedRot = THREE.MathUtils.clamp(rotationAlpha, 0, 1);
    const clampedFollow = THREE.MathUtils.clamp(followAlpha, 0, 1);

    this.currentYaw = lerpAngle(this.currentYaw, this.targetYaw, clampedRot);
    this.currentPitch = THREE.MathUtils.lerp(
      this.currentPitch,
      this.targetPitch,
      clampedRot
    );

    const horizontal = Math.cos(this.currentPitch) * this.distance;
    _tmpOffset.set(
      Math.sin(this.currentYaw) * horizontal,
      Math.sin(this.currentPitch) * this.distance,
      -Math.cos(this.currentYaw) * horizontal
    );

    this.desiredPosition.copy(_tmpTarget).add(_tmpOffset);

    const direction = _tmpDirection
      .copy(this.desiredPosition)
      .sub(_tmpTarget);
    const distance = direction.length();
    if (distance > 1e-6) {
      direction.multiplyScalar(1 / distance);
    } else {
      direction.set(0, 0, -1);
    }

    let maxDistance = distance;
    if (maxDistance < this.collisionOffset) {
      maxDistance = this.collisionOffset;
    }

    if (this.solids.length > 0) {
      this.raycaster.near = 0;
      this.raycaster.far = maxDistance;
      this.raycaster.set(_tmpTarget, direction);
      this.intersections.length = 0;
      this.raycaster.intersectObjects(this.solids, true, this.intersections);
      if (this.intersections.length > 0) {
        const hit = this.intersections[0];
        const safeDistance = Math.max(
          0,
          Math.min(hit.distance - this.collisionOffset, maxDistance)
        );
        _tmpCollision.copy(_tmpTarget).addScaledVector(direction, safeDistance);
      } else {
        _tmpCollision.copy(this.desiredPosition);
      }
    } else {
      _tmpCollision.copy(this.desiredPosition);
    }

    if (this.needsImmediateSnap) {
      this.smoothedPosition.copy(_tmpCollision);
      this.needsImmediateSnap = false;
    } else {
      this.smoothedPosition.lerp(_tmpCollision, clampedFollow);
    }

    this.lookTarget.copy(_tmpTarget);
    this.camera.position.copy(this.smoothedPosition);
    this.camera.lookAt(this.lookTarget);
  }

  /**
   * @param {number} deltaX
   * @param {number} deltaY
   */
  handlePointer(deltaX, deltaY) {
    if (!this.enabled || this.disposed) return;
    if (!Number.isFinite(deltaX) || !Number.isFinite(deltaY)) return;

    const yaw = this.targetYaw - deltaX * this.yawSensitivity;
    const pitch = this.targetPitch - deltaY * this.pitchSensitivity;

    this.targetYaw = wrapAngle(yaw);
    this.targetPitch = THREE.MathUtils.clamp(pitch, this.minPitch, this.maxPitch);
  }

  /**
   * @param {boolean} value
   */
  dispose() {
    this.setEnabled(false);
    this.solids.length = 0;
    this.disposed = true;
  }
}

/*
Testing checklist:
- Mouse/touch drag rotates the camera smoothly around the player.
- Walk the player up to a wall; the camera should slide forward without clipping.
- Press V to toggle between first- and third-person.
- Watch the console for errors and confirm no per-frame allocations occur (no GC thrash).
*/
