'use client';

import { Color } from '@tiptap/extension-color';
import ImageExt from '@tiptap/extension-image';
import LinkExt from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  AlertOctagon,
  AlertTriangle,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Info,
  Italic,
  Lightbulb,
  Link as LinkIcon,
  List,
  ListOrdered,
  Palette,
  Quote,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Callout, type CalloutVariant } from './CalloutExtension';

type Props = {
  value: string;
  onChange: (html: string) => void;
  onUploadImage: (file: File) => Promise<string>;
  placeholder?: string;
};

const COLORS = [
  '#0f172a', // slate-900
  '#64748b', // slate-500
  '#dc2626', // red-600
  '#ea580c', // orange-600
  '#ca8a04', // yellow-600
  '#16a34a', // green-600
  '#2563eb', // blue-600
  '#9333ea', // purple-600
];

export default function RichTextEditor({ value, onChange, onUploadImage, placeholder }: Props) {
  const [colorOpen, setColorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      LinkExt.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      Placeholder.configure({ placeholder: placeholder ?? 'Rédige ton actualité…' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      ImageExt.configure({ inline: false }),
      Callout,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'ProseMirror' },
    },
  });

  // Sync external value changes (e.g. après chargement initial)
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) {
    return <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Chargement de l&apos;éditeur…</div>;
  }

  async function handlePickImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !editor) return;
    try {
      const url = await onUploadImage(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Échec upload';
      alert(`Impossible d'uploader : ${msg}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleSetLink() {
    const previous = editor!.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL du lien (laisser vide pour retirer) :', previous ?? '');
    if (url === null) return;
    if (url === '') {
      editor!.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor!.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  return (
    <div className="rounded-md border border-slate-300 bg-white">
      <Toolbar
        editor={editor}
        colorOpen={colorOpen}
        onToggleColor={() => setColorOpen((v) => !v)}
        onCloseColor={() => setColorOpen(false)}
        onPickImage={() => fileInputRef.current?.click()}
        onSetLink={handleSetLink}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePickImage}
      />
      <EditorContent editor={editor} />
    </div>
  );
}

type ToolbarProps = {
  editor: Editor;
  colorOpen: boolean;
  onToggleColor: () => void;
  onCloseColor: () => void;
  onPickImage: () => void;
  onSetLink: () => void;
};

function Toolbar({ editor, colorOpen, onToggleColor, onCloseColor, onPickImage, onSetLink }: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
      <Group>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Titre 1">
          <Heading1 className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Titre 2">
          <Heading2 className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Titre 3">
          <Heading3 className="h-4 w-4" />
        </Btn>
      </Group>

      <Group>
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Gras">
          <Bold className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italique">
          <Italic className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Souligné">
          <UnderlineIcon className="h-4 w-4" />
        </Btn>
      </Group>

      <Group>
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Liste à puces">
          <List className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Liste numérotée">
          <ListOrdered className="h-4 w-4" />
        </Btn>
      </Group>

      <Group>
        <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Aligner à gauche">
          <AlignLeft className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Centrer">
          <AlignCenter className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Aligner à droite">
          <AlignRight className="h-4 w-4" />
        </Btn>
      </Group>

      <Group>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Citation">
          <Quote className="h-4 w-4" />
        </Btn>
      </Group>

      <Group>
        <CalloutBtn editor={editor} variant="info" title="Info" Icon={Info} />
        <CalloutBtn editor={editor} variant="conseil" title="Conseil" Icon={Lightbulb} />
        <CalloutBtn editor={editor} variant="attention" title="Attention" Icon={AlertTriangle} />
        <CalloutBtn editor={editor} variant="important" title="Important" Icon={AlertOctagon} />
      </Group>

      <Group>
        <div className="relative">
          <Btn onClick={onToggleColor} active={colorOpen} title="Couleur de texte">
            <Palette className="h-4 w-4" />
          </Btn>
          {colorOpen && (
            <div className="absolute left-0 top-full z-10 mt-1 flex gap-1 rounded-md border border-slate-200 bg-white p-2 shadow-md">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setColor(c).run();
                    onCloseColor();
                  }}
                  className="h-6 w-6 rounded-full border border-slate-300"
                  style={{ background: c }}
                  aria-label={`Couleur ${c}`}
                />
              ))}
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  onCloseColor();
                }}
                className="ml-1 rounded border border-slate-300 px-2 text-xs text-slate-700 hover:bg-slate-100"
              >
                Auto
              </button>
            </div>
          )}
        </div>
        <Btn onClick={onSetLink} active={editor.isActive('link')} title="Lien">
          <LinkIcon className="h-4 w-4" />
        </Btn>
        <Btn onClick={onPickImage} title="Image">
          <ImageIcon className="h-4 w-4" />
        </Btn>
      </Group>

      <Group>
        <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Annuler">
          <Undo2 className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Refaire">
          <Redo2 className="h-4 w-4" />
        </Btn>
      </Group>
    </div>
  );
}

function CalloutBtn({
  editor,
  variant,
  title,
  Icon,
}: {
  editor: Editor;
  variant: CalloutVariant;
  title: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Btn
      onClick={() => editor.chain().focus().toggleCallout(variant).run()}
      active={editor.isActive('callout', { variant })}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </Btn>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1 last:border-r-0">{children}</div>;
}

function Btn({
  children,
  onClick,
  active,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex h-8 w-8 items-center justify-center rounded text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40 ${active ? 'bg-slate-200 text-slate-900' : ''}`}
    >
      {children}
    </button>
  );
}
