

## Add duplicate JSON key detection test

### What
Create `src/i18n/locales/duplicateKeys.test.ts` — a Vitest test that reads each of the 24 locale `.json` files as raw text and detects duplicate top-level keys. This catches the known `"translation"` duplicate (lines 2-4 vs lines 532-549 in `en.json`) and prevents future regressions.

### How
- Use `fs.readFileSync` + `path.resolve` to read each `.json` file as a string
- Use a regex to extract all top-level keys (keys at 2-space indent: `"keyName":`)
- Count occurrences; fail if any key appears more than once
- Test each of the 24 locale files via `it.each`

### New file: `src/i18n/locales/duplicateKeys.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const localeDir = path.resolve(__dirname);
const localeCodes = [
  "bg","cs","da","de","el","en","es","et","fi","fr",
  "ga","hr","hu","it","lt","lv","mt","nl","pl","pt",
  "ro","sk","sl","sv",
];

function findDuplicateTopLevelKeys(jsonString: string): string[] {
  const seen = new Map<string, number>();
  const duplicates: string[] = [];
  // Match top-level keys: exactly 2-space indent followed by quoted key
  const regex = /^  "([^"]+)":/gm;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(jsonString)) !== null) {
    const key = match[1];
    const count = (seen.get(key) || 0) + 1;
    seen.set(key, count);
    if (count === 2) duplicates.push(key);
  }
  return duplicates;
}

describe("Locale files: no duplicate JSON keys", () => {
  it.each(localeCodes)("locale '%s' should have no duplicate top-level keys", (code) => {
    const filePath = path.join(localeDir, `${code}.json`);
    const content = fs.readFileSync(filePath, "utf-8");
    const duplicates = findDuplicateTopLevelKeys(content);
    expect(
      duplicates,
      `${code}.json has duplicate top-level keys: ${duplicates.join(", ")}. ` +
      `JSON.parse silently drops the first occurrence — merge them manually.`
    ).toHaveLength(0);
  });
});
```

### Behavior
- Catches the existing `"translation"` duplicate in en.json and any other affected locales
- Acts as a guardrail — fails the build with a clear message telling you which key is duplicated
- Does not modify any locale files, tests, or thresholds

