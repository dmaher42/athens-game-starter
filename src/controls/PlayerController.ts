// Stub PlayerController – logic will be added in Step 5
import * as THREE from 'three';
import type { InputMap } from '../input/InputMap';
import type { EnvironmentCollider } from '../env/EnvironmentCollider';

export interface PlayerOptions {
  height?: number;
  radius?: number;
  camera?: THREE.Camera;
}

export class PlayerController {
  public object = new THREE.Object3D();

  constructor(
    _input: InputMap,
    _env: EnvironmentCollider,
    _opts: PlayerOptions = {}
  ) {}

  get position() { return this.object.position; }
  update(_dt: number) {}
}
export default PlayerController;
