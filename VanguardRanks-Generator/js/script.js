// VanguardRanks Generator - Enhanced JavaScript

// State Management
let ranks = [];
let currentRankIndex = -1;
let rgbTarget = null;
let iconType = "material"; // 'material' or 'head'

// Minecraft Materials List (Extended)
const materials = [
  "WOODEN_SWORD",
  "STONE_SWORD",
  "IRON_SWORD",
  "GOLDEN_SWORD",
  "DIAMOND_SWORD",
  "NETHERITE_SWORD",
  "WOODEN_AXE",
  "STONE_AXE",
  "IRON_AXE",
  "GOLDEN_AXE",
  "DIAMOND_AXE",
  "NETHERITE_AXE",
  "WOODEN_PICKAXE",
  "STONE_PICKAXE",
  "IRON_PICKAXE",
  "GOLDEN_PICKAXE",
  "DIAMOND_PICKAXE",
  "NETHERITE_PICKAXE",
  "BOW",
  "CROSSBOW",
  "TRIDENT",
  "SHIELD",
  "ELYTRA",
  "FISHING_ROD",
  "LEATHER_HELMET",
  "LEATHER_CHESTPLATE",
  "LEATHER_LEGGINGS",
  "LEATHER_BOOTS",
  "IRON_HELMET",
  "IRON_CHESTPLATE",
  "IRON_LEGGINGS",
  "IRON_BOOTS",
  "DIAMOND_HELMET",
  "DIAMOND_CHESTPLATE",
  "DIAMOND_LEGGINGS",
  "DIAMOND_BOOTS",
  "NETHERITE_HELMET",
  "NETHERITE_CHESTPLATE",
  "NETHERITE_LEGGINGS",
  "NETHERITE_BOOTS",
  "DIAMOND",
  "EMERALD",
  "GOLD_INGOT",
  "IRON_INGOT",
  "NETHERITE_INGOT",
  "COAL",
  "REDSTONE",
  "EXPERIENCE_BOTTLE",
  "NETHER_STAR",
  "BEACON",
  "TOTEM_OF_UNDYING",
  "ENCHANTED_BOOK",
  "PLAYER_HEAD",
  "STONE",
  "COBBLESTONE",
  "GRASS_BLOCK",
  "DIRT",
  "CHEST",
  "ENDER_CHEST",
  "OBSIDIAN",
];

// Requirement Templates
const requirementTemplates = {
  playtime: {
    placeholder: "%statistic_play_one_minute%",
    type: "NUMBER",
    eval: "GREATER",
    guiMessage:
      "&7Playtime: &a%formatter_number_shorten_{current}%&7/&e%formatter_number_shorten_{required}% &r%status%",
    denyMessage: "&7You need more playtime to rank up",
  },
  money: {
    placeholder: "%vault_eco_balance%",
    type: "NUMBER",
    eval: "GREATER",
    guiMessage:
      "&7Money &a%formatter_number_shorten_{current}%&7/&e%formatter_number_shorten_{required}% &r%status%",
    denyMessage: "&7You need more money",
  },
  kills: {
    placeholder: "%statistic_player_kills%",
    type: "NUMBER",
    eval: "GREATER",
    guiMessage: "&7Kills: &a%current%&7/&e%required% &r%status%",
    denyMessage: "&7You need more kills",
  },
  level: {
    placeholder: "%player_level%",
    type: "NUMBER",
    eval: "GREATER",
    guiMessage: "&7Level: &a%current%&7/&e%required% &r%status%",
    denyMessage: "&7You need to be a higher level",
  },
  blocks: {
    placeholder: "%statistic_mine_block%",
    type: "NUMBER",
    eval: "GREATER",
    guiMessage:
      "&7Blocks: &a%formatter_number_shorten_{current}%&7/&e%formatter_number_shorten_{required}% &r%status%",
    denyMessage: "&7You need to break more blocks",
  },
};

// Rank Template
function createRankTemplate() {
  return {
    name: "",
    prefix: "",
    display_name: "",
    icon: "DIAMOND",
    iconType: "material",
    headTexture: "",
    icon_amount: 1,
    icon_model_data: 0,
    lore: [],
    requirements: [],
    commands: [],
    luckperms: {
      weight: 0,
      permissions: [],
      inheritPrevious: true,
    },
  };
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initializeMaterials();
  initializeEventListeners();
  updateRanksList();
});

function initializeMaterials() {
  const datalist = document.getElementById("materials");
  materials.forEach((mat) => {
    const option = document.createElement("option");
    option.value = mat;
    datalist.appendChild(option);
  });
}

function initializeEventListeners() {
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

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

  document.querySelectorAll(".icon-type-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchIconType(btn.dataset.type));
  });

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

  document
    .getElementById("rgbDisplayBtn")
    .addEventListener("click", () => openRGBPicker("display"));
  document
    .getElementById("rgbPrefixBtn")
    .addEventListener("click", () => openRGBPicker("prefix"));
  document
    .getElementById("rgbApplyBtn")
    .addEventListener("click", applyRGBColor);
  document
    .getElementById("rgbCancelBtn")
    .addEventListener("click", closeRGBPicker);

  document.getElementById("rgbStartColor").addEventListener("input", (e) => {
    document.getElementById("rgbStartHex").value = e.target.value;
    updateRGBPreview();
  });
  document.getElementById("rgbStartHex").addEventListener("input", (e) => {
    document.getElementById("rgbStartColor").value = e.target.value;
    updateRGBPreview();
  });
  document.getElementById("rgbEndColor").addEventListener("input", (e) => {
    document.getElementById("rgbEndHex").value = e.target.value;
    updateRGBPreview();
  });
  document.getElementById("rgbEndHex").addEventListener("input", (e) => {
    document.getElementById("rgbEndColor").value = e.target.value;
    updateRGBPreview();
  });
  document
    .getElementById("rgbText")
    .addEventListener("input", updateRGBPreview);

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
  document.getElementById("rgbModal").addEventListener("click", (e) => {
    if (e.target.id === "rgbModal") closeRGBPicker();
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

  document
    .getElementById("downloadBtn")
    .addEventListener("click", downloadYAML);
  document
    .getElementById("downloadSkriptBtn")
    .addEventListener("click", downloadSkript);
  document.getElementById("exportBtn").addEventListener("click", exportConfig);
  document.getElementById("importBtn").addEventListener("click", () => {
    document.getElementById("importModal").classList.remove("hidden");
  });
  document
    .getElementById("importConfirmBtn")
    .addEventListener("click", importYAML);
  document.getElementById("importCancelBtn").addEventListener("click", () => {
    document.getElementById("importModal").classList.add("hidden");
  });

  document
    .getElementById("reorderSaveBtn")
    .addEventListener("click", saveReorder);
  document.getElementById("reorderCancelBtn").addEventListener("click", () => {
    document.getElementById("reorderModal").classList.add("hidden");
  });

  document.getElementById("copyYamlBtn").addEventListener("click", copyYAML);
  document
    .getElementById("validateYamlBtn")
    .addEventListener("click", validateYAML);

  document.addEventListener("input", (e) => {
    if (e.target.matches("input, textarea, select")) {
      const debouncedUpdate = debounce(() => updatePreview(), 300);
      debouncedUpdate();
    }
  });

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

function switchTab(tabName) {
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

  if (tabName === "lore") updateLoreHints();
}

function switchIconType(type) {
  iconType = type;
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

function addNewRank() {
  const rank = createRankTemplate();
  rank.name = `rank${ranks.length + 1}`;
  rank.display_name = `Rank ${ranks.length + 1}`;
  rank.prefix = `[Rank ${ranks.length + 1}]`;
  rank.icon = "DIAMOND";
  ranks.push(rank);
  updateRanksList();
  editRank(ranks.length - 1);
}

function editRank(index) {
  currentRankIndex = index;
  const rank = ranks[index];
  document.getElementById("rankEditor").classList.remove("hidden");

  document.getElementById("rankName").value = rank.name;
  document.getElementById("displayName").value = rank.display_name;
  document.getElementById("prefix").value = rank.prefix;

  if (rank.icon && rank.icon.startsWith("head:")) {
    iconType = "head";
    switchIconType("head");
    document.getElementById("iconHeadTexture").value = rank.icon.substring(5);
    document.getElementById("iconMaterial").value = "PLAYER_HEAD";
  } else {
    iconType = "material";
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

  updatePreview();
  updateRanksList();
}

function saveCurrentRank() {
  if (currentRankIndex === -1) return;

  const rank = ranks[currentRankIndex];
  rank.name =
    document.getElementById("rankName").value || `rank${currentRankIndex + 1}`;
  rank.display_name = document.getElementById("displayName").value || rank.name;
  rank.prefix = document.getElementById("prefix").value || `[${rank.name}]`;

  if (iconType === "head") {
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
  updatePreview();
  updateLoreHints();
  showNotification("✅ Rank saved successfully!", "success");
}

function duplicateCurrentRank() {
  if (currentRankIndex === -1) return;
  const currentRank = ranks[currentRankIndex];
  const newRank = JSON.parse(JSON.stringify(currentRank));
  newRank.name = `${currentRank.name}_copy`;
  newRank.display_name = `${currentRank.display_name} Copy`;
  ranks.push(newRank);
  updateRanksList();
  editRank(ranks.length - 1);
  showNotification("📋 Rank duplicated!", "success");
}

function deleteCurrentRank() {
  if (currentRankIndex === -1) return;
  if (confirm("⚠️ Are you sure you want to delete this rank?")) {
    ranks.splice(currentRankIndex, 1);
    currentRankIndex = -1;
    document.getElementById("rankEditor").classList.add("hidden");
    updateRanksList();
    updatePreview();
    showNotification("🗑️ Rank deleted!", "success");
  }
}

function updateRanksList() {
  const container = document.getElementById("ranksList");
  if (ranks.length === 0) {
    container.innerHTML =
      '<div class="text-center py-8"><p class="text-gray-400 text-sm mb-2">No ranks yet</p><p class="text-gray-500 text-xs">Click "New Rank" to create one</p></div>';
    updatePreview();
    return;
  }

  container.innerHTML = ranks
    .map(
      (rank, index) => `
    <div class="rank-item flex items-center justify-between p-4 rounded-lg cursor-pointer transition ${
      currentRankIndex === index
        ? "bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-2 border-purple-500/50"
        : "bg-gray-700/30 hover:bg-gray-600/30 border-2 border-transparent"
    }" data-index="${index}">
      <div class="flex items-center gap-3">
        <div class="text-2xl font-bold text-purple-400">#${index + 1}</div>
        <div>
          <div class="font-semibold text-lg">${escapeHtml(
            rank.display_name || rank.name
          )}</div>
          <div class="text-xs text-gray-400">${
            rank.icon && rank.icon.startsWith("head:")
              ? "👤 Custom Head"
              : rank.icon
          } × ${rank.icon_amount}</div>
        </div>
      </div>
      <div class="flex gap-2">
        ${
          rank.requirements.length > 0
            ? `<span class="requirement-badge">${rank.requirements.length} req</span>`
            : ""
        }
        ${
          rank.commands.length > 0
            ? `<span class="requirement-badge bg-gradient-to-r from-green-500 to-emerald-600">${rank.commands.length} cmd</span>`
            : ""
        }
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
}

function updateLoreHints() {
  if (currentRankIndex === -1) return;
  const rank = ranks[currentRankIndex];
  const container = document.getElementById("loreHints");
  if (rank.requirements.length === 0) {
    container.innerHTML =
      '<p class="text-gray-500">No requirements yet. Add requirements to use placeholders.</p>';
    return;
  }
  const hints = rank.requirements
    .map(
      (req, index) =>
        `<code class="bg-gray-800 px-1 rounded">%requirement_${index}%</code>`
    )
    .join(" ");
  container.innerHTML = `<p><strong>Available:</strong> ${hints}</p>`;
}

function loadLoreLines(lore) {
  const container = document.getElementById("loreContainer");
  if (lore.length === 0) {
    container.innerHTML =
      '<div class="text-center py-4"><p class="text-gray-400 text-xs">No lore lines yet</p></div>';
    return;
  }
  container.innerHTML = lore
    .map(
      (line, index) => `
    <div class="flex gap-2">
      <input type="text" class="lore-line flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition text-sm" value="${escapeHtml(
        line
      )}" data-index="${index}" placeholder="Lore line ${index + 1}">
      <button class="remove-lore px-3 py-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-lg text-sm font-semibold transition shadow" data-index="${index}">✕</button>
    </div>
  `
    )
    .join("");
}

function addLoreLine() {
  if (currentRankIndex === -1) return;
  const rank = ranks[currentRankIndex];
  rank.lore.push("");
  loadLoreLines(rank.lore);
  updatePreview();
}

function removeLoreLine(index) {
  const rank = ranks[currentRankIndex];
  rank.lore.splice(index, 1);
  loadLoreLines(rank.lore);
  updatePreview();
}

function getLoreLines() {
  return Array.from(document.querySelectorAll(".lore-line"))
    .map((input) => input.value)
    .filter((line) => line.trim() !== "");
}

function addRequirementFromTemplate(templateKey) {
  if (currentRankIndex === -1) {
    showNotification("⚠️ Please select a rank first!", "error");
    return;
  }
  const rank = ranks[currentRankIndex];
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
    const template = requirementTemplates[templateKey];
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
  updatePreview();
  updateLoreHints();
  showNotification("✅ Requirement added!", "success");
}

function loadRequirements(requirements) {
  const container = document.getElementById("requirementsContainer");
  if (requirements.length === 0) {
    container.innerHTML =
      '<div class="text-center py-8"><p class="text-gray-400 text-sm mb-2">No requirements yet</p><p class="text-gray-500 text-xs">Use quick templates above to get started</p></div>';
    return;
  }
  container.innerHTML = requirements
    .map((req, index) => {
      const reqKey = Object.keys(req)[0];
      const reqData = req[reqKey];
      return `
      <div class="requirement-item bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-4 rounded-lg border-2 border-gray-600/50 hover:border-purple-500/50 transition" data-index="${index}">
        <div class="flex justify-between items-start mb-3">
          <div class="flex items-center gap-2">
            <span class="text-lg">📊</span>
            <h4 class="font-bold text-sm text-purple-300">Requirement ${
              index + 1
            }</h4>
          </div>
          <button class="remove-requirement text-red-400 hover:text-red-300 text-xl font-bold transition" data-index="${index}">✕</button>
        </div>
        <div class="space-y-3">
          <div>
            <label class="text-xs text-gray-400 font-semibold">Placeholder</label>
            <input type="text" class="req-placeholder w-full px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition text-sm font-mono" placeholder="%statistic_play_one_minute%" value="${escapeHtml(
              reqKey
            )}" data-index="${index}">
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-gray-400 font-semibold">Type</label>
              <select class="req-type w-full px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg focus:outline-none focus:border-purple-500 transition text-sm" data-index="${index}">
                <option value="NUMBER" ${
                  reqData.type === "NUMBER" ? "selected" : ""
                }>NUMBER</option>
                <option value="TEXT" ${
                  reqData.type === "TEXT" ? "selected" : ""
                }>TEXT</option>
                <option value="BOOLEAN" ${
                  reqData.type === "BOOLEAN" ? "selected" : ""
                }>BOOLEAN</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-gray-400 font-semibold">Evaluation</label>
              <select class="req-eval w-full px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg focus:outline-none focus:border-purple-500 transition text-sm" data-index="${index}">
                <option value="EQUAL" ${
                  reqData.eval === "EQUAL" ? "selected" : ""
                }>EQUAL</option>
                <option value="GREATER" ${
                  reqData.eval === "GREATER" ? "selected" : ""
                }>GREATER</option>
                <option value="LESSER" ${
                  reqData.eval === "LESSER" ? "selected" : ""
                }>LESSER</option>
                <option value="GREATER_EQUAL" ${
                  reqData.eval === "GREATER_EQUAL" ? "selected" : ""
                }>GREATER_EQUAL</option>
                <option value="LESSER_EQUAL" ${
                  reqData.eval === "LESSER_EQUAL" ? "selected" : ""
                }>LESSER_EQUAL</option>
                <option value="NOT_EQUAL" ${
                  reqData.eval === "NOT_EQUAL" ? "selected" : ""
                }>NOT_EQUAL</option>
              </select>
            </div>
          </div>
          <div>
            <label class="text-xs text-gray-400 font-semibold">Value</label>
            <input type="text" class="req-value w-full px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition text-sm" placeholder="Required value" value="${escapeHtml(
              reqData.value
            )}" data-index="${index}">
          </div>
          <div>
            <label class="text-xs text-gray-400 font-semibold">GUI Message</label>
            <input type="text" class="req-gui-msg w-full px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition text-sm" placeholder="&7Status: %status%" value="${escapeHtml(
              reqData.gui_message || ""
            )}" data-index="${index}">
          </div>
          <div>
            <label class="text-xs text-gray-400 font-semibold">Deny Message</label>
            <input type="text" class="req-deny-msg w-full px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition text-sm" placeholder="&7Requirement not met" value="${escapeHtml(
              reqData.deny_message || ""
            )}" data-index="${index}">
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

function removeRequirement(index) {
  const rank = ranks[currentRankIndex];
  rank.requirements.splice(index, 1);
  loadRequirements(rank.requirements);
  updatePreview();
  updateLoreHints();
  showNotification("🗑️ Requirement removed!", "success");
}

function getRequirements() {
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

function loadCommands(commands) {
  const container = document.getElementById("commandsContainer");
  if (commands.length === 0) {
    container.innerHTML =
      '<div class="text-center py-8"><p class="text-gray-400 text-sm mb-2">No commands yet</p><p class="text-gray-500 text-xs">Use quick commands above to get started</p></div>';
    return;
  }
  container.innerHTML = commands
    .map(
      (cmd, index) => `
    <div class="command-item flex gap-2">
      <input type="text" class="command-input flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition font-mono text-sm" value="${escapeHtml(
        cmd
      )}" data-index="${index}" placeholder="command %player%">
      <button class="remove-command px-3 py-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-lg text-sm font-semibold transition shadow" data-index="${index}">✕</button>
    </div>
  `
    )
    .join("");
}

function addQuickCommand(type) {
  if (currentRankIndex === -1) {
    showNotification("⚠️ Please select a rank first!", "error");
    return;
  }
  const rank = ranks[currentRankIndex];
  let command = "";
  switch (type) {
    case "luckperms":
      command = `lp user %player% parent set ${rank.name}`;
      break;
    case "economy":
      command = "eco give %player% 1000";
      break;
    case "title":
      command = `title %player% title "${rank.display_name}"`;
      break;
    case "discord":
      command = `discord: :medal: %player% has reached ${rank.display_name}!`;
      break;
    case "kit":
      command = `lp user %player% permission set essentials.kits.${rank.name.toLowerCase()} true`;
      break;
    case "custom":
      command = "";
      break;
  }
  rank.commands.push(command);
  loadCommands(rank.commands);
  updatePreview();
  showNotification("✅ Command added!", "success");
}

function removeCommand(index) {
  const rank = ranks[currentRankIndex];
  rank.commands.splice(index, 1);
  loadCommands(rank.commands);
  updatePreview();
  showNotification("🗑️ Command removed!", "success");
}

function getCommands() {
  return Array.from(document.querySelectorAll(".command-input"))
    .map((input) => input.value)
    .filter((cmd) => cmd.trim());
}

// LuckPerms Management
function loadLuckPermsSettings(lpSettings) {
  document.getElementById("lpWeight").value = lpSettings.weight || 0;
  document.getElementById("lpInheritPrevious").checked =
    lpSettings.inheritPrevious !== false;
  loadLpPermissions(lpSettings.permissions || []);
}

function loadLpPermissions(permissions) {
  const container = document.getElementById("lpPermissionsContainer");
  if (permissions.length === 0) {
    container.innerHTML =
      '<div class="text-center py-4"><p class="text-gray-400 text-xs">No permissions yet</p></div>';
    return;
  }
  container.innerHTML = permissions
    .map(
      (perm, index) => `
    <div class="flex gap-2">
      <input type="text" class="lp-permission flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition text-sm font-mono" value="${escapeHtml(
        perm
      )}" data-index="${index}" placeholder="example.permission">
      <button class="remove-lp-perm px-3 py-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-lg text-sm font-semibold transition shadow" data-index="${index}">✕</button>
    </div>
  `
    )
    .join("");
}

function addLpPermission() {
  if (currentRankIndex === -1) return;
  const rank = ranks[currentRankIndex];
  if (!rank.luckperms) {
    rank.luckperms = { weight: 0, permissions: [], inheritPrevious: true };
  }
  rank.luckperms.permissions.push("");
  loadLpPermissions(rank.luckperms.permissions);
  updatePreview();
}

function removeLpPermission(index) {
  const rank = ranks[currentRankIndex];
  rank.luckperms.permissions.splice(index, 1);
  loadLpPermissions(rank.luckperms.permissions);
  updatePreview();
}

function getLpPermissions() {
  return Array.from(document.querySelectorAll(".lp-permission"))
    .map((input) => input.value)
    .filter((perm) => perm.trim());
}

// Reorder Modal
function openReorderModal() {
  if (ranks.length === 0) {
    showNotification("⚠️ No ranks to reorder!", "error");
    return;
  }
  const container = document.getElementById("reorderList");
  container.innerHTML = ranks
    .map(
      (rank, index) => `
    <div class="reorder-item bg-gradient-to-r from-gray-700/50 to-gray-800/50 p-3 rounded-lg flex items-center gap-3 cursor-move border-2 border-gray-600/50 hover:border-purple-500/50 transition" draggable="true" data-index="${index}">
      <span class="text-2xl text-gray-400">☰</span>
      <div class="flex-1">
        <div class="font-semibold">${escapeHtml(
          rank.display_name || rank.name
        )}</div>
        <div class="text-xs text-gray-400">${rank.name}</div>
      </div>
      <div class="text-purple-400 font-bold text-lg">#${index + 1}</div>
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

function saveReorder() {
  const items = document.querySelectorAll(".reorder-item");
  const newOrder = Array.from(items).map((item) =>
    parseInt(item.dataset.index)
  );
  const reorderedRanks = newOrder.map((index) => ranks[index]);
  ranks = reorderedRanks;
  currentRankIndex = -1;
  document.getElementById("rankEditor").classList.add("hidden");
  updateRanksList();
  updatePreview();
  document.getElementById("reorderModal").classList.add("hidden");
  showNotification("✅ Ranks reordered successfully!", "success");
}

// RGB Color Picker
function openRGBPicker(target) {
  rgbTarget = target;
  document.getElementById("rgbModal").classList.remove("hidden");
  const currentValue =
    target === "display"
      ? document.getElementById("displayName").value
      : document.getElementById("prefix").value;
  const textOnly = currentValue
    .replace(/&#[0-9A-Fa-f]{6}/g, "")
    .replace(/&[0-9a-fklmnor]/g, "")
    .trim();
  document.getElementById("rgbText").value = textOnly;
  updateRGBPreview();
}

function closeRGBPicker() {
  document.getElementById("rgbModal").classList.add("hidden");
  rgbTarget = null;
}

function updateRGBPreview() {
  const text = document.getElementById("rgbText").value;
  const startColor = document.getElementById("rgbStartHex").value;
  const endColor = document.getElementById("rgbEndHex").value;
  let result = "";
  if (text) {
    if (startColor === endColor || !endColor) {
      result = `&#${startColor.substring(1)}${text}&r`;
    } else {
      result = applyGradient(text, startColor, endColor);
    }
  }
  document.getElementById("rgbPreview").textContent = result;
}

function applyGradient(text, startColor, endColor) {
  if (text.length === 0) return "";
  const start = hexToRgb(startColor);
  const end = hexToRgb(endColor);
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const ratio = text.length === 1 ? 0 : i / (text.length - 1);
    const r = Math.round(start.r + (end.r - start.r) * ratio);
    const g = Math.round(start.g + (end.g - start.g) * ratio);
    const b = Math.round(start.b + (end.b - start.b) * ratio);
    const hex = rgbToHex(r, g, b);
    result += `&#${hex}${text[i]}`;
  }
  return result + "&r";
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r, g, b) {
  return ((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase();
}

function applyRGBColor() {
  const result = document.getElementById("rgbPreview").textContent;
  if (rgbTarget === "display") {
    document.getElementById("displayName").value = result;
  } else if (rgbTarget === "prefix") {
    document.getElementById("prefix").value = result;
  }
  closeRGBPicker();
  updatePreview();
}

// YAML Generation
function generateYAML() {
  if (ranks.length === 0) {
    return "# Add or select a rank to see preview\n# Your ranks will appear here";
  }
  let yaml = "";
  ranks.forEach((rank) => {
    yaml += `${rank.name}:\n`;
    yaml += `  prefix: "${rank.prefix}"\n`;
    yaml += `  display_name: '${rank.display_name}'\n`;
    yaml += `  icon: ${rank.icon}\n`;
    yaml += `  icon_amount: ${rank.icon_amount}\n`;
    yaml += `  icon_model_data: ${rank.icon_model_data}\n`;
    if (rank.requirements && rank.requirements.length > 0) {
      yaml += `  requirements:\n`;
      rank.requirements.forEach((req) => {
        const key = Object.keys(req)[0];
        const data = req[key];
        yaml += `    '${key}':\n`;
        yaml += `      type: ${data.type}\n`;
        yaml += `      eval: ${data.eval}\n`;
        yaml += `      value: ${data.value}\n`;
        if (data.gui_message)
          yaml += `      gui_message: '${data.gui_message}'\n`;
        if (data.deny_message)
          yaml += `      deny_message: '${data.deny_message}'\n`;
      });
    }
    if (rank.lore && rank.lore.length > 0) {
      yaml += `  lore:\n`;
      rank.lore.forEach((line) => {
        yaml += `  - '${line}'\n`;
      });
    }
    if (rank.commands && rank.commands.length > 0) {
      yaml += `  commands:\n`;
      rank.commands.forEach((cmd) => {
        yaml += `  - '${cmd}'\n`;
      });
    }
    yaml += "\n";
  });
  return yaml.trim();
}

function updatePreview() {
  const yaml = generateYAML();
  document.getElementById("yamlPreview").textContent = yaml;
}

// Download Functions
function downloadYAML() {
  if (ranks.length === 0) {
    showNotification("⚠️ No ranks to download!", "error");
    return;
  }
  const yaml = generateYAML();
  const blob = new Blob([yaml], { type: "text/yaml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ranks.yml";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showNotification("✅ ranks.yml downloaded!", "success");
}

function downloadSkript() {
  if (ranks.length === 0) {
    showNotification("⚠️ No ranks to generate Skript!", "error");
    return;
  }
  const skript = generateSkript();
  const blob = new Blob([skript], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "installranks.sk";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showNotification("✅ installranks.sk downloaded!", "success");
}

function generateSkript() {
  const date = new Date().toLocaleDateString();
  let skript = `# =====================================
# VanguardRanks - LuckPerms Setup Script
# =====================================
# Generated: ${date}
# Total Ranks: ${ranks.length}
# 
# INSTALLATION:
# 1. Place this file in /plugins/Skript/scripts/
# 2. Run /sk reload installranks (or restart server)
# 3. Execute /installranks in-game (requires admin permission)
# 4. To remove all ranks: /uninstallranks
# =====================================

command /installranks:
\tpermission: admin.vanguardranks
\tpermission message: &c⚠️ You don't have permission to install ranks!
\taliases: /setupranks, /vginstall
\ttrigger:
\t\tsend "&8&m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" to player
\t\tsend "&6⚔️ VanguardRanks &8| &aLuckPerms Installation" to player
\t\tsend "&7Installing &e${ranks.length} &7rank group(s)..." to player
\t\tsend "&8&m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" to player
\t\tsend "" to player
\t\t
\t\t# Create default group if it doesn't exist
\t\tsend "&7[0/${ranks.length + 1}] &fChecking default group..." to player
\t\texecute console command "/lp creategroup default"
\t\texecute console command "/lp group default setweight 0"
\t\texecute console command "/lp group default displayname &7Member"
\t\texecute console command "/lp group default meta setprefix 1 ""&#FFFFFF[Member]&r """
\t\twait 2 ticks
\t\t
`;

  ranks.forEach((rank, index) => {
    const weight = rank.luckperms?.weight || index + 1;
    const displayName = rank.display_name || rank.name;
    const prefix = rank.prefix || `[${rank.name}]`;
    const permissions = rank.luckperms?.permissions || [];
    const inheritPrevious = rank.luckperms?.inheritPrevious !== false;

    skript += `\t\t# ===== RANK ${
      index + 1
    }: ${rank.name.toUpperCase()} =====\n`;
    skript += `\t\tsend "&7[${index + 1}/${
      ranks.length + 1
    }] &fCreating rank: &e${displayName}" to player\n`;
    skript += `\t\texecute console command "/lp creategroup ${rank.name}"\n`;
    skript += `\t\texecute console command "/lp group ${rank.name} setweight ${weight}"\n`;
    skript += `\t\texecute console command "/lp group ${rank.name} displayname ""${displayName}"""\n`;
    skript += `\t\texecute console command "/lp group ${rank.name} meta setprefix ${weight} ""${prefix} """\n`;

    if (inheritPrevious && index > 0) {
      const previousRank = ranks[index - 1];
      skript += `\t\texecute console command "/lp group ${rank.name} parent add ${previousRank.name}"\n`;
    } else if (index === 0) {
      skript += `\t\texecute console command "/lp group ${rank.name} parent add default"\n`;
    }

    if (permissions.length > 0) {
      permissions.forEach((perm) => {
        if (perm.trim()) {
          skript += `\t\texecute console command "/lp group ${rank.name} permission set ${perm} true"\n`;
        }
      });
    }

    skript += `\t\twait 2 ticks\n`;
    skript += `\t\t\n`;
  });

  skript += `\t\tsend "" to player
\t\tsend "&8&m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" to player
\t\tsend "&a✓ Installation Complete!" to player
\t\tsend "&7Ranks created: &e${ranks.length}" to player
\t\tsend "" to player
\t\tsend "&7To assign ranks to players:" to player
\t\tsend "&f/lp user <player> parent set <rank>" to player
\t\tsend "" to player
\t\tsend "&7Example: &f/lp user Harman parent set ${
    ranks[0]?.name || "rookie"
  }" to player
\t\tsend "&8&m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" to player

command /uninstallranks:
\tpermission: admin.vanguardranks
\tpermission message: &c⚠️ You don't have permission to uninstall ranks!
\taliases: /removeranks, /vguninstall
\ttrigger:
\t\tsend "&8&m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" to player
\t\tsend "&6⚔️ VanguardRanks &8| &cRank Removal" to player
\t\tsend "&7Removing &e${ranks.length} &7rank group(s)..." to player
\t\tsend "&8&m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" to player
\t\tsend "" to player
\t\t
`;

  ranks.forEach((rank, index) => {
    skript += `\t\tsend "&7[${index + 1}/${ranks.length}] &fRemoving: &e${
      rank.display_name || rank.name
    }" to player\n`;
    skript += `\t\texecute console command "/lp deletegroup ${rank.name}"\n`;
    skript += `\t\twait 1 tick\n`;
  });

  skript += `\t\t
\t\tsend "" to player
\t\tsend "&8&m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" to player
\t\tsend "&a✓ All ranks removed successfully!" to player
\t\tsend "&8&m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" to player

command /ranksinfo:
\tpermission: admin.vanguardranks
\tpermission message: &c⚠️ You don't have permission!
\taliases: /vginfo
\ttrigger:
\t\tsend "&8&m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" to player
\t\tsend "&6⚔️ VanguardRanks &8| &bRanks Information" to player
\t\tsend "&7Total Ranks: &e${ranks.length}" to player
\t\tsend "&8&m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" to player
\t\tsend "" to player
`;

  ranks.forEach((rank, index) => {
    const weight = rank.luckperms?.weight || index + 1;
    const permCount = rank.luckperms?.permissions?.length || 0;
    skript += `\t\tsend "&e${index + 1}. &f${
      rank.display_name || rank.name
    } &8(&7${rank.name}&8)" to player\n`;
    skript += `\t\tsend "   &7Weight: &a${weight} &8| &7Permissions: &a${permCount}" to player\n`;
  });

  skript += `\t\tsend "" to player
\t\tsend "&8&m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" to player
`;

  return skript;
}

function exportConfig() {
  if (ranks.length === 0) {
    showNotification("⚠️ No ranks to export!", "error");
    return;
  }
  const config = JSON.stringify(ranks, null, 2);
  const blob = new Blob([config], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ranks-config.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showNotification("✅ Configuration exported!", "success");
}

function importYAML() {
  const yamlText = document.getElementById("importYamlText").value.trim();
  if (!yamlText) {
    showNotification("⚠️ Please paste YAML content!", "error");
    return;
  }
  try {
    const importedRanks = parseYAML(yamlText);
    ranks = importedRanks;
    currentRankIndex = -1;
    document.getElementById("rankEditor").classList.add("hidden");
    updateRanksList();
    updatePreview();
    document.getElementById("importModal").classList.add("hidden");
    document.getElementById("importYamlText").value = "";
    showNotification(
      `✅ Successfully imported ${ranks.length} rank(s)!`,
      "success"
    );
  } catch (error) {
    showNotification(`❌ Import failed: ${error.message}`, "error");
  }
}

function parseYAML(yamlText) {
  const ranks = [];
  const lines = yamlText.split("\n");
  let currentRank = null;
  let currentSection = null;
  let currentRequirement = null;
  let currentReqKey = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    if (line.match(/^[A-Za-z0-9_]+:/)) {
      if (currentRank) ranks.push(currentRank);
      currentRank = createRankTemplate();
      currentRank.name = line.split(":")[0].trim();
      currentSection = null;
      currentRequirement = null;
      continue;
    }

    if (!currentRank) continue;

    if (line.match(/^  [a-z_]+:/)) {
      const match = line.match(/^  ([a-z_]+):\s*(.*)$/);
      if (match) {
        const key = match[1];
        let value = match[2].replace(/^["']|["']$/g, "");
        switch (key) {
          case "prefix":
            currentRank.prefix = value;
            break;
          case "display_name":
            currentRank.display_name = value;
            break;
          case "icon":
            currentRank.icon = value;
            break;
          case "icon_amount":
            currentRank.icon_amount = parseInt(value) || 1;
            break;
          case "icon_model_data":
            currentRank.icon_model_data = parseInt(value) || 0;
            break;
          case "lore":
          case "commands":
          case "requirements":
            currentSection = key;
            break;
        }
      }
      continue;
    }

    if (line.match(/^  - /)) {
      const value = line.substring(4).replace(/^["']|["']$/g, "");
      if (currentSection === "lore") {
        currentRank.lore.push(value);
      } else if (currentSection === "commands") {
        currentRank.commands.push(value);
      }
      continue;
    }

    if (currentSection === "requirements" && line.match(/^    ['"]?%/)) {
      const key = line
        .split(":")[0]
        .trim()
        .replace(/^["']|["']$/g, "");
      currentReqKey = key;
      currentRequirement = {};
      continue;
    }

    if (
      currentSection === "requirements" &&
      currentRequirement &&
      line.match(/^      [a-z_]+:/)
    ) {
      const match = line.match(/^      ([a-z_]+):\s*(.*)$/);
      if (match) {
        const key = match[1];
        let value = match[2].replace(/^["']|["']$/g, "");
        currentRequirement[key] = value;
        if (
          key === "deny_message" ||
          (key === "value" && !lines[i + 1]?.match(/^      /))
        ) {
          const req = {};
          req[currentReqKey] = currentRequirement;
          currentRank.requirements.push(req);
          currentRequirement = null;
          currentReqKey = null;
        }
      }
    }
  }

  if (currentRank) ranks.push(currentRank);
  return ranks;
}

function copyYAML() {
  const yaml = generateYAML();
  navigator.clipboard
    .writeText(yaml)
    .then(() => {
      showNotification("✅ YAML copied to clipboard!", "success");
    })
    .catch(() => {
      showNotification("❌ Failed to copy YAML", "error");
    });
}

function validateYAML() {
  if (ranks.length === 0) {
    showNotification("⚠️ No ranks to validate!", "error");
    return;
  }
  const errors = [];
  const warnings = [];
  ranks.forEach((rank, index) => {
    if (!rank.name) errors.push(`Rank ${index + 1}: Missing name`);
    if (!rank.display_name)
      errors.push(`Rank ${index + 1}: Missing display name`);
    if (!rank.prefix) errors.push(`Rank ${index + 1}: Missing prefix`);
    if (!rank.icon) errors.push(`Rank ${index + 1}: Missing icon`);
    const duplicates = ranks.filter((r) => r.name === rank.name);
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

  if (errors.length > 0) {
    showNotification(`❌ Validation failed:\n${errors.join("\n")}`, "error");
  } else if (warnings.length > 0) {
    showNotification(
      `⚠️ Validation passed with warnings:\n${warnings.join("\n")}`,
      "info"
    );
  } else {
    showNotification("✅ YAML is valid! Ready to use!", "success");
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  const bgGradient =
    type === "success"
      ? "from-green-500 to-emerald-600"
      : type === "error"
      ? "from-red-500 to-pink-600"
      : type === "info"
      ? "from-yellow-500 to-orange-600"
      : "from-blue-500 to-purple-600";

  notification.className = `fixed top-20 right-4 px-6 py-3 rounded-lg shadow-2xl z-50 transition-opacity duration-300 bg-gradient-to-r ${bgGradient} max-w-md font-semibold`;
  notification.style.whiteSpace = "pre-line";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(
    () => {
      notification.style.opacity = "0";
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    },
    type === "error" ? 5000 : 3000
  );
}
