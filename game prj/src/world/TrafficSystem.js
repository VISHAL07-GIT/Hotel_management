import * as THREE from 'three';

export class TrafficSystem {
  constructor(scene, cityBuilder) {
    this.scene = scene;
    this.cityBuilder = cityBuilder;
    this.aiVehicles = [];
    this.colliders = [];
  }

  initTraffic(numCars = 16) {
    // Clear old AI vehicles
    this.aiVehicles.forEach(v => this.scene.remove(v.mesh));
    this.aiVehicles = [];
    this.colliders = [];

    const carColors = [0xef476f, 0x06d6a0, 0x118ab2, 0xffd166, 0x8338ec, 0x3a86ff, 0xff5400];

    // Spawn AI cars along city road lanes
    const gridPositions = [];
    const blockSize = 60;
    const roadWidth = 14;
    const halfGrid = 2;

    for (let r = -halfGrid; r <= halfGrid; r++) {
      for (let c = -halfGrid; c <= halfGrid; c++) {
        const x = c * (blockSize + roadWidth);
        const z = r * (blockSize + roadWidth);

        // Lane offsets: Right side of road (offset 3.5m)
        gridPositions.push({ x: x + 3.5, z: z, dirX: 0, dirZ: 1 }); // Moving North
        gridPositions.push({ x: x - 3.5, z: z, dirX: 0, dirZ: -1 }); // Moving South
        gridPositions.push({ x: x, z: z + 3.5, dirX: 1, dirZ: 0 }); // Moving East
        gridPositions.push({ x: x, z: z - 3.5, dirX: -1, dirZ: 0 }); // Moving West
      }
    }

    // Pick random initial positions
    for (let i = 0; i < Math.min(numCars, gridPositions.length); i++) {
      const p = gridPositions[i];
      const color = carColors[i % carColors.length];
      this.createAIVehicle(p.x, p.z, p.dirX, p.dirZ, color);
    }
  }

  createAIVehicle(x, z, dirX, dirZ, colorHex) {
    const aiGroup = new THREE.Group();
    aiGroup.position.set(x, 0, z);

    // AI Car Body
    const width = 1.8;
    const length = 4.0;
    const height = 1.4;

    const bodyGeo = new THREE.BoxGeometry(width, height * 0.5, length);
    const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.5 });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = height * 0.45;
    bodyMesh.castShadow = true;
    aiGroup.add(bodyMesh);

    // Roof
    const roofGeo = new THREE.BoxGeometry(width * 0.85, height * 0.45, length * 0.5);
    const roofMesh = new THREE.Mesh(roofGeo, bodyMat);
    roofMesh.position.set(0, height * 0.85, 0);
    aiGroup.add(roofMesh);

    // Windows
    const winGeo = new THREE.BoxGeometry(width * 0.86, height * 0.35, length * 0.48);
    const winMat = new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.1 });
    const winMesh = new THREE.Mesh(winGeo, winMat);
    winMesh.position.set(0, height * 0.85, 0);
    aiGroup.add(winMesh);

    // Wheels
    const tireGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.2, 16);
    tireGeo.rotateZ(Math.PI / 2);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x222222 });

    [
      { x: 0.9, z: 1.2 }, { x: -0.9, z: 1.2 },
      { x: 0.9, z: -1.2 }, { x: -0.9, z: -1.2 }
    ].forEach(w => {
      const wheel = new THREE.Mesh(tireGeo, tireMat);
      wheel.position.set(w.x, 0.32, w.z);
      aiGroup.add(wheel);
    });

    // Rotation heading
    const angle = Math.atan2(dirX, dirZ);
    aiGroup.rotation.y = angle;

    this.scene.add(aiGroup);

    const vehicleObj = {
      mesh: aiGroup,
      position: new THREE.Vector3(x, 0, z),
      dir: new THREE.Vector3(dirX, 0, dirZ).normalize(),
      speed: 10 + Math.random() * 5, // m/s (~36-50 km/h)
      maxSpeed: 12,
      box: new THREE.Box3(),
      stopping: false
    };

    vehicleObj.box.setFromObject(aiGroup);
    this.aiVehicles.push(vehicleObj);
  }

  update(delta, playerCar) {
    this.aiVehicles.forEach(ai => {
      // 1. Front Light / Traffic Check
      let mustStop = false;

      // Check nearest Traffic Light Signal
      this.cityBuilder.trafficLights.forEach(tl => {
        const dist = ai.position.distanceTo(tl.position);
        if (dist < 12.0 && tl.state === "RED") {
          // Check if moving towards traffic signal
          const toSignal = new THREE.Vector3().subVectors(tl.position, ai.position).normalize();
          if (ai.dir.dot(toSignal) > 0.7) {
            mustStop = true;
          }
        }
      });

      // Check Distance to Player Car (Avoid bumping player)
      if (playerCar) {
        const distToPlayer = ai.position.distanceTo(playerCar.position);
        if (distToPlayer < 8.0) {
          const toPlayer = new THREE.Vector3().subVectors(playerCar.position, ai.position).normalize();
          if (ai.dir.dot(toPlayer) > 0.6) {
            mustStop = true;
          }
        }
      }

      // Check Distance to Front AI Cars
      this.aiVehicles.forEach(other => {
        if (other !== ai) {
          const distToOther = ai.position.distanceTo(other.position);
          if (distToOther < 7.0) {
            const toOther = new THREE.Vector3().subVectors(other.position, ai.position).normalize();
            if (ai.dir.dot(toOther) > 0.7) {
              mustStop = true;
            }
          }
        }
      });

      // Acceleration / Braking
      if (mustStop) {
        ai.speed = Math.max(0, ai.speed - delta * 20);
      } else {
        ai.speed = Math.min(ai.maxSpeed, ai.speed + delta * 8);
      }

      // Move Forward
      ai.position.x += ai.dir.x * ai.speed * delta;
      ai.position.z += ai.dir.z * ai.speed * delta;

      // Wrap around boundary bounds (Keep traffic flowing indefinitely)
      const maxBound = 160;
      if (ai.position.x > maxBound) ai.position.x = -maxBound;
      if (ai.position.x < -maxBound) ai.position.x = maxBound;
      if (ai.position.z > maxBound) ai.position.z = -maxBound;
      if (ai.position.z < -maxBound) ai.position.z = maxBound;

      ai.mesh.position.copy(ai.position);
      ai.box.setFromObject(ai.mesh);
    });
  }
}
