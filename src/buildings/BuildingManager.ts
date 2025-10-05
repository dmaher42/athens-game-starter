import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { EnvironmentCollider } from '../env/EnvironmentCollider';

export class BuildingManager {
  private loader = new GLTFLoader();
  constructor(private envCollider: EnvironmentCollider) {}

  async loadBuilding(
    url: string,
    options?: {
      position?: THREE.Vector3;
      scale?: number;
      rotateY?: number;
      collision?: boolean;
    }
  ) {
    const gltf = await this.loader.loadAsync(url);
    const obj = gltf.scene;
    if (options?.scale) obj.scale.setScalar(options.scale);
    if (options?.rotateY) obj.rotation.y = options.rotateY;
    if (options?.position) obj.position.copy(options.position);

    // Add to scene
    this.envCollider.mesh.parent?.add(obj);

    // If collision desired, mark meshes
    if (options?.collision) {
      obj.traverse((child: any) => {
        if (child.isMesh) {
          child.userData.noCollision = false;
        }
      });
      // Rebuild the collider from static scene
      this.envCollider.fromStaticScene(this.envCollider.mesh.parent!);
    } else {
      obj.traverse((child: any) => {
        if (child.isMesh) {
          child.userData.noCollision = true;
        }
      });
    }

    return obj;
  }
}
