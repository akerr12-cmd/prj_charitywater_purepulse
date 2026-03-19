import { startTutorial } from "./tutorial.js";
import { startBeat, handleTap as checkTapTiming, setLevelTrack } from "./audio.js";
import {
  renderGrid,
  moveWaterForward,
  resetWater,
  setPlacedConsumables,
  setActiveLevel,
  getPlacementLayout,
  hasReachedVillage
} from "./grid.js";
import { getPlacementSnapshot, initDragAndDrop, lockPlacementGrid } from "./dragdrop.js";

console.log("game.js loaded");

const LEVELS = {
  "malawi-easy": {
    title: "Level 1 - Malawi",
    region: "East Africa - Malawi",
    gameLabel: "Level 1: Malawi (Easy)",
    difficulty: "Easy",
    difficultyPips: 1
  },
  "kenya-medium": {
    title: "Level 2 - Kenya",
    region: "East Africa - Kenya",
    gameLabel: "Level 2: Kenya (Medium)",
    difficulty: "Medium",
    difficultyPips: 2
  },
  "ethiopia-hard": {
    title: "Level 3 - Ethiopia",
    region: "East Africa - Ethiopia",
    gameLabel: "Level 3: Ethiopia (Hard)",
    difficulty: "Hard",
    difficultyPips: 3
  }
};

const CONSUMABLE_BOUNDS = {
  biosand: { min: 1, max: 3 },
  charcoal: { min: 2, max: 5 },
  sensor: { min: 1, max: 3 }
};

/* DOM ELEMENTS */
const titleScreen = document.getElementById("title-screen");
const levelSelectScreen = document.getElementById("level-select-screen");
const levelStartScreen = document.getElementById("level-start-screen");
const gameScreen = document.getElementById("game-screen");

const impactRevealScreen = document.getElementById("impact-reveal");
const impactScreen = document.getElementById("impact-screen");

const startBtn = document.getElementById("start-btn");
const howToPlayBtn = document.getElementById("how-to-play-btn");

const levelOptions = Array.from(document.querySelectorAll(".level-option"));
const levelSelectContinueBtn = document.getElementById("level-select-continue-btn");
const levelSelectBackBtn = document.getElementById("level-select-back-btn");

const lsStartFlowBtn = document.getElementById("ls-start-flow-btn");
const lsBackBtn = document.getElementById("ls-back-btn");
const lsLevelTitle = document.getElementById("ls-level-title");
const lsRegionTag = document.getElementById("ls-region-tag");
const lsDifficultyIcons = document.getElementById("ls-difficulty-icons");
const lsMiniGridPreview = document.getElementById("ls-mini-grid-preview");
const lsMainGrid = document.getElementById("ls-main-grid");

const pulseBtn = document.getElementById("pulse-btn");
const gameLevelName = document.getElementById("game-level-name");

const purityValue = document.getElementById("purity-value");
const sustainValue = document.getElementById("sustain-value");
const litersValue = document.getElementById("liters-value");
const hoursValue = document.getElementById("hours-value");

const boosterPuritySurge = document.getElementById("booster-purity-surge");
const boosterPipeRepair = document.getElementById("booster-pipe-repair");
const boosterRhythmSync = document.getElementById("booster-rhythm-sync");

const impactContinueBtn = document.getElementById("impact-continue-btn");
const playAgainBtn = document.getElementById("play-again-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");
const backToMenuBtn = document.getElementById("back-to-menu-btn");
const backToMenuBtnImpact = document.getElementById("back-to-menu-btn-impact");
const impactLevelSelectBtn = document.getElementById("impact-level-select-btn");

/* GAME STATE */
let selectedLevelId = "malawi-easy";
let purity = 0;
let sustainability = 100;
let taps = 0;
let levelComplete = false;
let isPaused = false;
let rhythmSyncBeatsRemaining = 0;

let boostersUsed = {
  puritySurge: false,
  pipeRepair: false,
  rhythmSync: false
};

/* SCREEN SWITCHING */
export function showScreen(screen) {
  const target =
    typeof screen === "string" ? document.getElementById(screen) : screen;
  if (!target) return;

  document.querySelectorAll(".screen").forEach((section) => {
    section.classList.add("hidden");
    section.classList.remove("active");
  });

  target.classList.remove("hidden");
  target.classList.add("active");

  // Strict audio lifecycle: music is allowed only on the game screen.
  if (target.id !== "game-screen") {
    window.dispatchEvent(new Event("stop-beat"));
  }
}

export function hideScreen(screen) {
  const target =
    typeof screen === "string" ? document.getElementById(screen) : screen;
  if (!target) return;

  target.classList.add("hidden");
  target.classList.remove("active");
}

function getActiveLevel() {
  return LEVELS[selectedLevelId] || LEVELS["malawi-easy"];
}

function randomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setRhythmControlsEnabled(enabled) {
  if (!pulseBtn) return;
  pulseBtn.disabled = !enabled;
}

function renderDifficultyPips(count) {
  if (!lsDifficultyIcons) return;

  lsDifficultyIcons.innerHTML = "";

  for (let i = 0; i < 3; i += 1) {
    const pip = document.createElement("span");
    pip.textContent = i < count ? "O" : "o";
    pip.style.margin = "0 3px";
    pip.style.fontWeight = "700";
    lsDifficultyIcons.appendChild(pip);
  }
}

function renderLevelStartGrids() {
  const layout = getPlacementLayout();

  if (lsMiniGridPreview) lsMiniGridPreview.innerHTML = "";
  if (lsMainGrid) lsMainGrid.innerHTML = "";

  for (let row = 0; row < 6; row += 1) {
    for (let col = 0; col < 6; col += 1) {
      const tileType = layout[row][col];

      if (lsMiniGridPreview) {
        const mini = document.createElement("div");
        mini.className = `grid-tile ${tileType}`;
        lsMiniGridPreview.appendChild(mini);
      }

      if (lsMainGrid) {
        const tile = document.createElement("div");
        tile.className = `grid-tile ${tileType}`;
        tile.dataset.type = tileType;
        tile.dataset.row = String(row);
        tile.dataset.col = String(col);
        lsMainGrid.appendChild(tile);
      }
    }
  }
}

function refreshConsumableInventory() {
  const cards = Array.from(document.querySelectorAll("#ls-inventory-bar .consumable-card"));

  cards.forEach((card) => {
    const type = card.dataset.type;
    const bounds = CONSUMABLE_BOUNDS[type];
    const qty = bounds ? randomIntInclusive(bounds.min, bounds.max) : 1;
    const qtyNode = card.querySelector(".qty");

    if (qtyNode) qtyNode.textContent = String(qty);
    card.setAttribute("draggable", "true");
    card.classList.remove("disabled");
  });
}

function lockLevelStartBoosters() {
  document.querySelectorAll("#ls-booster-strip .booster").forEach((booster) => {
    booster.classList.add("locked");
  });
}

function updateLevelMetaInUi() {
  const level = getActiveLevel();

  if (lsLevelTitle) lsLevelTitle.textContent = level.title;
  if (lsRegionTag) lsRegionTag.textContent = level.region;
  if (gameLevelName) gameLevelName.textContent = level.gameLabel;

  renderDifficultyPips(level.difficultyPips);
}

function prepareLevelStart() {
  setActiveLevel(selectedLevelId);
  setLevelTrack(selectedLevelId);
  updateLevelMetaInUi();
  renderLevelStartGrids();
  refreshConsumableInventory();
  lockLevelStartBoosters();
  initDragAndDrop();
  setRhythmControlsEnabled(false);
}

function resetBoosterState() {
  rhythmSyncBeatsRemaining = 0;

  boostersUsed = {
    puritySurge: false,
    pipeRepair: false,
    rhythmSync: false
  };

  [boosterPuritySurge, boosterPipeRepair, boosterRhythmSync].forEach((btn) => {
    if (!btn) return;
    btn.classList.add("locked");
    btn.disabled = true;
  });
}

function unlockGameBoosters() {
  [boosterPuritySurge, boosterPipeRepair, boosterRhythmSync].forEach((btn) => {
    if (!btn) return;
    btn.classList.remove("locked");
    btn.disabled = false;
  });
}

/* START GAME */
export function startGame() {
  setActiveLevel(selectedLevelId);
  setLevelTrack(selectedLevelId);

  purity = 0;
  sustainability = 100;
  taps = 0;
  levelComplete = false;
  isPaused = false;

  purityValue.textContent = "0%";
  sustainValue.textContent = "100%";

  resetBoosterState();
  lockPlacementGrid();

  const placementSnapshot = getPlacementSnapshot();
  setPlacedConsumables(placementSnapshot);

  resetWater();
  renderGrid();

  showScreen(gameScreen);
  unlockGameBoosters();
  setRhythmControlsEnabled(true);
  startBeat();
}

/* BEAT SUCCESS */
export function onBeatSuccessGame() {
  if (levelComplete) return;

  taps += 1;

  let totalGain = 5;
  if (rhythmSyncBeatsRemaining > 0) {
    totalGain += 3;
    rhythmSyncBeatsRemaining -= 1;
  }

  increasePurity(totalGain);
  moveWaterForward();
  checkForWin();
}

/* BEAT MISS */
export function onBeatMissGame() {
  sustainability = Math.max(0, sustainability - 1);
  sustainValue.textContent = sustainability + "%";
}

/* WIN CHECK */
function checkForWin() {
  if (purity >= 50 && hasReachedVillage()) {
    levelComplete = true;
    setTimeout(showImpactReveal, 800);
  }
}

/* CONFETTI */
function launchConfetti() {
  const container = document.getElementById("confetti-container");
  container.innerHTML = "";

  const colors = ["#FFC907", "#ffffff", "#87CEEB"];

  for (let i = 0; i < 40; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");

    const color = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.setProperty("--confetti-color", color);

    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.animationDelay = Math.random() * 0.5 + "s";
    confetti.style.opacity = 0.7 + Math.random() * 0.3;

    container.appendChild(confetti);
  }
}

/* IMPACT REVEAL */
function showImpactReveal() {
  showScreen(impactRevealScreen);
  launchConfetti();
}

/* FIREWORKS */
function launchFireworks() {
  const container = document.getElementById("fireworks-container");
  container.innerHTML = "";

  const colors = ["#FFC907", "#ffffff", "#87CEEB"];

  for (let i = 0; i < 18; i++) {
    const fw = document.createElement("div");
    fw.classList.add("firework");

    const color = colors[Math.floor(Math.random() * colors.length)];
    fw.style.setProperty("--fw-color", color);

    const angle = Math.random() * Math.PI * 2;
    const distance = 180 + Math.random() * 140;

    fw.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
    fw.style.setProperty("--y", `${Math.sin(angle) * distance}px`);

    fw.style.left = "50%";
    fw.style.top = "40%";

    container.appendChild(fw);
  }
}

/* IMPACT REPORT */
function showImpactReport() {
  const liters = taps * 10;
  const hours = Math.floor(taps / 4);

  if (litersValue) {
    litersValue.textContent = liters;
    litersValue.classList.add("pulse-number");
    setTimeout(() => litersValue.classList.remove("pulse-number"), 700);
  }

  if (hoursValue) {
    hoursValue.textContent = hours;
    hoursValue.classList.add("pulse-number");
    setTimeout(() => hoursValue.classList.remove("pulse-number"), 700);
  }

  showScreen(impactScreen);
  launchFireworks();
}

/* PAUSE + RESET */
function pauseGame() {
  if (levelComplete) return;

  isPaused = !isPaused;

  if (isPaused) {
    pauseBtn.textContent = "Resume";
    window.dispatchEvent(new Event("pause-beat"));
  } else {
    pauseBtn.textContent = "Pause";
    window.dispatchEvent(new Event("resume-beat"));
  }
}

function resetLevel() {
  purity = 0;
  sustainability = 100;
  taps = 0;
  levelComplete = false;
  isPaused = false;

  purityValue.textContent = "0%";
  sustainValue.textContent = "100%";

  if (pauseBtn) pauseBtn.textContent = "Pause";

  resetBoosterState();
  unlockGameBoosters();

  resetWater();
  renderGrid();

  window.dispatchEvent(new Event("reset-beat"));
  startBeat();
}

/* BOOSTERS */
function usePuritySurge() {
  if (boostersUsed.puritySurge || levelComplete) return;
  boostersUsed.puritySurge = true;

  increasePurity(10);

  if (boosterPuritySurge) {
    boosterPuritySurge.classList.add("locked");
    boosterPuritySurge.disabled = true;
  }
}

function usePipeRepair() {
  if (boostersUsed.pipeRepair || levelComplete) return;
  boostersUsed.pipeRepair = true;

  sustainability = Math.min(100, sustainability + 15);
  sustainValue.textContent = sustainability + "%";

  if (boosterPipeRepair) {
    boosterPipeRepair.classList.add("locked");
    boosterPipeRepair.disabled = true;
  }
}

function useRhythmSync() {
  if (boostersUsed.rhythmSync || levelComplete) return;
  boostersUsed.rhythmSync = true;
  rhythmSyncBeatsRemaining = 5;

  if (boosterRhythmSync) {
    boosterRhythmSync.classList.add("locked");
    boosterRhythmSync.disabled = true;
  }
}

/* PURITY */
export function increasePurity(amount) {
  purity = Math.min(100, purity + amount);
  purityValue.textContent = purity + "%";
}

/* MAIN MENU */
export function returnToMainMenu() {
  levelComplete = false;
  isPaused = false;

  if (pauseBtn) pauseBtn.textContent = "Pause";

  window.dispatchEvent(new Event("reset-beat"));

  showScreen(titleScreen);
  setRhythmControlsEnabled(false);
}

/* EVENT LISTENERS */
if (startBtn) {
  startBtn.addEventListener("click", () => {
    showScreen(levelSelectScreen);
  });
}

if (levelOptions.length) {
  levelOptions.forEach((option) => {
    option.addEventListener("click", () => {
      levelOptions.forEach((btn) => btn.classList.remove("selected"));
      option.classList.add("selected");
      selectedLevelId = option.dataset.levelId;
      setLevelTrack(selectedLevelId);
    });
  });
}

if (levelSelectContinueBtn) {
  levelSelectContinueBtn.addEventListener("click", () => {
    prepareLevelStart();
    showScreen(levelStartScreen);
  });
}

if (levelSelectBackBtn) {
  levelSelectBackBtn.addEventListener("click", () => {
    showScreen(titleScreen);
  });
}

if (lsStartFlowBtn) {
  lsStartFlowBtn.addEventListener("click", () => {
    startGame();
  });
}

if (lsBackBtn) {
  lsBackBtn.addEventListener("click", () => {
    showScreen(levelSelectScreen);
  });
}

if (impactContinueBtn) {
  impactContinueBtn.addEventListener("click", () => {
    hideScreen(impactRevealScreen);
    showImpactReport();
  });
}

if (playAgainBtn) {
  playAgainBtn.addEventListener("click", () => {
    prepareLevelStart();
    showScreen(levelStartScreen);
  });
}

if (pauseBtn) pauseBtn.addEventListener("click", pauseGame);
if (resetBtn) resetBtn.addEventListener("click", resetLevel);

if (pulseBtn) {
  pulseBtn.addEventListener("click", () => {
    if (!levelComplete && !pulseBtn.disabled) {
      checkTapTiming();
    }
  });
}

if (boosterPuritySurge) boosterPuritySurge.addEventListener("click", usePuritySurge);
if (boosterPipeRepair) boosterPipeRepair.addEventListener("click", usePipeRepair);
if (boosterRhythmSync) boosterRhythmSync.addEventListener("click", useRhythmSync);

if (backToMenuBtn) backToMenuBtn.addEventListener("click", returnToMainMenu);
if (backToMenuBtnImpact) backToMenuBtnImpact.addEventListener("click", returnToMainMenu);
if (impactLevelSelectBtn) {
  impactLevelSelectBtn.addEventListener("click", () => {
    showScreen(levelSelectScreen);
    setRhythmControlsEnabled(false);
  });
}

if (howToPlayBtn) {
  howToPlayBtn.addEventListener("click", () => {
    startTutorial();
  });
}

/* INITIAL LOAD */
window.showScreen = showScreen;
window.hideScreen = hideScreen;

resetBoosterState();
setRhythmControlsEnabled(false);
showScreen(titleScreen);
