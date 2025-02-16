/**
 * Custom hook to automatically scroll to the bottom of a container.
 * @module useScrollToBottom
 * @packageDocumentation
 */

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Returns refs for the container and end elements so that mutations trigger scrolling.
 * @returns An array containing the container ref and the end ref.
 * @see /lib/utils
 */
export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T>,
  RefObject<T>,
] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      const observer = new MutationObserver(() => {
        end.scrollIntoView({ behavior: 'instant', block: 'end' });
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });

      return () => observer.disconnect();
    }
  }, []);

  return [containerRef, endRef];
}
