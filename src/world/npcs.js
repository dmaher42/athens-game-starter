import * as THREE from 'three';

function createCitizenModel(primaryColor, secondaryColor) {
  const group = new THREE.Group();
  group.name = 'CitizenNPC';

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: primaryColor,
    roughness: 0.6,
    metalness: 0.1,
  });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 1.1, 8, 16), bodyMaterial);
  body.position.y = 1.1;
  body.castShadow = true;
  body.receiveShadow = true;
  body.userData.noCollision = true;
  group.add(body);

  const headMaterial = new THREE.MeshStandardMaterial({
    color: secondaryColor,
    roughness: 0.4,
  });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), headMaterial);
  head.position.y = 2.0;
  head.castShadow = true;
  head.userData.noCollision = true;
  group.add(head);

  const sash = new THREE.Mesh(
    new THREE.TorusGeometry(0.45, 0.08, 8, 18, Math.PI * 1.25),
    new THREE.MeshStandardMaterial({ color: 0xf5f0e6, roughness: 0.5 })
  );
  sash.rotation.set(Math.PI / 2, Math.PI / 3, 0);
  sash.position.y = 1.3;
  sash.castShadow = true;
  sash.userData.noCollision = true;
  group.add(sash);

  return { group, body };
}

function createCurveLengthLookup(curve) {
  const divisions = 100;
  const lengths = curve.getLengths(divisions);
  const totalLength = lengths[lengths.length - 1];
  return { divisions, lengths, totalLength };
}

export function spawnCitizenCrowd(scene, pathCurve, options = {}) {
  if (!pathCurve) {
    return { citizens: [], updaters: [] };
  }

  const count = options.count ?? 6;
  const minSpeed = options.minSpeed ?? 0.6;
  const maxSpeed = options.maxSpeed ?? 1.2;
  const terrain = options.terrain ?? null;
  const palette = options.palette ?? [
    { primary: 0x4e8ef7, secondary: 0xf5f5f5 },
    { primary: 0xf06292, secondary: 0xffecb3 },
    { primary: 0x81c784, secondary: 0xe8f5e9 },
    { primary: 0xffb74d, secondary: 0xfff3e0 },
    { primary: 0x9575cd, secondary: 0xf3e5f5 },
  ];

  const { totalLength } = createCurveLengthLookup(pathCurve);
  const getHeightAt = terrain?.userData?.getHeightAt?.bind(terrain?.userData);

  const citizens = [];
  const updaters = [];

  for (let i = 0; i < count; i++) {
    const paletteEntry = palette[i % palette.length];
    const { group, body } = createCitizenModel(paletteEntry.primary, paletteEntry.secondary);
    group.userData.noCollision = true;
    scene.add(group);
    citizens.push(group);

    const speed = THREE.MathUtils.lerp(minSpeed, maxSpeed, Math.random());
    let progress = (i / count + Math.random() * 0.1) % 1;
    let stepPhase = Math.random() * Math.PI * 2;

    const update = (dt) => {
      if (!Number.isFinite(dt)) return;
      const distancePerSecond = speed;
      const deltaProgress = (distancePerSecond * dt) / totalLength;
      progress = (progress + deltaProgress) % 1;

      const position = pathCurve.getPointAt(progress);
      const tangent = pathCurve.getTangentAt(progress);

      group.position.copy(position);

      // Snap NPC to terrain height (with safe fallback)
      const sampledY = getHeightAt ? getHeightAt(group.position.x, group.position.z) : position.y;
      group.position.y = Number.isFinite(sampledY) ? sampledY + 0.05 : position.y + 0.05;

      const yaw = Math.atan2(tangent.x, tangent.z);
      group.rotation.set(0, yaw, 0);

      stepPhase += dt * speed * 6;
      body.position.y = 1.1 + Math.sin(stepPhase) * 0.07;
      body.rotation.z = Math.sin(stepPhase) * 0.2;
    };

    updaters.push(update);
  }

  return { citizens, updaters };
}

export default spawnCitizenCrowd;
