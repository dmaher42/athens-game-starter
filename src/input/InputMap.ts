import {
  loadSettings,
  subscribe,
  defaultCameraSettings,
  type CameraSettings,
} from "../state/settingsStore";
import {
  MOVEMENT_ONLY_KEYS,
  ALL_LOOK_KEYS,
  ACTION_KEYS,
  flattenKeyGroups,
} from "./keyBindings";

const LOOK_KEY_LIST = flattenKeyGroups(ALL_LOOK_KEYS);
const MOVEMENT_KEY_LIST = flattenKeyGroups(MOVEMENT_ONLY_KEYS);
const ACTION_KEY_LIST = flattenKeyGroups(ACTION_KEYS);

const CONTROL_KEYS = new Set<string>([
  ...MOVEMENT_KEY_LIST,
  ...LOOK_KEY_LIST,
  ...ACTION_KEY_LIST,
]);

const NON_TYPING_INPUT_TYPES = new Set<string>([
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

function isEditableTarget(target: EventTarget | null): target is HTMLElement {
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

export interface LookDelta {
  yaw: number;
  pitch: number;
}

type KeyHandler = (event: KeyboardEvent) => void;
type MouseHandler = (event: MouseEvent) => void;
type FocusHandler = (event: FocusEvent) => void;

export class InputMap {
  private readonly keys: Set<string> = new Set();
  private readonly canvas: HTMLCanvasElement | null;
  private flyToggleQueued = false;
  private cameraSettings: CameraSettings | null;
  private unsubscribeCameraSettings: (() => void) | null = null;

  private readonly mouseDelta = { x: 0, y: 0 };
  private mouseSensitivity = 0.002;

  private readonly keyDownHandler: KeyHandler;
  private readonly keyUpHandler: KeyHandler;
  private readonly blurHandler: FocusHandler;
  private readonly mouseMoveHandler: MouseHandler;
  private readonly clickHandler: MouseHandler;

  constructor(canvas: HTMLCanvasElement | null = null) {
    this.canvas = canvas;

    // CameraSettingsStore: sync arrow-key look speeds
    this.cameraSettings = loadSettings();
    this.unsubscribeCameraSettings = subscribe((settings) => {
      this.cameraSettings = settings;
    });

    this.keyDownHandler = (event: KeyboardEvent) => {
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

    this.keyUpHandler = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }
      this.keys.delete(event.code);
      if (CONTROL_KEYS.has(event.code)) {
        event.preventDefault();
      }
    };

    this.blurHandler = () => {
      this.resetKeys();
      this.flyToggleQueued = false;
      this.mouseDelta.x = 0;
      this.mouseDelta.y = 0;
    };

    this.mouseMoveHandler = (event: MouseEvent) => {
      if (document.pointerLockElement === this.canvas) {
        this.mouseDelta.x += event.movementX;
        this.mouseDelta.y += event.movementY;
      }
    };

    this.clickHandler = () => {
      if (this.canvas && document.pointerLockElement !== this.canvas) {
        this.canvas.requestPointerLock();
      }
    };

    window.addEventListener("keydown", this.keyDownHandler);
    window.addEventListener("keyup", this.keyUpHandler);
    window.addEventListener("blur", this.blurHandler);
    window.addEventListener("focus", this.blurHandler);
    window.addEventListener("mousemove", this.mouseMoveHandler);

    if (this.canvas) {
      this.canvas.addEventListener("click", this.clickHandler);
    }
  }

  dispose(): void {
    window.removeEventListener("keydown", this.keyDownHandler);
    window.removeEventListener("keyup", this.keyUpHandler);
    window.removeEventListener("blur", this.blurHandler);
    window.removeEventListener("focus", this.blurHandler);
    window.removeEventListener("mousemove", this.mouseMoveHandler);

    if (this.canvas) {
      this.canvas.removeEventListener("click", this.clickHandler);
    }

    this.unsubscribeCameraSettings?.();
    this.unsubscribeCameraSettings = null;
  }

  consumeLookDelta(dt = 0): LookDelta {
    const settings = this.cameraSettings || defaultCameraSettings;

    // Keyboard Input
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

    let yawDelta = 0;
    let pitchDelta = 0;

    if (settings.enableArrowOrbit) {
        yawDelta += yawInput * yawSpeed * dtSafe;
        pitchDelta += pitchInput * pitchSpeed * dtSafe * invert;
    }

    // Mouse Input
    // Yaw: moving mouse right (positive X) -> turn right (positive yaw delta)
    // Pitch: moving mouse down (positive Y) -> look down (positive pitch delta when NOT inverted?)
    // Wait, pitch behavior depends on invert setting.
    // In PlayerController:
    // cameraPitch -= lookDelta.pitch
    // If I move mouse DOWN (+Y), I want to look down (camera pitch DECREASES, towards -90 or similar).
    // So lookDelta.pitch should be POSITIVE.
    // +Y * sensitivity = +pitchDelta.
    // If Inverted:
    // Move mouse DOWN (+Y) -> Look UP (camera pitch INCREASES).
    // So lookDelta.pitch should be NEGATIVE.
    // So pitchDelta = mouseDelta.y * sensitivity * invert?
    // Let's check:
    // Normal (invert=1): +Y -> +pitchDelta -> cameraPitch -= +pitchDelta (DECREASES). Correct.
    // Inverted (invert=-1): +Y -> -pitchDelta -> cameraPitch -= -pitchDelta (INCREASES). Correct.

    const mouseYawDelta = this.mouseDelta.x * this.mouseSensitivity;
    const mousePitchDelta = this.mouseDelta.y * this.mouseSensitivity * invert;

    yawDelta += mouseYawDelta;
    pitchDelta += mousePitchDelta;

    // Reset accumulated mouse delta
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;

    return {
      yaw: yawDelta,
      pitch: pitchDelta,
    };
  }

  isDown(code: string): boolean {
    return this.keys.has(code);
  }

  isAnyDown(codes: readonly string[] = []): boolean {
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

  get forward(): boolean {
    return this.isAnyDown(MOVEMENT_ONLY_KEYS.forward);
  }

  get back(): boolean {
    return this.isAnyDown(MOVEMENT_ONLY_KEYS.back);
  }

  get left(): boolean {
    return this.isAnyDown(MOVEMENT_ONLY_KEYS.left);
  }

  get right(): boolean {
    return this.isAnyDown(MOVEMENT_ONLY_KEYS.right);
  }

  get sprint(): boolean {
    return this.isDown("ShiftLeft") || this.isDown("ShiftRight");
  }

  get jump(): boolean {
    return this.isDown("Space");
  }

  get flyUp(): boolean {
    return this.isDown("Space");
  }

  get flyDown(): boolean {
    return this.isDown("ControlLeft") || this.isDown("ControlRight");
  }

  get lookLeft(): boolean {
    return this.isAnyDown(ALL_LOOK_KEYS.left);
  }

  get lookRight(): boolean {
    return this.isAnyDown(ALL_LOOK_KEYS.right);
  }

  get lookUp(): boolean {
    return this.isAnyDown(ALL_LOOK_KEYS.up);
  }

  get lookDown(): boolean {
    return this.isAnyDown(ALL_LOOK_KEYS.down);
  }

  get crouch(): boolean {
    return this.isAnyDown(ACTION_KEYS.crouch);
  }

  consumeFlyToggle(): boolean {
    if (!this.flyToggleQueued) return false;
    this.flyToggleQueued = false;
    return true;
  }

  private resetKeys(): void {
    this.keys.clear();
  }
}

export default InputMap;
