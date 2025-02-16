/**
 * Contains database query functions and mutations for User, Chat, Message, Vote, Document, and Suggestion.
 * @module db/queries
 * @packageDocumentation
 */

import 'server-only';

import { genSaltSync, hashSync } from 'bcrypt-ts';
import { and, asc, desc, eq, gt, gte, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import type { ArtifactKind } from '@/components/artifact';
import {
  chat,
  document,
  type Message,
  message,
  type Suggestion,
  suggestion,
  user,
  type User,
  vote,
} from './schema';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

/**
 * Retrieves a user by email.
 * @param email - The user's email address.
 * @returns An array of User rows.
 * @throws When user retrieval fails.
 * @see /lib/db/schema.ts
 */
export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error('Failed to get user from database');
    throw error;
  }
}

/**
 * Creates a new user with the provided email and password.
 * @param email - The user's email.
 * @param password - The user's password.
 * @returns The result of the insertion.
 * @throws When user creation fails.
 * @see /lib/db/schema.ts
 */
export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({ email, password: hash });
  } catch (error) {
    console.error('Failed to create user in database');
    throw error;
  }
}

/**
 * Saves a new chat entry.
 * @param param0 - Object with chat id, user id, and title.
 * @returns The result of the insertion.
 * @throws When chat saving fails.
 * @see /lib/db/schema.ts
 */
export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
    });
  } catch (error) {
    console.error('Failed to save chat in database');
    throw error;
  }
}

/**
 * Deletes a chat and its associated votes and messages by chat id.
 * @param param0 - Object with the chat id.
 * @returns The result of the deletion.
 * @throws When deletion fails.
 * @see /lib/db/schema.ts
 */
export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));

    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error('Failed to delete chat by id from database');
    throw error;
  }
}

/**
 * Retrieves chats by user id.
 * @param param0 - Object with the user id.
 * @returns An array of Chat rows.
 * @throws When retrieval fails.
 * @see /lib/db/schema.ts
 */
export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error('Failed to get chats by user from database');
    throw error;
  }
}

/**
 * Retrieves a single chat by its id.
 * @param param0 - Object with the chat id.
 * @returns A Chat object.
 * @throws When retrieval fails.
 * @see /lib/db/schema.ts
 */
export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error('Failed to get chat by id from database');
    throw error;
  }
}

/**
 * Saves an array of messages.
 * @param param0 - Object containing an array of Message objects.
 * @returns The result of the insertion.
 * @throws When message saving fails.
 * @see /lib/db/schema.ts
 */
export async function saveMessages({ messages }: { messages: Array<Message> }) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

/**
 * Retrieves messages by chat id.
 * @param param0 - Object with the chat id.
 * @returns An ordered array of Message objects.
 * @throws When retrieval fails.
 * @see /lib/db/schema.ts
 */
export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
    throw error;
  }
}

/**
 * Votes a message.
 * @param param0 - Object with chatId, messageId, and vote type ('up' or 'down').
 * @returns The result of the vote update or insertion.
 * @throws When vote operation fails.
 * @see /lib/db/schema.ts
 */
export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    console.error('Failed to upvote message in database', error);
    throw error;
  }
}

/**
 * Retrieves votes by chat id.
 * @param param0 - Object with the chat id.
 * @returns An array of Vote rows.
 * @throws When vote retrieval fails.
 * @see /lib/db/schema.ts
 */
export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    console.error('Failed to get votes by chat id from database');
    throw error;
  }
}

/**
 * Saves a document.
 * @param param0 - Object with document details.
 * @returns The result of the insertion.
 * @throws When document saving fails.
 * @see /lib/db/schema.ts
 */
export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db.insert(document).values({
      id,
      title,
      kind,
      content,
      userId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to save document in database');
    throw error;
  }
}

/**
 * Retrieves documents by id.
 * @param param0 - Object with the document id.
 * @returns An array of Document rows.
 * @throws When document retrieval fails.
 * @see /lib/db/schema.ts
 */
export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

/**
 * Retrieves the latest document by id.
 * @param param0 - Object with the document id.
 * @returns A Document object.
 * @throws When document retrieval fails.
 * @see /lib/db/schema.ts
 */
export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

/**
 * Deletes documents and related suggestions after a specified timestamp.
 * @param param0 - Object with the document id and timestamp.
 * @returns The result of the deletion.
 * @throws When deletion fails.
 * @see /lib/db/schema.ts
 */
export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)));
  } catch (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database',
    );
    throw error;
  }
}

/**
 * Saves an array of suggestions.
 * @param param0 - Object containing an array of Suggestion objects.
 * @returns The result of the insertion.
 * @throws When suggestion saving fails.
 * @see /lib/db/schema.ts
 */
export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    console.error('Failed to save suggestions in database');
    throw error;
  }
}

/**
 * Retrieves suggestions by document id.
 * @param param0 - Object with the document id.
 * @returns An array of Suggestion rows.
 * @throws When suggestion retrieval fails.
 * @see /lib/db/schema.ts
 */
export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    console.error(
      'Failed to get suggestions by document version from database',
    );
    throw error;
  }
}

/**
 * Retrieves a message by its id.
 * @param param0 - Object with the message id.
 * @returns A Message object.
 * @throws When message retrieval fails.
 * @see /lib/db/schema.ts
 */
export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    console.error('Failed to get message by id from database');
    throw error;
  }
}

/**
 * Deletes messages and associated votes after a specified timestamp.
 * @param param0 - Object with the chat id and timestamp.
 * @returns The result of the deletion.
 * @throws When deletion fails.
 * @see /lib/db/schema.ts
 */
export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
        );
    }
  } catch (error) {
    console.error(
      'Failed to delete messages by id after timestamp from database',
    );
    throw error;
  }
}

/**
 * Updates the visibility of a chat.
 * @param param0 - Object with chat id and the new visibility ('private' or 'public').
 * @returns The result of the update.
 * @throws When updating chat visibility fails.
 * @see /lib/db/schema.ts
 */
export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    console.error('Failed to update chat visibility in database');
    throw error;
  }
}
