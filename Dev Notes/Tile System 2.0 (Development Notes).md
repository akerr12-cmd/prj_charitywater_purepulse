# 🌊 Pure Pulse — Tile System 2.0  

---

## Player‑Placed Consumables • Boosters • Updated Level Flow

---

### Development Notes (Premium Internal Design Doc)

---

## 🧱 1. Tile Categories

### **A. Static Tiles (Designer‑Placed)**

These define the puzzle layout and cannot be modified by the player.

- **Source** — Starting point for water flow  
- **Pipes** — Direct the water path  
- **Village** — Endpoint; requires minimum purity  
- **Obstacles** — Rocks, dry ground, broken pipes, etc.

---

### **B. Consumable Tiles (Player‑Placed Before Flow)**

These are earned, stored in inventory, and placed by the player before starting the level.

- **BioSand Filter** — Heavy purification  
- **Charcoal Filter** — Light purification  
- **Sensor** — Purity monitoring + objective triggers

---

### **C. Boosters (During-Level Power-Ups)**

Activated mid‑flow; not placed on the grid.

- **Purity Surge** — Instant purity increase  
- **Pipe Repair** — Temporarily fixes a broken pipe  
- **Rhythm Sync Boost** — Temporarily increases purity gained from rhythm actions

---

## 🎒 2. Consumable System Overview

Consumables are earned through:

- Level completion  
- Achievements  
- Purity milestones  
- Impact map progression  

### **Player Flow for Consumables**

1. Level loads (music **off**)  
2. Grid + consumable inventory appear  
3. Player drags consumables onto valid tiles  
4. Player taps **Start Flow**  
5. Music begins  
6. Water begins moving  

This creates a strategic “planning phase” before rhythm gameplay begins.

---

## 💧 3. Consumable Tile Specifications

### **BioSand Filter**

- **Effect:** +10 purity  
- **Placement:** Pipe tiles or empty ground that becomes a pipe  
- **Quantity:** 1–3 per level  
- **Purpose:** Heavy purification; core strategic element  
- **Feedback:** Blue glow, sand‑grain animation, purity pulse  

---

### **Charcoal Filter**

- **Effect:** +5 purity  
- **Placement:** Same as BioSand  
- **Quantity:** 2–5 per level  
- **Purpose:** Mid‑tier purification; supports combo routing  
- **Feedback:** Charcoal ripple, absorb animation  

---

### **Sensor**

- **Effect:** Reads purity; triggers objectives or bonuses  
- **Placement:** Any pipe segment  
- **Quantity:** Varies by level  
- **Purpose:** Monitoring, checkpoints, mission objectives  
- **Feedback:** Yellow pulse, data ping, purity readout  

---

## 🧩 4. Placement Rules

### **Valid Placement**

- Must be placed before starting the level  
- Must attach to the existing pipe network  
- Cannot overwrite Source or Village  
- Cannot be placed on obstacles  

### **Invalid Placement**

- Tile highlights red  
- Shake animation  
- Message: **“This tile can’t support a filter.”**

---

## 🚀 5. Booster Specifications

### **Purity Surge**

- **Effect:** +10 purity instantly  
- **Purpose:** Emergency purification  
- **Visual:** Blue‑white flash through pipes  

---

### **Pipe Repair**

- **Effect:** Temporarily fixes one broken pipe  
- **Purpose:** Represents real‑world maintenance  
- **Visual:** Yellow spark; pipe seals itself  

---

### **Rhythm Sync Boost**

- **Effect:** +3 purity per successful tap for 5 beats  
- **Purpose:** Connects rhythm skill to water quality  
- **Visual:** Enhanced beat pulses  

---

## 🎮 6. Updated Level Flow

1. Level loads (music **off**)  
2. Grid + consumable inventory appear  
3. Player places BioSand, Charcoal, and Sensors  
4. Player taps **Start Flow**  
5. Music begins  
6. Water flows  
7. Player may activate boosters  
8. Level completes → impact screen → rewards  

---

## 🛠️ 7. Future Implementation Notes

- Add drag‑and‑drop UI for consumables  
- Add inventory UI with quantities  
- Add booster activation UI  
- Update game logic to support pre‑flow placement  
- Integrate consumables into level objectives  
- Add animations for all consumable and booster effects  

---
