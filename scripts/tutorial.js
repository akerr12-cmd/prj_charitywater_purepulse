import { showScreen } from "./game.js";
import { returnToMainMenu } from "./game.js";

const tutorialScreen = document.getElementById("tutorial-screen");
const tutorialText = document.getElementById("tutorial-text");
const nextBtn = document.getElementById("tutorial-next-btn");
const tapBtn = document.getElementById("tutorial-tap-btn");
const exitBtn = document.getElementById("tutorial-exit-btn");
const skipBtn = document.getElementById("tutorial-skip-btn");

let tutorialStep = 0;
let missCount = 0;

/* SCRIPT */
const tutorialSteps = [
  { type: "text", text: "Welcome to Pure Pulse — a rhythm journey inspired by real communities." },
  { type: "text", text: "Your goal is simple: guide clean water to the village." },
  { type: "text", text: "Tap the Pulse Button in rhythm with the drums." },

  {
    type: "tap",
    text: "Try tapping once on the beat.",
    onTap: () => tutorialText.textContent = "Nice! That’s the beat."
  },

  {
    type: "tap",
    text: "Tap again when you feel the pulse.",
    onTap: () => tutorialText.textContent = "Great — you're finding the rhythm."
  },

  { type: "text", text: "Each on‑beat tap moves the water forward." },
  { type: "text", text: "If you tap off‑beat, the flow slows down." },

  {
    type: "tap",
    text: "Try tapping off‑beat to see what happens.",
    onTap: (isOnBeat) => {
      if (!isOnBeat) {
        missCount++;
        tutorialText.textContent = "That’s okay — try again.";
      }
      if (missCount >= 3) {
        tutorialText.textContent = "Try listening to the drums. Tap when the sound feels strongest.";
      }
    }
  },

  { type: "text", text: "Reach the village with clean water to complete the level." },
  { type: "text", text: "You're ready. Tap to the beat — bring clean water home." }
];

/* ENGINE */
function loadTutorialStep() {
  const step = tutorialSteps[tutorialStep];
  tutorialText.textContent = step.text;

  if (step.type === "text") {
    nextBtn.classList.remove("hidden");
    tapBtn.classList.add("hidden");
  } else {
    nextBtn.classList.add("hidden");
    tapBtn.classList.remove("hidden");
  }
}

nextBtn.addEventListener("click", () => {
  tutorialStep++;
  if (tutorialStep >= tutorialSteps.length) {
    returnToMainMenu();
    return;
  }
  loadTutorialStep();
});

tapBtn.addEventListener("click", () => {
  const step = tutorialSteps[tutorialStep];
  const isOnBeat = Math.random() > 0.5;

  step.onTap(isOnBeat);

  setTimeout(() => {
    tutorialStep++;
    loadTutorialStep();
  }, 1200);
});

exitBtn.addEventListener("click", returnToMainMenu);
skipBtn.addEventListener("click", returnToMainMenu);

/* PUBLIC */
export function startTutorial() {
  tutorialStep = 0;
  missCount = 0;
  showScreen(tutorialScreen);
  loadTutorialStep();
}
