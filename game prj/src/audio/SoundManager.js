// Clean Procedural Web Audio API Sound Synthesizer (No Background Noise)

class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.engineGain = null;
    this.engineOscSub = null;
    this.engineOscMid = null;
    this.engineFilter = null;
    this.isEngineRunning = false;
    this.volume = 0.5;
    this.screeching = false;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  startEngine() {
    this.init();
    this.resume();
    if (!this.ctx || this.isMuted) return;

    if (this.isEngineRunning) this.stopEngine();

    const now = this.ctx.currentTime;

    // Master Engine Gain
    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.01, now);
    this.engineGain.gain.exponentialRampToValueAtTime(0.08 * this.volume, now + 0.3);

    // Sub Bass Engine Rumble (Sine wave - warm & smooth)
    this.engineOscSub = this.ctx.createOscillator();
    this.engineOscSub.type = "sine";
    this.engineOscSub.frequency.setValueAtTime(40, now);

    // Mid Harmonic Engine Body (Triangle wave - smooth tone, no harsh sawtooth hiss)
    this.engineOscMid = this.ctx.createOscillator();
    this.engineOscMid.type = "triangle";
    this.engineOscMid.frequency.setValueAtTime(80, now);

    // Lowpass Filter to cut out any high frequency hiss/noise completely
    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = "lowpass";
    this.engineFilter.frequency.setValueAtTime(220, now);
    this.engineFilter.Q.setValueAtTime(1.0, now);

    this.engineOscSub.connect(this.engineFilter);
    this.engineOscMid.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.ctx.destination);

    this.engineOscSub.start(now);
    this.engineOscMid.start(now);
    this.isEngineRunning = true;
  }

  stopEngine() {
    if (!this.ctx || !this.isEngineRunning) return;
    try {
      const now = this.ctx.currentTime;
      if (this.engineGain) {
        this.engineGain.gain.linearRampToValueAtTime(0.0001, now + 0.15);
      }
      setTimeout(() => {
        if (this.engineOscSub) { this.engineOscSub.stop(); this.engineOscSub.disconnect(); }
        if (this.engineOscMid) { this.engineOscMid.stop(); this.engineOscMid.disconnect(); }
        this.isEngineRunning = false;
      }, 160);
    } catch (e) {
      this.isEngineRunning = false;
    }
  }

  updateEngine(rpmRatio, speedKmh, isAccelerating) {
    if (!this.ctx || !this.isEngineRunning || this.isMuted) return;

    const now = this.ctx.currentTime;
    
    // Smooth frequency scaling matching speed & RPM
    const targetSub = 35 + rpmRatio * 75;
    const targetMid = 70 + rpmRatio * 150;
    const targetFilter = 180 + rpmRatio * 350 + (isAccelerating ? 150 : 0);
    const targetGain = (0.05 + (isAccelerating ? 0.08 : 0.02)) * this.volume;

    this.engineOscSub.frequency.setTargetAtTime(targetSub, now, 0.08);
    this.engineOscMid.frequency.setTargetAtTime(targetMid, now, 0.08);
    this.engineFilter.frequency.setTargetAtTime(targetFilter, now, 0.08);
    this.engineGain.gain.setTargetAtTime(targetGain, now, 0.08);
  }

  playHorn() {
    this.init();
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sine";
    osc2.type = "triangle";
    osc1.frequency.setValueAtTime(392, now); // G4
    osc2.frequency.setValueAtTime(493.88, now); // B4

    gain.gain.setValueAtTime(0.15 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  }

  playCollision() {
    this.init();
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.25);

    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  playSuccess() {
    this.init();
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.15 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    });
  }

  playFail() {
    this.init();
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const notes = [300, 240, 180];
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.15 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    });
  }

  playClick() {
    this.init();
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(0.1 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.isEngineRunning) {
      this.stopEngine();
    }
    return this.isMuted;
  }
}

export const soundManager = new SoundManager();
