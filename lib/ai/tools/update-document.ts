/**
 * Provides tools for updating documents with user changes.
 * @module ai/tools/update-document
 * @packageDocumentation
 */

import { documentHandlersByArtifactKind } from '@/lib/artifacts/server';
import { getDocumentById, } from '@/lib/db/queries';
import { type DataStreamWriter, tool } from 'ai';
import type { Session } from 'next-auth';
import { z } from 'zod';

/**
 * Properties for updating a document.
 * @typedef {Object} UpdateDocumentProps
 * @property {Session} session - The user's current session.
 * @property {DataStreamWriter} dataStream - Stream writer for real-time updates.
 */
interface UpdateDocumentProps {
  session: Session;
  dataStream: DataStreamWriter;
}

/**
 * Tool to update a document based on the provided description.
 * @param props - Contains the session for authentication and dataStream for real-time updates.
 * @returns A tool object that executes the document update process.
 * @throws When the document is not found or no handler exists for its kind.
 * @example
 * const updateTool = updateDocument({ session, dataStream });
 * const result = await updateTool.execute({ id, description });
 * @see /lib/ai/tools/create-document.ts
 */
export const updateDocument = ({ session, dataStream }: UpdateDocumentProps) =>
  tool({
    description: 'Update a document with the given description.',
    parameters: z.object({
      id: z.string().describe('The ID of the document to update'),
      description: z
        .string()
        .describe('The description of changes that need to be made'),
    }),
    execute: async ({ id, description }) => {
      const document = await getDocumentById({ id });

      if (!document) {
        return {
          error: 'Document not found',
        };
      }

      dataStream.writeData({
        type: 'clear',
        content: document.title,
      });

      const documentHandler = documentHandlersByArtifactKind.find(
        (documentHandlerByArtifactKind) =>
          documentHandlerByArtifactKind.kind === document.kind,
      );

      if (!documentHandler) {
        throw new Error(`No document handler found for kind: ${document.kind}`);
      }

      await documentHandler.onUpdateDocument({
        document,
        description,
        dataStream,
        session,
      });

      dataStream.writeData({ type: 'finish', content: '' });

      return {
        id,
        title: document.title,
        kind: document.kind,
        content: 'The document has been updated successfully.',
      };
    },
  });
