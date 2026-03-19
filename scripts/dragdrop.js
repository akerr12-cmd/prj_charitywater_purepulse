/* ----------------------------------------------------------
   PURE PULSE — DRAG & DROP CONSUMABLE SYSTEM
   Works on: #level-start-screen
   ---------------------------------------------------------- */

let draggedItem = null;

const CONSUMABLE_IMAGE_BY_TYPE = {
  biosand: "BioSand.png",
  charcoal: "Charcoal.png",
  sensor: "Sensor.png"
};

/* -----------------------------
   1. INVENTORY DRAG START
   ----------------------------- */

export function initDragAndDrop() {
  const inventoryItems = document.querySelectorAll(
    "#ls-inventory-bar .consumable-card"
  );

  inventoryItems.forEach((item) => {
    if (item.dataset.dndBound === "1") return;

    item.addEventListener("dragstart", () => {
      draggedItem = item;
      item.classList.add("dragging");
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
      draggedItem = null;
    });

    item.dataset.dndBound = "1";
  });

  initGridDropZones();
}

/* -----------------------------
   2. GRID DROP ZONES
   ----------------------------- */

function initGridDropZones() {
  const tiles = document.querySelectorAll("#ls-main-grid .grid-tile");

  tiles.forEach((tile) => {
    if (tile.dataset.dropBound === "1") return;

    tile.addEventListener("dragover", (e) => {
      e.preventDefault();

      if (!draggedItem) return;

      if (isValidPlacement(tile, draggedItem)) {
        tile.classList.add("drop-valid");
        tile.classList.remove("drop-invalid");
      } else {
        tile.classList.add("drop-invalid");
        tile.classList.remove("drop-valid");
      }
    });

    tile.addEventListener("dragleave", () => {
      tile.classList.remove("drop-valid", "drop-invalid");
    });

    tile.addEventListener("drop", () => {
      tile.classList.remove("drop-valid", "drop-invalid");

      if (!draggedItem) return;

      if (tile.dataset.consumable) return;

      if (isValidPlacement(tile, draggedItem)) {
        placeConsumable(tile, draggedItem.dataset.type);
        decrementInventory(draggedItem);
      }
    });

    tile.dataset.dropBound = "1";
  });
}

/* -----------------------------
   3. PLACEMENT VALIDATION
   ----------------------------- */

function isValidPlacement(tile, item) {
  const type = item.dataset.type;
  const tileType = tile.dataset.type; // from your grid renderer

  // Only allow placement on active flow path tiles.
  if (tileType !== "pipe") {
    return false;
  }

  // Sensors only go on pipes
  if (type === "sensor") {
    return tileType === "pipe";
  }

  // BioSand + Charcoal are restricted to flow path tiles.
  if (type === "biosand" || type === "charcoal") {
    return tileType === "pipe";
  }

  return false;
}

/* -----------------------------
   4. PLACE CONSUMABLE ON GRID
   ----------------------------- */

function placeConsumable(tile, type) {
  tile.dataset.consumable = type;
  const imageName = CONSUMABLE_IMAGE_BY_TYPE[type] || "BioSand.png";

  tile.innerHTML = `
    <img src="assets/images/${imageName}" class="placed-consumable" alt="${type} consumable">
  `;
}

/* -----------------------------
   5. DECREMENT INVENTORY
   ----------------------------- */

function decrementInventory(card) {
  const qtySpan = card.querySelector(".qty");
  let qty = parseInt(qtySpan.textContent);

  qty -= 1;
  qtySpan.textContent = qty;

  if (qty <= 0) {
    card.setAttribute("draggable", "false");
    card.classList.add("disabled");
  }
}

/* -----------------------------
   6. LOCK GRID AFTER START FLOW
   ----------------------------- */

export function lockPlacementGrid() {
  const tiles = document.querySelectorAll("#ls-main-grid .grid-tile");

  tiles.forEach((tile) => {
    tile.classList.add("locked");
    tile.setAttribute("draggable", "false");
  });

  const inventory = document.querySelectorAll("#ls-inventory-bar .consumable-card");
  inventory.forEach((item) => {
    item.setAttribute("draggable", "false");
    item.classList.add("disabled");
  });
}

export function getPlacementSnapshot() {
  const tiles = document.querySelectorAll("#ls-main-grid .grid-tile[data-consumable]");

  return Array.from(tiles).map((tile) => ({
    row: Number(tile.dataset.row),
    col: Number(tile.dataset.col),
    type: tile.dataset.consumable
  }));
}
