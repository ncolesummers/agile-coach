/**
 * Configuration and helper functions for the ProseMirror editor.
 * Provides the document schema, input rules, and transaction handling necessary
 * for updating the editor view.
 * @module editor/config
 * @packageDocumentation
 */

import { textblockTypeInputRule } from 'prosemirror-inputrules';
import { Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import type { Transaction } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import type { MutableRefObject } from 'react';

import { buildContentFromDocument } from './functions';

/**
 * ProseMirror document schema including list nodes.
 * This schema provides the necessary nodes and marks, including support for lists.
 * @returns The ProseMirror Schema instance.
 * @see /lib/editor/config.ts
 */
export const documentSchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
  marks: schema.spec.marks,
});

/**
 * Creates an input rule to transform markdown headings.
 *
 * Generates an input rule that converts markdown-style heading syntax into a ProseMirror heading node.
 *
 * @param level - Specifies the heading level to trigger the rule.
 * @returns An input rule configured for the given heading level.
 * @see /lib/editor/config.ts
 */
export function headingRule(level: number) {
  return textblockTypeInputRule(
    new RegExp(`^(#{1,${level}})\\s$`),
    documentSchema.nodes.heading,
    () => ({ level }),
  );
}

/**
 * Handles and applies a ProseMirror transaction to update the editor state.
 *
 * This function updates the editor state in response to the provided transaction.
 * It also triggers content saving callbacks unless the transaction has specific meta flags.
 *
 * @param transaction - The transaction containing changes applied to the editor state.
 * @param editorRef - A mutable reference to the editor view instance.
 * @param onSaveContent - Callback invoked to save updated content.
 * @returns Nothing.
 * @throws If the editor reference is unavailable.
 * @example
 * // Example usage:
 * handleTransaction({ transaction, editorRef, onSaveContent });
 * @see /lib/editor/config.ts
 */
export const handleTransaction = ({
  transaction,
  editorRef,
  onSaveContent,
}: {
  transaction: Transaction;
  editorRef: MutableRefObject<EditorView | null>;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
}) => {
  if (!editorRef || !editorRef.current) return;

  const newState = editorRef.current.state.apply(transaction);
  editorRef.current.updateState(newState);

  if (transaction.docChanged && !transaction.getMeta('no-save')) {
    // Process and update content based on the changed transaction.
    const updatedContent = buildContentFromDocument(newState.doc);

    if (transaction.getMeta('no-debounce')) {
      onSaveContent(updatedContent, false);
    } else {
      onSaveContent(updatedContent, true);
    }
  }
};
