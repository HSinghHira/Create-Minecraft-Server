// UI Event Handlers and Updates
import { state } from "./state.js";
import { MATERIALS } from "./config.js";
import { escapeHtml, debounce } from "./utils.js";
import {
  editRank,
  addNewRank,
  saveCurrentRank,
  duplicateCurrentRank,
  deleteCurrentRank,
  switchIconType,
  addLoreLine,
  removeLoreLine,
  addRequirementFromTemplate,
  removeRequirement,
  addQuickCommand,
  removeCommand,
  addLpPermission,
  removeLpPermission,
  updateLoreHints,
} from "./rank-manager.js";
import { initializeRGBPicker } from "./rgb-picker.js";
import { initializeFancyPicker } from "./fancy-text.js";
import { downloadYAML } from "./yaml-generator.js";
import { downloadSkript } from "./skript-generator.js";
import { exportConfig, importJSON } from "./import-export.js";
import { validateConfiguration } from "./validation.js";
import { showNotification } from "./utils.js";

export function initializeMaterials() {
  const datalist = document.getElementById("materials");
  MATERIALS.forEach((mat) => {
    const option = document.createElement("option");
    option.value = mat;
    datalist.appendChild(option);
  });
}

export function switchTab(tabName) {
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.classList.remove("active");
    btn.classList.add("bg-gray-700/50");
  });
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.add("hidden");
  });

  const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
  activeBtn.classList.add("active");
  activeBtn.classList.remove("bg-gray-700/50");
  document
    .querySelector(`[data-tab-content="${tabName}"]`)
    .classList.remove("hidden");

  if (tabName === "lore") {
    updateLoreHints();
  }
}

export function updateRanksList() {
  const container = document.getElementById("ranksList");
  if (state.ranks.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 32px;"><p style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px;">No ranks yet</p><p style="font-size: 12px; color: var(--text-muted);">Click "New Rank" to create one</p></div>';
    updateStatusDisplay();
    return;
  }

  container.innerHTML = state.ranks
    .map(
      (rank, index) => `
    <div class="rank-item" style="display: flex; align-items: center; justify-content: space-between; padding: 16px; cursor: pointer; ${state.currentRankIndex === index ? 'border: 2px solid var(--accent-light); background: rgba(113, 90, 90, 0.2);' : 'border: 1px solid rgba(255, 255, 255, 0.1);'}" data-index="${index}">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 24px; font-weight: 700; color: var(--accent-light);">#${index + 1}</div>
        <div>
          <div style="font-size: 16px; font-weight: 600; color: var(--text-primary);">${escapeHtml(rank.display_name || rank.name)}</div>
          <div style="font-size: 12px; color: var(--text-muted);">${rank.icon && rank.icon.startsWith("head:") ? "👤 Custom Head" : rank.icon} × ${rank.icon_amount}</div>
        </div>
      </div>
      <div style="display: flex; gap: 8px;">
        ${rank.requirements.length > 0 ? `<span style="background: rgba(0, 0, 0, 0.2); padding: 4px 8px; border-radius: 4px; font-size: 12px; color: var(--text-muted);">${rank.requirements.length} req</span>` : ""}
        ${rank.commands.length > 0 ? `<span style="background: rgba(0, 0, 0, 0.2); padding: 4px 8px; border-radius: 4px; font-size: 12px; color: var(--accent-light);">${rank.commands.length} cmd</span>` : ""}
      </div>
    </div>
  `
    )
    .join("");

  container.querySelectorAll(".rank-item").forEach((item) => {
    item.addEventListener("click", () =>
      editRank(parseInt(item.dataset.index))
    );
  });

  updateStatusDisplay();
}

export function updateStatusDisplay() {
  document.getElementById("totalRanks").textContent = state.ranks.length;

  let totalRequirements = 0;
  let totalCommands = 0;

  state.ranks.forEach((rank) => {
    totalRequirements += rank.requirements?.length || 0;
    totalCommands += rank.commands?.length || 0;
  });

  document.getElementById("totalRequirements").textContent = totalRequirements;
  document.getElementById("totalCommands").textContent = totalCommands;
}

// Reorder Modal Functions
export function openReorderModal() {
  if (state.ranks.length === 0) {
    showNotification("⚠️ No ranks to reorder!", "error");
    return;
  }
  const container = document.getElementById("reorderList");
  container.innerHTML = state.ranks
    .map(
      (rank, index) => `
    <div class="reorder-item rounded-xl mb-2" style="display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid rgba(255, 255, 255, 0.1); cursor: move;" draggable="true" data-index="${index}">
      <span style="font-size: 24px; color: var(--text-muted);">☰</span>
      <div style="flex: 1;">
        <div style="font-size: 14px; font-weight: 600; color: var(--text-primary);">${escapeHtml(rank.display_name || rank.name)}</div>
        <div style="font-size: 12px; color: var(--text-muted);">${rank.name}</div>
      </div>
      <div style="font-size: 16px; font-weight: 700; color: var(--accent-light);">#${index + 1}</div>
    </div>
  `
    )
    .join("");

  const items = container.querySelectorAll(".reorder-item");
  items.forEach((item) => {
    item.addEventListener("dragstart", handleDragStart);
    item.addEventListener("dragover", handleDragOver);
    item.addEventListener("drop", handleDrop);
    item.addEventListener("dragend", handleDragEnd);
  });
  document.getElementById("reorderModal").classList.remove("hidden");
}

let draggedElement = null;

function handleDragStart(e) {
  draggedElement = this;
  this.classList.add("opacity-50");
}

function handleDragOver(e) {
  e.preventDefault();
  return false;
}

function handleDrop(e) {
  e.stopPropagation();
  if (draggedElement !== this) {
    const allItems = Array.from(document.querySelectorAll(".reorder-item"));
    const draggedIndex = allItems.indexOf(draggedElement);
    const targetIndex = allItems.indexOf(this);
    if (draggedIndex < targetIndex) {
      this.parentNode.insertBefore(draggedElement, this.nextSibling);
    } else {
      this.parentNode.insertBefore(draggedElement, this);
    }
  }
  return false;
}

function handleDragEnd(e) {
  this.classList.remove("opacity-50");
}

export function saveReorder() {
  const items = document.querySelectorAll(".reorder-item");
  const newOrder = Array.from(items).map((item) =>
    parseInt(item.dataset.index)
  );
  const reorderedRanks = newOrder.map((index) => state.ranks[index]);
  state.ranks = reorderedRanks;
  state.currentRankIndex = -1;
  document.getElementById("rankEditor").classList.add("hidden");
  updateRanksList();
  updateStatusDisplay();
  document.getElementById("reorderModal").classList.add("hidden");
  showNotification("✅ Ranks reordered successfully!", "success");
}

export function initializeEventListeners() {
  // Tab switching
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Rank management buttons
  document.getElementById("addRankBtn").addEventListener("click", addNewRank);
  document
    .getElementById("saveRankBtn")
    .addEventListener("click", saveCurrentRank);
  document
    .getElementById("duplicateRankBtn")
    .addEventListener("click", duplicateCurrentRank);
  document
    .getElementById("deleteRankBtn")
    .addEventListener("click", deleteCurrentRank);
  document
    .getElementById("reorderBtn")
    .addEventListener("click", openReorderModal);

  // Icon type switching
  document.querySelectorAll(".icon-type-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchIconType(btn.dataset.type));
  });

  // Lore, Requirements, Commands, LuckPerms
  document.getElementById("addLoreBtn").addEventListener("click", addLoreLine);
  document
    .getElementById("addLpPermBtn")
    .addEventListener("click", addLpPermission);

  document.querySelectorAll(".quick-req").forEach((btn) => {
    btn.addEventListener("click", () =>
      addRequirementFromTemplate(btn.dataset.template)
    );
  });

  document.querySelectorAll(".quick-cmd").forEach((btn) => {
    btn.addEventListener("click", () => addQuickCommand(btn.dataset.cmd));
  });

  // RGB and Fancy pickers
  initializeRGBPicker();
  initializeFancyPicker();

  // Modals
  document.getElementById("quickRefBtn").addEventListener("click", () => {
    document.getElementById("quickRefModal").classList.remove("hidden");
  });
  document.getElementById("closeQuickRefBtn").addEventListener("click", () => {
    document.getElementById("quickRefModal").classList.add("hidden");
  });

  document.getElementById("quickRefModal").addEventListener("click", (e) => {
    if (e.target.id === "quickRefModal") {
      document.getElementById("quickRefModal").classList.add("hidden");
    }
  });

  document.getElementById("importModal").addEventListener("click", (e) => {
    if (e.target.id === "importModal") {
      document.getElementById("importModal").classList.add("hidden");
    }
  });

  document.getElementById("reorderModal").addEventListener("click", (e) => {
    if (e.target.id === "reorderModal") {
      document.getElementById("reorderModal").classList.add("hidden");
    }
  });

  // Download, Export, Import buttons
  document.getElementById("downloadBtn").addEventListener("click", () => {
    const result = downloadYAML();
    if (result) {
      const a = document.createElement("a");
      a.href = result.url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(result.url);
      showNotification("✅ ranks.yml downloaded!", "success");
    } else {
      showNotification("⚠️ No ranks to download!", "error");
    }
  });

  document.getElementById("downloadSkriptBtn").addEventListener("click", () => {
    const result = downloadSkript();
    if (result) {
      const a = document.createElement("a");
      a.href = result.url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(result.url);
      showNotification("✅ installranks.sk downloaded!", "success");
    } else {
      showNotification("⚠️ No ranks to generate Skript!", "error");
    }
  });

  document.getElementById("exportBtn").addEventListener("click", () => {
    const result = exportConfig();
    if (result) {
      const a = document.createElement("a");
      a.href = result.url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(result.url);
      showNotification("✅ Configuration exported!", "success");
    }
  });

  document.getElementById("importBtn").addEventListener("click", () => {
    document.getElementById("importModal").classList.remove("hidden");
  });

  document
    .getElementById("importConfirmBtn")
    .addEventListener("click", importJSON);
  document.getElementById("importCancelBtn").addEventListener("click", () => {
    document.getElementById("importModal").classList.add("hidden");
  });

  document
    .getElementById("reorderSaveBtn")
    .addEventListener("click", saveReorder);
  document.getElementById("reorderCancelBtn").addEventListener("click", () => {
    document.getElementById("reorderModal").classList.add("hidden");
  });

  document
    .getElementById("validateYamlBtn")
    .addEventListener("click", validateConfiguration);

  // Real-time validation for rank name
  document.getElementById("rankName").addEventListener("input", (e) => {
    const errorElement = document.getElementById("rankNameError");
    if (e.target.value.includes(" ")) {
      errorElement.classList.remove("hidden");
    } else {
      errorElement.classList.add("hidden");
    }
  });

  // Auto-update on input changes (debounced)
  document.addEventListener("input", (e) => {
    if (e.target.matches("input, textarea, select")) {
      const debouncedUpdate = debounce(() => updateStatusDisplay(), 300);
      debouncedUpdate();
    }
  });

  // Click handlers for remove buttons
  document.addEventListener("click", (e) => {
    if (
      e.target.classList.contains("remove-lore") ||
      e.target.closest(".remove-lore")
    ) {
      const btn = e.target.classList.contains("remove-lore")
        ? e.target
        : e.target.closest(".remove-lore");
      removeLoreLine(parseInt(btn.dataset.index));
    }
    if (
      e.target.classList.contains("remove-requirement") ||
      e.target.closest(".remove-requirement")
    ) {
      const btn = e.target.classList.contains("remove-requirement")
        ? e.target
        : e.target.closest(".remove-requirement");
      removeRequirement(parseInt(btn.dataset.index));
    }
    if (
      e.target.classList.contains("remove-command") ||
      e.target.closest(".remove-command")
    ) {
      const btn = e.target.classList.contains("remove-command")
        ? e.target
        : e.target.closest(".remove-command");
      removeCommand(parseInt(btn.dataset.index));
    }
    if (
      e.target.classList.contains("remove-lp-perm") ||
      e.target.closest(".remove-lp-perm")
    ) {
      const btn = e.target.classList.contains("remove-lp-perm")
        ? e.target
        : e.target.closest(".remove-lp-perm");
      removeLpPermission(parseInt(btn.dataset.index));
    }
  });
}
