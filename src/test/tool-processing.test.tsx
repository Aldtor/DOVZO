import { describe, expect, it } from "vitest";
import { tools, categories, getTool, searchTools } from "@/lib/tools";
import { toolComponents } from "@/components/tools/registry";
import { acceptsFile } from "@/components/tools/kit";
import { parseRanges } from "@/components/tools/pdf";
import { decodeBase64, encodeBase64, integerInRange, uniqueArchiveName, validateClip, generatePassword } from "@/lib/tool-processing";

describe("DOVZO catalog integrity", () => {
  it("provides exactly 50 unique registered tools", () => {
    expect(tools).toHaveLength(50);
    expect(new Set(tools.map((t) => t.slug)).size).toBe(50);
    expect(Object.keys(toolComponents).sort()).toEqual(tools.map((t) => t.slug).sort());
    for (const tool of tools) expect(toolComponents[tool.slug]).toHaveProperty("$$typeof", Symbol.for("react.lazy"));
  });
  it("links every tool to a real category", () => {
    for (const tool of tools) expect(categories.some((c) => c.id === tool.category)).toBe(true);
    expect(getTool("missing")).toBeUndefined();
    expect(searchTools("json").map((t) => t.slug)).toEqual(expect.arrayContaining(["json-formatter", "json-validator", "json-minifier"]));
  });
});

describe("Real processing validation", () => {
  it("accepts only supported upload formats", () => {
    expect(acceptsFile(new File(["x"], "data.txt", { type: "text/plain" }), "image/*")).toBe(false);
    expect(acceptsFile(new File(["x"], "DATA.PDF"), "application/pdf")).toBe(true);
    expect(acceptsFile(new File(["x"], "pic.jpeg"), "image/jpeg")).toBe(true);
  });
  it("extracts selected PDF pages and rejects empty and out-of-range input", () => {
    expect(parseRanges("1-3, 5", 5)).toEqual([0, 1, 2, 4]);
    for (const value of ["", ",", "0", "6", "3-1", "abc"]) expect(() => parseRanges(value, 5)).toThrow();
  });
  it("round-trips large UTF-8 Base64 text without argument overflow", () => {
    const text = "DOVZO 🧰 café".repeat(30000);
    expect(decodeBase64(encodeBase64(text))).toBe(text);
    expect(() => decodeBase64("/w==")).toThrow();
  });
  it("keeps duplicate filenames instead of overwriting archive entries", () => {
    const used = new Set<string>();
    expect(uniqueArchiveName("photo.png", used)).toBe("photo.png");
    expect(uniqueArchiveName("photo.png", used)).toBe("photo (2).png");
    expect(uniqueArchiveName("photo.png", used)).toBe("photo (3).png");
  });
  it("enforces valid ranges and the 15-second GIF processing limit", () => {
    expect(() => validateClip(0, 15, 20, 15)).not.toThrow();
    expect(() => validateClip(0, 16, 20, 15)).toThrow();
    expect(() => validateClip(-0.1, 1, 2)).toThrow();
    expect(() => validateClip(1, 1, 2)).toThrow();
    expect(() => integerInRange(1.5, 1, 1000, "Count")).toThrow();
  });
  it("includes each selected character set in a real password", () => {
    const password = generatePassword(16, ["ABC", "abc", "123", "!@#"]);
    expect(password).toHaveLength(16);
    for (const set of ["ABC", "abc", "123", "!@#"]) expect([...password].some((c) => set.includes(c))).toBe(true);
  });
});