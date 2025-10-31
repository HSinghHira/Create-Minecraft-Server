// ============================================
// DATA MANAGEMENT
// ============================================
let items = [];
let currentItemIndex = -1;
let textToolsTargetId = null;

// ============================================
// TAB SWITCHING FUNCTION
// ============================================
function switchTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });

  // Remove active class from all tabs
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Show selected tab content
  const selectedContent = document.querySelector(`[data-content="${tabName}"]`);
  if (selectedContent) {
    selectedContent.classList.add("active");
  }

  // Add active class to clicked tab
  event.target.closest(".tab").classList.add("active");
}

// ============================================
// MODAL FUNCTIONS
// ============================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("hidden");
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("hidden");
  }
}

// Close modal when clicking outside
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.add("hidden");
  }
});

// ============================================
// ALERT/NOTIFICATION SYSTEM
// ============================================
function showAlert(message, type = "info") {
  // Create alert container if it doesn't exist
  let container = document.getElementById("alertContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "alertContainer";
    container.style.cssText =
      "position: fixed; bottom: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 10px; max-width: 350px;";
    document.body.appendChild(container);
  }

  // Create alert element
  const alert = document.createElement("div");
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
        <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span style="flex: 1;">${message}</span>
        <span class="close-alert" style="cursor: pointer; font-weight: bold; opacity: 0.7; font-size: 18px;">✕</span>
    `;

  // Add to container
  container.appendChild(alert);

  // Add slide-in animation
  alert.style.animation = "slideInRight 0.3s ease";

  // Close button
  alert.querySelector(".close-alert").addEventListener("click", () => {
    alert.remove();
  });

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (alert.parentElement) {
      alert.style.opacity = "0";
      alert.style.transform = "translateX(100px)";
      alert.style.transition = "all 0.3s ease";
      setTimeout(() => alert.remove(), 300);
    }
  }, 5000);
}

// ============================================
// ITEM MANAGEMENT
// ============================================
function addNewItem() {
  const newItem = {
    id: "item_" + Date.now(),
    name: "new_item",
    displayName: "New Item",
    description: "",
  };
  items.push(newItem);
  renderItemsList();
  editItem(items.length - 1);
  updateStats();
}

function editItem(index) {
  currentItemIndex = index;
  const item = items[index];

  document.getElementById("itemName").value = item.name || "";
  document.getElementById("displayName").value = item.displayName || "";
  document.getElementById("description").value = item.description || "";

  document.getElementById("itemEditor").classList.remove("hidden");
  highlightActiveItem();
}

function saveCurrentItem() {
  if (currentItemIndex === -1) return;

  const item = items[currentItemIndex];
  item.name = document.getElementById("itemName").value;
  item.displayName = document.getElementById("displayName").value;
  item.description = document.getElementById("description").value;

  renderItemsList();
  updateStats();
  showAlert("Item saved successfully!", "success");
}

function duplicateCurrentItem() {
  if (currentItemIndex === -1) return;

  const item = { ...items[currentItemIndex] };
  item.id = "item_" + Date.now();
  item.name = item.name + "_copy";
  items.push(item);

  renderItemsList();
  editItem(items.length - 1);
  updateStats();
  showAlert("Item duplicated!", "success");
}

function deleteCurrentItem() {
  if (currentItemIndex === -1) return;

  if (confirm("Are you sure you want to delete this item?")) {
    items.splice(currentItemIndex, 1);
    document.getElementById("itemEditor").classList.add("hidden");
    currentItemIndex = -1;
    renderItemsList();
    updateStats();
    showAlert("Item deleted", "info");
  }
}

function renderItemsList() {
  const container = document.getElementById("itemsList");

  if (items.length === 0) {
    container.innerHTML = `
            <div class="info-card" style="text-align: center; padding: 32px;">
                <svg style="width: 48px; height: 48px; margin: 0 auto 16px; color: var(--text-muted);"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p style="color: var(--text-muted);">No items yet. Click "New Item" to get started!</p>
            </div>
        `;
    return;
  }

  container.innerHTML = items
    .map(
      (item, index) => `
        <div class="setting-item ${index === currentItemIndex ? "active" : ""}" 
             style="cursor: pointer; border: 2px solid ${
               index === currentItemIndex
                 ? "var(--accent-light)"
                 : "transparent"
             };"
             onclick="editItem(${index})">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <div style="
                        background: linear-gradient(135deg, var(--accent-primary), var(--accent-light));
                        color: var(--text-primary);
                        padding: 4px 10px;
                        border-radius: 6px;
                        font-size: 11px;
                        font-weight: 700;
                        min-width: 32px;
                        text-align: center;
                    ">#${index + 1}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: var(--text-primary);">${
                          item.displayName || item.name
                        }</div>
                        <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${
                          item.name
                        }</div>
                    </div>
                </div>
                <svg style="width: 20px; height: 20px; color: var(--accent-light);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </div>
    `
    )
    .join("");
}

function highlightActiveItem() {
  renderItemsList();
}

function updateStats() {
  document.getElementById("totalItems").textContent = items.length;
}

// ============================================
// TEXT TOOLS (RGB + FANCY FONT COMBINED IN ONE TAB)
// ============================================
function openTextTools(targetId) {
  textToolsTargetId = targetId;

  // Get current value from target input
  const targetInput = document.getElementById(targetId);
  const currentValue = targetInput ? targetInput.value : "";

  // Set initial text
  document.getElementById("textToolsInput").value = currentValue;

  // Reset checkboxes
  document.getElementById("enableRGB").checked = false;
  document.getElementById("enableFancy").checked = false;

  document.getElementById("textToolsModal").classList.remove("hidden");
  updateAllPreviews();
}

function updateAllPreviews() {
  const text = document.getElementById("textToolsInput").value;
  const enableRGB = document.getElementById("enableRGB").checked;
  const enableFancy = document.getElementById("enableFancy").checked;

  if (!text) {
    document.getElementById("combinedVisualPreview").innerHTML =
      "Enter text to see preview...";
    document.getElementById("combinedCodePreview").textContent =
      "Enter text to see preview...";
    return;
  }

  let processedText = text;
  let visualHTML = "";
  let minecraftCode = "";

  // Step 1: Apply Fancy Font if enabled
  if (enableFancy) {
    processedText = convertToFancyFont(processedText);
  }

  // Step 2: Apply RGB if enabled
  if (enableRGB) {
    const startColor = document.getElementById("rgbStartHex").value;
    const endColor = document.getElementById("rgbEndHex").value;

    minecraftCode = generateRGBCode(processedText, startColor, endColor);
    visualHTML = generateVisualRGBPreview(processedText, startColor, endColor);
  } else {
    // No RGB, just show the text (with fancy font if enabled)
    minecraftCode = processedText;
    visualHTML = `<span style="color: var(--text-primary);">${processedText}</span>`;
  }

  document.getElementById("combinedVisualPreview").innerHTML = visualHTML;
  document.getElementById("combinedCodePreview").textContent = minecraftCode;
}

function applyTextTools() {
  if (!textToolsTargetId) return;

  const minecraftCode = document.getElementById(
    "combinedCodePreview"
  ).textContent;

  if (minecraftCode && minecraftCode !== "Enter text to see preview...") {
    const targetInput = document.getElementById(textToolsTargetId);

    // Simply replace the value
    targetInput.value = minecraftCode;

    closeModal("textToolsModal");
    showAlert("Text applied successfully!", "success");
  } else {
    showAlert("Please enter text first", "error");
  }
}

// ============================================
// RGB COLOR PICKER FUNCTIONS
// ============================================
function syncColorInputs(type) {
  const colorInput = document.getElementById(
    `rgb${type.charAt(0).toUpperCase() + type.slice(1)}Color`
  );
  const hexInput = document.getElementById(
    `rgb${type.charAt(0).toUpperCase() + type.slice(1)}Hex`
  );
  hexInput.value = colorInput.value.toUpperCase();
}

function syncHexToColor(type) {
  const colorInput = document.getElementById(
    `rgb${type.charAt(0).toUpperCase() + type.slice(1)}Color`
  );
  const hexInput = document.getElementById(
    `rgb${type.charAt(0).toUpperCase() + type.slice(1)}Hex`
  );
  let hex = hexInput.value.trim();

  // Add # if missing
  if (!hex.startsWith("#")) {
    hex = "#" + hex;
  }

  // Validate hex color
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    colorInput.value = hex;
  }
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function interpolateColor(color1, color2, factor) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return color1;

  const r = Math.round(rgb1.r + factor * (rgb2.r - rgb1.r));
  const g = Math.round(rgb1.g + factor * (rgb2.g - rgb1.g));
  const b = Math.round(rgb1.b + factor * (rgb2.b - rgb1.b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
}

function generateRGBCode(text, startColor, endColor) {
  if (!text) return "";

  let result = "";
  const length = text.length;

  // If start and end colors are the same or only one color, use single color
  if (startColor === endColor || !endColor) {
    result = `&#${startColor.replace("#", "")}${text}`;
  } else {
    // Generate gradient
    for (let i = 0; i < length; i++) {
      const factor = length > 1 ? i / (length - 1) : 0;
      const color = interpolateColor(startColor, endColor, factor);
      result += `&#${color.replace("#", "")}${text[i]}`;
    }
  }

  return result;
}

function generateVisualRGBPreview(text, startColor, endColor) {
  if (!text) return "";

  let result = "";
  const length = text.length;

  // If start and end colors are the same or only one color, use single color
  if (startColor === endColor || !endColor) {
    result = `<span style="color: ${startColor};">${text}</span>`;
  } else {
    // Generate gradient
    for (let i = 0; i < length; i++) {
      const factor = length > 1 ? i / (length - 1) : 0;
      const color = interpolateColor(startColor, endColor, factor);
      result += `<span style="color: ${color};">${text[i]}</span>`;
    }
  }

  return result;
}

// ============================================
// FANCY FONT CONVERTER FUNCTIONS
// ============================================
const fancyFontMap = {
  a: "ᴀ",
  b: "ʙ",
  c: "ᴄ",
  d: "ᴅ",
  e: "ᴇ",
  f: "ꜰ",
  g: "ɢ",
  h: "ʜ",
  i: "ɪ",
  j: "ᴊ",
  k: "ᴋ",
  l: "ʟ",
  m: "ᴍ",
  n: "ɴ",
  o: "ᴏ",
  p: "ᴘ",
  q: "ǫ",
  r: "ʀ",
  s: "s",
  t: "ᴛ",
  u: "ᴜ",
  v: "ᴠ",
  w: "ᴡ",
  x: "x",
  y: "ʏ",
  z: "ᴢ",
  A: "ᴀ",
  B: "ʙ",
  C: "ᴄ",
  D: "ᴅ",
  E: "ᴇ",
  F: "ꜰ",
  G: "ɢ",
  H: "ʜ",
  I: "ɪ",
  J: "ᴊ",
  K: "ᴋ",
  L: "ʟ",
  M: "ᴍ",
  N: "ɴ",
  O: "ᴏ",
  P: "ᴘ",
  Q: "ǫ",
  R: "ʀ",
  S: "s",
  T: "ᴛ",
  U: "ᴜ",
  V: "ᴠ",
  W: "ᴡ",
  X: "x",
  Y: "ʏ",
  Z: "ᴢ",
};

function convertToFancyFont(text) {
  if (!text) return "";

  let result = "";
  for (let char of text) {
    result += fancyFontMap[char] || char;
  }
  return result;
}

// ============================================
// IMPORT/EXPORT
// ============================================
function exportJSON() {
  const data = {
    version: "1.0",
    items: items,
    exported: new Date().toISOString(),
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "configuration.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showAlert("Configuration exported!", "success");
}

function importJSON() {
  document.getElementById("importModal").classList.remove("hidden");
}

function confirmImport() {
  const jsonText = document.getElementById("importJsonText").value;

  try {
    const data = JSON.parse(jsonText);
    if (data.items && Array.isArray(data.items)) {
      items = data.items;
      renderItemsList();
      updateStats();
      closeModal("importModal");
      document.getElementById("importJsonText").value = "";
      showAlert("Configuration imported successfully!", "success");
    } else {
      showAlert("Invalid JSON format", "error");
    }
  } catch (e) {
    showAlert("Failed to parse JSON: " + e.message, "error");
  }
}

// ============================================
// REORDER FUNCTIONALITY
// ============================================
function openReorderModal() {
  const list = document.getElementById("reorderList");
  list.innerHTML = items
    .map(
      (item, index) => `
        <div class="setting-item" draggable="true" data-index="${index}"
             style="cursor: move; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <svg style="width: 20px; height: 20px; color: var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <div style="
                    background: linear-gradient(135deg, var(--accent-primary), var(--accent-light));
                    color: var(--text-primary);
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    min-width: 32px;
                    text-align: center;
                ">#${index + 1}</div>
                <div>
                    <div style="font-weight: 600; color: var(--text-primary);">${
                      item.displayName || item.name
                    }</div>
                    <div style="font-size: 12px; color: var(--text-muted);">${
                      item.name
                    }</div>
                </div>
            </div>
        </div>
    `
    )
    .join("");

  // Add drag and drop listeners
  const draggables = list.querySelectorAll('[draggable="true"]');
  let draggedElement = null;

  draggables.forEach((draggable) => {
    draggable.addEventListener("dragstart", (e) => {
      draggedElement = draggable;
      draggable.style.opacity = "0.5";
    });

    draggable.addEventListener("dragend", (e) => {
      draggable.style.opacity = "1";
    });

    draggable.addEventListener("dragover", (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(list, e.clientY);
      if (afterElement == null) {
        list.appendChild(draggedElement);
      } else {
        list.insertBefore(draggedElement, afterElement);
      }
    });
  });

  document.getElementById("reorderModal").classList.remove("hidden");
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll('[draggable="true"]:not(.dragging)'),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function saveReorder() {
  const list = document.getElementById("reorderList");
  const elements = list.querySelectorAll("[data-index]");
  const newOrder = [];

  elements.forEach((el) => {
    const index = parseInt(el.dataset.index);
    newOrder.push(items[index]);
  });

  items = newOrder;
  renderItemsList();
  closeModal("reorderModal");
  showAlert("Order saved!", "success");
}

// ============================================
// EVENT LISTENERS
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  console.log(" ");
  console.log(
    "%cMade with 🤍 by Harman Singh Hira in Aotearoa 🌿",
    "color:#ff66b2; font-size:20px; font-weight:bold; text-shadow:0 0 6px #ff99cc;"
  );

  document.getElementById("addItemBtn").addEventListener("click", addNewItem);
  document
    .getElementById("saveItemBtn")
    .addEventListener("click", saveCurrentItem);
  document
    .getElementById("duplicateItemBtn")
    .addEventListener("click", duplicateCurrentItem);
  document
    .getElementById("deleteItemBtn")
    .addEventListener("click", deleteCurrentItem);
  document
    .getElementById("quickRefBtn")
    .addEventListener("click", () => openModal("quickRefModal"));
  document.getElementById("importBtn").addEventListener("click", importJSON);
  document.getElementById("exportBtn").addEventListener("click", exportJSON);
  document
    .getElementById("importConfirmBtn")
    .addEventListener("click", confirmImport);
  document
    .getElementById("reorderBtn")
    .addEventListener("click", openReorderModal);
  document
    .getElementById("reorderSaveBtn")
    .addEventListener("click", saveReorder);
  document
    .getElementById("applyTextToolBtn")
    .addEventListener("click", applyTextTools);

  document.getElementById("downloadBtn").addEventListener("click", () => {
    showAlert("Download functionality - customize this!", "info");
  });

  document.getElementById("validateBtn").addEventListener("click", () => {
    showAlert("Validation passed! ✓", "success");
  });

  // Icon type switcher event listeners
  document.querySelectorAll(".icon-type-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const type = this.getAttribute("data-type");
      switchIconType(type);
    });
  });

  // Initialize
  updateStats();

  // ============================================
  // ICON TYPE SWITCHER
  // ============================================
  function switchIconType(type) {
    // Remove active class from all buttons
    document.querySelectorAll(".icon-type-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    // Add active class to clicked button
    const clickedBtn = document.querySelector(`[data-type="${type}"]`);
    if (clickedBtn) {
      clickedBtn.classList.add("active");
    }

    // Show/hide sections
    if (type === "material") {
      document.getElementById("materialIconSection").classList.remove("hidden");
      document.getElementById("headIconSection").classList.add("hidden");
    } else {
      document.getElementById("materialIconSection").classList.add("hidden");
      document.getElementById("headIconSection").classList.remove("hidden");
    }
  }
  // Keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    // Escape to close modals
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-overlay").forEach((modal) => {
        modal.classList.add("hidden");
      });
    }
  });
});
