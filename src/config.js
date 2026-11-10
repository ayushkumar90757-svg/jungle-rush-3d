// JUNGLE RUSH 3D - GAME CONFIGURATION & BALANCE CONSTANTS

export const CONFIG = {
  // World & Track
  LANE_WIDTH: 2.2,             // Distance between left, center, right lanes
  LANES: [-2.2, 0, 2.2],       // X coordinates for lane 0, 1, 2
  LANE_LEFT: 0,
  LANE_CENTER: 1,
  LANE_RIGHT: 2,
  CHUNK_LENGTH: 50,            // Length of each track segment (meters)
  ACTIVE_CHUNKS: 8,            // Number of chunks rendered simultaneously in pool
  SPAWN_AHEAD_DISTANCE: 350,   // Distance ahead to keep chunks populated
  DESPAWN_BEHIND_DISTANCE: 40, // Distance behind player to recycle chunks

  // Player Physics & Movement
  BASE_SPEED: 18.0,            // Starting forward speed in m/s (~65 km/h)
  MAX_SPEED: 32.0,             // Maximum forward running speed
  SPEED_RAMP_RATE: 0.008,      // Speed increase per meter traveled
  LANE_SWITCH_SPEED: 16.0,     // Lateral transition speed factor
  LANE_SWITCH_ROLL: 0.15,      // Body roll angle when switching lanes (radians)
  
  JUMP_FORCE: 13.5,            // Initial vertical velocity on jump
  GRAVITY: -34.0,              // Realistic high-speed downward gravity
  GROUND_Y: 0.0,               // Standard floor elevation
  JUMP_APEX_HANG: 0.04,        // Subtle apex hang time for responsive feel
  
  SLIDE_DURATION: 0.75,        // Duration of slide action in seconds
  SLIDE_BOX_HEIGHT: 0.65,      // Player bounding box height while sliding (normal is 1.9m)
  NORMAL_BOX_HEIGHT: 1.9,      // Standing collision box height
  PLAYER_HIT_RADIUS: 0.45,     // Collision radius in lateral plane

  // Camera settings
  CAM_OFFSET_Y: 3.2,           // Camera height above ground
  CAM_OFFSET_Z: 5.5,           // Camera distance behind player
  CAM_LOOK_AHEAD: 12.0,        // Look-at point distance ahead of player
  CAM_LERP_SPEED: 12.0,        // Camera follow stiffness
  CAM_FOV: 65,                 // Field of View (degrees)
  CAM_SHAKE_DECAY: 5.0,        // Screen shake decay rate

  // Power-Ups (base durations in seconds)
  POWERUP: {
    MAGNET: {
      id: 'magnet',
      name: 'Coin Magnet',
      baseDuration: 10.0,
      radius: 12.0,
      color: 0x3399ff,
      icon: '🧲'
    },
    SHIELD: {
      id: 'shield',
      name: 'Relic Shield',
      baseDuration: 12.0,
      color: 0x22ee88,
      icon: '🛡️'
    },
    BOOST: {
      id: 'boost',
      name: 'Jungle Sprint',
      baseDuration: 6.0,
      speedMultiplier: 1.6,
      color: 0xffaa00,
      icon: '⚡'
    },
    MULTIPLIER: {
      id: 'multiplier',
      name: 'Double Coins',
      baseDuration: 15.0,
      multiplier: 2,
      color: 0xff3366,
      icon: '2️⃣'
    }
  },

  // Characters
  CHARACTERS: [
    {
      id: 'dash',
      name: 'Dash Drake',
      title: 'Veteran Explorer',
      description: 'Balanced endurance runner with classic adventure instincts.',
      cost: 0,
      unlocked: true,
      colors: {
        shirt: 0x8b6508,     // Explorer khaki tan
        pants: 0x3d3020,     // Dark rugged cargo
        skin: 0xf2c49b,      // Light tone
        hair: 0x4a2e1b,      // Brown hair
        hat: 0x5c4033,       // Fedora brown
        boots: 0x2a1d13      // Sturdy leather boots
      },
      perk: 'Standard Balanced Run'
    },
    {
      id: 'maya',
      name: 'Maya Shadow',
      title: 'Jungle Scout',
      description: 'Native trail-blazer with heightened agility and coin magnet intuition.',
      cost: 1500,
      unlocked: false,
      colors: {
        shirt: 0x008080,     // Deep teal athletic vest
        pants: 0x1f2d3d,     // Slate compression pants
        skin: 0xc68642,      // Warm sun-kissed skin
        hair: 0x111111,      // Jet black braided hair
        hat: 0xd4af37,       // Feathered gold headband
        boots: 0x1a242f      // Lightweight trail shoes
      },
      perk: '+20% Magnet Radius'
    },
    {
      id: 'rex',
      name: 'Captain Rex',
      title: 'Heavy Commando',
      description: 'Armored veteran who can smash through low hazards with extra shield duration.',
      cost: 3500,
      unlocked: false,
      colors: {
        shirt: 0x4a5d4e,     // Military jungle olive
        pants: 0x2e3b32,     // Camo green trousers
        skin: 0xd2a679,      // Rugged skin
        hair: 0x888888,      // Steel grey buzz cut
        hat: 0x334035,       // Tactical beret
        boots: 0x1c1c1c      // Reinforced combat boots
      },
      perk: '+3s Shield Duration'
    }
  ],

  // Shop Upgrades
  UPGRADES: {
    magnet: {
      name: 'Magnet Duration',
      icon: '🧲',
      costs: [300, 600, 1200, 2500, 5000],
      durationBoostPerLevel: 2.5
    },
    shield: {
      name: 'Shield Duration',
      icon: '🛡️',
      costs: [400, 800, 1500, 3000, 6000],
      durationBoostPerLevel: 3.0
    },
    boost: {
      name: 'Sprint Duration',
      icon: '⚡',
      costs: [500, 1000, 2000, 4000, 8000],
      durationBoostPerLevel: 1.5
    },
    multiplier: {
      name: '2x Multiplier Duration',
      icon: '2️⃣',
      costs: [350, 700, 1400, 2800, 5500],
      durationBoostPerLevel: 3.0
    }
  },

  // Daily Rewards (7-day calendar)
  DAILY_REWARDS: [
    { day: 1, type: 'coins', amount: 250, label: '250 Coins' },
    { day: 2, type: 'coins', amount: 500, label: '500 Coins' },
    { day: 3, type: 'coins', amount: 800, label: '800 Coins' },
    { day: 4, type: 'coins', amount: 1200, label: '1,200 Coins' },
    { day: 5, type: 'coins', amount: 1800, label: '1,800 Coins' },
    { day: 6, type: 'coins', amount: 2500, label: '2,500 Coins' },
    { day: 7, type: 'coins', amount: 5000, label: '5,000 Super Jackpot!' }
  ],

  // Quests / Missions
  MISSIONS: [
    {
      id: 'distance_500',
      title: 'Jungle Trekker',
      desc: 'Run a total of 500 meters in a single run',
      target: 500,
      type: 'distance_single',
      reward: 300
    },
    {
      id: 'coins_100',
      title: 'Treasure Hunter',
      desc: 'Collect 100 gold coins in one run',
      target: 100,
      type: 'coins_single',
      reward: 350
    },
    {
      id: 'powerups_3',
      title: 'Relic Master',
      desc: 'Pick up 3 power-ups in a single run',
      target: 3,
      type: 'powerups_single',
      reward: 400
    },
    {
      id: 'distance_2000',
      title: 'Expedition Survivor',
      desc: 'Reach 2,000 meters in a single run',
      target: 2000,
      type: 'distance_single',
      reward: 1000
    },
    {
      id: 'coins_total_500',
      title: 'Aztec Hoarder',
      desc: 'Collect 500 total coins across runs',
      target: 500,
      type: 'coins_cumulative',
      reward: 600
    }
  ]
};
