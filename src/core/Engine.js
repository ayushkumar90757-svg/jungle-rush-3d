// JUNGLE RUSH 3D - 3D GRAPHICS ENGINE, LIGHTING, CAMERA & PERFORMANCE TIERS
import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class Engine {
  constructor(canvasContainer, saveManager) {
    this.container = canvasContainer;
    this.saveManager = saveManager;
    this.quality = this.saveManager.data.settings.graphicsQuality || 'high';

    // Core Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Lights
    this.dirLight = null;
    this.hemiLight = null;
    this.ambientLight = null;

    // Camera follow state
    this.camTargetPos = new THREE.Vector3();
    this.camLookTarget = new THREE.Vector3();
    this.cameraShakeIntensity = 0;

    // Performance monitoring (FPS)
    this.frameCount = 0;
    this.fps = 60;
    this.lastFpsUpdate = performance.now();

    this.init();
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x3a7d44); // Deep lush tropical canopy green
    this.scene.fog = new THREE.FogExp2(0x326e3c, 0.009); // Atmospheric tropical depth mist

    // 2. Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(CONFIG.CAM_FOV, aspect, 0.5, 350);
    this.camera.position.set(0, CONFIG.CAM_OFFSET_Y, CONFIG.CAM_OFFSET_Z);
    this.scene.add(this.camera);

    // 3. Renderer with performance auto-tuning
    this.renderer = new THREE.WebGLRenderer({
      antialias: this.quality === 'high',
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });

    const pixelRatio = this.quality === 'high' 
      ? Math.min(window.devicePixelRatio, 1.5) 
      : 1.0; // Lower resolution scale for budget devices
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // Shadows
    if (this.quality === 'high') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    } else {
      this.renderer.shadowMap.enabled = false;
    }

    this.container.appendChild(this.renderer.domElement);

    // 4. Tropical Jungle Lighting
    this.setupLighting();

    // 5. Resize listener
    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupLighting() {
    // Top-down hemisphere light: canopy emerald green from above, warm earth brown bounce from below
    this.hemiLight = new THREE.HemisphereLight(0x99dd88, 0x4a3219, 0.85);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    // Ambient light for shadow filling
    this.ambientLight = new THREE.AmbientLight(0x2d4f24, 0.4);
    this.scene.add(this.ambientLight);

    // Main tropical sunlight
    this.dirLight = new THREE.DirectionalLight(0xfff3cc, 1.4);
    this.dirLight.position.set(25, 45, -20);
    this.dirLight.target.position.set(0, 0, 0);

    if (this.quality === 'high') {
      this.dirLight.castShadow = true;
      this.dirLight.shadow.mapSize.width = 1024;
      this.dirLight.shadow.mapSize.height = 1024;
      this.dirLight.shadow.camera.near = 10;
      this.dirLight.shadow.camera.far = 120;
      const d = 30;
      this.dirLight.shadow.camera.left = -d;
      this.dirLight.shadow.camera.right = d;
      this.dirLight.shadow.camera.top = d;
      this.dirLight.shadow.camera.bottom = -d;
      this.dirLight.shadow.bias = -0.001;
    }

    this.scene.add(this.dirLight);
    this.scene.add(this.dirLight.target);
  }

  setQuality(mode) {
    this.quality = mode;
    this.saveManager.data.settings.graphicsQuality = mode;
    this.saveManager.save();

    const pixelRatio = mode === 'high' ? Math.min(window.devicePixelRatio, 1.5) : 1.0;
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.shadowMap.enabled = (mode === 'high');
    if (this.dirLight) {
      this.dirLight.castShadow = (mode === 'high');
    }
  }

  triggerCameraShake(intensity = 0.5) {
    this.cameraShakeIntensity = Math.min(this.cameraShakeIntensity + intensity, 1.2);
  }

  updateCamera(playerPos, dt) {
    // Keep directional light following player so shadows are sharp around runner
    if (this.dirLight) {
      this.dirLight.position.set(playerPos.x + 25, playerPos.y + 45, playerPos.z - 20);
      this.dirLight.target.position.copy(playerPos);
    }

    // Camera target: behind and above player
    const targetX = playerPos.x * 0.5; // subtle dampening of lateral lane movement
    const targetY = playerPos.y + CONFIG.CAM_OFFSET_Y;
    const targetZ = playerPos.z + CONFIG.CAM_OFFSET_Z;

    // Smooth lerp
    const lerpFactor = Math.min(1.0, dt * CONFIG.CAM_LERP_SPEED);
    this.camera.position.x += (targetX - this.camera.position.x) * lerpFactor;
    this.camera.position.y += (targetY - this.camera.position.y) * lerpFactor;
    this.camera.position.z += (targetZ - this.camera.position.z) * lerpFactor;

    // Look ahead point
    this.camLookTarget.set(
      targetX * 0.4,
      playerPos.y + 1.2,
      playerPos.z - CONFIG.CAM_LOOK_AHEAD
    );
    this.camera.lookAt(this.camLookTarget);

    // Apply camera shake if active
    if (this.cameraShakeIntensity > 0.001) {
      const shakeX = (Math.random() * 2 - 1) * this.cameraShakeIntensity * 0.4;
      const shakeY = (Math.random() * 2 - 1) * this.cameraShakeIntensity * 0.3;
      this.camera.position.x += shakeX;
      this.camera.position.y += shakeY;

      this.cameraShakeIntensity = Math.max(0, this.cameraShakeIntensity - dt * CONFIG.CAM_SHAKE_DECAY);
    }
  }

  updateFPS() {
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
    return this.fps;
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
