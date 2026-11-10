// JUNGLE RUSH 3D - UNIT & INTEGRATION TEST SUITE
import { CONFIG } from './config.js';
import { SaveManager } from './core/SaveManager.js';
import { MissionManager } from './core/MissionManager.js';
import { ObjectPool } from './core/ObjectPool.js';

console.log('====================================================');
console.log('   JUNGLE RUSH 3D - AUTOMATED ENGINE & LOGIC TEST   ');
console.log('====================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    testsFailed++;
  }
}

// 1. CONFIGURATION INTEGRITY
console.log('--- 1. Testing Config & Game Balance ---');
assert(CONFIG.LANES.length === 3, 'Game has exactly 3 running lanes');
assert(CONFIG.LANES[0] < CONFIG.LANES[1] && CONFIG.LANES[1] < CONFIG.LANES[2], 'Lanes are ordered Left < Center < Right');
assert(CONFIG.BASE_SPEED > 0 && CONFIG.MAX_SPEED > CONFIG.BASE_SPEED, 'Speed ramping bounds are valid');
assert(CONFIG.CHARACTERS.length === 3, 'Exactly 3 distinct unlockable characters');
assert(CONFIG.CHARACTERS[0].id === 'dash' && CONFIG.CHARACTERS[0].cost === 0, 'Starter character is unlocked by default');
assert(CONFIG.DAILY_REWARDS.length === 7, '7-day daily reward calendar is defined');
assert(CONFIG.MISSIONS.length >= 5, 'Missions system has at least 5 varied missions');

// 2. SAVE SYSTEM & LOCALSTORAGE MOCK
console.log('\n--- 2. Testing SaveManager ---');
// Provide mock localStorage for Node testing
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = v.toString(); },
  removeItem: (k) => { delete mockStorage[k]; }
};

const saveMgr = new SaveManager();
assert(saveMgr.data.coins >= 500, 'Player starts with starter coins');
assert(saveMgr.data.selectedCharacter === 'dash', 'Default selected character is Dash');

// Add coins test
const initialCoins = saveMgr.data.coins;
saveMgr.addCoins(250);
assert(saveMgr.data.coins === initialCoins + 250, 'Coin addition persists accurately');

// Spending coins test
const spendSuccess = saveMgr.spendCoins(100);
assert(spendSuccess === true && saveMgr.data.coins === initialCoins + 150, 'Coin spending succeeds when affordable');
const spendFail = saveMgr.spendCoins(999999);
assert(spendFail === false, 'Coin spending rejected when unaffordable');

// Record run test
const isNewHigh = saveMgr.recordRun(12500, 850, 45);
assert(isNewHigh === true, 'First high score registers as new record');
assert(saveMgr.data.highScore === 12500, 'High score persisted');
assert(saveMgr.data.bestDistance === 850, 'Best distance persisted');

// Character unlock test
assert(saveMgr.unlockCharacter('maya') === true, 'Maya unlocked successfully');
assert(saveMgr.data.unlockedCharacters.includes('maya'), 'Unlocked character exists in array');
assert(saveMgr.selectCharacter('maya') === true, 'Maya selected as active runner');
assert(saveMgr.data.selectedCharacter === 'maya', 'Selected character updated');

// Upgrade test
const initialMagnetLvl = saveMgr.data.upgrades.magnet;
const upgradedLvl = saveMgr.upgradePowerup('magnet');
assert(upgradedLvl === initialMagnetLvl + 1, 'Powerup upgrade increments level by 1');

// 3. MISSION MANAGER & DAILY REWARDS
console.log('\n--- 3. Testing MissionManager & Daily Rewards ---');
const missionMgr = new MissionManager(saveMgr);
const dailyStatus = missionMgr.checkDailyRewardStatus();
assert(dailyStatus.canClaim === true, 'Daily reward is claimable on fresh install');
const claimedReward = missionMgr.claimDailyReward();
assert(claimedReward !== null && claimedReward.amount > 0, 'Daily reward claimed gives coins');

const afterClaimStatus = missionMgr.checkDailyRewardStatus();
assert(afterClaimStatus.canClaim === false, 'Cannot claim daily reward twice in same day');

// Mission progress test
const missions = missionMgr.getMissionsWithProgress({ distance: 600, coins: 120, powerups: 4 });
const trekker = missions.find(m => m.id === 'distance_500');
assert(trekker.isCompleted === true, '500m distance mission marked completed after 600m run');

const rewardCoins = missionMgr.claimMissionReward('distance_500');
assert(rewardCoins === 300, 'Claiming completed mission rewards correct coin amount');
const doubleClaim = missionMgr.claimMissionReward('distance_500');
assert(doubleClaim === false, 'Cannot claim completed mission twice');

// 4. OBJECT POOLING ENGINE
console.log('\n--- 4. Testing ObjectPool System ---');
let createdCount = 0;
const pool = new ObjectPool(() => {
  createdCount++;
  return { id: createdCount, visible: false };
}, 5, 10);

assert(pool.freeList.length === 5, 'Object pool initialized with pre-allocated items');
assert(createdCount === 5, 'Factory function called exactly 5 times during init');

const obj1 = pool.get();
assert(obj1.visible === true, 'Acquired pooled object is set to visible');
assert(pool.activeList.length === 1 && pool.freeList.length === 4, 'Pool counts updated on acquire');

pool.release(obj1);
assert(obj1.visible === false, 'Released pooled object is set to invisible');
assert(pool.activeList.length === 0 && pool.freeList.length === 5, 'Pool counts restored on release');

// Stress test pool recycling
for (let i = 0; i < 20; i++) {
  pool.get();
}
assert(pool.activeList.length <= 10, 'Hard memory cap enforced; no unlimited object leak!');

console.log('\n====================================================');
console.log(`TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
console.log('====================================================\n');

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('All logic, persistence, and pooling tests PASSED with 100% success!');
}
