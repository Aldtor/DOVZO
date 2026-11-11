import { describe, expect, it } from "vitest";
import { imageDataUrl } from "@/lib/tool-processing";
import { acceptsFile } from "@/components/tools/kit";

describe("image input formats", () => {
  it("preserves actual raster types for raw Base64 downloads", () => {
    for (const [signature, mime] of [["\x89PNG\r\n", "png"], ["\xff\xd8\xff\xe0", "jpeg"], ["GIF89a", "gif"], ["RIFF1234WEBP", "webp"], ["BM1234", "bmp"]]) {
      expect(imageDataUrl(btoa(signature))).toBe(`data:image/${mime};base64,${btoa(signature)}`);
    }
  });
  it("preserves full image URLs and rejects non-image input", () => {
    expect(imageDataUrl("data:image/svg+xml;base64,PHN2Zy8+")).toBe("data:image/svg+xml;base64,PHN2Zy8+");
    expect(() => imageDataUrl("data:text/html;base64,PHN2Zy8+")).toThrow();
    expect(() => imageDataUrl("not an image")).toThrow();
    expect(imageDataUrl(" ")).toBe("");
  });
  it("accepts extension matches with generic MIME metadata while rejecting mismatches", () => {
    expect(acceptsFile(new File([""], "photo.JPG", { type: "application/octet-stream" }), "image/*")).toBe(true);
    expect(acceptsFile(new File([""], "data.bin", { type: "application/octet-stream" }), "image/*")).toBe(false);
    expect(acceptsFile(new File([""], "photo.jpg", { type: "text/plain" }), "image/*")).toBe(false);
  });
});
