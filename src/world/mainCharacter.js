// src/world/mainCharacter.js
// Beginner-friendly playable character that demonstrates simple movement,
// smooth rotation, and a following camera in a Three.js scene.

import {
  Box3,
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  Raycaster,
  Vector3,
  MathUtils,
} from "three";
import { LOOK_KEYS, MOVEMENT_ONLY_KEYS } from "../input/keyBindings";

// Reuse the same vectors every frame so we avoid creating garbage objects.
const moveDirection = new Vector3();
const worldDirection = new Vector3();
const cameraOffset = new Vector3();
const lookTarget = new Vector3();
const proposedPosition = new Vector3();
const originalPosition = new Vector3();
const colliderBox = new Box3();
const UP_AXIS = new Vector3(0, 1, 0);
const DOWN_AXIS = new Vector3(0, -1, 0);
const rayOrigin = new Vector3();
const groundRaycaster = new Raycaster();

const DEFAULT_CAMERA_DISTANCE = Math.hypot(5, 2);
const DEFAULT_CAMERA_PITCH = Math.atan2(2, 5);
const DEFAULT_CAMERA_MIN_PITCH = MathUtils.degToRad(-30);
const DEFAULT_CAMERA_MAX_PITCH = MathUtils.degToRad(60);
const DEFAULT_CAMERA_YAW_SPEED = MathUtils.degToRad(120);
const DEFAULT_CAMERA_PITCH_SPEED = MathUtils.degToRad(90);

const MOVEMENT_FLAGS = Object.freeze({
  forward: "moveForward",
  back: "moveBackward",
  left: "moveLeft",
  right: "moveRight",
});

const MOVEMENT_FLAG_BY_CODE = (() => {
  const map = new Map();
  for (const [direction, codes] of Object.entries(MOVEMENT_ONLY_KEYS)) {
    const flag = MOVEMENT_FLAGS[direction];
    if (!flag || !Array.isArray(codes)) continue;
    for (const code of codes) {
      if (typeof code === "string" && code.length > 0) {
        map.set(code, flag);
      }
    }
  }
  return map;
})();

const LOOK_FLAGS = Object.freeze({
  left: "lookLeft",
  right: "lookRight",
  up: "lookUp",
  down: "lookDown",
});

const LOOK_FLAG_BY_CODE = (() => {
  const map = new Map();
  for (const [direction, codes] of Object.entries(LOOK_KEYS)) {
    const flag = LOOK_FLAGS[direction];
    if (!flag || !Array.isArray(codes)) continue;
    for (const code of codes) {
      if (typeof code === "string" && code.length > 0) {
        map.set(code, flag);
      }
    }
  }
  return map;
})();

export class MainCharacter {
  constructor(scene, camera, options = {}) {
    // Store references for later use.
    this.scene = scene;
    this.camera = camera;

    // Configuration values with friendly defaults that can be overridden.
    this.speed = options.speed ?? 5; // Units per second.
    this.angularSpeed = options.angularSpeed ?? 3; // Radians per second.
    this.jumpStrength = options.jumpStrength ?? 6; // How powerfully we launch upwards.
    this.gravity = options.gravity ?? 12; // Pull back toward the ground (m/s^2).
    this.terminalVelocity = options.terminalVelocity ?? -50; // Prevent runaway fall speed.
    this.footEpsilon = options.footEpsilon ?? 0.05; // Small buffer so we don't hover.

    // Track the player's facing direction (yaw around the Y axis).
    this.yaw = 0;

    // Create a simple placeholder mesh so we can see the player in the world.
    const geometry = new BoxGeometry(1, 2, 1);
    const material = new MeshStandardMaterial({ color: 0x4da6ff });
    this.mesh = new Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.position.set(0, 1, 0); // Lift it so it rests on the ground plane.
    this.halfHeight = (geometry.parameters?.height ?? 2) / 2;
    scene.add(this.mesh);

    // Bounding boxes are invisible 3D rectangles that wrap around a mesh and
    // describe the minimum and maximum XYZ coordinates it occupies. We can use
    // them to quickly check if two objects overlap in the world.
    this.collider = new Box3().setFromObject(this.mesh);

    // Simple physics state.
    this.velocityY = 0; // Current vertical speed in meters per second.
    this.isGrounded = false; // True once a raycast says our feet touch a surface.
    this.jumpRequested = false; // Set when the player taps the jump button.

    // Movement flags are toggled when the player presses keyboard keys.
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    // Camera orbit flags controlled by the arrow keys.
    this.lookLeft = false;
    this.lookRight = false;
    this.lookUp = false;
    this.lookDown = false;

    // Bind event handlers once so we can remove them later if needed.
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleBlur = this.handleBlur.bind(this);

    // Listen for WASD keys to move our placeholder character.
    // window.addEventListener("keydown", this.handleKeyDown);
    // window.addEventListener("keyup", this.handleKeyUp);
    // window.addEventListener("blur", this.handleBlur);

    // Camera orbit configuration.
    this.cameraDistance = Math.max(
      0.1,
      options.cameraDistance ?? DEFAULT_CAMERA_DISTANCE
    );
    this.cameraPitch = options.cameraPitch ?? DEFAULT_CAMERA_PITCH;
    this.cameraYawOffset = options.cameraYawOffset ?? 0;
    this.cameraMinPitch = options.cameraMinPitch ?? DEFAULT_CAMERA_MIN_PITCH;
    this.cameraMaxPitch = options.cameraMaxPitch ?? DEFAULT_CAMERA_MAX_PITCH;
    if (this.cameraMaxPitch < this.cameraMinPitch) {
      const swap = this.cameraMaxPitch;
      this.cameraMaxPitch = this.cameraMinPitch;
      this.cameraMinPitch = swap;
    }
    this.cameraPitch = MathUtils.clamp(
      this.cameraPitch,
      this.cameraMinPitch,
      this.cameraMaxPitch
    );
    this.cameraYawOffset = MathUtils.euclideanModulo(
      this.cameraYawOffset + Math.PI,
      Math.PI * 2
    ) - Math.PI;
    this.cameraYawSpeed = options.cameraYawSpeed ?? DEFAULT_CAMERA_YAW_SPEED;
    this.cameraPitchSpeed =
      options.cameraPitchSpeed ?? DEFAULT_CAMERA_PITCH_SPEED;
    this.cameraTargetHeight = options.cameraTargetHeight ?? 0;
  }

  handleKeyDown(event) {
    if (event.repeat) return; // Ignore auto-repeat so a held key doesn't spam jumps.
    const handled = this.toggleMovement(event.code, true);
    if (handled) {
      event.preventDefault();
    }
  }

  handleKeyUp(event) {
    const handled = this.toggleMovement(event.code, false);
    if (handled) {
      event.preventDefault();
    }
  }

  toggleMovement(code, isPressed) {
    let handled = false;
    const movementFlag = MOVEMENT_FLAG_BY_CODE.get(code);
    if (movementFlag) {
      this[movementFlag] = isPressed;
      handled = true;
    } else {
      const lookFlag = LOOK_FLAG_BY_CODE.get(code);
      if (lookFlag) {
        this[lookFlag] = isPressed;
        handled = true;
      }
    }

    if (!handled) {
      switch (code) {
        case "Space":
        case "Numpad0":
          if (isPressed) {
            this.jumpRequested = true; // Queue jump so update() can handle physics safely.
          }
          handled = true;
          break;
        default:
          break;
      }
    }

    return handled;
  }

  update(deltaTime, colliders = [], terrain = null) {
    if (!this.mesh) return;

    // ---------------------------------------------------------------------
    // Movement: determine which direction we want to travel on the XZ plane.
    moveDirection.set(0, 0, 0);
    if (this.moveForward) moveDirection.z -= 1;
    if (this.moveBackward) moveDirection.z += 1;
    if (this.moveLeft) moveDirection.x -= 1;
    if (this.moveRight) moveDirection.x += 1;

    const hasMovementInput = moveDirection.lengthSq() > 0;
    if (hasMovementInput) {
      moveDirection.normalize();

      // ---------------------------------------------------------------
      // Rotation: smoothly turn the character towards the desired direction.
      const targetYaw = Math.atan2(moveDirection.x, -moveDirection.z);
      const angleDifference = MathUtils.euclideanModulo(
        targetYaw - this.yaw + Math.PI,
        Math.PI * 2
      ) - Math.PI;
      const maxStep = this.angularSpeed * deltaTime;
      const yawStep = MathUtils.clamp(angleDifference, -maxStep, maxStep);
      this.yaw += yawStep;
      this.mesh.rotation.y = this.yaw;

      // ---------------------------------------------------------------
      // Movement: convert local direction (forward is -Z) into world space and
      // nudge the mesh forward by speed * deltaTime.
      worldDirection.copy(moveDirection).applyAxisAngle(UP_AXIS, this.yaw);
      const distance = this.speed * deltaTime;
      proposedPosition
        .copy(this.mesh.position)
        .addScaledVector(worldDirection, distance);

      // Keep the original position so we can restore it if a collision is found.
      originalPosition.copy(this.mesh.position);

      // Temporarily move the mesh and update its bounding box for collision tests.
      this.mesh.position.copy(proposedPosition);
      this.collider.setFromObject(this.mesh);

      let blocked = false;
      for (const collider of colliders) {
        if (!collider) continue;
        colliderBox.setFromObject(collider);
        if (this.collider.intersectsBox(colliderBox)) {
          // Allow shallow Y overlaps (standing on the floor) but block walls.
          const verticalOverlap =
            Math.min(this.collider.max.y, colliderBox.max.y) -
            Math.max(this.collider.min.y, colliderBox.min.y);
          if (verticalOverlap > 0.01) {
            blocked = true;
            break;
          }
        }
      }

      if (blocked) {
        // Cancel the move when something solid is in the way.
        this.mesh.position.copy(originalPosition);
        this.collider.setFromObject(this.mesh);
      }
    } else {
      // If we didn't move horizontally this frame we still refresh the collider.
      this.collider.setFromObject(this.mesh);
    }

    // ---------------------------------------------------------------------
    // Jump requests fire here so we only modify velocity while in update().
    if (this.jumpRequested) {
      if (this.isGrounded) {
        this.velocityY = this.jumpStrength;
        this.isGrounded = false; // We're leaving the ground now.
      }
      this.jumpRequested = false;
    }

    // ---------------------------------------------------------------------
    // Gravity constantly pulls us toward the terrain like a magnet.
    this.velocityY -= this.gravity * deltaTime;
    this.velocityY = Math.max(this.velocityY, this.terminalVelocity);

    // Integrate vertical velocity so the mesh actually moves up or down.
    this.mesh.position.y += this.velocityY * deltaTime;

    // ---------------------------------------------------------------------
    // Ground detection: cast a ray straight down to see how far the floor is.
    const rayTargets = terrain ? [terrain, ...colliders] : colliders;
    const validTargets = rayTargets.filter(Boolean);
    if (validTargets.length > 0) {
      rayOrigin.copy(this.mesh.position);
      rayOrigin.y += this.halfHeight + 0.5; // Start slightly above the head to avoid self hits.
      groundRaycaster.set(rayOrigin, DOWN_AXIS);
      const distanceFromOriginToFeet = this.halfHeight * 2 + 0.5;
      groundRaycaster.far = distanceFromOriginToFeet; // Reach from above the head to the feet.
      const hits = groundRaycaster.intersectObjects(validTargets, true);

      if (hits.length > 0) {
        const hit = hits[0];
        const gap = hit.distance - distanceFromOriginToFeet;
        if (gap <= this.footEpsilon) {
          // Snap the player so their feet rest gently on the contact point.
          this.isGrounded = true;
          this.mesh.position.y = hit.point.y + this.halfHeight;
          this.velocityY = 0;
        } else {
          this.isGrounded = false;
        }
      } else {
        this.isGrounded = false;
      }
    }

    // Refresh the collider with the final world position after all adjustments.
    this.collider.setFromObject(this.mesh);

    // ---------------------------------------------------------------------
    // Camera follow: position the camera slightly behind and above the player.
    this.updateCamera(deltaTime);
  }

  updateCamera(deltaTime = 0) {
    if (!this.camera) return;

    const dt = Number.isFinite(deltaTime) && deltaTime > 0 ? deltaTime : 0;
    if (dt > 0) {
      const yawInput = (this.lookRight ? 1 : 0) - (this.lookLeft ? 1 : 0);
      if (yawInput !== 0) {
        this.cameraYawOffset += yawInput * this.cameraYawSpeed * dt;
      }

      const pitchInput = (this.lookUp ? 1 : 0) - (this.lookDown ? 1 : 0);
      if (pitchInput !== 0) {
        this.cameraPitch += pitchInput * this.cameraPitchSpeed * dt;
      }
    }

    this.cameraPitch = MathUtils.clamp(
      this.cameraPitch,
      this.cameraMinPitch,
      this.cameraMaxPitch
    );
    this.cameraYawOffset = MathUtils.euclideanModulo(
      this.cameraYawOffset + Math.PI,
      Math.PI * 2
    ) - Math.PI;

    // Position the camera on an orbit around the character using the current yaw and pitch.
    lookTarget.copy(this.mesh.position);
    lookTarget.y += this.cameraTargetHeight;

    const distance = Math.max(0.1, this.cameraDistance);
    const yaw = this.yaw + this.cameraYawOffset;
    const pitch = this.cameraPitch;
    const horizontalDistance = Math.cos(pitch) * distance;

    cameraOffset.set(0, 0, horizontalDistance).applyAxisAngle(UP_AXIS, yaw);
    cameraOffset.y = Math.sin(pitch) * distance;

    this.camera.position.copy(lookTarget).add(cameraOffset);
    this.camera.lookAt(lookTarget);
  }

  handleBlur() {
    this.resetInputState();
  }

  resetInputState() {
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.lookLeft = false;
    this.lookRight = false;
    this.lookUp = false;
    this.lookDown = false;
    this.jumpRequested = false;
  }

  dispose() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    window.removeEventListener("blur", this.handleBlur);
    if (this.mesh) {
      this.scene.remove(this.mesh);
    }
  }
}
