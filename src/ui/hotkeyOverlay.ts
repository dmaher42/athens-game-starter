import type {
  HotkeyDescriptor,
  HotkeyOverlayHandle as HotkeyOverlayHandleContract,
  HotkeyOverlayOptions,
} from "@app/types";

import { createHudPanel } from "./hudShared.js";
import { getUISlot } from "./uiRoot.js";

const STYLE_ID = "hotkey-overlay-style" as const;
const ROOT_CLASS = "hotkey-overlay" as const;
const HIDDEN_MOD = "hotkey-overlay--hidden" as const;
const STORAGE_KEY = "hotkeyOverlayOpen" as const;

export type HotkeyOverlayHandle = HotkeyOverlayHandleContract;

function loadOpenState(): boolean {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return false;
  }
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function saveOpenState(isOpen: boolean): void {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, isOpen ? "1" : "0");
  } catch {
    // ignore write errors (e.g., storage disabled)
  }
}

const DEFAULT_HOTKEYS: readonly HotkeyDescriptor[] = [
  { keys: ["W", "A", "S", "D"], description: "Move" },
  { keys: ["Shift"], description: "Sprint" },
  { keys: ["Space"], description: "Jump / fly up" },
  { keys: ["Ctrl"], description: "Fly down" },
  { keys: ["F"], description: "Toggle flight mode" },
  { keys: ["E"], description: "Interact with highlighted objects" },
  { keys: ["Arrow Keys"], description: "Look around" },
  { keys: ["F9"], description: "Toggle exposure slider" },
];

export function mountHotkeyOverlay(
  options: HotkeyOverlayOptions = {},
): HotkeyOverlayHandle | null {
  if (typeof document === "undefined") {
    return null;
  }
  if (document.querySelector(`.${ROOT_CLASS}`)) {
    return null;
  }

  ensureStyles();

  const hotkeys: readonly HotkeyDescriptor[] =
    Array.isArray(options.hotkeys) && options.hotkeys.length > 0
      ? options.hotkeys
      : DEFAULT_HOTKEYS;

  const toggleKey = typeof options.toggleKey === "string" && options.toggleKey.trim().length > 0
    ? options.toggleKey
    : "KeyH";

  const showButton = options.showButton !== false;

  const initialOpen = loadOpenState();

  const root = document.createElement("div");
  root.className = ROOT_CLASS;
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-live", "polite");

  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.className = `${ROOT_CLASS}__toggle hud-toggle`;
  toggleButton.innerHTML = `
    <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" aria-hidden=\"true\">
      <path fill=\"currentColor\"
        d=\"M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-6l-3.5 3.5a1 1 0 0 1-1.7-.7V17H6a3 3 0 0 1-3-3V6zm4 2a1 1 0 1 0
0 2h2a1 1 0 1 0 0-2H7zm5 0a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2zm5 0a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2z\"/>
    </svg>
    <span class=\"${ROOT_CLASS}__sr\">Hotkeys (press ${resolveKeyLabel(toggleKey)})</span>
  `;
  toggleButton.setAttribute("title", `Hotkeys (${resolveKeyLabel(toggleKey)})`);
  toggleButton.setAttribute("aria-expanded", "false");
  toggleButton.setAttribute("aria-controls", `${ROOT_CLASS}-panel`);

  const panelHandle = createHudPanel({
    title: "Controls",
    className: `${ROOT_CLASS}__panel`,
    initialCollapsed: !initialOpen,
    toggleLabels: { collapsed: "Show", expanded: "Hide" },
    onToggle: (collapsed) => {
      const open = !collapsed;
      saveOpenState(open);
      root.classList.toggle(HIDDEN_MOD, !open);
    },
  });
  panelHandle.root.id = `${ROOT_CLASS}-panel`;
  panelHandle.root.setAttribute("role", "document");
  panelHandle.root.setAttribute("aria-hidden", String(!initialOpen));

  const list = document.createElement("dl");
  list.className = `${ROOT_CLASS}__list`;

  for (const entry of hotkeys) {
    if (!entry || !Array.isArray(entry.keys) || entry.keys.length === 0) {
      continue;
    }
    const keys = entry.keys.map((key: string) => String(key).trim()).filter(Boolean);
    const description = typeof entry.description === "string" ? entry.description : "";
    if (keys.length === 0 || !description) {
      continue;
    }

    const dt = document.createElement("dt");
    dt.className = `${ROOT_CLASS}__keys`;

    keys.forEach((key) => {
      const kbd = document.createElement("kbd");
      kbd.className = `${ROOT_CLASS}__kbd`;
      kbd.textContent = key;
      dt.appendChild(kbd);
    });

    const dd = document.createElement("dd");
    dd.className = `${ROOT_CLASS}__description`;
    dd.textContent = description;

    list.appendChild(dt);
    list.appendChild(dd);
  }

  panelHandle.content.appendChild(list);

  const hint = document.createElement("p");
  hint.className = `${ROOT_CLASS}__hint`;
  hint.textContent = `Press ${resolveKeyLabel(toggleKey)} to toggle`;
  panelHandle.content.appendChild(hint);

  if (!initialOpen) {
    root.classList.add(HIDDEN_MOD);
  } else {
    root.classList.remove(HIDDEN_MOD);
  }

  if (showButton) {
    root.appendChild(toggleButton);
  }
  root.appendChild(panelHandle.root);

  const slot = getUISlot("topRight");
  if (!slot) {
    return null;
  }
  slot.appendChild(root);

  const applyVisibility = (shouldOpen: boolean): void => {
    panelHandle.setCollapsed(!shouldOpen);
    root.classList.toggle(HIDDEN_MOD, !shouldOpen);
    toggleButton.setAttribute("aria-expanded", String(shouldOpen));
    panelHandle.root.setAttribute("aria-hidden", String(!shouldOpen));
    saveOpenState(shouldOpen);
  };

  applyVisibility(initialOpen);

  const updateVisibility = (toggle?: boolean): void => {
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

  const handleKeydown = (event: KeyboardEvent): void => {
    if (event.code === toggleKey && !event.repeat) {
      updateVisibility(true);
    }
    if (event.code === "Escape" && !root.classList.contains(HIDDEN_MOD)) {
      updateVisibility(false);
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("keydown", handleKeydown);
  }

  return {
    element: root,
    toggle(forceOpen?: boolean) {
      if (forceOpen === undefined) {
        updateVisibility();
      } else {
        applyVisibility(Boolean(forceOpen));
      }
    },
    dispose() {
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", handleKeydown);
      }
      root.remove();
    },
  };
}

function ensureStyles(): void {
  if (typeof document === "undefined") {
    return;
  }
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .${ROOT_CLASS} {
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
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      align-items: center;
    }

    .${ROOT_CLASS}__kbd {
      display: inline-block;
      padding: 3px 6px;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      font-size: 13px;
      font-weight: 600;
      line-height: 1;
      color: #eee;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 5px;
      box-shadow: 0 2px 0 rgba(0,0,0,0.5);
      text-shadow: 0 1px 0 rgba(0,0,0,0.5);
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

function resolveKeyLabel(code: string): string {
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
