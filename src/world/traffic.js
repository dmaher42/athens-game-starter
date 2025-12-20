import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

const CITY_RADIUS = 200;
const MIN_TARGET_DISTANCE = 10;
const MAX_TARGET_DISTANCE = 20;
const WATER_HEIGHT_THRESHOLD = 2.0;
const TUNIC_COLORS = ["#ffffff", "#f5e6c8", "#7a5b3a", "#c8d9ff"];
const VILLAGER_MESH_NAME = "Villagers";
const STATE_IDLE = 0;
const STATE_WALKING = 1;

function applyColorAttribute(geometry, color) {
  const positionAttribute = geometry.getAttribute("position");
  const colorArray = new Float32Array(positionAttribute.count * 3);
  for (let i = 0; i < positionAttribute.count; i++) {
    colorArray[i * 3] = color.r;
    colorArray[i * 3 + 1] = color.g;
    colorArray[i * 3 + 2] = color.b;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));
}

function generateVillagerGeometry() {
  const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.5, 1.2, 8);
  applyColorAttribute(bodyGeometry, new THREE.Color(0xffffff));

  const headGeometry = new THREE.SphereGeometry(0.25, 8, 6);
  headGeometry.translate(0, 1.3, 0);
  applyColorAttribute(headGeometry, new THREE.Color("#e0ac69"));

  return BufferGeometryUtils.mergeGeometries([bodyGeometry, headGeometry], true);
}

export class VillagerSystem {
  constructor(scene, terrain = null, count = 60) {
    this.scene = scene;
    this.terrain = terrain;
    this.count = Math.max(0, Math.floor(count ?? 60));
    this.mesh = null;
    this.halfHeight = 0.85;

    this.positions = new Array(this.count);
    this.targets = new Array(this.count);
    this.states = new Array(this.count).fill(STATE_IDLE);
    this.timers = new Array(this.count).fill(0);
    this.speeds = new Array(this.count);
    this.rotations = new Array(this.count);

    this.tempMatrix = new THREE.Matrix4();
    this.tempQuaternion = new THREE.Quaternion();
    this.forward = new THREE.Vector3(0, 0, 1);
    this.direction = new THREE.Vector3();
    this.scale = new THREE.Vector3(1, 1, 1);

    this.init();
  }

  init() {
    if (!this.scene || this.count <= 0) return;

    const geometry = generateVillagerGeometry();
    const material = new THREE.MeshStandardMaterial({ vertexColors: true });
    const mesh = new THREE.InstancedMesh(geometry, material, this.count);
    mesh.name = VILLAGER_MESH_NAME;
    mesh.castShadow = true;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh = mesh;

    for (let i = 0; i < this.count; i++) {
      const color = new THREE.Color(TUNIC_COLORS[i % TUNIC_COLORS.length]);
      mesh.setColorAt(i, color);
      this.speeds[i] = 1.5 + Math.random() * 1.5;
      this.rotations[i] = new THREE.Quaternion();
      this.spawnVillager(i);
      this.updateVillagerMatrix(i);
    }

    mesh.instanceColor.needsUpdate = true;
    this.scene.add(mesh);
  }

  sampleHeight(x, z, fallback = 0) {
    const getter = this.terrain?.userData?.getHeightAt;
    if (typeof getter === "function") {
      const height = getter(x, z);
      if (Number.isFinite(height)) return height;
    }
    return fallback;
  }

  randomNavigablePoint() {
    for (let attempts = 0; attempts < 20; attempts++) {
      const r = Math.sqrt(Math.random()) * CITY_RADIUS;
      const theta = Math.random() * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      const height = this.sampleHeight(x, z, 0);
      if (height > WATER_HEIGHT_THRESHOLD) {
        return new THREE.Vector3(x, height + this.halfHeight, z);
      }
    }
    return new THREE.Vector3(0, this.halfHeight, 0);
  }

  pickNewTarget(fromPosition) {
    for (let attempts = 0; attempts < 20; attempts++) {
      const distance =
        MIN_TARGET_DISTANCE + Math.random() * (MAX_TARGET_DISTANCE - MIN_TARGET_DISTANCE);
      const theta = Math.random() * Math.PI * 2;
      const offsetX = Math.cos(theta) * distance;
      const offsetZ = Math.sin(theta) * distance;
      const x = fromPosition.x + offsetX;
      const z = fromPosition.z + offsetZ;

      if (Math.hypot(x, z) > CITY_RADIUS) continue;

      const height = this.sampleHeight(x, z, fromPosition.y - this.halfHeight);
      if (height > WATER_HEIGHT_THRESHOLD) {
        return new THREE.Vector3(x, height + this.halfHeight, z);
      }
    }
    return fromPosition.clone();
  }

  spawnVillager(index) {
    const startPos = this.randomNavigablePoint();
    this.positions[index] = startPos;
    this.targets[index] = startPos.clone();
    this.states[index] = STATE_IDLE;
    this.timers[index] = 2 + Math.random() * 3;
    this.rotations[index].identity();
  }

  updateVillagerMatrix(index) {
    const position = this.positions[index];
    const rotation = this.rotations[index];
    if (!position || !rotation || !this.mesh) return;
    this.tempMatrix.compose(position, rotation, this.scale);
    this.mesh.setMatrixAt(index, this.tempMatrix);
  }

  update(dt = 0) {
    if (!this.mesh) return;

    for (let i = 0; i < this.count; i++) {
      this.updateVillager(i, dt);
      this.updateVillagerMatrix(i);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
  }

  updateVillager(index, dt) {
    const position = this.positions[index];
    const target = this.targets[index];
    if (!position || !target) return;

    const state = this.states[index];
    if (state === STATE_IDLE) {
      this.timers[index] -= dt;
      if (this.timers[index] <= 0) {
        this.states[index] = STATE_WALKING;
        this.targets[index] = this.pickNewTarget(position);
      }
      return;
    }

    // WALKING
    this.direction.copy(target).sub(position);
    const distance = this.direction.length();

    if (distance > 0.0001) {
      this.direction.normalize();
      const step = Math.min(distance, this.speeds[index] * dt);
      position.addScaledVector(this.direction, step);

      this.tempQuaternion.setFromUnitVectors(this.forward, this.direction);
      this.rotations[index].copy(this.tempQuaternion);
    }

    const groundY = this.sampleHeight(position.x, position.z, position.y - this.halfHeight);
    const bobOffset =
      state === STATE_WALKING ? Math.sin(Date.now() * 0.01 + index) * 0.1 : 0;
    position.y = groundY + this.halfHeight + bobOffset;

    if (distance < 1.0) {
      this.states[index] = STATE_IDLE;
      this.timers[index] = 2 + Math.random() * 3;
    }
  }
}
