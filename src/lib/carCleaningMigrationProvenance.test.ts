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
const policyTag = '0001_require_car_cleaning_save_gateway';
const policyPath = 'supabase/migrations/20260910120000_require_car_cleaning_save_gateway.sql';
const policyMirrorPath = `drizzle/migrations/${policyTag}.sql`;
const reviewedMigrations = [
  { tag: historyTag, originalPath, mirrorPath, sha256: deployedHistorySha256, idx: 0, when: 1789836088900, label: 'history' },
  {
    tag: policyTag, originalPath: policyPath, mirrorPath: policyMirrorPath,
    sha256: '3bf875bca2a70a80ba88f34248e68bb40c6b33bb47adcada3579e126e93b5f75',
    idx: 1, when: 1789837534644, label: 'gateway policy',
  },
];
type JournalEntry = { idx: number; version: string; when: number; tag: string; breakpoints: boolean };
type Journal = { version: string; dialect: string; entries: JournalEntry[] };
type ArtifactReader = (path: string) => Buffer;
const readRepository: ArtifactReader = path => readFileSync(resolve(process.cwd(), path));

// These are immutable deployment artifacts. Future changes belong in a new migration.
function verifyMigrationProvenance(read: ArtifactReader) {
  const journal: Journal = JSON.parse(read(journalPath).toString('utf8'));
  if (journal.version !== '7' || journal.dialect !== 'postgresql' || !Array.isArray(journal.entries)) {
    throw new Error('Drizzle journal must retain its PostgreSQL version 7 format');
  }
  for (const migration of reviewedMigrations) {
    if (journal.entries.filter(entry => entry.tag === migration.tag).length !== 1) {
      throw new Error(`Drizzle journal must reference ${migration.tag} exactly once`);
    }
    const entry = journal.entries[migration.idx];
    if (entry?.tag !== migration.tag || entry.idx !== migration.idx || entry.when !== migration.when
      || entry.version !== '7' || entry.breakpoints !== true) {
      throw new Error(`Drizzle journal provenance mismatch for ${migration.tag}`);
    }
    const referencedPath = `drizzle/migrations/${entry.tag}.sql`;
    for (const path of [migration.originalPath, referencedPath]) {
      const digest = createHash('sha256').update(read(path)).digest('hex');
      if (digest !== migration.sha256) throw new Error(`${path}: deployed ${migration.label} SHA256 mismatch`);
    }
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

function changedJournal(change: (journal: Journal) => void): ArtifactReader {
  const journal: Journal = JSON.parse(readRepository(journalPath).toString('utf8'));
  change(journal);
  return fixtureReader({ [journalPath]: Buffer.from(JSON.stringify(journal)) });
}

describe('deployed car cleaning migration provenance', () => {
  it('retains the reviewed bytes in both migration tracks and the ordered journal provenance', () => {
    expect(() => verifyMigrationProvenance(readRepository)).not.toThrow();
  });

  it.each(reviewedMigrations.flatMap(migration => [migration.originalPath, migration.mirrorPath]
    .map(path => ({ path, label: migration.label }))))('detects an altered deployed artifact at $path', ({ path, label }) => {
    const changed = Buffer.concat([readRepository(path), Buffer.from('\n-- Altered migration fixture.\n')]);
    const read = fixtureReader({ [path]: changed });
    expect(() => verifyMigrationProvenance(read)).toThrow(`${path}: deployed ${label} SHA256 mismatch`);
  });

  it.each(reviewedMigrations)('rejects a synchronized $label rewrite even when both copies match', ({ originalPath, mirrorPath, label }) => {
    const changed = Buffer.concat([readRepository(originalPath), Buffer.from('\n-- Synchronized rewrite fixture.\n')]);
    const read = fixtureReader({ [originalPath]: changed, [mirrorPath]: changed });
    expect(() => verifyMigrationProvenance(read)).toThrow(`${originalPath}: deployed ${label} SHA256 mismatch`);
  });

  it.each(reviewedMigrations)('detects a journal that no longer references $tag', ({ tag }) => {
    const read = changedJournal(journal => {
      journal.entries = journal.entries.map(entry => entry.tag === tag ? { ...entry, tag: 'unreviewed_migration' } : entry);
    });
    expect(() => verifyMigrationProvenance(read)).toThrow(`Drizzle journal must reference ${tag} exactly once`);
  });

  it.each(reviewedMigrations)('rejects duplicate journal references to $tag', ({ tag }) => {
    const read = changedJournal(journal => {
      journal.entries.push({ ...journal.entries.find(entry => entry.tag === tag)!, idx: 2, when: 1789837534645 });
    });
    expect(() => verifyMigrationProvenance(read)).toThrow(`Drizzle journal must reference ${tag} exactly once`);
  });

  it.each(reviewedMigrations)('rejects a changed deployment timestamp for $tag', ({ tag }) => {
    const read = changedJournal(journal => { journal.entries.find(entry => entry.tag === tag)!.when += 1; });
    expect(() => verifyMigrationProvenance(read)).toThrow(`Drizzle journal provenance mismatch for ${tag}`);
  });

  it('rejects a policy migration moved before its deployed history predecessor', () => {
    const read = changedJournal(journal => { journal.entries.reverse(); });
    expect(() => verifyMigrationProvenance(read)).toThrow(`Drizzle journal provenance mismatch for ${historyTag}`);
  });

  it('rejects a rewritten policy journal identity', () => {
    const read = changedJournal(journal => { journal.entries.find(entry => entry.tag === policyTag)!.idx = 0; });
    expect(() => verifyMigrationProvenance(read)).toThrow(`Drizzle journal provenance mismatch for ${policyTag}`);
  });

  it('allows later forward migrations without rewriting either deployed entry', () => {
    const read = changedJournal(journal => {
      journal.entries.push({ idx: 2, version: '7', when: 1789837534645, tag: '0002_future_forward_migration', breakpoints: true });
    });
    expect(() => verifyMigrationProvenance(read)).not.toThrow();
  });
});
