import * as THREE from 'three';
import { saveSystem } from '../game/SaveSystem.js';
import { soundManager } from '../audio/SoundManager.js';

export const CAR_SPECS = {
  hatchback: {
    name: "Compact Hatchback",
    price: 0,
    baseSpeed: 75,
    baseAccel: 16,
    baseHandling: 1.0,
    baseBraking: 30,
    baseFuel: 100,
    width: 1.8,
    length: 3.6,
    height: 1.4,
    wheelRadius: 0.32,
    wheelBase: 2.2,
    trackWidth: 1.5,
    bodyColor: "#e63946"
  },
  sedan: {
    name: "Urban Cruiser",
    price: 5000,
    baseSpeed: 95,
    baseAccel: 20,
    baseHandling: 0.95,
    baseBraking: 34,
    baseFuel: 120,
    width: 1.9,
    length: 4.4,
    height: 1.45,
    wheelRadius: 0.35,
    wheelBase: 2.6,
    trackWidth: 1.6,
    bodyColor: "#1d3557"
  },
  suv: {
    name: "Titan SUV",
    price: 12000,
    baseSpeed: 110,
    baseAccel: 18,
    baseHandling: 0.85,
    baseBraking: 38,
    baseFuel: 160,
    width: 2.1,
    length: 4.8,
    height: 1.75,
    wheelRadius: 0.42,
    wheelBase: 2.8,
    trackWidth: 1.8,
    bodyColor: "#2a9d8f"
  },
  coupe: {
    name: "Apex GT Coupe",
    price: 25000,
    baseSpeed: 140,
    baseAccel: 28,
    baseHandling: 1.2,
    baseBraking: 45,
    baseFuel: 110,
    width: 2.0,
    length: 4.5,
    height: 1.3,
    wheelRadius: 0.38,
    wheelBase: 2.7,
    trackWidth: 1.7,
    bodyColor: "#ffb703"
  }
};

export class CarController {
  constructor(scene) {
    this.scene = scene;
    this.carGroup = new THREE.Group();
    this.scene.add(this.carGroup);

    this.carId = "hatchback";
    this.chassisMesh = null;
    this.wheels = []; // [FL, FR, RL, RR]
    this.headlights = [];
    this.taillights = [];
    this.headlightSpotlights = [];

    // Movement Physics State
    this.position = new THREE.Vector3(0, 0, 0);
    this.speed = 0; // m/s
    this.steeringAngle = 0; // actual wheel angle in radians
    this.targetSteerInput = 0; // input (-1 to 1)
    this.yawAngle = 0; // vehicle heading direction

    // Chassis Animation State (Pitch & Roll Suspension)
    this.pitchAngle = 0; // nose up/down on accel/brake
    this.rollAngle = 0;  // lean left/right on turning
    this.suspensionOffsetY = 0;

    // Driver inputs
    this.throttle = 0;
    this.brake = 0;
    this.handbrake = false;
    this.gear = "D"; // 'D', 'R', 'P', 'N'

    // Vehicle Stats
    this.maxSpeed = 80;
    this.acceleration = 16;
    this.handling = 1.0;
    this.brakingForce = 35;
    this.maxFuel = 100;
    this.fuel = 100;
    this.health = 100;

    this.isHeadlightsOn = false;
    this.box = new THREE.Box3();
  }

  loadCar(carId) {
    this.carId = carId;
    const spec = CAR_SPECS[carId] || CAR_SPECS.hatchback;

    // Apply Save Upgrade Bonuses
    const up = saveSystem.data.upgrades[carId] || { engine: 1, brakes: 1, steering: 1, tires: 1, fuel: 1 };
    this.maxSpeed = spec.baseSpeed * (1 + (up.engine - 1) * 0.12);
    this.acceleration = spec.baseAccel * (1 + (up.engine - 1) * 0.14);
    this.handling = spec.baseHandling * (1 + (up.steering - 1) * 0.12);
    this.brakingForce = spec.baseBraking * (1 + (up.brakes - 1) * 0.15);
    this.maxFuel = spec.baseFuel * (1 + (up.fuel - 1) * 0.2);
    this.fuel = this.maxFuel;
    this.health = 100;

    this.buildCarMesh(spec);
  }

  buildCarMesh(spec) {
    while (this.carGroup.children.length > 0) {
      this.carGroup.remove(this.carGroup.children[0]);
    }
    this.wheels = [];
    this.headlights = [];
    this.taillights = [];
    this.headlightSpotlights = [];

    const carColorHex = saveSystem.data.carColors[this.carId] || spec.bodyColor;
    
    // Materials
    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(carColorHex),
      metalness: 0.65,
      roughness: 0.25
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x111827,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.75,
      transparent: true,
      opacity: 0.85
    });

    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, metalness: 0.85, roughness: 0.15 });

    // Main Chassis Group (Tiltable for suspension roll & pitch animations)
    this.chassisMesh = new THREE.Group();

    // 1. Lower Body Box
    const bodyGeo = new THREE.BoxGeometry(spec.width, spec.height * 0.5, spec.length);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = spec.height * 0.45;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    this.chassisMesh.add(bodyMesh);

    // 2. Cabin Roof Top
    const cabinLen = spec.length * 0.52;
    const cabinGeo = new THREE.BoxGeometry(spec.width * 0.88, spec.height * 0.48, cabinLen);
    const cabinMesh = new THREE.Mesh(cabinGeo, bodyMat);
    cabinMesh.position.set(0, spec.height * 0.86, -spec.length * 0.04);
    cabinMesh.castShadow = true;
    this.chassisMesh.add(cabinMesh);

    // 3. Windshield & Rear Windows
    const windshieldGeo = new THREE.PlaneGeometry(spec.width * 0.82, spec.height * 0.42);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(0, spec.height * 0.86, cabinLen * 0.5 - spec.length * 0.04 + 0.01);
    windshield.rotation.x = -Math.PI * 0.16;
    this.chassisMesh.add(windshield);

    const rearGlass = new THREE.Mesh(windshieldGeo, glassMat);
    rearGlass.position.set(0, spec.height * 0.86, -cabinLen * 0.5 - spec.length * 0.04 - 0.01);
    rearGlass.rotation.x = Math.PI * 0.16;
    rearGlass.rotation.y = Math.PI;
    this.chassisMesh.add(rearGlass);

    // 4. Headlights (Bright LED Glow)
    const lightGeo = new THREE.BoxGeometry(spec.width * 0.22, 0.14, 0.08);
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    [-spec.width * 0.35, spec.width * 0.35].forEach((xPos) => {
      const hl = new THREE.Mesh(lightGeo, headlightMat);
      hl.position.set(xPos, spec.height * 0.45, spec.length * 0.5 + 0.01);
      this.chassisMesh.add(hl);
      this.headlights.push(hl);

      const spot = new THREE.SpotLight(0xfffaed, 0, 50, Math.PI / 6, 0.4, 1);
      spot.position.set(xPos, spec.height * 0.45, spec.length * 0.5 + 0.1);
      spot.target.position.set(xPos, 0, spec.length * 0.5 + 25);
      this.chassisMesh.add(spot);
      this.chassisMesh.add(spot.target);
      this.headlightSpotlights.push(spot);
    });

    // 5. Taillights (Red)
    const tailMat = new THREE.MeshStandardMaterial({ color: 0xd90429, emissive: 0x500000 });
    [-spec.width * 0.35, spec.width * 0.35].forEach((xPos) => {
      const tl = new THREE.Mesh(lightGeo, tailMat);
      tl.position.set(xPos, spec.height * 0.45, -spec.length * 0.5 - 0.01);
      this.chassisMesh.add(tl);
      this.taillights.push(tl);
    });

    // 6. Front & Rear Bumpers
    const bumperGeo = new THREE.BoxGeometry(spec.width * 0.96, 0.22, 0.14);
    const frontBumper = new THREE.Mesh(bumperGeo, darkMat);
    frontBumper.position.set(0, spec.height * 0.25, spec.length * 0.5 + 0.02);
    this.chassisMesh.add(frontBumper);

    const rearBumper = new THREE.Mesh(bumperGeo, darkMat);
    rearBumper.position.set(0, spec.height * 0.25, -spec.length * 0.5 - 0.02);
    this.chassisMesh.add(rearBumper);

    this.carGroup.add(this.chassisMesh);

    // 7. 4 Wheels Creation
    const wRadius = spec.wheelRadius;
    const wThick = 0.24;
    const wheelGeo = new THREE.CylinderGeometry(wRadius, wRadius, wThick, 24);
    wheelGeo.rotateZ(Math.PI / 2);

    const rimGeo = new THREE.CylinderGeometry(wRadius * 0.62, wRadius * 0.62, wThick + 0.02, 12);
    rimGeo.rotateZ(Math.PI / 2);

    const wheelPositions = [
      { x: spec.trackWidth * 0.5, z: spec.wheelBase * 0.5, isFront: true },  // FL
      { x: -spec.trackWidth * 0.5, z: spec.wheelBase * 0.5, isFront: true }, // FR
      { x: spec.trackWidth * 0.5, z: -spec.wheelBase * 0.5, isFront: false },// RL
      { x: -spec.trackWidth * 0.5, z: -spec.wheelBase * 0.5, isFront: false }// RR
    ];

    wheelPositions.forEach((pos) => {
      const wheelHolder = new THREE.Group();
      wheelHolder.position.set(pos.x, wRadius, pos.z);

      const tireMesh = new THREE.Mesh(wheelGeo, tireMat);
      tireMesh.castShadow = true;
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);

      wheelHolder.add(tireMesh);
      wheelHolder.add(rimMesh);

      this.carGroup.add(wheelHolder);
      this.wheels.push({ group: wheelHolder, tire: tireMesh, isFront: pos.isFront });
    });
  }

  setInputs({ throttle, brake, steering, handbrake, gear }) {
    if (throttle !== undefined) this.throttle = Math.max(0, Math.min(1, throttle));
    if (brake !== undefined) this.brake = Math.max(0, Math.min(1, brake));
    if (steering !== undefined) this.targetSteerInput = Math.max(-1, Math.min(1, steering));
    if (handbrake !== undefined) this.handbrake = handbrake;
    if (gear) this.gear = gear;
  }

  toggleHeadlights() {
    this.isHeadlightsOn = !this.isHeadlightsOn;
    this.headlightSpotlights.forEach(spot => {
      spot.intensity = this.isHeadlightsOn ? 14.0 : 0;
    });
    this.headlights.forEach(hl => {
      hl.material.color.setHex(this.isHeadlightsOn ? 0xffffff : 0x777777);
    });
  }

  update(delta) {
    if (delta > 0.08) delta = 0.08; // Clamp large delta step

    const spec = CAR_SPECS[this.carId] || CAR_SPECS.hatchback;
    const speedKmh = Math.abs(this.speed * 3.6);

    // 1. SPEED-SENSITIVE STEERING ANGLE
    // At low speed (0-20km/h), max turn angle is ~34 deg. At high speed (100km/h), max turn angle drops to ~12 deg to prevent wild spins!
    const speedSteerFactor = Math.max(0.35, 1.0 - (speedKmh / 140));
    const maxTurnAngle = (Math.PI / 5.2) * this.handling * speedSteerFactor;
    const targetAngle = this.targetSteerInput * maxTurnAngle;

    // Smooth Steering Centering
    this.steeringAngle += (targetAngle - this.steeringAngle) * Math.min(1.0, delta * 10.0);

    // Front wheels rotation angle
    this.wheels.forEach(w => {
      if (w.isFront) {
        w.group.rotation.y = this.steeringAngle;
      }
    });

    // 2. ACCELERATION & BRAKING PHYSICS
    const maxSpeedMs = (this.maxSpeed * 1000) / 3600;
    let driveForce = 0;

    if (this.fuel > 0 && this.health > 0) {
      if (this.gear === "D") {
        driveForce = this.throttle * this.acceleration;
      } else if (this.gear === "R") {
        driveForce = -this.throttle * (this.acceleration * 0.65);
      }
    }

    // Natural Drag & Friction
    const rollingResistance = 1.2;
    const airDrag = 0.02 * this.speed * Math.abs(this.speed);
    const brakingPower = (this.brake * this.brakingForce) + (this.handbrake ? 55 : 0);

    let netAccel = driveForce - (rollingResistance * Math.sign(this.speed) + airDrag + brakingPower * Math.sign(this.speed));

    if (this.gear === "P" || this.gear === "N") {
      netAccel = -Math.sign(this.speed) * Math.min(Math.abs(this.speed), (rollingResistance + brakingPower + 25) * delta);
    }

    this.speed += netAccel * delta;

    // Cap Speed Limits
    if (this.gear === "D") {
      this.speed = Math.max(-4, Math.min(maxSpeedMs, this.speed));
    } else if (this.gear === "R") {
      this.speed = Math.max(-maxSpeedMs * 0.35, Math.min(4, this.speed));
    }

    // Full stop threshold
    if (Math.abs(this.speed) < 0.04 && this.throttle === 0) {
      this.speed = 0;
    }

    // 3. VEHICLE HEADING & KINEMATIC ROTATION
    if (Math.abs(this.speed) > 0.01) {
      const angularVelocity = (this.speed / spec.wheelBase) * Math.sin(this.steeringAngle);
      this.yawAngle += angularVelocity * delta;
    }

    // Displacement Updates
    this.position.x += Math.sin(this.yawAngle) * this.speed * delta;
    this.position.z += Math.cos(this.yawAngle) * this.speed * delta;

    this.carGroup.position.copy(this.position);
    this.carGroup.rotation.y = this.yawAngle;

    // 4. SUSPENSION ANIMATIONS (Pitch & Roll Body Dynamic Lean)
    // Pitch (Acceleration / Nose Dive on Brake)
    const targetPitch = (netAccel / 40) * 0.06;
    this.pitchAngle += (targetPitch - this.pitchAngle) * Math.min(1.0, delta * 8.0);

    // Roll (Centrifugal Lean on Turns)
    const centripetalForce = (this.speed * Math.sin(this.steeringAngle)) / spec.wheelBase;
    const targetRoll = -centripetalForce * 0.18;
    this.rollAngle += (targetRoll - this.rollAngle) * Math.min(1.0, delta * 8.0);

    if (this.chassisMesh) {
      this.chassisMesh.rotation.x = this.pitchAngle;
      this.chassisMesh.rotation.z = this.rollAngle;
    }

    // 5. WHEEL SPIN ANIMATION
    const wheelRotationStep = (this.speed / spec.wheelRadius) * delta;
    this.wheels.forEach(w => {
      w.tire.rotation.x += wheelRotationStep;
    });

    // 6. FUEL CONSUMPTION & AUDIO UPDATE
    if (this.throttle > 0 && Math.abs(this.speed) > 0.4) {
      this.fuel = Math.max(0, this.fuel - delta * 0.22);
    }

    const rpmRatio = Math.min(1.0, (speedKmh % 30) / 30 + (this.throttle * 0.45));
    soundManager.updateEngine(rpmRatio, speedKmh, this.throttle > 0);

    // Taillights brake glow
    const isBraking = this.brake > 0.05 || this.handbrake;
    this.taillights.forEach(tl => {
      tl.material.emissive.setHex(isBraking ? 0xff0000 : 0x500000);
    });

    this.box.setFromObject(this.carGroup);
  }

  getSpeedKmh() {
    return Math.round(Math.abs(this.speed * 3.6));
  }

  resetPosition(x = 0, y = 0, z = 0, angle = 0) {
    this.position.set(x, y, z);
    this.yawAngle = angle;
    this.speed = 0;
    this.steeringAngle = 0;
    this.targetSteerInput = 0;
    this.pitchAngle = 0;
    this.rollAngle = 0;
    this.carGroup.position.copy(this.position);
    this.carGroup.rotation.y = this.yawAngle;
    if (this.chassisMesh) {
      this.chassisMesh.rotation.set(0, 0, 0);
    }
    this.fuel = this.maxFuel;
    this.health = 100;
  }
}
