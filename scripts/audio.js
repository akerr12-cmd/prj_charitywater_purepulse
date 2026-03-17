
import { onBeatSuccessGame, onBeatMissGame } from "./game.js";
let isPaused = false;
/* ---------------------------------------------------------
   PURE PULSE — AUDIO ENGINE
   Handles:
   - Web Audio beat scheduling
   - Tap timing detection
   - On-beat / off-beat feedback
--------------------------------------------------------- */

let audioCtx;
let bpm = 120;
let beatInterval = 60 / bpm; // seconds per beat
let nextBeatTime = 0;
let isRunning = false;

const tolerance = 0.15; // 150ms timing window

// DOM elements
const pulseBtn = document.getElementById("pulse-btn");
const tapFeedback = document.getElementById("tap-feedback");
const drumLoop = new Audio("assets/audio/lvl-1-afrobeat-drumloop.mp3");
drumLoop.loop = true;
drumLoop.volume = 0.9;


// ---------------------------------------------------------
// PAUSE / RESUME
// ---------------------------------------------------------
// Pause beat scheduling
window.addEventListener("pause-beat", () => {
  isPaused = true;
  drumLoop.pause();
});

// Resume beat scheduling
window.addEventListener("resume-beat", () => {
  isPaused = false;
  drumLoop.play(); 
  nextBeatTime = audioCtx.currentTime + 0.1;
  scheduler();
});

// Reset beat engine
window.addEventListener("reset-beat", () => {
  isPaused = false;
  drumLoop.currentTime = 0;
  nextBeatTime = audioCtx.currentTime + 0.1;
});

// Fully stop and reset beat engine
window.addEventListener("stop-beat", () => {
  isPaused = false;
  isRunning = false;
  drumLoop.pause();
  drumLoop.currentTime = 0;

  if (audioCtx) {
    nextBeatTime = audioCtx.currentTime + 0.1;
  }
});

// Initialize Audio Context
// ---------------------------------------------------------
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// ---------------------------------------------------------
// Play a simple click sound for the beat
// ---------------------------------------------------------
function playClick(time) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.frequency.value = 800; // click tone
  gain.gain.value = 0.25;

  osc.connect(gain).connect(audioCtx.destination);

  osc.start(time);
  osc.stop(time + 0.05);
}

// ---------------------------------------------------------
// Beat Scheduler (runs every animation frame)
// ---------------------------------------------------------
function scheduler() {
  if (!isRunning || isPaused) return;

  const currentTime = audioCtx.currentTime;

  while (nextBeatTime < currentTime + 0.1) {
   // playClick(nextBeatTime);
    nextBeatTime += beatInterval;
  }

  requestAnimationFrame(scheduler);
}

// ---------------------------------------------------------
// Start the rhythm engine
// ---------------------------------------------------------
export function startBeat() {
  initAudio();

  if (!isRunning) {
    isRunning = true;

    drumLoop.currentTime = 0;
    drumLoop.play();

    nextBeatTime = audioCtx.currentTime + 0.1;
    scheduler();
  }
}


// ---------------------------------------------------------
// Handle Tap Input
// ---------------------------------------------------------
export function handleTap() {
  if (!audioCtx) return;

  const now = audioCtx.currentTime;

  // Find the nearest beat
  const beatsFromStart = nextBeatTime / beatInterval;
  const nearestBeat = Math.round(beatsFromStart) * beatInterval;

  const diff = Math.abs(now - nearestBeat);

  if (diff <= tolerance) {
    onBeatSuccess();
  } else {
    onBeatMiss();
  }
}

// ---------------------------------------------------------
// Success / Miss Feedback
// ---------------------------------------------------------
function onBeatSuccess() {
  tapFeedback.textContent = "On Beat ✨";
  tapFeedback.style.color = "#FBD400";

  // Notify game.js
  onBeatSuccessGame();

  pulseBtn.style.transform = "scale(0.95)";
  setTimeout(() => (pulseBtn.style.transform = "scale(1)"), 100);
}

function onBeatMiss() {
  tapFeedback.textContent = "Off Beat…";
  tapFeedback.style.color = "#ff6b6b";

  // Notify game.js
  onBeatMissGame();
}

// I should now have a fully connected loop: TAP → audio.js detects beat → game.js updates purity + moves water → grid.js re-renders

// ---------------------------------------------------------
// Attach tap listener
// ---------------------------------------------------------
pulseBtn.addEventListener("click", () => {
  startBeat();   // ensures audio starts on first tap
  handleTap();
});