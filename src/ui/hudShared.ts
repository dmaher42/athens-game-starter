const DEFAULT_FRAME_INTERVAL = 1000 / 15;

const PANEL_STYLE_ID = "hud-panel-style";

interface HudPanelOptions {
  readonly title: string;
  readonly className?: string;
  readonly initialCollapsed?: boolean;
  readonly collapseContent?: boolean;
  readonly toggleLabels?: { collapsed?: string; expanded?: string };
  readonly onToggle?: (collapsed: boolean) => void;
}

export interface HudPanelHandle {
  readonly root: HTMLDivElement;
  readonly header: HTMLDivElement;
  readonly titleEl: HTMLDivElement;
  readonly content: HTMLDivElement;
  readonly toggleButton: HTMLButtonElement;
  setCollapsed(next: boolean): void;
  isCollapsed(): boolean;
}

function ensurePanelStyles(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(PANEL_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = PANEL_STYLE_ID;
  style.textContent = `
    .hud-panel {
      background: rgba(9, 12, 18, 0.72);
      border-radius: 12px;
      padding: 12px;
      color: #fff;
      font: 12px/1.35 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto;
      text-shadow: 0 1px 2px rgba(0,0,0,0.45);
      backdrop-filter: blur(6px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
      pointer-events: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: width 160ms ease, box-shadow 160ms ease;
    }
    .hud-panel__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .hud-panel__title {
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-size: 11px;
      opacity: 0.85;
    }
    .hud-toggle {
      appearance: none;
      border: 0;
      border-radius: 999px;
      padding: 6px 10px;
      font-weight: 600;
      font-size: 11px;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      background: rgba(31, 135, 214, 0.18);
      color: #a8dfff;
      cursor: pointer;
      transition: background 120ms ease, color 120ms ease, opacity 120ms ease;
    }
    .hud-toggle:hover,
    .hud-toggle:focus-visible {
      background: rgba(31, 135, 214, 0.32);
      color: #e7f6ff;
      outline: none;
    }
    .hud-panel__content {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .hud-panel--collapsed .hud-panel__content {
      display: none;
    }
  `;
  document.head.appendChild(style);
}

export function createHudPanel(options: HudPanelOptions): HudPanelHandle {
  ensurePanelStyles();

  const { className, collapseContent = true } = options;
  const labels = {
    collapsed: options.toggleLabels?.collapsed ?? "Expand",
    expanded: options.toggleLabels?.expanded ?? "Minimize",
  };

  const root = document.createElement("div");
  root.className = ["hud-panel", className].filter(Boolean).join(" ");

  const header = document.createElement("div");
  header.className = "hud-panel__header";

  const titleEl = document.createElement("div");
  titleEl.className = "hud-panel__title";
  titleEl.textContent = options.title;

  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.className = "hud-toggle";

  header.appendChild(titleEl);
  header.appendChild(toggleButton);

  const content = document.createElement("div");
  content.className = "hud-panel__content";

  root.appendChild(header);
  root.appendChild(content);

  let collapsed = Boolean(options.initialCollapsed);

  const applyState = () => {
    toggleButton.textContent = collapsed ? labels.collapsed : labels.expanded;
    root.classList.toggle("hud-panel--collapsed", collapseContent && collapsed);
    if (!collapseContent) {
      root.classList.toggle("hud-panel--collapsed", collapsed);
    }
    options.onToggle?.(collapsed);
  };

  toggleButton.addEventListener("click", (event) => {
    event.preventDefault();
    collapsed = !collapsed;
    applyState();
  });

  applyState();

  return {
    root,
    header,
    titleEl,
    content,
    toggleButton,
    setCollapsed(next) {
      if (collapsed === next) return;
      collapsed = next;
      applyState();
    },
    isCollapsed() {
      return collapsed;
    },
  };
}

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
