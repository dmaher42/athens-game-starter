import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

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
   * @param {string} url
   * @param {THREE.WebGLRenderer} [renderer]
   */
  async load(url, renderer) {
    const loader = new GLTFLoader();

    if (renderer) {
      const ktx2 = new KTX2Loader()
        .setTranscoderPath('/basis/')
        .detectSupport(renderer);
      loader.setKTX2Loader(ktx2);
    }

    const gltf = await loader.loadAsync(url);

    this.model = gltf.scene;
    this.model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.frustumCulled = false;
      }
    });

    this.model.rotation.y = Math.PI;

    const box = new THREE.Box3().setFromObject(this.model);
    const height = box.max.y - box.min.y;
    const target = 1.8;
    if (height > 0) {
      const s = target / height;
      this.model.scale.setScalar(s);
    }

    this.add(this.model);

    this.mixer = new THREE.AnimationMixer(this.model);
    const clips = gltf.animations || [];
    const byName = new Map();
    for (const c of clips) byName.set(c.name, c);

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
