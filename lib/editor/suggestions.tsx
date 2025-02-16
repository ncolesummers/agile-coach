/**
 * Provides functions and plugins for editor suggestions and widgets.
 * @module /lib/editor/suggestions
 * @packageDocumentation
 */

import type { Node } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import {
  type Decoration,
  DecorationSet,
  type EditorView,
} from 'prosemirror-view';
import { createRoot } from 'react-dom/client';

import type { ArtifactKind } from '@/components/artifact';
import { Suggestion as PreviewSuggestion } from '@/components/suggestion';
import type { Suggestion } from '@/lib/db/schema';

/**
 * Extends Suggestion with selection positions for UI purposes.
 * @typedef {Object} UISuggestion
 * @property {number} selectionStart - The start of the selection range.
 * @property {number} selectionEnd - The end of the selection range.
 * @see /lib/db/schema
 */
export interface UISuggestion extends Suggestion {
  selectionStart: number;
  selectionEnd: number;
}

interface Position {
  start: number;
  end: number;
}

/**
 * Finds the start and end positions of a search text in the ProseMirror document.
 *
 * @param doc - The ProseMirror document node.
 * @param searchText - The text to search for.
 * @returns The start and end positions if found, otherwise null.
 * @example
 * const pos = findPositionsInDoc(doc, "sample");
 */
function findPositionsInDoc(doc: Node, searchText: string): Position | null {
  let positions: { start: number; end: number } | null = null;

  // Traverse through text nodes
  doc.nodesBetween(0, doc.content.size, (node, pos) => {
    if (node.isText && node.text) {
      const index = node.text.indexOf(searchText);

      if (index !== -1) {
        positions = {
          start: pos + index,
          end: pos + index + searchText.length,
        };

        return false;
      }
    }

    return true;
  });

  return positions;
}

/**
 * Projects suggestions by adding selection positions based on the document content.
 *
 * @param doc - The ProseMirror document node.
 * @param suggestions - The array of suggestions to project.
 * @returns The array of UISuggestions with selection positions.
 * @see /lib/editor/functions.tsx
 * @example
 * const uiSuggestions = projectWithPositions(doc, suggestions);
 */
export function projectWithPositions(
  doc: Node,
  suggestions: Array<Suggestion>,
): Array<UISuggestion> {
  return suggestions.map((suggestion) => {
    const positions = findPositionsInDoc(doc, suggestion.originalText);

    if (!positions) {
      return {
        ...suggestion,
        selectionStart: 0,
        selectionEnd: 0,
      };
    }

    return {
      ...suggestion,
      selectionStart: positions.start,
      selectionEnd: positions.end,
    };
  });
}

/**
 * Creates a suggestion widget rendered with React.
 *
 * @param suggestion - The suggestion data with UI positions.
 * @param view - The ProseMirror editor view.
 * @param artifactKind - The kind of artifact (default is 'text').
 * @returns An object containing the widget DOM and a destroy method.
 * @see /lib/editor/react-renderer.tsx
 * @example
 * const widget = createSuggestionWidget(suggestion, editorView);
 */
export function createSuggestionWidget(
  suggestion: UISuggestion,
  view: EditorView,
  artifactKind: ArtifactKind = 'text',
): { dom: HTMLElement; destroy: () => void } {
  const dom = document.createElement('span');
  const root = createRoot(dom);

  // Prevent focus loss on mousedown
  dom.addEventListener('mousedown', (event) => {
    event.preventDefault();
    view.dom.blur();
  });

  const onApply = () => {
    const { state, dispatch } = view;

    const decorationTransaction = state.tr;
    const currentState = suggestionsPluginKey.getState(state);
    const currentDecorations = currentState?.decorations;

    // Remove decoration widget related to this suggestion
    if (currentDecorations) {
      const newDecorations = DecorationSet.create(
        state.doc,
        currentDecorations.find().filter((decoration: Decoration) => {
          return decoration.spec.suggestionId !== suggestion.id;
        }),
      );

      decorationTransaction.setMeta(suggestionsPluginKey, {
        decorations: newDecorations,
        selected: null,
      });
      dispatch(decorationTransaction);
    }

    // Replace text with the suggested suggestion
    const textTransaction = view.state.tr.replaceWith(
      suggestion.selectionStart,
      suggestion.selectionEnd,
      state.schema.text(suggestion.suggestedText),
    );

    textTransaction.setMeta('no-debounce', true);
    dispatch(textTransaction);
  };

  // Render the suggestion widget using React
  root.render(
    <PreviewSuggestion
      suggestion={suggestion}
      onApply={onApply}
      artifactKind={artifactKind}
    />,
  );

  return {
    dom,
    destroy: () => {
      // Delay unmounting to prevent synchronous issues during render
      setTimeout(() => {
        root.unmount();
      }, 0);
    },
  };
}

/**
 * Unique key to associate suggestion plugin state.
 * @see /lib/editor/functions.tsx
 */
export const suggestionsPluginKey = new PluginKey('suggestions');

/**
 * A ProseMirror plugin for handling suggestions decorations.
 * @returns A ProseMirror plugin managing suggestion highlighting and widgets
 * @see /lib/editor/functions.tsx
 */
export const suggestionsPlugin = new Plugin({
  key: suggestionsPluginKey,
  state: {
    init() {
      return { decorations: DecorationSet.empty, selected: null };
    },
    apply(tr, state) {
      const newDecorations = tr.getMeta(suggestionsPluginKey);
      if (newDecorations) return newDecorations;

      return {
        decorations: state.decorations.map(tr.mapping, tr.doc),
        selected: state.selected,
      };
    },
  },
  props: {
    decorations(state) {
      return this.getState(state)?.decorations ?? DecorationSet.empty;
    },
  },
});
