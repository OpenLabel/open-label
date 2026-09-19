import { useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import type { Editor } from '@tiptap/core';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { RichTextEditor } from './RichTextEditor';

const toolbarKeys = ['bold', 'italic', 'underline', 'bulletList', 'orderedList', 'alignLeft', 'alignCenter', 'alignRight', 'insertLink', 'undo', 'redo'] as const;
type Dictionary = { richText: Record<string, string> };
const bundles = import.meta.glob('../i18n/locales/*.json', { eager: true, import: 'default' }) as Record<string, Dictionary>;
const dictionaries = Object.fromEntries(Object.entries(bundles).map(([path, dictionary]) => [path.split('/').pop()!.replace('.json', ''), dictionary]));
const rangeGeometry = Object.fromEntries(['getClientRects', 'getBoundingClientRect'].map(key => [key, Object.getOwnPropertyDescriptor(Range.prototype, key)]));

// jsdom has no layout engine. Supply only the Range geometry methods used by
// ProseMirror's focus scrolling; editor transactions and commands remain real.
beforeAll(() => {
  Object.defineProperty(Range.prototype, 'getClientRects', { configurable: true, value: () => [] });
  Object.defineProperty(Range.prototype, 'getBoundingClientRect', { configurable: true, value: () => new DOMRect() });
});
afterAll(() => {
  for (const [key, descriptor] of Object.entries(rangeGeometry)) {
    if (descriptor) Object.defineProperty(Range.prototype, key, descriptor);
    else Reflect.deleteProperty(Range.prototype, key);
  }
});

async function renderEditor(locale = 'en') {
  const i18n = createInstance();
  await i18n.use(initReactI18next).init({ lng: locale, fallbackLng: false, resources: Object.fromEntries(Object.entries(dictionaries).map(([language, dictionary]) => [language, { translation: dictionary }])), interpolation: { escapeValue: false } });
  const onChange = vi.fn();
  function ControlledEditor() {
    const [content, setContent] = useState('<p>QA editor text</p>');
    return <RichTextEditor content={content} onChange={value => { setContent(value); onChange(value); }} />;
  }
  const view = render(<I18nextProvider i18n={i18n}><ControlledEditor /></I18nextProvider>);
  const element = view.container.querySelector('.tiptap') as HTMLElement & { editor: Editor };
  expect(element).not.toBeNull();
  return { ...view, element, editor: element.editor, i18n, onChange };
}

function selectText(editor: Editor) {
  act(() => { editor.commands.setTextSelection({ from: 1, to: 15 }); });
}

afterEach(() => vi.restoreAllMocks());

describe('Rich text editor actual formatting and accessibility', () => {
  it('mounts the real editor without duplicate extension warnings', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await renderEditor();
    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('Duplicate extension names'));
  });

  it.each([
    ['Bold', 'strong'], ['Italic', 'em'], ['Underline', 'u'],
    ['Bullet list', 'ul'], ['Numbered list', 'ol'],
  ])('%s names a working formatting control and exposes its pressed state', async (name, tag) => {
    const { editor, element, onChange } = await renderEditor();
    selectText(editor);
    const button = screen.getByRole('button', { name });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(button);
    await waitFor(() => expect(element.querySelector(tag)).toHaveTextContent('QA editor text'));
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(onChange).toHaveBeenCalled();
  });

  it.each([['Align left', 'left'], ['Align center', 'center'], ['Align right', 'right']])('%s applies the expected paragraph alignment', async (name, alignment) => {
    const { editor, element } = await renderEditor();
    selectText(editor);
    fireEvent.click(screen.getByRole('button', { name }));
    await waitFor(() => expect(element.querySelector('p')).toHaveStyle({ textAlign: alignment }));
    expect(screen.getByRole('button', { name })).toHaveAttribute('aria-pressed', 'true');
  });

  it('supports named Undo and Redo controls with useful disabled states', async () => {
    const { editor, element } = await renderEditor();
    const undo = screen.getByRole('button', { name: 'Undo' });
    const redo = screen.getByRole('button', { name: 'Redo' });
    expect(undo).toBeDisabled();
    expect(redo).toBeDisabled();
    selectText(editor);
    fireEvent.click(screen.getByRole('button', { name: 'Underline' }));
    await waitFor(() => expect(undo).toBeEnabled());
    fireEvent.click(undo);
    await waitFor(() => expect(element.querySelector('u')).toBeNull());
    expect(redo).toBeEnabled();
    fireEvent.click(redo);
    await waitFor(() => expect(element.querySelector('u')).toHaveTextContent('QA editor text'));
  });

  it('adds the supplied link through the named control without opening links while editing', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('https://qa20260919.example/editor-link');
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const { editor, element } = await renderEditor();
    selectText(editor);
    fireEvent.click(screen.getByRole('button', { name: 'Insert link' }));
    await waitFor(() => expect(element.querySelector('a')).toHaveAttribute('href', 'https://qa20260919.example/editor-link'));
    // Deliver the event to the real ProseMirror handlers without relying on
    // jsdom's unavailable coordinate hit testing.
    const click = new MouseEvent('click', { button: 0 });
    Object.defineProperty(click, 'target', { value: element.querySelector('a') });
    act(() => { editor.view.someProp('handleClick', handler => handler(editor.view, 1, click)); });
    expect(open).not.toHaveBeenCalled();
    expect(element.querySelector('a')).toHaveTextContent('QA editor text');
  });

  it('updates control and textbox names when the language changes', async () => {
    const { i18n } = await renderEditor();
    expect(screen.getByRole('textbox', { name: 'Rich text editor' })).toHaveAttribute('aria-multiline', 'true');
    await act(async () => { await i18n.changeLanguage('fr'); });
    expect(screen.getByRole('textbox', { name: dictionaries.fr.richText.editorLabel })).toHaveAttribute('contenteditable', 'true');
    expect(screen.getByRole('button', { name: dictionaries.fr.richText.bold })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Bold' })).not.toBeInTheDocument();
  });
});

describe('Rich text editor names in all 25 supported locales', () => {
  it('covers every supported locale bundle', () => {
    expect(Object.keys(dictionaries)).toHaveLength(25);
  });

  for (const [locale, dictionary] of Object.entries(dictionaries)) {
    it(`${locale}: every toolbar command and the real textbox have localized accessible names without fallback`, async () => {
      for (const key of [...toolbarKeys, 'editorLabel']) {
        expect(dictionary.richText[key], `${locale}:${key}`).toBeTypeOf('string');
        expect(dictionary.richText[key]?.trim(), `${locale}:${key}`).toBeTruthy();
        expect(dictionary.richText[key]).not.toMatch(/^richText\./);
      }
      await renderEditor(locale);
      for (const key of toolbarKeys) {
        expect(screen.getByRole('button', { name: dictionary.richText[key] })).toHaveAccessibleName(dictionary.richText[key]);
      }
      expect(screen.getAllByRole('button')).toHaveLength(11);
      expect(screen.getByRole('textbox', { name: dictionary.richText.editorLabel })).toHaveAttribute('aria-multiline', 'true');
    });
  }
});
