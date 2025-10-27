// Rank Management
import { state, createRankTemplate, getCurrentRank } from "./state.js";
import { showNotification, escapeHtml, validateRankName } from "./utils.js";
import { updateRanksList, updateStatusDisplay } from "./ui-handlers.js";
import { REQUIREMENT_TEMPLATES, QUICK_COMMANDS } from "./config.js";

export function addNewRank() {
  const rank = createRankTemplate();
  rank.name = `rank${state.ranks.length + 1}`;
  rank.display_name = `Rank ${state.ranks.length + 1}`;
  rank.prefix = `[Rank ${state.ranks.length + 1}]`;
  rank.icon = "DIAMOND";
  state.ranks.push(rank);
  updateRanksList();
  editRank(state.ranks.length - 1);
}

export function editRank(index) {
  state.currentRankIndex = index;
  const rank = state.ranks[index];
  document.getElementById("rankEditor").classList.remove("hidden");

  document.getElementById("rankName").value = rank.name;
  document.getElementById("displayName").value = rank.display_name;
  document.getElementById("prefix").value = rank.prefix;

  if (rank.icon && rank.icon.startsWith("head:")) {
    state.iconType = "head";
    switchIconType("head");
    document.getElementById("iconHeadTexture").value = rank.icon.substring(5);
    document.getElementById("iconMaterial").value = "PLAYER_HEAD";
  } else {
    state.iconType = "material";
    switchIconType("material");
    document.getElementById("iconMaterial").value = rank.icon || "DIAMOND";
  }

  document.getElementById("iconAmount").value = rank.icon_amount;
  document.getElementById("iconModelData").value = rank.icon_model_data;

  loadLoreLines(rank.lore);
  loadRequirements(rank.requirements);
  loadCommands(rank.commands);
  loadLuckPermsSettings(
    rank.luckperms || { weight: 0, permissions: [], inheritPrevious: true }
  );

  updateStatusDisplay();
  updateRanksList();
}

export function saveCurrentRank() {
  if (state.currentRankIndex === -1) return;

  const rank = state.ranks[state.currentRankIndex];
  const rankName =
    document.getElementById("rankName").value ||
    `rank${state.currentRankIndex + 1}`;

  // Validate rank name
  if (!validateRankName(rankName)) {
    document.getElementById("rankNameError").classList.remove("hidden");
    showNotification("❌ Rank name cannot contain spaces!", "error");
    return;
  }

  document.getElementById("rankNameError").classList.add("hidden");

  rank.name = rankName;
  rank.display_name = document.getElementById("displayName").value || rank.name;
  rank.prefix = document.getElementById("prefix").value || `[${rank.name}]`;

  if (state.iconType === "head") {
    const texture = document.getElementById("iconHeadTexture").value.trim();
    rank.icon = texture ? `head:${texture}` : "PLAYER_HEAD";
  } else {
    rank.icon = document.getElementById("iconMaterial").value || "DIAMOND";
  }

  rank.icon_amount = parseInt(document.getElementById("iconAmount").value) || 1;
  rank.icon_model_data =
    parseInt(document.getElementById("iconModelData").value) || 0;

  rank.lore = getLoreLines();
  rank.requirements = getRequirements();
  rank.commands = getCommands();
  rank.luckperms = {
    weight: parseInt(document.getElementById("lpWeight").value) || 0,
    permissions: getLpPermissions(),
    inheritPrevious: document.getElementById("lpInheritPrevious").checked,
  };

  updateRanksList();
  updateStatusDisplay();
  updateLoreHints();
  showNotification("✅ Rank saved successfully!", "success");
}

export function duplicateCurrentRank() {
  if (state.currentRankIndex === -1) return;
  const currentRank = state.ranks[state.currentRankIndex];
  const newRank = JSON.parse(JSON.stringify(currentRank));
  newRank.name = `${currentRank.name}_copy`;
  newRank.display_name = `${currentRank.display_name} Copy`;
  state.ranks.push(newRank);
  updateRanksList();
  editRank(state.ranks.length - 1);
  showNotification("📋 Rank duplicated!", "success");
}

export function deleteCurrentRank() {
  if (state.currentRankIndex === -1) return;
  if (confirm("⚠️ Are you sure you want to delete this rank?")) {
    state.ranks.splice(state.currentRankIndex, 1);
    state.currentRankIndex = -1;
    document.getElementById("rankEditor").classList.add("hidden");
    updateRanksList();
    updateStatusDisplay();
    showNotification("🗑️ Rank deleted!", "success");
  }
}

export function switchIconType(type) {
  state.iconType = type;
  document
    .querySelectorAll(".icon-type-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document.querySelector(`[data-type="${type}"]`).classList.add("active");

  if (type === "material") {
    document.getElementById("materialIconSection").classList.remove("hidden");
    document.getElementById("headIconSection").classList.add("hidden");
  } else {
    document.getElementById("materialIconSection").classList.add("hidden");
    document.getElementById("headIconSection").classList.remove("hidden");
  }
}

// Lore Management
export function loadLoreLines(lore) {
  const container = document.getElementById("loreContainer");
  if (lore.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 16px;"><p style="font-size: 12px; color: var(--text-muted);">No lore lines yet</p></div>';
    return;
  }
  container.innerHTML = lore
    .map(
      (line, index) => `
    <div style="display: flex; gap: 8px;">
      <input type="text" class="lore-line flex-1 w-full" value="${escapeHtml(line)}" data-index="${index}" placeholder="Lore line ${index + 1}">
      <button class="remove-lore btn" style="border-color: rgba(239, 68, 68, 0.5); padding: 8px 12px;" data-index="${index}">✕</button>
    </div>
  `
    )
    .join("");
}

export function addLoreLine() {
  if (state.currentRankIndex === -1) return;
  const rank = state.ranks[state.currentRankIndex];
  rank.lore.push("");
  loadLoreLines(rank.lore);
  updateStatusDisplay();
}

export function removeLoreLine(index) {
  const rank = state.ranks[state.currentRankIndex];
  rank.lore.splice(index, 1);
  loadLoreLines(rank.lore);
  updateStatusDisplay();
}

export function getLoreLines() {
  return Array.from(document.querySelectorAll(".lore-line"))
    .map((input) => input.value)
    .filter((line) => line.trim() !== "");
}

export function updateLoreHints() {
  if (state.currentRankIndex === -1) return;
  const rank = state.ranks[state.currentRankIndex];
  const container = document.getElementById("loreHints");
  if (rank.requirements.length === 0) {
    container.innerHTML = '<p style="font-size: 12px; color: var(--text-muted);">No requirements yet. Add requirements to use placeholders.</p>';
    return;
  }
  const hints = rank.requirements
    .map(
      (req, index) =>
        `<code style="background: rgba(0, 0, 0, 0.2); padding: 2px 4px; border-radius: 4px; color: var(--accent-light);">%requirement_${index}%</code>`
    )
    .join(" ");
  container.innerHTML = `<p style="font-size: 12px; color: var(--text-muted);"><strong>Available:</strong> ${hints}</p>`;
}

// Requirements Management
export function addRequirementFromTemplate(templateKey) {
  if (state.currentRankIndex === -1) {
    showNotification("⚠️ Please select a rank first!", "error");
    return;
  }
  const rank = state.ranks[state.currentRankIndex];
  if (templateKey === "custom") {
    rank.requirements.push({
      "%placeholder%": {
        type: "NUMBER",
        eval: "GREATER",
        value: "0",
        gui_message: "&7Status: %status%",
        deny_message: "&7Requirement not met",
      },
    });
  } else {
    const template = REQUIREMENT_TEMPLATES[templateKey];
    const req = {};
    req[template.placeholder] = {
      type: template.type,
      eval: template.eval,
      value: "1",
      gui_message: template.guiMessage,
      deny_message: template.denyMessage,
    };
    rank.requirements.push(req);
  }
  loadRequirements(rank.requirements);
  updateStatusDisplay();
  updateLoreHints();
  showNotification("✅ Requirement added!", "success");
}

export function loadRequirements(requirements) {
  const container = document.getElementById("requirementsContainer");
  if (requirements.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 32px;"><p style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px;">No requirements yet</p><p style="font-size: 12px; color: var(--text-muted);">Use quick templates above to get started</p></div>';
    return;
  }
  container.innerHTML = requirements
    .map((req, index) => {
      const placeholder = Object.keys(req)[0];
      const reqData = req[placeholder];
      return `
      <div class="requirement-item card" style="padding: 16px; margin-bottom: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h4 style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Requirement ${index + 1}</h4>
          <button class="remove-requirement btn" style="border-color: rgba(239, 68, 68, 0.5); padding: 8px 12px;" data-index="${index}">✕</button>
        </div>
        <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
          <div>
            <label style="font-size: 12px; color: var(--text-muted); font-weight: 600;">Placeholder</label>
            <input type="text" class="req-placeholder w-full" placeholder="%placeholder%" value="${escapeHtml(placeholder)}" data-index="${index}">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 12px; color: var(--text-muted); font-weight: 600;">Type</label>
              <select class="req-type w-full" data-index="${index}">
                <option value="NUMBER" ${reqData.type === "NUMBER" ? "selected" : ""}>NUMBER</option>
                <option value="TEXT" ${reqData.type === "TEXT" ? "selected" : ""}>TEXT</option>
                <option value="BOOLEAN" ${reqData.type === "BOOLEAN" ? "selected" : ""}>BOOLEAN</option>
              </select>
            </div>
            <div>
              <label style="font-size: 12px; color: var(--text-muted); font-weight: 600;">Evaluation</label>
              <select class="req-eval w-full" data-index="${index}">
                <option value="EQUAL" ${reqData.eval === "EQUAL" ? "selected" : ""}>EQUAL</option>
                <option value="GREATER" ${reqData.eval === "GREATER" ? "selected" : ""}>GREATER</option>
                <option value="LESSER" ${reqData.eval === "LESSER" ? "selected" : ""}>LESSER</option>
                <option value="GREATER_EQUAL" ${reqData.eval === "GREATER_EQUAL" ? "selected" : ""}>GREATER_EQUAL</option>
                <option value="LESSER_EQUAL" ${reqData.eval === "LESSER_EQUAL" ? "selected" : ""}>LESSER_EQUAL</option>
                <option value="NOT_EQUAL" ${reqData.eval === "NOT_EQUAL" ? "selected" : ""}>NOT_EQUAL</option>
              </select>
            </div>
          </div>
          <div>
            <label style="font-size: 12px; color: var(--text-muted); font-weight: 600;">Value</label>
            <input type="text" class="req-value w-full" placeholder="Required value" value="${escapeHtml(reqData.value)}" data-index="${index}">
          </div>
          <div>
            <label style="font-size: 12px; color: var(--text-muted); font-weight: 600;">GUI Message</label>
            <input type="text" class="req-gui-msg w-full" placeholder="&7Status: %status%" value="${escapeHtml(reqData.gui_message || "")}" data-index="${index}">
          </div>
          <div>
            <label style="font-size: 12px; color: var(--text-muted); font-weight: 600;">Deny Message</label>
            <input type="text" class="req-deny-msg w-full" placeholder="&7Requirement not met" value="${escapeHtml(reqData.deny_message || "")}" data-index="${index}">
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

export function removeRequirement(index) {
  const rank = state.ranks[state.currentRankIndex];
  rank.requirements.splice(index, 1);
  loadRequirements(rank.requirements);
  updateStatusDisplay();
  updateLoreHints();
  showNotification("🗑️ Requirement removed!", "success");
}

export function getRequirements() {
  const requirements = [];
  document.querySelectorAll(".requirement-item").forEach((item) => {
    const placeholder = item.querySelector(".req-placeholder").value;
    const type = item.querySelector(".req-type").value;
    const eval_ = item.querySelector(".req-eval").value;
    const value = item.querySelector(".req-value").value;
    const guiMsg = item.querySelector(".req-gui-msg").value;
    const denyMsg = item.querySelector(".req-deny-msg").value;
    if (placeholder && value) {
      const req = {};
      req[placeholder] = { type: type, eval: eval_, value: value };
      if (guiMsg) req[placeholder].gui_message = guiMsg;
      if (denyMsg) req[placeholder].deny_message = denyMsg;
      requirements.push(req);
    }
  });
  return requirements;
}

// Commands Management
export function loadCommands(commands) {
  const container = document.getElementById("commandsContainer");
  if (commands.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 32px;"><p style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px;">No commands yet</p><p style="font-size: 12px; color: var(--text-muted);">Use quick commands above to get started</p></div>';
    return;
  }
  container.innerHTML = commands
    .map(
      (cmd, index) => `
    <div class="command-item" style="display: flex; gap: 8px;">
      <input type="text" class="command-input flex-1 w-full font-mono text-sm" value="${escapeHtml(cmd)}" data-index="${index}" placeholder="command %player%">
      <button class="remove-command btn" style="border-color: rgba(239, 68, 68, 0.5); padding: 8px 12px;" data-index="${index}">✕</button>
    </div>
  `
    )
    .join("");
}

export function addQuickCommand(type) {
  if (state.currentRankIndex === -1) {
    showNotification("⚠️ Please select a rank first!", "error");
    return;
  }
  const rank = state.ranks[state.currentRankIndex];
  const commandGenerator = QUICK_COMMANDS[type];
  const command = commandGenerator
    ? commandGenerator(rank.name, rank.display_name)
    : "";
  rank.commands.push(command);
  loadCommands(rank.commands);
  updateStatusDisplay();
  showNotification("✅ Command added!", "success");
}

export function removeCommand(index) {
  const rank = state.ranks[state.currentRankIndex];
  rank.commands.splice(index, 1);
  loadCommands(rank.commands);
  updateStatusDisplay();
  showNotification("🗑️ Command removed!", "success");
}

export function getCommands() {
  return Array.from(document.querySelectorAll(".command-input"))
    .map((input) => input.value)
    .filter((cmd) => cmd.trim());
}

// LuckPerms Management
export function loadLuckPermsSettings(lpSettings) {
  document.getElementById("lpWeight").value = lpSettings.weight || 0;
  document.getElementById("lpInheritPrevious").checked =
    lpSettings.inheritPrevious !== false;
  loadLpPermissions(lpSettings.permissions || []);
}

export function loadLpPermissions(permissions) {
  const container = document.getElementById("lpPermissionsContainer");
  if (permissions.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 16px;"><p style="font-size: 12px; color: var(--text-muted);">No permissions yet</p></div>';
    return;
  }
  container.innerHTML = permissions
    .map(
      (perm, index) => `
    <div style="display: flex; gap: 8px;">
      <input type="text" class="lp-permission flex-1 w-full font-mono text-sm" value="${escapeHtml(perm)}" data-index="${index}" placeholder="example.permission">
      <button class="remove-lp-perm btn" style="border-color: rgba(239, 68, 68, 0.5); padding: 8px 12px;" data-index="${index}">✕</button>
    </div>
  `
    )
    .join("");
}

export function addLpPermission() {
  if (state.currentRankIndex === -1) return;
  const rank = state.ranks[state.currentRankIndex];
  if (!rank.luckperms) {
    rank.luckperms = { weight: 0, permissions: [], inheritPrevious: true };
  }
  rank.luckperms.permissions.push("");
  loadLpPermissions(rank.luckperms.permissions);
  updateStatusDisplay();
}

export function removeLpPermission(index) {
  const rank = state.ranks[state.currentRankIndex];
  rank.luckperms.permissions.splice(index, 1);
  loadLpPermissions(rank.luckperms.permissions);
  updateStatusDisplay();
}

export function getLpPermissions() {
  return Array.from(document.querySelectorAll(".lp-permission"))
    .map((input) => input.value)
    .filter((perm) => perm.trim());
}