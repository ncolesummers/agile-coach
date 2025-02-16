/**
 * Provides tools for creating new documents for content creation activities.
 * @module ai/tools/create-document
 * @packageDocumentation
 */

import {
  artifactKinds,
  documentHandlersByArtifactKind,
} from '@/lib/artifacts/server';
import { generateUUID } from '@/lib/utils';
import { type DataStreamWriter, tool } from 'ai';
import type { Session } from 'next-auth';
import { z } from 'zod';

/**
 * Properties for creating a new document.
 * @typedef {Object} CreateDocumentProps
 * @property {Session} session - The user's authentication session.
 * @property {DataStreamWriter} dataStream - The data stream writer.
 */
interface CreateDocumentProps {
  session: Session;
  dataStream: DataStreamWriter;
}

/**
 * Creates a tool to generate a new document based on title and kind.
 * @param props - Contains the session and dataStream for real-time updates.
 * @returns A tool object that executes the document creation process.
 * @throws When no document handler is found for the specified kind.
 * @example
 * const createTool = createDocument({ session, dataStream });
 * const result = await createTool.execute({ title: "My Document", kind: "text" });
 * @see /lib/ai/tools/update-document.ts
 */
export const createDocument = ({ session, dataStream }: CreateDocumentProps) =>
  tool({
    description:
      'Create a document for a writing or content creation activities. This tool will call other functions that will generate the contents of the document based on the title and kind.',
    parameters: z.object({
      title: z.string(),
      kind: z.enum(artifactKinds),
    }),

    /**
     * Executes the document creation process.
     * @param params - Contains title and kind for the new document.
     * @returns An object with details of the created document.
     */
    execute: async ({ title, kind }) => {
      // Create a unique identifier for the new document
      const id = generateUUID();

      // Write the type of artifact ('kind') to the data stream
      dataStream.writeData({
        type: 'kind',
        content: kind,
      });

      // Write the unique ID of the document to the data stream
      dataStream.writeData({
        type: 'id',
        content: id,
      });

      // Write the title of the document to the data stream
      dataStream.writeData({
        type: 'title',
        content: title,
      });

      // Send a signal to clear existing content in the client/UI via the data stream
      dataStream.writeData({
        type: 'clear',
        content: '',
      });

      // Look for a document handler that matches the provided kind
      const documentHandler = documentHandlersByArtifactKind.find(
        (documentHandlerByArtifactKind) =>
          documentHandlerByArtifactKind.kind === kind,
      );

      if (!documentHandler) {
        throw new Error(`No document handler found for kind: ${kind}`);
      }

      // Call the handler's onCreateDocument method to perform additional setup/logic
      await documentHandler.onCreateDocument({
        id,
        title,
        dataStream,
        session,
      });

      // Signal the end of the document creation process via the data stream
      dataStream.writeData({ type: 'finish', content: '' });

      // Return the details of the created document
      return {
        id,
        title,
        kind,
        content: 'A document was created and is now visible to the user.',
      };
    },
  });
