import { afterEach, describe, expect, it, vi } from "vitest";
import { loadImage, download } from "@/components/tools/kit";

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("Browser file resources", () => {
  it("releases successful image decoding URLs without losing the decoded image", async () => {
    const revoke = vi.fn();
    vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:test-image"), revokeObjectURL: revoke });
    class DecodedImage {
      onload?: () => void;
      set src(_value: string) { queueMicrotask(() => this.onload?.()); }
      naturalWidth = 24;
    }
    vi.stubGlobal("Image", DecodedImage);
    const result = await loadImage(new File(["image"], "image.png"));
    expect(result.naturalWidth).toBe(24);
    expect(revoke).toHaveBeenCalledWith("blob:test-image");
  });

  it("attaches download anchors for browser compatibility and releases temporary URLs", () => {
    vi.useFakeTimers();
    const revoke = vi.fn();
    vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:test-download"), revokeObjectURL: revoke });
    let attached = false;
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) { attached = document.body.contains(this); });
    download(new Blob(["result"]), "result.txt");
    expect(attached).toBe(true);
    expect(document.querySelector('a[download="result.txt"]')).toBeNull();
    vi.runAllTimers();
    expect(revoke).toHaveBeenCalledWith("blob:test-download");
  });
});