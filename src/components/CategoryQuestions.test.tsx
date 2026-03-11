import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

import { CategoryQuestions } from './CategoryQuestions';

describe('CategoryQuestions', () => {
  it('renders without crashing for battery category', () => {
    const { container } = render(
      <CategoryQuestions category="battery" data={{}} onChange={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('renders without crashing for textiles category', () => {
    const { container } = render(
      <CategoryQuestions category="textiles" data={{}} onChange={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('renders without crashing for electronics category', () => {
    const { container } = render(
      <CategoryQuestions category="electronics" data={{}} onChange={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('renders without crashing for other category', () => {
    const { container } = render(
      <CategoryQuestions category="other" data={{}} onChange={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('renders without crashing for tires category', () => {
    const { container } = render(
      <CategoryQuestions category="tires" data={{}} onChange={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });
});
