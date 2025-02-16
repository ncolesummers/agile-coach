/**
 * Renders preview messages within an artifact with auto-scroll functionality.
 * @module components/artifact-messages
 * @packageDocumentation
 */

import type { Vote } from '@/lib/db/schema';
import type { ChatRequestOptions, Message } from 'ai';
import equal from 'fast-deep-equal';
import { memo } from 'react';
import type { UIArtifact } from './artifact';
import { PreviewMessage } from './message';
import { useScrollToBottom } from './use-scroll-to-bottom';

interface ArtifactMessagesProps {
  chatId: string;
  isLoading: boolean;
  votes: Array<Vote> | undefined;
  messages: Array<Message>;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
  artifactStatus: UIArtifact['status'];
}

/**
 * Implements rendering logic for preview messages with auto-scroll behavior.
 * @param chatId - Unique identifier of the chat session.
 * @param isLoading - Indicates if messages are being loaded.
 * @param votes - Array of votes associated with the messages.
 * @param messages - List of chat messages.
 * @param setMessages - Function to update the messages.
 * @param reload - Function to refresh messages.
 * @param isReadonly - Boolean flag for read-only mode.
 * @example
 * <PureArtifactMessages chatId="123" isLoading={false} ... />
 */
function PureArtifactMessages({
  chatId,
  isLoading,
  votes,
  messages,
  setMessages,
  reload,
  isReadonly,
}: ArtifactMessagesProps) {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col gap-4 h-full items-center overflow-y-scroll px-4 pt-20"
    >
      {messages.map((message, index) => (
        <PreviewMessage
          chatId={chatId}
          key={message.id}
          message={message}
          isLoading={isLoading && index === messages.length - 1}
          vote={
            votes
              ? votes.find((vote) => vote.messageId === message.id)
              : undefined
          }
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
        />
      ))}

      <div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
      />
    </div>
  );
}

/**
 * Checks equality for memoization of ArtifactMessages to avoid unnecessary renders.
 * @param prevProps - Previous properties.
 * @param nextProps - Next properties.
 * @returns True if the messages should remain equal; otherwise, false.
 */
function areEqual(
  prevProps: ArtifactMessagesProps,
  nextProps: ArtifactMessagesProps,
) {
  if (
    prevProps.artifactStatus === 'streaming' &&
    nextProps.artifactStatus === 'streaming'
  )
    return true;

  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.isLoading && nextProps.isLoading) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;

  return true;
}

/**
 * Renders a scrollable list of preview messages for the artifact.
 * @param chatId - Unique identifier of the chat session.
 * @param isLoading - Indicates if the messages are being loaded.
 * @param votes - Array of votes associated with messages.
 * @param messages - List of message objects.
 * @param setMessages - Callback to update the messages.
 * @param reload - Function to reload messages.
 * @param isReadonly - Flag to indicate if the messages are read-only.
 * @returns JSX element containing the preview messages.
 * @example
 * <ArtifactMessages chatId="123" isLoading={false} ... />
 */
export const ArtifactMessages = memo(PureArtifactMessages, areEqual);
