/* ---------------------------------------------------------
   PURE PULSE — GRID SYSTEM
   Handles:
   - 6x6 grid rendering
   - Tile types (source, filter, pipe, village)
   - Water position + movement
--------------------------------------------------------- */

const gridContainer = document.getElementById("grid-container");

// ---------------------------------------------------------
// TILE TYPES
// ---------------------------------------------------------
const TILE = {
  EMPTY: 0,
  SOURCE: 1,
  BIOSAND: 2,
  PIPE: 3,
  VILLAGE: 4
};

// ---------------------------------------------------------
// LEVEL 1 LAYOUT (Machinga, Malawi)
// Simple path: Source → BioSand → Village
// ---------------------------------------------------------
export const levelOne = {
  grid: [
    [0, 0, 0, 0, 0, 0],
    [1, 3, 3, 2, 3, 4],  // ← main path
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0]
  ],
  startPos: { row: 1, col: 0 },
  endPos: { row: 1, col: 5 }
};

// Active level reference
let currentLevel = levelOne;

// Water position
let waterPos = { ...currentLevel.startPos };

// ---------------------------------------------------------
// RENDER GRID TO DOM
// ---------------------------------------------------------
export function renderGrid() {
  gridContainer.innerHTML = ""; // clear previous

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");

      const type = currentLevel.grid[row][col];

      if (type === TILE.SOURCE) tile.classList.add("source");
      if (type === TILE.BIOSAND) tile.classList.add("biosand");
      if (type === TILE.PIPE) tile.classList.add("pipe");
      if (type === TILE.VILLAGE) tile.classList.add("village");

      // Highlight water position
      if (row === waterPos.row && col === waterPos.col) {
        tile.classList.add("water");
      }

      gridContainer.appendChild(tile);
    }
  }
}

// ---------------------------------------------------------
// MOVE WATER FORWARD (called from audio.js on beat success)
// ---------------------------------------------------------
export function moveWaterForward() {
  const { row, col } = waterPos;

  // If at end, stop
  if (col === currentLevel.endPos.col && row === currentLevel.endPos.row) {
    console.log("Reached village!");
    // Hook for win state:
    // triggerImpactScreen();
    return;
  }

  // Move right along the path
  waterPos.col += 1;

  // Hook for purity logic:
  const tileType = currentLevel.grid[waterPos.row][waterPos.col];
  if (tileType === TILE.BIOSAND) {
    // increasePurity(10);
  }

  renderGrid();
}

// ---------------------------------------------------------
// RESET WATER POSITION (for replay)
// ---------------------------------------------------------
export function resetWater() {
  waterPos = { ...currentLevel.startPos };
  renderGrid();
}