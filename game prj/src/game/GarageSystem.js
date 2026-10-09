import * as THREE from 'three';
import { CAR_SPECS } from '../physics/CarController.js';
import { saveSystem } from './SaveSystem.js';
import { soundManager } from '../audio/SoundManager.js';

export const CAR_PARTS_INFO = {
  engine: { name: "Engine Tuning", icon: "⚡", baseCost: 1000 },
  brakes: { name: "Brake Disc & Calipers", icon: "🛑", baseCost: 800 },
  steering: { name: "Power Steering", icon: "🎯", baseCost: 750 },
  tires: { name: "Performance Tires", icon: "🛞", baseCost: 900 },
  fuel: { name: "Expanded Fuel Tank", icon: "⛽", baseCost: 600 }
};

export class GarageSystem {
  constructor(scene, carController) {
    this.scene = scene;
    this.carController = carController;
    this.active = false;
    this.carKeys = ["hatchback", "sedan", "suv", "coupe"];
    this.currentIndex = 0;
    this.pedestal = null;
    this.spotlight = null;
  }

  setupShowroom() {
    // Showroom Pedestal Platform
    const pedGeo = new THREE.CylinderGeometry(5.0, 5.5, 0.4, 32);
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0x111122,
      metalness: 0.8,
      roughness: 0.2
    });
    this.pedestal = new THREE.Mesh(pedGeo, pedMat);
    this.pedestal.position.set(0, -0.2, 0);
    this.scene.add(this.pedestal);

    // Glowing Rim Ring around pedestal
    const ringGeo = new THREE.RingGeometry(5.0, 5.2, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    this.pedestal.add(ring);

    // Studio Overhead Spotlight
    this.spotlight = new THREE.SpotLight(0xffffff, 15.0, 30, Math.PI / 4, 0.5);
    this.spotlight.position.set(0, 12, 0);
    this.spotlight.target = this.pedestal;
    this.scene.add(this.spotlight);
    this.scene.add(this.spotlight.target);

    this.pedestal.visible = false;
  }

  openGarage() {
    this.active = true;
    this.pedestal.visible = true;

    // Load current selected car
    const currentId = saveSystem.data.selectedCarId || "hatchback";
    this.currentIndex = this.carKeys.indexOf(currentId);
    if (this.currentIndex < 0) this.currentIndex = 0;

    this.loadCarInGarage();
  }

  closeGarage() {
    this.active = false;
    this.pedestal.visible = false;
  }

  loadCarInGarage() {
    const carId = this.carKeys[this.currentIndex];
    this.carController.loadCar(carId);
    this.carController.resetPosition(0, 0, 0, 0);
    soundManager.playClick();
  }

  nextCar() {
    this.currentIndex = (this.currentIndex + 1) % this.carKeys.length;
    this.loadCarInGarage();
  }

  prevCar() {
    this.currentIndex = (this.currentIndex - 1 + this.carKeys.length) % this.carKeys.length;
    this.loadCarInGarage();
  }

  getCurrentCarSpec() {
    const carId = this.carKeys[this.currentIndex];
    return {
      id: carId,
      spec: CAR_SPECS[carId],
      isUnlocked: saveSystem.data.unlockedCars.includes(carId),
      isSelected: saveSystem.data.selectedCarId === carId,
      upgrades: saveSystem.data.upgrades[carId] || { engine: 1, brakes: 1, steering: 1, tires: 1, fuel: 1 }
    };
  }

  buyCar() {
    const info = this.getCurrentCarSpec();
    if (info.isUnlocked) return true;

    const success = saveSystem.unlockCar(info.id, info.spec.price);
    if (success) {
      soundManager.playSuccess();
      this.loadCarInGarage();
    } else {
      soundManager.playFail();
    }
    return success;
  }

  selectCar() {
    const info = this.getCurrentCarSpec();
    if (!info.isUnlocked) return false;
    saveSystem.selectCar(info.id);
    soundManager.playClick();
    return true;
  }

  upgradePart(partName) {
    const info = this.getCurrentCarSpec();
    const currentLvl = info.upgrades[partName] || 1;
    const cost = CAR_PARTS_INFO[partName].baseCost * currentLvl;

    const success = saveSystem.upgradePart(info.id, partName, cost);
    if (success) {
      soundManager.playSuccess();
      this.carController.loadCar(info.id);
    } else {
      soundManager.playFail();
    }
    return success;
  }

  paintCar(colorHex) {
    const info = this.getCurrentCarSpec();
    saveSystem.setCarColor(info.id, colorHex);
    this.carController.loadCar(info.id);
    soundManager.playClick();
  }

  update(delta) {
    if (this.active && this.carController) {
      // Slowly rotate car on showroom pedestal
      this.carController.yawAngle += delta * 0.4;
      this.carController.carGroup.rotation.y = this.carController.yawAngle;
    }
  }
}
