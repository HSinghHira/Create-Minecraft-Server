// Fancy Text Converter
import { state } from "./state.js";
import { showNotification } from "./utils.js";

const FANCY_MAP = {
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
  s: "ꜱ",
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
  S: "ꜱ",
  T: "ᴛ",
  U: "ᴜ",
  V: "ᴠ",
  W: "ᴡ",
  X: "x",
  Y: "ʏ",
  Z: "ᴢ",
};

export function convertToFancy(text) {
  return text
    .split("")
    .map((char) => FANCY_MAP[char] || char)
    .join("");
}

export function openFancyPicker(target) {
  state.fancyTarget = target;
  document.getElementById("fancyModal").classList.remove("hidden");

  const currentValue =
    target === "display"
      ? document.getElementById("displayName").value
      : document.getElementById("prefix").value;

  // Remove color codes to get just the text
  const textOnly = currentValue
    .replace(/&#[0-9A-Fa-f]{6}/g, "")
    .replace(/&[0-9a-fklmnor]/g, "")
    .trim();

  document.getElementById("fancyText").value = textOnly;
  updateFancyPreview();
}

export function closeFancyPicker() {
  document.getElementById("fancyModal").classList.add("hidden");
  state.fancyTarget = null;
}

export function updateFancyPreview() {
  const text = document.getElementById("fancyText").value;
  const fancy = convertToFancy(text);
  document.getElementById("fancyPreview").textContent = fancy;
}

export function applyFancyText() {
  const text = document.getElementById("fancyText").value;
  const fancy = convertToFancy(text);

  if (state.fancyTarget === "display") {
    const current = document.getElementById("displayName").value;
    // Preserve color codes if present
    const hasColors = current.match(/&#[0-9A-Fa-f]{6}|&[0-9a-fklmnor]/);
    if (hasColors) {
      // Extract color codes and apply to fancy text
      const colors = current.match(/(&#[0-9A-Fa-f]{6}|&[0-9a-fklmnor])/g) || [];
      document.getElementById("displayName").value = colors.join("") + fancy;
    } else {
      document.getElementById("displayName").value = fancy;
    }
  } else if (state.fancyTarget === "prefix") {
    const current = document.getElementById("prefix").value;
    // Try to preserve bracket structure
    const hasbrackets = current.match(/^(.*)(\[)(.*)(\])(.*)$/);
    if (hasbrackets) {
      const before = hasbrackets[1];
      const after = hasbrackets[5];
      document.getElementById("prefix").value = `${before}[${fancy}]${after}`;
    } else {
      document.getElementById("prefix").value = fancy;
    }
  }

  closeFancyPicker();
  showNotification("✨ Fancy text applied!", "success");
}

export function initializeFancyPicker() {
  document
    .getElementById("fancyDisplayBtn")
    .addEventListener("click", () => openFancyPicker("display"));
  document
    .getElementById("fancyPrefixBtn")
    .addEventListener("click", () => openFancyPicker("prefix"));
  document
    .getElementById("fancyApplyBtn")
    .addEventListener("click", applyFancyText);
  document
    .getElementById("fancyCancelBtn")
    .addEventListener("click", closeFancyPicker);
  document
    .getElementById("fancyText")
    .addEventListener("input", updateFancyPreview);

  // Close on backdrop click
  document.getElementById("fancyModal").addEventListener("click", (e) => {
    if (e.target.id === "fancyModal") closeFancyPicker();
  });
}
