import { createHudPanel } from "./hudShared.js";
import { registerPanel } from "./HudManager.js";
import "./hudTheme.css";

// Basic interface for what we expect from QuestManager (avoiding circular imports or complex types for now)
interface QuestState {
  title: string | null;
  objective: string | null;
  status: string;
  progress?: number;
  target?: number;
}

interface QuestManager {
  subscribe(callback: (state: QuestState) => void): () => void;
}

export class QuestHud {
  private root: HTMLElement;
  private titleEl: HTMLElement;
  private objectiveEl: HTMLElement;
  private progressContainer: HTMLElement;
  private progressBar: HTMLElement;

  constructor(questManager: QuestManager) {
    const panel = createHudPanel({
      title: "Active Quest",
      className: "quest-hud",
      toggleLabels: { expanded: "Hide", collapsed: "Show" },
    });

    this.root = panel.root;
    this.root.style.display = "none"; // Hidden by default until a quest starts

    this.titleEl = document.createElement("div");
    this.titleEl.className = "quest-hud__title";
    panel.content.appendChild(this.titleEl);

    this.objectiveEl = document.createElement("div");
    this.objectiveEl.className = "quest-hud__objective";
    panel.content.appendChild(this.objectiveEl);

    // Progress Bar
    this.progressContainer = document.createElement("div");
    this.progressContainer.className = "quest-hud__progress-container";
    panel.content.appendChild(this.progressContainer);

    this.progressBar = document.createElement("div");
    this.progressBar.className = "quest-hud__progress-bar";
    this.progressContainer.appendChild(this.progressBar);

    registerPanel("questHud", this.root, 1);

    // Subscribe to updates
    if (questManager) {
      questManager.subscribe(this.update.bind(this));
    }
  }

  update(questState: QuestState) {
    if (!questState || questState.status === 'Not Started' || !questState.title) {
      this.root.style.display = "none";
      return;
    }

    this.root.style.display = "block";
    this.titleEl.textContent = questState.title || "";
    
    // Auto-formatting objective with progress if available
    let objectiveText = questState.objective || "";
    if (questState.target && questState.target > 0) {
        const prog = questState.progress || 0;
        objectiveText = `${objectiveText} (${prog}/${questState.target})`;
        
        // Update visual bar
        const percent = Math.min(100, (prog / questState.target) * 100);
        this.progressBar.style.width = `${percent}%`;
        this.progressContainer.style.display = "block";
    } else {
        this.progressContainer.style.display = "none";
    }
    
    this.objectiveEl.textContent = objectiveText;

    if (questState.status === 'Completed') {
        this.root.classList.add("quest-hud--completed");
        this.progressBar.classList.add("quest-hud__progress-bar--completed");
    } else {
        this.root.classList.remove("quest-hud--completed");
        this.progressBar.classList.remove("quest-hud__progress-bar--completed");
    }
  }
}
