import { getTool } from "./tools";

// Preferences are optional: private mode or quota errors must not break tools.
export function readFavorites(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem("dovzo-favs") ?? "[]");
    return Array.isArray(value) ? [...new Set(value.filter((slug): slug is string => typeof slug === "string" && Boolean(getTool(slug))))] : [];
  } catch { return []; }
}

export function savePreference(key: "dovzo-theme" | "dovzo-favs", value: string): boolean {
  try { localStorage.setItem(key, value); return true; } catch { return false; }
}