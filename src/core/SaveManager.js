// JUNGLE RUSH 3D - SAVE SYSTEM (LOCAL STORAGE PERSISTENCE)

const SAVE_KEY = 'jungle_rush_3d_savedata_v1';

export class SaveManager {
  constructor() {
    this.data = this.getDefaults();
    this.load();
  }

  getDefaults() {
    return {
      coins: 500, // Starter coins for immediate fun
      highScore: 0,
      bestDistance: 0,
      totalRuns: 0,
      cumulativeCoins: 0,
      selectedCharacter: 'dash',
      unlockedCharacters: ['dash'],
      upgrades: {
        magnet: 1,
        shield: 1,
        boost: 1,
        multiplier: 1
      },
      missions: {
        completed: [],
        claimed: []
      },
      dailyRewards: {
        streak: 0,
        lastClaimDate: null
      },
      settings: {
        masterVolume: 1.0,
        musicVolume: 0.7,
        sfxVolume: 0.85,
        graphicsQuality: 'high', // 'high' or 'low'
        showOnScreenControls: true,
        swipeSensitivity: 1.0
      }
    };
  }

  load() {
    try {
      const stored = localStorage.getItem(SAVE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.data = {
          ...this.getDefaults(),
          ...parsed,
          upgrades: { ...this.getDefaults().upgrades, ...(parsed.upgrades || {}) },
          missions: { ...this.getDefaults().missions, ...(parsed.missions || {}) },
          dailyRewards: { ...this.getDefaults().dailyRewards, ...(parsed.dailyRewards || {}) },
          settings: { ...this.getDefaults().settings, ...(parsed.settings || {}) }
        };
      }
    } catch (e) {
      console.warn('LocalStorage load failed, using defaults:', e);
      this.data = this.getDefaults();
    }
    return this.data;
  }

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  addCoins(amount) {
    if (amount > 0) {
      this.data.coins += amount;
      this.data.cumulativeCoins += amount;
      this.save();
    }
  }

  spendCoins(amount) {
    if (this.data.coins >= amount) {
      this.data.coins -= amount;
      this.save();
      return true;
    }
    return false;
  }

  recordRun(score, distance, coinsEarned) {
    let isNewHigh = false;
    if (score > this.data.highScore) {
      this.data.highScore = Math.floor(score);
      isNewHigh = true;
    }
    if (distance > this.data.bestDistance) {
      this.data.bestDistance = Math.floor(distance);
    }
    this.data.totalRuns++;
    this.addCoins(coinsEarned);
    this.save();
    return isNewHigh;
  }

  unlockCharacter(charId) {
    if (!this.data.unlockedCharacters.includes(charId)) {
      this.data.unlockedCharacters.push(charId);
      this.save();
      return true;
    }
    return false;
  }

  selectCharacter(charId) {
    if (this.data.unlockedCharacters.includes(charId)) {
      this.data.selectedCharacter = charId;
      this.save();
      return true;
    }
    return false;
  }

  upgradePowerup(powerupId) {
    const currentLvl = this.data.upgrades[powerupId] || 1;
    if (currentLvl < 5) {
      this.data.upgrades[powerupId] = currentLvl + 1;
      this.save();
      return this.data.upgrades[powerupId];
    }
    return currentLvl;
  }

  resetAllProgress() {
    this.data = this.getDefaults();
    this.save();
  }
}
