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
