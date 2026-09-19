import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

const fixtures = vi.hoisted(() => ({
  invoke: vi.fn(),
  toast: vi.fn(),
  site: { config: { ai_enabled: true } as { ai_enabled: boolean } | null, loading: false, error: false },
}));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { functions: { invoke: fixtures.invoke } } }));
vi.mock('@/hooks/useSiteConfig', () => ({ useSiteConfig: () => fixtures.site }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: fixtures.toast }) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, fallback?: string) => fallback || key }) }));

import { TranslationButton } from './TranslationButton';

beforeEach(() => {
  vi.restoreAllMocks();
  fixtures.toast.mockReset();
  fixtures.invoke.mockReset().mockResolvedValue({ data: { translations: { fr: 'Nettoyant' } }, error: null });
  fixtures.site.config = { ai_enabled: true };
  fixtures.site.loading = false;
  fixtures.site.error = false;
});

describe('TranslationButton AI policy', () => {
  it.each(['disabled', 'loading', 'error', 'missing'])('keeps manual edits available but blocks AI when site policy is %s', (state) => {
    if (state === 'disabled') fixtures.site.config = { ai_enabled: false };
    if (state === 'loading') fixtures.site.loading = true;
    if (state === 'error') fixtures.site.error = true;
    if (state === 'missing') fixtures.site.config = null;
    const onSave = vi.fn();
    render(<TranslationButton value="Cleaner" sourceLanguage="en" onSave={onSave} />);
    fireEvent.click(screen.getByTitle('Manage translations'));
    const generate = screen.getByRole('button', { name: 'Generate with AI' });
    expect(generate).toBeDisabled();
    fireEvent.click(generate);
    fireEvent.change(screen.getByLabelText('Français'), { target: { value: 'Texte manuel' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Translations' }));
    expect(onSave).toHaveBeenCalledWith({ fr: 'Texte manuel' });
    expect(fixtures.invoke).not.toHaveBeenCalled();
  });

  it('generates only after an explicit click when AI is enabled and preserves manual edits', async () => {
    const onSave = vi.fn();
    render(<TranslationButton value="Cleaner" sourceLanguage="en" onSave={onSave} translations={{ de: 'Handbearbeitet' }} />);
    fireEvent.click(screen.getByTitle('Manage translations'));
    expect(fixtures.invoke).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Generate with AI' }));
    await waitFor(() => expect(screen.getByLabelText('Français')).toHaveValue('Nettoyant'));
    fireEvent.click(screen.getByRole('button', { name: 'Save Translations' }));
    expect(onSave).toHaveBeenCalledWith({ de: 'Handbearbeitet', fr: 'Nettoyant' });
    expect(fixtures.invoke).toHaveBeenCalledTimes(1);
  });
});

describe('manual AI response handling', () => {
  it('keeps edits made while an AI request is pending', async () => {
    let finish!: (value: unknown) => void;
    fixtures.invoke.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    render(<TranslationButton value="Cleaner" sourceLanguage="en" onSave={vi.fn()} />);
    fireEvent.click(screen.getByTitle('Manage translations'));
    fireEvent.click(screen.getByRole('button', { name: 'Generate with AI' }));
    fireEvent.change(screen.getByLabelText('Français'), { target: { value: 'Saisie pendant la requête' } });
    finish({ data: { translations: { fr: 'AI output', de: 'Reiniger' } }, error: null });
    await waitFor(() => expect(screen.getByLabelText('Deutsch')).toHaveValue('Reiniger'));
    expect(screen.getByLabelText('Français')).toHaveValue('Saisie pendant la requête');
  });

  it('allows an explicit retry after a failed manual request', async () => {
    fixtures.invoke.mockResolvedValueOnce({ data: null, error: new Error('Temporary failure') });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<TranslationButton value="Cleaner" sourceLanguage="en" onSave={vi.fn()} />);
    fireEvent.click(screen.getByTitle('Manage translations'));
    const generate = screen.getByRole('button', { name: 'Generate with AI' });
    fireEvent.click(generate);
    await waitFor(() => expect(generate).toBeEnabled());
    expect(fixtures.invoke).toHaveBeenCalledTimes(1);
    fireEvent.click(generate);
    await waitFor(() => expect(screen.getByLabelText('Français')).toHaveValue('Nettoyant'));
    expect(fixtures.invoke).toHaveBeenCalledTimes(2);
  });
});

it('reports a malformed AI response without losing editable translations', async () => {
  fixtures.invoke.mockResolvedValue({ data: {}, error: null });
  vi.spyOn(console, 'error').mockImplementation(() => {});
  render(<TranslationButton value="Cleaner" sourceLanguage="en" onSave={vi.fn()} translations={{ fr: 'Texte manuel' }} />);
  fireEvent.click(screen.getByTitle('Manage translations'));
  fireEvent.click(screen.getByRole('button', { name: 'Generate with AI' }));
  await waitFor(() => expect(fixtures.toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' })));
  expect(screen.getByLabelText('Français')).toHaveValue('Texte manuel');
  expect(screen.getByRole('button', { name: 'Generate with AI' })).toBeEnabled();
});

describe('manual translation request lifetime', () => {
  const beginRequest = () => {
    fireEvent.click(screen.getByTitle('Manage translations'));
    fireEvent.click(screen.getByRole('button', { name: 'Generate with AI' }));
  };

  it.each([
    ['source text', { value: 'New cleaner', sourceLanguage: 'en' }],
    ['source language', { value: 'Cleaner', sourceLanguage: 'de' }],
  ])('discards a pending response after its %s changes', async (_change, next) => {
    let finish!: (value: unknown) => void;
    fixtures.invoke.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const { rerender } = render(<TranslationButton value="Cleaner" sourceLanguage="en" onSave={vi.fn()} />);
    beginRequest();
    rerender(<TranslationButton {...next} onSave={vi.fn()} />);

    await act(async () => { finish({ data: { translations: { fr: 'Old AI output' } }, error: null }); });

    expect(screen.getByLabelText('Français')).toHaveValue('');
    expect(fixtures.toast).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Generate with AI' })).toBeEnabled();
  });

  it.each(['disabled', 'loading', 'error', 'missing'])('discards a pending response when site policy becomes %s', async (state) => {
    let finish!: (value: unknown) => void;
    fixtures.invoke.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const { rerender } = render(<TranslationButton value="Cleaner" sourceLanguage="en" onSave={vi.fn()} />);
    beginRequest();
    if (state === 'disabled') fixtures.site.config = { ai_enabled: false };
    if (state === 'loading') fixtures.site.loading = true;
    if (state === 'error') fixtures.site.error = true;
    if (state === 'missing') fixtures.site.config = null;
    rerender(<TranslationButton value="Cleaner" sourceLanguage="en" onSave={vi.fn()} />);

    await act(async () => { finish({ data: { translations: { fr: 'Old AI output' } }, error: null }); });

    expect(screen.getByLabelText('Français')).toHaveValue('');
    expect(fixtures.toast).not.toHaveBeenCalled();
  });

  it('invalidates a closed session even when reopened with the same source', async () => {
    let finish!: (value: unknown) => void;
    fixtures.invoke.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    render(<TranslationButton value="Cleaner" sourceLanguage="en" onSave={vi.fn()} />);
    beginRequest();
    fireEvent.click(screen.getByRole('button', { name: 'common.cancel' }));
    fireEvent.click(screen.getByTitle('Manage translations'));
    fireEvent.change(screen.getByLabelText('Français'), { target: { value: 'Fresh manual edit' } });

    await act(async () => { finish({ data: { translations: { fr: 'Old AI output', de: 'Old German output' } }, error: null }); });

    expect(screen.getByLabelText('Français')).toHaveValue('Fresh manual edit');
    expect(screen.getByLabelText('Deutsch')).toHaveValue('');
    expect(fixtures.toast).not.toHaveBeenCalled();
  });

  it('keeps a newer session request loading when an older request finishes', async () => {
    const finishes: ((value: unknown) => void)[] = [];
    fixtures.invoke.mockImplementation(() => new Promise(resolve => { finishes.push(resolve); }));
    render(<TranslationButton value="Cleaner" sourceLanguage="en" onSave={vi.fn()} />);
    beginRequest();
    fireEvent.click(screen.getByRole('button', { name: 'common.cancel' }));
    beginRequest();
    expect(fixtures.invoke).toHaveBeenCalledTimes(2);

    await act(async () => { finishes[0]({ data: { translations: { fr: 'Old AI output' } }, error: null }); });

    expect(screen.getByRole('button', { name: 'Generate with AI' })).toBeDisabled();
    expect(screen.getByLabelText('Français')).toHaveValue('');
    expect(fixtures.toast).not.toHaveBeenCalled();
    await act(async () => { finishes[1]({ data: { translations: { fr: 'Current AI output' } }, error: null }); });
    expect(screen.getByLabelText('Français')).toHaveValue('Current AI output');
    expect(screen.getByRole('button', { name: 'Generate with AI' })).toBeEnabled();
  });

  it('suppresses errors from a closed or unmounted editing session', async () => {
    let finish!: (value: unknown) => void;
    fixtures.invoke.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = render(<TranslationButton value="Cleaner" sourceLanguage="en" onSave={vi.fn()} />);
    beginRequest();
    unmount();

    await act(async () => { finish({ data: null, error: new Error('Old request failed') }); });

    expect(fixtures.toast).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });
});
