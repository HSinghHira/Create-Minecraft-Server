// ============================================
// DATA MANAGEMENT
// ============================================
let profiles = [];
let currentProfileIndex = -1;
let textToolsTargetId = null;
let currentMotdVariationIndex = -1;

// ============================================
// TAB SWITCHING FUNCTION
// ============================================
function switchTab(tabName) {
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  const selectedContent = document.querySelector(`[data-content="${tabName}"]`);
  if (selectedContent) {
    selectedContent.classList.add("active");
  }

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

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.add("hidden");
  }
});

// ============================================
// ALERT/NOTIFICATION SYSTEM
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
        <span class="close-alert" style="cursor: pointer; font-weight: bold; opacity: 0.7; font-size: 18px;">X</span>
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
// PROFILE MANAGEMENT
// ============================================
function addNewProfile() {
  const newProfile = {
    id: "profile_" + Date.now(),
    name: "profile" + (profiles.length + 1),
    priority: 0,
    condition: "",
    motdVariations: [
      { line1: "", line2: "" }
    ],
    favicon: "",
    playerCount: {
      hidePlayers: false,
      hidePlayersHover: false,
      text: "",
      hover: [],
      extraPlayers: {
        enabled: false,
        amount: 0
      },
      maxPlayers: {
        enabled: false,
        amount: 0
      },
      onlinePlayers: {
        enabled: false,
        amount: 0
      }
    }
  };
  profiles.push(newProfile);
  renderProfilesList();
  editProfile(profiles.length - 1);
  updateStats();
  updateYAMLPreview();
}

function editProfile(index) {
  currentProfileIndex = index;
  const profile = profiles[index];

  document.getElementById("profileName").value = profile.name || "default";
  document.getElementById("priority").value = profile.priority || 0;
  document.getElementById("condition").value = profile.condition || "";
  
  // Render MOTD variations
  renderMotdVariations();
  
  // Favicon
  document.getElementById("faviconType").value = "";
  document.getElementById("faviconValue").value = "";
  document.getElementById("faviconValueField").classList.add("hidden");
  
  if (profile.favicon) {
    if (profile.favicon === "random") {
      document.getElementById("faviconType").value = "random";
    } else if (profile.favicon.startsWith("http")) {
      document.getElementById("faviconType").value = "url";
      document.getElementById("faviconValue").value = profile.favicon;
      document.getElementById("faviconValueField").classList.remove("hidden");
    } else if (profile.favicon.includes(".png")) {
      document.getElementById("faviconType").value = "file";
      document.getElementById("faviconValue").value = profile.favicon;
      document.getElementById("faviconValueField").classList.remove("hidden");
    } else {
      document.getElementById("faviconType").value = "player";
      document.getElementById("faviconValue").value = profile.favicon;
      document.getElementById("faviconValueField").classList.remove("hidden");
    }
  }
  updateFaviconFields();

  // Player Count
  document.getElementById("hidePlayers").checked = profile.playerCount.hidePlayers || false;
  document.getElementById("hidePlayersHover").checked = profile.playerCount.hidePlayersHover || false;
  document.getElementById("playerCountText").value = profile.playerCount.text || "";
  document.getElementById("hoverText").value = (profile.playerCount.hover || []).join("\n");
  
  document.getElementById("extraPlayersEnabled").checked = profile.playerCount.extraPlayers.enabled || false;
  document.getElementById("extraPlayersValue").value = profile.playerCount.extraPlayers.amount || 0;
  document.getElementById("maxPlayersEnabled").checked = profile.playerCount.maxPlayers.enabled || false;
  document.getElementById("maxPlayersValue").value = profile.playerCount.maxPlayers.amount || 0;
  
  toggleExtraPlayers();
  toggleMaxPlayers();

  document.getElementById("profileEditor").classList.remove("hidden");
  highlightActiveProfile();
}

function saveCurrentProfile() {
  if (currentProfileIndex === -1) return;

  const profile = profiles[currentProfileIndex];
  profile.name = document.getElementById("profileName").value.trim() || "default";
  profile.priority = parseInt(document.getElementById("priority").value) || 0;
  profile.condition = document.getElementById("condition").value.trim();
  
  // Save MOTD variations from form
  saveMotdVariationsFromForm();

  // Favicon
  const faviconType = document.getElementById("faviconType").value;
  if (faviconType === "random") {
    profile.favicon = "random";
  } else if (faviconType && faviconType !== "") {
    profile.favicon = document.getElementById("faviconValue").value.trim();
  } else {
    profile.favicon = "";
  }

  // Player Count
  profile.playerCount.hidePlayers = document.getElementById("hidePlayers").checked;
  profile.playerCount.hidePlayersHover = document.getElementById("hidePlayersHover").checked;
  profile.playerCount.text = document.getElementById("playerCountText").value.trim();
  
  const hoverLines = document.getElementById("hoverText").value.split("\n").filter(l => l.trim());
  profile.playerCount.hover = hoverLines.length > 0 ? hoverLines : [];
  
  profile.playerCount.extraPlayers.enabled = document.getElementById("extraPlayersEnabled").checked;
  profile.playerCount.extraPlayers.amount = parseInt(document.getElementById("extraPlayersValue").value) || 0;
  profile.playerCount.maxPlayers.enabled = document.getElementById("maxPlayersEnabled").checked;
  profile.playerCount.maxPlayers.amount = parseInt(document.getElementById("maxPlayersValue").value) || 0;

  renderProfilesList();
  updateStats();
  updateYAMLPreview();
  showAlert("Profile saved successfully!", "success");
}

function duplicateCurrentProfile() {
  if (currentProfileIndex === -1) return;

  const profile = JSON.parse(JSON.stringify(profiles[currentProfileIndex]));
  profile.id = "profile_" + Date.now();
  profile.name = profile.name + "_copy";
  profiles.push(profile);

  renderProfilesList();
  editProfile(profiles.length - 1);
  updateStats();
  updateYAMLPreview();
  showAlert("Profile duplicated!", "success");
}

function deleteCurrentProfile() {
  if (currentProfileIndex === -1) return;

  if (confirm("Are you sure you want to delete this profile?")) {
    profiles.splice(currentProfileIndex, 1);
    document.getElementById("profileEditor").classList.add("hidden");
    currentProfileIndex = -1;
    renderProfilesList();
    updateStats();
    updateYAMLPreview();
    showAlert("Profile deleted", "info");
  }
}

function renderProfilesList() {
  const container = document.getElementById("profilesList");

  if (profiles.length === 0) {
    container.innerHTML = `
            <div class="info-card" style="text-align: center; padding: 32px;">
                <svg style="width: 48px; height: 48px; margin: 0 auto 16px; color: var(--text-muted);"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p style="color: var(--text-muted);">No profiles yet. Click "New Profile" to get started!</p>
            </div>
        `;
    return;
  }

  container.innerHTML = profiles
    .map(
      (profile, index) => `
        <div class="setting-item ${index === currentProfileIndex ? "active" : ""}" 
             style="cursor: pointer; border: 2px solid ${
               index === currentProfileIndex ? "var(--accent-light)" : "transparent"
             };"
             onclick="editProfile(${index})">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <div style="
                        background: linear-gradient(135deg, var(--accent-primary), var(--accent-light));
                        color: var(--text-primary);
                        padding: 4px 10px;
                        border-radius: 6px;
                        font-size: 11px;
                        font-weight: 700;
                        min-width: 40px;
                        text-align: center;
                    ">P: ${profile.priority}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: var(--text-primary);">${profile.name}.yml</div>
                        <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                            ${profile.condition ? "Condition: " + profile.condition.substring(0, 30) + "..." : "No condition"} • ${profile.motdVariations.length} variation(s)
                        </div>
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

function highlightActiveProfile() {
  renderProfilesList();
}

function updateStats() {
  document.getElementById("totalProfiles").textContent = profiles.length;
  document.getElementById("activeProfile").textContent = currentProfileIndex >= 0 ? (currentProfileIndex + 1) : "-";
}

// ============================================
// MOTD VARIATIONS MANAGEMENT
// ============================================
function addMotdVariation() {
  if (currentProfileIndex === -1) return;
  
  profiles[currentProfileIndex].motdVariations.push({ line1: "", line2: "" });
  renderMotdVariations();
  showAlert("MOTD variation added!", "success");
}

function duplicateMotdVariation(index) {
  const profile = profiles[currentProfileIndex];
  if (!profile || !Array.isArray(profile.motdVariations)) return;

  const copy = { ...profile.motdVariations[index] };
  profile.motdVariations.push(copy);

  renderMotdVariations();
  updateYAMLPreview();
  showAlert("MOTD variation duplicated!", "success");
}

function deleteMotdVariation(index) {
  const profile = profiles[currentProfileIndex];
  if (!profile || !Array.isArray(profile.motdVariations)) return;

  profile.motdVariations.splice(index, 1);

  // If the last variation was removed → add a blank one
  if (profile.motdVariations.length === 0) {
    profile.motdVariations.push({ line1: "", line2: "" });
  }

  renderMotdVariations();
  updateYAMLPreview();
  showAlert("MOTD variation removed", "info");
}
function renderMotdVariations() {
  if (currentProfileIndex === -1) return;
  
  const profile = profiles[currentProfileIndex];
  const container = document.getElementById("motdVariationsList");
  
  if (!profile.motdVariations || profile.motdVariations.length === 0) {
    profile.motdVariations = [{ line1: "", line2: "" }];
  }
  
  container.innerHTML = profile.motdVariations.map((variation, index) => `
    <div class="card" style="padding: 16px; background: rgba(0, 0, 0, 0.2);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <strong style="color: var(--accent-light);">Variation ${index + 1}</strong>
        ${profile.motdVariations.length > 1 ? `
          <button onclick="deleteMotdVariation(${index})" class="btn" style="padding: 4px 8px; font-size: 12px; border-color: rgba(239, 68, 68, 0.5);">
            <svg style="display: inline; width: 14px; height: 14px; vertical-align: middle;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        ` : ''}
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div>
          <label style="font-size: 13px;">Line 1</label>
          <div style="display: flex; gap: 8px;">
            <input type="text" id="motdVar${index}Line1" class="flex-1" placeholder="<grey>First Line" value="${variation.line1 || ''}">
            <button onclick="openTextToolsForVariation(${index}, 'line1')" class="btn" style="padding: 8px;">
              <svg style="display: inline; width: 16px; height: 16px; vertical-align: middle;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </button>
          </div>
        </div>
        <div>
          <label style="font-size: 13px;">Line 2</label>
          <div style="display: flex; gap: 8px;">
            <input type="text" id="motdVar${index}Line2" class="flex-1" placeholder="<grey>Second Line" value="${variation.line2 || ''}">
            <button onclick="openTextToolsForVariation(${index}, 'line2')" class="btn" style="padding: 8px;">
              <svg style="display: inline; width: 16px; height: 16px; vertical-align: middle;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function saveMotdVariationsFromForm() {
  if (currentProfileIndex === -1) return;
  
  const profile = profiles[currentProfileIndex];
  profile.motdVariations.forEach((variation, index) => {
    const line1Input = document.getElementById(`motdVar${index}Line1`);
    const line2Input = document.getElementById(`motdVar${index}Line2`);
    
    if (line1Input && line2Input) {
      variation.line1 = line1Input.value;
      variation.line2 = line2Input.value;
    }
  });
}

// ============================================
// FAVICON FIELDS UPDATE
// ============================================
function updateFaviconFields() {
  const type = document.getElementById("faviconType").value;
  const valueField = document.getElementById("faviconValueField");
  const label = document.getElementById("faviconValueLabel");
  const input = document.getElementById("faviconValue");
  const help = document.getElementById("faviconHelp");

  if (type === "" || type === "random") {
    valueField.classList.add("hidden");
  } else {
    valueField.classList.remove("hidden");
    
    switch(type) {
      case "file":
        label.textContent = "Filename";
        input.placeholder = "my-icon.png";
        help.textContent = "Enter filename with .png extension from your favicons folder";
        break;
      case "url":
        label.textContent = "Image URL";
        input.placeholder = "https://example.com/icon.png";
        help.textContent = "Full URL to a 64x64 image";
        break;
      case "player":
        label.textContent = "Player Name or UUID";
        input.placeholder = "Notch";
        help.textContent = "Player name or UUID to use their head as favicon";
        break;
    }
  }
}

// ============================================
// EXTRA/MAX PLAYERS TOGGLE
// ============================================
function toggleExtraPlayers() {
  const enabled = document.getElementById("extraPlayersEnabled").checked;
  const amountField = document.getElementById("extraPlayersAmount");
  if (enabled) {
    amountField.classList.remove("hidden");
  } else {
    amountField.classList.add("hidden");
  }
}

function toggleMaxPlayers() {
  const enabled = document.getElementById("maxPlayersEnabled").checked;
  const amountField = document.getElementById("maxPlayersAmount");
  if (enabled) {
    amountField.classList.remove("hidden");
  } else {
    amountField.classList.add("hidden");
  }
}

// ============================================
// TEXT TOOLS (ENHANCED WITH ALIGNMENT, STYLES, SELECTION)
// ============================================
let selectedRange = null;

function openTextToolsForVariation(variationIndex, lineType) {
  currentMotdVariationIndex = variationIndex;
  textToolsTargetId = `motdVar${variationIndex}Line${lineType === 'line1' ? '1' : '2'}`;
  
  const targetInput = document.getElementById(textToolsTargetId);
  const currentValue = targetInput ? targetInput.value : "";

  // Reset UI
  document.getElementById("textToolsInput").value = currentValue;
  document.getElementById("enableGradient").checked = false;
  document.getElementById("textAlign").value = "left";
  document.getElementById("styleBold").checked = false;
  document.getElementById("styleItalic").checked = false;
  document.getElementById("styleUnderline").checked = false;

  document.getElementById("textToolsModal").classList.remove("hidden");
  updateAllPreviews();
  selectedRange = null;
}

function updateAllPreviews() {
  const text = document.getElementById("textToolsInput").value;
  const enableGradient = document.getElementById("enableGradient").checked;
  const align = document.getElementById("textAlign").value;
  const bold = document.getElementById("styleBold").checked;
  const italic = document.getElementById("styleItalic").checked;
  const underline = document.getElementById("styleUnderline").checked;

  if (!text) {
    document.getElementById("textPreview").innerHTML = "Enter text to see preview...";
    document.getElementById("textCode").textContent = "Enter text to see preview...";
    return;
  }

  let miniMessageCode = text;

  // === 1. Apply styles to selected range or whole text ===
  if (selectedRange && (bold || italic || underline)) {
    const { start, end, text: selectedText } = selectedRange;
    let styledText = selectedText;
    if (bold) styledText = `<bold>${styledText}</bold>`;
    if (italic) styledText = `<italic>${styledText}</italic>`;
    if (underline) styledText = `<underline>${styledText}</underline>`;
    miniMessageCode = miniMessageCode.slice(0, start) + styledText + miniMessageCode.slice(end);
  } else {
    if (bold) miniMessageCode = `<bold>${miniMessageCode}</bold>`;
    if (italic) miniMessageCode = `<italic>${miniMessageCode}</italic>`;
    if (underline) miniMessageCode = `<underline>${miniMessageCode}</underline>`;
  }

  // === 2. Apply alignment (only if not left) ===
  if (align !== "left") {
    miniMessageCode = `<${align}>${miniMessageCode}</${align}>`;
  }

  // === 3. Apply gradient (OUTER wrapper) ===
  if (enableGradient) {
    const startColor = document.getElementById("gradientStartHex").value;
    const endColor = document.getElementById("gradientEndHex").value;
    miniMessageCode = `<gradient:${startColor}:${endColor}>${miniMessageCode}</gradient>`;
  }

  // === Generate Preview ===
  const visualHTML = generateVisualPreview(miniMessageCode, enableGradient ? 
    [document.getElementById("gradientStartHex").value, document.getElementById("gradientEndHex").value] : null
  );

  document.getElementById("textPreview").innerHTML = visualHTML;
  document.getElementById("textCode").textContent = miniMessageCode;

  setupPreviewSelection();
}

function generateVisualPreview(miniMessage, gradientColors = null) {
  let html = "";
  let i = 0;
  const len = miniMessage.length;

  while (i < len) {
    if (miniMessage[i] === "<") {
      const tagEnd = miniMessage.indexOf(">", i);
      if (tagEnd === -1) break;
      const tag = miniMessage.slice(i + 1, tagEnd);
      i = tagEnd + 1;

      if (tag.startsWith("gradient:")) {
        const colors = tag.split(":").slice(1);
        const contentStart = i;
        const contentEnd = findClosingTag(miniMessage, i, "gradient");
        const content = miniMessage.slice(contentStart, contentEnd);
        i = contentEnd + 10; // </gradient>

        html += generateGradientHTML(content, colors[0], colors[1]);
        continue;
      }

      const isClosing = tag.startsWith("/");
      const tagName = isClosing ? tag.slice(1) : tag.split(":")[0];

      if (isClosing) {
        i++;
        continue;
      }

      const contentStart = i;
      const contentEnd = findClosingTag(miniMessage, i, tagName);
      const content = miniMessage.slice(contentStart, contentEnd);
      i = contentEnd + tagName.length + 3;

      let style = "";
      switch (tagName) {
        case "bold": style = "font-weight: bold;"; break;
        case "italic": style = "font-style: italic;"; break;
        case "underline": style = "text-decoration: underline;"; break;
        case "center": case "right": style = `text-align: ${tagName}; display: block;`; break;
      }

      html += `<span style="${style}">${generateVisualPreview(content, gradientColors)}</span>`;
    } else {
      html += miniMessage[i] === " " ? "&nbsp;" : escapeHtml(miniMessage[i]);
      i++;
    }
  }

  return html;
}

function findClosingTag(str, start, tagName) {
  let depth = 1;
  let i = start;
  const openTag = `<${tagName}`;
  const closeTag = `</${tagName}>`;

  while (i < str.length) {
    const openIdx = str.indexOf(openTag, i);
    const closeIdx = str.indexOf(closeTag, i);

    if (closeIdx === -1) break;

    if (openIdx !== -1 && openIdx < closeIdx) {
      depth++;
      i = openIdx + openTag.length;
    } else {
      depth--;
      i = closeIdx + closeTag.length;
      if (depth === 0) return closeIdx;
    }
  }
  return str.length;
}

function generateGradientHTML(text, startColor, endColor) {
  if (!text) return "";
  let result = "";
  const length = text.length;
  for (let i = 0; i < length; i++) {
    const factor = length > 1 ? i / (length - 1) : 0;
    const color = interpolateColor(startColor, endColor, factor);
    result += `<span style="color: ${color};">${escapeHtml(text[i])}</span>`;
  }
  return result;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

function interpolateColor(color1, color2, factor) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return color1;
  const r = Math.round(rgb1.r + factor * (rgb2.r - rgb1.r));
  const g = Math.round(rgb1.g + factor * (rgb2.g - rgb1.g));
  const b = Math.round(rgb1.b + factor * (rgb2.b - rgb1.b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

// Selection in preview
function setupPreviewSelection() {
  const preview = document.getElementById("textPreview");
  preview.onclick = null; // clear previous

  preview.onclick = (e) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const pre = document.createElement("pre");
    pre.style.position = "absolute";
    pre.style.left = "-9999px";
    pre.appendChild(range.cloneContents());
    document.body.appendChild(pre);
    const selectedText = pre.textContent;
    document.body.removeChild(pre);

    const fullText = document.getElementById("textToolsInput").value;
    const startOffset = getOffsetInFullText(fullText, range.startContainer, range.startOffset);
    const endOffset = getOffsetInFullText(fullText, range.endContainer, range.endOffset);

    selectedRange = {
      start: startOffset,
      end: endOffset,
      text: selectedText
    };

    selection.empty();
    updateAllPreviews();
  };
}

function getOffsetInFullText(fullText, container, offset) {
  const walker = document.createTreeWalker(
    document.getElementById("textPreview"),
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  let currentOffset = 0;
  let node;
  while (node = walker.nextNode()) {
    if (node === container) {
      return currentOffset + offset;
    }
    currentOffset += node.textContent.length;
  }
  return fullText.length;
}

function applyTextTools() {
  if (!textToolsTargetId) return;

  const miniMessageCode = document.getElementById("textCode").textContent;

  if (miniMessageCode && miniMessageCode !== "Enter text to see preview...") {
    const targetInput = document.getElementById(textToolsTargetId);
    targetInput.value = miniMessageCode;

    closeModal("textToolsModal");
    showAlert("Text applied successfully!", "success");
  } else {
    showAlert("Please enter text first", "error");
  }
}

// ============================================
// YAML GENERATION
// ============================================
function generateYAMLForProfile(profile) {
  let yaml = "#\n# AdvancedServerList Profile Configuration\n";
  yaml += `# Profile: ${profile.name}\n`;
  yaml += "# Generated at: https://createminecraftserver.hira.im/\n#\n\n";

  yaml += `priority: ${profile.priority}\n`;
  yaml += `condition: '${profile.condition}'\n\n`;

  // Profiles section (MOTD variations)
  yaml += `profiles:\n`;
  profile.motdVariations.forEach(variation => {
    if (variation.line1 || variation.line2) {
      yaml += `- motd:\n`;
      yaml += `  - '${variation.line1}'\n`;
      yaml += `  - '${variation.line2}'\n`;
    }
  });
  yaml += `\n`;

  // Main MOTD (first variation as default)
  yaml += `motd:\n`;
  if (profile.motdVariations.length > 0) {
    yaml += `- '${profile.motdVariations[0].line1}'\n`;
    yaml += `- '${profile.motdVariations[0].line2}'\n`;
  } else {
    yaml += `- ''\n- ''\n`;
  }
  yaml += `\n`;

  // Favicon
  yaml += `favicon: '${profile.favicon}'\n\n`;

  // Player Count
  yaml += `playerCount:\n`;
  yaml += `  hidePlayers: ${profile.playerCount.hidePlayers}\n`;
  yaml += `  hidePlayersHover: ${profile.playerCount.hidePlayersHover}\n`;
  
  if (profile.playerCount.hover.length > 0) {
    yaml += `  hover:\n`;
    profile.playerCount.hover.forEach(line => {
      yaml += `  - '${line}'\n`;
    });
  } else {
    yaml += `  hover: []\n`;
  }
  
  yaml += `  text: '${profile.playerCount.text}'\n`;
  
  yaml += `  extraPlayers:\n`;
  yaml += `    enabled: ${profile.playerCount.extraPlayers.enabled}\n`;
  yaml += `    amount: ${profile.playerCount.extraPlayers.amount}\n`;
  
  yaml += `  maxPlayers:\n`;
  yaml += `    enabled: ${profile.playerCount.maxPlayers.enabled}\n`;
  yaml += `    amount: ${profile.playerCount.maxPlayers.amount}\n`;
  
  yaml += `  onlinePlayers:\n`;
  yaml += `    enabled: ${profile.playerCount.onlinePlayers.enabled}\n`;
  yaml += `    amount: ${profile.playerCount.onlinePlayers.amount}\n`;

  return yaml;
}

function updateYAMLPreview() {
  if (currentProfileIndex === -1 || profiles.length === 0) {
    document.getElementById("yamlPreview").textContent = "# Click 'New Profile' to start creating your configuration";
    return;
  }
  
  const yaml = generateYAMLForProfile(profiles[currentProfileIndex]);
  document.getElementById("yamlPreview").textContent = yaml;
}

// ============================================
// IMPORT/EXPORT
// ============================================
function exportYAML() {
  if (profiles.length === 0) {
    showAlert("No profiles to export!", "error");
    return;
  }

  profiles.forEach(profile => {
    const yaml = generateYAMLForProfile(profile);
    const blob = new Blob([yaml], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.name}.yml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  showAlert(`${profiles.length} profile(s) exported!`, "success");
}

function downloadCurrentProfile() {
  if (currentProfileIndex === -1) {
    showAlert("Please select a profile first!", "error");
    return;
  }

  const profile = profiles[currentProfileIndex];
  const yaml = generateYAMLForProfile(profile);
  const blob = new Blob([yaml], { type: "text/yaml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${profile.name}.yml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showAlert(`${profile.name}.yml downloaded!`, "success");
}

function importYAML() {
  document.getElementById("importModal").classList.remove("hidden");
}

function confirmImport() {
  const yamlText = document.getElementById("importYamlText").value.trim();

  if (!yamlText) {
    showAlert("Please paste YAML content", "error");
    return;
  }

  try {
    const importedProfile = parseYAML(yamlText);
    
    if (!importedProfile) {
      showAlert("No valid profile found in YAML", "error");
      return;
    }

    profiles.push(importedProfile);
    renderProfilesList();
    updateStats();
    closeModal("importModal");
    document.getElementById("importYamlText").value = "";
    showAlert("Profile imported successfully!", "success");
    
    // Edit the newly imported profile
    editProfile(profiles.length - 1);
    updateYAMLPreview();
  } catch (e) {
    showAlert("Failed to parse YAML: " + e.message, "error");
  }
}

// Simple YAML parser for AdvancedServerList configuration
function parseYAML(yamlText) {
  const lines = yamlText.split("\n");
  const profile = {
    id: "profile_" + Date.now(),
    name: "imported_profile",
    priority: 0,
    condition: "",
    motdVariations: [],
    favicon: "",
    playerCount: {
      hidePlayers: false,
      hidePlayersHover: false,
      text: "",
      hover: [],
      extraPlayers: { enabled: false, amount: 0 },
      maxPlayers: { enabled: false, amount: 0 },
      onlinePlayers: { enabled: false, amount: 0 }
    }
  };

  let currentSection = "";
  let motdIndex = -1;

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith("#")) continue;

    if (line.includes(":")) {
      const [key, value] = line.split(":").map(s => s.trim());

      if (key === "priority") profile.priority = parseInt(value) || 0;
      else if (key === "condition") profile.condition = value.replace(/^['"](.*)['"]$/, "$1");
      else if (key === "favicon") profile.favicon = value.replace(/^['"](.*)['"]$/, "$1");
      else if (key === "hidePlayers") profile.playerCount.hidePlayers = value === "true";
      else if (key === "hidePlayersHover") profile.playerCount.hidePlayersHover = value === "true";
      else if (key === "text") profile.playerCount.text = value.replace(/^['"](.*)['"]$/, "$1");
      else if (key.startsWith("-")) {
        // MOTD line
        const clean = value.replace(/^['"](.*)['"]$/, "$1");
        if (currentSection === "profiles") {
          if (!profile.motdVariations[motdIndex]) profile.motdVariations[motdIndex] = { line1: "", line2: "" };
          if (!profile.motdVariations[motdIndex].line1) profile.motdVariations[motdIndex].line1 = clean;
          else profile.motdVariations[motdIndex].line2 = clean;
        }
      } else if (key === "hover") currentSection = "hover";
      else if (key === "extraPlayers") currentSection = "extraPlayers";
      else if (key === "maxPlayers") currentSection = "maxPlayers";
      else if (key === "onlinePlayers") currentSection = "onlinePlayers";
      else if (key === "profiles") {
        currentSection = "profiles";
        motdIndex++;
        profile.motdVariations.push({ line1: "", line2: "" });
      }
    } else if (line.startsWith("-")) {
      // Hover lines or extraPlayers/maxPlayers fields
      const clean = line.replace(/^-\s*['"]?(.*)['"]?$/, "$1");
      if (currentSection === "hover") profile.playerCount.hover.push(clean);
      else if (currentSection === "extraPlayers") {
        if (line.includes("enabled")) profile.playerCount.extraPlayers.enabled = clean === "true";
        else if (line.includes("amount")) profile.playerCount.extraPlayers.amount = parseInt(clean) || 0;
      } else if (currentSection === "maxPlayers") {
        if (line.includes("enabled")) profile.playerCount.maxPlayers.enabled = clean === "true";
        else if (line.includes("amount")) profile.playerCount.maxPlayers.amount = parseInt(clean) || 0;
      } else if (currentSection === "onlinePlayers") {
        if (line.includes("enabled")) profile.playerCount.onlinePlayers.enabled = clean === "true";
        else if (line.includes("amount")) profile.playerCount.onlinePlayers.amount = parseInt(clean) || 0;
      }
    }
  }

  // Fallback: if no variations were parsed, add a default one
  if (profile.motdVariations.length === 0) {
    profile.motdVariations.push({ line1: "", line2: "" });
  }

  // Use the first MOTD as the default name if none was set
  if (!profile.name || profile.name === "imported_profile") {
    const firstLine = profile.motdVariations[0].line1 || profile.motdVariations[0].line2 || "default";
    profile.name = firstLine.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 20) || "imported";
  }

  return profile;
}

// ============================================
// UI EVENT LISTENERS
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  // Buttons
  document.getElementById("addProfileBtn").addEventListener("click", addNewProfile);
  document.getElementById("saveProfileBtn").addEventListener("click", saveCurrentProfile);
  document.getElementById("duplicateProfileBtn").addEventListener("click", duplicateCurrentProfile);
  document.getElementById("deleteProfileBtn").addEventListener("click", deleteCurrentProfile);
  document.getElementById("downloadBtn").addEventListener("click", downloadCurrentProfile);
  document.getElementById("exportBtn").addEventListener("click", exportYAML);
  document.getElementById("importBtn").addEventListener("click", importYAML);
  document.getElementById("importConfirmBtn").addEventListener("click", confirmImport);
  document.getElementById("quickRefBtn").addEventListener("click", () => openModal("quickRefModal"));
  document.getElementById("applyTextToolBtn").addEventListener("click", applyTextTools);

  // Text Tools Inputs
  document.getElementById("textToolsInput").addEventListener("input", updateAllPreviews);
  document.getElementById("enableGradient").addEventListener("change", updateAllPreviews);
  document.getElementById("textAlign").addEventListener("change", updateAllPreviews);
  document.getElementById("styleBold").addEventListener("change", updateAllPreviews);
  document.getElementById("styleItalic").addEventListener("change", updateAllPreviews);
  document.getElementById("styleUnderline").addEventListener("change", updateAllPreviews);

  // Gradient sync
  document.getElementById("gradientStartColor").addEventListener("input", (e) => {
    document.getElementById("gradientStartHex").value = e.target.value;
    updateAllPreviews();
  });
  document.getElementById("gradientEndColor").addEventListener("input", (e) => {
    document.getElementById("gradientEndHex").value = e.target.value;
    updateAllPreviews();
  });
  document.getElementById("gradientStartHex").addEventListener("input", (e) => {
    document.getElementById("gradientStartColor").value = e.target.value;
    updateAllPreviews();
  });
  document.getElementById("gradientEndHex").addEventListener("input", (e) => {
    document.getElementById("gradientEndColor").value = e.target.value;
    updateAllPreviews();
  });

  // Checkboxes
  document.getElementById("extraPlayersEnabled").addEventListener("change", toggleExtraPlayers);
  document.getElementById("maxPlayersEnabled").addEventListener("change", toggleMaxPlayers);

  // Copy YAML
  document.getElementById("copyYamlBtn").addEventListener("click", () => {
    const yaml = document.getElementById("yamlPreview").textContent;
    navigator.clipboard.writeText(yaml).then(() => {
      showAlert("YAML copied to clipboard!", "success");
    }).catch(() => {
      showAlert("Failed to copy YAML", "error");
    });
  });

  // Initial render
  renderProfilesList();
  updateStats();
  updateYAMLPreview();
});