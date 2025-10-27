// Utility Functions
export function debounce(func, wait) {
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

export function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

export function showNotification(message, type = "info") {
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

export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

export function rgbToHex(r, g, b) {
  return ((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase();
}

export function validateRankName(name) {
  return !name.includes(" ");
}
