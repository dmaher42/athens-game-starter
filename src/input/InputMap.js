const MOVEMENT_KEYS = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ShiftLeft",
  "ShiftRight",
  "Space",
]);

/**
 * @typedef {{ yaw: number, pitch: number }} LookDelta
 */

export class InputMap {
  /**
   * @param {HTMLCanvasElement | null} [canvas]
   */
  constructor(canvas = null) {
    /** @private */
    this.keys = new Set();
    /** @type {boolean} */
    this.pointerLocked = false;
    /** @private */
    this.canvas = canvas;

    /** @private */
    this.lookYaw = 0;
    /** @private */
    this.lookPitch = 0;

    /** @private */
    this.keyDownHandler = (event) => {
      this.keys.add(event.code);
      if (MOVEMENT_KEYS.has(event.code)) {
        event.preventDefault();
      }
    };
    /** @private */
    this.keyUpHandler = (event) => {
      this.keys.delete(event.code);
      if (MOVEMENT_KEYS.has(event.code)) {
        event.preventDefault();
      }
    };
    /** @private */
    this.blurHandler = () => {
      this.resetKeys();
    };
    /** @private */
    this.pointerMoveHandler = (event) => {
      this.onLook(event.movementX, event.movementY);
    };
    /** @private */
    this.pointerLockChangeHandler = () => {
      const locked = document.pointerLockElement === this.canvas;

      if (locked && !this.pointerLocked) {
        document.addEventListener("pointermove", this.pointerMoveHandler);
      } else if (!locked && this.pointerLocked) {
        document.removeEventListener("pointermove", this.pointerMoveHandler);
        this.resetLookDelta();
      }

      this.pointerLocked = locked;
    };

    window.addEventListener("keydown", this.keyDownHandler);
    window.addEventListener("keyup", this.keyUpHandler);
    window.addEventListener("blur", this.blurHandler);
    window.addEventListener("focus", this.blurHandler);
    document.addEventListener("pointerlockchange", this.pointerLockChangeHandler);
  }

  dispose() {
    window.removeEventListener("keydown", this.keyDownHandler);
    window.removeEventListener("keyup", this.keyUpHandler);
    window.removeEventListener("blur", this.blurHandler);
    window.removeEventListener("focus", this.blurHandler);
    document.removeEventListener("pointerlockchange", this.pointerLockChangeHandler);
    document.removeEventListener("pointermove", this.pointerMoveHandler);
  }

  requestPointerLock() {
    this.canvas?.requestPointerLock?.();
  }

  releasePointerLock() {
    if (document.pointerLockElement === this.canvas) {
      document.exitPointerLock?.();
    }
  }

  /**
   * @param {number} dx
   * @param {number} dy
   */
  onLook(dx, dy) {
    const sensitivity = 0.0025;
    this.lookYaw += dx * sensitivity;
    this.lookPitch += dy * sensitivity;
  }

  /**
   * @returns {LookDelta}
   */
  consumeLookDelta() {
    const yaw = this.lookYaw;
    const pitch = this.lookPitch;
    this.resetLookDelta();
    return { yaw, pitch };
  }

  get yawDelta() {
    return this.lookYaw;
  }

  get pitchDelta() {
    return this.lookPitch;
  }

  /**
   * @param {string} code
   */
  isDown(code) {
    return this.keys.has(code);
  }

  get forward() {
    return this.isDown("KeyW") || this.isDown("ArrowUp");
  }

  get back() {
    return this.isDown("KeyS") || this.isDown("ArrowDown");
  }

  get left() {
    return this.isDown("KeyA") || this.isDown("ArrowLeft");
  }

  get right() {
    return this.isDown("KeyD") || this.isDown("ArrowRight");
  }

  get sprint() {
    return this.isDown("ShiftLeft") || this.isDown("ShiftRight");
  }

  get jump() {
    return this.isDown("Space");
  }

  /** @private */
  resetKeys() {
    this.keys.clear();
  }

  /** @private */
  resetLookDelta() {
    this.lookYaw = 0;
    this.lookPitch = 0;
  }
}

export default InputMap;
