// JUNGLE RUSH 3D - ARTICULATED 3D CHARACTER SYSTEM & PROCEDURAL ANIMATION
import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class CharacterModel {
  constructor(characterConfig) {
    this.config = characterConfig;
    this.root = new THREE.Group();

    // Joint references for procedural animation
    this.joints = {
      hips: null,
      torso: null,
      head: null,
      leftArm: null,
      rightArm: null,
      leftForearm: null,
      rightForearm: null,
      leftLeg: null,
      rightLeg: null,
      leftShin: null,
      rightShin: null
    };

    this.animTime = 0;
    this.currentAnim = 'run'; // 'run', 'jump', 'slide', 'stumble', 'idle'
    this.slideProgress = 0;

    this.buildMesh();
  }

  buildMesh() {
    const c = this.config.colors;

    // Shared materials
    const skinMat = new THREE.MeshLambertMaterial({ color: c.skin });
    const shirtMat = new THREE.MeshLambertMaterial({ color: c.shirt });
    const pantsMat = new THREE.MeshLambertMaterial({ color: c.pants });
    const bootsMat = new THREE.MeshLambertMaterial({ color: c.boots });
    const hatMat = new THREE.MeshLambertMaterial({ color: c.hat });
    const hairMat = new THREE.MeshLambertMaterial({ color: c.hair });

    // HIPS / ROOT BONE
    const hips = new THREE.Group();
    hips.position.y = 0.95; // Hip height
    this.root.add(hips);
    this.joints.hips = hips;

    // Pelvis mesh
    const pelvisGeom = new THREE.BoxGeometry(0.38, 0.22, 0.28);
    const pelvisMesh = new THREE.Mesh(pelvisGeom, pantsMat);
    pelvisMesh.castShadow = true;
    hips.add(pelvisMesh);

    // TORSO
    const torso = new THREE.Group();
    torso.position.y = 0.12;
    hips.add(torso);
    this.joints.torso = torso;

    const torsoGeom = new THREE.BoxGeometry(0.44, 0.5, 0.3);
    const torsoMesh = new THREE.Mesh(torsoGeom, shirtMat);
    torsoMesh.position.y = 0.25;
    torsoMesh.castShadow = true;
    torso.add(torsoMesh);

    // Backpack / Adventure pack
    const packGeom = new THREE.BoxGeometry(0.32, 0.38, 0.16);
    const packMat = new THREE.MeshLambertMaterial({ color: 0x4a3219 });
    const packMesh = new THREE.Mesh(packGeom, packMat);
    packMesh.position.set(0, 0.25, -0.22);
    torso.add(packMesh);

    // HEAD
    const head = new THREE.Group();
    head.position.y = 0.55;
    torso.add(head);
    this.joints.head = head;

    const headGeom = new THREE.BoxGeometry(0.28, 0.3, 0.28);
    const headMesh = new THREE.Mesh(headGeom, skinMat);
    headMesh.position.y = 0.15;
    headMesh.castShadow = true;
    head.add(headMesh);

    // Hair
    const hairGeom = new THREE.BoxGeometry(0.3, 0.12, 0.3);
    const hairMesh = new THREE.Mesh(hairGeom, hairMat);
    hairMesh.position.y = 0.28;
    head.add(hairMesh);

    // Character-specific Headgear
    if (this.config.id === 'dash') {
      // Fedora hat brim + crown
      const brimGeom = new THREE.CylinderGeometry(0.36, 0.38, 0.04, 8);
      const brimMesh = new THREE.Mesh(brimGeom, hatMat);
      brimMesh.position.y = 0.3;
      brimMesh.rotation.x = 0.08;
      head.add(brimMesh);

      const crownGeom = new THREE.BoxGeometry(0.24, 0.16, 0.26);
      const crownMesh = new THREE.Mesh(crownGeom, hatMat);
      crownMesh.position.y = 0.38;
      head.add(crownMesh);
    } else if (this.config.id === 'maya') {
      // Golden tribal headband with feather
      const bandGeom = new THREE.BoxGeometry(0.31, 0.06, 0.31);
      const bandMesh = new THREE.Mesh(bandGeom, hatMat);
      bandMesh.position.y = 0.22;
      head.add(bandMesh);

      const featherGeom = new THREE.ConeGeometry(0.04, 0.25, 4);
      const featherMat = new THREE.MeshLambertMaterial({ color: 0x00ffff });
      const featherMesh = new THREE.Mesh(featherGeom, featherMat);
      featherMesh.position.set(-0.16, 0.32, -0.05);
      featherMesh.rotation.z = 0.3;
      head.add(featherMesh);
    } else if (this.config.id === 'rex') {
      // Tactical beret
      const beretGeom = new THREE.CylinderGeometry(0.24, 0.28, 0.1, 8);
      const beretMesh = new THREE.Mesh(beretGeom, hatMat);
      beretMesh.position.set(0.05, 0.32, 0);
      beretMesh.rotation.z = -0.2;
      head.add(beretMesh);
    }

    // ARMS
    const armGeom = new THREE.BoxGeometry(0.12, 0.3, 0.12);
    const forearmGeom = new THREE.BoxGeometry(0.1, 0.28, 0.1);

    // Left Arm
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.3, 0.45, 0);
    torso.add(leftArm);
    this.joints.leftArm = leftArm;

    const leftArmMesh = new THREE.Mesh(armGeom, shirtMat);
    leftArmMesh.position.y = -0.15;
    leftArmMesh.castShadow = true;
    leftArm.add(leftArmMesh);

    const leftForearm = new THREE.Group();
    leftForearm.position.y = -0.3;
    leftArm.add(leftForearm);
    this.joints.leftForearm = leftForearm;

    const leftForeMesh = new THREE.Mesh(forearmGeom, skinMat);
    leftForeMesh.position.y = -0.14;
    leftForeMesh.castShadow = true;
    leftForearm.add(leftForeMesh);

    // Right Arm
    const rightArm = new THREE.Group();
    rightArm.position.set(0.3, 0.45, 0);
    torso.add(rightArm);
    this.joints.rightArm = rightArm;

    const rightArmMesh = new THREE.Mesh(armGeom, shirtMat);
    rightArmMesh.position.y = -0.15;
    rightArmMesh.castShadow = true;
    rightArm.add(rightArmMesh);

    const rightForearm = new THREE.Group();
    rightForearm.position.y = -0.3;
    rightArm.add(rightForearm);
    this.joints.rightForearm = rightForearm;

    const rightForeMesh = new THREE.Mesh(forearmGeom, skinMat);
    rightForeMesh.position.y = -0.14;
    rightForeMesh.castShadow = true;
    rightForearm.add(rightForeMesh);

    // LEGS
    const thighGeom = new THREE.BoxGeometry(0.16, 0.45, 0.18);
    const shinGeom = new THREE.BoxGeometry(0.14, 0.42, 0.16);
    const bootGeom = new THREE.BoxGeometry(0.16, 0.16, 0.26);

    // Left Leg
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.13, -0.1, 0);
    hips.add(leftLeg);
    this.joints.leftLeg = leftLeg;

    const leftThighMesh = new THREE.Mesh(thighGeom, pantsMat);
    leftThighMesh.position.y = -0.22;
    leftThighMesh.castShadow = true;
    leftLeg.add(leftThighMesh);

    const leftShin = new THREE.Group();
    leftShin.position.y = -0.45;
    leftLeg.add(leftShin);
    this.joints.leftShin = leftShin;

    const leftShinMesh = new THREE.Mesh(shinGeom, pantsMat);
    leftShinMesh.position.y = -0.21;
    leftShinMesh.castShadow = true;
    leftShin.add(leftShinMesh);

    const leftBootMesh = new THREE.Mesh(bootGeom, bootsMat);
    leftBootMesh.position.set(0, -0.38, 0.04);
    leftBootMesh.castShadow = true;
    leftShin.add(leftBootMesh);

    // Right Leg
    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.13, -0.1, 0);
    hips.add(rightLeg);
    this.joints.rightLeg = rightLeg;

    const rightThighMesh = new THREE.Mesh(thighGeom, pantsMat);
    rightThighMesh.position.y = -0.22;
    rightThighMesh.castShadow = true;
    rightLeg.add(rightThighMesh);

    const rightShin = new THREE.Group();
    rightShin.position.y = -0.45;
    rightLeg.add(rightShin);
    this.joints.rightShin = rightShin;

    const rightShinMesh = new THREE.Mesh(shinGeom, pantsMat);
    rightShinMesh.position.y = -0.21;
    rightShinMesh.castShadow = true;
    rightShin.add(rightShinMesh);

    const rightBootMesh = new THREE.Mesh(bootGeom, bootsMat);
    rightBootMesh.position.set(0, -0.38, 0.04);
    rightBootMesh.castShadow = true;
    rightShin.add(rightBootMesh);
  }

  setAnimation(animName) {
    if (this.currentAnim !== animName) {
      this.currentAnim = animName;
      if (animName === 'slide') {
        this.slideProgress = 0;
      }
    }
  }

  update(dt, speedRatio = 1.0) {
    this.animTime += dt * (12.0 * speedRatio);

    const j = this.joints;

    if (this.currentAnim === 'run') {
      // 1. Natural Athletic Run Cycle
      const stride = Math.sin(this.animTime);
      const cosStride = Math.cos(this.animTime);

      // Legs swing back and forth
      j.leftLeg.rotation.x = stride * 0.95;
      j.rightLeg.rotation.x = -stride * 0.95;

      // Shins bend realistically when leg sweeps back
      j.leftShin.rotation.x = stride > 0 ? stride * 1.1 : 0.1;
      j.rightShin.rotation.x = stride < 0 ? -stride * 1.1 : 0.1;

      // Arms counter-swing opposite to legs
      j.leftArm.rotation.x = -stride * 0.85;
      j.rightArm.rotation.x = stride * 0.85;
      j.leftForearm.rotation.x = -0.45 - Math.abs(stride) * 0.3;
      j.rightForearm.rotation.x = -0.45 - Math.abs(stride) * 0.3;

      // Spine / Torso bobbing & forward lean
      j.hips.position.y = 0.95 + Math.abs(cosStride) * 0.08;
      j.hips.rotation.x = 0.12; // forward sprint lean
      j.hips.rotation.y = -stride * 0.08;
      j.hips.rotation.z = 0;
      j.torso.rotation.x = 0.05;
      j.torso.rotation.z = 0;
      j.head.rotation.x = -0.15; // head leveled to gaze forward

    } else if (this.currentAnim === 'jump') {
      // 2. High Jump Tuck Pose
      j.hips.position.y = 0.95;
      j.hips.rotation.x = -0.15;
      j.hips.rotation.y = 0;
      j.hips.rotation.z = 0;

      // Legs tuck upward
      j.leftLeg.rotation.x = -0.9;
      j.rightLeg.rotation.x = -0.6;
      j.leftShin.rotation.x = 1.4;
      j.rightShin.rotation.x = 1.1;

      // Arms raise up for balance
      j.leftArm.rotation.x = 1.6;
      j.rightArm.rotation.x = 1.8;
      j.leftArm.rotation.z = -0.3;
      j.rightArm.rotation.z = 0.3;
      j.leftForearm.rotation.x = -0.6;
      j.rightForearm.rotation.x = -0.6;

      j.head.rotation.x = -0.2;

    } else if (this.currentAnim === 'slide') {
      // 3. Low Baseball-Style Slide Pose
      this.slideProgress += dt * 2.0;

      // Torso leans far back, body dropped to ground
      j.hips.position.y = 0.32;
      j.hips.rotation.x = -1.25; // Lean backwards nearly flat
      j.hips.rotation.y = 0.2;
      j.hips.rotation.z = 0;

      // Lead right leg stretched straight out
      j.rightLeg.rotation.x = 0.3;
      j.rightShin.rotation.x = 0.05;

      // Trailing left leg bent under body
      j.leftLeg.rotation.x = -0.5;
      j.leftShin.rotation.x = 1.6;

      // Arms stabilizing against ground
      j.leftArm.rotation.x = -0.5;
      j.rightArm.rotation.x = -0.8;
      j.leftArm.rotation.z = -0.4;
      j.rightArm.rotation.z = 0.4;
      j.leftForearm.rotation.x = -0.2;
      j.rightForearm.rotation.x = -0.2;

      j.head.rotation.x = 0.7; // chin tucked looking ahead

    } else if (this.currentAnim === 'stumble') {
      // 4. Dramatic Tumble / Crash
      j.hips.rotation.x += dt * 8.0;
      j.hips.rotation.y += dt * 6.0;
      j.hips.position.y = Math.max(0.3, j.hips.position.y - dt * 2.5);

      j.leftArm.rotation.x = Math.sin(this.animTime * 2) * 1.5;
      j.rightArm.rotation.x = -Math.cos(this.animTime * 2) * 1.5;
      j.leftLeg.rotation.x = Math.cos(this.animTime * 2) * 1.2;
      j.rightLeg.rotation.x = -Math.sin(this.animTime * 2) * 1.2;

    } else if (this.currentAnim === 'idle') {
      // 5. Idle Breathing for Menu Turntable
      const breathe = Math.sin(this.animTime * 0.2) * 0.04;
      j.hips.position.y = 0.95 + breathe;
      j.hips.rotation.set(0, 0, 0);
      j.torso.rotation.x = breathe * 0.5;

      j.leftArm.rotation.set(0, 0, -0.15);
      j.rightArm.rotation.set(0, 0, 0.15);
      j.leftForearm.rotation.set(-0.2, 0, 0);
      j.rightForearm.rotation.set(-0.2, 0, 0);

      j.leftLeg.rotation.set(0, 0, -0.05);
      j.rightLeg.rotation.set(0, 0, 0.05);
      j.leftShin.rotation.set(0, 0, 0);
      j.rightShin.rotation.set(0, 0, 0);
    }
  }

  // Tilt character slightly into lane changes
  setBankAngle(angle) {
    if (this.currentAnim === 'run') {
      this.joints.torso.rotation.z = angle;
    }
  }
}
