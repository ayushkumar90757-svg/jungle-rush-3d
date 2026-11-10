// JUNGLE RUSH 3D - PROCEDURAL WEBAUDIO SOUND ENGINE & TRIBAL MUSIC SYNTHESIZER

export class SoundManager {
  constructor(saveManager) {
    this.saveManager = saveManager;
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.isMuted = false;
    this.isPlayingMusic = false;
    this.musicInterval = null;
    this.stepIndex = 0;
    this.coinPitchCombo = 0;
    this.lastCoinTime = 0;

    // Pull initial volumes from settings
    const settings = this.saveManager.data.settings;
    this.masterVol = settings.masterVolume ?? 1.0;
    this.musicVol = settings.musicVolume ?? 0.7;
    this.sfxVol = settings.sfxVolume ?? 0.85;

    // Audio setup on first user interaction to comply with browser autoplay policies
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVol, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVol, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.initialized = true;
    } catch (e) {
      console.warn('WebAudio initialization error:', e);
    }
  }

  resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(val) {
    this.masterVol = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVol, this.ctx.currentTime, 0.05);
    }
    this.saveManager.data.settings.masterVolume = this.masterVol;
    this.saveManager.save();
  }

  setMusicVolume(val) {
    this.musicVol = Math.max(0, Math.min(1, val));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.musicVol, this.ctx.currentTime, 0.05);
    }
    this.saveManager.data.settings.musicVolume = this.musicVol;
    this.saveManager.save();
  }

  setSFXVolume(val) {
    this.sfxVol = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVol, this.ctx.currentTime, 0.05);
    }
    this.saveManager.data.settings.sfxVolume = this.sfxVol;
    this.saveManager.save();
  }

  // --- PROCEDURAL TRIBAL JUNGLE MUSIC SEQUENCER ---
  startMusic() {
    if (this.isPlayingMusic) return;
    this.init();
    this.resumeContext();
    this.isPlayingMusic = true;

    // BPM = 128 (Jungle runner adrenaline tempo)
    const stepDurationMs = (60 / 128 / 4) * 1000; // 16th notes ~ 117ms
    this.stepIndex = 0;

    // Rhythmic pattern matrices (16 steps per bar)
    // 1: Djembe bass drum
    // 2: Conga high/slap
    // 3: Shaker/Cabasa
    // 4: Marimba melody notes
    const djembePattern = [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0];
    const congaPattern  = [0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0];
    const shakerPattern = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    
    // Pentatonic jungle marimba scale (F#, A, B, C#, E)
    const marimbaFrequencies = [
      370.0, 440.0, 493.88, 554.37, 659.25, 739.99, 880.0
    ];
    const melodyPattern = [
      0, -1, 2, -1, 1, -1, 3, -1, 4, -1, 2, 3, 1, -1, 0, -1
    ];

    this.musicInterval = setInterval(() => {
      if (!this.isPlayingMusic || !this.ctx || this.ctx.state !== 'running') return;

      const step = this.stepIndex % 16;
      const bar = Math.floor(this.stepIndex / 16);

      // 1. Shaker
      if (shakerPattern[step]) {
        this.synthShaker(step % 2 === 0 ? 0.07 : 0.04);
      }

      // 2. Djembe Bass
      if (djembePattern[step]) {
        this.synthDjembe(step === 0 ? 1.0 : 0.8);
      }

      // 3. Conga
      if (congaPattern[step]) {
        this.synthConga(step % 4 === 2 ? 380 : 440, 0.4);
      }

      // 4. Marimba melody (every 2 bars)
      if (melodyPattern[step] >= 0 && bar % 2 === 0) {
        const noteIdx = melodyPattern[step];
        this.synthMarimba(marimbaFrequencies[noteIdx], 0.25);
      }

      // Occasional jungle bird call (every 8 bars)
      if (this.stepIndex % 128 === 64) {
        this.synthJungleBird();
      }

      this.stepIndex++;
    }, stepDurationMs);
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  // --- SYNTHESIZERS ---

  synthDjembe(intensity = 1.0) {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.16);

    gain.gain.setValueAtTime(0.6 * intensity, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  synthConga(freq = 400, vol = 0.3) {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.1);

    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  synthShaker(vol = 0.05) {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6000, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(t);
  }

  synthMarimba(freq, vol = 0.2) {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;

    // Fundamental sine + short woody overtone
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, t);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.76, t); // Wooden bar partial

    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.musicGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.32);
    osc2.stop(t + 0.15);
  }

  synthJungleBird() {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400, t);
    osc.frequency.linearRampToValueAtTime(3200, t + 0.1);
    osc.frequency.linearRampToValueAtTime(2100, t + 0.25);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  // --- SOUND EFFECTS (SFX) ---

  playFootstep(surface = 'stone') {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const freq = surface === 'wood' ? 120 : 180;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.05);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  playJump() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Upward swoosh + soft spring
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(620, t + 0.18);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.24);
  }

  playSlide() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Filtered swoosh friction noise
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.7));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.linearRampToValueAtTime(350, t + 0.2);
    filter.Q.value = 1.8;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  playCoin() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Combo pitch increment if collected in quick succession
    const now = performance.now();
    if (now - this.lastCoinTime < 350) {
      this.coinPitchCombo = Math.min(this.coinPitchCombo + 1, 8);
    } else {
      this.coinPitchCombo = 0;
    }
    this.lastCoinTime = now;

    // Base pitch C6 (1046.5Hz) climbing pentatonically
    const pitches = [1046.5, 1174.66, 1318.51, 1567.98, 1760.0, 2093.0, 2349.32, 2637.02, 3135.96];
    const pitch = pitches[this.coinPitchCombo] || 1046.5;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(pitch, t);
    osc1.frequency.setValueAtTime(pitch * 1.5, t + 0.05);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(pitch * 2, t);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.22);
    osc2.stop(t + 0.22);
  }

  playPowerUp() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // 4-note ascending fanfare
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const startTime = t + idx * 0.06;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.27);
    });
  }

  playShieldBreak() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Glass shatter + energy pulse
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.35);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.42);
  }

  playCrash() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Heavy bass impact thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.4);

    gain.gain.setValueAtTime(0.65, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.5);

    // Crunch noise
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    noise.start(t);
  }

  playButtonClick() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.04);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.06);
  }
}
