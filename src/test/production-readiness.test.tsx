import { afterEach, describe, expect, it, vi } from "vitest";
import { readFavorites, savePreference } from "@/lib/browser-storage";
import { waitForClip } from "@/lib/media-lifecycle";
import { Route as ToolRoute } from "@/routes/tools.$slug";
import { Route as CategoryRoute } from "@/routes/categories.$category";

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); localStorage.clear(); });

describe("Optional browser preferences", () => {
  it("rejects malformed favorites and keeps only unique registered slugs", () => {
    localStorage.setItem("dovzo-favs", "{}"); expect(readFavorites()).toEqual([]);
    localStorage.setItem("dovzo-favs", '["json-formatter", "json-formatter", "missing", 1]');
    expect(readFavorites()).toEqual(["json-formatter"]);
  });
  it("does not throw when browser storage is denied", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Denied"); });
    expect(savePreference("dovzo-theme", "dark")).toBe(false);
  });
});

describe("Media lifecycle", () => {
  it("cancels a waiting recording when the page unmounts", async () => {
    vi.stubGlobal("requestAnimationFrame", vi.fn(() => 42));
    const cancel = vi.fn(); vi.stubGlobal("cancelAnimationFrame", cancel);
    const video = document.createElement("video"); const controller = new AbortController();
    const result = waitForClip(video, 10, controller.signal);
    controller.abort();
    await expect(result).rejects.toHaveProperty("name", "AbortError");
    expect(cancel).toHaveBeenCalledWith(42);
  });
  it("rejects stalled playback instead of waiting forever", async () => {
    vi.useFakeTimers(); vi.stubGlobal("requestAnimationFrame", vi.fn(() => 42)); vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const video = document.createElement("video");
    const result = waitForClip(video, 1, new AbortController().signal);
    const assertion = expect(result).rejects.toThrow("Playback stopped");
    await vi.advanceTimersByTimeAsync(16000); await assertion;
  });
});

describe("Invalid catalog routes", () => {
  it("rejects invalid tool slugs rather than returning empty workspaces", () => {
    const loader = ToolRoute.options.loader;
    if (typeof loader !== "function") throw new Error("Missing tool loader");
    expect(() => loader({ params: { slug: "missing-tool" } } as Parameters<typeof loader>[0])).toThrow();
  });
  it("rejects invalid categories", () => {
    const loader = CategoryRoute.options.loader;
    if (typeof loader !== "function") throw new Error("Missing category loader");
    expect(() => loader({ params: { category: "missing-category" } } as Parameters<typeof loader>[0])).toThrow();
  });
});