// JUNGLE RUSH 3D - HIGH-EFFICIENCY OBJECT POOL (ZERO GC DURING RUNTIME)

export class ObjectPool {
  constructor(factoryFn, initialSize = 10, maxSize = 100) {
    this.factoryFn = factoryFn;
    this.maxSize = maxSize;
    this.freeList = [];
    this.activeList = [];

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      const obj = this.factoryFn();
      if (obj.visible !== undefined) obj.visible = false;
      this.freeList.push(obj);
    }
  }

  get() {
    let obj;
    if (this.freeList.length > 0) {
      obj = this.freeList.pop();
    } else if (this.activeList.length < this.maxSize) {
      // Create new only if under ceiling
      obj = this.factoryFn();
    } else {
      // Re-use oldest active object to enforce hard memory cap
      obj = this.activeList.shift();
      if (obj && obj.onRelease) obj.onRelease();
    }

    if (obj.visible !== undefined) obj.visible = true;
    if (obj.onAcquire) obj.onAcquire();

    this.activeList.push(obj);
    return obj;
  }

  release(obj) {
    const idx = this.activeList.indexOf(obj);
    if (idx !== -1) {
      this.activeList.splice(idx, 1);
      if (obj.visible !== undefined) obj.visible = false;
      if (obj.onRelease) obj.onRelease();
      this.freeList.push(obj);
    }
  }

  releaseAll() {
    while (this.activeList.length > 0) {
      const obj = this.activeList.pop();
      if (obj.visible !== undefined) obj.visible = false;
      if (obj.onRelease) obj.onRelease();
      this.freeList.push(obj);
    }
  }

  forEachActive(callback) {
    for (let i = 0; i < this.activeList.length; i++) {
      callback(this.activeList[i], i);
    }
  }
}
