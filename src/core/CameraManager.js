// src/core/CameraManager.js
// Handles third-person camera and player controls

import * as THREE from 'three';
import { ThirdPersonCamera } from '../controls/ThirdPersonCamera.js';
import { PlayerController } from '../controls/PlayerController.js';
import { InputMap } from '../input/InputMap.ts';

export const CameraManager = {
  // State
  camera: null,
  playerController: null,
  thirdPersonCamera: null,
  thirdPersonEnabled: false,
  canvas: null,

  // Pointer State
  thirdPersonPointerState: {
    active: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
    pendingUse: false,
    pointerType: null,
  },
  thirdPersonHandlersAttached: false,

  init({ renderer, input, envCollider, terrainHeightSampler, useThirdPerson = true }) {
    this.canvas = renderer.domElement;

    // 1. Create Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      5000
    );
    this.camera.position.set(0, 5, 10);
    this.camera.near = 0.1;
    this.camera.far = 5000;

    // 2. Initialize Player Controller
    // Note: PlayerController expects input map, collider, and options
    this.playerController = new PlayerController(input, envCollider, {
      camera: this.camera,
      terrainHeightSampler,
    });

    // 3. Initialize Third Person Camera
    if (useThirdPerson) {
      const thirdPersonSolids = [];
      if (envCollider?.mesh) thirdPersonSolids.push(envCollider.mesh);
      // Terrain handled by height sampling mostly, but visual mesh can be added if needed

      this.thirdPersonCamera = new ThirdPersonCamera(this.camera, this.playerController.object, {
        targetOffset: new THREE.Vector3(0, this.playerController.height * 0.6, 0),
        followLerp: 0.12,
        rotationLerp: 0.15,
        solids: thirdPersonSolids,
        enabled: false,
        keyOrbit: {
          enabled: true,
          yawSpeed: 0.9,
          pitchSpeed: 0.9,
          minPitch: -0.6,
          maxPitch: 0.6,
          minDist: 2.5,
          maxDist: 7.5,
          zoomSpeed: 4,
        },
      });

      this.setThirdPersonEnabled(useThirdPerson);
    }

    // 4. Handle Resize
    window.addEventListener('resize', this.onResize.bind(this));

    return this.camera;
  },

  update(deltaTime) {
    if (this.playerController) {
      // Sync TPC orientation to player if active
      if (this.thirdPersonCamera && this.thirdPersonEnabled) {
        this.playerController.cameraYaw = this.thirdPersonCamera.getYaw();
        this.playerController.cameraPitch = this.thirdPersonCamera.getPitch();
      }

      this.playerController.update(deltaTime);
    }

    if (this.thirdPersonCamera) {
      this.thirdPersonCamera.update(deltaTime);
    }
  },

  onResize() {
    if (!this.camera) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    // Renderer resize handled elsewhere (Application/Scene)
  },

  setThirdPersonEnabled(enabled) {
    if (!this.thirdPersonCamera) return;

    const next = !!enabled;
    if (this.thirdPersonEnabled === next) return;

    this.thirdPersonEnabled = next;
    this.thirdPersonCamera.setEnabled(next);

    if (next) {
      this.thirdPersonCamera.setAngles(
        this.playerController.cameraYaw ?? 0,
        this.playerController.cameraPitch ?? 0,
        { snap: true }
      );
      this.thirdPersonCamera.update(0);
      this._attachThirdPersonPointer();

      // Exit pointer lock if active
      if (
        typeof document !== "undefined" &&
        document.pointerLockElement === this.canvas &&
        typeof document.exitPointerLock === "function"
      ) {
        try { document.exitPointerLock(); } catch {}
      }
    } else {
      this.thirdPersonCamera.setAngles(
        this.playerController.cameraYaw ?? 0,
        this.playerController.cameraPitch ?? 0,
        { snap: true }
      );
      this._detachThirdPersonPointer();
    }
  },

  toggleThirdPerson() {
      this.setThirdPersonEnabled(!this.thirdPersonEnabled);
  },

  getCamera() {
    return this.camera;
  },

  getController() {
    return this.playerController;
  },

  getPlayer() {
    return this.playerController?.object;
  },

  getThirdPersonCamera() {
    return this.thirdPersonCamera;
  },

  // --- Pointer Logic for Third Person Drag ---

  _clearThirdPersonPointer() {
    if (this.thirdPersonPointerState.pointerId !== null) {
      try {
        this.canvas.releasePointerCapture(this.thirdPersonPointerState.pointerId);
      } catch {}
    }
    this.thirdPersonPointerState.active = false;
    this.thirdPersonPointerState.pointerId = null;
    this.thirdPersonPointerState.pendingUse = false;
    this.thirdPersonPointerState.pointerType = null;
  },

  _onThirdPersonPointerDown(event) {
    if (!this.thirdPersonEnabled || !this.thirdPersonCamera) return;
    if (!event.isPrimary) return;
    if (event.pointerType !== "touch" && event.button !== 0) return;

    this.thirdPersonPointerState.active = true;
    this.thirdPersonPointerState.pointerId = event.pointerId;
    this.thirdPersonPointerState.lastX = event.clientX;
    this.thirdPersonPointerState.lastY = event.clientY;
    this.thirdPersonPointerState.pointerType = event.pointerType;
    this.thirdPersonPointerState.pendingUse = event.button === 0 || event.pointerType === "touch";

    try {
      this.canvas.setPointerCapture(event.pointerId);
    } catch {}

    event.preventDefault();
  },

  _onThirdPersonPointerMove(event) {
    if (!this.thirdPersonPointerState.active) return;
    if (this.thirdPersonPointerState.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - this.thirdPersonPointerState.lastX;
    const deltaY = event.clientY - this.thirdPersonPointerState.lastY;

    this.thirdPersonPointerState.lastX = event.clientX;
    this.thirdPersonPointerState.lastY = event.clientY;

    const DRAG_THRESHOLD = 1.5;

    if (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD) {
      this.thirdPersonPointerState.pendingUse = false;
    }

    if (this.thirdPersonCamera) {
      this.thirdPersonCamera.handlePointer(deltaX, deltaY);
    }

    event.preventDefault();
  },

  _onThirdPersonPointerUp(event) {
    if (this.thirdPersonPointerState.pointerId !== event.pointerId) return;

    // pendingUse logic usually triggers "interact", but CameraManager doesn't own interaction.
    // It should probably expose "wasClick" or similar, or just clear.
    // Application.js handles click-to-interact.
    // We just need to clear drag state.

    this._clearThirdPersonPointer();
    event.preventDefault();
  },

  _onThirdPersonPointerCancel() {
    if (!this.thirdPersonPointerState.active) return;
    this._clearThirdPersonPointer();
  },

  _attachThirdPersonPointer() {
    if (this.thirdPersonHandlersAttached || !this.canvas) return;
    this.thirdPersonHandlersAttached = true;

    this._boundDown = this._onThirdPersonPointerDown.bind(this);
    this._boundMove = this._onThirdPersonPointerMove.bind(this);
    this._boundUp = this._onThirdPersonPointerUp.bind(this);
    this._boundCancel = this._onThirdPersonPointerCancel.bind(this);

    this.canvas.addEventListener("pointerdown", this._boundDown);
    this.canvas.addEventListener("pointermove", this._boundMove);
    this.canvas.addEventListener("pointerup", this._boundUp);
    this.canvas.addEventListener("pointercancel", this._boundCancel);
    this.canvas.addEventListener("lostpointercapture", this._boundCancel);
    window.addEventListener("blur", this._boundCancel);
  },

  _detachThirdPersonPointer() {
    if (!this.thirdPersonHandlersAttached || !this.canvas) return;
    this.thirdPersonHandlersAttached = false;

    this.canvas.removeEventListener("pointerdown", this._boundDown);
    this.canvas.removeEventListener("pointermove", this._boundMove);
    this.canvas.removeEventListener("pointerup", this._boundUp);
    this.canvas.removeEventListener("pointercancel", this._boundCancel);
    this.canvas.removeEventListener("lostpointercapture", this._boundCancel);
    window.removeEventListener("blur", this._boundCancel);

    this._clearThirdPersonPointer();
  }
};
