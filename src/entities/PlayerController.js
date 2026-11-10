// JUNGLE RUSH 3D - PLAYER CONTROLLER (PHYSICS, LANES, JUMP, SLIDE, COLLISION BOXES)
import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { CharacterModel } from './CharacterModel.js';

export class PlayerController {
  constructor(engine, soundManager, saveManager) {
    this.engine = engine;
    this.soundManager = soundManager;
    this.saveManager = saveManager;

    this.root = new THREE.Group();
    this.engine.scene.add(this.root);

    // Movement state
    this.currentLane = CONFIG.LANE_CENTER; // 0: Left, 1: Center, 2: Right
    this.targetLane = CONFIG.LANE_CENTER;
    this.lateralX = 0;
    this.forwardSpeed = CONFIG.BASE_SPEED;
    this.distanceTraveled = 0;
    this.coinsCollected = 0;
    this.powerupsCollected = 0;

    // Vertical Jump Physics
    this.posY = CONFIG.GROUND_Y;
    this.velY = 0;
    this.isJumping = false;
    this.isGrounded = true;

    // Slide Mechanics
    this.isSliding = false;
    this.slideTimer = 0;

    // Active Power-ups state
    this.activePowerups = {
      magnet: 0,
      shield: 0,
      boost: 0,
      multiplier: 0
    };
    this.hasActiveShield = false;

    // Shield visual mesh
    this.shieldMesh = null;
    this.createShieldMesh();

    // Invulnerability & Death
    this.isDead = false;
    this.invulnerableTimer = 0;

    // Collision Box (pre-allocated to avoid GC)
    this.box = new THREE.Box3();
    this.hitMin = new THREE.Vector3();
    this.hitMax = new THREE.Vector3();

    // Character model
    this.characterModel = null;
    this.loadCharacter(this.saveManager.data.selectedCharacter);
  }

  loadCharacter(charId) {
    // Remove old mesh if exists
    if (this.characterModel) {
      this.root.remove(this.characterModel.root);
    }

    const charConfig = CONFIG.CHARACTERS.find(c => c.id === charId) || CONFIG.CHARACTERS[0];
    this.characterModel = new CharacterModel(charConfig);
    this.root.add(this.characterModel.root);
  }

  createShieldMesh() {
    const geom = new THREE.SphereGeometry(1.25, 16, 12);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x00ffaa,
      transparent: true,
      opacity: 0.35,
      wireframe: true
    });
    this.shieldMesh = new THREE.Mesh(geom, mat);
    this.shieldMesh.position.y = 1.0;
    this.shieldMesh.visible = false;
    this.root.add(this.shieldMesh);
  }

  reset() {
    this.currentLane = CONFIG.LANE_CENTER;
    this.targetLane = CONFIG.LANE_CENTER;
    this.lateralX = 0;
    this.posY = CONFIG.GROUND_Y;
    this.velY = 0;
    this.isJumping = false;
    this.isGrounded = true;
    this.isSliding = false;
    this.slideTimer = 0;
    this.isDead = false;
    this.invulnerableTimer = 0;
    this.forwardSpeed = CONFIG.BASE_SPEED;
    this.distanceTraveled = 0;
    this.coinsCollected = 0;
    this.powerupsCollected = 0;

    // Reset powerups
    this.activePowerups = { magnet: 0, shield: 0, boost: 0, multiplier: 0 };
    this.hasActiveShield = false;
    if (this.shieldMesh) this.shieldMesh.visible = false;

    this.root.position.set(0, CONFIG.GROUND_Y, 0);

    if (this.characterModel) {
      this.characterModel.setAnimation('run');
      this.characterModel.root.rotation.set(0, 0, 0);
    }
  }

  // --- CONTROLS ---

  moveLeft() {
    if (this.isDead) return;
    if (this.targetLane > CONFIG.LANE_LEFT) {
      this.targetLane--;
      this.soundManager.playFootstep('stone');
    }
  }

  moveRight() {
    if (this.isDead) return;
    if (this.targetLane < CONFIG.LANE_RIGHT) {
      this.targetLane++;
      this.soundManager.playFootstep('stone');
    }
  }

  jump() {
    if (this.isDead) return;

    // Cancel slide immediately on jump
    if (this.isSliding) {
      this.isSliding = false;
      this.slideTimer = 0;
    }

    if (this.isGrounded) {
      this.isJumping = true;
      this.isGrounded = false;
      this.velY = CONFIG.JUMP_FORCE;
      this.characterModel.setAnimation('jump');
      this.soundManager.playJump();
    }
  }

  slide() {
    if (this.isDead) return;

    // If mid-air, fast dive to ground
    if (!this.isGrounded) {
      this.velY = -CONFIG.JUMP_FORCE * 1.5;
    }

    this.isSliding = true;
    this.slideTimer = CONFIG.SLIDE_DURATION;
    this.characterModel.setAnimation('slide');
    this.soundManager.playSlide();
  }

  // --- POWER-UPS ---

  activatePowerUp(type) {
    const pConfig = CONFIG.POWERUP[type.toUpperCase()];
    if (!pConfig) return;

    const upgradeLvl = this.saveManager.data.upgrades[type] || 1;
    const upgradeBonus = (upgradeLvl - 1) * (CONFIG.UPGRADES[type]?.durationBoostPerLevel || 2);
    
    // Character perks
    let charBonus = 0;
    if (type === 'shield' && this.characterModel.config.id === 'rex') {
      charBonus = 3.0; // Captain Rex bonus
    }

    const duration = pConfig.baseDuration + upgradeBonus + charBonus;
    this.activePowerups[type] = duration;
    this.powerupsCollected++;

    if (type === 'shield') {
      this.hasActiveShield = true;
      if (this.shieldMesh) this.shieldMesh.visible = true;
    }

    this.soundManager.playPowerUp();
  }

  // --- UPDATE LOOP ---

  update(dt) {
    if (this.isDead) {
      // Stumble animation continues until stop
      this.characterModel.update(dt, 0.4);
      return;
    }

    // 1. Forward Speed Ramping & Jungle Sprint Boost
    let speed = CONFIG.BASE_SPEED + (this.distanceTraveled * CONFIG.SPEED_RAMP_RATE);
    if (speed > CONFIG.MAX_SPEED) speed = CONFIG.MAX_SPEED;

    if (this.activePowerups.boost > 0) {
      speed *= CONFIG.POWERUP.BOOST.speedMultiplier;
      this.invulnerableTimer = 0.5; // Invulnerable during boost!
    }
    this.forwardSpeed = speed;

    // Advance forward (runner moves in -Z direction)
    const moveZ = this.forwardSpeed * dt;
    this.root.position.z -= moveZ;
    this.distanceTraveled += moveZ;

    // 2. Lateral Lane Transition (smooth spring interpolation)
    const targetX = CONFIG.LANES[this.targetLane];
    const diffX = targetX - this.lateralX;
    this.lateralX += diffX * Math.min(1.0, dt * CONFIG.LANE_SWITCH_SPEED);
    this.root.position.x = this.lateralX;

    // Body roll into turn
    const bankAngle = (diffX > 0.05 ? -CONFIG.LANE_SWITCH_ROLL : (diffX < -0.05 ? CONFIG.LANE_SWITCH_ROLL : 0));
    this.characterModel.setBankAngle(bankAngle);

    // 3. Jump Physics
    if (!this.isGrounded) {
      this.velY += CONFIG.GRAVITY * dt;
      this.posY += this.velY * dt;

      // Ground landing check
      if (this.posY <= CONFIG.GROUND_Y) {
        this.posY = CONFIG.GROUND_Y;
        this.velY = 0;
        this.isGrounded = true;
        this.isJumping = false;
        if (!this.isSliding) {
          this.characterModel.setAnimation('run');
        }
      }
    }
    this.root.position.y = this.posY;

    // 4. Slide Timer
    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
        if (this.isGrounded) {
          this.characterModel.setAnimation('run');
        }
      }
    }

    // 5. Power-up Countdowns
    for (const key in this.activePowerups) {
      if (this.activePowerups[key] > 0) {
        this.activePowerups[key] -= dt;
        if (this.activePowerups[key] <= 0) {
          this.activePowerups[key] = 0;
          if (key === 'shield') {
            this.hasActiveShield = false;
            if (this.shieldMesh) this.shieldMesh.visible = false;
          }
        }
      }
    }

    // Rotate shield visual
    if (this.hasActiveShield && this.shieldMesh) {
      this.shieldMesh.rotation.y += dt * 3.0;
      this.shieldMesh.rotation.x += dt * 1.5;
    }

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    // 6. Character Animation Tick
    const speedRatio = this.forwardSpeed / CONFIG.BASE_SPEED;
    this.characterModel.update(dt, speedRatio);

    // 7. Update Bounding Box for Collision
    this.updateBoundingBox();
  }

  updateBoundingBox() {
    const px = this.root.position.x;
    const py = this.root.position.y;
    const pz = this.root.position.z;

    const r = CONFIG.PLAYER_HIT_RADIUS;
    const h = this.isSliding ? CONFIG.SLIDE_BOX_HEIGHT : CONFIG.NORMAL_BOX_HEIGHT;

    this.hitMin.set(px - r, py, pz - r);
    this.hitMax.set(px + r, py + h, pz + r);
    this.box.set(this.hitMin, this.hitMax);
  }

  // Returns true if lethal crash, false if absorbed by shield/boost
  handleHitObstacle() {
    if (this.invulnerableTimer > 0 || this.activePowerups.boost > 0) {
      return false; // Smashed through with boost
    }

    if (this.hasActiveShield) {
      // Shield absorbs impact!
      this.hasActiveShield = false;
      this.activePowerups.shield = 0;
      if (this.shieldMesh) this.shieldMesh.visible = false;
      this.invulnerableTimer = 1.2; // Grace period after shield break
      this.soundManager.playShieldBreak();
      this.engine.triggerCameraShake(0.6);
      return false;
    }

    // Fatal Crash
    this.isDead = true;
    this.characterModel.setAnimation('stumble');
    this.soundManager.playCrash();
    this.engine.triggerCameraShake(1.0);
    return true;
  }
}
