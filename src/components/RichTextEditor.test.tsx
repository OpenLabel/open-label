import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

// Mock TipTap since it relies on DOM APIs not available in jsdom
vi.mock('@tiptap/react', () => ({
  useEditor: () => ({
    isActive: () => false,
    chain: () => ({
      focus: () => ({
        toggleBold: () => ({ run: vi.fn() }),
        toggleItalic: () => ({ run: vi.fn() }),
        toggleUnderline: () => ({ run: vi.fn() }),
        toggleBulletList: () => ({ run: vi.fn() }),
        toggleOrderedList: () => ({ run: vi.fn() }),
        setTextAlign: () => ({ run: vi.fn() }),
        extendMarkRange: () => ({ setLink: () => ({ run: vi.fn() }) }),
        undo: () => ({ run: vi.fn() }),
        redo: () => ({ run: vi.fn() }),
      }),
    }),
    can: () => ({ undo: () => true, redo: () => true }),
    getHTML: () => '<p>Hello</p>',
  }),
  EditorContent: ({ editor }: any) => <div data-testid="editor-content">Editor</div>,
}));

import { RichTextEditor } from './RichTextEditor';

describe('RichTextEditor', () => {
  it('renders toolbar and editor', () => {
    render(<RichTextEditor content="<p>Test</p>" onChange={vi.fn()} />);
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  it('renders all formatting buttons', () => {
    const { container } = render(<RichTextEditor content="" onChange={vi.fn()} />);
    // Toolbar buttons exist (Toggle and Button elements)
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThanOrEqual(10);
  });
});
