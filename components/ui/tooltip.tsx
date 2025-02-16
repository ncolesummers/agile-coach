/**
 * Tooltip components for enhanced UI interactions.
 * @module ui/tooltip
 * @packageDocumentation
 */

'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Provides the context for tooltip elements.
 * @returns TooltipProvider element.
 * @see /components/ui/tooltip.tsx
 */
const TooltipProvider = TooltipPrimitive.Provider;

/**
 * Root tooltip component.
 * @returns Tooltip element.
 * @see /components/ui/tooltip.tsx
 */
const Tooltip = TooltipPrimitive.Root;

/**
 * Component that triggers the tooltip display.
 * @returns TooltipTrigger element.
 * @see /components/ui/tooltip.tsx
 */
const TooltipTrigger = TooltipPrimitive.Trigger;

/**
 * Content container for the tooltip.
 * @param props - Props to customize tooltip content.
 * @returns TooltipContent element.
 * @see /components/ui/tooltip.tsx
 */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className,
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

/**
 * Exports the tooltip components.
 * @example
 * import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '/components/ui/tooltip'
 */
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };

