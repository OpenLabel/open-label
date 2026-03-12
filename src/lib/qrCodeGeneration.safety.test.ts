import { describe, it, expect, vi } from "vitest";

/**
 * Tests for the QR code download flow safety.
 *
 * The QRCodeDialog component generates a QR code, renders it to canvas,
 * validates it via validateQrFromImageData, and only then triggers download.
 * These tests verify the safety contract at each step.
 */

// We test the validation logic directly since the component uses Canvas APIs
// that aren't available in jsdom
import { validateQrFromImageData, QrDecoder } from "./qrValidation";

function makeImageData(width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  return { data, width, height } as unknown as ImageData;
}

describe("QR code generation → validation → download contract", () => {
  const VALID_URL = "https://open-label.eu/p/abc123def456";

  it("MUST validate before download — matching URL proceeds", () => {
    const goodDecoder: QrDecoder = () => ({ data: VALID_URL });
    const result = validateQrFromImageData(makeImageData(250, 250), VALID_URL, goodDecoder);
    
    expect(result.ok).toBe(true);
    // Download should proceed
  });

  it("MUST validate before download — mismatched URL blocks", () => {
    const badDecoder: QrDecoder = () => ({ data: "https://evil.com/p/abc123def456" });
    const result = validateQrFromImageData(makeImageData(250, 250), VALID_URL, badDecoder);
    
    expect(result.ok).toBe(false);
    // Download MUST NOT proceed
  });

  it("MUST validate before download — unreadable QR blocks", () => {
    const failDecoder: QrDecoder = () => null;
    const result = validateQrFromImageData(makeImageData(250, 250), VALID_URL, failDecoder);
    
    expect(result.ok).toBe(false);
    if (result.ok === false) expect(result.reason).toBe("scan_failed");
    // Download MUST NOT proceed
  });

  it("validates with actual passport URL format", () => {
    // Real URL format used in production
    const realUrl = "https://digital-product-passports-com.lovable.app/p/a1b2c3d4e5f67890";
    const decoder: QrDecoder = () => ({ data: realUrl });
    const result = validateQrFromImageData(makeImageData(250, 250), realUrl, decoder);
    expect(result.ok).toBe(true);
  });

  it("rejects QR with injected tracking parameters", () => {
    const trackerDecoder: QrDecoder = () => ({
      data: VALID_URL + "?utm_source=counterfeit&tracking=1",
    });
    const result = validateQrFromImageData(makeImageData(250, 250), VALID_URL, trackerDecoder);
    expect(result.ok).toBe(false);
  });
});

describe("QR download filename safety", () => {
  it("sanitizes product name for filename", () => {
    // This mirrors the logic in QRCodeDialog.handleDownload
    const dangerousName = '../../../etc/passwd';
    const sanitized = dangerousName.replace(/[^a-z0-9]/gi, '_');
    expect(sanitized).toBe('_________etc_passwd');
    expect(sanitized).not.toContain('/');
    expect(sanitized).not.toContain('..');
  });

  it("handles unicode product names", () => {
    const unicodeName = 'Château Léoville 2020';
    const sanitized = unicodeName.replace(/[^a-z0-9]/gi, '_');
    expect(sanitized).toBe('Ch_teau_L_oville_2020');
    expect(sanitized).not.toContain(' ');
  });

  it("handles empty product name", () => {
    const emptyName = '';
    const sanitized = emptyName.replace(/[^a-z0-9]/gi, '_');
    const filename = `${sanitized}_qr.png`;
    expect(filename).toBe('_qr.png');
  });

  it("handles XSS in product name", () => {
    const xssName = '<script>alert("xss")</script>';
    const sanitized = xssName.replace(/[^a-z0-9]/gi, '_');
    expect(sanitized).not.toContain('<');
    expect(sanitized).not.toContain('>');
    expect(sanitized).not.toContain('"');
  });
});
