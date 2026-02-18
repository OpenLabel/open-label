

# Replace jsQR with qr-scanner (ZXing-based) for Robust QR Detection

## Problem

`jsQR` is a minimal QR decoder that fails on curved, distorted, or low-contrast QR codes -- exactly the kind found on wine bottles. Your test image has a perfectly visible QR code that `jsQR` simply cannot handle.

## Solution

Replace `jsQR` with **`qr-scanner`** (by Nimiq), which uses Google's ZXing library under the hood. ZXing is battle-tested and handles curved surfaces, perspective distortion, and varying contrast far better. The library provides a simple `QrScanner.scanImage()` static method for single-image decoding.

Additionally, we'll add a **multi-strategy approach**: try the browser's native `BarcodeDetector` API first (available in Chrome/Edge, uses the OS-level decoder which is even more robust), then fall back to `qr-scanner`.

## Changes

### 1. Install `qr-scanner`, remove `jsqr`

- Add dependency: `qr-scanner`
- Remove dependency: `jsqr` and `@types/jsqr` (if present)

### 2. Rewrite `src/lib/clientQrDecode.ts`

Replace the jsQR-based implementation with a multi-strategy decoder:

```
Strategy 1: BarcodeDetector API (native, if available)
Strategy 2: QrScanner.scanImage() (ZXing-based fallback)
```

The function signature stays the same (`decodeQrFromDataUrl(dataUrl) => Promise<string | null>`) so `WineAIAutofill.tsx` needs no changes.

### 3. Update `src/lib/qrValidation.ts`

- Remove `jsqr` import
- The `validateQrFromImageData` function uses a dependency-injected `decoder` parameter, so it doesn't need to change structurally. The default decoder parameter will be updated to use `qr-scanner` instead of `jsQR`.
- Since `qr-scanner` uses a different API (`scanImage` takes an image source, not raw pixel data), we'll adjust the default decoder to wrap `qr-scanner`'s static method, or simply keep the DI pattern with the raw-data interface for unit testing (tests already inject their own mock decoder).

### 4. Update `src/lib/qrValidation.test.ts`

- Remove any `jsqr` references
- Tests already use mock decoders, so they should pass as-is

### 5. Update `src/components/wine/WineAIAutofill.tsx`

- No changes needed -- it calls `decodeQrFromDataUrl()` which keeps the same interface

## Technical Detail

```text
Current flow:
  Image -> Canvas -> getImageData -> jsQR(pixels) -> URL or null

New flow:
  Image -> BarcodeDetector.detect(image)  [if available]
        -> QrScanner.scanImage(image)     [ZXing fallback]
        -> URL or null
```

Both strategies work directly with image elements, avoiding the manual canvas pixel extraction step entirely, which also simplifies the code.

## Impact

- Dramatically better QR detection on curved bottle surfaces
- Native `BarcodeDetector` gives near-perfect results in Chrome/Edge
- ZXing fallback covers Firefox/Safari
- No API changes -- drop-in replacement
- All existing tests continue to work (they use mock decoders)

