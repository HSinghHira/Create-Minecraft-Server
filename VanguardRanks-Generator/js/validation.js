// Validation Logic
import { state } from "./state.js";
import { showNotification } from "./utils.js";

export function validateConfiguration() {
  if (state.ranks.length === 0) {
    showNotification("⚠️ No ranks to validate!", "error");
    return;
  }

  const errors = [];
  const warnings = [];

  state.ranks.forEach((rank, index) => {
    if (!rank.name) errors.push(`Rank ${index + 1}: Missing name`);
    if (rank.name && rank.name.includes(" ")) {
      errors.push(
        `Rank ${index + 1}: Name contains spaces (use underscores instead)`
      );
    }
    if (!rank.display_name)
      errors.push(`Rank ${index + 1}: Missing display name`);
    if (!rank.prefix) errors.push(`Rank ${index + 1}: Missing prefix`);
    if (!rank.icon) errors.push(`Rank ${index + 1}: Missing icon`);

    const duplicates = state.ranks.filter((r) => r.name === rank.name);
    if (duplicates.length > 1) {
      errors.push(`Duplicate rank name: ${rank.name}`);
    }

    if (rank.requirements.length === 0) {
      warnings.push(`Rank ${rank.name}: No requirements (auto-granted)`);
    }

    if (rank.commands.length === 0) {
      warnings.push(`Rank ${rank.name}: No commands (no actions)`);
    }

    rank.requirements.forEach((req, reqIndex) => {
      const key = Object.keys(req)[0];
      const data = req[key];
      if (!key.includes("%")) {
        warnings.push(
          `Rank ${rank.name}, Req ${reqIndex + 1}: Missing % in placeholder`
        );
      }
      if (!data.value) {
        errors.push(`Rank ${rank.name}, Req ${reqIndex + 1}: Missing value`);
      }
    });
  });

  const resultsDiv = document.getElementById("validationResults");
  resultsDiv.classList.remove("hidden");

  if (errors.length > 0) {
    resultsDiv.innerHTML = `
      <div class="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
        <h4 class="font-bold text-red-400 mb-2">❌ Validation Errors:</h4>
        <ul class="text-sm text-red-300 space-y-1 list-disc list-inside">
          ${errors.map((err) => `<li>${err}</li>`).join("")}
        </ul>
      </div>
    `;
    showNotification(
      `❌ Validation failed with ${errors.length} error(s)`,
      "error"
    );
  } else if (warnings.length > 0) {
    resultsDiv.innerHTML = `
      <div class="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4">
        <h4 class="font-bold text-yellow-400 mb-2">⚠️ Validation Warnings:</h4>
        <ul class="text-sm text-yellow-300 space-y-1 list-disc list-inside">
          ${warnings.map((warn) => `<li>${warn}</li>`).join("")}
        </ul>
      </div>
    `;
    showNotification(
      `⚠️ Validation passed with ${warnings.length} warning(s)`,
      "info"
    );
  } else {
    resultsDiv.innerHTML = `
      <div class="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
        <h4 class="font-bold text-green-400 mb-2">✅ Validation Successful!</h4>
        <p class="text-sm text-green-300">All ranks are properly configured and ready to use.</p>
      </div>
    `;
    showNotification("✅ Configuration is valid! Ready to use!", "success");
  }
}
