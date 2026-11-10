# 🌴 JUNGLE RUSH 3D - 3D Endless Runner Game

[![Android APK Release](https://img.shields.io/badge/Download-Android%20APK%20(v1.0.0)-green?logo=android)](https://github.com/ayushkumar90757-svg/jungle-rush-3d/releases/download/v1.0.0/JungleRush3D-v1.0.0.apk)
[![GitHub Release](https://img.shields.io/github/v/release/ayushkumar90757-svg/jungle-rush-3d)](https://github.com/ayushkumar90757-svg/jungle-rush-3d/releases/tag/v1.0.0)

A high-performance, polished 3D endless runner inspired by Temple Run 2, featuring original jungle assets, procedural humanoid characters, dynamic WebAudio tribal soundtrack, object pooling, and responsive mobile + desktop controls.

---

## 📱 Download & Install Android APK

You can download and play the game directly on your Android phone:
- **Direct APK Download**: [**`JungleRush3D-v1.0.0.apk` (4.1 MB)**](https://github.com/ayushkumar90757-svg/jungle-rush-3d/releases/download/v1.0.0/JungleRush3D-v1.0.0.apk)
- **GitHub Release Page**: [v1.0.0 Release Notes & Assets](https://github.com/ayushkumar90757-svg/jungle-rush-3d/releases/tag/v1.0.0)

### Quick Phone Installation:
1. Tap the direct APK download link on your phone.
2. Open the downloaded `JungleRush3D-v1.0.0.apk` file.
3. Allow "Install unknown apps" when prompted by Android.
4. Tap **Install** and enjoy running!

---

## 🎮 How to Play Immediately

### Option A: Direct Web Server (Node.js)
```bash
# In project folder:
npm start
# Then open http://localhost:3000 in your browser!
```

### Option B: Fast Vite Dev Server
```bash
npm run dev
# Then open http://localhost:3000
```

---

## 🕹️ Controls

| Action | Keyboard | Touch / Mobile | On-Screen Virtual Buttons |
|---|---|---|---|
| **Move Left** | `A` or `Left Arrow` | Swipe Left | `◀` Left Button |
| **Move Right** | `D` or `Right Arrow` | Swipe Right | `▶` Right Button |
| **Jump** | `W`, `Up Arrow`, `Space` | Swipe Up | `▲` Jump Button |
| **Slide** | `S`, `Down Arrow` | Swipe Down | `▼` Slide Button |
| **Pause** | `Escape` or `P` | Tap ⏸ Button | Tap ⏸ Button |

---

## 🌟 Key Features

1. **Core Gameplay & Mechanics**:
   - 3-lane smooth lateral navigation with realistic bank lean.
   - Jump physics with apex hang and ground snap.
   - Slide mechanics that dynamically shrink collision bounds from 1.9m to 0.65m.
   - Low obstacles (mossy fallen logs, ancient spike traps) -> Require Jump.
   - High obstacles (temple archways, horizontal fire jets) -> Require Slide.
   - Full lane blockers (ancient boulders and totems) -> Require Evade.
   - Golden Aztec medallions spawning in straight lines, jump arcs, and slide trails.
   - 4 distinct Power-Ups:
     * 🧲 **Coin Magnet**: Pulls coins directly towards runner.
     * 🛡️ **Relic Shield**: Absorbs a lethal impact and emits a shockwave.
     * ⚡ **Jungle Sprint**: 1.6x speed boost with total obstacle invulnerability.
     * 2️⃣ **Double Coins**: 2x multiplier for score and coins.

2. **Characters**:
   - **Dash Drake**: The veteran explorer (balanced speed and stamina).
   - **Maya Shadow**: Agile jungle scout (+20% magnet radius).
   - **Captain Rex**: Armored commando (+3s shield duration).

3. **Audio & Sound**:
   - 100% Procedural Web Audio API tribal jungle soundtrack: live-synthesized Djembe drums, Congas, Shakers, and Jungle Marimba melodies.
   - Low-latency sound effects for footsteps, jumps, slides, coin combo chimes, shield breaks, and impacts.
   - Separate master, music, and SFX volume sliders in Settings.

4. **Performance & Low-End Android Optimization**:
   - Zero runtime Garbage Collection: complete object pooling for chunks, obstacles, coins, and particles.
   - Target stable 60 FPS.
   - Toggleable graphics quality (High: PCF Soft Shadows & full effects; Low: Unshadowed high-efficiency mode for budget devices).

5. **Unity 3D Engine Suite**:
   - Full production-ready C# scripts included in `unity_scripts/` for direct import into Unity 2022/2023/6.0 LTS projects.
