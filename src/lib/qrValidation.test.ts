import { describe, it, expect } from "vitest";
import { validateQrFromImageData } from "./qrValidation";

function makeImageData(width: number, height: number): ImageData {
  // data size is width * height * 4 (RGBA)
  const data = new Uint8ClampedArray(width * height * 4);
  // JSDOM in some environments doesn't expose ImageData; we only need the shape.
  return { data, width, height } as unknown as ImageData;
}

describe("validateQrFromImageData", () => {
  it("returns scan_failed when decoder returns null", () => {
    const img = makeImageData(10, 10);
    const res = validateQrFromImageData(img, "https://example.com", () => null);
    expect(res).toEqual({ ok: false, reason: "scan_failed" });
  });

  it("returns url_mismatch when decoded url differs", () => {
    const img = makeImageData(10, 10);
    const res = validateQrFromImageData(
      img,
      "https://expected",
      () => ({ data: "https://got" }),
    );
    expect(res.ok).toBe(false);
    if (res.ok === false) {
      expect(res.reason).toBe("url_mismatch");
      expect(res.decodedUrl).toBe("https://got");
    }
  });

  it("returns ok when decoded url matches", () => {
    const img = makeImageData(10, 10);
    const res = validateQrFromImageData(
      img,
      "https://expected",
      () => ({ data: "https://expected" }),
    );
    expect(res).toEqual({ ok: true, decodedUrl: "https://expected" });
  });

  it("returns mismatch for empty expected URL", () => {
    const img = makeImageData(10, 10);
    const res = validateQrFromImageData(
      img,
      "",
      () => ({ data: "https://anything" }),
    );
    expect(res.ok).toBe(false);
    if (res.ok === false) expect(res.reason).toBe("url_mismatch");
  });

  it("returns mismatch for whitespace-only expected URL", () => {
    const img = makeImageData(10, 10);
    const res = validateQrFromImageData(
      img,
      "   ",
      () => ({ data: "https://anything" }),
    );
    expect(res.ok).toBe(false);
  });

  it("handles very long URLs without crash", () => {
    const img = makeImageData(10, 10);
    const longUrl = "https://example.com/" + "a".repeat(10000);
    const res = validateQrFromImageData(
      img,
      longUrl,
      () => ({ data: longUrl }),
    );
    expect(res).toEqual({ ok: true, decodedUrl: longUrl });
  });
});
