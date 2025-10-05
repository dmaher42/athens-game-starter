// Stub EnvironmentCollider – logic will be added in Step 4
import * as THREE from 'three';

export class EnvironmentCollider {
  public mesh: THREE.Mesh;

  constructor() {
    this.mesh = new THREE.Mesh(
      new THREE.BufferGeometry(),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.mesh.frustumCulled = false;
    this.mesh.matrixAutoUpdate = false;
  }

  fromStaticScene(_root: THREE.Object3D, _opts: { debug?: boolean } = {}) {
    // Implementation to come (BVH + merge)
  }
}
export default EnvironmentCollider;
