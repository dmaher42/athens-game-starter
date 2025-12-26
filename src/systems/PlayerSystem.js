import * as THREE from "three";
import { InputMap } from "../input/InputMap.ts";
import { PlayerController } from "../controls/PlayerController.js";
import { ThirdPersonCamera } from "../controls/ThirdPersonCamera.js";
import { Character } from "../characters/Character.js";
import { findSafePlayerSpawn } from "../world/spawn.js";
import { AGORA_CENTER_3D, getSeaLevelY } from "../world/locations.js";
import { createGLTFLoader, loadGLBWithFallbacks } from "../utils/glbSafeLoader.js";
import { joinPath } from "../utils/baseUrl.js";

const USE_THIRD_PERSON = true;
const ENABLE_HERO_GLB = true;

export class PlayerSystem {
  constructor({ scene, camera, renderer, envCollider, terrain, worldRoot, baseUrl }) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.envCollider = envCollider;
    this.terrain = terrain;
    this.worldRoot = worldRoot;
    this.baseUrl = baseUrl;
    this.player = null;
    this.thirdPersonCamera = null;
    this.playerMovementEnabled = true;
  }

  async initialize() {
    const { scene, camera, renderer, envCollider, terrain, worldRoot, baseUrl } = this;

    const input = new InputMap(renderer.domElement);
    this.player = new PlayerController(input, envCollider, {
      camera,
      terrainHeightSampler: terrain?.userData?.getHeightAt ?? null,
    });
    worldRoot.add(this.player.object);

    const spawnPosition = findSafePlayerSpawn({
      envCollider,
      terrain,
      searchCenter: AGORA_CENTER_3D,
      fallback: AGORA_CENTER_3D,
      playerHeight: this.player.height,
      playerRadius: this.player.radius,
      verticalClearance: 3.0,
      seaLevel: 0,
    });
    this.player.object.position.copy(spawnPosition);
    this.player.syncCapsuleToObject();

    const thirdPersonSolids = [];
    if (envCollider?.mesh) {
      thirdPersonSolids.push(envCollider.mesh);
    }
    if (terrain) {
      thirdPersonSolids.push(terrain);
    }

    const thirdPersonTargetOffset = new THREE.Vector3(
      0,
      this.player.height * 0.6,
      0,
    );

    if (USE_THIRD_PERSON) {
      this.thirdPersonCamera = new ThirdPersonCamera(camera, this.player.object, {
        targetOffset: thirdPersonTargetOffset,
        followLerp: 0.12,
        rotationLerp: 0.15,
        solids: thirdPersonSolids,
        enabled: false,
        keyOrbit: {
          enabled: true,
          yawSpeed: 0.9,
          pitchSpeed: 0.9,
          minPitch: -0.6,
          maxPitch: 0.6,
          minDist: 2.5,
          maxDist: 7.5,
          zoomSpeed: 4,
        },
      });
    }

    await this.loadCharacter();

    this.setThirdPersonEnabled(USE_THIRD_PERSON);
  }

  update(deltaTime) {
    if (this.playerMovementEnabled) {
      this.player.update(deltaTime);
    } else {
      this.player.velocity.set(0, 0, 0);
    }

    if (this.thirdPersonCamera) {
      this.player.cameraYaw = this.thirdPersonCamera.getYaw();
      this.player.cameraPitch = this.thirdPersonCamera.getPitch();
      this.thirdPersonCamera.update(deltaTime);
    }

    const playerRoot = this.player?.object;
    const seaLevel = getSeaLevelY();

    if (playerRoot && playerRoot.position.y < seaLevel - 15.0) {
      const respawnPos = findSafePlayerSpawn({
        envCollider: this.envCollider,
        terrain: this.terrain,
        searchCenter: AGORA_CENTER_3D,
        fallback: AGORA_CENTER_3D,
        playerHeight: this.player.height,
        playerRadius: this.player.radius,
        verticalClearance: 0.5,
        seaLevel: seaLevel,
      });
      this.player.velocity.set(0, 0, 0);
      playerRoot.position.copy(respawnPos);
      this.player.syncCapsuleToObject();
    }

    const terrainSize = this.terrain?.geometry?.userData?.size;
    if (playerRoot && Number.isFinite(terrainSize)) {
      const halfSize = terrainSize * 0.5;
      const margin = 2.0;
      const minBound = -halfSize + margin;
      const maxBound = halfSize - margin;
      const pos = playerRoot.position;

      const clampedX = THREE.MathUtils.clamp(pos.x, minBound, maxBound);
      const clampedZ = THREE.MathUtils.clamp(pos.z, minBound, maxBound);
      const clamped = clampedX !== pos.x || clampedZ !== pos.z;
      if (clamped) {
        pos.x = clampedX;
        pos.z = clampedZ;

        const sampler =
          typeof this.scene?.userData?.getHeightAt === "function"
            ? this.scene.userData.getHeightAt
            : typeof this.terrain?.userData?.getHeightAt === "function"
            ? this.terrain.userData.getHeightAt
            : null;
        if (sampler) {
          const groundHeight = sampler(pos.x, pos.z);
          if (Number.isFinite(groundHeight)) {
            pos.y = Math.max(pos.y, groundHeight + 0.1);
          }
        }
      }
    }
  }

  async loadCharacter() {
    const character = new Character();
    const heroRootPath = "models/character/hero.glb";
    const bundledHeroName = encodeURIComponent("astronaut.glb");
    const characterDir = joinPath(this.baseUrl, "models/character");
    const bundledHeroPath = joinPath(characterDir, bundledHeroName);
    const bundledHeroRootPath = `models/character/${bundledHeroName}`;
    const heroCandidates = Array.from(
      new Set(
        [heroRootPath, bundledHeroPath, bundledHeroRootPath].filter(Boolean),
      ),
    );

    if (ENABLE_HERO_GLB) {
      try {
        const heroLoader = await createGLTFLoader(this.renderer);
        const loadedHero = await loadGLBWithFallbacks(
          heroLoader,
          heroCandidates,
          {
            renderer: this.renderer,
            targetHeight: 1.8,
          },
        );

        if (!loadedHero || !loadedHero.root) {
          throw new Error("No hero GLB candidates reachable");
        }

        const { root, gltf } = loadedHero;

        character.initializeFromGLTF(root, gltf.animations);
        this.player.attachCharacter(character);
      } catch (error) {
        this.attachFallbackAvatar();
      }
    } else {
      this.attachFallbackAvatar();
    }
  }

  attachFallbackAvatar() {
    const fallbackAvatar = this.createFallbackAvatar();
    this.player.object.add(fallbackAvatar);
    fallbackAvatar.position.set(0, 0, 0);
  }

  createFallbackAvatar() {
    const group = new THREE.Group();
    group.name = "FallbackAvatar";

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x4e8ef7,
      metalness: 0.2,
      roughness: 0.6,
      fog: false,
    });

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 1.2, 16),
      bodyMaterial,
    );
    body.castShadow = true;
    body.receiveShadow = true;
    body.position.y = 0.6;
    group.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xf4f7ff, roughness: 0.4, fog: false }),
    );
    head.castShadow = true;
    head.position.y = 1.32;
    group.add(head);

    return group;
  }

  setThirdPersonEnabled(enabled) {
    if (!this.thirdPersonCamera) return;
    this.thirdPersonCamera.setEnabled(enabled);
  }

  setPlayerMovementEnabled(enabled) {
    this.playerMovementEnabled = enabled;
  }
}
