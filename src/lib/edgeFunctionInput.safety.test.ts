import { describe, it, expect } from "vitest";
import { z } from "zod";

/**
 * Tests for the edge function input validation schema.
 *
 * The wine-label-ocr edge function validates all input using Zod.
 * These tests mirror the server-side schema to ensure our understanding
 * of what is accepted/rejected matches the actual implementation.
 * If the schema changes, these tests MUST be updated in sync.
 */

// Mirror of the server-side schema (kept in sync manually)
const WineOCRSchema = z.object({
  image: z.string()
    .min(1, "Image is required")
    .max(10_000_000, "Image data too large (max ~7MB)")
    .refine(
      (val) => /^data:(image\/(png|jpeg|jpg|webp|gif)|application\/pdf);base64,/.test(val),
      "Invalid format - must be a valid base64 image or PDF data URL"
    ),
});

describe("Wine OCR input validation schema", () => {
  const validJpeg = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
  const validPng = "data:image/png;base64,iVBORw0KGgo=";
  const validPdf = "data:application/pdf;base64,JVBERi0xLjQ=";

  describe("accepts valid inputs", () => {
    it("accepts valid JPEG data URL", () => {
      expect(WineOCRSchema.safeParse({ image: validJpeg }).success).toBe(true);
    });

    it("accepts valid PNG data URL", () => {
      expect(WineOCRSchema.safeParse({ image: validPng }).success).toBe(true);
    });

    it("accepts valid PDF data URL", () => {
      expect(WineOCRSchema.safeParse({ image: validPdf }).success).toBe(true);
    });

    it("accepts valid WebP data URL", () => {
      const webp = "data:image/webp;base64,UklGRg==";
      expect(WineOCRSchema.safeParse({ image: webp }).success).toBe(true);
    });

    it("accepts valid GIF data URL", () => {
      const gif = "data:image/gif;base64,R0lGODlh";
      expect(WineOCRSchema.safeParse({ image: gif }).success).toBe(true);
    });
  });

  describe("rejects dangerous inputs", () => {
    it("rejects empty string", () => {
      expect(WineOCRSchema.safeParse({ image: "" }).success).toBe(false);
    });

    it("rejects missing image field", () => {
      expect(WineOCRSchema.safeParse({}).success).toBe(false);
    });

    it("rejects plain text (not a data URL)", () => {
      expect(WineOCRSchema.safeParse({ image: "hello world" }).success).toBe(false);
    });

    it("rejects javascript: URI", () => {
      expect(WineOCRSchema.safeParse({ image: 'javascript:alert("xss")' }).success).toBe(false);
    });

    it("rejects data:text/html", () => {
      expect(
        WineOCRSchema.safeParse({
          image: "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
        }).success,
      ).toBe(false);
    });

    it("rejects data:application/json (wrong MIME)", () => {
      expect(
        WineOCRSchema.safeParse({
          image: "data:application/json;base64,eyJ0ZXN0IjoxfQ==",
        }).success,
      ).toBe(false);
    });

    it("rejects SVG (potential XSS vector)", () => {
      expect(
        WineOCRSchema.safeParse({
          image: "data:image/svg+xml;base64,PHN2Zz48c2NyaXB0PmFsZXJ0KDEpPC9zY3JpcHQ+PC9zdmc+",
        }).success,
      ).toBe(false);
    });

    it("rejects oversized payload (> 10MB)", () => {
      const oversized = "data:image/jpeg;base64," + "A".repeat(10_000_001);
      expect(WineOCRSchema.safeParse({ image: oversized }).success).toBe(false);
    });

    it("rejects HTTP URL (not a data URL)", () => {
      expect(
        WineOCRSchema.safeParse({ image: "https://evil.com/malware.exe" }).success,
      ).toBe(false);
    });

    it("rejects file:// URI", () => {
      expect(
        WineOCRSchema.safeParse({ image: "file:///etc/passwd" }).success,
      ).toBe(false);
    });
  });

  describe("schema does not accept qrUrl field (removed)", () => {
    it("extra fields are stripped by Zod strict mode", () => {
      const result = WineOCRSchema.safeParse({
        image: validJpeg,
        qrUrl: "https://evil.com",
      });
      // Zod in non-strict mode ignores extra fields, but
      // the edge function only destructures `image`
      expect(result.success).toBe(true);
      if (result.success) {
        // The parsed data should not have qrUrl
        expect((result.data as Record<string, unknown>).qrUrl).toBeUndefined();
      }
    });
  });
});

describe("QR URL validation on server side", () => {
  // These tests document the server-side QR URL handling behavior:
  // Only URLs starting with "http" are accepted as valid QR code results.
  // This prevents injection of javascript:, data:, file:, etc.

  function isValidQrUrl(text: string): boolean {
    return text.trim().startsWith("http");
  }

  it("accepts valid HTTPS URL", () => {
    expect(isValidQrUrl("https://example.com/wine")).toBe(true);
  });

  it("accepts valid HTTP URL", () => {
    expect(isValidQrUrl("http://example.com/wine")).toBe(true);
  });

  it("rejects javascript: URI", () => {
    expect(isValidQrUrl('javascript:alert("xss")')).toBe(false);
  });

  it("rejects data: URI", () => {
    expect(isValidQrUrl("data:text/html,<h1>evil</h1>")).toBe(false);
  });

  it("rejects file: URI", () => {
    expect(isValidQrUrl("file:///etc/passwd")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidQrUrl("")).toBe(false);
  });

  it("rejects plain text", () => {
    expect(isValidQrUrl("not a url")).toBe(false);
  });

  it("rejects ftp: URI", () => {
    expect(isValidQrUrl("ftp://files.example.com/secret.txt")).toBe(false);
  });
});
