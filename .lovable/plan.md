

# Cleanup: Per-Language Translation Exception Allowlist

## Problem

The current `isLegitimateMatch` function in `audit.test.ts` uses a global `internationalTerms` list that blanket-allows 20 English words (like "Password", "Salt", "Vintage", "Error") to be identical across ALL 23 non-English locales. This is wrong -- "Password" is only legitimately "Password" in Italian and Maltese, not in German ("Passwort") or French ("Mot de passe").

## Solution

Replace the global `internationalTerms` array with a per-language map: `Record<string, string[]>` where each language code lists only the English values that are genuinely identical in that language.

The `isLegitimateMatch` function signature changes to accept a `langCode` parameter so it can check language-specific exceptions.

## Data: Per-Language Allowlist

Based on a full audit of the actual locale files, here are the legitimate English-identical values per language:

| Language | Legitimately identical values |
|----------|-------------------------------|
| bg | "Open Source" |
| cs | "Open Source" |
| da | "Open Source" |
| de | "Open Source" |
| el | "Open Source", "Email" |
| es | "Open Source", "Manual" |
| et | "Open Source" |
| fi | "Open Source" |
| fr | "Open Source", "Volume" |
| ga | "Open Source" |
| hr | "Open Source" |
| hu | "Open Source" |
| it | "Open Source", "Email", "Password", "Volume" |
| lt | "Open Source" |
| lv | "Open Source" |
| mt | "Open Source", "Email", "Password", "Powered by" |
| nl | "Open Source", "Volume" |
| pl | "Open Source" |
| pt | "Open Source", "Volume", "Manual" |
| ro | "Open Source", "Manual" |
| sk | "Open Source" |
| sl | "Open Source" |
| sv | "Open Source" |

"Open Source" is universal (truly the same term in all EU languages). Everything else is per-language only.

## Technical Changes

### File: `src/i18n/locales/audit.test.ts`

1. **Add per-language exception map** (replaces `internationalTerms`):

```typescript
const perLanguageAllowedValues: Record<string, string[]> = {
  bg: ["Open Source"],
  cs: ["Open Source"],
  da: ["Open Source"],
  de: ["Open Source"],
  el: ["Open Source", "Email"],
  es: ["Open Source", "Manual"],
  et: ["Open Source"],
  fi: ["Open Source"],
  fr: ["Open Source", "Volume"],
  ga: ["Open Source"],
  hr: ["Open Source"],
  hu: ["Open Source"],
  it: ["Open Source", "Email", "Password", "Volume"],
  lt: ["Open Source"],
  lv: ["Open Source"],
  mt: ["Open Source", "Email", "Password", "Powered by"],
  nl: ["Open Source", "Volume"],
  pl: ["Open Source"],
  pt: ["Open Source", "Volume", "Manual"],
  ro: ["Open Source", "Manual"],
  sk: ["Open Source"],
  sl: ["Open Source"],
  sv: ["Open Source"],
};
```

2. **Update `isLegitimateMatch` signature** to accept `langCode`:
   - Change from `isLegitimateMatch(key, value)` to `isLegitimateMatch(key, value, langCode)`
   - Replace `internationalTerms.includes(value.trim())` with `(perLanguageAllowedValues[langCode] || []).includes(value.trim())`
   - Remove the global `internationalTerms` array entirely
   - Remove the global `brandNames` array (move "Powered by" into mt's per-language list, "GitHub" and "Digital Product Passport" into `technicalTerms`)

3. **Update all call sites** of `isLegitimateMatch` to pass the language code:
   - In the audit report loop (line 158): `isLegitimateMatch(key, enFlat[key], code)`
   - In the strict test (line 269): `isLegitimateMatch(key, enFlat[key], code)`

### No other files change
This is purely a test-level refinement. No locale JSON files or components are modified.

## Outcome

- Any locale that currently has "Password" as "Password" (and shouldn't) will be flagged as untranslated
- If a locale legitimately uses the English word (e.g., Italian uses "Password"), it passes
- Adding a new exception requires explicitly listing it for the specific language, not a blanket global pass
- The allowlist is easy to audit: you can see at a glance exactly which English words each language accepts

