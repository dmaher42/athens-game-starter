// src/world/mainCharacter.js
// Simple playable character controller that demonstrates how to move a mesh
// around a Three.js scene using keyboard input. Everything is commented for
// beginners so feel free to explore and tweak!

import {
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  MathUtils,
} from "three";

// Reusable vectors so we do not create new temporary objects every frame.
const scratchDirection = new Vector3();
const scratchCameraOffset = new Vector3();
const scratchLookTarget = new Vector3();
const WORLD_UP = new Vector3(0, 1, 0);

export class MainCharacter {
  constructor(scene, camera, options = {}) {
    this.scene = scene;
    this.camera = camera;

    // Provide friendly defaults while allowing callers to override them.
    this.options = {
      speed: options.speed ?? 5, // Movement speed (units per second)
      angularSpeed: options.angularSpeed ?? Math.PI * 2, // Radians per second
      cameraOffset:
        options.cameraOffset?.clone?.() ?? new Vector3(0, 2, 6), // Camera follow offset
    };

    // Create a very simple placeholder mesh so we can see the character.
    const geometry = new BoxGeometry(1, 2, 1);
    const material = new MeshStandardMaterial({ color: 0x6699ff });
    this.mesh = new Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.position.set(0, 1, 0); // Lift the box so it sits on the ground.

    scene.add(this.mesh);

    // Track the desired movement direction using simple boolean flags.
    this.movement = {
      forward: false,
      backward: false,
      left: false,
      right: false,
    };

    // Bind the event handlers so we can add and remove them if needed later.
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    // Listen for key presses. These toggle the movement flags above.
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  // Remember to clean up the listeners if this character is ever destroyed.
  dispose() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  onKeyDown(event) {
    switch (event.code) {
      case "KeyW":
        this.movement.forward = true;
        break;
      case "KeyS":
        this.movement.backward = true;
        break;
      case "KeyA":
        this.movement.left = true;
        break;
      case "KeyD":
        this.movement.right = true;
        break;
      default:
        break;
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case "KeyW":
        this.movement.forward = false;
        break;
      case "KeyS":
        this.movement.backward = false;
        break;
      case "KeyA":
        this.movement.left = false;
        break;
      case "KeyD":
        this.movement.right = false;
        break;
      default:
        break;
    }
  }

  update(deltaTime, sunDir) {
    if (!this.mesh) return;

    // deltaTime is the time since the last frame. Multiplying by speed makes
    // the movement frame-rate independent.
    const moveAmount = this.options.speed * deltaTime;

    // Figure out which direction we should be moving on the XZ plane.
    const direction = scratchDirection.set(0, 0, 0);
    if (this.movement.forward) direction.z -= 1;
    if (this.movement.backward) direction.z += 1;
    if (this.movement.left) direction.x -= 1;
    if (this.movement.right) direction.x += 1;

    // Normalize so diagonal movement is not faster than straight movement.
    if (direction.lengthSq() > 0) {
      direction.normalize();

      // Face the direction we are traveling by turning towards the target angle.
      const targetAngle = Math.atan2(direction.x, direction.z);
      const currentAngle = this.mesh.rotation.y;
      const angleDiff = MathUtils.euclideanModulo(
        targetAngle - currentAngle + Math.PI,
        Math.PI * 2
      ) - Math.PI;
      const maxTurn = this.options.angularSpeed * deltaTime;
      const clampedTurn = MathUtils.clamp(angleDiff, -maxTurn, maxTurn);
      this.mesh.rotation.y = currentAngle + clampedTurn;

      // Move the character along the ground plane.
      this.mesh.position.addScaledVector(direction, moveAmount);

      // In the future this is where collision detection would be applied.
    }

    // Keep the camera following behind the player.
    if (this.camera) {
      const offset = scratchCameraOffset
        .copy(this.options.cameraOffset)
        .applyAxisAngle(WORLD_UP, this.mesh.rotation.y);

      this.camera.position.copy(this.mesh.position).add(offset);
      // Look at a point slightly above the character so we see their body.
      const lookTarget = scratchLookTarget
        .copy(this.mesh.position)
        .addScaledVector(WORLD_UP, 1);
      this.camera.lookAt(lookTarget);
    }

    // sunDir is accepted so lighting-based effects can be added later without
    // changing the method signature. For now it is not used.
  }
}
