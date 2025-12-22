import type { Vector3 } from "three";

import { getUISlot } from "./uiRoot.js";

type Vector3Like = Pick<Vector3, "x" | "y" | "z">;
type ImportMetaWithEnv = ImportMeta & { env?: { DEV?: boolean } };
type WindowWithHudFlag = Window & typeof globalThis & { SHOW_HUD?: boolean };

export interface LightingPresetMeta {
  readonly label?: string;
  readonly hotkey?: string;
}

export interface DevHudOptions {
  readonly getPosition?: () => Vector3Like | null | undefined;
  readonly getDirection?: () => Vector3Like | null | undefined;
  readonly onPin?: (position: Vector3Like) => void;
  readonly onSetLightingPreset?: (name: string) => void;
  readonly lightingPresets?: Record<string, LightingPresetMeta | null | undefined>;
  readonly getFogEnabled?: () => boolean;
  readonly onToggleFog?: () => void;
  readonly sunAlignment?: {
    getAzimuthDeg?: () => number;
    getElevationDeg?: () => number;
    onChange?: (updates: { azimuthDeg?: number; elevationDeg?: number }) => void;
  };
}

type OceanBounds = {
  readonly west?: number;
  readonly east?: number;
  readonly north?: number;
  readonly south?: number;
};

interface OceanStatusOptions {
  readonly seaLevel?: number;
  readonly bounds?: OceanBounds;
}

interface HudReadoutElement extends HTMLDivElement {
  _presetKeyBindings?: Map<string, string>;
}

export interface DevHudHandle {
  dispose(): void;
  setStatusLine(id: string, text?: string | null): void;
  setOceanStatus(options?: OceanStatusOptions | null): void;
  readonly rootElement: HudReadoutElement;
  updateFogState(state?: boolean | null): void;
}

// Dev HUD: compass + coordinates + pin hotkey (P)
export function mountDevHUD(options: DevHudOptions = {}): DevHudHandle | null {
  const {
    getPosition,
    getDirection,
    onPin,
    onSetLightingPreset,
    lightingPresets,
    getFogEnabled,
    onToggleFog,
    sunAlignment,
  } = options;
  const isDevBuild = Boolean(
    (import.meta as ImportMetaWithEnv).env?.DEV,
  );
  const runtimeWindow: WindowWithHudFlag | null =
    typeof window !== "undefined" ? (window as WindowWithHudFlag) : null;
  const allowHud = isDevBuild || runtimeWindow?.SHOW_HUD === true;
  if (!allowHud) return null;

  // --- DOM
  const wrap = document.createElement("div");
  Object.assign(wrap.style, {
    color: "#fff",
    font: "12px/1.35 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
    textShadow: "0 1px 2px rgba(0,0,0,0.45)",
    userSelect: "none", pointerEvents: "none",
  });

  // Compass ring + labels
  const comp = document.createElement("div");
  Object.assign(comp.style, {
    width: "88px", height: "88px", borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.75)",
    position: "relative", marginBottom: "8px",
  });
  const needle = document.createElement("div");
  Object.assign(needle.style, {
    position: "absolute", left: "50%", top: "50%",
    width: "2px", height: "40px", background: "rgba(255,0,0,0.9)",
    transformOrigin: "50% 100%", borderRadius: "2px",
    // Use transform, not the nonstandard 'translate' style:
    transform: "translate(-1px, -40px) rotate(0deg)",
  });
  comp.appendChild(needle);
  const labels = { N:0, E:90, S:180, W:270 };
  Object.entries(labels).forEach(([txt,deg])=>{
    const el = document.createElement("div");
    el.textContent = txt;
    Object.assign(el.style, {
      position: "absolute", left: "50%", top: "50%",
      transform: `translate(-50%,-50%) rotate(${deg}deg) translate(0,-38px) rotate(${-deg}deg)`,
      fontWeight: 700, letterSpacing: "0.5px"
    });
    comp.appendChild(el);
  });

  // Readout
  const read = document.createElement("div") as HudReadoutElement;
  read.style.pointerEvents = "auto"; // allow copy selection
  read.style.background = "rgba(0,0,0,0.55)";
  read.style.backdropFilter = "blur(3px)";
  read.style.padding = "8px 10px";
  read.style.borderRadius = "8px";
  read.style.minWidth = "220px";

  // Toggle button header
  const headerRow = document.createElement("div");
  Object.assign(headerRow.style, {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "4px",
  });
  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = "−"; // minus sign
  toggleBtn.title = "Minimize HUD";
  Object.assign(toggleBtn.style, {
    background: "transparent",
    border: "none",
    color: "white",
    opacity: "0.7",
    cursor: "pointer",
    padding: "0 4px",
    fontSize: "14px",
    lineHeight: "1",
  });
  headerRow.appendChild(toggleBtn);
  read.appendChild(headerRow);

  const contentContainer = document.createElement("div");
  contentContainer.innerHTML = [
    `<div><b>Pos</b> <span id="hud-pos">(x,y,z)</span></div>`,
    `<div><b>Bear</b> <span id="hud-bear">0° N</span></div>`,
    `<div style="opacity:.8">Press <b>P</b> to drop a pin</div>`
  ].join("");
  read.appendChild(contentContainer);

  toggleBtn.addEventListener("click", () => {
    const isHidden = contentContainer.style.display === "none";
    contentContainer.style.display = isHidden ? "block" : "none";
    comp.style.display = isHidden ? "block" : "none";
    toggleBtn.textContent = isHidden ? "−" : "+";
    toggleBtn.title = isHidden ? "Minimize HUD" : "Expand HUD";
  });

  const statusSection = document.createElement("div");
  Object.assign(statusSection.style, {
    marginTop: "6px",
    paddingTop: "6px",
    borderTop: "1px solid rgba(255,255,255,0.12)",
    display: "none",
  });
  contentContainer.appendChild(statusSection);

  const statusEntries = new Map<string, HTMLDivElement>();
  const updateStatusVisibility = () => {
    statusSection.style.display = statusEntries.size ? "block" : "none";
  };
  const setStatusLine = (id: string, text?: string | null) => {
    if (!id) return;
    const message = typeof text === "string" ? text.trim() : "";
    let entry = statusEntries.get(id);
    if (!message) {
      if (entry) {
        statusEntries.delete(id);
        entry.remove();
        updateStatusVisibility();
      }
      return;
    }
    if (!entry) {
      entry = document.createElement("div");
      Object.assign(entry.style, {
        opacity: "0.75",
        fontSize: "11px",
        letterSpacing: "0.03em",
        textTransform: "none",
        marginTop: statusEntries.size ? "4px" : "0",
      });
      statusEntries.set(id, entry);
      statusSection.appendChild(entry);
    }
    entry.textContent = message;
    updateStatusVisibility();
  };

  setStatusLine("proc", "Procedural: off");

  const setOceanStatus = (options: OceanStatusOptions = {}) => {
    const { seaLevel, bounds } = options;
    const levelIsFinite = Number.isFinite(seaLevel);
    const boundKeys: Array<keyof OceanBounds> = [
      "west",
      "east",
      "north",
      "south",
    ];
    const boundsAreValid =
      !!bounds && boundKeys.every((key) => Number.isFinite(bounds?.[key]));

    if (!levelIsFinite || !boundsAreValid) {
      setStatusLine("sea", "");
      return;
    }

    const safeBounds = bounds as Record<keyof OceanBounds, number>;
    const formatBound = (value: number) => value.toFixed(1);
    const message = [
      `Sea level: ${Number(seaLevel).toFixed(2)}`,
      `Ocean bounds: W ${formatBound(safeBounds.west)} / E ${formatBound(
        safeBounds.east
      )} / N ${formatBound(safeBounds.north)} / S ${formatBound(
        safeBounds.south
      )}`,
    ].join("\n");

    setStatusLine("sea", message);
  };

  const defaultPresetOrder = [
    { name: "Bright Noon", label: "Bright Noon" },
    { name: "Golden Hour", label: "Golden Hour" },
    { name: "Blue Hour", label: "Blue Hour" },
  ];
  const availablePresets = defaultPresetOrder.filter(({ name }) => {
    if (!lightingPresets) return true;
    return lightingPresets[name] != null;
  });

  const applyButtonStyles = (button: HTMLButtonElement, active: boolean) => {
    if (active) {
      button.style.background = "rgba(255,255,255,0.18)";
      button.style.borderColor = "rgba(255,255,255,0.55)";
    } else {
      button.style.background = "rgba(0,0,0,0.35)";
      button.style.borderColor = "rgba(255,255,255,0.35)";
    }
  };

  const makeInteractiveButton = (button: HTMLButtonElement) => {
    button.addEventListener("mouseenter", () => applyButtonStyles(button, true));
    button.addEventListener("mouseleave", () => applyButtonStyles(button, false));
    button.addEventListener("focus", () => applyButtonStyles(button, true));
    button.addEventListener("blur", () => applyButtonStyles(button, false));
  };

  let fogButton: HTMLButtonElement | null = null;
  const updateFogControls = (state?: boolean | null) => {
    if (!fogButton) return;
    let enabled: boolean;
    if (typeof state === "boolean") {
      enabled = state;
    } else if (typeof getFogEnabled === "function") {
      enabled = !!getFogEnabled();
    } else {
      enabled = false;
    }
    fogButton.textContent = enabled ? "Disable Fog" : "Enable Fog";
    fogButton.setAttribute("aria-pressed", String(enabled));
    fogButton.title = enabled
      ? "Disable atmospheric fog (Hotkey F)"
      : "Enable atmospheric fog (Hotkey F)";
  };

  if (availablePresets.length && !read.querySelector(".hud-lighting-presets")) {
    const section = document.createElement("div");
    section.className = "hud-lighting-presets";
    Object.assign(section.style, {
      marginTop: "8px",
      paddingTop: "6px",
      borderTop: "1px solid rgba(255,255,255,0.15)",
      pointerEvents: "auto",
    });

    const heading = document.createElement("div");
    heading.textContent = "Lighting Presets";
    Object.assign(heading.style, {
      fontWeight: 600,
      letterSpacing: "0.08em",
      fontSize: "11px",
      opacity: "0.85",
      textTransform: "uppercase",
    });
    section.appendChild(heading);

    const buttonRow = document.createElement("div");
    Object.assign(buttonRow.style, {
      display: "flex",
      flexWrap: "wrap",
      gap: "6px",
      marginTop: "6px",
    });

    const presetHotkeyConfig: Array<{
      name: string;
      codes: string[];
      keys: string[];
    }> = [];
    const activePresetNames = new Set(availablePresets.map((preset) => preset.name));
    const presetKeyBindings = new Map<string, string>();

    for (const preset of availablePresets) {
      const presetMeta = lightingPresets?.[preset.name] || {};
      const button = document.createElement("button");
      button.type = "button";
      const displayLabel = presetMeta.label || preset.label;
      button.textContent = displayLabel;
      Object.assign(button.style, {
        padding: "4px 8px",
        borderRadius: "4px",
        border: "1px solid rgba(255,255,255,0.35)",
        background: "rgba(0,0,0,0.35)",
        color: "inherit",
        font: "inherit",
        cursor: "pointer",
        pointerEvents: "auto",
        transition: "background 0.2s ease, border-color 0.2s ease",
      });

      makeInteractiveButton(button);

      const hotkeyLabel = presetMeta.hotkey || "";
      if (hotkeyLabel) {
        button.title = `Set ${displayLabel} lighting (Hotkey ${hotkeyLabel})`;
        button.setAttribute("aria-keyshortcuts", hotkeyLabel);
      } else {
        button.title = `Set ${displayLabel} lighting`;
      }

      button.addEventListener("click", (event) => {
        event.preventDefault();
        if (typeof onSetLightingPreset === "function") {
          onSetLightingPreset(preset.name);
        }
      });

      buttonRow.appendChild(button);
    }

    presetHotkeyConfig
      .filter((entry) => activePresetNames.has(entry.name))
      .forEach((entry) => {
        for (const code of entry.codes) {
          presetKeyBindings.set(code, entry.name);
        }
        for (const key of entry.keys) {
          presetKeyBindings.set(key, entry.name);
        }
      });

    section.appendChild(buttonRow);
    contentContainer.appendChild(section);

    read._presetKeyBindings = presetKeyBindings;
  }

  if (typeof onToggleFog === "function") {
    const section = document.createElement("div");
    section.className = "hud-environment-controls";
    Object.assign(section.style, {
      marginTop: "8px",
      paddingTop: "6px",
      borderTop: "1px solid rgba(255,255,255,0.15)",
      pointerEvents: "auto",
    });

    const heading = document.createElement("div");
    heading.textContent = "Environment";
    Object.assign(heading.style, {
      fontWeight: 600,
      letterSpacing: "0.08em",
      fontSize: "11px",
      opacity: "0.85",
      textTransform: "uppercase",
    });
    section.appendChild(heading);

    const buttonRow = document.createElement("div");
    Object.assign(buttonRow.style, {
      display: "flex",
      flexWrap: "wrap",
      gap: "6px",
      marginTop: "6px",
    });

    const buttonElement = document.createElement("button");
    buttonElement.type = "button";
    Object.assign(buttonElement.style, {
      padding: "4px 8px",
      borderRadius: "4px",
      border: "1px solid rgba(255,255,255,0.35)",
      background: "rgba(0,0,0,0.35)",
      color: "inherit",
      font: "inherit",
      cursor: "pointer",
      pointerEvents: "auto",
      transition: "background 0.2s ease, border-color 0.2s ease",
    });

    makeInteractiveButton(buttonElement);

    buttonElement.addEventListener("click", (event) => {
      event.preventDefault();
      onToggleFog();
      updateFogControls();
    });

    buttonRow.appendChild(buttonElement);
    fogButton = buttonElement;
    section.appendChild(buttonRow);
    contentContainer.appendChild(section);
    updateFogControls();
  }

  if (sunAlignment) {
    const section = document.createElement("div");
    section.className = "hud-sun-alignment";
    Object.assign(section.style, {
      marginTop: "8px",
      paddingTop: "6px",
      borderTop: "1px solid rgba(255,255,255,0.15)",
      pointerEvents: "auto",
    });

    const heading = document.createElement("div");
    heading.textContent = "Sun Alignment";
    Object.assign(heading.style, {
      fontWeight: 600,
      letterSpacing: "0.08em",
      fontSize: "11px",
      opacity: "0.85",
      textTransform: "uppercase",
    });
    section.appendChild(heading);

    const createSliderRow = (
      labelText: string,
      min: number,
      max: number,
      step: number,
      initialValue: number,
      onValue: (value: number) => void,
    ) => {
      const row = document.createElement("div");
      Object.assign(row.style, {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginTop: "8px",
      });

      const label = document.createElement("div");
      label.textContent = labelText;
      Object.assign(label.style, {
        width: "90px",
        opacity: "0.85",
        fontSize: "12px",
      });

      const input = document.createElement("input");
      input.type = "range";
      input.min = String(min);
      input.max = String(max);
      input.step = String(step);
      input.value = String(initialValue);
      input.style.flex = "1";

      const value = document.createElement("span");
      value.textContent = initialValue.toFixed(1);
      value.style.width = "48px";
      value.style.opacity = "0.75";

      const updateValue = (next: string | number) => {
        const v = Math.min(max, Math.max(min, Number(next)));
        if (!Number.isFinite(v)) return;
        input.value = String(v);
        value.textContent = v.toFixed(1);
        onValue(v);
      };

      input.addEventListener("input", (event) => {
        const target = event.target as HTMLInputElement | null;
        if (target) {
          updateValue(target.value);
        }
      });

      row.appendChild(label);
      row.appendChild(input);
      row.appendChild(value);
      section.appendChild(row);
    };

    const initialAzimuth = sunAlignment.getAzimuthDeg?.() ?? 0;
    const initialElevation = sunAlignment.getElevationDeg?.() ?? 0;

    createSliderRow(
      "Sun Azimuth",
      0,
      360,
      1,
      initialAzimuth,
      (value) => sunAlignment.onChange?.({ azimuthDeg: value }),
    );

    createSliderRow(
      "Sun Elevation",
      0,
      90,
      0.5,
      initialElevation,
      (value) => sunAlignment.onChange?.({ elevationDeg: value }),
    );

    contentContainer.appendChild(section);
  }

  wrap.appendChild(comp);
  wrap.appendChild(read);
  const slot = getUISlot("topRight");
  slot?.appendChild(wrap);

  const elPos = read.querySelector<HTMLSpanElement>("#hud-pos");
  const elBear = read.querySelector<HTMLSpanElement>("#hud-bear");

  // helpers
  const toBearing = (dir: Vector3Like) => {
    // dir: THREE.Vector3 camera forward; bearing measured on XZ plane:
    // yawDegrees = atan2(x, z) in degrees, normalized 0..360 (0 = North/ +Z)
    const yaw = Math.atan2(dir.x, dir.z) * 180 / Math.PI;
    const deg = (yaw + 360) % 360;
    const dirs = ["N","NE","E","SE","S","SW","W","NW","N"];
    const idx = Math.round(deg / 45);
    return { deg: Math.round(deg), label: dirs[idx] };
  };

  // update loop (requestAnimationFrame)
  let rafId = 0;
  let running = true;
  const loop = () => {
    if (!running) return;
    try {
      const p = getPosition?.();
      const d = getDirection?.();
      if (p && elPos) {
        elPos.textContent = `(${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)})`;
      }
      if (d && elBear) {
        const b = toBearing(d);
        elBear.textContent = `${b.deg}° ${b.label}`;
        needle.style.transform = `translate(-1px, -40px) rotate(${b.deg}deg)`;
      }
    } catch {}
    rafId = requestAnimationFrame(loop);
  };
  loop();

  // pin hotkey (P) to drop a marker and log coords
  const getPresetKeyBindings = (): Map<string, string> | null => {
    return read?._presetKeyBindings ?? null;
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key?.toLowerCase() === "p") {
      const p = getPosition?.();
      if (p) {
        // Let host drop a visual pin if provided
        onPin?.(p);
        // Always log a copy-paste line
        console.log(`[PIN] @ (${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)})`);
      }
    }

    const bindings = getPresetKeyBindings();
    if (!bindings || typeof onSetLightingPreset !== "function") return;
    if (e.repeat) return;
    const presetName = bindings.get(e.code) || bindings.get(e.key);
    if (presetName) {
      e.preventDefault();
      onSetLightingPreset(presetName);
    }
  };
  window.addEventListener("keydown", onKey);

  const handle: DevHudHandle = {
    dispose() {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", onKey);
      wrap.remove();
    },
    setStatusLine,
    setOceanStatus,
    rootElement: read,
    updateFogState: updateFogControls,
  };
  return handle;
}
