// RGB Color Picker
import { state } from "./state.js";
import { hexToRgb, rgbToHex, showNotification } from "./utils.js";

export function openRGBPicker(target) {
  state.rgbTarget = target;
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

export function closeRGBPicker() {
  document.getElementById("rgbModal").classList.add("hidden");
  state.rgbTarget = null;
}

export function updateRGBPreview() {
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

export function applyRGBColor() {
  const result = document.getElementById("rgbPreview").textContent;
  if (state.rgbTarget === "display") {
    document.getElementById("displayName").value = result;
  } else if (state.rgbTarget === "prefix") {
    document.getElementById("prefix").value = result;
  }
  closeRGBPicker();
  showNotification("🎨 RGB color applied!", "success");
}

export function initializeRGBPicker() {
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

  document.getElementById("rgbModal").addEventListener("click", (e) => {
    if (e.target.id === "rgbModal") closeRGBPicker();
  });
}
