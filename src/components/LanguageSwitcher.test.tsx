import { describe, it, expect } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n, { supportedLanguages } from '@/i18n/config';
import { LanguageSwitcher } from './LanguageSwitcher';

describe('LanguageSwitcher', () => {
  it.each(supportedLanguages)('names the language control in $code', async ({ code }) => {
    const localizedLabel = i18n.getResource(code, 'translation', 'common.language');
    expect(localizedLabel).toEqual(expect.any(String));
    expect(localizedLabel.trim()).not.toBe('');
    await i18n.changeLanguage(code);

    render(<I18nextProvider i18n={i18n}><LanguageSwitcher /></I18nextProvider>);

    expect(screen.getByRole('combobox', { name: localizedLabel })).toBeInTheDocument();
  });

  it('updates the accessible name when the active language changes', async () => {
    await i18n.changeLanguage('en');
    render(<I18nextProvider i18n={i18n}><LanguageSwitcher /></I18nextProvider>);
    expect(screen.getByRole('combobox', { name: 'Language' })).toBeInTheDocument();

    await act(() => i18n.changeLanguage('fr'));

    expect(screen.getByRole('combobox', { name: 'Langue' })).toBeInTheDocument();
  });
});
