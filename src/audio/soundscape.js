import * as THREE from "three";

/**
 * Living City Soundscape
 * - Global ambient loops (sea/wind)
 * - Zone ambience (harbor/agora/acropolis) with positional audio
 * - Randomized one-shots (goats, cart, blacksmith)
 * - Day/Night mix (more wind/lyre at night, more market by day)
 * - Graceful missing-asset handling (logs tip, continues)
 */
export class Soundscape {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   * @param {{ getNightFactor: ()=>number }} lightingRef  returns 0..1 (0=day,1=night)
   * @param {{ harbor: THREE.Vector3, agora: THREE.Vector3, acropolis: THREE.Vector3 }} anchors
   */
  constructor(scene, camera, lightingRef, anchors) {
    this.scene = scene;
    this.camera = camera;
    this.lightingRef = lightingRef;
    this.anchors = anchors;

    // Audio graph
    this.listener = new THREE.AudioListener();
    this.camera.add(this.listener);
    this.loader = new THREE.AudioLoader();

    // Mixers (master + groups)
    const ctx = this.listener.context;
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0.9;
    this.masterGain.connect(this.listener.getInput());

    this.bus = {
      ambience: ctx.createGain(),
      voices: ctx.createGain(),
      effects: ctx.createGain()
    };
    this.bus.ambience.gain.value = 0.9;
    this.bus.voices.gain.value = 0.7;
    this.bus.effects.gain.value = 0.7;
    this.bus.ambience.connect(this.masterGain);
    this.bus.voices.connect(this.masterGain);
    this.bus.effects.connect(this.masterGain);

    // State
    this.buffers = new Map();
    this.emitters = [];
    this.oneShotTimers = [];
    this.ready = false;

    // Zones
    this.zones = {
      harbor: { pos: anchors.harbor, radius: 50 },
      agora: { pos: anchors.agora, radius: 40 },
      acropolis: { pos: anchors.acropolis, radius: 40 }
    };
  }

  logMissing(name, url) {
    console.info(`[audio] Optional asset missing: ${name} (${url}). Drop a file at public/${url} to enable.`);
  }

  async loadBuffer(name, url) {
    if (!url) return null;
    const existing = this.buffers.get(name);
    if (existing) return existing;
    try {
      const buf = await new Promise((resolve, reject) =>
        this.loader.load(url, resolve, undefined, reject)
      );
      this.buffers.set(name, buf);
      return buf;
    } catch {
      this.logMissing(name, url);
      return null;
    }
  }

  _makePositional(buffer, position, group = "ambience", { loop = true, volume = 0.6, refDistance = 12, maxDistance = 80, rolloff = 1 } = {}) {
    if (!buffer) return null;
    const src = new THREE.PositionalAudio(this.listener);
    src.setBuffer(buffer);
    src.setLoop(loop);
    src.setRefDistance(refDistance);
    src.setMaxDistance(maxDistance);
    src.setRolloffFactor(rolloff);
    src.setVolume(volume);
    src.userData.group = group;
    // route into group bus
    const sourceNode = src.getOutput ? src.getOutput() : src.source; // compat across three versions
    if (sourceNode && this.bus[group]) {
      // reroute output: disconnect default → connect to our bus
      try { sourceNode.disconnect(); } catch {}
      sourceNode.connect(this.bus[group]);
    }
    const obj = new THREE.Object3D();
    obj.position.copy(position);
    obj.add(src);
    this.scene.add(obj);
    this.emitters.push({ obj, src, group });
    return src;
  }

  _makeGlobal(buffer, group = "ambience", { loop = true, volume = 0.3 } = {}) {
    if (!buffer) return null;
    const src = new THREE.Audio(this.listener);
    src.setBuffer(buffer);
    src.setLoop(loop);
    src.setVolume(volume);
    src.userData.group = group;
    const sourceNode = src.getOutput ? src.getOutput() : src.source;
    if (sourceNode && this.bus[group]) {
      try { sourceNode.disconnect(); } catch {}
      sourceNode.connect(this.bus[group]);
    }
    this.emitters.push({ obj: this.camera, src, group });
    return src;
  }

  async initFromManifest(manifestUrl = "audio/manifest.json") {
    const resolveAssetPath = (path) => {
      if (!path) return path;
      const ABSOLUTE = /^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|\/)/;
      if (ABSOLUTE.test(path)) return path;
      const base = import.meta?.env?.BASE_URL ?? "/";
      const normalizedBase = base.endsWith("/") ? base : `${base}/`;
      const normalizedPath = path.replace(/^\.?\//, "");
      return `${normalizedBase}${normalizedPath}`;
    };

    const resolvedManifestUrl = resolveAssetPath(manifestUrl);
    let mf;
    try {
      mf = await (await fetch(resolvedManifestUrl)).json();
    } catch {
      console.warn("[audio] manifest.json not found. Using default empty manifest.");
      mf = { ambient: {}, effects: {} };
    }

    const ambient = mf.ambient ?? {};
    const effects = mf.effects ?? {};

    // Ambient layers
    const sea = await this.loadBuffer("sea", resolveAssetPath(ambient.sea));
    const gulls = await this.loadBuffer("gulls", resolveAssetPath(ambient.gulls));
    const wind = await this.loadBuffer("wind", resolveAssetPath(ambient.wind));
    const market = await this.loadBuffer("market", resolveAssetPath(ambient.market));
    const fountain = await this.loadBuffer("fountain", resolveAssetPath(ambient.fountain));
    const lyre = await this.loadBuffer("lyre", resolveAssetPath(ambient.lyre));

    // Effects / one-shots
    const blacksmith = await this.loadBuffer("blacksmith", resolveAssetPath(effects.blacksmith));
    const goats = await this.loadBuffer("goats", resolveAssetPath(effects.goats));
    const cart = await this.loadBuffer("cart", resolveAssetPath(effects.cart));

    // Global ambient: sea + wind (wind mixed more at night)
    this._makeGlobal(sea, "ambience", { volume: 0.25 })?.play();
    this._makeGlobal(wind, "ambience", { volume: 0.05 })?.play();

    // Zones: harbor, agora, acropolis
    this._makePositional(gulls, this.zones.harbor.pos, "ambience", { volume: 0.35, refDistance: 16, maxDistance: 120 })?.play();
    this._makePositional(market, this.zones.agora.pos, "voices", { volume: 0.35, refDistance: 10 })?.play();
    this._makePositional(fountain, this.zones.agora.pos.clone().add(new THREE.Vector3(6,0,-4)), "ambience", { volume: 0.25, refDistance: 8 })?.play();
    this._makePositional(lyre, this.zones.acropolis.pos, "ambience", { volume: 0.22, refDistance: 10 })?.play();

    // One-shots with randomized scheduling
    this.scheduleOneShots(blacksmith, this.zones.agora.pos.clone().add(new THREE.Vector3(-8,0,6)), "effects", 12, 22); // every 12–22s
    this.scheduleOneShots(goats, this.zones.harbor.pos.clone().add(new THREE.Vector3(18,0,10)), "effects", 18, 38);
    this.scheduleOneShots(cart, this.zones.agora.pos.clone().add(new THREE.Vector3(12,0,-12)), "effects", 25, 45);

    this.ready = true;
  }

  scheduleOneShots(buffer, position, group, minS = 12, maxS = 24) {
    if (!buffer) return;
    const tick = () => {
      const src = this._makePositional(buffer, position, group, { loop: false, volume: 0.35, refDistance: 8 });
      if (src) { src.play(); }
      const next = (Math.random() * (maxS - minS) + minS) * 1000;
      const id = setTimeout(tick, next);
      this.oneShotTimers.push(id);
    };
    const first = (Math.random() * (maxS - minS) + minS) * 1000;
    const id = setTimeout(tick, first);
    this.oneShotTimers.push(id);
  }

  /**
   * Call once per frame
   * @param {THREE.Vector3} playerPos  (optional, for future distance-based mixing)
   */
  update(playerPos) {
    if (!this.ready) return;
    const night = this.lightingRef?.getNightFactor?.() ?? 0;
    // Day/Night crossfade: more market by day, more wind/lyre by night
    const lerp = (a,b,t)=> a+(b-a)*t;
    this.bus.voices.gain.value = lerp(0.75, 0.35, night);
    this.bus.ambience.gain.value = lerp(0.85, 0.95, night);
    // Master stays ~0.9; optionally lower late night:
    this.masterGain.gain.value = lerp(0.9, 0.8, night);
  }

  async ensureUserGestureResume() {
    const ctx = this.listener.context;
    if (ctx.state === "running") return;
    const resume = async () => {
      try { await ctx.resume(); } catch {}
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
    window.addEventListener("pointerdown", resume);
    window.addEventListener("keydown", resume);
  }

  dispose() {
    this.emitters.forEach(({ obj, src }) => {
      try { src.stop(); } catch {}
      if (obj && obj !== this.camera) { this.scene.remove(obj); }
    });
    this.oneShotTimers.forEach(id => clearTimeout(id));
    this.emitters = [];
    this.buffers.clear();
    // detach listener
    try { this.camera.remove(this.listener); } catch {}
  }
}
