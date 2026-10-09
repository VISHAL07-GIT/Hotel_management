import * as THREE from 'three';
import { saveSystem } from './SaveSystem.js';
import { soundManager } from '../audio/SoundManager.js';

export const MISSIONS_LIST = [
  {
    id: "mission_1",
    title: "City Navigator",
    description: "Drive safely to the target destination parking zone before time expires.",
    rewardCoins: 800,
    timeLimit: 60, // seconds
    startPos: { x: 0, z: 0, yaw: 0 },
    targetPos: { x: 110, z: -40, radius: 3.5 }
  },
  {
    id: "mission_2",
    title: "Taxi Express",
    description: "Pick up the waiting passenger and drop them at the destination stand.",
    rewardCoins: 1200,
    timeLimit: 90,
    startPos: { x: 40, z: -110, yaw: Math.PI / 2 },
    pickupPos: { x: 40, z: -110, radius: 4.0 },
    dropoffPos: { x: -110, z: 40, radius: 4.0 }
  },
  {
    id: "mission_3",
    title: "Traffic Signals Master",
    description: "Drive through city intersections without running any red lights or crashing.",
    rewardCoins: 1000,
    timeLimit: 75,
    startPos: { x: -110, z: -110, yaw: 0 },
    targetPos: { x: 110, z: 110, radius: 5.0 }
  },
  {
    id: "mission_4",
    title: "Parallel Parking King",
    description: "Accurately maneuver and park inside the narrow yellow parking box.",
    rewardCoins: 1500,
    timeLimit: 50,
    startPos: { x: -45, z: -30, yaw: Math.PI },
    targetPos: { x: -40, z: -40, radius: 2.2 }
  },
  {
    id: "mission_5",
    title: "Zero Scratch Challenge",
    description: "Drive 400 meters through busy city traffic with 0 collisions!",
    rewardCoins: 1800,
    timeLimit: 80,
    startPos: { x: 0, z: 0, yaw: 0 },
    targetDistance: 400
  },
  {
    id: "mission_6",
    title: "Emergency Fuel Rush",
    description: "Reach the gas station before your fuel tank completely empties!",
    rewardCoins: 2200,
    timeLimit: 45,
    startPos: { x: -110, z: 110, yaw: -Math.PI / 2 },
    targetPos: { x: 40, z: 40, radius: 5.0 }
  }
];

export class MissionManager {
  constructor() {
    this.currentMission = null;
    this.active = false;
    this.timer = 0;
    this.distanceDriven = 0;
    this.collisionsCount = 0;
    this.taxiState = "PICKUP"; // 'PICKUP' or 'DROPOFF'
    this.statusMessage = "";
    this.lastPlayerPos = new THREE.Vector3();
  }

  startMission(missionId, playerCar) {
    const config = MISSIONS_LIST.find(m => m.id === missionId) || MISSIONS_LIST[0];
    this.currentMission = config;
    this.active = true;
    this.timer = config.timeLimit;
    this.distanceDriven = 0;
    this.collisionsCount = 0;
    this.taxiState = "PICKUP";
    this.statusMessage = config.description;

    // Reset Player Car
    const sp = config.startPos;
    playerCar.resetPosition(sp.x, 0, sp.z, sp.yaw);
    this.lastPlayerPos.copy(playerCar.position);

    if (missionId === "mission_6") {
      playerCar.fuel = 25; // Low starting fuel for urgency!
    }

    soundManager.playClick();
  }

  update(delta, playerCar, cityBuilder) {
    if (!this.active || !this.currentMission) return null;

    // Timer countdown
    this.timer -= delta;
    if (this.timer <= 0) {
      return this.failMission("Time Expired!");
    }

    // Distance calculation
    const distDelta = playerCar.position.distanceTo(this.lastPlayerPos);
    if (distDelta < 5.0) { // filter teleports
      this.distanceDriven += distDelta;
    }
    this.lastPlayerPos.copy(playerCar.position);

    // Fuel depletion check
    if (playerCar.fuel <= 0) {
      return this.failMission("Out of Fuel!");
    }

    const m = this.currentMission;

    // Mission 1: Navigator & Mission 4: Parallel Parking & Mission 6: Fuel Rush
    if (m.targetPos) {
      const distToTarget = playerCar.position.distanceTo(new THREE.Vector3(m.targetPos.x, 0, m.targetPos.z));

      if (distToTarget <= m.targetPos.radius && Math.abs(playerCar.speed) < 0.5) {
        return this.winMission();
      }
    }

    // Mission 2: Taxi Express
    if (m.id === "mission_2") {
      if (this.taxiState === "PICKUP") {
        const distToPickup = playerCar.position.distanceTo(new THREE.Vector3(m.pickupPos.x, 0, m.pickupPos.z));
        if (distToPickup <= m.pickupPos.radius && Math.abs(playerCar.speed) < 0.5) {
          this.taxiState = "DROPOFF";
          this.statusMessage = "Passenger On Board! Drive to Drop-off Stand!";
          soundManager.playSuccess();
        }
      } else if (this.taxiState === "DROPOFF") {
        const distToDrop = playerCar.position.distanceTo(new THREE.Vector3(m.dropoffPos.x, 0, m.dropoffPos.z));
        if (distToDrop <= m.dropoffPos.radius && Math.abs(playerCar.speed) < 0.5) {
          return this.winMission();
        }
      }
    }

    // Mission 5: Zero Scratch Challenge
    if (m.id === "mission_5") {
      this.statusMessage = `Distance: ${Math.floor(this.distanceDriven)} / ${m.targetDistance}m`;
      if (this.collisionsCount > 0) {
        return this.failMission("Car Scratched! Mission Failed.");
      }
      if (this.distanceDriven >= m.targetDistance) {
        return this.winMission();
      }
    }

    return null; // Mission in progress
  }

  registerCollision() {
    if (!this.active) return;
    this.collisionsCount++;
    soundManager.playCollision();
  }

  winMission() {
    this.active = false;
    soundManager.playSuccess();

    // Calculate Stars (1 to 3)
    let stars = 3;
    if (this.timer < this.currentMission.timeLimit * 0.3) stars--;
    if (this.collisionsCount > 1) stars--;
    stars = Math.max(1, stars);

    const bonusCoins = this.currentMission.rewardCoins * (stars / 3);
    const totalReward = Math.round(bonusCoins);

    saveSystem.completeMission(this.currentMission.id, stars, totalReward);
    saveSystem.addCoins(totalReward);

    return {
      success: true,
      mission: this.currentMission,
      stars,
      rewardCoins: totalReward,
      timeTaken: Math.round(this.currentMission.timeLimit - this.timer)
    };
  }

  failMission(reason) {
    this.active = false;
    soundManager.playFail();
    return {
      success: false,
      mission: this.currentMission,
      reason
    };
  }
}
