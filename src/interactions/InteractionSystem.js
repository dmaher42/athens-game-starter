import * as THREE from 'three';

export class InteractionSystem {
  /**
   * @param {import('../input/InputMap').InputMap} input
   * @param {THREE.Camera} camera
   * @param {THREE.Scene} scene
   * @param {import('../ui/interactionHud').InteractionHud} hud
   */
  constructor(input, camera, scene, hud) {
    this.input = input;
    this.camera = camera;
    this.scene = scene;
    this.hud = hud;

    this.raycastInterval = 100; // ms
    this.lastRaycast = 0;
    this.raycaster = new THREE.Raycaster();
    this.center = new THREE.Vector2(0, 0); // Center of screen

    this.currentInteractable = null;
    this.currentObject = null;
    this.interactables = [];
  }

  update(dt) {
    // Only raycast periodically to save performance
    const now = performance.now();
    if (now - this.lastRaycast > this.raycastInterval) {
      this.performRaycast();
      this.lastRaycast = now;
    }

    // Handle Input
    if (this.currentInteractable && this.input.consumeInteract()) {
      if (this.currentInteractable.onInteract) {
        this.currentInteractable.onInteract();
      }
    }
  }

  performRaycast() {
    this.raycaster.setFromCamera(this.center, this.camera);

    // We only want objects marked as interactable or their children
    // However, THREE.Raycaster.intersectObjects is expensive if we check the whole scene.
    // Ideally we maintain a list of interactables.
    // For now, we will traverse the scene looking for userData.interactable but that is too slow.
    // BETTER: The app should register interactables, or we put them in a specific group.

    // Fallback: We'll assume interactables are added to a specific group or we assume
    // the user passes a list of objects to check.
    // For simplicity in this task, let's look for a specific global array or group if it exists,
    // otherwise, we might have to search everything (dangerous).

    // Let's assume we search the whole scene but filter fast? No, scene graph is big.
    // Let's create a registry in this class.

    const candidates = this.getInteractableObjects();

    const intersects = this.raycaster.intersectObjects(candidates, true);

    let found = null;
    let foundObj = null;

    for (const hit of intersects) {
      // Find the first object that has interactable data (could be parent)
      let obj = hit.object;
      let data = null;

      while(obj) {
        if (obj.userData && obj.userData.interactable) {
          data = obj.userData.interactable;
          break;
        }
        obj = obj.parent;
      }

      if (data) {
        const distLimit = data.distance ?? 4.0;
        if (hit.distance <= distLimit) {
          found = data;
          foundObj = obj;
        }
        break; // Closest valid hit
      }
    }

    if (found !== this.currentInteractable) {
      this.currentInteractable = found;
      this.currentObject = foundObj;

      if (found) {
        this.hud.show(found.label || "Interact");
      } else {
        this.hud.hide();
      }
    }
  }

  // Registry for interactables to avoid scanning the whole world
  // But for the sake of the task "attach scripts", usually in Unity you attach a script.
  // In Three.js, we attach userData.
  // To make it efficient, we need a list.

  register(object, config) {
    object.userData.interactable = config;
    this.interactables.push(object);
  }

  unregister(object) {
    const idx = this.interactables.indexOf(object);
    if (idx > -1) this.interactables.splice(idx, 1);
    if (object.userData.interactable) {
        delete object.userData.interactable;
    }
  }

  getInteractableObjects() {
    // If we have a manual registry, use it.
    if (!this.interactables) this.interactables = [];
    return this.interactables;
  }
}
