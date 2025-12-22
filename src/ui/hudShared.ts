const DEFAULT_FRAME_INTERVAL = 1000 / 15;

export function startThrottledLoop(
  callback: () => void,
  intervalMs = DEFAULT_FRAME_INTERVAL,
): () => void {
  let rafId = 0;
  let running = true;
  let lastTime = 0;

  const loop = (timestamp: number) => {
    if (!running) return;
    if (timestamp - lastTime >= intervalMs) {
      lastTime = timestamp;
      callback();
    }
    rafId = requestAnimationFrame(loop);
  };

  rafId = requestAnimationFrame(loop);
  return () => {
    running = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  };
}

export function updateTextIfChanged(
  element: { textContent: string | null } | null | undefined,
  nextValue: string,
): void {
  if (!element) return;
  if (element.textContent !== nextValue) {
    element.textContent = nextValue;
  }
}
