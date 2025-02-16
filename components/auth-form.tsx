/**
 * AuthForm component renders an authentication form for user login.
 * @module components/auth-form
 * @packageDocumentation
 */

import Form from 'next/form';

import { Input } from './ui/input';
import { Label } from './ui/label';

/**
 * Renders form elements for authentication.
 * @param action - The form action handler.
 * @param children - The child elements to be rendered inside the form.
 * @param defaultEmail - Default email to pre-populate the email field.
 * @returns JSX element representing the auth form.
 * @see /components/ui/input.tsx
 * @see /components/ui/label.tsx
 */
export function AuthForm({
  action,
  children,
  defaultEmail = '',
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultEmail?: string;
}) {
  return (
    <Form action={action} className="flex flex-col gap-4 px-4 sm:px-16">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="email"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Email Address
        </Label>

        <Input
          id="email"
          name="email"
          className="bg-muted text-md md:text-sm"
          type="email"
          placeholder="user@acme.com"
          autoComplete="email"
          required
          autoFocus
          defaultValue={defaultEmail}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="password"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Password
        </Label>

        <Input
          id="password"
          name="password"
          className="bg-muted text-md md:text-sm"
          type="password"
          required
        />
      </div>

      {children}
    </Form>
  );
}
