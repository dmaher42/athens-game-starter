import { getUISlot } from "./uiRoot.js";

// Minimal UI overlay for audio mixer (F10 toggles)
export function mountAudioMixer(soundscape, opts = {}) {
  if (!soundscape) return null;
  const KEY = opts.key ?? "F10";
  const wrap = document.createElement("div");
  Object.assign(wrap.style, {
    // mounted in a shared UI slot; no absolute positioning needed
    padding: "10px 12px", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
    borderRadius: "10px", color: "#fff", font: "12px/1.2 ui-sans-serif, system-ui",
    userSelect: "none"
  });
  const mk = (label, node, initial=0.8) => {
    const row = document.createElement("div");
    row.style.display = "flex"; row.style.alignItems = "center"; row.style.margin = "4px 0";
    const span = document.createElement("span"); span.textContent = label; span.style.width = "80px";
    const input = document.createElement("input");
    input.type = "range"; input.min = "0"; input.max = "1"; input.step = "0.01"; input.value = String(initial);
    input.style.width = "140px";
    input.addEventListener("input", () => { node.gain.value = Number(input.value); });
    row.appendChild(span); row.appendChild(input); return row;
  };
  wrap.appendChild(mk("Master", soundscape.masterGain, 0.9));
  wrap.appendChild(mk("Ambience", soundscape.bus.ambience, 0.9));
  wrap.appendChild(mk("Voices", soundscape.bus.voices, 0.7));
  wrap.appendChild(mk("Effects", soundscape.bus.effects, 0.7));
  getUISlot("topRight").appendChild(wrap);
  const onKey = (e)=>{ if (e.key === KEY){ wrap.style.display = wrap.style.display !== "none" ? "none" : "block"; e.preventDefault(); }};
  window.addEventListener("keydown", onKey);
  return { dispose(){ window.removeEventListener("keydown", onKey); wrap.remove(); } };
}
