import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const fixtures = vi.hoisted(() => ({
  invoke: vi.fn(),
  site: { config: { ai_enabled: true } as { ai_enabled: boolean } | null, loading: false, error: false },
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { functions: { invoke: fixtures.invoke } },
}));
vi.mock('@/hooks/useSiteConfig', () => ({ useSiteConfig: () => fixtures.site }));

beforeEach(() => {
  vi.useFakeTimers();
  fixtures.invoke.mockReset().mockResolvedValue({ data: { translations: { fr: 'Bonjour', de: 'Hallo' } }, error: null });
  fixtures.site.config = { ai_enabled: true };
  fixtures.site.loading = false;
  fixtures.site.error = false;
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

async function debounce() {
  await act(async () => { await vi.advanceTimersByTimeAsync(1600); });
}

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

  it('returns error=null initially', () => {
    const { result } = renderHook(() =>
      useAutoTranslate({
        value: '',
        sourceLanguage: 'en',
        onTranslationsGenerated: vi.fn(),
        enabled: true,
      })
    );
    expect(result.current.error).toBeNull();
  });

  it('exposes retryTranslation function', () => {
    const { result } = renderHook(() =>
      useAutoTranslate({
        value: 'hello',
        sourceLanguage: 'en',
        onTranslationsGenerated: vi.fn(),
        enabled: true,
      })
    );
    expect(typeof result.current.retryTranslation).toBe('function');
  });

  it('marks multiple languages as edited independently', () => {
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
      result.current.markAsUserEdited('de');
    });
    expect(result.current.isUserEdited('fr')).toBe(true);
    expect(result.current.isUserEdited('de')).toBe(true);
  });
});

describe('automatic translation request policy', () => {
  it.each(['disabled', 'loading', 'error', 'missing'])('does not invoke AI when site policy is %s, including manual retry', async (state) => {
    if (state === 'disabled') fixtures.site.config = { ai_enabled: false };
    if (state === 'loading') fixtures.site.loading = true;
    if (state === 'error') fixtures.site.error = true;
    if (state === 'missing') fixtures.site.config = null;
    const { result } = renderHook(() => useAutoTranslate({ value: 'Cleaner', sourceLanguage: 'en', onTranslationsGenerated: vi.fn() }));

    await debounce();
    await act(async () => { await result.current.retryTranslation(); });

    expect(fixtures.invoke).not.toHaveBeenCalled();
  });

  it('starts once when a loaded site policy enables AI', async () => {
    fixtures.site.loading = true;
    const { rerender } = renderHook(() => useAutoTranslate({ value: 'Cleaner', sourceLanguage: 'en', onTranslationsGenerated: vi.fn() }));
    await debounce();
    expect(fixtures.invoke).not.toHaveBeenCalled();
    fixtures.site.loading = false;
    rerender();
    await debounce();
    expect(fixtures.invoke).toHaveBeenCalledTimes(1);
  });

  it('does not automatically retry unchanged failed input on callback or translations identity changes', async () => {
    fixtures.invoke.mockResolvedValue({ data: null, error: new Error('Translation unavailable') });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result, rerender } = renderHook(() => useAutoTranslate({
      value: 'Cleaner', sourceLanguage: 'en', existingTranslations: {}, onTranslationsGenerated: () => {},
    }));
    for (let i = 0; i < 4; i++) {
      await debounce();
      rerender();
    }
    expect(result.current.error).toBe('Translation unavailable');
    expect(fixtures.invoke).toHaveBeenCalledTimes(1);
  });

  it('allows an explicit retry after failure and a new attempt after the source language changes', async () => {
    fixtures.invoke.mockResolvedValueOnce({ data: null, error: new Error('Temporary failure') });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onTranslations = vi.fn();
    const { result, rerender } = renderHook(({ sourceLanguage }) => useAutoTranslate({ value: 'Cleaner', sourceLanguage, onTranslationsGenerated: onTranslations }), { initialProps: { sourceLanguage: 'en' } });
    await debounce();
    await act(async () => { await result.current.retryTranslation(); });
    expect(fixtures.invoke).toHaveBeenCalledTimes(2);
    expect(onTranslations).toHaveBeenCalledTimes(1);
    rerender({ sourceLanguage: 'fr' });
    await debounce();
    expect(fixtures.invoke).toHaveBeenCalledTimes(3);
    expect(fixtures.invoke.mock.calls[2][1].body.sourceLanguage).toBe('fr');
  });

  it('keeps only one request in flight for unchanged input, including explicit retry', async () => {
    let finish!: (value: unknown) => void;
    fixtures.invoke.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const { result, rerender } = renderHook(() => useAutoTranslate({ value: 'Cleaner', sourceLanguage: 'en', onTranslationsGenerated: () => {} }));
    await debounce();
    rerender();
    await debounce();
    act(() => { void result.current.retryTranslation(); });
    expect(fixtures.invoke).toHaveBeenCalledTimes(1);
    await act(async () => { finish({ data: { translations: {} }, error: null }); });
  });

  it('preserves a user translation edited while the request is pending', async () => {
    let finish!: (value: unknown) => void;
    fixtures.invoke.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const onTranslations = vi.fn();
    const { result, rerender } = renderHook(({ translations }) => useAutoTranslate({ value: 'Cleaner', sourceLanguage: 'en', existingTranslations: translations, onTranslationsGenerated: onTranslations }), { initialProps: { translations: {} as Record<string, string> } });
    await debounce();
    act(() => result.current.markAsUserEdited('fr'));
    rerender({ translations: { fr: 'Texte corrigé' } });
    await act(async () => { finish({ data: { translations: { fr: 'AI output', de: 'Reiniger' } }, error: null }); });
    expect(onTranslations).toHaveBeenCalledWith({ fr: 'Texte corrigé', de: 'Reiniger' });
  });

  it('discards a response after its source text changes', async () => {
    let finish!: (value: unknown) => void;
    fixtures.invoke.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const onTranslations = vi.fn();
    const { rerender } = renderHook(({ value }) => useAutoTranslate({ value, sourceLanguage: 'en', onTranslationsGenerated: onTranslations }), { initialProps: { value: 'Old cleaner' } });
    await debounce();
    rerender({ value: 'New cleaner' });
    await act(async () => { finish({ data: { translations: { fr: 'Old translation' } }, error: null }); });
    expect(onTranslations).not.toHaveBeenCalled();
    await debounce();
    expect(fixtures.invoke).toHaveBeenCalledTimes(2);
    await act(async () => { finish({ data: { translations: { fr: 'New translation' } }, error: null }); });
    expect(onTranslations).toHaveBeenCalledWith({ fr: 'New translation' });
  });

  it('does not apply a pending response after AI is disabled', async () => {
    let finish!: (value: unknown) => void;
    fixtures.invoke.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const onTranslations = vi.fn();
    const { rerender } = renderHook(() => useAutoTranslate({ value: 'Cleaner', sourceLanguage: 'en', onTranslationsGenerated: onTranslations }));
    await debounce();
    fixtures.site.config = { ai_enabled: false };
    rerender();
    await act(async () => { finish({ data: { translations: { fr: 'AI output' } }, error: null }); });
    expect(onTranslations).not.toHaveBeenCalled();
  });

  it.each(['input cleared', 'AI disabled'])('retries restored input after a response was discarded because %s', async (reason) => {
    let finish!: (value: unknown) => void;
    fixtures.invoke.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    const onTranslations = vi.fn();
    const { rerender } = renderHook(({ value }) => useAutoTranslate({ value, sourceLanguage: 'en', onTranslationsGenerated: onTranslations }), { initialProps: { value: 'Cleaner' } });
    await debounce();
    if (reason === 'AI disabled') fixtures.site.config = { ai_enabled: false };
    rerender({ value: reason === 'input cleared' ? '' : 'Cleaner' });
    await act(async () => { finish({ data: { translations: { fr: 'Discarded translation' } }, error: null }); });
    expect(onTranslations).not.toHaveBeenCalled();

    fixtures.site.config = { ai_enabled: true };
    rerender({ value: 'Cleaner' });
    await debounce();

    expect(fixtures.invoke).toHaveBeenCalledTimes(2);
    expect(onTranslations).toHaveBeenCalledWith({ fr: 'Bonjour', de: 'Hallo' });
  });

  it.each(['original first', 'intermediate first'])('handles returning to pending original input with overlapping requests: %s', async (order) => {
    const finishes = new Map<string, (value: unknown) => void>();
    fixtures.invoke.mockImplementation((_name, options) => new Promise(resolve => { finishes.set(options.body.text, resolve); }));
    const onTranslations = vi.fn();
    const { result, rerender } = renderHook(({ value }) => useAutoTranslate({ value, sourceLanguage: 'en', onTranslationsGenerated: onTranslations }), { initialProps: { value: 'Original cleaner' } });
    await debounce();
    rerender({ value: 'Intermediate cleaner' });
    await debounce();
    rerender({ value: 'Original cleaner' });
    await debounce();
    expect(fixtures.invoke).toHaveBeenCalledTimes(2);
    const complete = async (value: string) => {
      await act(async () => { finishes.get(value)!({ data: { translations: { fr: value } }, error: null }); });
    };

    if (order === 'intermediate first') {
      await complete('Intermediate cleaner');
      expect(result.current.isTranslating).toBe(true);
      expect(onTranslations).not.toHaveBeenCalled();
    }
    await complete('Original cleaner');
    expect(onTranslations).toHaveBeenCalledExactlyOnceWith({ fr: 'Original cleaner' });
    expect(result.current.isTranslating).toBe(false);
    if (order === 'original first') await complete('Intermediate cleaner');
    expect(onTranslations).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeNull();
  });

  it('keeps curated translations loaded after the empty initial render', async () => {
    const { rerender } = renderHook(({ value, translations }) => useAutoTranslate({ value, sourceLanguage: 'en', existingTranslations: translations, onTranslationsGenerated: vi.fn() }), { initialProps: { value: '', translations: {} as Record<string, string> } });
    rerender({ value: 'Cleaner', translations: { fr: 'Texte validé' } });
    await debounce();
    expect(fixtures.invoke).not.toHaveBeenCalled();
  });
});

it('reports a malformed automatic response without publishing translations', async () => {
  fixtures.invoke.mockResolvedValue({ data: {}, error: null });
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const onTranslations = vi.fn();
  const { result } = renderHook(() => useAutoTranslate({ value: 'Cleaner', sourceLanguage: 'en', onTranslationsGenerated: onTranslations }));
  await debounce();
  expect(onTranslations).not.toHaveBeenCalled();
  expect(result.current.error).toBe('Invalid translation response');
});
