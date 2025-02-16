/**
 * ArtifactCloseButton component closes the artifact modal.
 * @module components/artifact-close-button
 * @packageDocumentation
 */

import { initialArtifactData, useArtifact } from '@/hooks/use-artifact';
import { memo } from 'react';
import { CrossIcon } from './icons';
import { Button } from './ui/button';

/**
 * Renders a button to close the artifact modal.
 * @returns JSX element representing the close button.
 * @see /hooks/use-artifact.ts
 */
function PureArtifactCloseButton() {
  const { setArtifact } = useArtifact();

  return (
    <Button
      variant="outline"
      className="h-fit p-2 dark:hover:bg-zinc-700"
      onClick={() => {
        setArtifact((currentArtifact) =>
          currentArtifact.status === 'streaming'
            ? {
                ...currentArtifact,
                isVisible: false,
              }
            : { ...initialArtifactData, status: 'idle' },
        );
      }}
    >
      <CrossIcon size={18} />
    </Button>
  );
}

export const ArtifactCloseButton = memo(PureArtifactCloseButton, () => true);
