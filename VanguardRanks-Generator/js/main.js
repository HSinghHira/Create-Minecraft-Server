// Main Application Entry Point
import {
  initializeMaterials,
  initializeEventListeners,
  updateRanksList,
  updateStatusDisplay,
} from "./ui-handlers.js";

document.addEventListener("DOMContentLoaded", () => {
  initializeMaterials();
  initializeEventListeners();
  updateRanksList();
  updateStatusDisplay();
});
