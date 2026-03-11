import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(() => Promise.resolve({
        data: { translations: { fr: 'Bonjour', de: 'Hallo' } },
        error: null,
      })),
    },
  },
}));

vi.mock('@/components/TranslationButton', () => ({
  EU_LANGUAGES: [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
  ],
}));

import { useAutoTranslate } from './useAutoTranslate';

describe('useAutoTranslate', () => {
  it('returns isTranslating=false initially', () => {
    const { result } = renderHook(() =>
      useAutoTranslate({
        value: '',
        sourceLanguage: 'en',
        onTranslationsGenerated: vi.fn(),
        enabled: true,
      })
    );
    expect(result.current.isTranslating).toBe(false);
  });

  it('marks language as user edited', () => {
    const { result } = renderHook(() =>
      useAutoTranslate({
        value: 'hello',
        sourceLanguage: 'en',
        onTranslationsGenerated: vi.fn(),
        enabled: true,
      })
    );
    act(() => {
      result.current.markAsUserEdited('fr');
    });
    expect(result.current.isUserEdited('fr')).toBe(true);
    expect(result.current.isUserEdited('de')).toBe(false);
  });

  it('does not translate when disabled', () => {
    const onTranslations = vi.fn();
    renderHook(() =>
      useAutoTranslate({
        value: 'hello',
        sourceLanguage: 'en',
        onTranslationsGenerated: onTranslations,
        enabled: false,
      })
    );
    expect(onTranslations).not.toHaveBeenCalled();
  });
});
