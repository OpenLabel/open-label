import type { AriaAttributes } from 'react';
import type { CarCleaningIssue } from '@/lib/carCleaning';

export function carCleaningErrorId(issue: CarCleaningIssue, index: number): string {
  return `car-cleaning-error-${issue.field}-${index}`;
}

export function carCleaningValidationAttributes(issues: readonly CarCleaningIssue[], field: string): Pick<AriaAttributes, 'aria-invalid' | 'aria-describedby'> {
  const errorIds = issues.flatMap((issue, index) => issue.field === field ? [carCleaningErrorId(issue, index)] : []);
  return errorIds.length > 0 ? { 'aria-invalid': true, 'aria-describedby': errorIds.join(' ') } : {};
}
