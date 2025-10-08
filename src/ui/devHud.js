// Dev HUD: compass + coordinates + pin hotkey (P)
export function mountDevHUD({
  getPosition,
  getDirection,
  onPin,
  onSetLightingPreset,
  lightingPresets,
} = {}) {
  const allowHud =
    import.meta.env?.DEV ||
    (typeof window !== "undefined" && window.SHOW_HUD === true);
  if (!allowHud) return null;

  // --- DOM
  const wrap = document.createElement("div");
  Object.assign(wrap.style, {
    position: "fixed", top: "12px", right: "12px",
    zIndex: 999999, color: "#fff",
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
  const read = document.createElement("div");
  read.style.pointerEvents = "auto"; // allow copy selection
  read.style.background = "rgba(0,0,0,0.55)";
  read.style.backdropFilter = "blur(3px)";
  read.style.padding = "8px 10px";
  read.style.borderRadius = "8px";
  read.style.minWidth = "220px";
  read.innerHTML = [
    `<div><b>Pos</b> <span id="hud-pos">(x,y,z)</span></div>`,
    `<div><b>Bear</b> <span id="hud-bear">0° N</span></div>`,
    `<div style="opacity:.8">Press <b>P</b> to drop a pin</div>`
  ].join("");

  const defaultPresetOrder = [
    { name: "dawn", label: "Dawn" },
    { name: "noon", label: "High Noon" },
    { name: "dusk", label: "Dusk" },
    { name: "night", label: "Night" },
  ];
  const availablePresets = defaultPresetOrder.filter(({ name }) => {
    if (!lightingPresets) return true;
    return lightingPresets[name] != null;
  });

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

    const presetHotkeyConfig = [
      { name: "dawn", codes: ["Digit1", "Numpad1"], keys: ["1"] },
      { name: "noon", codes: ["Digit2", "Numpad2"], keys: ["2"] },
      { name: "dusk", codes: ["Digit3", "Numpad3"], keys: ["3"] },
      { name: "night", codes: ["Digit4", "Numpad4"], keys: ["4"] },
    ];
    const activePresetNames = new Set(availablePresets.map((preset) => preset.name));
    const presetKeyBindings = new Map();

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
      button.addEventListener("mouseenter", () => {
        button.style.background = "rgba(255,255,255,0.18)";
        button.style.borderColor = "rgba(255,255,255,0.55)";
      });
      button.addEventListener("mouseleave", () => {
        button.style.background = "rgba(0,0,0,0.35)";
        button.style.borderColor = "rgba(255,255,255,0.35)";
      });

      const hotkeyLabel = presetMeta.hotkey || "";
      if (hotkeyLabel) {
        button.title = `Set ${displayLabel} lighting (Hotkey ${hotkeyLabel})`;
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
    read.appendChild(section);

    read._presetKeyBindings = presetKeyBindings;
  }

  wrap.appendChild(comp);
  wrap.appendChild(read);
  document.body.appendChild(wrap);

  const elPos = read.querySelector("#hud-pos");
  const elBear= read.querySelector("#hud-bear");

  // helpers
  const toBearing = (dir) => {
    // dir: THREE.Vector3 camera forward; bearing measured on XZ plane:
    // yawDegrees = atan2(x, z) in degrees, normalized 0..360 (0 = North/ +Z)
    const yaw = Math.atan2(dir.x, dir.z) * 180 / Math.PI;
    const deg = (yaw + 360) % 360;
    const dirs = ["N","NE","E","SE","S","SW","W","NW","N"];
    const idx = Math.round(deg / 45);
    return { deg: Math.round(deg), label: dirs[idx] };
  };

  // update loop (requestAnimationFrame)
  let rafId = 0, running = true;
  const loop = () => {
    if (!running) return;
    try {
      const p = getPosition?.();
      const d = getDirection?.();
      if (p) {
        elPos.textContent = `(${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)})`;
      }
      if (d) {
        const b = toBearing(d);
        elBear.textContent = `${b.deg}° ${b.label}`;
        needle.style.transform = `translate(-1px, -40px) rotate(${b.deg}deg)`;
      }
    } catch {}
    rafId = requestAnimationFrame(loop);
  };
  loop();

  // pin hotkey (P) to drop a marker and log coords
  const getPresetKeyBindings = () => {
    if (read?._presetKeyBindings instanceof Map) {
      return read._presetKeyBindings;
    }
    return null;
  };

  const onKey = (e) => {
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

  return {
    dispose(){
      running = false; cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", onKey);
      wrap.remove();
    }
  };
}
