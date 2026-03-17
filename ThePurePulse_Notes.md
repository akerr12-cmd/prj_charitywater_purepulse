# 🌊 PURE PULSE — DEVELOPMENT NOTES
A living document tracking progress, decisions, and next steps for the Charity: Water mini‑game.

---

## ✅ CURRENT STATUS (as of project start)
**Core decisions made:**
- Tech stack: HTML + CSS + JavaScript (no frameworks)
- Editor: Visual Studio Code
- Structure: Modular JS files (`audio.js`, `grid.js`, `game.js`)
- Visual style: Minimalist, modern, Charity: Water brand colors
- Game loop defined:
  - Place blocks → Tap to beat → Water moves → Purity increases → Impact Report

**Files created so far:**
- `index.html` (three screens: Title, Game, Impact)
- `styles/main.css` (starter layout + UI styling)
- `scripts/audio.js` (in progress — rhythm engine being built)

---

## 🎵 AUDIO ENGINE (audio.js)
**Completed:**
- Web Audio API initialized
- Beat scheduler created
- 120 BPM click track implemented
- Tap detection logic added
- On-beat / off-beat feedback working
- Hooks added for future game logic:
  - `moveWaterForward()`
  - `increasePurity()`
  - `stagnateWater()`

**Next steps:**
- Add layered audio stems (base beat + flow pad)
- Add purity‑based volume fades
- Add soft “ping” for perfect taps
- Add muffled sound for missed taps

---

## 🧩 GRID SYSTEM (grid.js)
**Not yet built — planned structure:**
- 6×6 grid rendered with CSS Grid
- Tiles represented as objects in a 2D array
- Tile types:
  - 0 = empty
  - 1 = source
  - 2 = BioSand filter
  - 3 = Charcoal filter
  - 4 = pipe
  - 5 = village goal

**Planned features:**
- Render grid visually in DOM
- Highlight active water tile
- Move water one tile per successful beat
- Increase purity when passing through filters
- Trigger win state when reaching village

---

## 💧 WATER + PURITY SYSTEM (game.js)
**Planned logic:**
- `purity` starts at 0%
- Successful beat → water advances + purity increases
- Missed beat → water stagnates or purity drops slightly
- Purity thresholds:
  - 0–25% → Dry Beat
  - 25–75% → Flow Begins
  - 75–100% → Sensor Sync
  - 100% → Village Celebration

**Visual feedback planned:**
- Grid glow on beat
- Filter glow on perfect taps
- Water surge animation
- Color bloom as purity increases

---

## 🏁 LEVEL 1 — MVP DESIGN
**Location:** Machinga, Malawi  
**Goal:** Move water from Source → BioSand → Village  
**Difficulty:** Very easy (teaches rhythm + movement)

**Requirements:**
- 10–12 successful taps to reach the village
- At least 50% purity to pass
- Simple path (no branching)

---

## 📊 IMPACT REPORT SCREEN
**Planned elements:**
- Before/After photo (placeholder for now)
- Stats:
  - Liters Filtered
  - Hours Saved
  - Monitoring %
- Project ID + location
- “Share Your Impact” button
- “Keep the Pulse Going” button

**Notes:**
- Stats will be calculated from gameplay performance
- Sharing can be simple (copy text to clipboard)

---

## 🗺️ FUTURE FEATURES (Phase 2+)
- World map level select
- Multiple levels (Ethiopia, Nepal, Cambodia)
- UV filter + Sensor blocks
- Adaptive BPM (slight increase near goal)
- Water particle system (Canvas or SVG)
- Animated blooms around the grid at 100% purity
- Social share card generator

---

## 🧠 DESIGN PRINCIPLES
- Minimalist, tactile UI
- No preachy messaging — impact is felt, not told
- Music and visuals evolve with player success
- Every tap should feel satisfying and meaningful
- The game should function as a “study break,” not a chore

---

## 📝 OPEN QUESTIONS
- Should Level 1 include pipes or just a straight path?
- Should purity drop on missed beats or only stagnate?
- Should the water move in “packets” or a continuous flow?
- Should the Impact Report show a real project photo or a stylized placeholder for MVP?

---

## 📅 TWO-WEEK ROADMAP (summary)
**Week 1:**  
- Rhythm engine  
- Grid system  
- Water movement  
- Purity logic  
- Basic audio layering  

**Week 2:**  
- Title screen polish  
- Impact Report  
- Animations + pulse effects  
- Mobile responsiveness  
- Playtesting + tuning  

---

## ✨ NOTES TO SELF
- Keep everything modular and readable.
- Prioritize the “feel” of tapping — this is the soul of the game.
- Don’t overbuild Level 1; MVP first, polish later.
- Remember: this is for students. It should feel cool, modern, and calming.