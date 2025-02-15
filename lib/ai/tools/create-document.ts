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
 * Tool to create a new document intended for writing or content creation.
 * @function createDocument
 * @param {CreateDocumentProps} props - The properties required to create a document.
 * @returns {Tool} A tool configured for document creation.
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
     * @async
     * @function execute
     * @param {Object} params - The parameters for document creation.
     * @param {string} params.title - The title of the document.
     * @param {string} params.kind - The kind of artifact for the document.
     * @returns {Promise<Object>} The created document details.
     */
    execute: async ({ title, kind }) => {
      const id = generateUUID();

      dataStream.writeData({
        type: 'kind',
        content: kind,
      });

      dataStream.writeData({
        type: 'id',
        content: id,
      });

      dataStream.writeData({
        type: 'title',
        content: title,
      });

      dataStream.writeData({
        type: 'clear',
        content: '',
      });

      const documentHandler = documentHandlersByArtifactKind.find(
        (documentHandlerByArtifactKind) =>
          documentHandlerByArtifactKind.kind === kind,
      );

      if (!documentHandler) {
        throw new Error(`No document handler found for kind: ${kind}`);
      }

      await documentHandler.onCreateDocument({
        id,
        title,
        dataStream,
        session,
      });

      dataStream.writeData({ type: 'finish', content: '' });

      return {
        id,
        title,
        kind,
        content: 'A document was created and is now visible to the user.',
      };
    },
  });
