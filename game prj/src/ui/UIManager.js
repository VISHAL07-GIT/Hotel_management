import { saveSystem } from '../game/SaveSystem.js';
import { MISSIONS_LIST } from '../game/MissionManager.js';
import { CAR_PARTS_INFO } from '../game/GarageSystem.js';
import { soundManager } from '../audio/SoundManager.js';

export class UIManager {
  constructor(game) {
    this.game = game;
    this.minimapCtx = null;
    this.wheelRotation = 0;
    this.touchSteerActive = false;
    this.touchStartX = 0;
    this.controlType = "wheel"; // 'wheel' or 'buttons'
    this.initDOM();
  }

  initDOM() {
    const minimapCanvas = document.getElementById('minimap-canvas');
    if (minimapCanvas) {
      this.minimapCtx = minimapCanvas.getContext('2d');
    }

    this.bindEvents();
    this.updateStatsDisplay();
  }

  bindEvents() {
    // 1. Main Navigation
    document.getElementById('btn-play-menu')?.addEventListener('click', () => {
      this.showScreen('mission-selector-modal');
      this.renderMissionsList();
      soundManager.playClick();
    });

    document.getElementById('btn-garage-menu')?.addEventListener('click', () => {
      this.game.openGarageMode();
      this.showScreen('garage-screen');
      this.updateGarageUI();
      soundManager.playClick();
    });

    document.getElementById('btn-settings-menu')?.addEventListener('click', () => {
      this.showScreen('settings-modal');
      soundManager.playClick();
    });

    // 2. Pause / Resume
    document.getElementById('btn-pause-hud')?.addEventListener('click', () => {
      this.game.pauseGame();
      this.showScreen('pause-modal');
      soundManager.playClick();
    });

    document.getElementById('btn-resume')?.addEventListener('click', () => {
      this.game.resumeGame();
      this.hideModals();
      soundManager.playClick();
    });

    document.getElementById('btn-quit-main')?.addEventListener('click', () => {
      this.game.exitToMainMenu();
      this.showScreen('main-menu-screen');
      soundManager.playClick();
    });

    // 3. Garage Actions
    document.getElementById('btn-garage-prev')?.addEventListener('click', () => {
      this.game.garageSystem.prevCar();
      this.updateGarageUI();
    });

    document.getElementById('btn-garage-next')?.addEventListener('click', () => {
      this.game.garageSystem.nextCar();
      this.updateGarageUI();
    });

    document.getElementById('btn-garage-buy')?.addEventListener('click', () => {
      if (this.game.garageSystem.buyCar()) {
        this.updateGarageUI();
        this.updateStatsDisplay();
      }
    });

    document.getElementById('btn-garage-select')?.addEventListener('click', () => {
      if (this.game.garageSystem.selectCar()) {
        this.updateGarageUI();
      }
    });

    document.getElementById('btn-garage-back')?.addEventListener('click', () => {
      this.game.closeGarageMode();
      this.showScreen('main-menu-screen');
      soundManager.playClick();
    });

    document.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        const color = e.target.getAttribute('data-color');
        if (color) {
          this.game.garageSystem.paintCar(color);
        }
      });
    });

    // 4. Pedal Buttons
    const pedalAccel = document.getElementById('pedal-accel');
    const pedalBrake = document.getElementById('pedal-brake');

    const setThrottle = (val) => this.game.carController.setInputs({ throttle: val });
    const setBrake = (val) => this.game.carController.setInputs({ brake: val });

    if (pedalAccel) {
      pedalAccel.addEventListener('touchstart', (e) => { e.preventDefault(); setThrottle(1); });
      pedalAccel.addEventListener('touchend', (e) => { e.preventDefault(); setThrottle(0); });
      pedalAccel.addEventListener('mousedown', () => setThrottle(1));
      pedalAccel.addEventListener('mouseup', () => setThrottle(0));
    }

    if (pedalBrake) {
      pedalBrake.addEventListener('touchstart', (e) => { e.preventDefault(); setBrake(1); });
      pedalBrake.addEventListener('touchend', (e) => { e.preventDefault(); setBrake(0); });
      pedalBrake.addEventListener('mousedown', () => setBrake(1));
      pedalBrake.addEventListener('mouseup', () => setBrake(0));
    }

    // Gear Selectors (D, R, P)
    ['D', 'R', 'P'].forEach(gear => {
      document.getElementById(`gear-${gear.toLowerCase()}`)?.addEventListener('click', () => {
        this.game.carController.setInputs({ gear });
        this.updateGearUI(gear);
        soundManager.playClick();
      });
    });

    // Horn & Headlight buttons
    document.getElementById('btn-horn')?.addEventListener('click', () => {
      soundManager.playHorn();
    });

    document.getElementById('btn-lights')?.addEventListener('click', () => {
      this.game.carController.toggleHeadlights();
      soundManager.playClick();
    });

    // Control Type Switcher Toggle (Steering Wheel vs Arrow Buttons)
    document.getElementById('btn-toggle-control-type')?.addEventListener('click', () => {
      this.controlType = this.controlType === 'wheel' ? 'buttons' : 'wheel';
      const wheelContainer = document.getElementById('wheel-container');
      const btnContainer = document.getElementById('steer-buttons-container');

      if (this.controlType === 'buttons') {
        wheelContainer?.classList.add('hidden');
        btnContainer?.classList.remove('hidden');
      } else {
        wheelContainer?.classList.remove('hidden');
        btnContainer?.classList.add('hidden');
      }
      soundManager.playClick();
    });

    // Touch Left & Right Arrow Buttons
    const btnLeft = document.getElementById('btn-steer-left');
    const btnRight = document.getElementById('btn-steer-right');

    const setSteer = (val) => this.game.carController.setInputs({ steering: val });

    if (btnLeft) {
      btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); setSteer(1); });
      btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); setSteer(0); });
      btnLeft.addEventListener('mousedown', () => setSteer(1));
      btnLeft.addEventListener('mouseup', () => setSteer(0));
    }

    if (btnRight) {
      btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); setSteer(-1); });
      btnRight.addEventListener('touchend', (e) => { e.preventDefault(); setSteer(0); });
      btnRight.addEventListener('mousedown', () => setSteer(-1));
      btnRight.addEventListener('mouseup', () => setSteer(0));
    }

    // Steering Wheel Drag Listener
    const wheel = document.getElementById('steering-wheel');
    if (wheel) {
      const handleSteerStart = (clientX) => {
        this.touchSteerActive = true;
        this.touchStartX = clientX;
      };

      const handleSteerMove = (clientX) => {
        if (!this.touchSteerActive) return;
        const deltaX = clientX - this.touchStartX;
        const clampedAngle = Math.max(-120, Math.min(120, deltaX * 1.4));
        wheel.style.transform = `rotate(${clampedAngle}deg)`;
        const normalizedSteer = clampedAngle / 120; // -1 to 1
        this.game.carController.setInputs({ steering: normalizedSteer });
      };

      const handleSteerEnd = () => {
        this.touchSteerActive = false;
        wheel.style.transform = 'rotate(0deg)';
        this.game.carController.setInputs({ steering: 0 });
      };

      wheel.addEventListener('touchstart', (e) => handleSteerStart(e.touches[0].clientX));
      window.addEventListener('touchmove', (e) => {
        if (this.touchSteerActive && e.touches.length > 0) {
          handleSteerMove(e.touches[0].clientX);
        }
      });
      window.addEventListener('touchend', handleSteerEnd);

      wheel.addEventListener('mousedown', (e) => handleSteerStart(e.clientX));
      window.addEventListener('mousemove', (e) => {
        if (this.touchSteerActive) handleSteerMove(e.clientX);
      });
      window.addEventListener('mouseup', handleSteerEnd);
    }
  }

  showScreen(screenId) {
    document.querySelectorAll('.ui-screen, .modal-overlay').forEach(el => {
      el.classList.add('hidden');
    });

    const target = document.getElementById(screenId);
    if (target) target.classList.remove('hidden');
  }

  hideModals() {
    document.querySelectorAll('.modal-overlay').forEach(el => {
      el.classList.add('hidden');
    });
    document.getElementById('hud-screen')?.classList.remove('hidden');
  }

  updateStatsDisplay() {
    const coinsEl = document.getElementById('user-coins-display');
    const levelEl = document.getElementById('user-level-display');
    if (coinsEl) coinsEl.innerText = saveSystem.data.coins.toLocaleString();
    if (levelEl) levelEl.innerText = `Lvl ${saveSystem.data.level}`;
  }

  renderMissionsList() {
    const grid = document.getElementById('missions-grid');
    if (!grid) return;

    grid.innerHTML = "";
    MISSIONS_LIST.forEach((m, idx) => {
      const savedData = saveSystem.data.missions[m.id] || { completed: false, stars: 0 };
      const card = document.createElement('div');
      card.className = 'mission-card-item';

      let starsHtml = '☆☆☆';
      if (savedData.stars === 1) starsHtml = '★☆☆';
      if (savedData.stars === 2) starsHtml = '★★☆';
      if (savedData.stars === 3) starsHtml = '★★★';

      card.innerHTML = `
        <div>
          <div style="font-weight:800; font-size:1.1rem; color:var(--primary-gold)">Mission ${idx + 1}</div>
          <div style="font-weight:700; font-size:1.05rem; margin-top:4px">${m.title}</div>
          <div style="font-size:0.85rem; color:var(--text-muted); margin-top:6px">${m.description}</div>
        </div>
        <div>
          <div class="stars-row">${starsHtml}</div>
          <div style="display:flex; justify-between; align-items:center; margin-top:10px">
            <span style="font-weight:700; color:var(--success)">+${m.rewardCoins} 🪙</span>
            <button class="btn-primary" style="padding:6px 16px; font-size:0.9rem">START</button>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.game.startMission(m.id);
        this.showScreen('hud-screen');
      });

      grid.appendChild(card);
    });

    document.getElementById('btn-close-missions')?.addEventListener('click', () => {
      this.showScreen('main-menu-screen');
      soundManager.playClick();
    });
  }

  updateGarageUI() {
    const info = this.game.garageSystem.getCurrentCarSpec();
    this.updateStatsDisplay();

    document.getElementById('garage-car-name').innerText = info.spec.name;

    const btnBuy = document.getElementById('btn-garage-buy');
    const btnSelect = document.getElementById('btn-garage-select');

    if (info.isUnlocked) {
      btnBuy.classList.add('hidden');
      btnSelect.classList.remove('hidden');
      btnSelect.innerText = info.isSelected ? "SELECTED" : "DRIVE THIS";
      btnSelect.disabled = info.isSelected;
    } else {
      btnBuy.classList.remove('hidden');
      btnSelect.classList.add('hidden');
      btnBuy.innerText = `UNLOCK (${info.spec.price} 🪙)`;
    }

    const container = document.getElementById('garage-upgrades-list');
    if (!container) return;

    container.innerHTML = "";
    Object.keys(CAR_PARTS_INFO).forEach(part => {
      const partData = CAR_PARTS_INFO[part];
      const level = info.upgrades[part] || 1;
      const cost = partData.baseCost * level;

      const row = document.createElement('div');
      row.className = 'upgrade-row';

      let pips = '';
      for (let i = 1; i <= 5; i++) {
        pips += `<div class="level-pip ${i <= level ? 'active' : ''}"></div>`;
      }

      row.innerHTML = `
        <div class="upgrade-info">
          <div class="upgrade-name">${partData.icon} ${partData.name}</div>
          <div class="level-bar">${pips}</div>
        </div>
        <button class="btn-secondary" style="padding:6px 14px; font-size:0.85rem" ${level >= 5 ? 'disabled' : ''}>
          ${level >= 5 ? 'MAX' : `UPGRADE (${cost} 🪙)`}
        </button>
      `;

      row.querySelector('button')?.addEventListener('click', () => {
        if (this.game.garageSystem.upgradePart(part)) {
          this.updateGarageUI();
        }
      });

      container.appendChild(row);
    });
  }

  updateGearUI(gear) {
    ['d', 'r', 'p'].forEach(g => {
      const btn = document.getElementById(`gear-${g}`);
      if (btn) {
        if (g === gear.toLowerCase()) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });
  }

  updateHUD(speedKmh, fuel, maxFuel, missionManager, playerPos, cityBuilder) {
    const speedEl = document.getElementById('digital-speed');
    if (speedEl) speedEl.innerText = speedKmh;

    if (missionManager && missionManager.active) {
      const timerEl = document.getElementById('hud-timer-text');
      if (timerEl) timerEl.innerText = `${Math.ceil(missionManager.timer)}s`;

      const objText = document.getElementById('hud-objective-text');
      if (objText) objText.innerText = missionManager.statusMessage;
    }

    if (this.minimapCtx && playerPos) {
      const ctx = this.minimapCtx;
      const w = 110;
      const h = 110;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const scale = 0.4;

      ctx.fillStyle = '#06d6a0';
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();

      if (missionManager && missionManager.currentMission && missionManager.currentMission.targetPos) {
        const tp = missionManager.currentMission.targetPos;
        const dx = cx + (tp.x - playerPos.x) * scale;
        const dy = cy + (tp.z - playerPos.z) * scale;

        ctx.fillStyle = '#ffb703';
        ctx.beginPath();
        ctx.arc(dx, dy, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  showVictoryModal(data) {
    this.updateStatsDisplay();
    this.showScreen('victory-modal');

    document.getElementById('victory-title').innerText = "MISSION COMPLETED!";
    document.getElementById('victory-reward').innerText = `+${data.rewardCoins} 🪙`;

    const starsContainer = document.getElementById('victory-stars');
    if (starsContainer) {
      starsContainer.innerHTML = '★'.repeat(data.stars) + '☆'.repeat(3 - data.stars);
    }

    document.getElementById('btn-next-mission')?.addEventListener('click', () => {
      this.showScreen('mission-selector-modal');
      this.renderMissionsList();
      soundManager.playClick();
    });
  }

  showDefeatModal(data) {
    this.showScreen('defeat-modal');

    document.getElementById('defeat-reason').innerText = data.reason || "Mission Failed!";

    document.getElementById('btn-retry-mission')?.addEventListener('click', () => {
      this.game.restartCurrentMission();
      this.showScreen('hud-screen');
      soundManager.playClick();
    });
  }
}
