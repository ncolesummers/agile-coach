/**
 * Provides a hook for detecting if the viewport is in mobile mode.
 * @module hooks/use-mobile
 * @packageDocumentation
 */

import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Determines whether the device is mobile based on the viewport width.
 * @returns true if the viewport width is less than 768px, false otherwise.
 * @example
 * const isMobile = useIsMobile();
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}
