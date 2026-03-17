import { startTutorial } from "./tutorial.js";
import { startBeat } from "./audio.js";
import { renderGrid, moveWaterForward, resetWater, levelOne } from "./grid.js";

/* DOM ELEMENTS */
const titleScreen = document.getElementById("title-screen");
const gameScreen = document.getElementById("game-screen");
const impactScreen = document.getElementById("impact-screen");

const startBtn = document.getElementById("start-btn");
const playAgainBtn = document.getElementById("play-again-btn");
const howToPlayBtn = document.getElementById("how-to-play-btn");

const purityValue = document.getElementById("purity-value");
const sustainValue = document.getElementById("sustain-value");

const litersValue = document.getElementById("liters-value");
const hoursValue = document.getElementById("hours-value");

const backToMenuBtn = document.getElementById("back-to-menu-btn");
const backToMenuBtnImpact = document.getElementById("back-to-menu-btn-impact");
const replayTutorialBtn = document.getElementById("replay-tutorial-btn");

/* GAME STATE */
let purity = 0;
let sustainability = 100;
let taps = 0;
let levelComplete = false;

/* SCREEN SWITCHING */
export function showScreen(screen) {
  titleScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
  impactScreen.classList.add("hidden");

  screen.classList.remove("hidden");
}

/* START GAME */
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

/* BEAT SUCCESS */
export function onBeatSuccessGame() {
  if (levelComplete) return;

  taps += 1;
  increasePurity(5);
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
  if (purity >= 50 && waterReachedVillage()) {
    levelComplete = true;
    setTimeout(showImpactReport, 800);
  }
}

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

/* IMPACT REPORT */
function showImpactReport() {
  const liters = taps * 10;
  const hours = Math.floor(taps / 4);

  litersValue.textContent = liters;
  hoursValue.textContent = hours;

  showScreen(impactScreen);
}

/* PAUSE + RESET */
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");

let isPaused = false;

function pauseGame() {
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

  purityValue.textContent = "0%";
  sustainValue.textContent = "100%";

  resetWater();
  renderGrid();

  window.dispatchEvent(new Event("reset-beat"));
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

  window.dispatchEvent(new Event("pause-beat"));
  window.dispatchEvent(new Event("reset-beat"));

  showScreen(titleScreen);
}

/* EVENT LISTENERS */
startBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
resetBtn.addEventListener("click", resetLevel);

backToMenuBtn.addEventListener("click", returnToMainMenu);
backToMenuBtnImpact.addEventListener("click", returnToMainMenu);

howToPlayBtn.addEventListener("click", startTutorial);
replayTutorialBtn.addEventListener("click", startTutorial);

/* INITIAL LOAD */
showScreen(titleScreen);
