const STYLE_ID = "hotkey-overlay-style";
const ROOT_CLASS = "hotkey-overlay";
const HIDDEN_MOD = "hotkey-overlay--hidden";
const STORAGE_KEY = "hotkeyOverlayOpen";

function loadOpenState() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function saveOpenState(isOpen) {
  try {
    localStorage.setItem(STORAGE_KEY, isOpen ? "1" : "0");
  } catch {
    // ignore write errors (e.g., storage disabled)
  }
}

const DEFAULT_HOTKEYS = [
  { keys: ["W", "A", "S", "D"], description: "Move" },
  { keys: ["Shift"], description: "Sprint" },
  { keys: ["Space"], description: "Jump / fly up" },
  { keys: ["Ctrl"], description: "Fly down" },
  { keys: ["F"], description: "Toggle flight mode" },
  { keys: ["E"], description: "Interact with highlighted objects" },
  { keys: ["Arrow Keys"], description: "Look around" },
  { keys: ["F9"], description: "Toggle exposure slider" },
];

/**
 * @typedef {{
 *  hotkeys?: { keys: string[]; description: string }[];
 *  toggleKey?: string;
 *  showButton?: boolean;
 * }} HotkeyOverlayOptions
 */

/**
 * Mounts a floating hotkey reference along with a toggle button.
 * Subsequent calls are ignored so the overlay only mounts once.
 * @param {HotkeyOverlayOptions} [options]
 */
export function mountHotkeyOverlay(options = {}) {
  if (document.querySelector(`.${ROOT_CLASS}`)) {
    return;
  }

  ensureStyles();

  const hotkeys = Array.isArray(options.hotkeys) && options.hotkeys.length > 0
    ? options.hotkeys
    : DEFAULT_HOTKEYS;

  const toggleKey = typeof options.toggleKey === "string" && options.toggleKey.trim().length > 0
    ? options.toggleKey
    : "KeyH";

  const showButton = options.showButton !== false;

  const root = document.createElement("div");
  root.className = ROOT_CLASS;
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-live", "polite");

  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.className = `${ROOT_CLASS}__toggle`;
  toggleButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor"
        d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-6l-3.5 3.5a1 1 0 0 1-1.7-.7V17H6a3 3 0 0 1-3-3V6zm4 2a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2H7zm5 0a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2zm5 0a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2z"/>
    </svg>
    <span class="${ROOT_CLASS}__sr">Hotkeys (press ${resolveKeyLabel(toggleKey)})</span>
  `;
  toggleButton.setAttribute("title", `Hotkeys (${resolveKeyLabel(toggleKey)})`);
  toggleButton.setAttribute("aria-expanded", "false");
  toggleButton.setAttribute("aria-controls", `${ROOT_CLASS}-panel`);

  const panel = document.createElement("div");
  panel.className = `${ROOT_CLASS}__panel`;
  panel.id = `${ROOT_CLASS}-panel`;
  panel.setAttribute("role", "document");
  panel.setAttribute("aria-hidden", "true");

  const heading = document.createElement("h2");
  heading.textContent = "Controls";
  heading.className = `${ROOT_CLASS}__title`;
  panel.appendChild(heading);

  const list = document.createElement("dl");
  list.className = `${ROOT_CLASS}__list`;

  for (const entry of hotkeys) {
    if (!entry || !Array.isArray(entry.keys) || entry.keys.length === 0) {
      continue;
    }
    const keys = entry.keys.map((key) => String(key).trim()).filter(Boolean);
    const description = typeof entry.description === "string" ? entry.description : "";
    if (keys.length === 0 || !description) {
      continue;
    }

    const dt = document.createElement("dt");
    dt.className = `${ROOT_CLASS}__keys`;
    dt.textContent = keys.join(" / ");

    const dd = document.createElement("dd");
    dd.className = `${ROOT_CLASS}__description`;
    dd.textContent = description;

    list.appendChild(dt);
    list.appendChild(dd);
  }

  panel.appendChild(list);

  const hint = document.createElement("p");
  hint.className = `${ROOT_CLASS}__hint`;
  hint.textContent = `Press ${resolveKeyLabel(toggleKey)} to toggle`;
  panel.appendChild(hint);

  const initialOpen = loadOpenState();
  if (!initialOpen) {
    root.classList.add(HIDDEN_MOD);
  } else {
    root.classList.remove(HIDDEN_MOD);
  }

  if (showButton) {
    root.appendChild(toggleButton);
  }
  root.appendChild(panel);
  document.body.appendChild(root);

  const applyVisibility = (shouldOpen) => {
    if (shouldOpen) {
      root.classList.remove(HIDDEN_MOD);
    } else {
      root.classList.add(HIDDEN_MOD);
    }
    const isOpen = !root.classList.contains(HIDDEN_MOD);
    toggleButton?.setAttribute?.("aria-expanded", String(isOpen));
    panel.setAttribute("aria-hidden", String(!isOpen));
    saveOpenState(isOpen);
  };

  applyVisibility(initialOpen);

  const updateVisibility = (toggle) => {
    if (toggle === true) {
      applyVisibility(root.classList.contains(HIDDEN_MOD));
      return;
    }
    if (toggle === false) {
      applyVisibility(false);
      return;
    }
    applyVisibility(!root.classList.contains(HIDDEN_MOD));
  };

  if (showButton) {
    toggleButton.addEventListener("click", () => {
      updateVisibility(true);
    });
  }

  window.addEventListener("keydown", (event) => {
    if (event.code === toggleKey && !event.repeat) {
      updateVisibility(true);
    }
    if (event.code === "Escape" && !root.classList.contains(HIDDEN_MOD)) {
      updateVisibility(false);
    }
  });
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .${ROOT_CLASS} {
      position: fixed;
      right: 16px;
      top: 16px;
      z-index: 1200;
      display: flex;
      flex-direction: column;
      gap: 10px;
      color: #fff;
      font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    }

    .${ROOT_CLASS}__sr {
      position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
    }

    .${ROOT_CLASS}__toggle {
      background: rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 999px;
      color: inherit;
      width: 28px; height: 28px;
      display: grid; place-items: center;
      padding: 0;
      cursor: pointer;
      transition: background .2s ease, border-color .2s ease, opacity .2s ease, transform .12s ease;
      opacity: .85;
    }
    .${ROOT_CLASS}__toggle:hover,
    .${ROOT_CLASS}__toggle:focus-visible {
      background: rgba(0,0,0,0.72);
      border-color: rgba(255,255,255,0.36);
      outline: none;
      opacity: 1;
      transform: scale(1.04);
    }

    .${ROOT_CLASS}__panel {
      background: rgba(10,12,18,0.9);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      padding: 14px;
      min-width: 220px;
      backdrop-filter: blur(6px);
      box-shadow: 0 12px 30px rgba(0,0,0,0.35);
      transition: opacity .18s ease, transform .18s ease;
    }

    .${ROOT_CLASS}__title {
      margin: 0 0 12px;
      font-size: 16px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .${ROOT_CLASS}__list {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: 6px 12px;
      margin: 0;
      padding: 0;
    }

    .${ROOT_CLASS}__keys {
      margin: 0;
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    .${ROOT_CLASS}__description {
      margin: 0;
      opacity: 0.85;
    }

    .${ROOT_CLASS}__hint {
      margin: 12px 0 0;
      font-size: 12px;
      letter-spacing: 0.04em;
      opacity: 0.65;
      text-transform: uppercase;
    }

    .${ROOT_CLASS}.${HIDDEN_MOD} .${ROOT_CLASS}__panel {
      opacity: 0;
      pointer-events: none;
      transform: translateY(-6px);
    }

    /* Hide the icon while the panel is open (less clutter) */
    .${ROOT_CLASS}:not(.${HIDDEN_MOD}) .${ROOT_CLASS}__toggle {
      opacity: 0;
      pointer-events: none;
    }
  `;

  document.head.appendChild(style);
}

function resolveKeyLabel(code) {
  switch (code) {
    case "KeyH":
      return "H";
    case "F9":
    case "F10":
    case "F11":
    case "F12":
      return code;
    case "ControlLeft":
    case "ControlRight":
      return "Ctrl";
    default:
      if (code.startsWith("Key") && code.length === 4) {
        return code.slice(3);
      }
      return code;
  }
}
