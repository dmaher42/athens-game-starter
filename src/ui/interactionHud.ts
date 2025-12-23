import { registerPanel } from "./HudManager.js";

export class InteractionHud {
  public root: HTMLElement;
  private keyEl: HTMLElement;
  private labelEl: HTMLElement;

  constructor() {
    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      background: "rgba(0, 0, 0, 0.7)",
      color: "#fff",
      padding: "8px 16px",
      borderRadius: "20px",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
      fontSize: "14px",
      fontWeight: "500",
      pointerEvents: "none",
      transition: "opacity 0.2s ease",
      opacity: "0",
      marginTop: "auto", // Push to bottom of center slot if needed
      marginBottom: "20%" // Lift up a bit
    });

    // Icon/Key prompt
    this.keyEl = document.createElement("span");
    this.keyEl.textContent = "[F]";
    Object.assign(this.keyEl.style, {
        background: "#fff",
        color: "#000",
        borderRadius: "4px",
        padding: "0 4px",
        marginRight: "8px",
        fontWeight: "bold",
        fontSize: "12px"
    });
    this.root.appendChild(this.keyEl);

    this.labelEl = document.createElement("span");
    this.root.appendChild(this.labelEl);

    registerPanel("interactionHud", this.root, 4);
  }

  show(text: string) {
    this.labelEl.textContent = text;
    this.root.style.opacity = "1";
  }

  hide() {
    this.root.style.opacity = "0";
  }
}
