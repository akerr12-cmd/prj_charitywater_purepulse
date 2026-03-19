import { increasePurity } from "./game.js";

/* ---------------------------------------------------------
   PURE PULSE - GRID SYSTEM
   Handles:
   - 6x6 grid rendering
   - Path simulation from source to village
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

export const levelOne = {
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
};

let currentLevel = levelOne;
let waterPos = { ...currentLevel.startPos };

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
    // Lightweight bonus hook to represent objective sensing.
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

    // Respect placement rules at runtime too.
    const baseType = currentLevel.grid[row][col];
    if (baseType === TILE.SOURCE || baseType === TILE.VILLAGE) return;

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

      if (row === waterPos.row && col === waterPos.col) {
        tile.classList.add("water");
      }

      gridContainer.appendChild(tile);
    }
  }
}

export function moveWaterForward() {
  const atEnd =
    waterPos.row === currentLevel.endPos.row &&
    waterPos.col === currentLevel.endPos.col;

  if (atEnd) return;

  const path = getPathToVillage();
  if (!path || path.length < 2) {
    // No traversable route from current position.
    return;
  }

  const prevRow = waterPos.row;
  const prevCol = waterPos.col;

  const next = path[1];
  waterPos = { row: next.row, col: next.col };

  const tiles = document.querySelectorAll("#grid-container .tile");
  const prevTileIndex = prevRow * 6 + prevCol;
  const prevTile = tiles[prevTileIndex];

  if (prevTile) {
    prevTile.classList.add("water-trail");
    setTimeout(() => prevTile.classList.remove("water-trail"), 400);
  }

  applyConsumableEffect(waterPos.row, waterPos.col);
  renderGrid();
}

export function resetWater() {
  waterPos = { ...currentLevel.startPos };
  consumedTiles = new Set();
  renderGrid();
}
