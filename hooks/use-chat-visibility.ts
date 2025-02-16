/**
 * Hook for managing chat visibility state and synchronizing with remote updates.
 * @module hooks/use-chat-visibility
 * @packageDocumentation
 */

'use client';

import { updateChatVisibility } from '@/app/(chat)/actions';
import type { VisibilityType } from '@/components/visibility-selector';
import type { Chat } from '@/lib/db/schema';
import { useMemo } from 'react';
import useSWR, { useSWRConfig } from 'swr';

/**
 * Manages and updates the visibility for a given chat.
 * @param params - An object containing chatId and the initial visibility.
 *   - chatId: Unique identifier for the chat.
 *   - initialVisibility: The default visibility when not set in the history.
 * @returns An object with the current visibility type and a function to update it.
 * @see /src/components/visibility-selector
 * @see /src/lib/db/schema
 * @example
 * const { visibilityType, setVisibilityType } = useChatVisibility({ chatId: '123', initialVisibility: 'public' });
 */
export function useChatVisibility({
  chatId,
  initialVisibility,
}: {
  chatId: string;
  initialVisibility: VisibilityType;
}) {
  const { mutate, cache } = useSWRConfig();
  const history: Array<Chat> = cache.get('/api/history')?.data;

  const { data: localVisibility, mutate: setLocalVisibility } = useSWR(
    `${chatId}-visibility`,
    null,
    {
      fallbackData: initialVisibility,
    },
  );

  const visibilityType = useMemo(() => {
    if (!history) return localVisibility;
    const chat = history.find((chat) => chat.id === chatId);
    if (!chat) return 'private';
    return chat.visibility;
  }, [history, chatId, localVisibility]);

  const setVisibilityType = (updatedVisibilityType: VisibilityType) => {
    setLocalVisibility(updatedVisibilityType);

    mutate<Array<Chat>>(
      '/api/history',
      (history) => {
        return history
          ? history.map((chat) => {
              if (chat.id === chatId) {
                return {
                  ...chat,
                  visibility: updatedVisibilityType,
                };
              }
              return chat;
            })
          : [];
      },
      { revalidate: false },
    );

    updateChatVisibility({
      chatId: chatId,
      visibility: updatedVisibilityType,
    });
  };

  return { visibilityType, setVisibilityType };
}
