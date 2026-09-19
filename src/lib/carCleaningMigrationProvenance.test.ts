import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const deployedHistorySha256 = 'b25c496ccc91b92f7804e87bf9a979a77cf5e928539c488c4b10500799dc12c9';
const originalPath = 'supabase/migrations/20260910110000_car_cleaning_passport_history.sql';
const historyTag = '0000_car_cleaning_passport_history';
const mirrorPath = `drizzle/migrations/${historyTag}.sql`;
const journalPath = 'drizzle/migrations/meta/_journal.json';
type ArtifactReader = (path: string) => Buffer;
const readRepository: ArtifactReader = path => readFileSync(resolve(process.cwd(), path));

// These are immutable deployment artifacts. Future changes belong in a new migration.
function verifyHistoryProvenance(read: ArtifactReader) {
  const journal = JSON.parse(read(journalPath).toString('utf8'));
  if (journal.dialect !== 'postgresql' || !Array.isArray(journal.entries)
    || journal.entries.filter((entry: { tag?: string }) => entry.tag === historyTag).length !== 1) {
    throw new Error(`Drizzle journal must reference ${historyTag} exactly once`);
  }
  const entry = journal.entries.find((candidate: { tag?: string }) => candidate.tag === historyTag);
  const referencedPath = `drizzle/migrations/${entry.tag}.sql`;
  for (const path of [originalPath, referencedPath]) {
    const digest = createHash('sha256').update(read(path)).digest('hex');
    if (digest !== deployedHistorySha256) throw new Error(`${path}: deployed history SHA256 mismatch`);
  }
}

const fixtureDirectories: string[] = [];
function fixtureReader(overrides: Record<string, Buffer>): ArtifactReader {
  const directory = mkdtempSync(join(tmpdir(), 'car-cleaning-provenance-'));
  fixtureDirectories.push(directory);
  const paths = new Map<string, string>();
  Object.entries(overrides).forEach(([path, bytes], index) => {
    const fixturePath = join(directory, String(index));
    writeFileSync(fixturePath, bytes);
    paths.set(path, fixturePath);
  });
  return path => paths.has(path) ? readFileSync(paths.get(path)!) : readRepository(path);
}

afterEach(() => {
  for (const directory of fixtureDirectories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe('deployed car cleaning history migration provenance', () => {
  it('retains the reviewed bytes in both migration tracks and the journal reference', () => {
    expect(() => verifyHistoryProvenance(readRepository)).not.toThrow();
  });

  it.each([originalPath, mirrorPath])('detects an altered deployed artifact at %s', path => {
    const changed = Buffer.concat([readRepository(path), Buffer.from('\n-- Altered migration fixture.\n')]);
    const read = fixtureReader({ [path]: changed });
    expect(() => verifyHistoryProvenance(read)).toThrow(`${path}: deployed history SHA256 mismatch`);
  });

  it('rejects a synchronized rewrite even when both copies still match each other', () => {
    const changed = Buffer.concat([readRepository(originalPath), Buffer.from('\n-- Synchronized rewrite fixture.\n')]);
    const read = fixtureReader({ [originalPath]: changed, [mirrorPath]: changed });
    expect(() => verifyHistoryProvenance(read)).toThrow(`${originalPath}: deployed history SHA256 mismatch`);
  });

  it('detects a journal that no longer references the reviewed migration file', () => {
    const journal = JSON.parse(readRepository(journalPath).toString('utf8'));
    journal.entries = journal.entries.map((entry: { tag: string }) => entry.tag === historyTag
      ? { ...entry, tag: '0000_unreviewed_history' } : entry);
    const read = fixtureReader({ [journalPath]: Buffer.from(JSON.stringify(journal)) });
    expect(() => verifyHistoryProvenance(read)).toThrow(`Drizzle journal must reference ${historyTag} exactly once`);
  });
});
