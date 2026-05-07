import { Node, mergeAttributes } from '@tiptap/core';

export type CalloutVariant = 'info' | 'conseil' | 'attention' | 'important';

const VARIANTS: CalloutVariant[] = ['info', 'conseil', 'attention', 'important'];

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (variant: CalloutVariant) => ReturnType;
      toggleCallout: (variant: CalloutVariant) => ReturnType;
      unsetCallout: () => ReturnType;
    };
  }
}

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      variant: {
        default: 'info' as CalloutVariant,
        parseHTML: (el) => {
          const v = el.getAttribute('data-variant');
          return VARIANTS.includes(v as CalloutVariant) ? (v as CalloutVariant) : 'info';
        },
        renderHTML: (attrs) => ({ 'data-variant': attrs.variant }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div.callout' }];
  },

  renderHTML({ HTMLAttributes }) {
    const variant = (HTMLAttributes['data-variant'] as CalloutVariant) || 'info';
    return [
      'div',
      mergeAttributes(HTMLAttributes, { class: `callout callout-${variant}` }),
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        (variant) =>
        ({ commands }) =>
          commands.wrapIn(this.name, { variant }),
      toggleCallout:
        (variant) =>
        ({ commands, editor }) => {
          if (editor.isActive(this.name, { variant })) {
            return commands.lift(this.name);
          }
          if (editor.isActive(this.name)) {
            return commands.updateAttributes(this.name, { variant });
          }
          return commands.wrapIn(this.name, { variant });
        },
      unsetCallout:
        () =>
        ({ commands }) =>
          commands.lift(this.name),
    };
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { selection } = editor.state;
        if (!selection.empty || !editor.isActive(this.name)) return false;

        const { $from } = selection;
        if ($from.parentOffset !== 0) return false;
        const calloutNode = $from.node($from.depth - 1);
        if (calloutNode.type.name !== this.name) return false;
        if (calloutNode.textContent.length > 0) return false;

        return editor.chain().focus().lift(this.name).run();
      },
    };
  },
});

export default Callout;
