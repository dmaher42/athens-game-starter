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

export interface LookDelta {
  yaw: number;
  pitch: number;
}

export class InputMap {
  private keys = new Set<string>();
  public pointerLocked = false;

  private readonly canvas: HTMLCanvasElement | null;
  private readonly keyDownHandler = (event: KeyboardEvent) => {
    this.keys.add(event.code);
    if (MOVEMENT_KEYS.has(event.code)) {
      event.preventDefault();
    }
  };
  private readonly keyUpHandler = (event: KeyboardEvent) => {
    this.keys.delete(event.code);
    if (MOVEMENT_KEYS.has(event.code)) {
      event.preventDefault();
    }
  };
  private readonly blurHandler = () => {
    this.resetKeys();
  };
  private readonly pointerMoveHandler = (event: PointerEvent) => {
    this.onLook(event.movementX, event.movementY);
  };
  private readonly pointerLockChangeHandler = () => {
    const locked = document.pointerLockElement === this.canvas;

    if (locked && !this.pointerLocked) {
      document.addEventListener("pointermove", this.pointerMoveHandler);
    } else if (!locked && this.pointerLocked) {
      document.removeEventListener("pointermove", this.pointerMoveHandler);
      this.resetLookDelta();
    }

    this.pointerLocked = locked;
  };

  private lookYaw = 0;
  private lookPitch = 0;

  constructor(canvas: HTMLCanvasElement | null = null) {
    this.canvas = canvas;

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

  onLook(dx: number, dy: number) {
    const sensitivity = 0.0025;
    this.lookYaw += dx * sensitivity;
    this.lookPitch += dy * sensitivity;
  }

  consumeLookDelta(): LookDelta {
    const yaw = this.lookYaw;
    const pitch = this.lookPitch;
    this.resetLookDelta();
    return { yaw, pitch };
  }

  get yawDelta() { return this.lookYaw; }
  get pitchDelta() { return this.lookPitch; }

  isDown(code: string) {
    return this.keys.has(code);
  }

  // convenience getters
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

  private resetKeys() {
    this.keys.clear();
  }

  private resetLookDelta() {
    this.lookYaw = 0;
    this.lookPitch = 0;
  }
}

export default InputMap;
