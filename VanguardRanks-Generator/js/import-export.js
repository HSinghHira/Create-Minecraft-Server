// Import/Export Functionality
import { state, createRankTemplate } from "./state.js";
import { showNotification } from "./utils.js";
import { updateRanksList, updateStatusDisplay } from "./ui-handlers.js";

export function exportConfig() {
  if (state.ranks.length === 0) {
    showNotification("⚠️ No ranks to export!", "error");
    return null;
  }
  const config = JSON.stringify(state.ranks, null, 2);
  const blob = new Blob([config], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  return { url, filename: "ranks-config.json" };
}

export function importJSON() {
  const jsonText = document.getElementById("importJsonText").value.trim();
  if (!jsonText) {
    showNotification("⚠️ Please paste JSON content!", "error");
    return;
  }
  try {
    const importedRanks = JSON.parse(jsonText);

    // Validate structure
    if (!Array.isArray(importedRanks)) {
      throw new Error("Invalid format: Expected an array of ranks");
    }

    // Validate each rank has required fields
    importedRanks.forEach((rank, index) => {
      if (!rank.name) {
        throw new Error(`Rank at index ${index} is missing 'name' field`);
      }
    });

    state.ranks = importedRanks;
    state.currentRankIndex = -1;
    document.getElementById("rankEditor").classList.add("hidden");
    updateRanksList();
    updateStatusDisplay();
    document.getElementById("importModal").classList.add("hidden");
    document.getElementById("importJsonText").value = "";
    showNotification(
      `✅ Successfully imported ${state.ranks.length} rank(s)!`,
      "success"
    );
  } catch (error) {
    showNotification(`❌ Import failed: ${error.message}`, "error");
  }
}
