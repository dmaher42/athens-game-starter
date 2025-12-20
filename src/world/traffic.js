import * as THREE from "three";

const TUNIC_COLORS = ["#ffffff", "#f5e6c8", "#c8d9ff"];
const CITIZEN_MESH_NAME = "Citizens";

export class TrafficManager {
  constructor(scene, roadCurves = [], terrain = null) {
    this.scene = scene;
    this.terrain = terrain;
    this.roadCurves = Array.isArray(roadCurves) ? roadCurves : [];
    this.agentCount = 40;
    this.agents = [];
    this.mesh = null;
    this.halfHeight = 0.85;
    this.tempMatrix = new THREE.Matrix4();
    this.tempQuaternion = new THREE.Quaternion();
    this.forward = new THREE.Vector3(0, 0, 1);
    this.nextPoint = new THREE.Vector3();
    this.position = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.scale = new THREE.Vector3(1, 1, 1);

    this.init();
  }

  init() {
    if (!this.scene || this.roadCurves.length === 0) {
      return;
    }

    const geometry = new THREE.BoxGeometry(0.5, 1.7, 0.5);
    const material = new THREE.MeshStandardMaterial({ vertexColors: true });
    const mesh = new THREE.InstancedMesh(geometry, material, this.agentCount);
    mesh.name = CITIZEN_MESH_NAME;
    mesh.castShadow = true;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh = mesh;

    for (let i = 0; i < this.agentCount; i++) {
      const curve = this.pickCurve();
      const t = Math.random();
      const speed = 0.1 + Math.random() * 0.1;
      const color = new THREE.Color(TUNIC_COLORS[i % TUNIC_COLORS.length]);
      this.agents.push({ curve, t, speed, paused: false, instanceId: i });
      mesh.setColorAt(i, color);
      this.updateAgent(i, 0);
    }
    mesh.instanceColor.needsUpdate = true;

    this.scene.add(mesh);
  }

  pickCurve() {
    if (this.roadCurves.length === 0) return null;
    const index = Math.floor(Math.random() * this.roadCurves.length);
    return this.roadCurves[index];
  }

  sampleHeight(x, z, fallback) {
    const getter = this.terrain?.userData?.getHeightAt;
    if (typeof getter === "function") {
      const height = getter(x, z);
      if (Number.isFinite(height)) return height;
    }
    return fallback;
  }

  updateAgent(index, dt) {
    const agent = this.agents[index];
    const mesh = this.mesh;
    if (!agent || !mesh || !agent.curve) return;
    if (agent.paused) return;

    agent.t += dt * agent.speed;
    if (agent.t >= 1) {
      agent.t = 1;
      agent.speed *= -1;
    } else if (agent.t <= 0) {
      agent.t = 0;
      agent.speed *= -1;
    }

    const position = agent.curve.getPoint(Math.min(Math.max(agent.t, 0), 1), this.position);
    const lookT = Math.min(1, Math.max(0, agent.t + 0.01 * Math.sign(agent.speed)));
    const lookTarget = agent.curve.getPoint(lookT, this.nextPoint);
    this.direction.copy(lookTarget).sub(position);

    if (this.direction.lengthSq() > 1e-6) {
      this.direction.normalize();
      this.tempQuaternion.setFromUnitVectors(this.forward, this.direction);
    }

    const groundY = this.sampleHeight(position.x, position.z, position.y);
    position.y = groundY + this.halfHeight;

    this.tempMatrix.compose(position, this.tempQuaternion, this.scale);
    mesh.setMatrixAt(index, this.tempMatrix);
  }

  update(deltaTime = 0) {
    if (!this.mesh || this.agents.length === 0) return;
    for (let i = 0; i < this.agents.length; i++) {
      this.updateAgent(i, deltaTime);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  getAgentByInstanceId(instanceId, mesh = null) {
    if (!Number.isInteger(instanceId)) return null;
    if (mesh && mesh !== this.mesh) return null;
    return this.agents[instanceId] ?? null;
  }

  getAgent(instanceId, mesh = null) {
    return this.getAgentByInstanceId(instanceId, mesh);
  }

  setAgentPaused(instanceId, paused = true) {
    const agent = this.getAgentByInstanceId(instanceId);
    if (!agent) return;
    agent.paused = !!paused;
  }

  pauseAgent(agentOrInstanceId, fallbackInstanceId = null) {
    const instanceId = this.resolveInstanceId(agentOrInstanceId, fallbackInstanceId);
    if (!Number.isInteger(instanceId)) return;
    this.setAgentPaused(instanceId, true);
  }

  resolveInstanceId(agentOrInstanceId, fallbackInstanceId = null) {
    if (Number.isInteger(agentOrInstanceId)) return agentOrInstanceId;
    if (Number.isInteger(fallbackInstanceId)) return fallbackInstanceId;
    const idx = this.agents.indexOf(agentOrInstanceId);
    return idx >= 0 ? idx : null;
  }
}
