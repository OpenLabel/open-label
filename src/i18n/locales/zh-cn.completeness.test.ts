/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * See LICENSE and NOTICE files for details.
 *
 * Strict completeness gate for Simplified Chinese (zh-CN).
 * The build MUST fail if any English key is missing or empty in zh-CN.json,
 * or if a value is byte-identical to the English source outside a small
 * allowlist of acronyms / brand names that are intentionally pass-through.
 */

import { describe, it, expect } from "vitest";
import enLocale from "./en.json";
import zhCNLocale from "./zh-CN.json";

type Bag = Record<string, unknown>;

function flatten(obj: Bag, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(out, flatten(v as Bag, key));
    } else if (typeof v === "string") {
      out[key] = v;
    }
  }
  return out;
}

// Values that are intentionally identical to English even in Chinese
// (regulatory acronyms, brand names, proper nouns, units).
const ALLOWED_IDENTICAL = new Set<string>([
  "Open Source",
  "Open-Label",
  "Open-Label.eu",
  "Powered by",
  "GitHub",
  "DPP",
  "QR",
  "QR Code",
  "GS1 Digital Link",
  "EU Safety Gate",
  "EU Safety Gate Portal",
  "Digital Product Passport",
  "https://...",
  "name@company.com",
  "safety@company.com",
  "404",
]);

function isAllowedIdentical(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length <= 2) return true;
  if (ALLOWED_IDENTICAL.has(trimmed)) return true;
  // Pure numbers / punctuation / symbols
  if (/^[\d\s.,;:!?%°/+\-–—()[\]{}=<>*#@&|~^`'"\\€$£¥₹]+$/.test(trimmed)) return true;
  // E-numbers
  if (/^E\d{3,4}[a-z]?$/i.test(trimmed)) return true;
  // Chemical formulas
  if (/^[A-Z][a-z]?\d*([A-Z][a-z]?\d*)*$/.test(trimmed) && trimmed.length <= 12) return true;
  // Unit-only strings
  if (/^\d+(\.\d+)?\s*(kcal|kJ|g\/L|g|ml|L|%|mg|kg|mm|cm|m)$/i.test(trimmed)) return true;
  if (/^(kcal|kJ|g\/L|g|ml|%|Vol)$/i.test(trimmed)) return true;
  return false;
}

describe("Simplified Chinese (zh-CN) completeness", () => {
  const enFlat = flatten(enLocale as Bag);
  const zhFlat = flatten(zhCNLocale as Bag);
  const enKeys = Object.keys(enFlat);
  const zhKeys = Object.keys(zhFlat);

  it("zh-CN.json has the same key set as en.json (no missing, no extra)", () => {
    const missing = enKeys.filter((k) => !(k in zhFlat));
    const extra = zhKeys.filter((k) => !(k in enFlat));
    expect(
      missing,
      `🚨 zh-CN.json is MISSING ${missing.length} keys that exist in en.json:\n  - ${missing.slice(0, 30).join("\n  - ")}`,
    ).toHaveLength(0);
    expect(
      extra,
      `🚨 zh-CN.json has ${extra.length} EXTRA keys not in en.json:\n  - ${extra.slice(0, 30).join("\n  - ")}`,
    ).toHaveLength(0);
  });

  it("every zh-CN value is a non-empty string", () => {
    const empty: string[] = [];
    for (const k of enKeys) {
      const v = zhFlat[k];
      if (typeof v !== "string" || v.trim() === "") empty.push(k);
    }
    expect(
      empty,
      `🚨 zh-CN.json has ${empty.length} empty/non-string values:\n  - ${empty.slice(0, 30).join("\n  - ")}`,
    ).toHaveLength(0);
  });

  it("no zh-CN value is byte-identical to its English source (outside the acronym/brand allowlist)", () => {
    const untranslated: string[] = [];
    for (const k of enKeys) {
      const en = enFlat[k];
      const zh = zhFlat[k];
      if (typeof zh !== "string") continue;
      if (zh === en && !isAllowedIdentical(en)) {
        untranslated.push(k);
      }
    }
    expect(
      untranslated,
      `🚨 zh-CN.json has ${untranslated.length} UNTRANSLATED values still in English:\n  - ${untranslated
        .slice(0, 30)
        .map((k) => `${k}: "${enFlat[k]}"`)
        .join("\n  - ")}`,
    ).toHaveLength(0);
  });
});
