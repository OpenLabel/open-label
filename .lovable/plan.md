

## Remove Dead Code & Verify Server-Side QR Config

### What's happening now

- `src/lib/clientQrDecode.ts` is **dead code** — never imported anywhere in the project
- The `qr-scanner` npm package (~400KB) is installed solely for this dead file
- The server-side QR decoding in `wine-label-ocr/index.ts` **already uses all the "try hard" options**: `tryHarder: true`, `tryRotate: true`, `tryInvert: true`, `tryDownscale: true`
- The comment in `src/lib/qrValidation.ts` (line 18) still references `qr-scanner`

### What needs to change

**No server-side changes needed** — the edge function already has all zxing-wasm aggressive detection options enabled.

**Dead code removal:**

1. **Delete `src/lib/clientQrDecode.ts`** — entire file, never imported
2. **Remove `qr-scanner` from `package.json`** — no longer needed
3. **Update comment in `src/lib/qrValidation.ts`** (line 18) — change "qr-scanner / BarcodeDetector" to "zxing-wasm / BarcodeDetector" to reflect the actual server-side implementation

### Files changed

| File | Action |
|------|--------|
| `src/lib/clientQrDecode.ts` | Delete |
| `package.json` | Remove `qr-scanner` dependency |
| `src/lib/qrValidation.ts` | Update comment on line 18 |

### Server-side confirmation

The edge function at `supabase/functions/wine-label-ocr/index.ts` (lines 456-463) already has:
```text
tryHarder: true
tryRotate: true
tryInvert: true
tryDownscale: true
formats: ["QRCode"]
```

No server-side changes required.

