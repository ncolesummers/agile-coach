/**
 * Provides tools for requesting AI-powered writing suggestions for documents.
 * @module ai/tools/request-suggestions
 * @packageDocumentation
 */

import { getDocumentById, saveSuggestions } from '@/lib/db/queries';
import type { Suggestion } from '@/lib/db/schema';
import { generateUUID } from '@/lib/utils';
import { type DataStreamWriter, streamObject, tool } from 'ai';
import type { Session } from 'next-auth';
import { z } from 'zod';
import { myProvider } from '../models';

/**
 * Props required to initialize the suggestions request tool
 * @interface RequestSuggestionsProps
 * @property {Session} session - The user's authentication session
 * @property {DataStreamWriter} dataStream - Stream for writing real-time updates
 */
interface RequestSuggestionsProps {
  session: Session;
  dataStream: DataStreamWriter;
}

/**
 * Properties required to request suggestions for a document.
 * @typedef {Object} RequestSuggestionsProps
 * @property {Session} session - The user's authentication session.
 * @property {DataStreamWriter} dataStream - Stream writer for real-time updates.
 */
interface RequestSuggestionsProps {
  session: Session;
  dataStream: DataStreamWriter;
}

/**
 * Creates a tool that generates AI-powered suggestions for a document.
 * @param props - Contains the session for authentication and dataStream for real-time updates.
 * @returns A tool object that, when executed, returns document suggestion results.
 * @throws When the document is missing or its content is empty.
 * @example
 * const suggestionTool = requestSuggestions({ session, dataStream });
 * const result = await suggestionTool.execute({ documentId: "doc123" });
 * @see /lib/ai/tools/update-document.ts
 */
export const requestSuggestions = ({
  session,
  dataStream,
}: RequestSuggestionsProps) =>
  tool({
    description: 'Request suggestions for a document',
    parameters: z.object({
      documentId: z
        .string()
        .describe('The ID of the document to request edits'),
    }),
    /**
     * Executes the suggestion generation process.
     * @param params - Contains the documentId to analyze.
     * @returns An object with document info and a status message.
     * @throws When the document is not found or has empty content.
     */
    execute: async ({ documentId }) => {
      const document = await getDocumentById({ id: documentId });

      if (!document || !document.content) {
        return {
          error: 'Document not found',
        };
      }

      /**
       * Array to collect generated suggestions before saving.
       * @type {Array<Omit<Suggestion, 'userId' | 'createdAt' | 'documentCreatedAt'>}
       */
      const suggestions = [];

      /**
       * Stream of AI-generated suggestions.
       * @type {AsyncGenerator}
       */
      const { elementStream } = streamObject({
        model: myProvider.languageModel('artifact-model'),
        system:
          'You are a help writing assistant. Given a piece of writing, please offer suggestions to improve the piece of writing and describe the change. It is very important for the edits to contain full sentences instead of just words. Max 5 suggestions.',
        prompt: document.content,
        output: 'array',
        schema: z.object({
          originalSentence: z.string().describe('The original sentence'),
          suggestedSentence: z.string().describe('The suggested sentence'),
          description: z.string().describe('The description of the suggestion'),
        }),
      });

      // Process each suggestion from the stream.
      for await (const element of elementStream) {
        const suggestion = {
          originalText: element.originalSentence,
          suggestedText: element.suggestedSentence,
          description: element.description,
          id: generateUUID(),
          documentId: documentId,
          isResolved: false,
        };

        // Send real-time updates to the client.
        dataStream.writeData({
          type: 'suggestion',
          content: suggestion,
        });

        suggestions.push(suggestion);
      }

      // Save suggestions if user is authenticated.
      if (session.user?.id) {
        const userId = session.user.id;

        await saveSuggestions({
          suggestions: suggestions.map((suggestion) => ({
            ...suggestion,
            userId,
            createdAt: new Date(),
            documentCreatedAt: document.createdAt,
          })),
        });
      }

      return {
        id: documentId,
        title: document.title,
        kind: document.kind,
        message: 'Suggestions have been added to the document',
      };
    },
  });
