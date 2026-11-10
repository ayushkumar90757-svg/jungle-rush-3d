// JUNGLE RUSH 3D - POOLED 3D GOLD COINS & POWER-UP CRYSTALS
import * as THREE from 'three';
import { CONFIG } from '../config.js';

// Pre-create shared geometries and materials for instant batch rendering
const coinGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 12);
const coinMat = new THREE.MeshStandardMaterial({
  color: 0xffcc00,
  metalness: 0.85,
  roughness: 0.25,
  emissive: 0x443300
});

// Coin inner rim
const rimGeom = new THREE.TorusGeometry(0.25, 0.04, 6, 12);
const rimMat = new THREE.MeshStandardMaterial({
  color: 0xffaa00,
  metalness: 0.9,
  roughness: 0.2
});

export class Coin {
  constructor() {
    this.mesh = new THREE.Group();
    
    const coinDisc = new THREE.Mesh(coinGeom, coinMat);
    coinDisc.rotation.x = Math.PI / 2;
    this.mesh.add(coinDisc);

    const rim = new THREE.Mesh(rimGeom, rimMat);
    this.mesh.add(rim);

    this.isActive = false;
    this.isCollected = false;
    this.animTime = Math.random() * Math.PI * 2;
    this.baseY = 0.5;

    // Radius for collection sphere
    this.collectRadius = 0.85;
  }

  spawn(x, y, z) {
    this.baseY = y;
    this.mesh.position.set(x, y, z);
    this.mesh.visible = true;
    this.isActive = true;
    this.isCollected = false;
  }

  deactivate() {
    this.mesh.visible = false;
    this.isActive = false;
  }

  update(dt, playerPos, magnetActive, magnetRadius) {
    if (!this.isActive || this.isCollected) return;

    this.animTime += dt * 4.0;
    this.mesh.rotation.y = this.animTime;
    this.mesh.position.y = this.baseY + Math.sin(this.animTime * 2.0) * 0.08;

    // Magnet Power-up Attraction
    if (magnetActive) {
      const dx = playerPos.x - this.mesh.position.x;
      const dy = (playerPos.y + 0.8) - this.mesh.position.y;
      const dz = playerPos.z - this.mesh.position.z;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < magnetRadius * magnetRadius) {
        // Fly swiftly toward runner
        const pullSpeed = 28.0 * dt;
        const dist = Math.sqrt(distSq);
        if (dist > 0.01) {
          this.mesh.position.x += (dx / dist) * pullSpeed;
          this.mesh.position.y += (dy / dist) * pullSpeed;
          this.mesh.position.z += (dz / dist) * pullSpeed;
        }
      }
    }
  }

  checkPlayerCollision(playerPos, playerHitRadius) {
    if (!this.isActive || this.isCollected) return false;

    const dx = playerPos.x - this.mesh.position.x;
    const dy = (playerPos.y + 0.9) - this.mesh.position.y;
    const dz = playerPos.z - this.mesh.position.z;
    const distSq = dx * dx + dy * dy + dz * dz;

    const combinedRadius = this.collectRadius + playerHitRadius;
    if (distSq < combinedRadius * combinedRadius) {
      this.isCollected = true;
      this.deactivate();
      return true;
    }
    return false;
  }
}

// POWER-UP PICKUPS
export class PowerUpItem {
  constructor(type) {
    this.type = type; // 'magnet', 'shield', 'boost', 'multiplier'
    this.mesh = new THREE.Group();
    this.isActive = false;
    this.animTime = Math.random() * 5;
    this.baseY = 0.9;
    this.collectRadius = 1.0;

    this.build();
  }

  build() {
    const pConfig = CONFIG.POWERUP[this.type.toUpperCase()];
    const color = pConfig.color;

    // Central glowing crystal
    const crystalGeom = new THREE.OctahedronGeometry(0.45, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.5
    });
    this.crystal = new THREE.Mesh(crystalGeom, crystalMat);
    this.mesh.add(this.crystal);

    // Orbiting halo ring
    const ringGeom = new THREE.TorusGeometry(0.65, 0.04, 6, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.75
    });
    this.ring = new THREE.Mesh(ringGeom, ringMat);
    this.ring.rotation.x = Math.PI / 3;
    this.mesh.add(this.ring);
  }

  spawn(x, y, z) {
    this.baseY = y;
    this.mesh.position.set(x, y, z);
    this.mesh.visible = true;
    this.isActive = true;
  }

  deactivate() {
    this.mesh.visible = false;
    this.isActive = false;
  }

  update(dt) {
    if (!this.isActive) return;

    this.animTime += dt * 3.0;
    this.crystal.rotation.y = this.animTime;
    this.crystal.rotation.x = Math.sin(this.animTime * 0.7) * 0.3;
    this.ring.rotation.z = -this.animTime * 1.5;
    this.mesh.position.y = this.baseY + Math.sin(this.animTime * 1.8) * 0.12;
  }

  checkPlayerCollision(playerPos, playerHitRadius) {
    if (!this.isActive) return false;

    const dx = playerPos.x - this.mesh.position.x;
    const dy = (playerPos.y + 0.9) - this.mesh.position.y;
    const dz = playerPos.z - this.mesh.position.z;
    const distSq = dx * dx + dy * dy + dz * dz;

    const combinedRadius = this.collectRadius + playerHitRadius;
    if (distSq < combinedRadius * combinedRadius) {
      this.deactivate();
      return true;
    }
    return false;
  }
}
