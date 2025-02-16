import type {
  CoreAssistantMessage,
  CoreToolMessage,
  Message,
  ToolInvocation,
} from 'ai';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { Message as DBMessage, Document } from '@/lib/db/schema';

/**
 * Merges class names by evaluating the provided class values.
 * @param inputs - List of class values that can be strings or objects
 * @returns A merged string of class names
 * @example
 * const classes = cn('btn', condition && 'btn-active');
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ApplicationError extends Error {
  info: string;
  status: number;
}

/**
 * Fetches data from a given URL and parses the JSON response.
 * @param url - The URL to fetch data from
 * @returns The parsed JSON response
 * @throws {ApplicationError} When the response status is not OK
 * @example
 * const data = await fetcher('https://api.example.com/data');
 */
export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error(
      'An error occurred while fetching the data.',
    ) as ApplicationError;

    error.info = await res.json();
    error.status = res.status;

    throw error;
  }

  return res.json();
};

/**
 * Retrieves a value from localStorage by key.
 * @param key - The storage key to retrieve data from
 * @returns The parsed JSON value stored or an empty array if unavailable
 * @example
 * const items = getLocalStorage('myKey');
 */
export function getLocalStorage(key: string) {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  return [];
}

/**
 * Generates a random UUID (version 4 format).
 * @returns A string representing a randomly generated UUID
 * @example
 * const id = generateUUID();
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function addToolMessageToChat({
  toolMessage,
  messages,
}: {
  toolMessage: CoreToolMessage;
  messages: Array<Message>;
}): Array<Message> {
  return messages.map((message) => {
    if (message.toolInvocations) {
      return {
        ...message,
        toolInvocations: message.toolInvocations.map((toolInvocation) => {
          const toolResult = toolMessage.content.find(
            (tool) => tool.toolCallId === toolInvocation.toolCallId,
          );

          if (toolResult) {
            return {
              ...toolInvocation,
              state: 'result',
              result: toolResult.result,
            };
          }

          return toolInvocation;
        }),
      };
    }

    return message;
  });
}

/**
 * Converts database messages into UI-friendly message objects.
 * Handles tool messages, text messages, and reasoning content.
 * @param messages - Array of messages from the database
 * @returns Array of UI message objects
 * @example
 * const uiMessages = convertToUIMessages(dbMessages);
 */
export function convertToUIMessages(
  messages: Array<DBMessage>,
): Array<Message> {
  return messages.reduce((chatMessages: Array<Message>, message) => {
    if (message.role === 'tool') {
      return addToolMessageToChat({
        toolMessage: message as CoreToolMessage,
        messages: chatMessages,
      });
    }

    let textContent = '';
    let reasoning: string | undefined = undefined;
    const toolInvocations: Array<ToolInvocation> = [];

    if (typeof message.content === 'string') {
      textContent = message.content;
    } else if (Array.isArray(message.content)) {
      for (const content of message.content) {
        if (content.type === 'text') {
          textContent += content.text;
        } else if (content.type === 'tool-call') {
          toolInvocations.push({
            state: 'call',
            toolCallId: content.toolCallId,
            toolName: content.toolName,
            args: content.args,
          });
        } else if (content.type === 'reasoning') {
          reasoning = content.reasoning;
        }
      }
    }

    chatMessages.push({
      id: message.id,
      role: message.role as Message['role'],
      content: textContent,
      reasoning,
      toolInvocations,
    });

    return chatMessages;
  }, []);
}

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

/**
 * Sanitizes response messages by preserving only the relevant parts.
 * Attaches reasoning to assistant messages if provided.
 * @param messages - Array of response messages to sanitize
 * @param reasoning - Optional reasoning to append to assistant messages
 * @returns Filtered array of sanitized response messages
 * @example
 * const sanitized = sanitizeResponseMessages({ messages, reasoning: 'Detailed analysis' });
 */
export function sanitizeResponseMessages({
  messages,
  reasoning,
}: {
  messages: Array<ResponseMessage>;
  reasoning: string | undefined;
}) {
  const toolResultIds: Array<string> = [];

  // Identify valid tool result ids from tool messages
  for (const message of messages) {
    if (message.role === 'tool') {
      for (const content of message.content) {
        if (content.type === 'tool-result') {
          toolResultIds.push(content.toolCallId);
        }
      }
    }
  }

  const messagesBySanitizedContent = messages.map((message) => {
    if (message.role !== 'assistant') return message;

    if (typeof message.content === 'string') return message;

    // Keep tool-call content only if its result exists and text content if not empty
    const sanitizedContent = message.content.filter((content) =>
      content.type === 'tool-call'
        ? toolResultIds.includes(content.toolCallId)
        : content.type === 'text'
          ? content.text.length > 0
          : true,
    );

    if (reasoning) {
      // @ts-expect-error: reasoning message parts in sdk is wip
      sanitizedContent.push({ type: 'reasoning', reasoning });
    }

    return {
      ...message,
      content: sanitizedContent,
    };
  });

  return messagesBySanitizedContent.filter(
    (message) => message.content.length > 0,
  );
}

/**
 * Sanitizes UI messages by cleansing tool invocations.
 * Filters out incomplete entries ensuring only relevant invocations remain.
 * @param messages - Array of UI messages to sanitize
 * @returns An array of sanitized UI messages
 * @example
 * const cleanMessages = sanitizeUIMessages(uiMessages);
 */
export function sanitizeUIMessages(messages: Array<Message>): Array<Message> {
  const messagesBySanitizedToolInvocations = messages.map((message) => {
    if (message.role !== 'assistant') return message;

    if (!message.toolInvocations) return message;

    const toolResultIds: Array<string> = [];

    // Collect tool call IDs that have results
    for (const toolInvocation of message.toolInvocations) {
      if (toolInvocation.state === 'result') {
        toolResultIds.push(toolInvocation.toolCallId);
      }
    }

    const sanitizedToolInvocations = message.toolInvocations.filter(
      (toolInvocation) =>
        toolInvocation.state === 'result' ||
        toolResultIds.includes(toolInvocation.toolCallId),
    );

    return {
      ...message,
      toolInvocations: sanitizedToolInvocations,
    };
  });

  return messagesBySanitizedToolInvocations.filter(
    (message) =>
      message.content.length > 0 ||
      (message.toolInvocations && message.toolInvocations.length > 0),
  );
}

/**
 * Retrieves the most recent message sent by the user.
 * @param messages - Array of UI messages
 * @returns The last message with a user role, or undefined if none exist
 * @example
 * const latestMessage = getMostRecentUserMessage(messages);
 */
export function getMostRecentUserMessage(messages: Array<Message>) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}

/**
 * Returns the created timestamp of a document at a provided index.
 * If no documents exist or index is out of bounds, returns the current date.
 * @param documents - Array of document objects with timestamps
 * @param index - Position of the document in the array
 * @returns The creation timestamp of the document or current date if out of bounds
 * @example
 * const timestamp = getDocumentTimestampByIndex(docs, 2);
 */
export function getDocumentTimestampByIndex(
  documents: Array<Document>,
  index: number,
) {
  if (!documents) return new Date();
  if (index > documents.length) return new Date();

  return documents[index].createdAt;
}
