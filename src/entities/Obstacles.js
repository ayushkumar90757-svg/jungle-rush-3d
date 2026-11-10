// JUNGLE RUSH 3D - POOLED 3D OBSTACLES (ROCKS, LOGS, FIRE TRAPS, ARCHWAYS, TOTEMS)
import * as THREE from 'three';
import { CONFIG } from '../config.js';

// Shared Materials & Geometries to minimize memory and GPU draw-calls
const logGeom = new THREE.CylinderGeometry(0.35, 0.4, 2.2, 8);
const logMat = new THREE.MeshLambertMaterial({ color: 0x5a3d28 });

const spikeMat = new THREE.MeshLambertMaterial({ color: 0x8a7d72 });
const stoneMat = new THREE.MeshLambertMaterial({ color: 0x6e6e66 });
const mossMat = new THREE.MeshLambertMaterial({ color: 0x2e5932 });

const flameMat = new THREE.MeshBasicMaterial({
  color: 0xff5500,
  transparent: true,
  opacity: 0.85
});

export class Obstacle {
  constructor(type) {
    this.type = type; // 'log', 'low_arch', 'boulder', 'fire_jet', 'spike_trap'
    this.mesh = new THREE.Group();
    this.box = new THREE.Box3();
    this.isActive = false;
    this.animTime = Math.random() * 10;

    this.build();
  }

  build() {
    switch (this.type) {
      case 'log':
        // Low jump obstacle (height ~0.8m)
        const logMesh = new THREE.Mesh(logGeom, logMat);
        logMesh.rotation.z = Math.PI / 2;
        logMesh.position.y = 0.35;
        logMesh.castShadow = true;
        this.mesh.add(logMesh);

        // Moss patch on top
        const mossGeom = new THREE.BoxGeometry(1.6, 0.08, 0.4);
        const mossMesh = new THREE.Mesh(mossGeom, mossMat);
        mossMesh.position.y = 0.7;
        this.mesh.add(mossMesh);
        break;

      case 'spike_trap':
        // Low ground spikes (requires jump)
        const baseGeom = new THREE.BoxGeometry(2.0, 0.1, 1.4);
        const baseMesh = new THREE.Mesh(baseGeom, stoneMat);
        baseMesh.position.y = 0.05;
        this.mesh.add(baseMesh);

        const spikeGeom = new THREE.ConeGeometry(0.12, 0.65, 4);
        for (let i = -0.7; i <= 0.7; i += 0.35) {
          for (let j = -0.4; j <= 0.4; j += 0.4) {
            const spike = new THREE.Mesh(spikeGeom, spikeMat);
            spike.position.set(i, 0.38, j);
            this.mesh.add(spike);
          }
        }
        break;

      case 'low_arch':
        // High obstacle (clearance under 0.7m, requires SLIDE)
        const archTopGeom = new THREE.BoxGeometry(2.4, 1.2, 0.6);
        const archTop = new THREE.Mesh(archTopGeom, stoneMat);
        archTop.position.y = 1.6; // Hangs between y=1.0 and y=2.2
        archTop.castShadow = true;
        this.mesh.add(archTop);

        // Left pillar
        const leftPillarGeom = new THREE.BoxGeometry(0.3, 2.2, 0.6);
        const leftPillar = new THREE.Mesh(leftPillarGeom, stoneMat);
        leftPillar.position.set(-1.1, 1.1, 0);
        this.mesh.add(leftPillar);

        // Right pillar
        const rightPillar = new THREE.Mesh(leftPillarGeom, stoneMat);
        rightPillar.position.set(1.1, 1.1, 0);
        this.mesh.add(rightPillar);

        // Hanging vines decoration
        const vineGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.7, 4);
        for (let v = -0.6; v <= 0.6; v += 0.4) {
          const vine = new THREE.Mesh(vineGeom, mossMat);
          vine.position.set(v, 0.85, 0);
          this.mesh.add(vine);
        }
        break;

      case 'fire_jet':
        // High obstacle: horizontal flaming beam (requires SLIDE)
        const burnerGeom = new THREE.CylinderGeometry(0.2, 0.25, 2.2, 6);
        const leftBurner = new THREE.Mesh(burnerGeom, stoneMat);
        leftBurner.position.set(-1.1, 1.1, 0);
        this.mesh.add(leftBurner);

        const rightBurner = new THREE.Mesh(burnerGeom, stoneMat);
        rightBurner.position.set(1.1, 1.1, 0);
        this.mesh.add(rightBurner);

        // Flame bar
        const flameGeom = new THREE.CylinderGeometry(0.3, 0.3, 2.1, 8);
        this.flameMesh = new THREE.Mesh(flameGeom, flameMat);
        this.flameMesh.rotation.z = Math.PI / 2;
        this.flameMesh.position.y = 1.35; // centered at 1.35m height
        this.mesh.add(this.flameMesh);
        break;

      case 'boulder':
        // Full lane blocker (requires EVADE)
        const bGeom = new THREE.DodecahedronGeometry(1.0, 1);
        const bMesh = new THREE.Mesh(bGeom, stoneMat);
        bMesh.position.y = 1.0;
        bMesh.scale.set(1.0, 1.1, 0.9);
        bMesh.castShadow = true;
        this.mesh.add(bMesh);

        // Moss cap
        const bMossGeom = new THREE.DodecahedronGeometry(0.7, 1);
        const bMoss = new THREE.Mesh(bMossGeom, mossMat);
        bMoss.position.set(0, 1.4, 0);
        this.mesh.add(bMoss);
        break;
    }
  }

  spawn(x, y, z) {
    this.mesh.position.set(x, y, z);
    this.mesh.visible = true;
    this.isActive = true;
    this.updateBoundingBox();
  }

  deactivate() {
    this.mesh.visible = false;
    this.isActive = false;
  }

  update(dt) {
    if (!this.isActive) return;

    this.animTime += dt;

    // Animate fire jet flicker
    if (this.type === 'fire_jet' && this.flameMesh) {
      const scale = 0.85 + Math.sin(this.animTime * 20) * 0.15;
      this.flameMesh.scale.set(scale, 1.0, scale);
    }
  }

  updateBoundingBox() {
    const pos = this.mesh.position;

    switch (this.type) {
      case 'log':
        // Low obstacle: Jump clears it (bounds y: 0 to 0.75)
        this.box.min.set(pos.x - 1.0, pos.y, pos.z - 0.4);
        this.box.max.set(pos.x + 1.0, pos.y + 0.75, pos.z + 0.4);
        break;

      case 'spike_trap':
        // Low spikes: Jump clears it
        this.box.min.set(pos.x - 0.9, pos.y, pos.z - 0.6);
        this.box.max.set(pos.x + 0.9, pos.y + 0.7, pos.z + 0.6);
        break;

      case 'low_arch':
        // High obstacle: Slide clears it (bounds y: 0.7 to 2.2)
        this.box.min.set(pos.x - 1.0, pos.y + 0.72, pos.z - 0.4);
        this.box.max.set(pos.x + 1.0, pos.y + 2.2, pos.z + 0.4);
        break;

      case 'fire_jet':
        // High fire: Slide clears it (bounds y: 0.75 to 2.0)
        this.box.min.set(pos.x - 0.95, pos.y + 0.75, pos.z - 0.4);
        this.box.max.set(pos.x + 0.95, pos.y + 2.0, pos.z + 0.4);
        break;

      case 'boulder':
        // Full height blocker: Cannot jump or slide through!
        this.box.min.set(pos.x - 0.95, pos.y, pos.z - 0.85);
        this.box.max.set(pos.x + 0.95, pos.y + 2.2, pos.z + 0.85);
        break;
    }
  }

  checkCollision(playerBox) {
    if (!this.isActive) return false;
    return this.box.intersectsBox(playerBox);
  }
}
