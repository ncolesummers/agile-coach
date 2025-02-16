/**
 * Provides document handlers for various artifact types.
 * @module artifacts/server
 * @packageDocumentation
 */

import { codeDocumentHandler } from '@/artifacts/code/server';
import { imageDocumentHandler } from '@/artifacts/image/server';
import { sheetDocumentHandler } from '@/artifacts/sheet/server';
import { textDocumentHandler } from '@/artifacts/text/server';
import type { ArtifactKind } from '@/components/artifact';
import type { DataStreamWriter } from 'ai';
import type { Session } from 'next-auth';
import { saveDocument } from '../db/queries';
import type { Document } from '../db/schema';

/**
 * Interface representing the properties required to save a document.
 * @property id - Unique document identifier.
 * @property title - Document title.
 * @property kind - The artifact type.
 * @property content - Content of the document.
 * @property userId - Identifier of the user.
 * @see /lib/artifacts/code/server.ts
 */
export interface SaveDocumentProps {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}

/**
 * Interface representing properties for creating a document.
 * @property id - Document identifier.
 * @property title - Title of the document.
 * @property dataStream - Data stream writer for document content.
 * @property session - User session information.
 * @see /lib/artifacts/code/server.ts
 */
export interface CreateDocumentCallbackProps {
  id: string;
  title: string;
  dataStream: DataStreamWriter;
  session: Session;
}

/**
 * Interface representing properties for updating a document.
 * @property document - The document information.
 * @property description - Description of the update.
 * @property dataStream - Data stream writer for document updates.
 * @property session - User session information.
 * @see /lib/artifacts/code/server.ts
 */
export interface UpdateDocumentCallbackProps {
  document: Document;
  description: string;
  dataStream: DataStreamWriter;
  session: Session;
}

/**
 * Interface for handling document operations.
 * @template T - Artifact kind.
 * @property kind - Specific artifact type.
 * @property onCreateDocument - Handler function for document creation.
 * @property onUpdateDocument - Handler function for updating documents.
 * @see /lib/artifacts/code/server.ts
 */
export interface DocumentHandler<T = ArtifactKind> {
  kind: T;
  onCreateDocument: (args: CreateDocumentCallbackProps) => Promise<void>;
  onUpdateDocument: (args: UpdateDocumentCallbackProps) => Promise<void>;
}

/**
 * Creates a document handler for a specific artifact type.
 * @param config - Configuration object containing:
 *   - kind: The artifact kind.
 *   - onCreateDocument: Callback to create a document.
 *   - onUpdateDocument: Callback to update a document.
 * @returns The document handler with create/update methods.
 * @throws If saving the document fails.
 * @example
 * const handler = createDocumentHandler({
 *   kind: 'text',
 *   onCreateDocument: async (params) => { ... },
 *   onUpdateDocument: async (params) => { ... }
 * });
 * @see /lib/artifacts/code/server.ts
 */
export function createDocumentHandler<T extends ArtifactKind>(config: {
  kind: T;
  onCreateDocument: (params: CreateDocumentCallbackProps) => Promise<string>;
  onUpdateDocument: (params: UpdateDocumentCallbackProps) => Promise<string>;
}): DocumentHandler<T> {
  return {
    kind: config.kind,
    onCreateDocument: async (args: CreateDocumentCallbackProps) => {
      // Call the provided create callback and save the document if session exists.
      const draftContent = await config.onCreateDocument({
        id: args.id,
        title: args.title,
        dataStream: args.dataStream,
        session: args.session,
      });

      if (args.session?.user?.id) {
        await saveDocument({
          id: args.id,
          title: args.title,
          content: draftContent,
          kind: config.kind,
          userId: args.session.user.id,
        });
      }

      return;
    },
    onUpdateDocument: async (args: UpdateDocumentCallbackProps) => {
      // Call the provided update callback and save the document if session exists.
      const draftContent = await config.onUpdateDocument({
        document: args.document,
        description: args.description,
        dataStream: args.dataStream,
        session: args.session,
      });

      if (args.session?.user?.id) {
        await saveDocument({
          id: args.document.id,
          title: args.document.title,
          content: draftContent,
          kind: config.kind,
          userId: args.session.user.id,
        });
      }

      return;
    },
  };
}

/**
 * Array of document handlers for each artifact kind.
 * @see /lib/artifacts/code/server.ts
 */
export const documentHandlersByArtifactKind: Array<DocumentHandler> = [
  textDocumentHandler,
  codeDocumentHandler,
  imageDocumentHandler,
  sheetDocumentHandler,
];

/**
 * Supported artifact kinds.
 * @see /lib/artifacts/code/server.ts
 */
export const artifactKinds = ['text', 'code', 'image', 'sheet'] as const;
