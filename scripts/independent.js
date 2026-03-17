// ------------------------------------------------------------
// PURE PULSE — FIRST INDEPENDENT CHALLENGE
// ------------------------------------------------------------
// This file controls:
// - The 4‑tile rhythm challenge
// - Beat timing synced to the audio engine
// - Accuracy tracking
// - Transition into the Impact Reveal screen
// ------------------------------------------------------------

let challengeActive = false;
let currentBeatIndex = 0;
let currentLoop = 0;
let beatStartTime = 0;
let intervalId = null;

let hits = 0;
let totalBeats = 0;
let inputsThisBeat = [];
let acceptingInput = false;

// Pattern: indexes into the .beat-tile elements
const pattern = [0, 1, 2, 1];

// How many times the pattern repeats
const loopsToPlay = 4;

// Timing window for a “correct” hit
const hitWindowMs = 250;

// DOM references
const tiles = Array.from(document.querySelectorAll("#independent-challenge .beat-tile"));
const statusText = document.getElementById("status-text");
const accuracyText = document.getElementById("accuracy-text");


// ------------------------------------------------------------
// START CHALLENGE
// ------------------------------------------------------------
function startIndependentChallenge() {
  challengeActive = true;
  currentBeatIndex = 0;
  currentLoop = 0;
  hits = 0;
  totalBeats = pattern.length * loopsToPlay;

  statusText.textContent = "Follow the beat. Press A, S, D, or F in time.";
  accuracyText.textContent = "Accuracy: 0%";

  // Sync with your existing audio engine
  if (window.audioEngine) {
    audioEngine.playLoop("mainBeat");
  }

  const beatIntervalMs = window.audioEngine
    ? audioEngine.getBeatInterval()
    : 650;

  intervalId = setInterval(() => nextBeat(beatIntervalMs), beatIntervalMs);
  nextBeat(beatIntervalMs);
}


// ------------------------------------------------------------
// BEAT ADVANCE
// ------------------------------------------------------------
function nextBeat(beatIntervalMs) {
  // Clear previous visual states
  tiles.forEach(tile =>
    tile.classList.remove("active", "correct", "wrong")
  );

  inputsThisBeat = [];
  acceptingInput = true;

  const tileIndex = pattern[currentBeatIndex];
  const tile = tiles[tileIndex];
  tile.classList.add("active");

  beatStartTime = performance.now();

  // Move to next beat
  currentBeatIndex++;

  // Loop handling
  if (currentBeatIndex >= pattern.length) {
    currentBeatIndex = 0;
    currentLoop++;

    if (currentLoop >= loopsToPlay) {
      // Let the last beat finish
      setTimeout(endIndependentChallenge, beatIntervalMs);
      clearInterval(intervalId);
    }
  }
}


// ------------------------------------------------------------
// INPUT HANDLING
// ------------------------------------------------------------
function handleIndependentInput(tileIndex) {
  if (!challengeActive || !acceptingInput) return;

  const now = performance.now();
  const delta = Math.abs(now - beatStartTime);

  // Only count the first input per beat
  if (inputsThisBeat.length === 0) {
    inputsThisBeat.push({ tileIndex, delta });

    const expectedIndex =
      pattern[(currentBeatIndex - 1 + pattern.length) % pattern.length];

    const expectedTile = tiles[expectedIndex];

    if (tileIndex === expectedIndex && delta <= hitWindowMs) {
      hits++;
      expectedTile.classList.remove("active");
      expectedTile.classList.add("correct");
      statusText.textContent = "Nice. Stay with the rhythm.";
    } else {
      expectedTile.classList.remove("active");
      expectedTile.classList.add("wrong");
      statusText.textContent = "It’s okay. Just come back to the beat.";
    }

    updateIndependentAccuracy();
    acceptingInput = false;
  }
}


// ------------------------------------------------------------
// ACCURACY DISPLAY
// ------------------------------------------------------------
function updateIndependentAccuracy() {
  const accuracy = Math.round((hits / totalBeats) * 100);
  accuracyText.textContent = `Accuracy: ${accuracy}%`;
}


// ------------------------------------------------------------
// END CHALLENGE → IMPACT REVEAL
// ------------------------------------------------------------
function endIndependentChallenge() {
  challengeActive = false;

  tiles.forEach(tile =>
    tile.classList.remove("active", "correct", "wrong")
  );

  const accuracy = Math.round((hits / totalBeats) * 100);

  if (accuracy >= 60) {
    statusText.textContent = "Beautifully done.";

    // Soft pause of the loop
    if (window.audioEngine) {
      audioEngine.fadeOutLoop("mainBeat", 800);
    }

    // ⭐ THIS IS STEP 5 — RIGHT HERE ⭐
    setTimeout(() => {
      hideScreen("independent-challenge");
      showScreen("impact-reveal");

      if (window.startImpactReveal) {
        startImpactReveal();
      }
    }, 1200);

  } else {
    statusText.textContent = "Let’s try that pattern again when you’re ready.";
    setTimeout(startIndependentChallenge, 2000);
  }
}

// ------------------------------------------------------------
// KEYBOARD + CLICK INPUT
// ------------------------------------------------------------
window.addEventListener("keydown", (e) => {
  const key = e.key.toUpperCase();
  const tile = tiles.find(t => t.dataset.key === key);
  if (!tile) return;
  handleIndependentInput(Number(tile.dataset.index));
});

tiles.forEach(tile => {
  tile.addEventListener("click", () => {
    handleIndependentInput(Number(tile.dataset.index));
  });
});


// ------------------------------------------------------------
// EXPORT TO GLOBAL (so tutorial.js can call it)
// ------------------------------------------------------------
window.startIndependentChallenge = startIndependentChallenge;
