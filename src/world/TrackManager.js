// JUNGLE RUSH 3D - ENDLESS CHUNK-BASED TRACK MANAGER & SPAWNER
import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { Obstacle } from '../entities/Obstacles.js';
import { Coin, PowerUpItem } from '../entities/Collectibles.js';
import { EnvironmentProps } from '../entities/EnvironmentProps.js';

// Shared track materials
const stoneRoadMat = new THREE.MeshLambertMaterial({ color: 0x474740 });
const mossBorderMat = new THREE.MeshLambertMaterial({ color: 0x224422 });
const woodBridgeMat = new THREE.MeshLambertMaterial({ color: 0x5a3e28 });
const waterMat = new THREE.MeshStandardMaterial({
  color: 0x1b4d3e,
  roughness: 0.1,
  metalness: 0.8,
  transparent: true,
  opacity: 0.8
});

export class TrackChunk {
  constructor(index, type = 'stone') {
    this.index = index;
    this.type = type; // 'stone', 'bridge', 'ruins'
    this.mesh = new THREE.Group();
    this.length = CONFIG.CHUNK_LENGTH;
    this.zStart = 0;
    this.zEnd = -CONFIG.CHUNK_LENGTH;

    // References to attached obstacles, coins, powerups
    this.obstacles = [];
    this.coins = [];
    this.powerups = [];
    this.decorations = [];

    this.buildChunkMesh();
  }

  buildChunkMesh() {
    const w = 7.6; // Width of 3 lanes plus side verges
    const l = this.length;

    if (this.type === 'stone' || this.type === 'ruins') {
      // Main stone roadway
      const roadGeom = new THREE.BoxGeometry(w, 0.4, l);
      const road = new THREE.Mesh(roadGeom, stoneRoadMat);
      road.position.set(0, -0.2, -l / 2);
      road.receiveShadow = true;
      this.mesh.add(road);

      // Flanking moss curbs
      const curbGeom = new THREE.BoxGeometry(0.8, 0.6, l);
      const leftCurb = new THREE.Mesh(curbGeom, mossBorderMat);
      leftCurb.position.set(-w / 2 - 0.4, -0.1, -l / 2);
      this.mesh.add(leftCurb);

      const rightCurb = new THREE.Mesh(curbGeom, mossBorderMat);
      rightCurb.position.set(w / 2 + 0.4, -0.1, -l / 2);
      this.mesh.add(rightCurb);

      // Flanking Jungle Props: Palms, Pillars & Torches
      for (let z = -6; z >= -l + 6; z -= 14) {
        // Left Palm
        const palmL = EnvironmentProps.createPalmTree();
        palmL.position.set(-5.5 - Math.random() * 1.5, 0, z);
        this.mesh.add(palmL);
        this.decorations.push(palmL);

        // Right Palm
        const palmR = EnvironmentProps.createPalmTree();
        palmR.position.set(5.5 + Math.random() * 1.5, 0, z - 4);
        palmR.rotation.y = Math.PI;
        this.mesh.add(palmR);
        this.decorations.push(palmR);

        // Stone Pillar / Torches
        if (Math.random() > 0.4) {
          const pillar = EnvironmentProps.createTemplePillar();
          pillar.position.set(-4.5, 0, z - 7);
          this.mesh.add(pillar);
        } else {
          const torch = EnvironmentProps.createTorch();
          torch.position.set(4.5, 0, z - 7);
          this.mesh.add(torch);
          this.decorations.push(torch);
        }
      }

    } else if (this.type === 'bridge') {
      // Narrow suspended wooden rope bridge over chasm
      const plankCount = 25;
      const plankSpacing = l / plankCount;
      const plankGeom = new THREE.BoxGeometry(w * 0.9, 0.25, plankSpacing * 0.85);

      for (let i = 0; i < plankCount; i++) {
        // Slight organic vertical wobble
        const plank = new THREE.Mesh(plankGeom, woodBridgeMat);
        const plankZ = -i * plankSpacing - (plankSpacing / 2);
        const sag = Math.sin((i / plankCount) * Math.PI) * 0.3; // subtle bridge sag
        plank.position.set(0, -0.12 - sag, plankZ);
        this.mesh.add(plank);
      }

      // Rope bridge railings
      const railings = EnvironmentProps.createBridgeRailings(l);
      railings.position.set(0, 0, 0);
      this.mesh.add(railings);

      // River / Gorge far below (y = -8)
      const riverGeom = new THREE.PlaneGeometry(60, l);
      const river = new THREE.Mesh(riverGeom, waterMat);
      river.rotation.x = -Math.PI / 2;
      river.position.set(0, -9.0, -l / 2);
      this.mesh.add(river);
    }
  }

  setPosition(z) {
    this.zStart = z;
    this.zEnd = z - this.length;
    this.mesh.position.set(0, 0, z);
  }
}

export class TrackManager {
  constructor(engine, playerController, soundManager, particleManager) {
    this.engine = engine;
    this.player = playerController;
    this.soundManager = soundManager;
    this.particles = particleManager;

    this.chunks = [];
    this.nextChunkZ = 0;

    // Obstacle and Collectible Pools
    this.obstaclePool = [];
    this.coinPool = [];
    this.powerupPool = [];

    this.distanceSinceLastPowerup = 0;
    this.windTime = 0;

    this.initPools();
    this.initStartingChunks();
  }

  initPools() {
    // 1. Obstacle Pool (Logs, arches, boulders, fire jets, spikes)
    const types = ['log', 'low_arch', 'boulder', 'fire_jet', 'spike_trap'];
    for (let i = 0; i < 25; i++) {
      const type = types[i % types.length];
      const obs = new Obstacle(type);
      obs.deactivate();
      this.engine.scene.add(obs.mesh);
      this.obstaclePool.push(obs);
    }

    // 2. Coin Pool (90 coins)
    for (let i = 0; i < 90; i++) {
      const coin = new Coin();
      coin.deactivate();
      this.engine.scene.add(coin.mesh);
      this.coinPool.push(coin);
    }

    // 3. Power-up Pool (12 items)
    const pTypes = ['magnet', 'shield', 'boost', 'multiplier'];
    for (let i = 0; i < 12; i++) {
      const pItem = new PowerUpItem(pTypes[i % pTypes.length]);
      pItem.deactivate();
      this.engine.scene.add(pItem.mesh);
      this.powerupPool.push(pItem);
    }
  }

  initStartingChunks() {
    // Spawn initial chain of chunks
    this.nextChunkZ = 0;
    for (let i = 0; i < CONFIG.ACTIVE_CHUNKS; i++) {
      // First 2 chunks are safe runway with no obstacles
      const type = (i % 3 === 2) ? 'bridge' : 'stone';
      const chunk = new TrackChunk(i, type);
      chunk.setPosition(this.nextChunkZ);
      this.engine.scene.add(chunk.mesh);
      this.chunks.push(chunk);

      if (i >= 2) {
        this.populateChunk(chunk);
      } else {
        // Just starter coins on runway
        this.spawnCoinLine(CONFIG.LANE_CENTER, this.nextChunkZ - 15, 6);
      }

      this.nextChunkZ -= CONFIG.CHUNK_LENGTH;
    }
  }

  reset() {
    // Deactivate all obstacles, coins, and powerups
    this.obstaclePool.forEach(o => o.deactivate());
    this.coinPool.forEach(c => c.deactivate());
    this.powerupPool.forEach(p => p.deactivate());

    // Reset chunks to beginning
    this.nextChunkZ = 0;
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      chunk.setPosition(this.nextChunkZ);
      if (i >= 2) {
        this.populateChunk(chunk);
      } else {
        this.spawnCoinLine(CONFIG.LANE_CENTER, this.nextChunkZ - 15, 6);
      }
      this.nextChunkZ -= CONFIG.CHUNK_LENGTH;
    }

    this.distanceSinceLastPowerup = 0;
  }

  populateChunk(chunk) {
    const chunkZ = chunk.zStart;
    const l = CONFIG.CHUNK_LENGTH;

    // Obstacle placement patterns (2 patterns per 50m chunk)
    const zOffsets = [-15, -34];

    zOffsets.forEach(offsetZ => {
      const worldZ = chunkZ + offsetZ;
      const patternChoice = Math.random();

      if (patternChoice < 0.28) {
        // Pattern 1: Low obstacle in one lane + coins jump arc
        const lane = Math.floor(Math.random() * 3);
        const obs = this.getFreeObstacle(Math.random() > 0.5 ? 'log' : 'spike_trap');
        if (obs) obs.spawn(CONFIG.LANES[lane], CONFIG.GROUND_Y, worldZ);
        this.spawnCoinArc(lane, worldZ);

      } else if (patternChoice < 0.55) {
        // Pattern 2: High obstacle in one lane + slide trail
        const lane = Math.floor(Math.random() * 3);
        const obs = this.getFreeObstacle(Math.random() > 0.4 ? 'low_arch' : 'fire_jet');
        if (obs) obs.spawn(CONFIG.LANES[lane], CONFIG.GROUND_Y, worldZ);
        this.spawnCoinLine(lane, worldZ - 3, 4, 0.4);

      } else if (patternChoice < 0.82) {
        // Pattern 3: Giant Boulder blocking 1 or 2 lanes (requires evade)
        const blockedLane = Math.floor(Math.random() * 3);
        const obs = this.getFreeObstacle('boulder');
        if (obs) obs.spawn(CONFIG.LANES[blockedLane], CONFIG.GROUND_Y, worldZ);

        // Put coins in the open adjacent lane
        const openLane = (blockedLane + 1) % 3;
        this.spawnCoinLine(openLane, worldZ - 4, 5);

      } else {
        // Pattern 4: Full coin highway
        const lane = Math.floor(Math.random() * 3);
        this.spawnCoinLine(lane, worldZ - 8, 7);
      }
    });

    // Power-up spawner check (every ~180 meters)
    this.distanceSinceLastPowerup += l;
    if (this.distanceSinceLastPowerup > 180 && Math.random() > 0.3) {
      const pTypes = ['magnet', 'shield', 'boost', 'multiplier'];
      const pType = pTypes[Math.floor(Math.random() * pTypes.length)];
      const pItem = this.getFreePowerUp(pType);
      if (pItem) {
        const lane = Math.floor(Math.random() * 3);
        pItem.spawn(CONFIG.LANES[lane], 0.9, chunkZ - 25);
        this.distanceSinceLastPowerup = 0;
      }
    }
  }

  // --- SPAWN HELPERS ---

  spawnCoinLine(laneIdx, startZ, count = 5, y = 0.5) {
    const x = CONFIG.LANES[laneIdx];
    const spacing = 2.4;
    for (let i = 0; i < count; i++) {
      const coin = this.getFreeCoin();
      if (coin) {
        coin.spawn(x, y, startZ - (i * spacing));
      }
    }
  }

  spawnCoinArc(laneIdx, centerZ) {
    const x = CONFIG.LANES[laneIdx];
    const coinCount = 5;
    const spacing = 2.2;
    const startZ = centerZ + (spacing * 2);

    for (let i = 0; i < coinCount; i++) {
      const coin = this.getFreeCoin();
      if (coin) {
        // Parabolic arc: peaks at center over obstacle
        const t = (i / (coinCount - 1)) * 2 - 1; // -1 to 1
        const arcY = 0.5 + (1 - t * t) * 1.8; // peaks at 2.3m
        coin.spawn(x, arcY, startZ - (i * spacing));
      }
    }
  }

  getFreeObstacle(type) {
    return this.obstaclePool.find(o => !o.isActive && o.type === type) 
        || this.obstaclePool.find(o => !o.isActive);
  }

  getFreeCoin() {
    return this.coinPool.find(c => !c.isActive);
  }

  getFreePowerUp(type) {
    return this.powerupPool.find(p => !p.isActive && p.type === type)
        || this.powerupPool.find(p => !p.isActive);
  }

  // --- UPDATE & RECYCLE ---

  update(dt) {
    const playerZ = this.player.root.position.z;
    const playerPos = this.player.root.position;
    this.windTime += dt * 2.0;

    // 1. Recycle chunks that have fallen behind player
    const oldestChunk = this.chunks[0];
    if (oldestChunk.zEnd > playerZ + CONFIG.DESPAWN_BEHIND_DISTANCE) {
      // Chunk is behind: remove from front, reposition at the very end
      this.chunks.shift();
      oldestChunk.setPosition(this.nextChunkZ);
      this.populateChunk(oldestChunk);
      this.chunks.push(oldestChunk);
      this.nextChunkZ -= CONFIG.CHUNK_LENGTH;
    }

    // 2. Animate palm fronds & torches
    this.chunks.forEach(chunk => {
      chunk.decorations.forEach(dec => {
        if (dec.crown) {
          dec.crown.rotation.z = Math.sin(this.windTime + dec.position.z * 0.1) * 0.05;
        }
        if (dec.flame) {
          dec.flame.scale.y = 0.9 + Math.sin(this.windTime * 8 + dec.position.z) * 0.2;
        }
      });
    });

    // 3. Update & check Obstacle Collisions
    for (let i = 0; i < this.obstaclePool.length; i++) {
      const obs = this.obstaclePool[i];
      if (!obs.isActive) continue;

      obs.update(dt);

      // Despawn if passed far behind
      if (obs.mesh.position.z > playerZ + CONFIG.DESPAWN_BEHIND_DISTANCE) {
        obs.deactivate();
        continue;
      }

      // Check collision only if obstacle is close to player (within 3 meters)
      const dz = Math.abs(obs.mesh.position.z - playerZ);
      if (dz < 2.5) {
        if (obs.checkCollision(this.player.box)) {
          const fatal = this.player.handleHitObstacle();
          if (!fatal) {
            // Obstacle was pulverized by shield or boost!
            this.particles.emitShieldShockwave(obs.mesh.position.x, obs.mesh.position.y, obs.mesh.position.z);
            obs.deactivate();
          }
        }
      }
    }

    // 4. Update & check Coin Collections
    const magnetActive = this.player.activePowerups.magnet > 0;
    const magnetRadius = CONFIG.POWERUP.MAGNET.radius * (this.player.characterModel.config.id === 'maya' ? 1.2 : 1.0);

    for (let i = 0; i < this.coinPool.length; i++) {
      const coin = this.coinPool[i];
      if (!coin.isActive) continue;

      coin.update(dt, playerPos, magnetActive, magnetRadius);

      // Despawn behind
      if (coin.mesh.position.z > playerZ + CONFIG.DESPAWN_BEHIND_DISTANCE) {
        coin.deactivate();
        continue;
      }

      // Proximity check for pickup
      if (coin.checkPlayerCollision(playerPos, CONFIG.PLAYER_HIT_RADIUS)) {
        const mult = (this.player.activePowerups.multiplier > 0) ? CONFIG.POWERUP.MULTIPLIER.multiplier : 1;
        this.player.coinsCollected += 1 * mult;
        this.soundManager.playCoin();
        this.particles.emitCoinSparkle(coin.mesh.position.x, coin.mesh.position.y, coin.mesh.position.z);
      }
    }

    // 5. Update & check Power-Up Pickups
    for (let i = 0; i < this.powerupPool.length; i++) {
      const pItem = this.powerupPool[i];
      if (!pItem.isActive) continue;

      pItem.update(dt);

      // Despawn behind
      if (pItem.mesh.position.z > playerZ + CONFIG.DESPAWN_BEHIND_DISTANCE) {
        pItem.deactivate();
        continue;
      }

      if (pItem.checkPlayerCollision(playerPos, CONFIG.PLAYER_HIT_RADIUS)) {
        this.player.activatePowerUp(pItem.type);
        this.particles.emit(pItem.mesh.position.x, pItem.mesh.position.y, pItem.mesh.position.z, 25, 0.2, 0.8, 1.0, 5.0, 0.4);
      }
    }
  }
}
