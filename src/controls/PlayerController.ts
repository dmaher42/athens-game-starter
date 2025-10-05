import * as THREE from 'three';
import { Capsule } from 'three/examples/jsm/math/Capsule.js';
import type { InputMap } from '../input/InputMap';
import type { EnvironmentCollider } from '../env/EnvironmentCollider';
import type { Character } from '../characters/Character';

const UP = new THREE.Vector3(0, 1, 0);

export interface PlayerOptions {
  height?: number;
  radius?: number;
  camera?: THREE.Camera;
}

interface CapsuleCollisionResult {
  normal: THREE.Vector3;
  depth: number;
}

export class PlayerController {
  public object = new THREE.Object3D();

  public moveSpeed = 4.0;
  public sprintMult = 1.8;
  public gravity = 12.0;
  public jumpSpeed = 5.0;
  public slopeLimit = 50;

  private readonly input: InputMap;
  private readonly env: EnvironmentCollider;
  private readonly camera?: THREE.Camera;
  private readonly height: number;
  private readonly radius: number;
  private readonly capsule: Capsule;

  private velocity = new THREE.Vector3();
  private groundNormal = new THREE.Vector3(0, 1, 0);
  private grounded = false;
  private jumpLocked = false;

  private character?: Character;

  private readonly desired = new THREE.Vector3();
  private readonly tmpVec = new THREE.Vector3();
  private readonly tmpVec2 = new THREE.Vector3();
  private readonly tmpVec3 = new THREE.Vector3();
  private readonly tmpVec4 = new THREE.Vector3();
  private readonly tmpQuat = new THREE.Quaternion();

  // damping used to smooth horizontal velocity on ground vs air
  private readonly groundDamping = 16;
  private readonly airDamping = 6;

  constructor(
    input: InputMap,
    env: EnvironmentCollider,
    opts: PlayerOptions = {}
  ) {
    this.input = input;
    this.env = env;
    this.camera = opts.camera;

    this.height = opts.height ?? 1.8;
    this.radius = opts.radius ?? 0.35; // Capsule alignment tip: tweak radius (~0.35-0.42) & height (~1.8) so feet meet the ground.

    const topOffset = this.height - this.radius;
    this.capsule = new Capsule(
      new THREE.Vector3(0, this.radius, 0),
      new THREE.Vector3(0, topOffset, 0),
      this.radius
    );

    this.object.position.set(0, this.height * 0.5, 0);
    this.syncCapsuleToObject();
  }

  get position() { return this.object.position; }

  attachCharacter(char: Character) {
    this.character = char;
    this.object.add(char);
    char.position.set(0, 0, 0);
  }

  update(dt: number) {
    if (!Number.isFinite(dt) || dt <= 0) return;

    const sprinting = this.input.sprint;
    const speed = this.moveSpeed * (sprinting ? this.sprintMult : 1);

    this.computeDesiredVelocity(speed);

    // smooth horizontal velocity using exponential damping
    const damping = this.grounded ? this.groundDamping : this.airDamping;
    this.velocity.x = THREE.MathUtils.damp(
      this.velocity.x,
      this.desired.x,
      damping,
      dt
    );
    this.velocity.z = THREE.MathUtils.damp(
      this.velocity.z,
      this.desired.z,
      damping,
      dt
    );

    // apply friction-style damping when no input
    if (this.desired.lengthSq() === 0) {
      const friction = this.grounded ? 0.85 : 0.95;
      const decay = Math.pow(friction, dt);
      this.velocity.x *= decay;
      this.velocity.z *= decay;
    }

    if (this.grounded && this.input.jump && !this.jumpLocked) {
      this.velocity.y = this.jumpSpeed;
      this.grounded = false;
      this.jumpLocked = true;
    }

    if (!this.input.jump) {
      this.jumpLocked = false;
    }

    if (!this.grounded) {
      this.velocity.y -= this.gravity * dt;
    }

    const delta = this.tmpVec.copy(this.velocity).multiplyScalar(dt);
    this.capsule.translate(delta);
    this.resolveCollisions(dt);

    const center = this.getCapsuleCenter(this.tmpVec);
    this.object.position.copy(center);

    const horizontalSpeed = Math.hypot(this.velocity.x, this.velocity.z);

    if (this.character) {
      const EPS = 0.05;
      const yawFacing = Math.atan2(this.velocity.x, this.velocity.z);
      if (horizontalSpeed > EPS) {
        this.character.rotation.y = yawFacing;
      }

      if (!this.grounded) {
        this.character.play('Jump', 0.05);
      } else if (horizontalSpeed > (this.moveSpeed * 1.2)) {
        this.character.play('Run', 0.1);
      } else if (horizontalSpeed > 0.1) {
        this.character.play('Walk', 0.1);
      } else {
        this.character.play('Idle', 0.2);
      }

      this.character.update(dt);
    }
  }

  private computeDesiredVelocity(speed: number) {
    this.desired.set(0, 0, 0);

    const dirX = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
    const dirZ = (this.input.forward ? 1 : 0) - (this.input.back ? 1 : 0);

    if (dirX === 0 && dirZ === 0) {
      return;
    }

    this.tmpVec2.set(dirX, 0, dirZ).normalize();

    if (this.camera) {
      this.camera.getWorldQuaternion(this.tmpQuat);
      const forward = this.tmpVec3.set(0, 0, -1).applyQuaternion(this.tmpQuat);
      forward.y = 0;
      if (forward.lengthSq() < 1e-6) {
        forward.set(0, 0, -1);
      } else {
        forward.normalize();
      }

      const right = this.tmpVec.copy(forward).cross(UP);
      if (right.lengthSq() < 1e-6) {
        right.set(1, 0, 0);
      } else {
        right.normalize();
      }

      this.desired
        .copy(forward).multiplyScalar(this.tmpVec2.z)
        .addScaledVector(right, this.tmpVec2.x)
        .normalize()
        .multiplyScalar(speed);
    } else {
      this.desired.copy(this.tmpVec2).multiplyScalar(speed);
    }
  }

  private resolveCollisions(dt: number) {
    const collider = this.env as unknown as {
      capsuleIntersect?: (capsule: Capsule) => CapsuleCollisionResult | null | undefined;
    };

    this.grounded = false;
    let slopeNormal: THREE.Vector3 | null = null;

    if (collider?.capsuleIntersect) {
      for (let i = 0; i < 3; i++) {
        const result = collider.capsuleIntersect(this.capsule);
        if (!result) break;

        this.tmpVec.copy(result.normal).multiplyScalar(result.depth);
        this.capsule.translate(this.tmpVec);

        const normal = this.tmpVec2.copy(result.normal).normalize();
        const velDot = normal.dot(this.velocity);
        if (velDot < 0) {
          this.velocity.addScaledVector(normal, -velDot);
        }

        const cosSlope = THREE.MathUtils.clamp(normal.dot(UP), -1, 1);
        const slopeAngle = THREE.MathUtils.radToDeg(Math.acos(cosSlope));

        if (normal.y > 0) {
          if (slopeNormal === null) slopeNormal = this.tmpVec4;
          slopeNormal.copy(normal);
          if (slopeAngle <= this.slopeLimit) {
            this.grounded = true;
            this.groundNormal.copy(normal);
          }
        }
      }
    } else {
      // Fallback to a flat plane at y = height * 0.5
      const center = this.getCapsuleCenter(this.tmpVec3);
      const minY = this.height * 0.5;
      if (center.y < minY) {
        this.tmpVec.set(0, minY - center.y, 0);
        this.capsule.translate(this.tmpVec);
        if (this.velocity.y < 0) this.velocity.y = 0;
        this.grounded = true;
        this.groundNormal.set(0, 1, 0);
      }
    }

    if (this.grounded) {
      if (this.velocity.y < 0) this.velocity.y = 0;
      const cosSlope = THREE.MathUtils.clamp(this.groundNormal.dot(UP), -1, 1);
      const angle = THREE.MathUtils.radToDeg(Math.acos(cosSlope));
      if (angle > this.slopeLimit) {
        this.grounded = false;
      }
    }

    if (!this.grounded && slopeNormal) {
      const slide = this.tmpVec.copy(slopeNormal).projectOnPlane(UP);
      if (slide.lengthSq() > 1e-6) {
        slide.normalize();
        this.velocity.addScaledVector(slide, this.gravity * dt);
      }
      this.groundNormal.copy(slopeNormal);
    }

    if (!this.grounded && this.velocity.y > 0 && slopeNormal) {
      // keep upward momentum but ensure we don't cling to slopes
      const normal = slopeNormal;
      const velDot = normal.dot(this.velocity);
      if (velDot < 0) {
        this.velocity.addScaledVector(normal, -velDot);
      }
    }

    if (!this.grounded && !slopeNormal) {
      this.groundNormal.set(0, 1, 0);
    }
  }

  private syncCapsuleToObject() {
    const center = this.object.position;
    const halfHeight = this.height * 0.5;
    this.capsule.start.set(
      center.x,
      center.y - halfHeight + this.radius,
      center.z
    );
    this.capsule.end.set(
      center.x,
      center.y + halfHeight - this.radius,
      center.z
    );
  }

  private getCapsuleCenter(target: THREE.Vector3) {
    return target
      .copy(this.capsule.start)
      .add(this.capsule.end)
      .multiplyScalar(0.5);
  }
}

export default PlayerController;
