import {
  loadSettings,
  subscribe,
  defaultCameraSettings,
} from "../state/settingsStore.ts";
import { MOVEMENT_ONLY_KEYS, LOOK_KEYS, flattenKeyGroups } from "./keyBindings.js";

const LOOK_KEY_LIST = flattenKeyGroups(LOOK_KEYS);
const MOVEMENT_KEY_LIST = flattenKeyGroups(MOVEMENT_ONLY_KEYS);

const CONTROL_KEYS = new Set([
  ...MOVEMENT_KEY_LIST,
  ...LOOK_KEY_LIST,
  "ShiftLeft",
  "ShiftRight",
  "Space",
  "ControlLeft",
  "ControlRight",
  "KeyF",
]);

const NON_TYPING_INPUT_TYPES = new Set([
  "button",
  "checkbox",
  "radio",
  "range",
  "submit",
  "reset",
  "file",
  "color",
  "image",
]);

/**
 * @param {EventTarget | null} target
 */
function isEditableTarget(target) {
  if (!target || typeof target !== "object") {
    return false;
  }

  if (typeof HTMLElement === "undefined" || !(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  if (typeof HTMLInputElement !== "undefined" && target instanceof HTMLInputElement) {
    const type = target.type?.toLowerCase?.() ?? "";
    return !NON_TYPING_INPUT_TYPES.has(type);
  }

  if (typeof HTMLTextAreaElement !== "undefined" && target instanceof HTMLTextAreaElement) {
    return true;
  }

  return false;
}

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
      if (isEditableTarget(event.target)) {
        return;
      }
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
      if (isEditableTarget(event.target)) {
        return;
      }
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

  /**
   * @param {string[]} codes
   */
  isAnyDown(codes = []) {
    if (!Array.isArray(codes) || codes.length === 0) {
      return false;
    }
    for (const code of codes) {
      if (this.keys.has(code)) {
        return true;
      }
    }
    return false;
  }

  get forward() {
    return this.isAnyDown(MOVEMENT_ONLY_KEYS.forward);
  }

  get back() {
    return this.isAnyDown(MOVEMENT_ONLY_KEYS.back);
  }

  get left() {
    return this.isAnyDown(MOVEMENT_ONLY_KEYS.left);
  }

  get right() {
    return this.isAnyDown(MOVEMENT_ONLY_KEYS.right);
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
    return this.isAnyDown(LOOK_KEYS.left);
  }

  get lookRight() {
    return this.isAnyDown(LOOK_KEYS.right);
  }

  get lookUp() {
    return this.isAnyDown(LOOK_KEYS.up);
  }

  get lookDown() {
    return this.isAnyDown(LOOK_KEYS.down);
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
