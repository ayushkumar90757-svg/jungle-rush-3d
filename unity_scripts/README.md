# JUNGLE RUSH 3D - UNITY ENGINE INTEGRATION GUIDE

This folder contains the complete, production-ready C# architecture for **JUNGLE RUSH 3D**, built according to senior gameplay engineering and performance optimization standards.

---

## 📁 Architecture Overview

| Script | Purpose |
|---|---|
| `GameManager.cs` | Master state machine (`Menu`, `Playing`, `Paused`, `GameOver`), score tabulation, and time scale control. |
| `PlayerController.cs` | 3-lane movement (-2.5, 0, 2.5), CharacterController physics, smooth lane switching, jump with gravity curves, slide with dynamic collider resizing (1.9m -> 0.65m), touch swipe gestures, and invulnerability. |
| `TrackManager.cs` | Chunk-based track spawner with pooling, recycling behind player, and dynamic obstacle/coin placement. |
| `ObjectPooler.cs` | High-efficiency generic queue-based object pooler (0 garbage collection allocations during gameplay). |
| `Obstacle.cs` | Low jump obstacles (logs, spike traps), high slide obstacles (arches, fire jets), and full lane blockers (boulders). |
| `Coin.cs` | Rotating 3D gold Aztec medallions with magnetic attraction towards player. |
| `PowerUpManager.cs` | Magnet, Shield, Speed Boost, and 2x Multiplier duration timers and HUD integration. |
| `UIManager.cs` | Complete canvas UI controller (HUD, Pause, Game Over, Shop, Characters, Settings). |
| `AudioManager.cs` | Dual-bus audio controller for jungle background music and responsive sound effects. |
| `SaveSystem.cs` | JSON-based persistent save system for coins, high score, best distance, and power-up upgrades. |

---

## 🛠️ Unity Setup Instructions

### 1. Layers & Tags
Create the following in `Project Settings -> Tags and Layers`:
- **Tags**: `Player`, `Obstacle`, `Coin`, `PowerUp`
- **Layers**: `Player`, `Obstacles`, `Collectibles`, `Ground`

### 2. Scene Hierarchy Setup
1. Create an empty GameObject named `_GameManager` and attach `GameManager.cs`, `SaveSystem.cs`, and `UIManager.cs`.
2. Create an empty GameObject named `_ObjectPooler` and attach `ObjectPooler.cs`. Populate `itemsToPool` with prefabs for:
   - `TrackChunk` (Size: 10)
   - `Obstacle_Log` (Size: 15)
   - `Obstacle_Arch` (Size: 15)
   - `Obstacle_Boulder` (Size: 15)
   - `Coin` (Size: 80)
   - `PowerUp_Magnet`, `PowerUp_Shield`, `PowerUp_Boost`, `PowerUp_Multiplier` (Size: 4 each)
3. Create an empty GameObject named `_TrackManager` and attach `TrackManager.cs`.
4. Attach `PlayerController.cs` to your player character model with a `CharacterController` component.
5. Create a Canvas with UI elements hooked to `UIManager.cs`.

### 3. Mobile Optimization Settings (Android / iOS)
- In `Project Settings -> Quality`:
  - Set **Texture Quality** to Full Res, **Anisotropic Filtering** to Per Texture.
  - Set **Shadow Resolution** to Medium or Low on budget mobile profiles.
  - Set **Target Frame Rate** in script: `Application.targetFrameRate = 60;`.
- In `Player Settings`:
  - Graphics API: **Vulkan** / **OpenGLES3**.
  - Scripting Backend: **IL2CPP**.
  - Target Architecture: **ARM64**.
