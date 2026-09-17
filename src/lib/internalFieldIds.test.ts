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

function readEdgeFunctionIds(): string[] {
  const file = readFileSync(
    resolve(process.cwd(), 'supabase/functions/get-public-passport/index.ts'),
    'utf-8',
  );
  const match = file.match(/const INTERNAL_FIELD_IDS = \[([\s\S]*?)\]/);
  expect(match, 'INTERNAL_FIELD_IDS array not found in edge function').toBeTruthy();
  return [...match![1].matchAll(/"([^"]+)"/g)].map((m) => m[1]).sort();
}

describe('INTERNAL_FIELD_IDS stays in sync with the templates', () => {
  it('lists every question marked internal: true', () => {
    expect(readEdgeFunctionIds()).toEqual(collectInternalIds());
  });

  it('does not include the intentionally public toy certificate url', () => {
    expect(readEdgeFunctionIds()).not.toContain('notified_body_certificate_url');
  });

  it('finds at least the known internal document fields', () => {
    const ids = collectInternalIds();
    ['audit_certificate_file', 'lca_report_file', 'test_report_file', 'claims_evidence_file', 'eu_doc_upload', 'technical_documentation_upload'].forEach(
      (id) => expect(ids).toContain(id),
    );
  });
});
