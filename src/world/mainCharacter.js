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

    // Bind event handlers once so we can remove them later if needed.
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    // Listen for WASD or arrow keys to move our placeholder character.
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  handleKeyDown(event) {
    if (event.repeat) return; // Ignore auto-repeat so a held key doesn't spam jumps.
    this.toggleMovement(event.code, true);
  }

  handleKeyUp(event) {
    this.toggleMovement(event.code, false);
  }

  toggleMovement(code, isPressed) {
    switch (code) {
      case "KeyW":
      case "ArrowUp":
        this.moveForward = isPressed;
        break;
      case "KeyS":
      case "ArrowDown":
        this.moveBackward = isPressed;
        break;
      case "KeyA":
      case "ArrowLeft":
        this.moveLeft = isPressed;
        break;
      case "KeyD":
      case "ArrowRight":
        this.moveRight = isPressed;
        break;
      case "Space":
      case "Numpad0":
        if (isPressed) {
          this.jumpRequested = true; // Queue jump so update() can handle physics safely.
        }
        break;
      default:
        break;
    }
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
      const targetYaw = Math.atan2(moveDirection.x, moveDirection.z);
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
    this.updateCamera();
  }

  updateCamera() {
    if (!this.camera) return;

    // Start with an offset directly behind the character (0, 2, 5) and rotate
    // it so the camera stays behind as the character turns.
    cameraOffset.set(0, 2, 5).applyAxisAngle(UP_AXIS, this.yaw);
    this.camera.position.copy(this.mesh.position).add(cameraOffset);

    // Look at the center of the character so they stay in frame.
    lookTarget.copy(this.mesh.position);
    this.camera.lookAt(lookTarget);
  }

  dispose() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    if (this.mesh) {
      this.scene.remove(this.mesh);
    }
  }
}
