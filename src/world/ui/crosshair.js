import "./crosshair.css";

/**
 * Injects a tiny crosshair element so the player can see where they are aiming.
 * We only create it once, even if attachCrosshair is called multiple times.
 */
export function attachCrosshair() {
  if (document.querySelector(".crosshair-overlay")) {
    return;
  }

  const crosshair = document.createElement("div");
  crosshair.className = "crosshair-overlay";
  document.body.appendChild(crosshair);
}
