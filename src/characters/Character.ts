import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

export type AnimName = 'Idle' | 'Walk' | 'Run' | 'Jump';

export class Character extends THREE.Object3D {
  public model?: THREE.Object3D;
  private mixer?: THREE.AnimationMixer;
  private actions = new Map<AnimName, THREE.AnimationAction>();
  private current?: THREE.AnimationAction;

  constructor() { super(); }

  async load(url: string, renderer?: THREE.WebGLRenderer) {
    const loader = new GLTFLoader();

    // Optional KTX2 support if textures are compressed
    if (renderer) {
      const ktx2 = new KTX2Loader()
        .setTranscoderPath('/basis/') // adjust if your transcoder lives elsewhere
        .detectSupport(renderer);
      loader.setKTX2Loader(ktx2);
    }

    const gltf = await loader.loadAsync(url);

    this.model = gltf.scene;
    this.model.traverse((o: any) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.frustumCulled = false; // animated meshes can cull oddly
      }
    });

    // Normalize orientation: assume model faces -Z in authoring; we want +Z forward for convenience.
    // If your model already faces +Z, set rotation.y = 0.
    this.model.rotation.y = Math.PI;

    // Optional: scale to ~1.8m tall if needed
    const box = new THREE.Box3().setFromObject(this.model);
    const height = box.max.y - box.min.y;
    const target = 1.8;
    if (height > 0) {
      const s = target / height;
      this.model.scale.setScalar(s);
    }

    this.add(this.model);

    // Animations
    this.mixer = new THREE.AnimationMixer(this.model);
    const clips = gltf.animations || [];
    const byName = new Map<string, THREE.AnimationClip>();
    for (const c of clips) byName.set(c.name, c);

    const mapName = (n: string): AnimName | null => {
      const L = n.toLowerCase();
      if (L.includes('idle')) return 'Idle';
      if (L.includes('walk')) return 'Walk';
      if (L.includes('run'))  return 'Run';
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

    // Fallbacks if some clips are missing:
    if (!this.actions.get('Run') && this.actions.get('Walk')) {
      this.actions.set('Run', this.actions.get('Walk')!);
    }
    if (!this.actions.get('Idle') && this.actions.get('Walk')) {
      this.actions.set('Idle', this.actions.get('Walk')!);
    }

    // Start in Idle
    this.play('Idle', 0);
  }

  update(dt: number) {
    this.mixer?.update(dt);
  }

  play(name: AnimName, fade = 0.2) {
    const next = this.actions.get(name);
    if (!next || this.current === next) return;
    next.reset().play();
    if (this.current) this.current.crossFadeTo(next, fade, false);
    this.current = next;
  }
}

export default Character;
