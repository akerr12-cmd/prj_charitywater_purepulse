/* ---------------------------------------------------------
   PURE PULSE — GAME CONTROLLER
   Handles:
   - Screen switching
   - Purity + sustainability tracking
   - Connecting audio.js → grid.js
   - Win state → Impact Report
--------------------------------------------------------- */

import { startBeat } from "./audio.js";
import { renderGrid, moveWaterForward, resetWater, levelOne } from "./grid.js";

/* ---------------------------------------------------------
   DOM ELEMENTS
--------------------------------------------------------- */
const titleScreen = document.getElementById("title-screen");
const gameScreen = document.getElementById("game-screen");
const impactScreen = document.getElementById("impact-screen");

const startBtn = document.getElementById("start-btn");
const playAgainBtn = document.getElementById("play-again-btn");

const purityValue = document.getElementById("purity-value");
const sustainValue = document.getElementById("sustain-value");

const litersValue = document.getElementById("liters-value");
const hoursValue = document.getElementById("hours-value");

/* ---------------------------------------------------------
   GAME STATE
--------------------------------------------------------- */
let purity = 0;          // 0–100%
let sustainability = 100; // placeholder for now
let taps = 0;            // total successful taps
let levelComplete = false;

/* ---------------------------------------------------------
   SCREEN SWITCHING
--------------------------------------------------------- */
function showScreen(screen) {
  titleScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
  impactScreen.classList.add("hidden");

  screen.classList.remove("hidden");
  screen.classList.add("active");
}

/* ---------------------------------------------------------
   START GAME
--------------------------------------------------------- */
function startGame() {
  purity = 0;
  sustainability = 100;
  taps = 0;
  levelComplete = false;

  purityValue.textContent = "0%";
  sustainValue.textContent = "100%";

  resetWater();
  renderGrid();

  showScreen(gameScreen);
  startBeat();
}

/* ---------------------------------------------------------
   HANDLE SUCCESSFUL BEAT (called from audio.js)
--------------------------------------------------------- */
export function onBeatSuccessGame() {
  if (levelComplete) return;

  taps += 1;

  // Increase purity
  purity = Math.min(100, purity + 5);
  purityValue.textContent = purity + "%";

  // Move water forward
  moveWaterForward();

  // Check win condition
  checkForWin();
}

/* ---------------------------------------------------------
   HANDLE MISSED BEAT
--------------------------------------------------------- */
export function onBeatMissGame() {
  sustainability = Math.max(0, sustainability - 1);
  sustainValue.textContent = sustainability + "%";
}

/* ---------------------------------------------------------
   CHECK WIN CONDITION
--------------------------------------------------------- */
function checkForWin() {
  // If purity is high enough and water reached the end
  if (purity >= 50 && waterReachedVillage()) {
    levelComplete = true;
    setTimeout(showImpactReport, 800);
  }
}

/* ---------------------------------------------------------
   CHECK IF WATER IS AT THE VILLAGE
--------------------------------------------------------- */
function waterReachedVillage() {
  const end = levelOne.endPos;
  const waterTile = document.querySelector(".water");

  if (!waterTile) return false;

  const tiles = Array.from(document.querySelectorAll("#grid-container .tile"));
  const index = tiles.indexOf(waterTile);

  const row = Math.floor(index / 6);
  const col = index % 6;

  return row === end.row && col === end.col;
}

/* ---------------------------------------------------------
   IMPACT REPORT
--------------------------------------------------------- */
function showImpactReport() {
  // Convert taps → liters + hours
  const liters = taps * 10; // placeholder formula
  const hours = Math.floor(taps / 4);

  litersValue.textContent = liters;
  hoursValue.textContent = hours;

  showScreen(impactScreen);
}

/* ---------------------------------------------------------
   EVENT LISTENERS
--------------------------------------------------------- */
startBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("click", startGame);

/* ---------------------------------------------------------
   INITIAL LOAD
--------------------------------------------------------- */
showScreen(titleScreen);