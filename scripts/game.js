import { startTutorial } from "./tutorial.js";
import { startBeat, handleTap as checkTapTiming } from "./audio.js";
import { renderGrid, moveWaterForward, resetWater, levelOne } from "./grid.js";

console.log("game.js loaded");

/* DOM ELEMENTS */
const titleScreen = document.getElementById("title-screen");
const gameScreen = document.getElementById("game-screen");
const impactRevealScreen = document.getElementById("impact-reveal");
const impactScreen = document.getElementById("impact-screen");

const startBtn = document.getElementById("start-btn");
const impactContinueBtn = document.getElementById("impact-continue-btn");
const playAgainBtn = document.getElementById("play-again-btn");
const howToPlayBtn = document.getElementById("how-to-play-btn");
const pulseBtn = document.getElementById("pulse-btn");

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
  const target =
    typeof screen === "string" ? document.getElementById(screen) : screen;
  if (!target) return;

  document.querySelectorAll(".screen").forEach((section) => {
    section.classList.add("hidden");
    section.classList.remove("active");
  });

  target.classList.remove("hidden");
  target.classList.add("active");
}

export function hideScreen(screen) {
  const target =
    typeof screen === "string" ? document.getElementById(screen) : screen;
  if (!target) return;

  target.classList.add("hidden");
  target.classList.remove("active");
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
    setTimeout(showImpactReveal, 800);
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

/* CONFETTI ANIMATION */
function launchConfetti() {
  const container = document.getElementById("confetti-container");
  container.innerHTML = ""; // reset

  const colors = ["#FFC907", "#ffffff", "#87CEEB"]; // yellow, white, soft blue

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

/* IMPACT REVEAL (EMOTIONAL MOMENT) */
function showImpactReveal() {
  window.dispatchEvent(new Event("stop-beat"));
  showScreen("impact-reveal");
  launchConfetti();
}

/* IMPACT REPORT (STATS) */
function showImpactReport() {
  const liters = taps * 10;
  const hours = Math.floor(taps / 4);

  if (litersValue) litersValue.textContent = liters;
  if (hoursValue) hoursValue.textContent = hours;

  showScreen("impact-screen");
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
if (startBtn) startBtn.addEventListener("click", startGame);
if (playAgainBtn) playAgainBtn.addEventListener("click", startGame);

if (impactContinueBtn) {
  impactContinueBtn.addEventListener("click", () => {
    hideScreen("impact-reveal");
    showImpactReport();
  });
}

if (pauseBtn) pauseBtn.addEventListener("click", pauseGame);
if (resetBtn) resetBtn.addEventListener("click", resetLevel);

if (pulseBtn) {
  pulseBtn.addEventListener("click", () => {
    startBeat();
    if (!levelComplete) {
      checkTapTiming();
    }
  });
}

if (backToMenuBtn) backToMenuBtn.addEventListener("click", returnToMainMenu);
if (backToMenuBtnImpact) {
  backToMenuBtnImpact.addEventListener("click", returnToMainMenu);
}

if (howToPlayBtn) {
  howToPlayBtn.addEventListener("click", () => {
    startTutorial();
  });
}

if (replayTutorialBtn) {
  replayTutorialBtn.addEventListener("click", () => {
    startTutorial();
  });
}

/* INITIAL LOAD */
window.showScreen = showScreen;
window.hideScreen = hideScreen;

console.log("titleScreen element:", titleScreen);
console.log("About to show title screen");
showScreen(titleScreen);
console.log("Title screen shown");
