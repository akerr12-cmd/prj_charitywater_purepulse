import { increasePurity } from "./game.js";

/* ---------------------------------------------------------
   PURE PULSE - GRID SYSTEM
   Handles:
   - 6x6 grid rendering
   - Difficulty-based path layouts
   - Runtime consumable effects from level-start placements
--------------------------------------------------------- */

const gridContainer = document.getElementById("grid-container");

const TILE = {
  EMPTY: 0,
  SOURCE: 1,
  BIOSAND: 2,
  PIPE: 3,
  VILLAGE: 4
};

const LEVELS = {
  "malawi-easy": {
    grid: [
      [0, 0, 0, 0, 0, 0],
      [1, 3, 3, 2, 3, 4],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0]
    ],
    startPos: { row: 1, col: 0 },
    endPos: { row: 1, col: 5 }
  },
  "kenya-medium": {
    // Medium path snakes through multiple rows.
    grid: [
      [0, 0, 0, 0, 0, 0],
      [1, 3, 3, 3, 3, 3],
      [0, 0, 0, 0, 0, 3],
      [0, 0, 3, 3, 3, 3],
      [0, 0, 3, 0, 0, 0],
      [0, 0, 2, 3, 3, 4]
    ],
    startPos: { row: 1, col: 0 },
    endPos: { row: 5, col: 5 }
  },
  "ethiopia-hard": {
    // Hard path traverses most of the grid in a long route.
    grid: [
      [1, 3, 3, 3, 3, 3],
      [0, 0, 0, 0, 0, 3],
      [3, 3, 3, 3, 0, 3],
      [3, 0, 0, 3, 0, 3],
      [3, 0, 3, 3, 3, 3],
      [3, 3, 3, 0, 0, 4]
    ],
    startPos: { row: 0, col: 0 },
    endPos: { row: 5, col: 5 }
  }
};

export const levelOne = LEVELS["malawi-easy"];

let currentLevelId = "malawi-easy";
let currentLevel = LEVELS[currentLevelId];
let waterPos = { ...currentLevel.startPos };
let filledTiles = new Set([posKey(currentLevel.startPos.row, currentLevel.startPos.col)]);


// reval function for impact screen - reveals grid with fade-in effect
function revealImageTile(row, col) {
  const index = row * 6 + col;
  const tiles = document.querySelectorAll("#grid-container .tile");
  const tile = tiles[index];
  if (tile) tile.classList.add("revealed");
}

// Key: "row,col" -> value: "biosand" | "charcoal" | "sensor"
let placedConsumables = new Map();

// Tracks one-time effect trigger per run.
let consumedTiles = new Set();

function posKey(row, col) {
  return `${row},${col}`;
}

function inBounds(row, col) {
  return row >= 0 && row < 6 && col >= 0 && col < 6;
}

function getPlacedConsumable(row, col) {
  return placedConsumables.get(posKey(row, col)) || null;
}

function isPassable(row, col) {
  const baseType = currentLevel.grid[row][col];
  if (baseType !== TILE.EMPTY) return true;

  // Empty tiles become traversable if a consumable is placed pre-flow.
  const placed = getPlacedConsumable(row, col);
  return placed === "biosand" || placed === "charcoal" || placed === "sensor";
}

function getPathToVillage() {
  const start = { ...waterPos };
  const end = currentLevel.endPos;

  const queue = [start];
  const visited = new Set([posKey(start.row, start.col)]);
  const parent = new Map();

  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: -1, dc: 0 }
  ];

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.row === end.row && current.col === end.col) {
      const path = [];
      let cursorKey = posKey(current.row, current.col);
      let cursor = { row: current.row, col: current.col };
      path.push(cursor);

      while (parent.has(cursorKey)) {
        const prev = parent.get(cursorKey);
        cursor = { row: prev.row, col: prev.col };
        cursorKey = posKey(cursor.row, cursor.col);
        path.push(cursor);
      }

      path.reverse();
      return path;
    }

    for (const d of directions) {
      const nr = current.row + d.dr;
      const nc = current.col + d.dc;
      const key = posKey(nr, nc);

      if (!inBounds(nr, nc)) continue;
      if (visited.has(key)) continue;
      if (!isPassable(nr, nc)) continue;

      visited.add(key);
      parent.set(key, { row: current.row, col: current.col });
      queue.push({ row: nr, col: nc });
    }
  }

  return null;
}

function applyConsumableEffect(row, col) {
  const key = posKey(row, col);
  if (consumedTiles.has(key)) return;

  const placed = getPlacedConsumable(row, col);

  if (placed === "biosand") {
    increasePurity(10);
    consumedTiles.add(key);
    return;
  }

  if (placed === "charcoal") {
    increasePurity(5);
    consumedTiles.add(key);
    return;
  }

  if (placed === "sensor") {
    increasePurity(2);
    consumedTiles.add(key);
    return;
  }

  const baseType = currentLevel.grid[row][col];
  if (baseType === TILE.BIOSAND) {
    increasePurity(10);
    consumedTiles.add(key);
  }
}

function addBaseTileClass(tile, type) {
  if (type === TILE.SOURCE) tile.classList.add("source");
  if (type === TILE.BIOSAND) tile.classList.add("biosand");
  if (type === TILE.PIPE) tile.classList.add("pipe");
  if (type === TILE.VILLAGE) tile.classList.add("village");
}

function addPlacedConsumableClass(tile, row, col) {
  const placed = getPlacedConsumable(row, col);
  if (!placed) return;

  tile.classList.add("pipe");
  tile.dataset.consumable = placed;

  if (placed === "biosand") tile.classList.add("biosand");
  if (placed === "charcoal") tile.classList.add("charcoal");
  if (placed === "sensor") tile.classList.add("sensor");
}

function tileTypeToPlacement(type) {
  if (type === TILE.SOURCE) return "source";
  if (type === TILE.VILLAGE) return "village";
  if (type === TILE.PIPE || type === TILE.BIOSAND) return "pipe";
  return "empty";
}

export function setActiveLevel(levelId) {
  if (!LEVELS[levelId]) {
    currentLevelId = "malawi-easy";
  } else {
    currentLevelId = levelId;
  }

  currentLevel = LEVELS[currentLevelId];
  waterPos = { ...currentLevel.startPos };
  consumedTiles = new Set();
  filledTiles = new Set([posKey(waterPos.row, waterPos.col)]);
}

export function getPlacementLayout() {
  return currentLevel.grid.map((row) => row.map((type) => tileTypeToPlacement(type)));
}

export function hasReachedVillage() {
  return (
    waterPos.row === currentLevel.endPos.row &&
    waterPos.col === currentLevel.endPos.col
  );
}

export function setPlacedConsumables(placements) {
  placedConsumables = new Map();

  if (!Array.isArray(placements)) return;

  placements.forEach((item) => {
    if (!item) return;

    const row = Number(item.row);
    const col = Number(item.col);
    const type = item.type;

    if (!inBounds(row, col)) return;
    if (!["biosand", "charcoal", "sensor"].includes(type)) return;

    const baseType = currentLevel.grid[row][col];
    if (baseType === TILE.SOURCE || baseType === TILE.VILLAGE) return;

    // Keep placement constrained to tiles that are part of water flow.
    if (baseType !== TILE.PIPE && baseType !== TILE.BIOSAND) return;

    placedConsumables.set(posKey(row, col), type);
  });
}

export function renderGrid() {
  if (!gridContainer) return;

  gridContainer.innerHTML = "";

  for (let row = 0; row < 6; row += 1) {
    for (let col = 0; col < 6; col += 1) {
      const tile = document.createElement("div");
      tile.classList.add("tile");

      const type = currentLevel.grid[row][col];
      addBaseTileClass(tile, type);
      addPlacedConsumableClass(tile, row, col);

      if (filledTiles.has(posKey(row, col))) {
        tile.classList.add("water-filled");
      }

      if (row === waterPos.row && col === waterPos.col) {
        tile.classList.add("water");
      }

      gridContainer.appendChild(tile);
    }
  }
}

export function moveWaterForward() {
  if (hasReachedVillage()) return;

  const path = getPathToVillage();
  if (!path || path.length < 2) {
    return;
  }

  const prevRow = waterPos.row;
  const prevCol = waterPos.col;

  const next = path[1];
  waterPos = { row: next.row, col: next.col };
  filledTiles.add(posKey(waterPos.row, waterPos.col));

  const tiles = document.querySelectorAll("#grid-container .tile");
  const prevTileIndex = prevRow * 6 + prevCol;
  const prevTile = tiles[prevTileIndex];

  if (prevTile) {
    prevTile.classList.add("water-trail");
    setTimeout(() => prevTile.classList.remove("water-trail"), 400);
  }

applyConsumableEffect(waterPos.row, waterPos.col);

// Reveal the tile beneath the water
revealImageTile(waterPos.row, waterPos.col);

// PART 5 — Gradually fade in the background image
const revealedCount = document.querySelectorAll(".tile.revealed").length;
const totalTiles = 36;
const img = document.getElementById("impact-reveal-image");

if (img) {
  img.style.opacity = Math.min(1, revealedCount / totalTiles);
}

renderGrid();


}

export function resetWater() {
  waterPos = { ...currentLevel.startPos };
  consumedTiles = new Set();
  filledTiles = new Set([posKey(waterPos.row, waterPos.col)]);
  renderGrid();
}
