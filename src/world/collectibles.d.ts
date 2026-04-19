import type { Object3D, Vector3 } from "three";
import type { QuestManager } from "../state/QuestManager.js";

export class CollectiblesManager {
  scene: Object3D;
  questManager: QuestManager | null;
  items: Object3D[];
  score: number;
  total: number;
  onScoreChange: ((score: number, total: number, type: string, typeScore: number) => void) | null;

  constructor(scene: Object3D, questManager?: QuestManager | null);

  spawnAt(x: number, y: number, z: number, type?: string): void;
  spawnRandomly(
    terrain: Object3D | null | undefined,
    count: number,
    center: Vector3,
    radius: number
  ): void;
  update(dt: number, playerPos: Vector3 | null | undefined): void;
  collect(item: Object3D): void;
}
