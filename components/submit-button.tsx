/**
 * Component for a form submit button with loading state.
 * @module SubmitButton
 * @packageDocumentation
 */

'use client';

import { useFormStatus } from 'react-dom';

import { LoaderIcon } from '@/components/icons';

import { Button } from './ui/button';

/**
 * Renders a submit button which shows a loading icon when pending or successful.
 * @param children - Content of the button.
 * @param isSuccessful - Flag indicating if the action was successful.
 * @returns JSX element of the button.
 * @see /src/shared/types.ts
 */
export function SubmitButton({
  children,
  isSuccessful,
}: {
  children: React.ReactNode;
  isSuccessful: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type={pending ? 'button' : 'submit'}
      aria-disabled={pending || isSuccessful}
      disabled={pending || isSuccessful}
      className="relative"
    >
      {children}

      {(pending || isSuccessful) && (
        <span className="animate-spin absolute right-4">
          <LoaderIcon />
        </span>
      )}

      <output aria-live="polite" className="sr-only">
        {pending || isSuccessful ? 'Loading' : 'Submit form'}
      </output>
    </Button>
  );
}
