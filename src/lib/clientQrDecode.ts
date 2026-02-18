import jsQR from "jsqr";

/**
 * Decode a QR code from a base64 data URL using the browser Canvas API + jsQR.
 * Returns the decoded string (typically a URL) or null if no QR code found.
 *
 * This runs entirely client-side, avoiding the memory limits of edge functions.
 */
export async function decodeQrFromDataUrl(dataUrl: string): Promise<string | null> {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image for QR decode"));
      img.src = dataUrl;
    });

    // Use an off-screen canvas to get pixel data
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const result = jsQR(imageData.data, imageData.width, imageData.height);
    if (result?.data) {
      console.log("Client-side QR decoded:", result.data);
      return result.data;
    }

    return null;
  } catch (error) {
    console.warn("Client-side QR decode failed:", error);
    return null;
  }
}
