// Open-Label Digital Product Passport Engine
// Copyright (C) 2026 Open-Label.eu
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program includes additional attribution requirements.
// See the LICENSE and NOTICE files for details.

export type QrDecodeResult = { data: string };

export type QrDecoder = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
) => QrDecodeResult | null;

export type QrValidationResult =
  | { ok: true; decodedUrl: string }
  | { ok: false; reason: "scan_failed" | "url_mismatch"; decodedUrl?: string };

/**
 * Validate that a QR code decodes and matches the expected URL.
 * Kept as a pure function so it can be covered by unit tests.
 *
 * The default decoder is a no-op (returns null) since real decoding now
 * happens via zxing-wasm / BarcodeDetector on the server side.
 * In production the caller should pass a real decoder or use decodeQrFromDataUrl directly.
 */
export function validateQrFromImageData(
  imageData: ImageData,
  expectedUrl: string,
  decoder: QrDecoder = () => null,
): QrValidationResult {
  const scanned = decoder(imageData.data, imageData.width, imageData.height);
  if (!scanned) return { ok: false, reason: "scan_failed" };
  if (scanned.data !== expectedUrl) {
    return { ok: false, reason: "url_mismatch", decodedUrl: scanned.data };
  }
  return { ok: true, decodedUrl: scanned.data };
}
