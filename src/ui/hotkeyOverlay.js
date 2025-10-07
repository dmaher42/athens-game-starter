const STYLE_ID = "hotkey-overlay-style";
const ROOT_CLASS = "hotkey-overlay";
const HIDDEN_MOD = "hotkey-overlay--hidden";

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

  const root = document.createElement("div");
  root.className = `${ROOT_CLASS} ${HIDDEN_MOD}`;
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-live", "polite");

  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.className = `${ROOT_CLASS}__toggle`;
  toggleButton.textContent = "Hotkeys";
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

  root.appendChild(panel);
  root.appendChild(toggleButton);
  document.body.appendChild(root);

  const updateVisibility = (show) => {
    const shouldShow = show ?? root.classList.contains(HIDDEN_MOD);
    if (shouldShow) {
      root.classList.remove(HIDDEN_MOD);
    } else {
      root.classList.add(HIDDEN_MOD);
    }
    const isOpen = !root.classList.contains(HIDDEN_MOD);
    toggleButton.setAttribute("aria-expanded", String(isOpen));
    panel.setAttribute("aria-hidden", String(!isOpen));
  };

  toggleButton.addEventListener("click", () => {
    updateVisibility();
  });

  window.addEventListener("keydown", (event) => {
    if (event.code === toggleKey && !event.repeat) {
      updateVisibility();
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
      left: 16px;
      bottom: 16px;
      z-index: 1100;
      display: flex;
      flex-direction: column-reverse;
      gap: 12px;
      color: #fff;
      font-family: 'Inter', 'Segoe UI', sans-serif;
    }

    .${ROOT_CLASS}__toggle {
      background: rgba(0, 0, 0, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 6px;
      color: inherit;
      font: inherit;
      padding: 6px 12px;
      cursor: pointer;
      transition: background 0.2s ease, border-color 0.2s ease;
    }

    .${ROOT_CLASS}__toggle:hover,
    .${ROOT_CLASS}__toggle:focus-visible {
      background: rgba(0, 0, 0, 0.85);
      border-color: rgba(255, 255, 255, 0.4);
      outline: none;
    }

    .${ROOT_CLASS}__panel {
      background: rgba(10, 12, 18, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      padding: 16px;
      min-width: 220px;
      backdrop-filter: blur(6px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
      transition: opacity 0.2s ease, transform 0.2s ease;
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
      transform: translateY(8px);
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
