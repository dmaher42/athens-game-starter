import * as THREE from 'three';
import { loadGLBWithFallbacks } from '../utils/glbSafeLoader.js';

/** @typedef {'Idle' | 'Walk' | 'Run' | 'Swagger' | 'Jump'} AnimName */

export class Character extends THREE.Object3D {
  constructor() {
    super();
    this.model = undefined;
    this.mixer = undefined;
    this.actions = new Map();
    this.current = undefined;
  }

  /**
   * @param {string | string[]} url
   * @param {THREE.WebGLRenderer} [renderer]
   */
  async load(url, renderer, { targetHeight = 1.8 } = {}) {
    const urls = Array.isArray(url) ? url : [url];
    const { gltf, root } = await loadGLBWithFallbacks({
      renderer,
      urls,
      targetHeight,
    });

    this.initializeFromGLTF(root, gltf.animations);
  }

  initializeFromGLTF(root, animations = []) {
    if (!root) {
      throw new Error('Character.initializeFromGLTF requires a root object');
    }

    if (this.model) {
      this.remove(this.model);
    }

    this.model = root;
    this.model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        o.frustumCulled = false;
      }
    });

    this.model.rotation.y = Math.PI;
    this.add(this.model);

    this.mixer = new THREE.AnimationMixer(this.model);
    const clips = Array.isArray(animations) ? animations : [];
    const byName = new Map();
    for (const clip of clips) {
      if (clip?.name) {
        byName.set(clip.name, clip);
      }
    }

    const mapName = (n) => {
      const L = n.toLowerCase();
      if (L.includes('idle')) return 'Idle';
      if (L.includes('walk') && !L.includes('swagger')) return 'Walk';
      if (L.includes('run')) return 'Run';
      if (L.includes('swagger')) return 'Swagger';
      if (L.includes('swag')) return 'Swagger';
      if (L.includes('jump')) return 'Jump';
      return null;
    };

    this.actions = new Map();

    for (const [name, clip] of byName) {
      const mapped = mapName(name);
      if (!mapped) continue;
      const action = this.mixer.clipAction(clip);
      action.clampWhenFinished = true;
      action.enable = true;
      this.actions.set(mapped, action);
    }

    if (!this.actions.get('Swagger') && this.actions.get('Walk')) {
      this.actions.set('Swagger', this.actions.get('Walk'));
    }
    if (!this.actions.get('Run') && this.actions.get('Walk')) {
      this.actions.set('Run', this.actions.get('Walk'));
    }
    if (!this.actions.get('Idle') && this.actions.get('Walk')) {
      this.actions.set('Idle', this.actions.get('Walk'));
    }

    this.play('Idle', 0);
  }

  /**
   * @param {number} dt
   */
  update(dt) {
    this.mixer?.update(dt);
  }

  /**
   * @param {AnimName} name
   * @param {number} [fade=0.2]
   */
  play(name, fade = 0.2) {
    const next = this.actions.get(name);
    if (!next || this.current === next) return;
    next.reset().play();
    if (this.current) this.current.crossFadeTo(next, fade, false);
    this.current = next;
  }
}

export default Character;
