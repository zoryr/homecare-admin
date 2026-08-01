import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    internalLink: {
      /** Applique un lien interne (vers une autre actu) sur la sélection. */
      setInternalLink: (attrs: { actualiteId: string }) => ReturnType;
      /** Retire le lien interne de la sélection. */
      unsetInternalLink: () => ReturnType;
    };
  }
}

/**
 * Mark Tiptap "internalLink" : un lien vers une autre actualité de l'app.
 * Rendu HTML : <a class="internal-link" data-actualite-id="…">texte</a>.
 * Côté app, ces liens ouvrent l'actu cible dans l'app (pas en navigateur).
 */
export const InternalLink = Mark.create({
  name: 'internalLink',
  inclusive: false,

  addAttributes() {
    return {
      actualiteId: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-actualite-id'),
        renderHTML: (attrs) =>
          attrs.actualiteId ? { 'data-actualite-id': attrs.actualiteId as string } : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: 'a.internal-link[data-actualite-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['a', mergeAttributes({ class: 'internal-link' }, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setInternalLink:
        (attrs) =>
        ({ commands }) =>
          commands.setMark('internalLink', attrs),
      unsetInternalLink:
        () =>
        ({ commands }) =>
          commands.unsetMark('internalLink'),
    };
  },
});
