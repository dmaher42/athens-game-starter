import * as THREE from "three";

export class GameLoop {
  constructor({ autoStart = false } = {}) {
    this.clock = new THREE.Clock();
    this.callbacks = new Set();
    this.performance = { fps: 0 };
    this._running = false;
    this._frameCount = 0;
    this._perfLastTimestamp = null;
    this._boundLoop = this._loop.bind(this);

    if (autoStart) {
      this.start();
    }
  }

  start() {
    if (this._running) return;
    this._running = true;
    this.clock.start();
    this._frameCount = 0;
    this._perfLastTimestamp = null;
    this._rafId = requestAnimationFrame(this._boundLoop);
  }

  stop() {
    if (!this._running) return;
    this._running = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  onUpdate(callback) {
    if (typeof callback !== "function") return () => {};
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  getPerformanceMetrics() {
    return { ...this.performance };
  }

  _loop() {
    if (!this._running) return;

    const delta = this.clock.getDelta();
    const elapsed = this.clock.elapsedTime;

    for (const callback of this.callbacks) {
      try {
        callback(delta, elapsed);
      } catch (error) {
        console.error("[GameLoop] callback error", error);
      }
    }

    this._updatePerformance(delta);

    this._rafId = requestAnimationFrame(this._boundLoop);
  }

  _updatePerformance(delta) {
    this._frameCount += 1;
    const now =
      typeof performance?.now === "function" ? performance.now() : Date.now();
    if (this._perfLastTimestamp === null) {
      this._perfLastTimestamp = now;
      return;
    }

    const elapsedMs = now - this._perfLastTimestamp;
    if (elapsedMs >= 500) {
      const fps = this._frameCount / (elapsedMs / 1000);
      this.performance.fps = fps;
      this._frameCount = 0;
      this._perfLastTimestamp = now;
    }
  }
}
