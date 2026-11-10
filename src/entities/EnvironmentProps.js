// JUNGLE RUSH 3D - PROCEDURAL JUNGLE PROPS (PALMS, TEMPLE PILLARS, TORCHES, WATER)
import * as THREE from 'three';

// Shared Materials
const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4d3319 });
const palmMat = new THREE.MeshLambertMaterial({ color: 0x228b22, side: THREE.DoubleSide });
const stoneMat = new THREE.MeshLambertMaterial({ color: 0x60605a });
const mossyStoneMat = new THREE.MeshLambertMaterial({ color: 0x3d5c3d });
const ropeMat = new THREE.MeshLambertMaterial({ color: 0x8b7355 });
const torchBaseMat = new THREE.MeshLambertMaterial({ color: 0x3d352e });
const flameMat = new THREE.MeshBasicMaterial({ color: 0xff7700 });

export class EnvironmentProps {
  // 1. Procedural Palm Tree with wind sway
  static createPalmTree() {
    const group = new THREE.Group();

    // Curved Trunk (stacked tapered cylinders for organic bend)
    const segments = 4;
    let currY = 0;
    let currX = 0;
    const trunkHeight = 6.5;

    for (let i = 0; i < segments; i++) {
      const segH = trunkHeight / segments;
      const bottomR = 0.45 - (i * 0.06);
      const topR = 0.39 - (i * 0.06);
      const segGeom = new THREE.CylinderGeometry(topR, bottomR, segH, 7);
      const segMesh = new THREE.Mesh(segGeom, trunkMat);

      segMesh.position.set(currX, currY + segH / 2, 0);
      segMesh.rotation.z = -0.06 * (i + 1);
      group.add(segMesh);

      currY += segH;
      currX += 0.25;
    }

    // Foliage Canopy (Crown of drooping tropical palm fronds)
    const frondCount = 7;
    const crown = new THREE.Group();
    crown.position.set(currX, currY, 0);

    for (let f = 0; f < frondCount; f++) {
      const angle = (f / frondCount) * Math.PI * 2;
      const frondGeom = new THREE.ConeGeometry(0.8, 4.2, 4);
      const frondMesh = new THREE.Mesh(frondGeom, palmMat);

      frondMesh.position.set(Math.cos(angle) * 1.8, -0.6, Math.sin(angle) * 1.8);
      frondMesh.rotation.x = Math.sin(angle) * 0.8;
      frondMesh.rotation.z = -Math.cos(angle) * 0.8;
      frondMesh.rotation.y = angle;
      crown.add(frondMesh);
    }
    group.add(crown);
    group.crown = crown; // store reference for wind sway

    return group;
  }

  // 2. Ancient Carved Temple Pillar
  static createTemplePillar() {
    const group = new THREE.Group();

    // Base plinth
    const baseGeom = new THREE.BoxGeometry(1.2, 0.4, 1.2);
    const baseMesh = new THREE.Mesh(baseGeom, stoneMat);
    baseMesh.position.y = 0.2;
    group.add(baseMesh);

    // Pillar shaft
    const shaftGeom = new THREE.CylinderGeometry(0.4, 0.45, 5.0, 8);
    const shaftMesh = new THREE.Mesh(shaftGeom, mossyStoneMat);
    shaftMesh.position.y = 2.7;
    group.add(shaftMesh);

    // Capital on top
    const capGeom = new THREE.BoxGeometry(1.1, 0.35, 1.1);
    const capMesh = new THREE.Mesh(capGeom, stoneMat);
    capMesh.position.y = 5.35;
    group.add(capMesh);

    return group;
  }

  // 3. Ancient Stone Brazier / Torch
  static createTorch() {
    const group = new THREE.Group();

    // Stand
    const standGeom = new THREE.CylinderGeometry(0.2, 0.35, 1.8, 6);
    const standMesh = new THREE.Mesh(standGeom, torchBaseMat);
    standMesh.position.y = 0.9;
    group.add(standMesh);

    // Bowl
    const bowlGeom = new THREE.CylinderGeometry(0.4, 0.2, 0.3, 6);
    const bowlMesh = new THREE.Mesh(bowlGeom, torchBaseMat);
    bowlMesh.position.y = 1.9;
    group.add(bowlMesh);

    // Animated Flame Mesh
    const flameGeom = new THREE.ConeGeometry(0.18, 0.5, 6);
    const flameMesh = new THREE.Mesh(flameGeom, flameMat);
    flameMesh.position.y = 2.2;
    group.add(flameMesh);
    group.flame = flameMesh;

    return group;
  }

  // 4. Rope Bridge Railing Segment (length 50m)
  static createBridgeRailings(length = 50) {
    const group = new THREE.Group();
    const postSpacing = 5.0;
    const postCount = Math.floor(length / postSpacing);

    const postGeom = new THREE.CylinderGeometry(0.12, 0.15, 1.4, 6);

    for (let side = -1; side <= 1; side += 2) {
      const sideX = side * 3.8;

      // Posts
      for (let i = 0; i <= postCount; i++) {
        const postZ = -i * postSpacing;
        const post = new THREE.Mesh(postGeom, trunkMat);
        post.position.set(sideX, 0.7, postZ);
        group.add(post);
      }

      // Upper Rope
      const ropeGeom = new THREE.CylinderGeometry(0.04, 0.04, length, 6);
      const ropeMesh = new THREE.Mesh(ropeGeom, ropeMat);
      ropeMesh.rotation.x = Math.PI / 2;
      ropeMesh.position.set(sideX, 1.3, -length / 2);
      group.add(ropeMesh);
    }

    return group;
  }
}
