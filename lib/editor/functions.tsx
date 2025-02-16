/**
 * Provides helper functions for transforming between Markdown and ProseMirror documents,
 * and for creating decorations for suggestions.
 * @module /lib/editor/functions
 * @packageDocumentation
 */

'use client';

import { defaultMarkdownSerializer } from 'prosemirror-markdown';
import { DOMParser, type Node } from 'prosemirror-model';
import { Decoration, DecorationSet, type EditorView } from 'prosemirror-view';
import { renderToString } from 'react-dom/server';

import { Markdown } from '@/components/markdown';

import { documentSchema } from './config';
import { createSuggestionWidget, type UISuggestion } from './suggestions';

/**
 * Builds a ProseMirror document from the given markdown content.
 * @param content - Markdown content as a string
 * @returns ProseMirror document node constructed from the markdown input
 * @see /lib/components/markdown
 * @example
 * const doc = buildDocumentFromContent("# Hello World");
 */
export const buildDocumentFromContent = (content: string) => {
  const parser = DOMParser.fromSchema(documentSchema);
  const stringFromMarkdown = renderToString(<Markdown>{content}</Markdown>);
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = stringFromMarkdown;
  return parser.parse(tempContainer);
};

/**
 * Serializes a ProseMirror document into markdown format.
 * @param document - ProseMirror document node to be serialized
 * @returns Markdown content as a string
 * @example
 * const markdown = buildContentFromDocument(doc);
 */
export const buildContentFromDocument = (document: Node) => {
  return defaultMarkdownSerializer.serialize(document);
};

/**
 * Creates ProseMirror decorations for an array of suggestions by adding inline highlights and widgets.
 * @param suggestions - Array of UISuggestions to decorate
 * @param view - ProseMirror EditorView instance
 * @returns A DecorationSet containing all created suggestion decorations
 * @see /lib/editor/suggestions.tsx for widget creation and usage
 * @example
 * const decor = createDecorations(suggestions, editorView);
 */
export const createDecorations = (
  suggestions: Array<UISuggestion>,
  view: EditorView,
) => {
  const decorations: Array<Decoration> = [];

  for (const suggestion of suggestions) {
    // Decoration to highlight text
    decorations.push(
      Decoration.inline(
        suggestion.selectionStart,
        suggestion.selectionEnd,
        {
          class: 'suggestion-highlight',
        },
        {
          suggestionId: suggestion.id,
          type: 'highlight',
        },
      ),
    );

    // Decoration to render a suggestion widget
    decorations.push(
      Decoration.widget(
        suggestion.selectionStart,
        (view) => {
          const { dom } = createSuggestionWidget(suggestion, view);
          return dom;
        },
        {
          suggestionId: suggestion.id,
          type: 'widget',
        },
      ),
    );
  }

  return DecorationSet.create(view.state.doc, decorations);
};
