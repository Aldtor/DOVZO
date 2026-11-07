export function integerInRange(value: number, min: number, max: number, label: string) {
  if (!Number.isSafeInteger(value) || value < min || value > max) throw new Error(`${label} must be a whole number between ${min} and ${max}.`);
  return value;
}

export const MAX_BROWSER_BYTES = 100 * 1024 * 1024;
export function validateFileBudget(files: readonly { size: number }[]) {
  if (files.reduce((sum, file) => sum + file.size, 0) > MAX_BROWSER_BYTES) throw new Error("Choose files totaling 100 MiB or less to keep browser memory use manageable.");
}

export function validateClip(start: number, end: number, duration: number, maximum = Infinity) {
  if (![start, end, duration].every(Number.isFinite) || start < 0 || end > duration || end <= start || end - start > maximum) throw new Error(`Choose a valid clip within the file${Number.isFinite(maximum) ? `, no longer than ${maximum} seconds` : ""}.`);
}

export function uniqueArchiveName(name: string, used: Set<string>) {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  let candidate = name, i = 2;
  while (used.has(candidate)) candidate = `${base} (${i++})${ext}`;
  used.add(candidate);
  return candidate;
}

export function encodeBase64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
}

export function decodeBase64(text: string) {
  const clean = text.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
  return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(atob(clean), (c) => c.charCodeAt(0)));
}

export function secureIndex(max: number) {
  const limit = Math.floor(4294967296 / max) * max;
  const bytes = new Uint32Array(1);
  do { crypto.getRandomValues(bytes); } while (bytes[0] >= limit);
  return bytes[0] % max;
}

export function generatePassword(length: number, sets: string[]) {
  integerInRange(length, 4, 64, "Length");
  if (!sets.length) return "";
  const pool = sets.join("");
  const chars = sets.map((set) => set[secureIndex(set.length)]);
  while (chars.length < length) chars.push(pool[secureIndex(pool.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}