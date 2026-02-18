import QrScanner from "qr-scanner";

/**
 * Decode a QR code from a base64 data URL using a multi-strategy approach:
 *   1. Native BarcodeDetector API (Chrome/Edge — OS-level, most robust)
 *   2. qr-scanner (ZXing-based fallback — handles curved/distorted codes)
 *
 * Returns the decoded string (typically a URL) or null if no QR code found.
 * Runs entirely client-side.
 */
export async function decodeQrFromDataUrl(dataUrl: string): Promise<string | null> {
  try {
    // Load the image element (needed by both strategies)
    const img = await loadImage(dataUrl);

    // Strategy 1: Native BarcodeDetector (available in Chromium browsers)
    const nativeResult = await tryBarcodeDetector(img);
    if (nativeResult) {
      console.log("QR decoded via BarcodeDetector:", nativeResult);
      return nativeResult;
    }

    // Strategy 2: qr-scanner (ZXing-based)
    const zxingResult = await tryQrScanner(img);
    if (zxingResult) {
      console.log("QR decoded via qr-scanner (ZXing):", zxingResult);
      return zxingResult;
    }

    console.log("No QR code found by any client-side method");
    return null;
  } catch (error) {
    console.warn("Client-side QR decode failed:", error);
    return null;
  }
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for QR decode"));
    img.src = dataUrl;
  });
}

async function tryBarcodeDetector(img: HTMLImageElement): Promise<string | null> {
  try {
    if (!("BarcodeDetector" in globalThis)) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const detector = new (globalThis as any).BarcodeDetector({ formats: ["qr_code"] });
    const results = await detector.detect(img);
    if (results?.length > 0 && results[0].rawValue) {
      return results[0].rawValue;
    }
    return null;
  } catch {
    return null;
  }
}

async function tryQrScanner(img: HTMLImageElement): Promise<string | null> {
  try {
    // Use a canvas as the image source for qr-scanner
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);

    const result = await QrScanner.scanImage(canvas, {
      returnDetailedScanResult: true,
    });
    return result?.data || null;
  } catch {
    // qr-scanner throws when no QR code is found
    return null;
  }
}
