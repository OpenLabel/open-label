/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * You may use, modify, and distribute this software under the terms
 * of the OLPL license.
 *
 * Interfaces displaying Digital Product Passports generated using
 * this software must display:
 *
 *     Powered by Open-Label.eu
 *
 * See LICENSE and NOTICE files for details.
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Undo,
  Redo,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const { t } = useTranslation();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false, underline: false }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] p-3',
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': t('richText.editorLabel'),
      },
    },
  });

  // BUG-02: sync late `content` prop into the editor DOM (e.g. after async fetch)
  useEffect(() => {
    if (!editor?.commands?.setContent) return;
    const incoming = content || '';
    const current = typeof editor.getHTML === 'function' ? editor.getHTML() : '';
    if (current !== incoming) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }


  const addLink = () => {
    const url = window.prompt(t('richText.enterUrl'));
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="border-b bg-muted/50 p-1 flex flex-wrap gap-1">
        <Toggle
          size="sm"
          aria-label={t('richText.bold')}
          title={t('richText.bold')}
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          aria-label={t('richText.italic')}
          title={t('richText.italic')}
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          aria-label={t('richText.underline')}
          title={t('richText.underline')}
          pressed={editor.isActive('underline')}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Toggle>
        <div className="w-px bg-border mx-1" />
        <Toggle
          size="sm"
          aria-label={t('richText.bulletList')}
          title={t('richText.bulletList')}
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          aria-label={t('richText.orderedList')}
          title={t('richText.orderedList')}
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <div className="w-px bg-border mx-1" />
        <Toggle
          size="sm"
          aria-label={t('richText.alignLeft')}
          title={t('richText.alignLeft')}
          pressed={editor.isActive({ textAlign: 'left' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          aria-label={t('richText.alignCenter')}
          title={t('richText.alignCenter')}
          pressed={editor.isActive({ textAlign: 'center' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          aria-label={t('richText.alignRight')}
          title={t('richText.alignRight')}
          pressed={editor.isActive({ textAlign: 'right' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <AlignRight className="h-4 w-4" />
        </Toggle>
        <div className="w-px bg-border mx-1" />
        <Toggle
          size="sm"
          aria-label={t('richText.insertLink')}
          title={t('richText.insertLink')}
          pressed={editor.isActive('link')}
          onPressedChange={addLink}
        >
          <LinkIcon className="h-4 w-4" />
        </Toggle>
        <div className="w-px bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={t('richText.undo')}
          title={t('richText.undo')}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={t('richText.redo')}
          title={t('richText.redo')}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
