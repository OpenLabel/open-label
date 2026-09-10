import { describe, expect, it } from 'vitest';
import { categoryList, getTemplate } from './index';
import type { ProductCategory } from '@/types/passport';

describe('Car cleaning products registration', () => {
  it('is a selectable, dedicated category', () => {
    expect(categoryList.some(c => c.value === ('car_cleaning' as ProductCategory))).toBe(true);
    expect(getTemplate('car_cleaning' as ProductCategory).id).toBe('car_cleaning');
  });

  it('collects intended function and separate chemical assessments', () => {
    const ids = getTemplate('car_cleaning' as ProductCategory).sections.flatMap(s => s.questions.map(q => q.id));
    expect(ids).toEqual(expect.arrayContaining(['product_kind', 'detergent_scope', 'biocidal_claims', 'clp_classification', 'pcn_applicability', 'sds_requirement']));
  });

  it('does not add CE or require two universal EU representatives', () => {
    const template = getTemplate('car_cleaning' as ProductCategory);
    expect(template.getRequiredLogos?.({})).toEqual([]);
    const fields = template.sections.flatMap(s => s.questions);
    expect(fields.some(q => /ce_mark|eu_responsible_person/.test(q.id))).toBe(false);
  });
});
