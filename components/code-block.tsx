/**
 * Renders code blocks with distinct styles for inline and block code.
 * @module components/code-block
 * @packageDocumentation
 */

'use client';

interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

/**
 * CodeBlock component that formats code snippets with appropriate styling.
 * @param node - The code node data.
 * @param inline - Boolean indicating if code is inline.
 * @param className - CSS class names for the code.
 * @param children - Code content.
 * @returns A styled code element.
 * @see /src/shared/types.ts
 */
export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  if (!inline) {
    return (
      <div className="not-prose flex flex-col">
        <pre
          {...props}
          className={`text-sm w-full overflow-x-auto dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl dark:text-zinc-50 text-zinc-900`}
        >
          <code className="whitespace-pre-wrap break-words">{children}</code>
        </pre>
      </div>
    );
  } else {
    return (
      <code
        className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    );
  }
}
