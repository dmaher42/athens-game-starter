// src/world/mainCharacter.js
// Beginner-friendly playable character that demonstrates simple movement,
// smooth rotation, and a following camera in a Three.js scene.

import {
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  MathUtils,
} from "three";

// Reuse the same vectors every frame so we avoid creating garbage objects.
const moveDirection = new Vector3();
const worldDirection = new Vector3();
const cameraOffset = new Vector3();
const lookTarget = new Vector3();
const UP_AXIS = new Vector3(0, 1, 0);

export class MainCharacter {
  constructor(scene, camera, options = {}) {
    // Store references for later use.
    this.scene = scene;
    this.camera = camera;

    // Configuration values with friendly defaults that can be overridden.
    this.speed = options.speed ?? 5; // Units per second.
    this.angularSpeed = options.angularSpeed ?? 3; // Radians per second.

    // Track the player's facing direction (yaw around the Y axis).
    this.yaw = 0;

    // Create a simple placeholder mesh so we can see the player in the world.
    const geometry = new BoxGeometry(1, 2, 1);
    const material = new MeshStandardMaterial({ color: 0x4da6ff });
    this.mesh = new Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.position.set(0, 1, 0); // Lift it so it rests on the ground plane.
    scene.add(this.mesh);

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
      default:
        break;
    }
  }

  update(deltaTime) {
    if (!this.mesh) return;

    // ---------------------------------------------------------------------
    // Movement: determine which direction we want to travel on the XZ plane.
    moveDirection.set(0, 0, 0);
    if (this.moveForward) moveDirection.z -= 1;
    if (this.moveBackward) moveDirection.z += 1;
    if (this.moveLeft) moveDirection.x -= 1;
    if (this.moveRight) moveDirection.x += 1;

    if (moveDirection.lengthSq() === 0) {
      // No input this frame, but keep the camera following the idle character.
      this.updateCamera();
      return;
    }

    moveDirection.normalize();

    // ---------------------------------------------------------------------
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

    // ---------------------------------------------------------------------
    // Movement: convert local direction (forward is -Z) into world space using
    // the player's yaw, then move the mesh by speed * deltaTime.
    worldDirection.copy(moveDirection).applyAxisAngle(UP_AXIS, this.yaw);
    const distance = this.speed * deltaTime;
    this.mesh.position.addScaledVector(worldDirection, distance);

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
