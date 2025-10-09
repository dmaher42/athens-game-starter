import {
  loadSettings,
  subscribe,
  defaultCameraSettings,
} from "../state/settingsStore.js";

const CONTROL_KEYS = new Set([
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
  "ControlLeft",
  "ControlRight",
  "KeyF",
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
    /** @private */
    this.canvas = canvas;

    /** @private */
    this.flyToggleQueued = false;

    // CameraSettingsStore: sync arrow-key look speeds
    /** @private */
    this.cameraSettings = loadSettings();
    /** @private */
    this.unsubscribeCameraSettings = subscribe((settings) => {
      this.cameraSettings = settings;
    });

    /** @private */
    this.keyDownHandler = (event) => {
      this.keys.add(event.code);
      if (event.code === "KeyF" && !event.repeat) {
        this.flyToggleQueued = true;
      }
      if (CONTROL_KEYS.has(event.code)) {
        event.preventDefault();
      }
    };
    /** @private */
    this.keyUpHandler = (event) => {
      this.keys.delete(event.code);
      if (CONTROL_KEYS.has(event.code)) {
        event.preventDefault();
      }
    };
    /** @private */
    this.blurHandler = () => {
      this.resetKeys();
      this.flyToggleQueued = false;
    };
    /** @private */
    window.addEventListener("keydown", this.keyDownHandler);
    window.addEventListener("keyup", this.keyUpHandler);
    window.addEventListener("blur", this.blurHandler);
    window.addEventListener("focus", this.blurHandler);
  }

  dispose() {
    window.removeEventListener("keydown", this.keyDownHandler);
    window.removeEventListener("keyup", this.keyUpHandler);
    window.removeEventListener("blur", this.blurHandler);
    window.removeEventListener("focus", this.blurHandler);
    this.unsubscribeCameraSettings?.();
    this.unsubscribeCameraSettings = null;
  }

  /**
   * @param {number} [dt=0]
   * @returns {LookDelta}
   */
  consumeLookDelta(dt = 0) {
    const settings = this.cameraSettings || defaultCameraSettings;
    if (!settings.enableArrowOrbit) {
      return { yaw: 0, pitch: 0 };
    }

    const yawInput = (this.lookRight ? 1 : 0) - (this.lookLeft ? 1 : 0);
    const pitchInput = (this.lookDown ? 1 : 0) - (this.lookUp ? 1 : 0);
    const yawSpeed = Number.isFinite(settings.yawSpeed)
      ? settings.yawSpeed
      : defaultCameraSettings.yawSpeed;
    const pitchSpeed = Number.isFinite(settings.pitchSpeed)
      ? settings.pitchSpeed
      : defaultCameraSettings.pitchSpeed;
    const invert = settings.invertPitch ? -1 : 1;
    const dtSafe = Number.isFinite(dt) ? Math.max(0, dt) : 0;

    const yawDelta = yawInput * yawSpeed * dtSafe;
    const pitchDelta = pitchInput * pitchSpeed * dtSafe * invert;

    return {
      yaw: yawDelta,
      pitch: pitchDelta,
    };
  }

  /**
   * @param {string} code
   */
  isDown(code) {
    return this.keys.has(code);
  }

  get forward() {
    return this.isDown("KeyW");
  }

  get back() {
    return this.isDown("KeyS");
  }

  get left() {
    return this.isDown("KeyA");
  }

  get right() {
    return this.isDown("KeyD");
  }

  get sprint() {
    return this.isDown("ShiftLeft") || this.isDown("ShiftRight");
  }

  get jump() {
    return this.isDown("Space");
  }

  get flyUp() {
    return this.isDown("Space");
  }

  get flyDown() {
    return this.isDown("ControlLeft") || this.isDown("ControlRight");
  }

  get lookLeft() {
    return this.isDown("ArrowLeft");
  }

  get lookRight() {
    return this.isDown("ArrowRight");
  }

  get lookUp() {
    return this.isDown("ArrowUp");
  }

  get lookDown() {
    return this.isDown("ArrowDown");
  }

  consumeFlyToggle() {
    if (!this.flyToggleQueued) return false;
    this.flyToggleQueued = false;
    return true;
  }

  /** @private */
  resetKeys() {
    this.keys.clear();
  }

}

export default InputMap;
