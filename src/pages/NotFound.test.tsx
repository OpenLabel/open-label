import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

import NotFound from './NotFound';

describe('NotFound page', () => {
  it('renders 404 title', () => {
    render(<MemoryRouter><NotFound /></MemoryRouter>);
    expect(screen.getByText('notFound.title')).toBeInTheDocument();
  });

  it('renders message', () => {
    render(<MemoryRouter><NotFound /></MemoryRouter>);
    expect(screen.getByText('notFound.message')).toBeInTheDocument();
  });

  it('renders return home link', () => {
    render(<MemoryRouter><NotFound /></MemoryRouter>);
    const link = screen.getByText('notFound.returnHome');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/');
  });

  it('logs 404 error to console', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <MemoryRouter initialEntries={['/bogus']}>
        <NotFound />
      </MemoryRouter>
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      '404 Error: User attempted to access non-existent route:',
      '/bogus'
    );
    consoleSpy.mockRestore();
  });
});
