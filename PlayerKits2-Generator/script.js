// ============================================
// DATA MANAGEMENT
// ============================================
let kitData = {
  kitName: "",
  cooldown: 0,
  permissionRequired: false,
  customPermission: "",
  oneTime: false,
  autoArmor: true,
  clearInventory: false,
  saveOriginalItems: false,
  allowPlaceholdersOnOriginalItems: false,
  items: [],
  display: {
    default: null,
    no_permission: null,
    cooldown: null,
    one_time: null,
    one_time_requirements: null,
  },
  requirements: {
    oneTimeRequirements: false,
    price: 0,
    extraRequirements: [],
    message: [],
  },
  actions: {
    claim: [],
    error: [],
  },
};

let currentDisplayState = "default";
let currentEditingItemIndex = -1;
let textToolsTargetId = null;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  console.log(
    "%cPlayerKits 2 Generator",
    "color:#4ade80; font-size:20px; font-weight:bold;"
  );

  // Event Listeners
  document.getElementById('reqPrice').addEventListener('input', function() {
    kitData.requirements.price = parseFloat(this.value) || 0;
    updateYAMLPreview();
  });
  document.getElementById('oneTimeRequirements').addEventListener('change', function() {
    kitData.requirements.oneTimeRequirements = this.checked;
    updateYAMLPreview();
  });
  
  // Initial render (if section exists)
  if (document.getElementById('reqPrice')) renderRequirements();
  document
    .getElementById("quickRefBtn")
    .addEventListener("click", () => openModal("quickRefModal"));
  document
    .getElementById("importBtn")
    .addEventListener("click", () => openModal("importModal"));
  document.getElementById("exportBtn").addEventListener("click", exportYAML);
  document.getElementById("newKitBtn").addEventListener("click", newKit);
  document
    .getElementById("addItemBtn")
    .addEventListener("click", () => openItemEditor(-1));
  document.getElementById("downloadBtn").addEventListener("click", downloadKit);
  document.getElementById("validateBtn").addEventListener("click", validateKit);
  document.getElementById("copyYamlBtn").addEventListener("click", copyYAML);
  document
    .getElementById("importConfirmBtn")
    .addEventListener("click", importKit);
  document.getElementById("saveItemBtn").addEventListener("click", saveItem);
  document.getElementById("applyTextBtn").addEventListener("click", applyText);

  // Basic settings listeners
  document
    .getElementById("kitName")
    .addEventListener("input", updateFromInputs);
  document
    .getElementById("cooldown")
    .addEventListener("input", updateFromInputs);
  document
    .getElementById("permissionRequired")
    .addEventListener("change", updateFromInputs);
  document
    .getElementById("customPermission")
    .addEventListener("input", updateFromInputs);
  document
    .getElementById("oneTime")
    .addEventListener("change", updateFromInputs);
  document
    .getElementById("autoArmor")
    .addEventListener("change", updateFromInputs);
  document
    .getElementById("clearInventory")
    .addEventListener("change", updateFromInputs);
  document
    .getElementById("saveOriginalItems")
    .addEventListener("change", updateFromInputs);

  // Initialize display editor
  initializeDisplayEditor();
  updateStats();
  updateYAMLPreview();
});

// ============================================
// MODAL FUNCTIONS
// ============================================
function openModal(modalId) {
  document.getElementById(modalId).classList.remove("hidden");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add("hidden");
}

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.add("hidden");
  }
});

// ============================================
// ALERT SYSTEM
// ============================================
function showAlert(message, type = "info") {
  let container = document.getElementById("alertContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "alertContainer";
    container.style.cssText =
      "position: fixed; bottom: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 10px; max-width: 350px;";
    document.body.appendChild(container);
  }

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

  container.appendChild(alert);
  alert.style.animation = "slideInRight 0.3s ease";

  alert.querySelector(".close-alert").addEventListener("click", () => {
    alert.remove();
  });

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
// COLLAPSIBLE SECTIONS
// ============================================
function toggleSection(header) {
  const content = header.nextElementSibling;
  const svg = header.querySelector("svg");

  if (content.classList.contains("active")) {
    content.classList.remove("active");
    svg.style.transform = "rotate(0deg)";
  } else {
    content.classList.add("active");
    svg.style.transform = "rotate(180deg)";
  }
}

// ============================================
// KIT MANAGEMENT
// ============================================
function newKit() {
  if (confirm("Create a new kit? Current data will be cleared.")) {
    kitData = {
      kitName: "",
      cooldown: 0,
      permissionRequired: false,
      customPermission: "",
      oneTime: false,
      autoArmor: true,
      clearInventory: false,
      saveOriginalItems: false,
      allowPlaceholdersOnOriginalItems: false,
      items: [],
      display: {
        default: null,
        no_permission: null,
        cooldown: null,
        one_time: null,
        one_time_requirements: null,
      },
      requirements: {
        oneTimeRequirements: false,
        price: 0,
        extraRequirements: [],
        message: [],
      },
      actions: {
        claim: [],
        error: [],
      },
    };

    // Reset form
    document.getElementById("kitName").value = "";
    document.getElementById("cooldown").value = 0;
    document.getElementById("permissionRequired").checked = false;
    document.getElementById("customPermission").value = "";
    document.getElementById("oneTime").checked = false;
    document.getElementById("autoArmor").checked = true;
    document.getElementById("clearInventory").checked = false;
    document.getElementById("saveOriginalItems").checked = false;

    renderItemsList();
    initializeDisplayEditor();
    updateStats();
    updateYAMLPreview();
    showAlert("New kit created!", "success");
  }
}

function updateFromInputs() {
  kitData.kitName = document.getElementById("kitName").value;
  kitData.cooldown = parseInt(document.getElementById("cooldown").value) || 0;
  kitData.permissionRequired =
    document.getElementById("permissionRequired").checked;
  kitData.customPermission = document.getElementById("customPermission").value;
  kitData.oneTime = document.getElementById("oneTime").checked;
  kitData.autoArmor = document.getElementById("autoArmor").checked;
  kitData.clearInventory = document.getElementById("clearInventory").checked;
  kitData.saveOriginalItems =
    document.getElementById("saveOriginalItems").checked;

  updateYAMLPreview();
}

// ============================================
// ITEMS MANAGEMENT
// ============================================
function renderItemsList() {
  const container = document.getElementById("itemsList");

  if (kitData.items.length === 0) {
    container.innerHTML = `
            <div class="info-card" style="text-align: center; padding: 32px;">
                <svg style="width: 48px; height: 48px; margin: 0 auto 16px; color: var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p style="color: var(--text-muted);">No items yet. Click "Add Item" to get started!</p>
            </div>
        `;
    return;
  }

  container.innerHTML = kitData.items
    .map(
      (item, index) => `
        <div class="item-card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 600; color: var(--text-primary);">${
                      item.name || item.id
                    }</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                        ${item.id} × ${item.amount || 1}
                        ${
                          item.enchants && item.enchants.length > 0
                            ? ` • ${item.enchants.length} enchant(s)`
                            : ""
                        }
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button onclick="openItemEditor(${index})" class="btn" style="padding: 8px 12px;">Edit</button>
                    <button onclick="deleteItem(${index})" class="remove-btn" style="padding: 8px 12px;">Delete</button>
                </div>
            </div>
        </div>
    `
    )
    .join("");

  updateStats();
}

function openItemEditor(index) {
  currentEditingItemIndex = index;

  const modal = document.getElementById("itemEditorModal");
  const title = document.getElementById("itemEditorTitle");

  if (index === -1) {
    title.textContent = "Add Item";
    clearItemForm();
  } else {
    title.textContent = "Edit Item";
    loadItemToForm(kitData.items[index]);
  }

  openModal("itemEditorModal");
}

function clearItemForm() {
  document.getElementById("itemId").value = "";
  document.getElementById("itemAmount").value = 1;
  document.getElementById("itemDurability").value = 0;
  document.getElementById("itemPreviewSlot").value = "";
  document.getElementById("itemOffhand").checked = false;
  document.getElementById("itemName").value = "";
  document.getElementById("itemCustomModelData").value = 0;
  document.getElementById("itemColor").value = "";
  document.getElementById("skullOwner").value = "";
  document.getElementById("skullId").value = "";
  document.getElementById("skullTexture").value = "";
  document.getElementById("trimPattern").value = "";
  document.getElementById("trimMaterial").value = "";
  document.getElementById("hideTooltip").checked = false;
  document.getElementById("itemNbt").value = "";

  document.getElementById("itemLoreList").innerHTML = "";
  document.getElementById("itemEnchantsList").innerHTML = "";

  document.querySelectorAll(".item-flag").forEach((cb) => (cb.checked = false));
}

function loadItemToForm(item) {
  document.getElementById("itemId").value = item.id || "";
  document.getElementById("itemAmount").value = item.amount || 1;
  document.getElementById("itemDurability").value = item.durability || 0;
  document.getElementById("itemPreviewSlot").value = item.preview_slot || "";
  document.getElementById("itemOffhand").checked = item.offhand || false;
  document.getElementById("itemName").value = item.name || "";
  document.getElementById("itemCustomModelData").value =
    item.custom_model_data || 0;
  document.getElementById("itemColor").value = item.color || "";

  // Lore
  document.getElementById("itemLoreList").innerHTML = "";
  if (item.lore && item.lore.length > 0) {
    item.lore.forEach((line) => addItemLore(line));
  }

  // Enchants
  document.getElementById("itemEnchantsList").innerHTML = "";
  if (item.enchants && item.enchants.length > 0) {
    item.enchants.forEach((ench) => addItemEnchant(ench));
  }

  // Item flags
  document.querySelectorAll(".item-flag").forEach((cb) => {
    cb.checked = item.item_flags && item.item_flags.includes(cb.value);
  });

  // Skull data
  if (item.skull_data) {
    document.getElementById("skullOwner").value = item.skull_data.owner || "";
    document.getElementById("skullId").value = item.skull_data.id || "";
    document.getElementById("skullTexture").value =
      item.skull_data.texture || "";
  } else {
    document.getElementById("skullOwner").value = "";
    document.getElementById("skullId").value = "";
    document.getElementById("skullTexture").value = "";
  }

  // Trim data
  if (item.trim_data) {
    document.getElementById("trimPattern").value = item.trim_data.pattern || "";
    document.getElementById("trimMaterial").value =
      item.trim_data.material || "";
  } else {
    document.getElementById("trimPattern").value = "";
    document.getElementById("trimMaterial").value = "";
  }

  document.getElementById("hideTooltip").checked = item.hide_tooltip || false;

  // NBT
  if (item.nbt && item.nbt.length > 0) {
    document.getElementById("itemNbt").value = item.nbt.join("\n");
  } else {
    document.getElementById("itemNbt").value = "";
  }
}

function saveItem() {
  const item = {
    id: document.getElementById("itemId").value.trim(),
    amount: parseInt(document.getElementById("itemAmount").value) || 1,
  };

  if (!item.id) {
    showAlert("Please enter a material ID!", "error");
    return;
  }

  // Optional fields
  const durability = parseInt(document.getElementById("itemDurability").value);
  if (durability > 0) item.durability = durability;

  const previewSlot = parseInt(
    document.getElementById("itemPreviewSlot").value
  );
  if (!isNaN(previewSlot)) item.preview_slot = previewSlot;

  if (document.getElementById("itemOffhand").checked) {
    item.offhand = true;
  }

  const name = document.getElementById("itemName").value.trim();
  if (name) item.name = name;

  // Lore
  const loreInputs = document.querySelectorAll("#itemLoreList input");
  if (loreInputs.length > 0) {
    item.lore = Array.from(loreInputs)
      .map((input) => input.value)
      .filter((v) => v);
  }

  const customModelData = parseInt(
    document.getElementById("itemCustomModelData").value
  );
  if (customModelData > 0) item.custom_model_data = customModelData;

  const color = document.getElementById("itemColor").value.trim();
  if (color) item.color = parseInt(color);

  // Enchants
  const enchantInputs = document.querySelectorAll("#itemEnchantsList input");
  if (enchantInputs.length > 0) {
    item.enchants = Array.from(enchantInputs)
      .map((input) => input.value)
      .filter((v) => v);
  }

  // Item flags
  const selectedFlags = Array.from(
    document.querySelectorAll(".item-flag:checked")
  ).map((cb) => cb.value);
  if (selectedFlags.length > 0) item.item_flags = selectedFlags;

  // Skull data
  const skullOwner = document.getElementById("skullOwner").value.trim();
  const skullId = document.getElementById("skullId").value.trim();
  const skullTexture = document.getElementById("skullTexture").value.trim();

  if (skullOwner || skullId || skullTexture) {
    item.skull_data = {};
    if (skullOwner) item.skull_data.owner = skullOwner;
    if (skullId) item.skull_data.id = skullId;
    if (skullTexture) item.skull_data.texture = skullTexture;
  }

  // Trim data
  const trimPattern = document.getElementById("trimPattern").value.trim();
  const trimMaterial = document.getElementById("trimMaterial").value.trim();

  if (trimPattern && trimMaterial) {
    item.trim_data = {
      pattern: trimPattern,
      material: trimMaterial,
    };
  }

  if (document.getElementById("hideTooltip").checked) {
    item.hide_tooltip = true;
  }

  // NBT
  const nbtText = document.getElementById("itemNbt").value.trim();
  if (nbtText) {
    item.nbt = nbtText.split("\n").filter((line) => line.trim());
  }

  if (currentEditingItemIndex === -1) {
    kitData.items.push(item);
    showAlert("Item added!", "success");
  } else {
    kitData.items[currentEditingItemIndex] = item;
    showAlert("Item updated!", "success");
  }

  renderItemsList();
  updateYAMLPreview();
  closeModal("itemEditorModal");
}

function deleteItem(index) {
  if (confirm("Delete this item?")) {
    kitData.items.splice(index, 1);
    renderItemsList();
    updateYAMLPreview();
    showAlert("Item deleted", "info");
  }
}

function addItemLore(value = "") {
  const container = document.getElementById("itemLoreList");
  const div = document.createElement("div");
  div.className = "lore-item";
  div.innerHTML = `
        <input type="text" placeholder="&7Lore line..." value="${value}">
        <button class="remove-btn" onclick="this.parentElement.remove()">×</button>
    `;
  container.appendChild(div);
}

function addItemEnchant(value = "") {
  const container = document.getElementById("itemEnchantsList");
  const div = document.createElement("div");
  div.className = "enchant-item";
  div.innerHTML = `
        <input type="text" placeholder="DAMAGE_ALL;5" value="${value}">
        <button class="remove-btn" onclick="this.parentElement.remove()">×</button>
    `;
  container.appendChild(div);
}

// ============================================
// REQUIREMENTS MANAGEMENT
// ============================================

// Add a message line
function addReqMessage(line = '') {
  const list = document.getElementById('reqMessageList');
  const div = document.createElement('div');
  div.style.marginBottom = '8px';
  div.innerHTML = `
    <input type="text" value="${line}" placeholder="&6Enter message line..." onchange="updateReqMessage()">
    <button class="remove-btn" onclick="this.parentElement.remove(); updateReqMessage()">×</button>
  `;
  list.appendChild(div);
}

// Add an extra requirement
function addExtraReq(req = '') {
  const list = document.getElementById('extraReqList');
  const div = document.createElement('div');
  div.style.marginBottom = '8px';
  div.innerHTML = `
    <input type="text" value="${req}" placeholder="%player_level%:10:> for level 10+" onchange="updateExtraReqs()">
    <button class="remove-btn" onclick="this.parentElement.remove(); updateExtraReqs()">×</button>
  `;
  list.appendChild(div);
}

// Update requirements message from UI
function updateReqMessage() {
  const inputs = document.querySelectorAll('#reqMessageList input');
  kitData.requirements.message = Array.from(inputs).map(input => input.value.trim()).filter(v => v);
  updateYAMLPreview();
}

// Update extra requirements from UI
function updateExtraReqs() {
  const inputs = document.querySelectorAll('#extraReqList input');
  kitData.requirements.extraRequirements = Array.from(inputs).map(input => input.value.trim()).filter(v => v);
  updateYAMLPreview();
}

// Render requirements lists (call after import or init)
function renderRequirements() {
  const { requirements } = kitData;
  
  // Price
  document.getElementById('reqPrice').value = requirements.price || 0;
  
  // One Time Requirements
  document.getElementById('oneTimeRequirements').checked = requirements.oneTimeRequirements || false;
  
  // Message
  const messageList = document.getElementById('reqMessageList');
  messageList.innerHTML = '';
  (requirements.message || []).forEach(line => addReqMessage(line));
  
  // Extra Requirements
  const extraList = document.getElementById('extraReqList');
  extraList.innerHTML = '';
  (requirements.extraRequirements || []).forEach(req => addExtraReq(req));
}

// ============================================
// ITEM TAB SWITCHING
// ============================================
function switchItemTab(tabName) {
  document
    .querySelectorAll("#itemEditorModal .tab-content")
    .forEach((content) => {
      content.classList.remove("active");
    });

  document.querySelectorAll("#itemEditorModal .tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  document
    .querySelector(`#itemEditorModal [data-content="${tabName}"]`)
    .classList.add("active");
  event.target.classList.add("active");
}

// ============================================
// DISPLAY ITEMS
// ============================================
function switchDisplayState(state) {
  currentDisplayState = state;

  document.querySelectorAll(".display-state-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  document.querySelector(`[data-state="${state}"]`).classList.add("active");

  initializeDisplayEditor();
}

function initializeDisplayEditor() {
  const editor = document.getElementById("displayItemEditor");
  const displayItem = kitData.display[currentDisplayState];

  editor.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
            <div>
                <label>Material/ID</label>
                <input type="text" id="display_id" placeholder="DIAMOND_SWORD" value="${
                  displayItem?.id || ""
                }">
                <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                                <a href="https://hub.spigotmc.org/javadocs/spigot/org/bukkit/Material.html"
                                    target="_blank" style="color: var(--accent-light);">Browse materials</a>
                            </p>
            </div>
            <div class="grid-2">
                <div>
                    <label>Amount</label>
                    <input type="number" id="display_amount" value="${
                      displayItem?.amount || 1
                    }" min="1" max="64">
                </div>
                <div>
                    <label>Durability</label>
                    <input type="number" id="display_durability" value="${
                      displayItem?.durability || 0
                    }" min="0">
                </div>
            </div>
            <div>
                <label>Display Name</label>
                <div style="display: flex; gap: 8px;">
                    <input type="text" id="display_name" placeholder="&c&lAwesome Kit" value="${
                      displayItem?.name || ""
                    }" style="flex: 1;">
                    <button onclick="openTextToolsForDisplay('display_name')" class="btn">
                        <svg style="display: inline; width: 18px; height: 18px; vertical-align: middle;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                    </button>
                </div>
            </div>
            <div>
                <label>Lore</label>
                <div id="display_lore_list"></div>
                <button class="add-btn-small" onclick="addDisplayLore()">+ Add Line</button>
            </div>
            <div>
                <label>Item Flags</label>
                <div class="grid-2">
                    <div class="setting-item">
                        <label style="display: flex; align-items: center; cursor: pointer; margin: 0;">
                            <span>Hide Enchants</span>
                            <input type="checkbox" value="HIDE_ENCHANTS" ${
                              displayItem?.item_flags?.includes("HIDE_ENCHANTS")
                                ? "checked"
                                : ""
                            }>
                        </label>
                    </div>
                    <div class="setting-item">
                        <label style="display: flex; align-items: center; cursor: pointer; margin: 0;">
                            <span>Hide Attributes</span>
                             <input type="checkbox" class="display-flag" value="HIDE_ATTRIBUTES" ${
                               displayItem?.item_flags?.includes(
                                 "HIDE_ATTRIBUTES"
                               )
                                 ? "checked"
                                 : ""
                             }>
                        </label>
                    </div>
                </div>
            </div>
            <div>
                <label>Skull Texture (for player heads)</label>
                <textarea id="display_skull_texture" rows="2" placeholder="eyJ0ZXh0dXJlcyI6..." style="font-family: 'Courier New', monospace; font-size: 11px;">${
                  displayItem?.skull_data?.texture || ""
                }</textarea>
                <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                                    Get textures from <a href="https://minecraft-heads.com" target="_blank" style="color: var(--accent-light);">minecraft-heads.com</a>
                                </p>
            </div>
            <button class="btn btn-primary" onclick="saveDisplayItem()" style="width: 100%; padding: 12px;">
                Save Display Item
            </button>
        </div>
    `;

  // Load existing lore
  if (displayItem?.lore && displayItem.lore.length > 0) {
    displayItem.lore.forEach((line) => addDisplayLore(line));
  }
}

function addDisplayLore(value = "") {
  const container = document.getElementById("display_lore_list");
  const div = document.createElement("div");
  div.className = "lore-item";
  div.innerHTML = `
        <input type="text" placeholder="&7Lore line..." value="${value}">
        <button class="remove-btn" onclick="this.parentElement.remove()">×</button>
    `;
  container.appendChild(div);
}

function saveDisplayItem() {
  const displayItem = {
    id: document.getElementById("display_id").value.trim(),
    amount: parseInt(document.getElementById("display_amount").value) || 1,
  };

  if (!displayItem.id) {
    showAlert("Please enter a material ID!", "error");
    return;
  }

  const durability = parseInt(
    document.getElementById("display_durability").value
  );
  if (durability > 0) displayItem.durability = durability;

  const name = document.getElementById("display_name").value.trim();
  if (name) displayItem.name = name;

  // Lore
  const loreInputs = document.querySelectorAll("#display_lore_list input");
  if (loreInputs.length > 0) {
    displayItem.lore = Array.from(loreInputs)
      .map((input) => input.value)
      .filter((v) => v);
  }

  // Item flags
  const selectedFlags = Array.from(
    document.querySelectorAll(".display-flag:checked")
  ).map((cb) => cb.value);
  if (selectedFlags.length > 0) displayItem.item_flags = selectedFlags;

  // Skull texture
  const skullTexture = document
    .getElementById("display_skull_texture")
    .value.trim();
  if (skullTexture) {
    displayItem.skull_data = { texture: skullTexture };
  }

  kitData.display[currentDisplayState] = displayItem;
  updateYAMLPreview();
  showAlert(`Display item for "${currentDisplayState}" saved!`, "success");
}

// Initialize requirements listeners
setTimeout(() => {
  const reqPrice = document.getElementById("reqPrice");
  const reqOneTime = document.getElementById("reqOneTime");

  if (reqPrice) reqPrice.addEventListener("input", updateRequirements);
  if (reqOneTime) reqOneTime.addEventListener("change", updateRequirements);
}, 500);

// ============================================
// ACTIONS
// ============================================
function addAction(type, actionData = null) {
  const container = document.getElementById(`${type}ActionsList`);
  const index = kitData.actions[type].length;

  const div = document.createElement("div");
  div.className = "action-item";
  div.style.cssText =
    "display: block; flex-direction: column; gap: 8px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; margin-bottom: 8px;";

  div.innerHTML = `
        <div style="display: flex; gap: 8px;margin:8px;">
            <input type="text" placeholder="playsound: BLOCK_NOTE_BLOCK_PLING;10;2" value="${
              actionData?.action || ""
            }" data-type="${type}" data-index="${index}">
            <button class="remove-btn" onclick="removeAction('${type}', ${index})">×</button>
        </div>
        <div class="grid-2">
                    <div class="setting-item">
                        <label style="display: flex; align-items: center; cursor: pointer; margin: 0;">
                            <span>Execute Before Items</span>
                            <input type="checkbox"${
                              actionData?.execute_before_items ? "checked" : ""
                            } onchange="updateActions()">
                        </label>
                    </div>
                    <div class="setting-item">
                        <label style="display: flex; align-items: center; cursor: pointer; margin: 0;">
                            <span>Count as Item</span>
                             <input type="checkbox" ${
                               actionData?.count_as_item ? "checked" : ""
                             } onchange="updateActions()">
                        </label>
                    </div>
                </div>
    `;

  container.appendChild(div);

  if (!actionData) {
    kitData.actions[type].push({
      action: "",
      execute_before_items: false,
      count_as_item: false,
    });
  }

  updateStats();
}

function removeAction(type, index) {
  kitData.actions[type].splice(index, 1);
  renderActions();
  updateYAMLPreview();
  updateStats();
}

function renderActions() {
  // Clear lists
  document.getElementById("claimActionsList").innerHTML = "";
  document.getElementById("errorActionsList").innerHTML = "";

  // Render claim actions
  kitData.actions.claim.forEach((action, index) => {
    addAction("claim", action);
  });

  // Render error actions
  kitData.actions.error.forEach((action, index) => {
    addAction("error", action);
  });
}

function updateActions() {
  // Claim actions
  const claimInputs = document.querySelectorAll(
    "#claimActionsList .action-item"
  );
  kitData.actions.claim = Array.from(claimInputs).map((item) => {
    const input = item.querySelector('input[type="text"]');
    const checkboxes = item.querySelectorAll('input[type="checkbox"]');
    return {
      action: input.value,
      execute_before_items: checkboxes[0]?.checked || false,
      count_as_item: checkboxes[1]?.checked || false,
    };
  });

  // Error actions
  const errorInputs = document.querySelectorAll(
    "#errorActionsList .action-item"
  );
  kitData.actions.error = Array.from(errorInputs).map((item) => {
    const input = item.querySelector('input[type="text"]');
    const checkboxes = item.querySelectorAll('input[type="checkbox"]');
    return {
      action: input.value,
      execute_before_items: checkboxes[0]?.checked || false,
      count_as_item: checkboxes[1]?.checked || false,
    };
  });

  updateYAMLPreview();
  updateStats();
}

// Add event delegation for action inputs
document.addEventListener("input", function (e) {
  if (
    e.target.closest("#claimActionsList") ||
    e.target.closest("#errorActionsList")
  ) {
    updateActions();
  }
});

// ============================================
// TEXT TOOLS
// ============================================
function openTextToolsForItem(targetId) {
  textToolsTargetId = targetId;
  const input = document.getElementById(targetId);
  document.getElementById("textToolsInput").value = input ? input.value : "";
  document.getElementById("enableRGB").checked = false;
  document.getElementById("enableFancy").checked = false;
  updateTextPreview();
  openModal("textToolsModal");
}

function openTextToolsForDisplay(targetId) {
  openTextToolsForItem(targetId);
}

function updateTextPreview() {
  const text = document.getElementById("textToolsInput").value;
  const enableRGB = document.getElementById("enableRGB").checked;
  const enableFancy = document.getElementById("enableFancy").checked;

  if (!text) {
    document.getElementById("textPreview").innerHTML =
      "Enter text to see preview...";
    document.getElementById("textCode").textContent =
      "Enter text to see preview...";
    return;
  }

  let processedText = text;
  let visualHTML = "";
  let minecraftCode = "";

  // Apply fancy font
  if (enableFancy) {
    processedText = convertToFancyFont(processedText);
  }

  // Apply RGB
  if (enableRGB) {
    const startColor = document.getElementById("rgbStartHex").value;
    const endColor = document.getElementById("rgbEndHex").value;
    minecraftCode = generateRGBCode(processedText, startColor, endColor);
    visualHTML = generateVisualRGBPreview(processedText, startColor, endColor);
  } else {
    minecraftCode = processedText;
    visualHTML = `<span style="color: var(--text-primary);">${processedText}</span>`;
  }

  document.getElementById("textPreview").innerHTML = visualHTML;
  document.getElementById("textCode").textContent = minecraftCode;
}

function applyText() {
  if (!textToolsTargetId) return;

  const minecraftCode = document.getElementById("textCode").textContent;
  if (minecraftCode && minecraftCode !== "Enter text to see preview...") {
    const targetInput = document.getElementById(textToolsTargetId);
    targetInput.value = minecraftCode;
    closeModal("textToolsModal");
    showAlert("Text applied!", "success");
  } else {
    showAlert("Please enter text first", "error");
  }
}

// Text tools helper functions
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

  if (!hex.startsWith("#")) hex = "#" + hex;

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

  if (startColor === endColor || !endColor) {
    result = `&#${startColor.replace("#", "")}${text}`;
  } else {
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

  if (startColor === endColor || !endColor) {
    result = `<span style="color: ${startColor};">${text}</span>`;
  } else {
    for (let i = 0; i < length; i++) {
      const factor = length > 1 ? i / (length - 1) : 0;
      const color = interpolateColor(startColor, endColor, factor);
      result += `<span style="color: ${color};">${text[i]}</span>`;
    }
  }

  return result;
}

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
// YAML GENERATION
// ============================================
function generateYAML() {
  let yaml = "";

  // Basic settings
  yaml += `cooldown: ${kitData.cooldown}\n`;
  yaml += `permission_required: ${kitData.permissionRequired}\n`;

  if (kitData.customPermission) {
    yaml += `custom_permission: "${kitData.customPermission}"\n`;
  }

  yaml += `one_time: ${kitData.oneTime}\n`;
  yaml += `auto_armor: ${kitData.autoArmor}\n`;
  yaml += `clear_inventory: ${kitData.clearInventory}\n`;
  yaml += `save_original_items: ${kitData.saveOriginalItems}\n`;

  if (kitData.saveOriginalItems) {
    yaml += `allow_placeholders_on_original_items: ${kitData.allowPlaceholdersOnOriginalItems}\n`;
  }

  // Display items
  yaml += `display:\n`;
  for (const [state, item] of Object.entries(kitData.display)) {
    if (item && item.id) {
      yaml += `  ${state}:\n`;
      yaml += `    id: ${item.id}\n`;
      if (item.name) yaml += `    name: '${item.name}'\n`;
      yaml += `    amount: ${item.amount || 1}\n`;

      if (item.lore && item.lore.length > 0) {
        yaml += `    lore:\n`;
        item.lore.forEach((line) => {
          yaml += `    - '${line}'\n`;
        });
      }

      if (item.durability) yaml += `    durability: ${item.durability}\n`;

      if (item.item_flags && item.item_flags.length > 0) {
        yaml += `    item_flags:\n`;
        item.item_flags.forEach((flag) => {
          yaml += `    - ${flag}\n`;
        });
      }

      if (item.skull_data) {
        yaml += `    skull_data:\n`;
        if (item.skull_data.texture)
          yaml += `      texture: "${item.skull_data.texture}"\n`;
        if (item.skull_data.owner)
          yaml += `      owner: ${item.skull_data.owner}\n`;
        if (item.skull_data.id) yaml += `      id: "${item.skull_data.id}"\n`;
      }
    }
  }

  // Requirements
  if (
    kitData.requirements.price > 0 ||
    kitData.requirements.extraRequirements.length > 0 ||
    kitData.requirements.message.length > 0
  ) {
    yaml += `requirements:\n`;
    yaml += `  one_time_requirements: ${kitData.requirements.oneTimeRequirements}\n`;

    if (kitData.requirements.price > 0) {
      yaml += `  price: ${kitData.requirements.price}\n`;
    }

    if (kitData.requirements.extraRequirements.length > 0) {
      yaml += `  extra_requirements:\n`;
      kitData.requirements.extraRequirements.forEach((req) => {
        yaml += `  - "${req}"\n`;
      });
    }

    if (kitData.requirements.message.length > 0) {
      yaml += `  message:\n`;
      kitData.requirements.message.forEach((line) => {
        yaml += `  - '${line}'\n`;
      });
    }
  }

  // Items
  if (kitData.items.length > 0) {
    yaml += `items:\n`;
    kitData.items.forEach((item, index) => {
      yaml += `  ${index + 1}:\n`;
      if (item._original_format && item._original_data) {
        yaml += `    original:\n`;
        // Output original data as-is (simplified - you might need js-yaml for perfect output)
        yaml += `      ==: org.bukkit.inventory.ItemStack\n`;
        if (item._original_data.DataVersion) {
          yaml += `      DataVersion: ${item._original_data.DataVersion}\n`;
        }
        if (item._original_data.id) {
          yaml += `      id: ${item._original_data.id}\n`;
        }
        if (item._original_data.count) {
          yaml += `      count: ${item._original_data.count}\n`;
        }
        // Note: Full component preservation would require proper YAML serialization
        yaml += `      # Original components preserved - edit in Minecraft\n`;

        if (item.preview_slot !== undefined)
          yaml += `    preview_slot: ${item.preview_slot}\n`;
        if (item.offhand) yaml += `    offhand: true\n`;
      }
      yaml += `    id: ${item.id}\n`;

      if (item.name) yaml += `    name: "${item.name}"\n`;
      yaml += `    amount: ${item.amount || 1}\n`;

      if (item.durability) yaml += `    durability: ${item.durability}\n`;
      if (item.custom_model_data)
        yaml += `    custom_model_data: ${item.custom_model_data}\n`;
      if (item.color) yaml += `    color: ${item.color}\n`;

      if (item.lore && item.lore.length > 0) {
        yaml += `    lore:\n`;
        item.lore.forEach((line) => {
          yaml += `    - "${line}"\n`;
        });
      }

      if (item.enchants && item.enchants.length > 0) {
        yaml += `    enchants:\n`;
        item.enchants.forEach((ench) => {
          yaml += `    - "${ench}"\n`;
        });
      }

      if (item.item_flags && item.item_flags.length > 0) {
        yaml += `    item_flags:\n`;
        item.item_flags.forEach((flag) => {
          yaml += `    - ${flag}\n`;
        });
      }

      if (item.skull_data) {
        yaml += `    skull_data:\n`;
        if (item.skull_data.texture)
          yaml += `      texture: "${item.skull_data.texture}"\n`;
        if (item.skull_data.owner)
          yaml += `      owner: ${item.skull_data.owner}\n`;
        if (item.skull_data.id) yaml += `      id: "${item.skull_data.id}"\n`;
      }

      if (item.trim_data) {
        yaml += `    trim_data:\n`;
        yaml += `      pattern: ${item.trim_data.pattern}\n`;
        yaml += `      material: ${item.trim_data.material}\n`;
      }

      if (item.hide_tooltip) yaml += `    hide_tooltip: true\n`;

      if (item.nbt && item.nbt.length > 0) {
        yaml += `    nbt:\n`;
        item.nbt.forEach((nbtLine) => {
          yaml += `    - ${nbtLine}\n`;
        });
      }

      if (item.preview_slot !== undefined)
        yaml += `    preview_slot: ${item.preview_slot}\n`;
      if (item.offhand) yaml += `    offhand: true\n`;
    });
  }

  // Actions
  if (kitData.actions.claim.length > 0 || kitData.actions.error.length > 0) {
    yaml += `actions:\n`;

    if (kitData.actions.claim.length > 0) {
      yaml += `  claim:\n`;
      kitData.actions.claim.forEach((action, index) => {
        if (action.action) {
          yaml += `    ${index + 1}:\n`;
          yaml += `      action: "${action.action}"\n`;
          if (action.execute_before_items)
            yaml += `      execute_before_items: true\n`;
          if (action.count_as_item) yaml += `      count_as_item: true\n`;
        }
      });
    }

    if (kitData.actions.error.length > 0) {
      yaml += `  error:\n`;
      kitData.actions.error.forEach((action, index) => {
        if (action.action) {
          yaml += `    ${index + 1}:\n`;
          yaml += `      action: "${action.action}"\n`;
          if (action.execute_before_items)
            yaml += `      execute_before_items: true\n`;
          if (action.count_as_item) yaml += `      count_as_item: true\n`;
        }
      });
    }
  }

  return yaml;
}

function updateYAMLPreview() {
  const yaml = generateYAML();
  const preview = document.getElementById("yamlPreview");

  // Simple syntax highlighting
  const highlighted = yaml
    .replace(/^(\w+):/gm, '<span class="yaml-key">$1:</span>')
    .replace(/: (\d+)/g, ': <span class="yaml-number">$1</span>')
    .replace(/: (true|false)/g, ': <span class="yaml-boolean">$1</span>')
    .replace(/: '([^']*)'/g, ": <span class=\"yaml-string\">'$1'</span>")
    .replace(/: "([^"]*)"/g, ': <span class="yaml-string">"$1"</span>');

  preview.innerHTML = highlighted || "# Configure your kit to see the preview";
}

function copyYAML() {
  const yaml = generateYAML();

  if (!yaml) {
    showAlert("Nothing to copy!", "error");
    return;
  }

  navigator.clipboard
    .writeText(yaml)
    .then(() => {
      showAlert("YAML copied to clipboard!", "success");
    })
    .catch(() => {
      showAlert("Failed to copy", "error");
    });
}

function exportYAML() {
  const yaml = generateYAML();

  if (!yaml) {
    showAlert("Nothing to export!", "error");
    return;
  }

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
        <div class="modal-content">
            <h3>Export YAML</h3>
            <textarea readonly style="height: 400px; font-family: 'Courier New', monospace; font-size: 12px;">${yaml}</textarea>
            <div style="display: flex; gap: 8px; margin-top: 16px;">
                <button class="btn btn-primary" onclick="navigator.clipboard.writeText(this.parentElement.parentElement.querySelector('textarea').value).then(() => showAlert('Copied!', 'success'))" style="flex: 1; padding: 12px;">Copy</button>
                <button class="btn" onclick="this.closest('.modal-overlay').remove()" style="flex: 1; padding: 12px;">Close</button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function downloadKit() {
  const yaml = generateYAML();

  if (!yaml) {
    showAlert("Nothing to download!", "error");
    return;
  }

  const filename = (kitData.kitName || "kit") + ".yml";
  const blob = new Blob([yaml], { type: "text/yaml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showAlert(`Kit downloaded as ${filename}!`, "success");
}

// ============================================
// IMPORT
// ============================================
function importKit() {
  const yamlText = document.getElementById("importText").value.trim();

  if (!yamlText) {
    showAlert("Please paste YAML content!", "error");
    return;
  }

  try {
    // Parse YAML
    const parsed = jsyaml.load(yamlText);

    // Helper: Only clean FOLDABLE strings (not lists or lore)
    function cleanYAMLString(str) {
      if (typeof str !== "string") return str;

      // Only collapse if it's a folded block scalar (starts with > or >-)
      // Otherwise, preserve newlines and spacing
      if (str.includes("\n") && !str.startsWith(">") && !str.startsWith(">-")) {
        return str; // Preserve multi-line strings (like in actions or messages)
      }

      // For folded scalars (>), normalize newlines and extra spaces
      return str.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
    }

    // Recursively clean only where needed
    function cleanYAMLData(obj) {
      if (typeof obj === "string") {
        return cleanYAMLString(obj);
      }

      if (Array.isArray(obj)) {
        return obj.map(cleanYAMLData);
      }

      if (obj !== null && typeof obj === "object") {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
          cleaned[key] = cleanYAMLData(value);
        }
        return cleaned;
      }

      return obj;
    }

    // Helper function to recursively clean YAML data
    function cleanYAMLData(obj) {
      if (typeof obj === "string") {
        return cleanYAMLString(obj);
      }

      if (Array.isArray(obj)) {
        return obj.map((item) => cleanYAMLData(item));
      }

      if (obj !== null && typeof obj === "object") {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
          cleaned[key] = cleanYAMLData(value);
        }
        return cleaned;
      }

      return obj;
    }

    // Clean up the parsed data
    const cleaned = cleanYAMLData(parsed);

    // Load data (using cleaned instead of parsed)
    kitData.cooldown = cleaned.cooldown || 0;
    kitData.permissionRequired = cleaned.permission_required || false;
    kitData.customPermission = cleaned.custom_permission || "";
    kitData.oneTime = cleaned.one_time || false;
    kitData.autoArmor = cleaned.auto_armor !== false;
    kitData.clearInventory = cleaned.clear_inventory || false;
    kitData.saveOriginalItems = cleaned.save_original_items || false;
    kitData.allowPlaceholdersOnOriginalItems =
      cleaned.allow_placeholders_on_original_items || false;

    // Load items
    if (cleaned.items) {
      kitData.items = Object.values(cleaned.items).map((item) => {
        if (item.original) {
          const orig = item.original;
          const comp = orig.components || {};

          const id = (orig.id || "").replace("minecraft:", "").toUpperCase();
          const amount = orig.count || 1;

          const converted = {
            id,
            amount,
            preview_slot: item.preview_slot,
            offhand: item.offhand || false,
            _converted_from_original: true,
          };

          // === HELPER: Clean and parse multi-line SNBT string ===
          function parseSNBT(snbt) {
            if (!snbt) return null;
            try {
              // 1. Remove outer quotes
              let s = snbt.trim();
              if (
                (s[0] === "'" && s[s.length - 1] === "'") ||
                (s[0] === '"' && s[s.length - 1] === '"')
              ) {
                s = s.slice(1, -1);
              }

              // 2. Escape internal quotes and newlines properly
              s = s.replace(/\\"/g, '\\"');
              s = s.replace(/\\'/g, "\\'");

              // 3. Replace newlines and tabs with space (collapse whitespace)
              s = s.replace(/[\n\r\t]+/g, " ");

              // 4. Replace multiple spaces with single space
              s = s.replace(/\s+/g, " ");

              // 5. Replace 1b → true, 0b → false (with word boundaries)
              s = s
                .replace(/:\s*1b(\s|,|}|])/g, ":true$1")
                .replace(/:\s*0b(\s|,|}|])/g, ":false$1");

              // 6. Add quotes around unquoted keys
              s = s.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

              // 7. Fix hex colors (handle both with and without quotes)
              s = s.replace(/color:\s*"?(#[0-9A-Fa-f]{6})"?/g, 'color:"$1"');

              // 8. Fix float notation (remove 'f' suffix)
              s = s.replace(/(\d+\.\d+)f/g, "$1");

              // 9. Remove trailing commas
              s = s.replace(/,(\s*[}\]])/g, "$1");

              // 10. Fix minecraft: prefixes in values
              s = s.replace(
                /:\s*minecraft:([a-zA-Z0-9_]+)/g,
                ':"minecraft:$1"'
              );

              return JSON.parse(s);
            } catch (e) {
              console.warn("SNBT parse failed:", e.message, "\nInput:", snbt);
              return null;
            }
          }

          // === HELPER: Extract formatted text (& codes) ===
          function extractText(comp) {
  if (typeof comp === "string") return comp;
  if (!comp || typeof comp !== "object") return "";

  let result = "";
  let prefix = "";

  // Color
  if (comp.color) {
    const map = {
      black: "&0", dark_blue: "&1", dark_green: "&2", dark_aqua: "&3",
      dark_red: "&4", dark_purple: "&5", gold: "&6", gray: "&7",
      dark_gray: "&8", blue: "&9", green: "&a", aqua: "&b",
      red: "&c", light_purple: "&d", yellow: "&e", white: "&f",
    };
    prefix += map[comp.color] || "";
  }

  // Styles
  if (comp.bold === true) prefix += "&l";
  if (comp.italic === true) prefix += "&o";
  if (comp.underlined === true) prefix += "&n";
  if (comp.strikethrough === true) prefix += "&m";
  if (comp.obfuscated === true) prefix += "&k";

  // Text
  if (comp.text !== undefined) {
    result += prefix + comp.text;
  }

  // Extra (recursive)
  if (comp.extra && Array.isArray(comp.extra)) {
    result += comp.extra.map(extractText).join("");
  }

  return result;
}

          // === CUSTOM NAME ===
          if (comp["minecraft:custom_name"]) {
            const parsed = parseSNBT(comp["minecraft:custom_name"]);
            if (parsed) {
              const text = extractText(parsed);
              if (text) converted.name = text;
            }
          }

         // === LORE === FIXED PARSER
if (comp["minecraft:lore"]) {
  const raw = comp["minecraft:lore"];
  console.log("Processing lore, raw value:", raw);

  try {
    let s = raw.trim();

    // Remove outer quotes
    if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
      s = s.slice(1, -1);
    }

    // Replace 0b/1b with true/false
    s = s.replace(/italic:0b/g, 'italic:false');
    s = s.replace(/italic:1b/g, 'italic:true');
    s = s.replace(/bold:0b/g, 'bold:false');
    s = s.replace(/bold:1b/g, 'bold:true');
    s = s.replace(/underlined:0b/g, 'underlined:false');
    s = s.replace(/underlined:1b/g, 'underlined:true');
    s = s.replace(/strikethrough:0b/g, 'strikethrough:false');
    s = s.replace(/strikethrough:1b/g, 'strikethrough:true');
    s = s.replace(/obfuscated:0b/g, 'obfuscated:false');
    s = s.replace(/obfuscated:1b/g, 'obfuscated:true');

    // Add quotes around unquoted keys
    s = s.replace(/([{,])\s*([a-zA-Z_]+):/g, '$1"$2":');

    // Wrap text values in quotes if not already
    s = s.replace(/:\s*([^{"\[\],}][^}\],]*)(?=[,\}])/g, (match, p1) => {
      const trimmed = p1.trim();
      if (trimmed && !trimmed.startsWith('"') && !trimmed.startsWith("'")) {
        return `: "${trimmed}"`;
      }
      return match;
    });

    console.log("Cleaned & fixed lore string:", s);

    // Now safe to parse
    const array = JSON.parse(s);
    console.log("Parsed lore array:", array);

    if (Array.isArray(array)) {
      converted.lore = array
        .map((line) => {
          if (typeof line === "string") return line;
          if (typeof line === "object" && line !== null) {
            return extractText(line);
          }
          return "";
        })
        .filter(line => line !== null && line !== undefined);
    }
  } catch (e) {
    console.error("Lore parse failed:", e.message);
    console.error("Failed string:", s);
    // Fallback: extract plain text
    converted.lore = [raw.replace(/['"]/g, '').trim()];
  }
}
          // === ENCHANTMENTS ===
          if (comp["minecraft:enchantments"]) {
            const parsed = parseSNBT(comp["minecraft:enchantments"]);
            if (parsed) {
              converted.enchants = Object.entries(parsed).map(([k, v]) => {
                return `${k.replace("minecraft:", "").toUpperCase()};${v}`;
              });
            }
          }

          // === CUSTOM MODEL DATA ===
          if (comp["minecraft:custom_model_data"]) {
            const parsed = parseSNBT(comp["minecraft:custom_model_data"]);
            if (parsed?.int !== undefined)
              converted.custom_model_data = parsed.int;
            else if (parsed?.floats?.[0])
              converted.custom_model_data = Math.round(parsed.floats[0]);
          }

          // === TRIM ===
          if (comp["minecraft:trim"]) {
            const parsed = parseSNBT(comp["minecraft:trim"]);
            if (parsed?.pattern && parsed?.material) {
              converted.trim_data = {
                pattern: parsed.pattern.replace("minecraft:", ""),
                material: parsed.material.replace("minecraft:", ""),
              };
            }
          }

          // === ITEM FLAGS ===
          if (comp["minecraft:tooltip_display"]) {
            const parsed = parseSNBT(comp["minecraft:tooltip_display"]);
            if (parsed?.hidden_components) {
              const map = {
                "minecraft:enchantments": "HIDE_ENCHANTS",
                "minecraft:trim": "HIDE_TRIM",
                "minecraft:dyed_color": "HIDE_DYE",
              };
              converted.item_flags = parsed.hidden_components
                .map((c) => map[c])
                .filter(Boolean);
            }
          }

          return converted;
        }

        // === MANUAL FORMAT ===
        const reg = { id: item.id, amount: item.amount || 1 };
        [
          "name",
          "durability",
          "custom_model_data",
          "color",
          "lore",
          "enchants",
          "item_flags",
          "trim_data",
          "hide_tooltip",
          "preview_slot",
          "offhand",
        ].forEach((k) => {
          if (item[k] !== undefined) reg[k] = item[k];
        });
        if (reg.lore && !Array.isArray(reg.lore)) reg.lore = [reg.lore];
        if (reg.enchants && !Array.isArray(reg.enchants))
          reg.enchants = [reg.enchants];
        return reg;
      });
    }
    // Load display
    if (cleaned.display) {
      kitData.display = cleaned.display;
    }

    // Load requirements
    if (cleaned.requirements) {
      kitData.requirements = {
        oneTimeRequirements:
          cleaned.requirements.one_time_requirements || false,
        price: cleaned.requirements.price || 0,
        extraRequirements: cleaned.requirements.extra_requirements || [],
        message: cleaned.requirements.message || [],
      };
    }

    // Load actions
    if (cleaned.actions) {
      if (cleaned.actions.claim) {
        kitData.actions.claim = Object.values(cleaned.actions.claim);
      }
      if (cleaned.actions.error) {
        kitData.actions.error = Object.values(cleaned.actions.error);
      }
    }

    // Update UI
    document.getElementById("kitName").value = kitData.kitName;
    document.getElementById("cooldown").value = kitData.cooldown;
    document.getElementById("permissionRequired").checked =
      kitData.permissionRequired;
    document.getElementById("customPermission").value =
      kitData.customPermission;
    document.getElementById("oneTime").checked = kitData.oneTime;
    document.getElementById("autoArmor").checked = kitData.autoArmor;
    document.getElementById("clearInventory").checked = kitData.clearInventory;
    document.getElementById("saveOriginalItems").checked =
      kitData.saveOriginalItems;

    renderItemsList();
    initializeDisplayEditor();
    renderActions();
    updateStats();
    updateYAMLPreview();
    setTimeout(renderRequirements, 100);

    closeModal("importModal");
    document.getElementById("importText").value = "";
    showAlert("Kit imported successfully!", "success");
  } catch (e) {
    console.error(e);
    showAlert("Failed to parse YAML: " + e.message, "error");
  }
}
// Helper function to extract display name from original item format
function extractNameFromOriginal(original) {
  if (!original || !original.components) return null;

  // Try to get custom_name from components
  const customName = original.components["minecraft:custom_name"];
  if (customName) {
    // Very basic extraction - just get the material name from ID as fallback
    const id = original.id ? original.id.replace("minecraft:", "") : "Item";
    return id
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  // Fallback to item_name or ID
  if (original.components && original.components["minecraft:item_name"]) {
    return "Original Item";
  }

  if (original.id) {
    const id = original.id.replace("minecraft:", "");
    return id
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  return "Original Item";
}
function parseSimpleYAML(yamlText) {
  // This is a very basic YAML parser - for production use js-yaml library
  // This handles the basic structure of PlayerKits YAML files
  const result = {};
  const lines = yamlText.split("\n");
  let currentPath = [];
  let currentObject = result;

  for (let line of lines) {
    if (line.trim().startsWith("#") || !line.trim()) continue;

    const indent = line.search(/\S/);
    const content = line.trim();

    if (content.includes(":")) {
      const [key, ...valueParts] = content.split(":");
      const value = valueParts.join(":").trim();

      // Handle simple key-value
      if (value && !value.startsWith("-")) {
        let parsed = value.replace(/['"]/g, "");
        if (parsed === "true") parsed = true;
        else if (parsed === "false") parsed = false;
        else if (!isNaN(parsed) && parsed !== "") parsed = Number(parsed);

        currentObject[key.trim()] = parsed;
      } else {
        // Create nested object
        currentObject[key.trim()] = {};
      }
    }
  }

  return result;
}

// ============================================
// VALIDATION
// ============================================
function validateKit() {
  const errors = [];
  const warnings = [];

  if (!kitData.kitName) {
    errors.push("Kit name is required");
  }

  if (kitData.items.length === 0) {
    warnings.push("No items added to kit");
  }

  if (!kitData.display.default || !kitData.display.default.id) {
    errors.push("Default display item is required");
  }

  kitData.items.forEach((item, index) => {
    const slot = index + 1;
    yaml += `  '${slot}':\n`;

    // === IF CONVERTED FROM ORIGINAL, USE CLEAN FORMAT ===
    if (item._converted_from_original) {
      yaml += `    id: ${item.id}\n`;
      yaml += `    amount: ${item.amount || 1}\n`;

      if (item.name) yaml += `    name: "${item.name}"\n`;
      if (item.durability) yaml += `    durability: ${item.durability}\n`;
      if (item.custom_model_data)
        yaml += `    custom_model_data: ${item.custom_model_data}\n`;
      if (item.color) yaml += `    color: ${item.color}\n`;

      if (item.lore?.length > 0) {
        yaml += `    lore:\n`;
        item.lore.forEach((l) => (yaml += `    - "${l}"\n`));
      }

      if (item.enchants?.length > 0) {
        yaml += `    enchants:\n`;
        item.enchants.forEach((e) => (yaml += `    - "${e}"\n`));
      }

      if (item.item_flags?.length > 0) {
        yaml += `    item_flags:\n`;
        item.item_flags.forEach((f) => (yaml += `    - ${f}\n`));
      }

      if (item.skull_data) {
        yaml += `    skull_data:\n`;
        if (item.skull_data.texture)
          yaml += `      texture: "${item.skull_data.texture}"\n`;
        if (item.skull_data.owner)
          yaml += `      owner: ${item.skull_data.owner}\n`;
        if (item.skull_data.id) yaml += `      id: "${item.skull_data.id}"\n`;
      }

      if (item.trim_data) {
        yaml += `    trim_data:\n`;
        yaml += `      pattern: ${item.trim_data.pattern}\n`;
        yaml += `      material: ${item.trim_data.material}\n`;
      }

      if (item.hide_tooltip) yaml += `    hide_tooltip: true\n`;
      if (item.nbt?.length > 0) {
        yaml += `    nbt:\n`;
        item.nbt.forEach((n) => (yaml += `    - ${n}\n`));
      }

      if (item.preview_slot !== undefined)
        yaml += `    preview_slot: ${item.preview_slot}\n`;
      if (item.offhand) yaml += `    offhand: true\n`;
    }
    // === ELSE: OLD FORMAT (keep original for backward compat) ===
    else if (item._original_data) {
      yaml += `    original:\n`;
      yaml += `      ==: org.bukkit.inventory.ItemStack\n`;
      yaml += `      id: ${item._original_data.id}\n`;
      yaml += `      count: ${item._original_data.count || 1}\n`;
      yaml += `      # Original components preserved - edit in Minecraft\n`;
      if (item.preview_slot !== undefined)
        yaml += `    preview_slot: ${item.preview_slot}\n`;
      if (item.offhand) yaml += `    offhand: true\n`;
    }
    // === ELSE: MANUAL FORMAT ===
    else {
      yaml += `    id: ${item.id}\n`;
      yaml += `    amount: ${item.amount || 1}\n`;
      if (item.name) yaml += `    name: "${item.name}"\n`;
      if (item.durability) yaml += `    durability: ${item.durability}\n`;
      if (item.custom_model_data)
        yaml += `    custom_model_data: ${item.custom_model_data}\n`;
      if (item.color) yaml += `    color: ${item.color}\n`;

      if (item.lore?.length > 0) {
        yaml += `    lore:\n`;
        item.lore.forEach((l) => (yaml += `    - "${l}"\n`));
      }

      if (item.enchants?.length > 0) {
        yaml += `    enchants:\n`;
        item.enchants.forEach((e) => (yaml += `    - "${e}"\n`));
      }

      if (item.item_flags?.length > 0) {
        yaml += `    item_flags:\n`;
        item.item_flags.forEach((f) => (yaml += `    - ${f}\n`));
      }

      if (item.skull_data) {
        yaml += `    skull_data:\n`;
        if (item.skull_data.texture)
          yaml += `      texture: "${item.skull_data.texture}"\n`;
        if (item.skull_data.owner)
          yaml += `      owner: ${item.skull_data.owner}\n`;
        if (item.skull_data.id) yaml += `      id: "${item.skull_data.id}"\n`;
      }

      if (item.trim_data) {
        yaml += `    trim_data:\n`;
        yaml += `      pattern: ${item.trim_data.pattern}\n`;
        yaml += `      material: ${item.trim_data.material}\n`;
      }

      if (item.hide_tooltip) yaml += `    hide_tooltip: true\n`;
      if (item.nbt?.length > 0) {
        yaml += `    nbt:\n`;
        item.nbt.forEach((n) => (yaml += `    - ${n}\n`));
      }

      if (item.preview_slot !== undefined)
        yaml += `    preview_slot: ${item.preview_slot}\n`;
      if (item.offhand) yaml += `    offhand: true\n`;
    }
  });

  if (errors.length > 0) {
    showAlert("Validation failed! Check console for details.", "error");
    console.error("Validation Errors:", errors);
    console.warn("Warnings:", warnings);
  } else if (warnings.length > 0) {
    showAlert("Validation passed with warnings! Check console.", "info");
    console.warn("Warnings:", warnings);
  } else {
    showAlert("Validation passed! ✓", "success");
  }
}

// ============================================
// STATS
// ============================================
function updateStats() {
  document.getElementById("totalItems").textContent = kitData.items.length;

  const totalActions =
    kitData.actions.claim.filter((a) => a.action).length +
    kitData.actions.error.filter((a) => a.action).length;
  document.getElementById("totalActions").textContent = totalActions;
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal-overlay").forEach((modal) => {
      modal.classList.add("hidden");
    });
  }

  // Ctrl/Cmd + S to download
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    downloadKit();
  }
});
