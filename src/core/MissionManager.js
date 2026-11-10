// JUNGLE RUSH 3D - MISSIONS & DAILY REWARDS SYSTEM
import { CONFIG } from '../config.js';

export class MissionManager {
  constructor(saveManager) {
    this.saveManager = saveManager;
  }

  checkDailyRewardStatus() {
    const daily = this.saveManager.data.dailyRewards;
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

    if (!daily.lastClaimDate) {
      return { canClaim: true, currentDay: 1, isNextStreak: false };
    }

    if (daily.lastClaimDate === todayStr) {
      return { canClaim: false, currentDay: daily.streak, isNextStreak: false };
    }

    // Check if consecutive day
    const lastDate = new Date(daily.lastClaimDate);
    const diffDays = Math.round((now - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      const nextDay = (daily.streak % 7) + 1;
      return { canClaim: true, currentDay: nextDay, isNextStreak: true };
    } else {
      // Streak broken, reset to day 1
      return { canClaim: true, currentDay: 1, isNextStreak: false };
    }
  }

  claimDailyReward() {
    const status = this.checkDailyRewardStatus();
    if (!status.canClaim) return null;

    const rewardIndex = Math.min(Math.max(status.currentDay - 1, 0), CONFIG.DAILY_REWARDS.length - 1);
    const reward = CONFIG.DAILY_REWARDS[rewardIndex];

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

    this.saveManager.data.dailyRewards.lastClaimDate = todayStr;
    this.saveManager.data.dailyRewards.streak = status.currentDay;

    if (reward.type === 'coins') {
      this.saveManager.addCoins(reward.amount);
    }
    this.saveManager.save();

    return reward;
  }

  getMissionsWithProgress(currentRun = { distance: 0, coins: 0, powerups: 0 }) {
    const completed = this.saveManager.data.missions.completed || [];
    const claimed = this.saveManager.data.missions.claimed || [];

    return CONFIG.MISSIONS.map(m => {
      let progress = 0;
      let isDone = completed.includes(m.id);
      let isClaimed = claimed.includes(m.id);

      if (m.type === 'distance_single') {
        progress = Math.min(m.target, Math.max(currentRun.distance, isDone ? m.target : 0));
      } else if (m.type === 'coins_single') {
        progress = Math.min(m.target, Math.max(currentRun.coins, isDone ? m.target : 0));
      } else if (m.type === 'powerups_single') {
        progress = Math.min(m.target, Math.max(currentRun.powerups, isDone ? m.target : 0));
      } else if (m.type === 'coins_cumulative') {
        progress = Math.min(m.target, this.saveManager.data.cumulativeCoins);
      }

      if (progress >= m.target && !isDone) {
        this.saveManager.data.missions.completed.push(m.id);
        this.saveManager.save();
        isDone = true;
      }

      return {
        ...m,
        progress,
        isCompleted: isDone,
        isClaimed: isClaimed,
        percent: Math.min(100, Math.floor((progress / m.target) * 100))
      };
    });
  }

  claimMissionReward(missionId) {
    const mission = CONFIG.MISSIONS.find(m => m.id === missionId);
    if (!mission) return false;

    const completed = this.saveManager.data.missions.completed || [];
    const claimed = this.saveManager.data.missions.claimed || [];

    if (completed.includes(missionId) && !claimed.includes(missionId)) {
      this.saveManager.data.missions.claimed.push(missionId);
      this.saveManager.addCoins(mission.reward);
      this.saveManager.save();
      return mission.reward;
    }
    return false;
  }
}
