// Save System for persistent player progress (Coins, Upgrades, Garage, Missions)

const SAVE_KEY = "DR_DRIVING_3D_SAVE_DATA_V1";

const DEFAULT_DATA = {
  coins: 2500,
  exp: 0,
  level: 1,
  selectedCarId: "hatchback",
  unlockedCars: ["hatchback"],
  carColors: {
    hatchback: "#e63946", // Red
    sedan: "#1d3557",     // Deep Blue
    suv: "#2a9d8f",       // Teal/Cyan
    coupe: "#ffb703"      // Gold/Yellow
  },
  upgrades: {
    hatchback: { engine: 1, brakes: 1, steering: 1, tires: 1, fuel: 1 },
    sedan: { engine: 1, brakes: 1, steering: 1, tires: 1, fuel: 1 },
    suv: { engine: 1, brakes: 1, steering: 1, tires: 1, fuel: 1 },
    coupe: { engine: 1, brakes: 1, steering: 1, tires: 1, fuel: 1 }
  },
  missions: {
    mission_1: { completed: false, stars: 0, highScore: 0 },
    mission_2: { completed: false, stars: 0, highScore: 0 },
    mission_3: { completed: false, stars: 0, highScore: 0 },
    mission_4: { completed: false, stars: 0, highScore: 0 },
    mission_5: { completed: false, stars: 0, highScore: 0 },
    mission_6: { completed: false, stars: 0, highScore: 0 }
  },
  settings: {
    soundMuted: false,
    controlType: "wheel", // 'wheel', 'buttons', 'tilt'
    cameraMode: 0, // 0: 3rd person chase, 1: hood, 2: close follow, 3: interior
    graphicsQuality: "high" // 'high', 'medium'
  }
};

class SaveSystem {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_DATA,
          ...parsed,
          carColors: { ...DEFAULT_DATA.carColors, ...(parsed.carColors || {}) },
          upgrades: { ...DEFAULT_DATA.upgrades, ...(parsed.upgrades || {}) },
          missions: { ...DEFAULT_DATA.missions, ...(parsed.missions || {}) },
          settings: { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) }
        };
      }
    } catch (e) {
      console.error("Failed to load save data", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  saveData() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error("Failed to save data", e);
    }
  }

  addCoins(amount) {
    this.data.coins += amount;
    this.addExp(Math.floor(amount / 5));
    this.saveData();
    return this.data.coins;
  }

  deductCoins(amount) {
    if (this.data.coins >= amount) {
      this.data.coins -= amount;
      this.saveData();
      return true;
    }
    return false;
  }

  addExp(amount) {
    this.data.exp += amount;
    const nextLevelExp = this.data.level * 200;
    if (this.data.exp >= nextLevelExp) {
      this.data.level += 1;
      this.data.coins += 500; // Level up bonus!
    }
    this.saveData();
  }

  unlockCar(carId, cost) {
    if (this.data.unlockedCars.includes(carId)) return true;
    if (this.deductCoins(cost)) {
      this.data.unlockedCars.push(carId);
      this.data.selectedCarId = carId;
      this.saveData();
      return true;
    }
    return false;
  }

  selectCar(carId) {
    if (this.data.unlockedCars.includes(carId)) {
      this.data.selectedCarId = carId;
      this.saveData();
      return true;
    }
    return false;
  }

  upgradePart(carId, partName, cost) {
    if (!this.data.upgrades[carId]) return false;
    const currentLvl = this.data.upgrades[carId][partName] || 1;
    if (currentLvl >= 5) return false; // Max level 5

    if (this.deductCoins(cost)) {
      this.data.upgrades[carId][partName] = currentLvl + 1;
      this.saveData();
      return true;
    }
    return false;
  }

  setCarColor(carId, colorHex) {
    this.data.carColors[carId] = colorHex;
    this.saveData();
  }

  completeMission(missionId, stars, score) {
    if (!this.data.missions[missionId]) {
      this.data.missions[missionId] = { completed: false, stars: 0, highScore: 0 };
    }
    const m = this.data.missions[missionId];
    m.completed = true;
    m.stars = Math.max(m.stars, stars);
    m.highScore = Math.max(m.highScore, score);
    this.saveData();
  }

  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.saveData();
  }

  resetProgress() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    this.saveData();
  }
}

export const saveSystem = new SaveSystem();
