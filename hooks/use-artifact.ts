/**
 * Provides hooks for accessing and updating UI artifact data.
 * @module hooks/use-artifact
 * @packageDocumentation
 */

'use client';

import useSWR from 'swr';
import type { UIArtifact } from '@/components/artifact';
import { useCallback, useMemo } from 'react';

export const initialArtifactData: UIArtifact = {
  documentId: 'init',
  content: '',
  kind: 'text',
  title: '',
  status: 'idle',
  isVisible: false,
  boundingBox: {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  },
};

type Selector<T> = (state: UIArtifact) => T;

/**
 * Selects a specific portion of the UI artifact state.
 * @param selector - Function to select a part of the artifact state.
 * @returns The selected value from the artifact state.
 * @see /src/components/artifact
 * @example
 * const title = useArtifactSelector(artifact => artifact.title);
 */
export function useArtifactSelector<Selected>(selector: Selector<Selected>) {
  const { data: localArtifact } = useSWR<UIArtifact>('artifact', null, {
    fallbackData: initialArtifactData,
  });

  const selectedValue = useMemo(() => {
    if (!localArtifact) return selector(initialArtifactData);
    return selector(localArtifact);
  }, [localArtifact, selector]);

  return selectedValue;
}

/**
 * Provides hook access to the complete UI artifact along with its metadata.
 * @returns An object containing the artifact, a setter function for the artifact, metadata, and a setter function for metadata.
 * @see /src/components/artifact
 * @example
 * const { artifact, setArtifact } = useArtifact();
 */
export function useArtifact() {
  const { data: localArtifact, mutate: setLocalArtifact } = useSWR<UIArtifact>(
    'artifact',
    null,
    {
      fallbackData: initialArtifactData,
    },
  );

  const artifact = useMemo(() => {
    if (!localArtifact) return initialArtifactData;
    return localArtifact;
  }, [localArtifact]);

  const setArtifact = useCallback(
    (updaterFn: UIArtifact | ((currentArtifact: UIArtifact) => UIArtifact)) => {
      setLocalArtifact((currentArtifact) => {
        const artifactToUpdate = currentArtifact || initialArtifactData;

        if (typeof updaterFn === 'function') {
          return updaterFn(artifactToUpdate);
        }

        return updaterFn;
      });
    },
    [setLocalArtifact],
  );

  const { data: localArtifactMetadata, mutate: setLocalArtifactMetadata } =
    useSWR<any>(
      () =>
        artifact.documentId ? `artifact-metadata-${artifact.documentId}` : null,
      null,
      {
        fallbackData: null,
      },
    );

  return useMemo(
    () => ({
      artifact,
      setArtifact,
      metadata: localArtifactMetadata,
      setMetadata: setLocalArtifactMetadata,
    }),
    [artifact, setArtifact, localArtifactMetadata, setLocalArtifactMetadata],
  );
}
