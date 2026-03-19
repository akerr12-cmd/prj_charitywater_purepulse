/* ----------------------------------------------------------
   PURE PULSE — LEVEL START SCREEN CONTROLLER
   Handles:
   - Screen transitions
   - Drag & Drop initialization
   - Start Flow → Game Screen
   - Back → Title Screen
   ---------------------------------------------------------- */

import { initDragAndDrop, lockPlacementGrid } from "./dragdrop.js";
import { showScreen } from "./game.js";
import { startGame } from "./game.js";

/* DOM ELEMENTS */
const startBtn = document.getElementById("start-btn");
const lsStartFlowBtn = document.getElementById("ls-start-flow-btn");
const lsBackBtn = document.getElementById("ls-back-btn");

/* ----------------------------------------------------------
   TITLE SCREEN → LEVEL START SCREEN
   ---------------------------------------------------------- */

if (startBtn) {
  startBtn.addEventListener("click", () => {
    showScreen("level-start-screen");
    initDragAndDrop(); // enable consumable placement
  });
}

/* ----------------------------------------------------------
   LEVEL START SCREEN → GAME SCREEN
   (Start Flow button)
   ---------------------------------------------------------- */

if (lsStartFlowBtn) {
  lsStartFlowBtn.addEventListener("click", () => {
    lockPlacementGrid(); // freeze consumables in place
    startGame();         // begin the level
  });
}

/* ----------------------------------------------------------
   LEVEL START SCREEN → TITLE SCREEN
   (Back button)
   ---------------------------------------------------------- */

if (lsBackBtn) {
  lsBackBtn.addEventListener("click", () => {
    showScreen("title-screen");
  });
}
