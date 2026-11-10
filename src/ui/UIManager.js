// JUNGLE RUSH 3D - USER INTERFACE MANAGER & SCREENS
import { CONFIG } from '../config.js';

export class UIManager {
  constructor(game) {
    this.game = game;
    this.saveManager = game.saveManager;
    this.soundManager = game.soundManager;
    this.missionManager = game.missionManager;

    // DOM Elements
    this.screens = {
      menu: document.getElementById('screen-menu'),
      hud: document.getElementById('screen-hud'),
      pause: document.getElementById('screen-pause'),
      gameover: document.getElementById('screen-gameover'),
      shop: document.getElementById('screen-shop'),
      characters: document.getElementById('screen-characters'),
      missions: document.getElementById('screen-missions'),
      settings: document.getElementById('screen-settings')
    };

    // HUD values
    this.hudCoins = document.getElementById('hud-coins');
    this.hudDistance = document.getElementById('hud-distance');
    this.hudScore = document.getElementById('hud-score');
    this.hudFps = document.getElementById('hud-fps');
    this.powerupBars = document.getElementById('hud-powerups');
    this.virtualControls = document.getElementById('virtual-controls');

    this.selectedCharId = this.saveManager.data.selectedCharacter;

    this.bindEvents();
    this.showScreen('menu');
    this.updateMenuStats();
  }

  showScreen(name) {
    for (const key in this.screens) {
      if (this.screens[key]) {
        this.screens[key].classList.toggle('active', key === name);
      }
    }

    if (name === 'hud') {
      const showControls = this.saveManager.data.settings.showOnScreenControls;
      if (this.virtualControls) {
        this.virtualControls.style.display = showControls ? 'flex' : 'none';
      }
    }
  }

  bindEvents() {
    // 1. Main Menu Buttons
    this.bindBtn('btn-play', () => {
      this.soundManager.playButtonClick();
      this.game.startRun();
    });

    this.bindBtn('btn-open-characters', () => {
      this.soundManager.playButtonClick();
      this.renderCharacterSelect();
      this.showScreen('characters');
    });

    this.bindBtn('btn-open-shop', () => {
      this.soundManager.playButtonClick();
      this.renderShop();
      this.showScreen('shop');
    });

    this.bindBtn('btn-open-missions', () => {
      this.soundManager.playButtonClick();
      this.renderMissions();
      this.showScreen('missions');
    });

    this.bindBtn('btn-open-settings', () => {
      this.soundManager.playButtonClick();
      this.renderSettings();
      this.showScreen('settings');
    });

    // 2. HUD Pause Button
    this.bindBtn('btn-pause', () => {
      this.soundManager.playButtonClick();
      this.game.pauseGame();
    });

    // 3. Pause Menu Buttons
    this.bindBtn('btn-resume', () => {
      this.soundManager.playButtonClick();
      this.game.resumeGame();
    });

    this.bindBtn('btn-pause-restart', () => {
      this.soundManager.playButtonClick();
      this.game.startRun();
    });

    this.bindBtn('btn-pause-menu', () => {
      this.soundManager.playButtonClick();
      this.game.returnToMenu();
    });

    // 4. Game Over Buttons
    this.bindBtn('btn-restart', () => {
      this.soundManager.playButtonClick();
      this.game.startRun();
    });

    this.bindBtn('btn-gameover-shop', () => {
      this.soundManager.playButtonClick();
      this.renderShop();
      this.showScreen('shop');
    });

    this.bindBtn('btn-gameover-menu', () => {
      this.soundManager.playButtonClick();
      this.game.returnToMenu();
    });

    // 5. Back to menu buttons
    document.querySelectorAll('.btn-back-menu').forEach(btn => {
      btn.addEventListener('click', () => {
        this.soundManager.playButtonClick();
        this.updateMenuStats();
        this.showScreen('menu');
      });
    });

    // 6. Settings Inputs
    const masterSlider = document.getElementById('setting-master-vol');
    if (masterSlider) {
      masterSlider.addEventListener('input', (e) => {
        this.soundManager.setMasterVolume(parseFloat(e.target.value));
      });
    }

    const musicSlider = document.getElementById('setting-music-vol');
    if (musicSlider) {
      musicSlider.addEventListener('input', (e) => {
        this.soundManager.setMusicVolume(parseFloat(e.target.value));
      });
    }

    const sfxSlider = document.getElementById('setting-sfx-vol');
    if (sfxSlider) {
      sfxSlider.addEventListener('input', (e) => {
        this.soundManager.setSFXVolume(parseFloat(e.target.value));
      });
    }

    const qualitySelect = document.getElementById('setting-graphics');
    if (qualitySelect) {
      qualitySelect.addEventListener('change', (e) => {
        this.game.engine.setQuality(e.target.value);
      });
    }

    const controlsToggle = document.getElementById('setting-controls-toggle');
    if (controlsToggle) {
      controlsToggle.addEventListener('change', (e) => {
        this.saveManager.data.settings.showOnScreenControls = e.target.checked;
        this.saveManager.save();
      });
    }
  }

  bindBtn(id, action) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', action);
  }

  updateMenuStats() {
    const d = this.saveManager.data;
    const menuCoins = document.getElementById('menu-coins');
    const menuHigh = document.getElementById('menu-high-score');
    const menuDist = document.getElementById('menu-best-dist');

    if (menuCoins) menuCoins.textContent = d.coins.toLocaleString();
    if (menuHigh) menuHigh.textContent = d.highScore.toLocaleString();
    if (menuDist) menuDist.textContent = `${d.bestDistance.toLocaleString()}m`;
  }

  // --- HUD REAL-TIME TICK ---
  updateHUD(coins, distance, score, fps, activePowerups) {
    if (this.hudCoins) this.hudCoins.textContent = coins.toLocaleString();
    if (this.hudDistance) this.hudDistance.textContent = `${Math.floor(distance)}m`;
    if (this.hudScore) this.hudScore.textContent = Math.floor(score).toLocaleString();
    if (this.hudFps) this.hudFps.textContent = `${fps} FPS`;

    // Render active powerup badges
    if (this.powerupBars) {
      let html = '';
      for (const key in activePowerups) {
        const timeRemaining = activePowerups[key];
        if (timeRemaining > 0) {
          const pConfig = CONFIG.POWERUP[key.toUpperCase()];
          const maxDur = pConfig.baseDuration + 6; // approximate max bar
          const percent = Math.min(100, Math.max(0, (timeRemaining / maxDur) * 100));
          html += `
            <div class="powerup-badge">
              <span class="icon">${pConfig.icon}</span>
              <div class="bar-bg">
                <div class="bar-fill" style="width: ${percent}%; background: #${pConfig.color.toString(16)}"></div>
              </div>
              <span class="timer">${timeRemaining.toFixed(1)}s</span>
            </div>
          `;
        }
      }
      this.powerupBars.innerHTML = html;
    }
  }

  showGameOver(score, distance, coins, isNewHigh) {
    document.getElementById('go-final-score').textContent = Math.floor(score).toLocaleString();
    document.getElementById('go-final-distance').textContent = `${Math.floor(distance).toLocaleString()}m`;
    document.getElementById('go-final-coins').textContent = `+${coins.toLocaleString()}`;

    const highBadge = document.getElementById('go-new-high-badge');
    if (highBadge) {
      highBadge.style.display = isNewHigh ? 'inline-block' : 'none';
    }

    this.showScreen('gameover');
  }

  // --- CHARACTER SELECT SCREEN ---
  renderCharacterSelect() {
    const container = document.getElementById('char-cards-container');
    if (!container) return;

    const currentCoins = this.saveManager.data.coins;
    const unlocked = this.saveManager.data.unlockedCharacters;
    const selected = this.saveManager.data.selectedCharacter;

    let html = '';
    CONFIG.CHARACTERS.forEach(c => {
      const isUnlocked = unlocked.includes(c.id);
      const isSelected = selected === c.id;

      let btnHtml = '';
      if (isSelected) {
        btnHtml = `<button class="btn btn-primary" disabled>SELECTED</button>`;
      } else if (isUnlocked) {
        btnHtml = `<button class="btn btn-secondary btn-select-char" data-id="${c.id}">SELECT</button>`;
      } else {
        const canAfford = currentCoins >= c.cost;
        btnHtml = `
          <button class="btn ${canAfford ? 'btn-gold' : 'btn-disabled'} btn-unlock-char" 
                  data-id="${c.id}" data-cost="${c.cost}" ${canAfford ? '' : 'disabled'}>
            UNLOCK (${c.cost} 🪙)
          </button>
        `;
      }

      html += `
        <div class="character-card ${isSelected ? 'selected' : ''}">
          <div class="char-header">
            <h3>${c.name}</h3>
            <span class="char-title">${c.title}</span>
          </div>
          <p class="char-desc">${c.description}</p>
          <div class="char-perk">⚡ Perk: <strong>${c.perk}</strong></div>
          <div class="char-action">
            ${btnHtml}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Attach unlock/select handlers
    container.querySelectorAll('.btn-select-char').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        this.saveManager.selectCharacter(id);
        this.game.player.loadCharacter(id);
        this.soundManager.playButtonClick();
        this.renderCharacterSelect();
      });
    });

    container.querySelectorAll('.btn-unlock-char').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const cost = parseInt(e.target.getAttribute('data-cost'));
        if (this.saveManager.spendCoins(cost)) {
          this.saveManager.unlockCharacter(id);
          this.saveManager.selectCharacter(id);
          this.game.player.loadCharacter(id);
          this.soundManager.playPowerUp();
          this.renderCharacterSelect();
        }
      });
    });

    // Update coins display
    const coinsEl = document.getElementById('char-bank-coins');
    if (coinsEl) coinsEl.textContent = this.saveManager.data.coins.toLocaleString();
  }

  // --- SHOP SCREEN ---
  renderShop() {
    const container = document.getElementById('shop-items-container');
    if (!container) return;

    const coins = this.saveManager.data.coins;
    const upgrades = this.saveManager.data.upgrades;

    let html = '';
    for (const key in CONFIG.UPGRADES) {
      const up = CONFIG.UPGRADES[key];
      const currentLvl = upgrades[key] || 1;
      const isMax = currentLvl >= 5;
      const nextCost = isMax ? 0 : up.costs[currentLvl - 1];
      const canAfford = !isMax && coins >= nextCost;

      // Level pips
      let pips = '';
      for (let i = 1; i <= 5; i++) {
        pips += `<span class="pip ${i <= currentLvl ? 'filled' : ''}"></span>`;
      }

      html += `
        <div class="shop-item-card">
          <div class="item-icon">${up.icon}</div>
          <div class="item-details">
            <h4>${up.name}</h4>
            <div class="level-pips">${pips} <span class="lvl-label">Lv. ${currentLvl}</span></div>
          </div>
          <div class="item-buy">
            ${isMax 
              ? '<button class="btn btn-disabled" disabled>MAX LEVEL</button>' 
              : `<button class="btn ${canAfford ? 'btn-gold' : 'btn-disabled'} btn-buy-upgrade" 
                         data-id="${key}" data-cost="${nextCost}" ${canAfford ? '' : 'disabled'}>
                   UPGRADE (${nextCost} 🪙)
                 </button>`
            }
          </div>
        </div>
      `;
    }

    container.innerHTML = html;

    // Attach buy upgrade handlers
    container.querySelectorAll('.btn-buy-upgrade').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const key = e.target.getAttribute('data-id');
        const cost = parseInt(e.target.getAttribute('data-cost'));
        if (this.saveManager.spendCoins(cost)) {
          this.saveManager.upgradePowerup(key);
          this.soundManager.playPowerUp();
          this.renderShop();
        }
      });
    });

    const coinsEl = document.getElementById('shop-bank-coins');
    if (coinsEl) coinsEl.textContent = this.saveManager.data.coins.toLocaleString();
  }

  // --- MISSIONS & DAILY REWARDS SCREEN ---
  renderMissions() {
    // 1. Daily reward
    const dailyStatus = this.missionManager.checkDailyRewardStatus();
    const dailyBtn = document.getElementById('btn-claim-daily');
    const dailyStatusText = document.getElementById('daily-status-text');

    if (dailyBtn && dailyStatusText) {
      if (dailyStatus.canClaim) {
        dailyBtn.disabled = false;
        dailyBtn.textContent = `CLAIM DAY ${dailyStatus.currentDay} BONUS! 🎁`;
        dailyStatusText.textContent = `Claim your consecutive day reward!`;
        dailyBtn.onclick = () => {
          const reward = this.missionManager.claimDailyReward();
          if (reward) {
            this.soundManager.playPowerUp();
            this.renderMissions();
          }
        };
      } else {
        dailyBtn.disabled = true;
        dailyBtn.textContent = `CLAIMED TODAY (Day ${dailyStatus.currentDay}) ✅`;
        dailyStatusText.textContent = `Come back tomorrow for your next reward!`;
      }
    }

    // 2. Active missions list
    const container = document.getElementById('missions-list-container');
    if (!container) return;

    const missions = this.missionManager.getMissionsWithProgress();
    let html = '';

    missions.forEach(m => {
      html += `
        <div class="mission-card ${m.isCompleted ? 'completed' : ''}">
          <div class="mission-info">
            <h4>${m.title}</h4>
            <p>${m.desc}</p>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${m.percent}%"></div>
            </div>
            <span class="progress-text">${m.progress} / ${m.target}</span>
          </div>
          <div class="mission-reward">
            ${m.isClaimed 
              ? '<span class="badge-claimed">CLAIMED</span>'
              : m.isCompleted
                ? `<button class="btn btn-gold btn-claim-mission" data-id="${m.id}">CLAIM ${m.reward} 🪙</button>`
                : `<span class="badge-reward">${m.reward} 🪙</span>`
            }
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.btn-claim-mission').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const rewarded = this.missionManager.claimMissionReward(id);
        if (rewarded) {
          this.soundManager.playPowerUp();
          this.renderMissions();
        }
      });
    });

    const coinsEl = document.getElementById('missions-bank-coins');
    if (coinsEl) coinsEl.textContent = this.saveManager.data.coins.toLocaleString();
  }

  // --- SETTINGS MODAL ---
  renderSettings() {
    const s = this.saveManager.data.settings;
    const masterSlider = document.getElementById('setting-master-vol');
    const musicSlider = document.getElementById('setting-music-vol');
    const sfxSlider = document.getElementById('setting-sfx-vol');
    const qualitySelect = document.getElementById('setting-graphics');
    const controlsToggle = document.getElementById('setting-controls-toggle');

    if (masterSlider) masterSlider.value = s.masterVolume;
    if (musicSlider) musicSlider.value = s.musicVolume;
    if (sfxSlider) sfxSlider.value = s.sfxVolume;
    if (qualitySelect) qualitySelect.value = s.graphicsQuality;
    if (controlsToggle) controlsToggle.checked = s.showOnScreenControls;
  }
}
