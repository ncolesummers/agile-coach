/**
 * Form component to sign out the user.
 * @module SignOutForm
 * @packageDocumentation
 */
import Form from 'next/form';

import { signOut } from '@/app/(auth)/auth';

/**
 * Initiates sign out process and redirects to home.
 * @returns JSX element for the sign-out form.
 * @see /src/app/(auth)/auth.ts
 */
export const SignOutForm = () => {
  return (
    <Form
      className="w-full"
      action={async () => {
        'use server';

        await signOut({
          redirectTo: '/',
        });
      }}
    >
      <button
        type="submit"
        className="w-full text-left px-1 py-0.5 text-red-500"
      >
        Sign out
      </button>
    </Form>
  );
};
