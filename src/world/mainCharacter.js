// src/world/mainCharacter.js
// Beginner-friendly player controller that demonstrates how to move a mesh
// around a Three.js world using keyboard input. Every major step is commented
// so you can follow along with what is happening under the hood.

import {
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  MathUtils,
} from "three";

// Re-use a couple of vectors each frame so we avoid creating lots of temporary
// objects. This keeps garbage collection from interrupting our animation loop.
const scratchInputDirection = new Vector3();
const scratchWorldDirection = new Vector3();
const scratchCameraOffset = new Vector3();
const scratchLookTarget = new Vector3();
const WORLD_UP = new Vector3(0, 1, 0);

export class MainCharacter {
  constructor(scene, camera, options = {}) {
    this.scene = scene;
    this.camera = camera;

    // Store the basic configuration with sensible defaults so new developers
    // can create a character without passing any extra parameters.
    this.speed = options.speed ?? 5; // Units moved per second.
    this.angularSpeed = options.angularSpeed ?? 3; // Radians turned per second.
    this.cameraOffset =
      options.cameraOffset?.clone?.() ?? new Vector3(0, 2, 5); // Third-person follow distance.

    // Create a very simple placeholder mesh so we can see something in the
    // scene. You can later swap this out for a character model or animated rig.
    const geometry = new BoxGeometry(1, 2, 1);
    const material = new MeshStandardMaterial({ color: 0x6699ff });
    this.mesh = new Mesh(geometry, material);
    this.mesh.castShadow = true;

    // Place the mesh so it sits on the ground and face it toward the negative Z
    // axis (the direction our "forward" input will move toward).
    this.mesh.position.set(0, 1, 0);
    this.yaw = 0; // When yaw is 0 the character looks down the negative Z axis.
    this.mesh.rotation.y = this.yaw;

    scene.add(this.mesh);

    // Flags that track which movement keys are currently pressed.
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    // Bind event handlers once so we can add/remove them cleanly if the
    // character is destroyed later.
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    // Listen for both WASD and arrow keys so people with different keyboard
    // preferences can play immediately.
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  // If you ever remove the character from the scene call dispose() so the
  // keyboard listeners are cleaned up and do not leak memory.
  dispose() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  onKeyDown(event) {
    switch (event.code) {
      case "KeyW":
      case "ArrowUp":
        this.moveForward = true;
        break;
      case "KeyS":
      case "ArrowDown":
        this.moveBackward = true;
        break;
      case "KeyA":
      case "ArrowLeft":
        this.moveLeft = true;
        break;
      case "KeyD":
      case "ArrowRight":
        this.moveRight = true;
        break;
      default:
        break;
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case "KeyW":
      case "ArrowUp":
        this.moveForward = false;
        break;
      case "KeyS":
      case "ArrowDown":
        this.moveBackward = false;
        break;
      case "KeyA":
      case "ArrowLeft":
        this.moveLeft = false;
        break;
      case "KeyD":
      case "ArrowRight":
        this.moveRight = false;
        break;
      default:
        break;
    }
  }

  update(deltaTime) {
    if (!this.mesh) return;

    // --- Movement ---------------------------------------------------------
    // Build a direction vector from the currently pressed keys. Negative Z is
    // forward, positive Z is backward, and the X axis handles strafing.
    const direction = scratchInputDirection.set(0, 0, 0);
    if (this.moveForward) direction.z -= 1;
    if (this.moveBackward) direction.z += 1;
    if (this.moveLeft) direction.x -= 1;
    if (this.moveRight) direction.x += 1;

    if (direction.lengthSq() > 0) {
      // Normalize so diagonal movement is not faster than straight movement.
      direction.normalize();

      // Determine the yaw (rotation around the Y axis) the player should face.
      const targetYaw = Math.atan2(direction.x, -direction.z);
      const angleDiff = MathUtils.euclideanModulo(
        targetYaw - this.yaw + Math.PI,
        Math.PI * 2
      ) - Math.PI;
      const maxTurn = this.angularSpeed * deltaTime;
      const clampedTurn = MathUtils.clamp(angleDiff, -maxTurn, maxTurn);
      this.yaw += clampedTurn;
      this.mesh.rotation.y = this.yaw;

      // Rotate the local direction by the player's yaw so the mesh moves in the
      // direction it is facing. This makes strafing respect the current turn.
      const worldDirection = scratchWorldDirection
        .copy(direction)
        .applyAxisAngle(WORLD_UP, this.yaw);

      this.mesh.position.addScaledVector(
        worldDirection,
        this.speed * deltaTime
      );
    }

    // --- Camera follow ----------------------------------------------------
    if (this.camera) {
      // Take the desired camera offset, rotate it so it sits behind the player
      // relative to their yaw, then position the camera there.
      const offset = scratchCameraOffset
        .copy(this.cameraOffset)
        .applyAxisAngle(WORLD_UP, this.yaw);

      this.camera.position.copy(this.mesh.position).add(offset);

      // Look slightly above the character so we see their entire body.
      const lookTarget = scratchLookTarget
        .copy(this.mesh.position)
        .addScaledVector(WORLD_UP, 1);
      this.camera.lookAt(lookTarget);
    }
  }
}
