// JUNGLE RUSH 3D - INPUT MANAGER (SWIPES, ON-SCREEN BUTTONS, KEYBOARD)

export class InputManager {
  constructor(options = {}) {
    this.onLaneLeft = options.onLaneLeft || (() => {});
    this.onLaneRight = options.onLaneRight || (() => {});
    this.onJump = options.onJump || (() => {});
    this.onSlide = options.onSlide || (() => {});
    this.onPause = options.onPause || (() => {});

    // Touch gesture state
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.minSwipeDistance = 30; // Minimum pixels to qualify as a swipe
    this.maxSwipeTime = 400;     // Max ms to execute gesture
    this.swipeProcessed = false;

    // Keys currently pressed to avoid repeat spam
    this.keysDown = {};

    this.initEventListeners();
  }

  initEventListeners() {
    // 1. Touch Events for mobile swipes
    window.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    window.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
    window.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

    // 2. Mouse Drag Fallback for desktop testing (drag = swipe)
    this.mouseDown = false;
    window.addEventListener('mousedown', (e) => {
      // Don't intercept clicks on UI buttons
      if (e.target.closest('button, input, select, .interactive-ui')) return;
      this.mouseDown = true;
      this.touchStartX = e.clientX;
      this.touchStartY = e.clientY;
      this.touchStartTime = performance.now();
      this.swipeProcessed = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.mouseDown || this.swipeProcessed) return;
      const dx = e.clientX - this.touchStartX;
      const dy = e.clientY - this.touchStartY;
      this.detectSwipe(dx, dy);
    });

    window.addEventListener('mouseup', () => {
      this.mouseDown = false;
    });

    // 3. Keyboard Controls
    window.addEventListener('keydown', (e) => {
      if (this.keysDown[e.code]) return; // prevent key repeat
      this.keysDown[e.code] = true;

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          e.preventDefault();
          this.onLaneLeft();
          break;

        case 'ArrowRight':
        case 'KeyD':
          e.preventDefault();
          this.onLaneRight();
          break;

        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          e.preventDefault();
          this.onJump();
          break;

        case 'ArrowDown':
        case 'KeyS':
          e.preventDefault();
          this.onSlide();
          break;

        case 'Escape':
        case 'KeyP':
          e.preventDefault();
          this.onPause();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      delete this.keysDown[e.code];
    });
  }

  handleTouchStart(e) {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      // Skip if touching an interactive UI button
      if (e.target.closest('button, input, select, .interactive-ui')) return;

      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      this.touchStartTime = performance.now();
      this.swipeProcessed = false;
    }
  }

  handleTouchMove(e) {
    if (this.swipeProcessed || e.touches.length === 0) return;
    const touch = e.touches[0];
    const dx = touch.clientX - this.touchStartX;
    const dy = touch.clientY - this.touchStartY;
    this.detectSwipe(dx, dy);
  }

  handleTouchEnd(e) {
    this.swipeProcessed = false;
  }

  detectSwipe(dx, dy) {
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) < this.minSwipeDistance) {
      return; // Haven't reached threshold yet
    }

    this.swipeProcessed = true;

    if (absX > absY) {
      // Horizontal swipe
      if (dx < 0) {
        this.onLaneLeft();
      } else {
        this.onLaneRight();
      }
    } else {
      // Vertical swipe
      if (dy < 0) {
        this.onJump();
      } else {
        this.onSlide();
      }
    }
  }

  // Hook up on-screen virtual buttons
  bindVirtualButton(id, action) {
    const el = document.getElementById(id);
    if (!el) return;

    const trigger = (e) => {
      e.preventDefault();
      e.stopPropagation();
      action();
    };

    el.addEventListener('touchstart', trigger, { passive: false });
    el.addEventListener('mousedown', trigger);
  }
}
