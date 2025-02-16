/**
 * A Skeleton component used as a loading placeholder.
 * @module ui/skeleton
 * @packageDocumentation
 */

import { cn } from '@/lib/utils';

/**
 * Renders a pulsing skeleton placeholder.
 * @param props - Standard HTML div element properties.
 * @returns Skeleton placeholder element.
 * @see /components/ui/skeleton.tsx
 * @example
 * <Skeleton className="w-full h-10" />
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export { Skeleton };

