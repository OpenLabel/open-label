import QrScanner from "qr-scanner";

/**
 * Decode a QR code from a base64 data URL using a multi-strategy approach
 * with image preprocessing for curved/scratched labels:
 *   1. Native BarcodeDetector API (Chrome/Edge — OS-level, most robust)
 *   2. qr-scanner (ZXing-based fallback)
 *   3. Retry both with preprocessed images (grayscale, contrast boost, downscale)
 *
 * Returns the decoded string (typically a URL) or null if no QR code found.
 * Runs entirely client-side.
 */
export async function decodeQrFromDataUrl(dataUrl: string): Promise<string | null> {
  try {
    const img = await loadImage(dataUrl);

    // Attempt 1: Original image
    const original = await tryAllDecoders(img, "original");
    if (original) return original;

    // Attempt 2: Grayscale + contrast-boosted version
    const enhanced = await createEnhancedCanvas(img);
    if (enhanced) {
      const enhancedResult = await tryAllDecoders(enhanced, "enhanced");
      if (enhancedResult) return enhancedResult;
    }

    // Attempt 3: Downscaled version (can help with noisy high-res images)
    const downscaled = await createDownscaledCanvas(img, 800);
    if (downscaled) {
      const downscaledResult = await tryAllDecoders(downscaled, "downscaled");
      if (downscaledResult) return downscaledResult;
    }

    // Attempt 4: Heavily sharpened + binarized version
    const binarized = await createBinarizedCanvas(img);
    if (binarized) {
      const binResult = await tryAllDecoders(binarized, "binarized");
      if (binResult) return binResult;
    }

    console.log("No QR code found by any client-side method after all preprocessing attempts");
    return null;
  } catch (error) {
    console.warn("Client-side QR decode failed:", error);
    return null;
  }
}

async function tryAllDecoders(
  source: HTMLImageElement | HTMLCanvasElement,
  label: string,
): Promise<string | null> {
  // Strategy 1: Native BarcodeDetector
  const nativeResult = await tryBarcodeDetector(source);
  if (nativeResult) {
    console.log(`QR decoded via BarcodeDetector (${label}):`, nativeResult);
    return nativeResult;
  }

  // Strategy 2: qr-scanner (ZXing)
  const zxingResult = await tryQrScanner(source);
  if (zxingResult) {
    console.log(`QR decoded via qr-scanner (${label}):`, zxingResult);
    return zxingResult;
  }

  return null;
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

async function tryBarcodeDetector(
  source: HTMLImageElement | HTMLCanvasElement,
): Promise<string | null> {
  try {
    if (!("BarcodeDetector" in globalThis)) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const detector = new (globalThis as any).BarcodeDetector({ formats: ["qr_code"] });
    const results = await detector.detect(source);
    if (results?.length > 0 && results[0].rawValue) {
      return results[0].rawValue;
    }
    return null;
  } catch {
    return null;
  }
}

async function tryQrScanner(
  source: HTMLImageElement | HTMLCanvasElement,
): Promise<string | null> {
  try {
    const canvas = toCanvas(source);
    if (!canvas) return null;

    const result = await QrScanner.scanImage(canvas, {
      returnDetailedScanResult: true,
    });
    return result?.data || null;
  } catch {
    return null;
  }
}

/** Convert an image or canvas to a canvas element */
function toCanvas(source: HTMLImageElement | HTMLCanvasElement): HTMLCanvasElement | null {
  if (source instanceof HTMLCanvasElement) return source;
  const canvas = document.createElement("canvas");
  canvas.width = source.naturalWidth;
  canvas.height = source.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0);
  return canvas;
}

/** Create a grayscale + contrast-boosted version of the image */
async function createEnhancedCanvas(img: HTMLImageElement): Promise<HTMLCanvasElement | null> {
  const canvas = document.createElement("canvas");
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // Convert to grayscale and boost contrast
  for (let i = 0; i < data.length; i += 4) {
    // Luminance
    let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    // Contrast boost (factor 1.8, centered on 128)
    gray = ((gray - 128) * 1.8) + 128;
    gray = Math.max(0, Math.min(255, gray));
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/** Create a downscaled version of the image */
async function createDownscaledCanvas(
  img: HTMLImageElement,
  maxDim: number,
): Promise<HTMLCanvasElement | null> {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (w <= maxDim && h <= maxDim) return null; // Already small enough

  const scale = maxDim / Math.max(w, h);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Create a binarized (black & white threshold) version for maximum contrast */
async function createBinarizedCanvas(img: HTMLImageElement): Promise<HTMLCanvasElement | null> {
  const canvas = document.createElement("canvas");
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // Compute adaptive threshold using mean luminance
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  const mean = sum / (data.length / 4);
  // Use a threshold slightly below mean to favor dark modules
  const threshold = mean * 0.85;

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const val = gray < threshold ? 0 : 255;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
