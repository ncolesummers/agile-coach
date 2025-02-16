/**
 * Provides a theme wrapper using next-themes for managing UI themes.
 * @module ThemeProvider
 * @packageDocumentation
 */

'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes/dist/types';

/**
 * Wraps child components with a theme context Provider.
 * @param children - Child nodes to be rendered.
 * @param props - Additional properties for the NextThemesProvider.
 * @returns A JSX element encompassing the theme context.
 * @see /node_modules/next-themes
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
