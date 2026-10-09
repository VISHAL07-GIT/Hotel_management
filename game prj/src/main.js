import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { CarController } from './physics/CarController.js';
import { CityBuilder } from './world/CityBuilder.js';
import { TrafficSystem } from './world/TrafficSystem.js';
import { EnvironmentManager } from './world/EnvironmentManager.js';
import { MissionManager } from './game/MissionManager.js';
import { GarageSystem } from './game/GarageSystem.js';
import { saveSystem } from './game/SaveSystem.js';
import { soundManager } from './audio/SoundManager.js';
import { UIManager } from './ui/UIManager.js';

class GameEngine {
  constructor() {
    this.container = document.getElementById('game-container');
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // Game Systems
    this.carController = null;
    this.cityBuilder = null;
    this.trafficSystem = null;
    this.environmentManager = null;
    this.missionManager = null;
    this.garageSystem = null;
    this.uiManager = null;

    // State
    this.gameState = "MENU";
    this.cameraMode = 0; // 0: 3rd person chase, 1: hood view, 2: close follow
    this.keyboardState = {};

    // Particle FX
    this.exhaustParticles = [];

    this.init();
  }

  init() {
    // 1. Scene & Camera
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 10, 20);

    // 2. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 3. Subsystems Init
    this.environmentManager = new EnvironmentManager(this.scene);
    this.environmentManager.initEnvironment();

    this.cityBuilder = new CityBuilder(this.scene);
    this.cityBuilder.buildCity();

    this.carController = new CarController(this.scene);
    this.carController.loadCar(saveSystem.data.selectedCarId || "hatchback");

    this.trafficSystem = new TrafficSystem(this.scene, this.cityBuilder);
    this.trafficSystem.initTraffic(14);

    this.missionManager = new MissionManager();
    this.garageSystem = new GarageSystem(this.scene, this.carController);
    this.garageSystem.setupShowroom();

    this.uiManager = new UIManager(this);

    // 4. Input & Resize
    this.setupInputs();
    window.addEventListener('resize', () => this.onWindowResize());

    // 5. Start Animation Loop
    this.animate();
  }

  setupInputs() {
    window.addEventListener('keydown', (e) => {
      this.keyboardState[e.code] = true;
      soundManager.resume();

      if (e.code === 'KeyC') {
        this.cameraMode = (this.cameraMode + 1) % 3;
      }
      if (e.code === 'KeyH') {
        soundManager.playHorn();
      }
      if (e.code === 'KeyL') {
        this.carController.toggleHeadlights();
      }
      if (e.code === 'KeyP') {
        if (this.gameState === "PLAYING") this.pauseGame();
        else if (this.gameState === "PAUSED") this.resumeGame();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keyboardState[e.code] = false;
    });

    document.getElementById('btn-toggle-sound')?.addEventListener('click', () => {
      soundManager.toggleMute();
    });

    document.getElementById('select-timeofday')?.addEventListener('change', (e) => {
      this.environmentManager.setTimeOfDay(e.target.value);
    });

    document.getElementById('btn-toggle-rain')?.addEventListener('click', () => {
      this.environmentManager.toggleRain();
    });
  }

  updateKeyboardInputs() {
    if (this.gameState !== "PLAYING") return;

    let throttle = 0;
    let brake = 0;
    let steering = 0;
    let handbrake = false;

    if (this.keyboardState['KeyW'] || this.keyboardState['ArrowUp']) throttle = 1;
    if (this.keyboardState['KeyS'] || this.keyboardState['ArrowDown']) brake = 1;

    if (this.keyboardState['KeyA'] || this.keyboardState['ArrowLeft']) steering = 1;
    if (this.keyboardState['KeyD'] || this.keyboardState['ArrowRight']) steering = -1;

    if (this.keyboardState['Space']) handbrake = true;

    this.carController.setInputs({ throttle, brake, steering, handbrake });
  }

  startMission(missionId) {
    this.gameState = "PLAYING";
    this.garageSystem.closeGarage();
    this.missionManager.startMission(missionId, this.carController);
    soundManager.startEngine();
  }

  restartCurrentMission() {
    if (this.missionManager.currentMission) {
      this.startMission(this.missionManager.currentMission.id);
    }
  }

  openGarageMode() {
    this.gameState = "GARAGE";
    this.garageSystem.openGarage();
    soundManager.stopEngine();
  }

  closeGarageMode() {
    this.garageSystem.closeGarage();
    this.carController.loadCar(saveSystem.data.selectedCarId || "hatchback");
    this.gameState = "MENU";
  }

  pauseGame() {
    if (this.gameState === "PLAYING") {
      this.gameState = "PAUSED";
      soundManager.stopEngine();
    }
  }

  resumeGame() {
    if (this.gameState === "PAUSED") {
      this.gameState = "PLAYING";
      soundManager.startEngine();
    }
  }

  exitToMainMenu() {
    this.gameState = "MENU";
    this.garageSystem.closeGarage();
    soundManager.stopEngine();
    this.carController.resetPosition(0, 0, 0, 0);
  }

  checkCollisions() {
    if (this.gameState !== "PLAYING") return;

    const pBox = this.carController.box;

    // Building Collisions
    this.cityBuilder.colliders.forEach(bBox => {
      if (pBox.intersectsBox(bBox)) {
        this.handleCrashBounce();
      }
    });

    // AI Traffic Collisions
    this.trafficSystem.aiVehicles.forEach(ai => {
      if (pBox.intersectsBox(ai.box)) {
        this.handleCrashBounce();
      }
    });
  }

  handleCrashBounce() {
    this.carController.speed = -this.carController.speed * 0.35;
    this.carController.health = Math.max(0, this.carController.health - 15);

    this.environmentManager.spawnCollisionSparks(this.carController.position);
    this.missionManager.registerCollision();
  }

  spawnExhaustSmoke() {
    if (this.carController.throttle > 0.1 && Math.abs(this.carController.speed) > 0.5) {
      const pos = this.carController.position.clone();
      const yaw = this.carController.yawAngle;

      // Exhaust pipe offset at rear
      pos.x -= Math.sin(yaw) * 1.8;
      pos.z -= Math.cos(yaw) * 1.8;
      pos.y += 0.3;

      const geo = new THREE.SphereGeometry(0.12, 6, 6);
      const mat = new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.4 });
      const puff = new THREE.Mesh(geo, mat);
      puff.position.copy(pos);
      this.scene.add(puff);

      this.exhaustParticles.push({ mesh: puff, life: 0.3, scale: 0.12 });
    }
  }

  updateExhaustParticles(delta) {
    for (let i = this.exhaustParticles.length - 1; i >= 0; i--) {
      const p = this.exhaustParticles[i];
      p.life -= delta;
      p.scale += delta * 0.8;
      p.mesh.scale.set(p.scale, p.scale, p.scale);
      p.mesh.material.opacity = p.life * 1.2;
      p.mesh.position.y += delta * 0.5;

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.exhaustParticles.splice(i, 1);
      }
    }
  }

  updateCamera() {
    if (this.gameState === "GARAGE") {
      this.camera.position.set(0, 3.2, 7.5);
      this.camera.lookAt(0, 1.0, 0);
      return;
    }

    if (!this.carController) return;

    const carPos = this.carController.position;
    const yaw = this.carController.yawAngle;
    const speedKmh = this.carController.getSpeedKmh();

    // Dynamic FOV based on speed (Feels super fast & realistic!)
    const targetFov = 60 + (speedKmh / 140) * 12;
    this.camera.fov += (targetFov - this.camera.fov) * 0.1;
    this.camera.updateProjectionMatrix();

    if (this.cameraMode === 0) {
      // Smooth 3rd Person Chase Cam
      const dist = 7.5;
      const height = 3.2;
      const targetCamPos = new THREE.Vector3(
        carPos.x - Math.sin(yaw) * dist,
        carPos.y + height,
        carPos.z - Math.cos(yaw) * dist
      );

      this.camera.position.lerp(targetCamPos, 0.18);
      this.camera.lookAt(carPos.x, carPos.y + 1.2, carPos.z);
    } else if (this.cameraMode === 1) {
      // Hood Bumper View
      const hoodPos = new THREE.Vector3(
        carPos.x + Math.sin(yaw) * 1.2,
        carPos.y + 1.3,
        carPos.z + Math.cos(yaw) * 1.2
      );
      const lookPos = new THREE.Vector3(
        carPos.x + Math.sin(yaw) * 20,
        carPos.y + 1.3,
        carPos.z + Math.cos(yaw) * 20
      );

      this.camera.position.copy(hoodPos);
      this.camera.lookAt(lookPos);
    } else if (this.cameraMode === 2) {
      // Close Follow
      const dist = 5.0;
      const height = 2.2;
      const targetCamPos = new THREE.Vector3(
        carPos.x - Math.sin(yaw) * dist,
        carPos.y + height,
        carPos.z - Math.cos(yaw) * dist
      );

      this.camera.position.lerp(targetCamPos, 0.22);
      this.camera.lookAt(carPos.x, carPos.y + 1.0, carPos.z);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    this.updateKeyboardInputs();

    if (this.gameState === "PLAYING") {
      this.carController.update(delta);
      this.cityBuilder.updateTrafficLights(delta);
      this.trafficSystem.update(delta, this.carController);
      this.checkCollisions();
      this.spawnExhaustSmoke();
      this.updateExhaustParticles(delta);

      const result = this.missionManager.update(delta, this.carController, this.cityBuilder);
      if (result) {
        if (result.success) {
          this.gameState = "VICTORY";
          soundManager.stopEngine();
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          this.uiManager.showVictoryModal(result);
        } else {
          this.gameState = "DEFEAT";
          soundManager.stopEngine();
          this.uiManager.showDefeatModal(result);
        }
      }

      this.uiManager.updateHUD(
        this.carController.getSpeedKmh(),
        this.carController.fuel,
        this.carController.maxFuel,
        this.missionManager,
        this.carController.position,
        this.cityBuilder
      );
    } else if (this.gameState === "GARAGE") {
      this.garageSystem.update(delta);
    }

    this.environmentManager.update(delta, this.camera.position);
    this.updateCamera();

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new GameEngine();
});
