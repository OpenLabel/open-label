import { describe, it, expect } from "vitest";
import { validateQrFromImageData, QrDecoder } from "./qrValidation";

/**
 * Security-focused tests for QR code validation before download.
 *
 * WHY THESE TESTS MATTER:
 * A tampered or incorrectly-generated QR code on a Digital Product Passport
 * could redirect consumers to a phishing site, a counterfeit product page,
 * or inject malicious content. These tests verify that the validation gate
 * prevents download of any QR code whose decoded URL does not EXACTLY match
 * the expected passport URL.
 */

function makeImageData(width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  return { data, width, height } as unknown as ImageData;
}

describe("QR download safety – URL matching", () => {
  const PASSPORT_URL = "https://open-label.example.com/p/abc123def456";

  it("blocks download when QR encodes a phishing domain", () => {
    const phishingDecoder: QrDecoder = () => ({
      data: "https://digital-product-passports.evil.com/p/abc123def456",
    });
    const result = validateQrFromImageData(makeImageData(10, 10), PASSPORT_URL, phishingDecoder);
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.reason).toBe("url_mismatch");
    }
  });

  it("blocks download when QR encodes a typosquat domain", () => {
    const typosquatDecoder: QrDecoder = () => ({
      data: "https://digital-product-passports.examp1e.com/p/abc123def456",
    });
    const result = validateQrFromImageData(makeImageData(10, 10), PASSPORT_URL, typosquatDecoder);
    expect(result.ok).toBe(false);
  });

  it("blocks download when QR encodes a different passport slug", () => {
    const wrongSlugDecoder: QrDecoder = () => ({
      data: "https://digital-product-passports.example.com/p/DIFFERENT_SLUG",
    });
    const result = validateQrFromImageData(makeImageData(10, 10), PASSPORT_URL, wrongSlugDecoder);
    expect(result.ok).toBe(false);
  });

  it("blocks download when QR encodes a javascript: URI", () => {
    const xssDecoder: QrDecoder = () => ({
      data: 'javascript:alert("xss")',
    });
    const result = validateQrFromImageData(makeImageData(10, 10), PASSPORT_URL, xssDecoder);
    expect(result.ok).toBe(false);
  });

  it("blocks download when QR encodes a data: URI", () => {
    const dataDecoder: QrDecoder = () => ({
      data: "data:text/html,<script>alert(1)</script>",
    });
    const result = validateQrFromImageData(makeImageData(10, 10), PASSPORT_URL, dataDecoder);
    expect(result.ok).toBe(false);
  });

  it("blocks download when QR adds query params to expected URL", () => {
    const queryDecoder: QrDecoder = () => ({
      data: PASSPORT_URL + "?redirect=https://evil.com",
    });
    const result = validateQrFromImageData(makeImageData(10, 10), PASSPORT_URL, queryDecoder);
    expect(result.ok).toBe(false);
  });

  it("blocks download when QR adds fragment to expected URL", () => {
    const fragmentDecoder: QrDecoder = () => ({
      data: PASSPORT_URL + "#injected",
    });
    const result = validateQrFromImageData(makeImageData(10, 10), PASSPORT_URL, fragmentDecoder);
    expect(result.ok).toBe(false);
  });

  it("blocks download when QR URL has trailing slash difference", () => {
    const trailingSlashDecoder: QrDecoder = () => ({
      data: PASSPORT_URL + "/",
    });
    const result = validateQrFromImageData(makeImageData(10, 10), PASSPORT_URL, trailingSlashDecoder);
    // Strict match means trailing slash causes mismatch — this is intentional for safety
    expect(result.ok).toBe(false);
  });

  it("allows download when QR exactly matches expected URL", () => {
    const correctDecoder: QrDecoder = () => ({
      data: PASSPORT_URL,
    });
    const result = validateQrFromImageData(makeImageData(10, 10), PASSPORT_URL, correctDecoder);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.decodedUrl).toBe(PASSPORT_URL);
    }
  });
});

describe("QR download safety – scan failures", () => {
  it("blocks download when decoder returns null (corrupt QR)", () => {
    const result = validateQrFromImageData(
      makeImageData(10, 10),
      "https://example.com/p/abc",
      () => null,
    );
    expect(result.ok).toBe(false);
    if (result.ok === false) expect(result.reason).toBe("scan_failed");
  });

  it("blocks download with default decoder (no decoder injected)", () => {
    // The default decoder is a no-op that returns null
    const result = validateQrFromImageData(
      makeImageData(10, 10),
      "https://example.com/p/abc",
    );
    expect(result.ok).toBe(false);
    if (result.ok === false) expect(result.reason).toBe("scan_failed");
  });

  it("blocks download when decoder throws an error", () => {
    const throwingDecoder: QrDecoder = () => {
      throw new Error("Decoder crash");
    };
    // The function should either catch or propagate — either way, no download
    expect(() => {
      validateQrFromImageData(makeImageData(10, 10), "https://example.com", throwingDecoder);
    }).toThrow();
  });
});

describe("QR download safety – edge cases", () => {
  it("blocks HTTP downgrade (expected HTTPS, QR encodes HTTP)", () => {
    const httpDecoder: QrDecoder = () => ({
      data: "http://digital-product-passports.example.com/p/abc123",
    });
    const result = validateQrFromImageData(
      makeImageData(10, 10),
      "https://digital-product-passports.example.com/p/abc123",
      httpDecoder,
    );
    expect(result.ok).toBe(false);
  });

  it("blocks case-manipulated URLs", () => {
    const caseDecoder: QrDecoder = () => ({
      data: "https://Digital-Product-Passports.example.com/p/abc123",
    });
    const result = validateQrFromImageData(
      makeImageData(10, 10),
      "https://digital-product-passports.example.com/p/abc123",
      caseDecoder,
    );
    // Strict string equality means case differences are caught
    expect(result.ok).toBe(false);
  });

  it("blocks URLs with unicode homoglyph attacks", () => {
    // Using Cyrillic 'а' (U+0430) instead of Latin 'a'
    const homoglyphDecoder: QrDecoder = () => ({
      data: "https://digit\u0430l-product-passports.example.com/p/abc123",
    });
    const result = validateQrFromImageData(
      makeImageData(10, 10),
      "https://digital-product-passports.example.com/p/abc123",
      homoglyphDecoder,
    );
    expect(result.ok).toBe(false);
  });

  it("blocks empty string decoded from QR", () => {
    const emptyDecoder: QrDecoder = () => ({ data: "" });
    const result = validateQrFromImageData(
      makeImageData(10, 10),
      "https://example.com/p/abc",
      emptyDecoder,
    );
    expect(result.ok).toBe(false);
  });

  it("handles URLs with special characters correctly", () => {
    const specialUrl = "https://example.com/p/abc%20def?lang=fr&type=wine";
    const decoder: QrDecoder = () => ({ data: specialUrl });
    const result = validateQrFromImageData(makeImageData(10, 10), specialUrl, decoder);
    expect(result.ok).toBe(true);
  });
});
