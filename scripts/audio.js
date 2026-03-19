
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

let mediaSourceNode;
let analyser;
let freqData;
let lowEnergyAvg = 0;
let lastPeakTime = 0;
let lastStrongBeatTime = 0;
let strongBeatInterval = beatInterval;
const strongBeatHistory = [];

const tolerance = 0.08; // 80ms timing window

const LEVEL_TRACKS = {
  "malawi-easy": "assets/audio/easy_lvl_120bpm.mp3",
  "kenya-medium": "assets/audio/med_lvl_80bpm.mp3",
  "ethiopia-hard": "assets/audio/hard_lvl_119bpm.mp3"
};

const DEFAULT_TRACK = "assets/audio/easy_lvl_120bpm.mp3";
let currentTrackSrc = DEFAULT_TRACK;

// DOM elements
const tapFeedback = document.getElementById("tap-feedback");
const drumLoop = new Audio(currentTrackSrc);
drumLoop.loop = true;
drumLoop.volume = 0.9;

export function setLevelTrack(levelId) {
  const requestedSrc = LEVEL_TRACKS[levelId] || DEFAULT_TRACK;
  if (requestedSrc === currentTrackSrc) return;

  currentTrackSrc = requestedSrc;

  const wasRunning = isRunning;
  drumLoop.pause();
  drumLoop.src = currentTrackSrc;
  drumLoop.load();

  // Keep beat scheduling consistent after track switches.
  if (wasRunning && !isPaused) {
    drumLoop.currentTime = 0;
    drumLoop.play();
  }
}


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
  if (!audioCtx) return;
  audioCtx?.resume();
  drumLoop.play(); 
  nextBeatTime = audioCtx.currentTime + 0.1;
  scheduler();
});

// Reset beat engine
window.addEventListener("reset-beat", () => {
  isPaused = false;
  drumLoop.currentTime = 0;
  lowEnergyAvg = 0;
  lastPeakTime = 0;
  lastStrongBeatTime = 0;
  strongBeatInterval = beatInterval;
  strongBeatHistory.length = 0;
  if (audioCtx) {
    nextBeatTime = audioCtx.currentTime + 0.1;
  }
});

// Fully stop and reset beat engine
window.addEventListener("stop-beat", () => {
  isPaused = false;
  isRunning = false;
  drumLoop.pause();
  drumLoop.currentTime = 0;

  lowEnergyAvg = 0;
  lastPeakTime = 0;
  lastStrongBeatTime = 0;
  strongBeatInterval = beatInterval;
  strongBeatHistory.length = 0;

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

  if (!mediaSourceNode) {
    mediaSourceNode = audioCtx.createMediaElementSource(drumLoop);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    freqData = new Uint8Array(analyser.frequencyBinCount);

    mediaSourceNode.connect(analyser);
    analyser.connect(audioCtx.destination);
  }
}

function detectStrongBeat(currentTime) {
  if (!analyser || !freqData) return;

  analyser.getByteFrequencyData(freqData);

  // Calculate bass energy from low frequencies
  const bassBins = 16;
  let bassEnergy = 0;
  for (let i = 0; i < bassBins; i += 1) {
    bassEnergy += freqData[i];
  }
  bassEnergy /= bassBins;

  // Smooth rolling average of bass energy
  if (lowEnergyAvg === 0) {
    lowEnergyAvg = bassEnergy;
  } else {
    lowEnergyAvg = lowEnergyAvg * 0.94 + bassEnergy * 0.06;
  }

  // Detect peaks
  const minPeakGap = 0.4; // 400ms minimum gap between beats
  const threshold = lowEnergyAvg * 1.3 + 5; // More lenient threshold

  if (bassEnergy > threshold && currentTime - lastPeakTime > minPeakGap) {
    lastPeakTime = currentTime;
    lastStrongBeatTime = currentTime;

    strongBeatHistory.push(currentTime);
    if (strongBeatHistory.length > 12) {
      strongBeatHistory.shift();
    }

    // Calculate average beat interval from recent peaks
    if (strongBeatHistory.length >= 2) {
      const intervals = [];
      for (let i = 1; i < strongBeatHistory.length; i += 1) {
        const interval = strongBeatHistory[i] - strongBeatHistory[i - 1];
        // Accept intervals that look like valid beats (0.3s to 0.9s)
        if (interval >= 0.3 && interval <= 0.9) {
          intervals.push(interval);
        }
      }

      if (intervals.length > 0) {
        const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
        // Smoothly adapt the beat interval
        strongBeatInterval = strongBeatInterval * 0.75 + avgInterval * 0.25;
      }
    }
  }
}

function getNearestStrongBeatTime(now) {
  if (!lastStrongBeatTime) return null;

  const interval = strongBeatInterval || beatInterval;
  const cyclesFromLast = Math.round((now - lastStrongBeatTime) / interval);
  return lastStrongBeatTime + cyclesFromLast * interval;
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

  detectStrongBeat(currentTime);

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
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  if (!isRunning) {
    isRunning = true;

    drumLoop.currentTime = 0;
    lowEnergyAvg = 0;
    lastPeakTime = 0;
    lastStrongBeatTime = 0;
    strongBeatInterval = beatInterval;
    strongBeatHistory.length = 0;
    
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

  const nearestStrongBeat = getNearestStrongBeatTime(now);

  let diff;
  let beatSource;
  if (nearestStrongBeat !== null) {
    diff = Math.abs(now - nearestStrongBeat);
    beatSource = "strong";
  } else {
    // Fallback: calculate nearest beat aligned to zero based on current time
    const nearestBeat = Math.round(now / beatInterval) * beatInterval;
    diff = Math.abs(now - nearestBeat);
    beatSource = "fallback";
  }

  console.log(`Tap: diff=${diff.toFixed(4)}s (${beatSource}), tolerance=${tolerance.toFixed(4)}s, result=${diff <= tolerance ? "ON BEAT" : "OFF BEAT"}`);

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
// (Moved to game.js to allow level complete check before tap)