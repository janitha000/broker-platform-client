const STORAGE_KEY = "broker.theme";

export const Theme = {
  Light: "light",
  Dark: "dark",
} as const;

export type Theme = (typeof Theme)[keyof typeof Theme];

function isTheme(value: unknown): value is Theme {
  return value === Theme.Light || value === Theme.Dark;
}

export function saveTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
}

export function loadTheme(): Theme | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isTheme(parsed)) return parsed;
  } catch {
    /* stored as a bare string */
  }
  if (isTheme(raw)) return raw;
  localStorage.removeItem(STORAGE_KEY);
  return null;
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}
