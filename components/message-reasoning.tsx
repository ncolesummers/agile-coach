/**
 * Provides an expandable view for detailed reasoning of a message.
 * @module message-reasoning
 * @packageDocumentation
 */

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDownIcon, LoaderIcon } from './icons';
import { Markdown } from './markdown';

interface MessageReasoningProps {
  isLoading: boolean;
  reasoning: string;
}

/**
 * Renders detailed reasoning with optional loading state and expand/collapse behavior.
 * @param isLoading - Indicates if reasoning data is loading.
 * @param reasoning - The reasoning text to display.
 * @returns Rendered message reasoning component.
 * @see /src/components/icons.ts
 * @see /src/components/markdown.tsx
 */
export function MessageReasoning({
  isLoading,
  reasoning,
}: MessageReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: 'auto',
      opacity: 1,
      marginTop: '1rem',
      marginBottom: '0.5rem',
    },
  };

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium">Reasoning</div>
          <div className="animate-spin">
            <LoaderIcon />
          </div>
        </div>
      ) : (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium">Reasoned for a few seconds</div>
          <div
            className="cursor-pointer"
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
          >
            <ChevronDownIcon />
          </div>
        </div>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
            className="pl-4 text-zinc-600 dark:text-zinc-400 border-l flex flex-col gap-4"
          >
            <Markdown>{reasoning}</Markdown>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
