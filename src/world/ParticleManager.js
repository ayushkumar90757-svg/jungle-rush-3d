// JUNGLE RUSH 3D - HIGH-PERFORMANCE POOLED PARTICLE SYSTEM
import * as THREE from 'three';

const MAX_PARTICLES = 160; // Optimized budget for 60 FPS on low-end devices

export class ParticleManager {
  constructor(scene) {
    this.scene = scene;

    // Buffer geometry for all instanced particles
    this.positions = new Float32Array(MAX_PARTICLES * 3);
    this.velocities = new Float32Array(MAX_PARTICLES * 3);
    this.colors = new Float32Array(MAX_PARTICLES * 3);
    this.lifespans = new Float32Array(MAX_PARTICLES);
    this.maxLifespans = new Float32Array(MAX_PARTICLES);
    this.sizes = new Float32Array(MAX_PARTICLES);

    this.activeCount = 0;

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    // Particle Material
    this.material = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.scene.add(this.points);

    // Initial position all out of sight
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.positions[i * 3 + 1] = -1000;
      this.lifespans[i] = 0;
    }
    this.geometry.attributes.position.needsUpdate = true;
  }

  emit(x, y, z, count = 10, r = 1, g = 0.8, b = 0.2, speed = 3.0, size = 0.35) {
    for (let c = 0; c < count; c++) {
      // Find inactive or oldest slot
      let slot = -1;
      for (let i = 0; i < MAX_PARTICLES; i++) {
        if (this.lifespans[i] <= 0) {
          slot = i;
          break;
        }
      }
      if (slot === -1) slot = Math.floor(Math.random() * MAX_PARTICLES);

      const i3 = slot * 3;
      this.positions[i3] = x;
      this.positions[i3 + 1] = y;
      this.positions[i3 + 2] = z;

      // Random spherical velocity
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const spd = speed * (0.5 + Math.random() * 0.7);

      this.velocities[i3] = Math.sin(phi) * Math.cos(theta) * spd;
      this.velocities[i3 + 1] = Math.abs(Math.cos(phi)) * spd + 1.0; // upward bias
      this.velocities[i3 + 2] = Math.sin(phi) * Math.sin(theta) * spd;

      this.colors[i3] = r;
      this.colors[i3 + 1] = g;
      this.colors[i3 + 2] = b;

      this.lifespans[slot] = 0.6 + Math.random() * 0.4;
      this.maxLifespans[slot] = this.lifespans[slot];
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  }

  emitCoinSparkle(x, y, z) {
    this.emit(x, y, z, 14, 1.0, 0.85, 0.1, 4.5, 0.4);
  }

  emitSlideDust(x, y, z) {
    this.emit(x, y, z, 4, 0.7, 0.6, 0.4, 1.8, 0.25);
  }

  emitShieldShockwave(x, y, z) {
    this.emit(x, y + 1.0, z, 30, 0.1, 1.0, 0.6, 7.0, 0.5);
  }

  update(dt) {
    let hasChanges = false;

    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (this.lifespans[i] > 0) {
        this.lifespans[i] -= dt;
        const i3 = i * 3;

        // Apply physics
        this.positions[i3] += this.velocities[i3] * dt;
        this.positions[i3 + 1] += this.velocities[i3 + 1] * dt;
        this.positions[i3 + 2] += this.velocities[i3 + 2] * dt;

        // Gravity on particles
        this.velocities[i3 + 1] -= 9.8 * dt;

        if (this.lifespans[i] <= 0) {
          this.positions[i3 + 1] = -1000; // hide
        }

        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.geometry.attributes.position.needsUpdate = true;
    }
  }

  reset() {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.lifespans[i] = 0;
      this.positions[i * 3 + 1] = -1000;
    }
    this.geometry.attributes.position.needsUpdate = true;
  }
}
