import type { AudioMixerOptions } from "@app/types";

import { registerPanel, unregisterPanel } from "./HudManager.js";
import "./hudTheme.css";

export interface AudioMixerSoundscape {
  masterGain: { gain: { value: number } };
  bus: {
    ambience: { gain: { value: number } };
    voices: { gain: { value: number } };
    effects: { gain: { value: number } };
  };
}

export interface AudioMixerHandle {
  readonly element: HTMLElement;
  dispose(): void;
}

const DEFAULT_HOTKEY = "F10" as const;

// Minimal UI overlay for audio mixer (F10 toggles)
export function mountAudioMixer(
  soundscape: AudioMixerSoundscape | null | undefined,
  opts: AudioMixerOptions = {},
): AudioMixerHandle | null {
  if (!soundscape || typeof document === "undefined") {
    return null;
  }

  const hasGainNode = (node: unknown): node is { gain: { value: number } } =>
    !!node &&
    typeof node === "object" &&
    "gain" in node &&
    typeof (node as { gain?: unknown }).gain === "object" &&
    (node as { gain?: { value?: unknown } }).gain?.value !== undefined;

  const bus = soundscape.bus;

  if (
    !hasGainNode(soundscape.masterGain) ||
    !hasGainNode(bus) ||
    !hasGainNode(bus.ambience) ||
    !hasGainNode(bus.voices) ||
    !hasGainNode(bus.effects)
  ) {
    console.warn("[AudioMixer] Missing required soundscape nodes; mixer disabled.");
    return null;
  }

  const key = typeof opts.key === "string" && opts.key.trim().length > 0 ? opts.key : DEFAULT_HOTKEY;

  const wrap = document.createElement("div");
  Object.assign(wrap.style, {
    padding: "10px 12px",
    background: "var(--hud-bg)",
    backdropFilter: "blur(6px)",
    borderRadius: "var(--hud-radius-md)",
    color: "var(--hud-text)",
    font: "var(--hud-font)",
    userSelect: "none",
  } satisfies Partial<CSSStyleDeclaration>);

  const createSlider = (
    label: string,
    node: { gain: { value: number } },
    initial = 0.8,
  ): HTMLDivElement => {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.margin = "4px 0";

    const span = document.createElement("span");
    span.textContent = label;
    span.style.width = "80px";
    span.style.opacity = "0.9";

    const input = document.createElement("input");
    input.type = "range";
    input.min = "0";
    input.max = "1";
    input.step = "0.01";
    input.value = String(initial);
    input.style.width = "140px";
    input.addEventListener("input", () => {
      node.gain.value = Number(input.value);
    });

    row.appendChild(span);
    row.appendChild(input);
    return row;
  };

  wrap.appendChild(createSlider("Master", soundscape.masterGain, 0.9));
  wrap.appendChild(createSlider("Ambience", bus.ambience, 0.9));
  wrap.appendChild(createSlider("Voices", bus.voices, 0.7));
  wrap.appendChild(createSlider("Effects", bus.effects, 0.7));

  registerPanel("audioMixer", wrap, 1);

  const handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === key) {
      wrap.style.display = wrap.style.display !== "none" ? "none" : "block";
      event.preventDefault();
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("keydown", handleKeydown);
  }

  return {
    element: wrap,
    dispose() {
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", handleKeydown);
      }
      unregisterPanel("audioMixer");
      wrap.remove();
    },
  };
}
