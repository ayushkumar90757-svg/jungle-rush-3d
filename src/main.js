// JUNGLE RUSH 3D - MAIN GAME ORCHESTRATOR & APPLICATION ENTRY
import * as THREE from 'three';
import { Engine } from './core/Engine.js';
import { SaveManager } from './core/SaveManager.js';
import { SoundManager } from './audio/SoundManager.js';
import { MissionManager } from './core/MissionManager.js';
import { InputManager } from './core/InputManager.js';
import { ParticleManager } from './world/ParticleManager.js';
import { PlayerController } from './entities/PlayerController.js';
import { TrackManager } from './world/TrackManager.js';
import { UIManager } from './ui/UIManager.js';

export class Game {
  constructor() {
    this.state = 'menu'; // 'menu', 'playing', 'paused', 'gameover'

    // Core Subsystems
    this.container = document.getElementById('canvas-container');
    this.saveManager = new SaveManager();
    this.soundManager = new SoundManager(this.saveManager);
    this.missionManager = new MissionManager(this.saveManager);
    this.engine = new Engine(this.container, this.saveManager);
    this.particles = new ParticleManager(this.engine.scene);

    // Gameplay Entities
    this.player = new PlayerController(this.engine, this.soundManager, this.saveManager);
    this.track = new TrackManager(this.engine, this.player, this.soundManager, this.particles);

    // UI & Inputs
    this.ui = new UIManager(this);
    this.input = new InputManager({
      onLaneLeft: () => this.handleLaneLeft(),
      onLaneRight: () => this.handleLaneRight(),
      onJump: () => this.handleJump(),
      onSlide: () => this.handleSlide(),
      onPause: () => this.togglePause()
    });

    // Hook virtual on-screen controls
    this.input.bindVirtualButton('v-left', () => this.handleLaneLeft());
    this.input.bindVirtualButton('v-right', () => this.handleLaneRight());
    this.input.bindVirtualButton('v-jump', () => this.handleJump());
    this.input.bindVirtualButton('v-slide', () => this.handleSlide());

    // Game loop timing
    this.lastTime = performance.now();
    this.clock = new THREE.Clock();

    // Start render loop
    requestAnimationFrame((t) => this.loop(t));
  }

  // --- GAMEPLAY CONTROLS DISPATCH ---

  handleLaneLeft() {
    if (this.state === 'playing') {
      this.player.moveLeft();
    }
  }

  handleLaneRight() {
    if (this.state === 'playing') {
      this.player.moveRight();
    }
  }

  handleJump() {
    if (this.state === 'playing') {
      this.player.jump();
    }
  }

  handleSlide() {
    if (this.state === 'playing') {
      this.player.slide();
      this.particles.emitSlideDust(
        this.player.root.position.x,
        this.player.root.position.y + 0.1,
        this.player.root.position.z
      );
    }
  }

  togglePause() {
    if (this.state === 'playing') {
      this.pauseGame();
    } else if (this.state === 'paused') {
      this.resumeGame();
    }
  }

  // --- RUN LIFECYCLE ---

  startRun() {
    this.state = 'playing';
    this.player.reset();
    this.track.reset();
    this.particles.reset();

    this.ui.showScreen('hud');
    this.soundManager.startMusic();
  }

  pauseGame() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.ui.showScreen('pause');
  }

  resumeGame() {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    this.ui.showScreen('hud');
  }

  triggerGameOver() {
    this.state = 'gameover';
    this.soundManager.stopMusic();

    const distance = this.player.distanceTraveled;
    const coins = this.player.coinsCollected;
    const score = distance * 10 + coins * 50;

    const isNewHigh = this.saveManager.recordRun(score, distance, coins);

    // Track active mission progress
    this.missionManager.getMissionsWithProgress({
      distance: Math.floor(distance),
      coins: coins,
      powerups: this.player.powerupsCollected
    });

    setTimeout(() => {
      this.ui.showGameOver(score, distance, coins, isNewHigh);
    }, 1200);
  }

  returnToMenu() {
    this.state = 'menu';
    this.soundManager.stopMusic();
    this.player.reset();
    this.track.reset();
    this.particles.reset();
    this.ui.updateMenuStats();
    this.ui.showScreen('menu');
  }

  // --- MAIN UPDATE LOOP (TARGET 60 FPS) ---

  loop(currentTime) {
    requestAnimationFrame((t) => this.loop(t));

    // Calculate clamped delta time to prevent physics tunnel/explosion on frame drop
    let dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    if (dt > 0.05) dt = 0.05; // clamp to 20 FPS min equivalent

    const fps = this.engine.updateFPS();

    if (this.state === 'playing') {
      // 1. Update player physics & movement
      this.player.update(dt);

      // Check if player died this frame
      if (this.player.isDead) {
        this.triggerGameOver();
      }

      // 2. Update track, spawn chunks, check collisions
      this.track.update(dt);

      // 3. Update particle simulation
      this.particles.update(dt);

      // 4. Update camera position with smooth follow & shake
      this.engine.updateCamera(this.player.root.position, dt);

      // 5. Update HUD metrics
      const currentScore = this.player.distanceTraveled * 10 + this.player.coinsCollected * 50;
      this.ui.updateHUD(
        this.player.coinsCollected,
        this.player.distanceTraveled,
        currentScore,
        fps,
        this.player.activePowerups
      );

    } else if (this.state === 'menu' || this.state === 'characters') {
      // Rotate character model gently on menu turntable
      if (this.player && this.player.characterModel) {
        this.player.characterModel.update(dt, 0.5);
        this.player.characterModel.setAnimation('idle');
      }
      this.engine.updateCamera(this.player.root.position, dt);

    } else if (this.state === 'paused') {
      // Keep camera still during pause, don't update physics
    }

    // 6. Render 3D Scene
    this.engine.render();
  }
}

// Instantiate and initialize when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.jungleRushGame = new Game();
});
