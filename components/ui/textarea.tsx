/**
 * A styled textarea component for user input.
 * @module ui/textarea
 * @packageDocumentation
 */

import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * A responsive and accessible textarea component.
 * @param props - Props forwarded to the textarea element.
 * @returns Rendered textarea element.
 * @see /components/ui/textarea.tsx
 * @example
 * <Textarea placeholder="Enter text..." />
 */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };

