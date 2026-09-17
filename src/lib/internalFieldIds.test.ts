import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { templates } from '@/templates';
import type { TemplateQuestion } from '@/templates/base';

function collectInternalIds(): string[] {
  const ids = new Set<string>();
  Object.values(templates).forEach((template) => {
    template.sections.forEach((section) => {
      section.questions.forEach((q: TemplateQuestion) => {
        if (q.internal === true) ids.add(q.id);
      });
    });
  });
  return [...ids].sort();
}

function readEdgeFunctionList(name: string): string[] {
  const file = readFileSync(
    resolve(process.cwd(), 'supabase/functions/get-public-passport/index.ts'),
    'utf-8',
  );
  const match = file.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\]`));
  expect(match, `${name} array not found in edge function`).toBeTruthy();
  return [...match![1].matchAll(/"([^"]+)"/g)].map((m) => m[1]).sort();
}

function readEdgeFunctionIds(): string[] {
  return [
    ...readEdgeFunctionList('INTERNAL_FIELD_IDS'),
    ...readEdgeFunctionList('OUT_OF_SCOPE_INTERNAL_FIELD_IDS'),
  ].sort();
}

describe('INTERNAL_FIELD_IDS stays in sync with the templates', () => {
  it('covers every question marked internal: true via the union of in-scope and out-of-scope lists', () => {
    // The union guarantees a newly added internal field can never be silently
    // forgotten: it must be consciously placed in INTERNAL_FIELD_IDS (stripped
    // from the public response) or OUT_OF_SCOPE_INTERNAL_FIELD_IDS (documented
    // gap pending a decision from the project owner).
    expect(readEdgeFunctionIds()).toEqual(collectInternalIds());
  });

  it('strips only the in-scope Apparel (textiles) internal documents from the public response', () => {
    expect(readEdgeFunctionList('INTERNAL_FIELD_IDS')).toEqual([
      'audit_certificate_file',
      'claims_evidence_file',
      'lca_report_file',
      'test_report_file',
    ]);
  });

  it('records the Toys internal fields as a known, deliberate, out-of-scope gap', () => {
    expect(readEdgeFunctionList('OUT_OF_SCOPE_INTERNAL_FIELD_IDS')).toEqual([
      'eu_doc_upload',
      'technical_documentation_upload',
    ]);
  });

  it('does not include the intentionally public toy certificate url in either list', () => {
    expect(readEdgeFunctionIds()).not.toContain('notified_body_certificate_url');
  });

  it('finds at least the known internal document fields', () => {
    const ids = collectInternalIds();
    ['audit_certificate_file', 'lca_report_file', 'test_report_file', 'claims_evidence_file', 'eu_doc_upload', 'technical_documentation_upload'].forEach(
      (id) => expect(ids).toContain(id),
    );
  });
});
