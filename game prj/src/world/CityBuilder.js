import * as THREE from 'three';

export class CityBuilder {
  constructor(scene) {
    this.scene = scene;
    this.colliders = []; // Bounding boxes of buildings & poles
    this.trafficLights = []; // Interactive traffic lights
    this.parkingSpots = []; // Target parking locations for missions
    this.pickupZones = [];  // Passenger pick-up / drop zones
    this.roadGrid = [];     // Waypoints for AI traffic
    this.fuelPumps = [];    // Fuel station zones
  }

  buildCity() {
    // 1. Ground Plane (Grass/Terrain base)
    const groundGeo = new THREE.PlaneGeometry(1000, 1000);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x3a5a40, // Lush green landscape
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 2. Road Network Layout
    // Grid system: 5x5 blocks. Block size = 60m, Road width = 14m
    const blockSize = 60;
    const roadWidth = 14;
    const gridCount = 5;
    const halfGrid = Math.floor(gridCount / 2);

    // Create Roads, Crosswalks, and Sidewalks
    for (let r = -halfGrid; r <= halfGrid; r++) {
      for (let c = -halfGrid; c <= halfGrid; c++) {
        const x = c * (blockSize + roadWidth);
        const z = r * (blockSize + roadWidth);

        // Building Block Island
        this.createBuildingBlock(x, z, blockSize);

        // Roads in horizontal and vertical directions
        this.createRoadSegment(x + (blockSize + roadWidth) / 2, z, roadWidth, blockSize + roadWidth, false);
        this.createRoadSegment(x, z + (blockSize + roadWidth) / 2, blockSize + roadWidth, roadWidth, true);

        // Intersections & Traffic Signals
        if (r < halfGrid && c < halfGrid) {
          const interX = x + blockSize / 2 + roadWidth / 2;
          const interZ = z + blockSize / 2 + roadWidth / 2;
          this.createIntersection(interX, interZ, roadWidth);
        }
      }
    }

    // 3. Special Locations: Gas Station, Parallel Parking Alleys, Taxi Stand
    this.buildGasStation(40, 40);
    this.buildParkingZone(-40, -40, "parallel_1");
    this.buildParkingZone(110, -40, "parallel_2");
    this.buildTaxiPickupZone(40, -110, "taxi_pickup");
    this.buildTaxiPickupZone(-110, 40, "taxi_dropoff");
  }

  createRoadSegment(x, z, width, length, isHorizontal) {
    const roadGroup = new THREE.Group();
    roadGroup.position.set(x, 0, z);

    // Road Surface (Dark Asphalt)
    const roadGeo = new THREE.PlaneGeometry(width, length);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x2b2d42, roughness: 0.8 });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.receiveShadow = true;
    roadGroup.add(roadMesh);

    // Sidewalks on left & right
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x8d99ae, roughness: 0.7 });
    const sidewalkThickness = 2.0;
    const sidewalkHeight = 0.2;

    if (isHorizontal) {
      // Horizontal Road: Sidewalks on north/south edges
      [-width / 2 - sidewalkThickness / 2, width / 2 + sidewalkThickness / 2].forEach(offsetZ => {
        const swGeo = new THREE.BoxGeometry(length, sidewalkHeight, sidewalkThickness);
        const swMesh = new THREE.Mesh(swGeo, sidewalkMat);
        swMesh.position.set(0, sidewalkHeight / 2, offsetZ);
        swMesh.receiveShadow = true;
        roadGroup.add(swMesh);
      });

      // Yellow Center Line
      const lineGeo = new THREE.PlaneGeometry(length, 0.3);
      const yellowMat = new THREE.MeshBasicMaterial({ color: 0xffb703 });
      const line = new THREE.Mesh(lineGeo, yellowMat);
      line.rotation.x = -Math.PI / 2;
      line.position.y = 0.01;
      roadGroup.add(line);
    } else {
      // Vertical Road: Sidewalks on east/west edges
      [-width / 2 - sidewalkThickness / 2, width / 2 + sidewalkThickness / 2].forEach(offsetX => {
        const swGeo = new THREE.BoxGeometry(sidewalkThickness, sidewalkHeight, length);
        const swMesh = new THREE.Mesh(swGeo, sidewalkMat);
        swMesh.position.set(offsetX, sidewalkHeight / 2, 0);
        swMesh.receiveShadow = true;
        roadGroup.add(swMesh);
      });

      // Yellow Center Line
      const lineGeo = new THREE.PlaneGeometry(0.3, length);
      const yellowMat = new THREE.MeshBasicMaterial({ color: 0xffb703 });
      const line = new THREE.Mesh(lineGeo, yellowMat);
      line.rotation.x = -Math.PI / 2;
      line.position.y = 0.01;
      roadGroup.add(line);
    }

    this.scene.add(roadGroup);
  }

  createIntersection(x, z, roadWidth) {
    // Crosswalks & Traffic Light Post
    const interGeo = new THREE.PlaneGeometry(roadWidth, roadWidth);
    const interMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
    const interMesh = new THREE.Mesh(interGeo, interMat);
    interMesh.rotation.x = -Math.PI / 2;
    interMesh.position.set(x, 0.005, z);
    interMesh.receiveShadow = true;
    this.scene.add(interMesh);

    // Create 4 Traffic Light Poles
    const positions = [
      { x: x - roadWidth / 2 - 1, z: z - roadWidth / 2 - 1, rotY: 0 },
      { x: x + roadWidth / 2 + 1, z: z + roadWidth / 2 + 1, rotY: Math.PI }
    ];

    positions.forEach(p => {
      this.createTrafficLightPole(p.x, p.z, p.rotY);
    });
  }

  createTrafficLightPole(x, z, rotY) {
    const poleGroup = new THREE.Group();
    poleGroup.position.set(x, 0, z);
    poleGroup.rotation.y = rotY;

    // Pole stem
    const poleGeo = new THREE.CylinderGeometry(0.12, 0.15, 5, 12);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 2.5;
    poleGroup.add(pole);

    // Box header
    const boxGeo = new THREE.BoxGeometry(0.4, 1.2, 0.4);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(0, 4.2, 0);
    poleGroup.add(box);

    // Lights (Red, Yellow, Green)
    const lightGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const redMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const yellowMat = new THREE.MeshBasicMaterial({ color: 0x333300 });
    const greenMat = new THREE.MeshBasicMaterial({ color: 0x003300 });

    const redMesh = new THREE.Mesh(lightGeo, redMat);
    redMesh.position.set(0, 4.5, 0.2);
    const yellowMesh = new THREE.Mesh(lightGeo, yellowMat);
    yellowMesh.position.set(0, 4.2, 0.2);
    const greenMesh = new THREE.Mesh(lightGeo, greenMat);
    greenMesh.position.set(0, 3.9, 0.2);

    poleGroup.add(redMesh);
    poleGroup.add(yellowMesh);
    poleGroup.add(greenMesh);

    this.scene.add(poleGroup);

    const trafficObj = {
      state: "RED", // RED, GREEN, YELLOW
      timer: 0,
      redMesh, yellowMesh, greenMesh,
      position: new THREE.Vector3(x, 0, z)
    };
    this.trafficLights.push(trafficObj);

    // Pole collider
    const colliderBox = new THREE.Box3().setFromObject(poleGroup);
    this.colliders.push(colliderBox);
  }

  createBuildingBlock(centerX, centerZ, size) {
    // Fill block island with multiple buildings & trees
    const numBuildings = 4;
    const subSize = size / 2;

    const colors = [
      0x457b9d, 0x1d3557, 0xa8dadc, 0xf4a261, 0xe76f51,
      0x2a9d8f, 0x3d5a80, 0x98c1d9, 0xee6c4d, 0x293241
    ];

    const offsets = [
      { x: -subSize / 2, z: -subSize / 2 },
      { x: subSize / 2, z: -subSize / 2 },
      { x: -subSize / 2, z: subSize / 2 },
      { x: subSize / 2, z: subSize / 2 }
    ];

    offsets.forEach(off => {
      const bx = centerX + off.x;
      const bz = centerZ + off.z;
      const height = 15 + Math.random() * 35;
      const width = subSize * 0.85;
      const depth = subSize * 0.85;
      const color = colors[Math.floor(Math.random() * colors.length)];

      const bGeo = new THREE.BoxGeometry(width, height, depth);
      const bMat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.4,
        metalness: 0.2
      });

      const buildingMesh = new THREE.Mesh(bGeo, bMat);
      buildingMesh.position.set(bx, height / 2 + 0.1, bz);
      buildingMesh.castShadow = true;
      buildingMesh.receiveShadow = true;

      // Add window grid lines
      const windowMat = new THREE.MeshBasicMaterial({ color: 0xffffaa, opacity: 0.8 });
      const winCount = Math.floor(height / 3);
      for (let i = 1; i < winCount; i++) {
        const winGeo = new THREE.BoxGeometry(width * 0.8, 0.8, depth + 0.05);
        const winMesh = new THREE.Mesh(winGeo, windowMat);
        winMesh.position.set(bx, i * 3.2, bz);
        this.scene.add(winMesh);
      }

      this.scene.add(buildingMesh);

      // Add to collision list
      const box = new THREE.Box3().setFromObject(buildingMesh);
      this.colliders.push(box);

      // Add tree on sidewalk corner
      this.createTree(bx + width / 2 + 1.5, bz + depth / 2 + 1.5);
    });
  }

  createTree(x, z) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0, z);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 2.5, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.25;
    treeGroup.add(trunk);

    // Foliage (Cone)
    const foliageGeo = new THREE.ConeGeometry(1.5, 3.5, 8);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.6 });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.y = 3.5;
    foliage.castShadow = true;
    treeGroup.add(foliage);

    this.scene.add(treeGroup);
  }

  buildGasStation(x, z) {
    const stationGroup = new THREE.Group();
    stationGroup.position.set(x, 0, z);

    // Canopy Roof
    const roofGeo = new THREE.BoxGeometry(16, 0.8, 12);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xe63946 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 4.5;
    stationGroup.add(roof);

    // Pillars
    const pillarGeo = new THREE.CylinderGeometry(0.3, 0.3, 4.5, 12);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    [-6, 6].forEach(px => {
      const p = new THREE.Mesh(pillarGeo, pillarMat);
      p.position.set(px, 2.25, 0);
      stationGroup.add(p);
    });

    // Fuel Pumps
    const pumpGeo = new THREE.BoxGeometry(1.2, 2.0, 0.8);
    const pumpMat = new THREE.MeshStandardMaterial({ color: 0xf4a261 });
    const pump = new THREE.Mesh(pumpGeo, pumpMat);
    pump.position.set(0, 1.0, 0);
    stationGroup.add(pump);

    this.scene.add(stationGroup);

    this.fuelPumps.push({
      position: new THREE.Vector3(x, 0, z),
      radius: 6.0
    });

    const box = new THREE.Box3().setFromObject(stationGroup);
    this.colliders.push(box);
  }

  buildParkingZone(x, z, name) {
    // Dashed yellow box on road asphalt
    const group = new THREE.Group();
    group.position.set(x, 0.02, z);

    const boxGeo = new THREE.PlaneGeometry(2.5, 5.0);
    const boxMat = new THREE.MeshBasicMaterial({
      color: 0xffb703,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });

    const zoneMesh = new THREE.Mesh(boxGeo, boxMat);
    zoneMesh.rotation.x = -Math.PI / 2;
    group.add(zoneMesh);

    // Pulsing Light Marker
    const markerGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.2, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.5 });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.y = 0.1;
    group.add(marker);

    this.scene.add(group);

    this.parkingSpots.push({
      name,
      position: new THREE.Vector3(x, 0, z),
      mesh: group,
      radius: 2.5
    });
  }

  buildTaxiPickupZone(x, z, name) {
    const group = new THREE.Group();
    group.position.set(x, 0.02, z);

    const circleGeo = new THREE.RingGeometry(1.5, 2.2, 24);
    const circleMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(circleGeo, circleMat);
    ring.rotation.x = -Math.PI / 2;
    group.add(ring);

    // 3D Passenger Silhouette
    const pGroup = new THREE.Group();
    pGroup.position.set(0, 0, 0);

    const headGeo = new THREE.SphereGeometry(0.3, 12, 12);
    const bodyGeo = new THREE.CylinderGeometry(0.2, 0.4, 1.2, 12);
    const pMat = new THREE.MeshStandardMaterial({ color: 0xff0055 });

    const head = new THREE.Mesh(headGeo, pMat);
    head.position.y = 1.6;
    const body = new THREE.Mesh(bodyGeo, pMat);
    body.position.y = 0.8;

    pGroup.add(head);
    pGroup.add(body);
    group.add(pGroup);

    this.scene.add(group);

    this.pickupZones.push({
      name,
      position: new THREE.Vector3(x, 0, z),
      passengerMesh: pGroup,
      radius: 3.5
    });
  }

  updateTrafficLights(delta) {
    // Cycle Traffic Lights: GREEN (10s) -> YELLOW (2.5s) -> RED (10s)
    this.trafficLights.forEach(tl => {
      tl.timer += delta;
      if (tl.state === "GREEN" && tl.timer > 10.0) {
        tl.state = "YELLOW";
        tl.timer = 0;
        tl.greenMesh.material.color.setHex(0x003300);
        tl.yellowMesh.material.color.setHex(0xffff00);
      } else if (tl.state === "YELLOW" && tl.timer > 2.5) {
        tl.state = "RED";
        tl.timer = 0;
        tl.yellowMesh.material.color.setHex(0x333300);
        tl.redMesh.material.color.setHex(0xff0000);
      } else if (tl.state === "RED" && tl.timer > 10.0) {
        tl.state = "GREEN";
        tl.timer = 0;
        tl.redMesh.material.color.setHex(0x330000);
        tl.greenMesh.material.color.setHex(0x00ff00);
      }
    });
  }
}
