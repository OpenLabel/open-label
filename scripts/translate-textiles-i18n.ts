/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * See LICENSE and NOTICE files for details.
 */

// One-off, resumable translator for the Apparel `textiles.*` locale subtree.
// Usage: bun run scripts/translate-textiles-i18n.ts [fr de ...]

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const LOCALES_DIR = resolve(import.meta.dir, '../src/i18n/locales');
const TARGETS = [
  'bg', 'cs', 'da', 'de', 'el', 'es', 'et', 'fi', 'fr', 'ga', 'hr', 'hu',
  'it', 'lt', 'lv', 'mt', 'nl', 'pl', 'pt', 'ro', 'sk', 'sl', 'sv', 'zh-CN',
] as const;

const LANGUAGE_NAMES: Record<string, string> = {
  bg: 'Bulgarian', cs: 'Czech', da: 'Danish', de: 'German', el: 'Greek',
  es: 'Spanish', et: 'Estonian', fi: 'Finnish', fr: 'French', ga: 'Irish',
  hr: 'Croatian', hu: 'Hungarian', it: 'Italian', lt: 'Lithuanian',
  lv: 'Latvian', mt: 'Maltese', nl: 'Dutch', pl: 'Polish', pt: 'Portuguese',
  ro: 'Romanian', sk: 'Slovak', sl: 'Slovenian', sv: 'Swedish',
  'zh-CN': 'Simplified Chinese',
};

const PROTECTED = [
  '(EU) 2023/988', '(EU) 2024/825', '1007/2011', '(EU) 2019/1020',
  '(EC) 1907/2006', '2025-188', 'ISO 12945-2', 'ISO 105-C06',
  'ISO 105-B02', 'ISO 6330', 'ISO 5077', 'ISO 13935-2', 'ISO 14067',
  'ISO 14040/14044', 'GOTS', 'OEKO-TEX', 'GRS', 'bluesign', 'Fair Trade',
  'amfori BSCI', 'Sedex SMETA', 'SA8000', 'WRAP', 'Higg MSI', 'PEFCR',
  'Refashion', 'DPP', 'ESPR', 'GPSR', 'REACH', 'SVHC', 'RSL', 'EPR', 'PFAS',
  'PFHxA', 'DWR', 'GTIN', 'EAN', 'LCA', 'NFC', 'RFID', 'QR', '30°C', '40°C',
  '60°C', '95°C', '110°C', '150°C', '200°C', 'kg CO2e', 'mg/kg',
  'ST-4412', 'DPP-2026-000184213', 'LOT-2026-03-A', 'CU 123456 GOTS',
  '21.HTR.12345', 'FR123456_01ABCD', 'name@company.com', 'https://…',
  'YYYY-MM-DD',
] as const;

const FORBIDDEN_FIBRE_TERMS = /\b(?:rayon|tencel|spandex|nylon)\b/i;
const CHUNK_SIZE = 36;

type Tree = Record<string, any>;

function load(code: string): Tree {
  return JSON.parse(readFileSync(resolve(LOCALES_DIR, `${code}.json`), 'utf8'));
}

function save(code: string, data: Tree): void {
  writeFileSync(resolve(LOCALES_DIR, `${code}.json`), `${JSON.stringify(data, null, 2)}\n`);
}

function flatten(value: Tree, prefix = '', out: Record<string, string> = {}): Record<string, string> {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child)) flatten(child, path, out);
    else if (typeof child === 'string') out[path] = child;
  }
  return out;
}

function setPath(tree: Tree, path: string, value: string): void {
  const parts = path.split('.');
  let node = tree;
  for (const part of parts.slice(0, -1)) {
    if (!node[part] || typeof node[part] !== 'object') node[part] = {};
    node = node[part];
  }
  node[parts[parts.length - 1]] = value;
}

function requiredProtectedTokens(source: string): string[] {
  return PROTECTED.filter((token) => source.includes(token));
}

function validateValue(key: string, source: string, translated: unknown): asserts translated is string {
  if (typeof translated !== 'string' || !translated.trim()) throw new Error(`${key}: empty translation`);
  for (const token of requiredProtectedTokens(source)) {
    if (!translated.includes(token)) throw new Error(`${key}: protected token changed: ${token}`);
  }
  if (key.startsWith('options.primaryFiber.') && FORBIDDEN_FIBRE_TERMS.test(translated)) {
    throw new Error(`${key}: forbidden brand/US fibre term: ${translated}`);
  }
}

async function translateChunk(code: string, values: Record<string, string>): Promise<Record<string, string>> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error('LOVABLE_API_KEY is not set');
  const language = LANGUAGE_NAMES[code] ?? code;
  const prompt = `You are a professional legal translator specialising in EU apparel and textile labelling.

Translate every JSON VALUE from English to ${language} (${code}). Return ONLY one valid JSON object with the exact same keys. Never translate keys.

LEGAL FIBRE RULE:
- Keys beginning options.primaryFiber are legally prescribed textile fibre names.
- For EU official languages use the exact official name in Regulation (EU) No 1007/2011 Annex I for: cotton, flax/linen, hemp, wool, cashmere, mohair, alpaca, angora, silk, viscose, modal, lyocell, acetate, cupro, polyester, polyamide, acrylic, elastane, polypropylene.
- Never use Rayon, Tencel, Spandex, or Nylon in any language. Use the official equivalents of viscose, lyocell, elastane, and polyamide.
- organic_cotton is the translated qualifier “organic” plus the official cotton name. recycled_polyester is the translated qualifier “recycled” plus the official polyester name.
- Keep cashmere, mohair, alpaca and angora distinct; keep modal distinct from viscose.
- For Simplified Chinese, use standard professional textile-labelling terminology because Annex I has no official Chinese version.

VERBATIM RULE:
- Preserve these identifiers exactly wherever present: ${PROTECTED.join(', ')}.
- Preserve standalone units N and %, all URLs, dates, numbers, punctuation, line breaks, and example codes.
- Translate surrounding prose naturally and professionally. Do not leave ordinary English prose untranslated.
- Certification and scheme names remain exact, but words surrounding them (such as audited/certified) must be translated.
- Do not add explanations, markdown, comments, or alternate translations.

INPUT:
${JSON.stringify(values)}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 12000,
    }),
  });
  if (!response.ok) throw new Error(`AI gateway ${response.status}: ${(await response.text()).slice(0, 300)}`);
  const body: any = await response.json();
  const raw = String(body.choices?.[0]?.message?.content ?? '');
  const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const first = clean.indexOf('{');
  const last = clean.lastIndexOf('}');
  if (first < 0 || last < first) throw new Error('AI response contained no JSON object');
  const result = JSON.parse(clean.slice(first, last + 1)) as Record<string, string>;
  const expected = Object.keys(values).sort();
  const actual = Object.keys(result).sort();
  if (JSON.stringify(expected) !== JSON.stringify(actual)) throw new Error('AI response changed the key set');
  for (const key of expected) validateValue(key, values[key], result[key]);
  return result;
}

async function translateLocale(code: string, english: Record<string, string>): Promise<void> {
  const locale = load(code);
  const current = flatten(locale.textiles ?? {});
  const pending = Object.keys(english).filter((key) => current[key] === english[key]);
  if (pending.length === 0) {
    console.log(`${code}: 0 translated, ${Object.keys(english).length} skipped`);
    return;
  }

  let translatedCount = 0;
  for (let i = 0; i < pending.length; i += CHUNK_SIZE) {
    const keys = pending.slice(i, i + CHUNK_SIZE);
    const input = Object.fromEntries(keys.map((key) => [key, english[key]]));
    const translated = await translateChunk(code, input);
    for (const key of keys) {
      setPath(locale.textiles, key, translated[key]);
      translatedCount += 1;
    }
    save(code, locale);
    console.log(`${code}: ${translatedCount}/${pending.length} translated`);
  }

  const finalKeys = Object.keys(flatten(locale.textiles)).sort();
  const englishKeys = Object.keys(english).sort();
  if (JSON.stringify(finalKeys) !== JSON.stringify(englishKeys)) throw new Error(`${code}: final key set differs`);
  console.log(`${code}: ${translatedCount} translated, ${englishKeys.length - translatedCount} skipped`);
}

async function main(): Promise<void> {
  const requested = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
  const targets = requested.length ? requested : [...TARGETS];
  for (const code of targets) {
    if (!TARGETS.includes(code as (typeof TARGETS)[number])) throw new Error(`Unsupported locale: ${code}`);
  }
  const english = flatten(load('en').textiles);
  if (Object.keys(english).length !== 288) throw new Error(`Expected 288 English Apparel values, found ${Object.keys(english).length}`);
  for (const code of targets) await translateLocale(code, english);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});