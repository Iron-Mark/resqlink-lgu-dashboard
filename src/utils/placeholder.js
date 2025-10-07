const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 180;
const DEFAULT_BACKGROUND = "#0F172A";
const DEFAULT_FOREGROUND = "#FFFFFF";

function escapeForSvg(input) {
  if (!input) {
    return "";
  }
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildPlaceholderImage({
  text = "ResQLink",
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  background = DEFAULT_BACKGROUND,
  foreground = DEFAULT_FOREGROUND,
} = {}) {
  const safeBackground = /^#/.test(background) ? background : `#${background}`;
  const safeForeground = /^#/.test(foreground) ? foreground : `#${foreground}`;
  const safeText = escapeForSvg(text).slice(0, 48);
  const fontSize = Math.floor(Math.min(width, height) / 5);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect fill="${safeBackground}" width="100%" height="100%" rx="24" />
  <text x="50%" y="50%" fill="${safeForeground}" font-family="Inter, 'Segoe UI', sans-serif" font-size="${fontSize}" font-weight="600" dominant-baseline="middle" text-anchor="middle">${safeText}</text>
</svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
